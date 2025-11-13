import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CheckIn } from '../types';
import { db } from '../services/database';
import { isSameDay } from 'date-fns';

interface CheckInsState {
  checkIns: CheckIn[];
  loading: boolean;
  error: string | null;
}

type CheckInsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CHECKINS'; payload: CheckIn[] }
  | { type: 'ADD_CHECKIN'; payload: CheckIn }
  | { type: 'UPDATE_CHECKIN'; payload: CheckIn }
  | { type: 'DELETE_CHECKIN'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: CheckInsState = {
  checkIns: [],
  loading: false,
  error: null,
};

function checkInsReducer(state: CheckInsState, action: CheckInsAction): CheckInsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CHECKINS':
      return { ...state, checkIns: action.payload, loading: false };
    case 'ADD_CHECKIN':
      return { ...state, checkIns: [...state.checkIns, action.payload] };
    case 'UPDATE_CHECKIN':
      return {
        ...state,
        checkIns: state.checkIns.map(ci => ci.id === action.payload.id ? action.payload : ci),
      };
    case 'DELETE_CHECKIN':
      return {
        ...state,
        checkIns: state.checkIns.filter(ci => ci.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface CheckInsContextType {
  state: CheckInsState;
  getCheckInsByHabit: (habitId: string) => CheckIn[];
  getCheckInByDate: (habitId: string, date: Date) => CheckIn | undefined;
  createCheckIn: (checkIn: Omit<CheckIn, 'id' | 'createdAt'>) => Promise<void>;
  updateCheckIn: (id: string, updates: Partial<CheckIn>) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;
  refreshCheckIns: () => Promise<void>;
}

const CheckInsContext = createContext<CheckInsContextType | undefined>(undefined);

export function CheckInsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checkInsReducer, initialState);

  const refreshCheckIns = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const checkIns = await db.checkIns.toArray();
      dispatch({ type: 'SET_CHECKINS', payload: checkIns });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load check-ins' });
    }
  };

  const getCheckInsByHabit = (habitId: string): CheckIn[] => {
    return state.checkIns.filter(ci => ci.habitId === habitId);
  };

  const getCheckInByDate = (habitId: string, date: Date): CheckIn | undefined => {
    return state.checkIns.find(
      ci => ci.habitId === habitId && isSameDay(new Date(ci.date), date)
    );
  };

  const createCheckIn = async (checkIn: Omit<CheckIn, 'id' | 'createdAt'>) => {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newCheckIn: CheckIn = {
        ...checkIn,
        id,
        createdAt: now,
      };
      await db.checkIns.add(newCheckIn);
      dispatch({ type: 'ADD_CHECKIN', payload: newCheckIn });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create check-in' });
      throw error;
    }
  };

  const updateCheckIn = async (id: string, updates: Partial<CheckIn>) => {
    try {
      const checkIn = await db.checkIns.get(id);
      if (!checkIn) throw new Error('Check-in not found');
      
      const updatedCheckIn: CheckIn = {
        ...checkIn,
        ...updates,
      };
      await db.checkIns.update(id, updatedCheckIn);
      dispatch({ type: 'UPDATE_CHECKIN', payload: updatedCheckIn });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update check-in' });
      throw error;
    }
  };

  const deleteCheckIn = async (id: string) => {
    try {
      await db.checkIns.delete(id);
      dispatch({ type: 'DELETE_CHECKIN', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete check-in' });
      throw error;
    }
  };

  useEffect(() => {
    refreshCheckIns();
  }, []);

  return (
    <CheckInsContext.Provider
      value={{
        state,
        getCheckInsByHabit,
        getCheckInByDate,
        createCheckIn,
        updateCheckIn,
        deleteCheckIn,
        refreshCheckIns,
      }}
    >
      {children}
    </CheckInsContext.Provider>
  );
}

export function useCheckIns() {
  const context = useContext(CheckInsContext);
  if (context === undefined) {
    throw new Error('useCheckIns must be used within a CheckInsProvider');
  }
  return context;
}

