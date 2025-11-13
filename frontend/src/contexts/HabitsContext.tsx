import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Habit } from '../types';
import { db, dbHelpers } from '../services/database';

interface HabitsState {
  habits: Habit[];
  categories: string[];
  loading: boolean;
  error: string | null;
}

type HabitsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: HabitsState = {
  habits: [],
  categories: [],
  loading: false,
  error: null,
};

function habitsReducer(state: HabitsState, action: HabitsAction): HabitsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_HABITS':
      const categories = Array.from(
        new Set(action.payload.map(h => h.category).filter(Boolean) as string[])
      );
      return { ...state, habits: action.payload, categories, loading: false };
    case 'ADD_HABIT':
      const newCategories = action.payload.category && !state.categories.includes(action.payload.category)
        ? [...state.categories, action.payload.category]
        : state.categories;
      return {
        ...state,
        habits: [...state.habits, action.payload],
        categories: newCategories,
      };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h),
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface HabitsContextType {
  state: HabitsState;
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  refreshHabits: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(habitsReducer, initialState);

  const refreshHabits = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const habits = await dbHelpers.getAllHabits();
      dispatch({ type: 'SET_HABITS', payload: habits });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load habits' });
    }
  };

  const createHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await dbHelpers.createHabit(habit);
      const newHabit = await dbHelpers.getHabitById(id);
      if (newHabit) {
        dispatch({ type: 'ADD_HABIT', payload: newHabit });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create habit' });
      throw error;
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      await dbHelpers.updateHabit(id, updates);
      const updatedHabit = await dbHelpers.getHabitById(id);
      if (updatedHabit) {
        dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update habit' });
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await dbHelpers.deleteHabit(id);
      dispatch({ type: 'DELETE_HABIT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete habit' });
      throw error;
    }
  };

  useEffect(() => {
    refreshHabits();
  }, []);

  return (
    <HabitsContext.Provider
      value={{
        state,
        createHabit,
        updateHabit,
        deleteHabit,
        refreshHabits,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}

