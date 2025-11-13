import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Reminder, Habit } from '../types';
import { db } from '../services/database';
import { calculateNextReminderDate } from '../services/notifications';
import { format, isBefore, isAfter } from 'date-fns';

interface RemindersState {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
}

type RemindersAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REMINDERS'; payload: Reminder[] }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: RemindersState = {
  reminders: [],
  loading: false,
  error: null,
};

function remindersReducer(state: RemindersState, action: RemindersAction): RemindersState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_REMINDERS':
      return { ...state, reminders: action.payload, loading: false };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r => r.id === action.payload.id ? action.payload : r),
      };
    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter(r => r.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface RemindersContextType {
  state: RemindersState;
  getReminderByHabit: (habitId: string) => Reminder | undefined;
  createReminder: (reminder: Omit<Reminder, 'id'>) => Promise<string>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes: number) => Promise<void>;
  markReminderAsDone: (id: string) => Promise<void>;
  getDueReminders: () => Reminder[];
  refreshReminders: () => Promise<void>;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(remindersReducer, initialState);

  const refreshReminders = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const reminders = await db.reminders.toArray();
      dispatch({ type: 'SET_REMINDERS', payload: reminders });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load reminders' });
    }
  };

  const getReminderByHabit = (habitId: string): Reminder | undefined => {
    return state.reminders.find(r => r.habitId === habitId);
  };

  const getDueReminders = (): Reminder[] => {
    const now = new Date();
    return state.reminders.filter(r => {
      if (!r.enabled || !r.nextReminderDate) return false;
      const reminderDate = new Date(r.nextReminderDate);
      return isBefore(reminderDate, now) || isAfter(reminderDate, now);
    });
  };

  const createReminder = async (reminder: Omit<Reminder, 'id'>): Promise<string> => {
    try {
      const id = crypto.randomUUID();
      const newReminder: Reminder = {
        ...reminder,
        id,
      };
      await db.reminders.add(newReminder);
      dispatch({ type: 'ADD_REMINDER', payload: newReminder });
      return id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create reminder' });
      throw error;
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      const reminder = await db.reminders.get(id);
      if (!reminder) throw new Error('Reminder not found');
      
      const updatedReminder: Reminder = {
        ...reminder,
        ...updates,
      };
      await db.reminders.update(id, updatedReminder);
      dispatch({ type: 'UPDATE_REMINDER', payload: updatedReminder });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update reminder' });
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await db.reminders.delete(id);
      dispatch({ type: 'DELETE_REMINDER', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete reminder' });
      throw error;
    }
  };

  const snoozeReminder = async (id: string, minutes: number) => {
    try {
      const reminder = await db.reminders.get(id);
      if (!reminder) throw new Error('Reminder not found');
      
      const snoozeDate = new Date();
      snoozeDate.setMinutes(snoozeDate.getMinutes() + minutes);
      
      const updatedReminder: Reminder = {
        ...reminder,
        nextReminderDate: snoozeDate.toISOString(),
      };
      await db.reminders.update(id, updatedReminder);
      dispatch({ type: 'UPDATE_REMINDER', payload: updatedReminder });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to snooze reminder' });
      throw error;
    }
  };

  const markReminderAsDone = async (id: string) => {
    try {
      const reminder = await db.reminders.get(id);
      if (!reminder) throw new Error('Reminder not found');
      
      // Calculate next reminder date based on habit frequency
      // We'll need to get the habit to know its frequency
      const habit = await db.habits.get(reminder.habitId);
      if (habit) {
        const nextDate = calculateNextReminderDate(habit.frequency);
        const updatedReminder: Reminder = {
          ...reminder,
          nextReminderDate: nextDate.toISOString(),
        };
        await db.reminders.update(id, updatedReminder);
        dispatch({ type: 'UPDATE_REMINDER', payload: updatedReminder });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to mark reminder as done' });
      throw error;
    }
  };

  useEffect(() => {
    refreshReminders();
    
    // Check for due reminders every minute
    const interval = setInterval(() => {
      const dueReminders = getDueReminders();
      if (dueReminders.length > 0) {
        // Trigger notifications (will be handled by notification service)
        dueReminders.forEach(reminder => {
          // This will be handled by a notification service component
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <RemindersContext.Provider
      value={{
        state,
        getReminderByHabit,
        createReminder,
        updateReminder,
        deleteReminder,
        snoozeReminder,
        markReminderAsDone,
        getDueReminders,
        refreshReminders,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(RemindersContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
}

