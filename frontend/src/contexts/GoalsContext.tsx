import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Goal, SubTask } from '../../shared/types';
import { db } from '../services/database';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

type GoalsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GOALS'; payload: Goal[] }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'UPDATE_SUBTASK'; payload: { goalId: string; subTask: SubTask } }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
};

function goalsReducer(state: GoalsState, action: GoalsAction): GoalsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_GOALS':
      return { ...state, goals: action.payload, loading: false };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g),
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload),
      };
    case 'UPDATE_SUBTASK':
      return {
        ...state,
        goals: state.goals.map(goal => {
          if (goal.id === action.payload.goalId) {
            return {
              ...goal,
              subTasks: goal.subTasks.map(st =>
                st.id === action.payload.subTask.id ? action.payload.subTask : st
              ),
            };
          }
          return goal;
        }),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface GoalsContextType {
  state: GoalsState;
  getGoalByHabitId: (habitId: string) => Goal | undefined;
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addSubTask: (goalId: string, subTask: Omit<SubTask, 'id' | 'createdAt'>) => Promise<void>;
  updateSubTask: (goalId: string, subTaskId: string, updates: Partial<SubTask>) => Promise<void>;
  deleteSubTask: (goalId: string, subTaskId: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(goalsReducer, initialState);

  const refreshGoals = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const goals = await db.goals.toArray();
      // Load sub-tasks for each goal
      const goalsWithSubTasks = await Promise.all(
        goals.map(async (goal) => {
          const subTasks = await db.subTasks.where('goalId').equals(goal.id).toArray();
          return { ...goal, subTasks };
        })
      );
      dispatch({ type: 'SET_GOALS', payload: goalsWithSubTasks });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load goals' });
    }
  };

  const getGoalByHabitId = (habitId: string): Goal | undefined => {
    return state.goals.find(g => g.habitId === habitId);
  };

  const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newGoal: Goal = {
        ...goal,
        id,
        createdAt: now,
        updatedAt: now,
        subTasks: [],
      };
      await db.goals.add(newGoal);
      dispatch({ type: 'ADD_GOAL', payload: newGoal });
      return id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create goal' });
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const goal = await db.goals.get(id);
      if (!goal) throw new Error('Goal not found');
      
      const updatedGoal: Goal = {
        ...goal,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await db.goals.update(id, updatedGoal);
      dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update goal' });
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await db.goals.delete(id);
      await db.subTasks.where('goalId').equals(id).delete();
      dispatch({ type: 'DELETE_GOAL', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete goal' });
      throw error;
    }
  };

  const addSubTask = async (goalId: string, subTask: Omit<SubTask, 'id' | 'createdAt'>) => {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newSubTask: SubTask = {
        ...subTask,
        id,
        createdAt: now,
      };
      await db.subTasks.add(newSubTask);
      
      const goal = await db.goals.get(goalId);
      if (goal) {
        const updatedGoal: Goal = {
          ...goal,
          subTasks: [...goal.subTasks, newSubTask],
          updatedAt: now,
        };
        await db.goals.update(goalId, updatedGoal);
        dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add sub-task' });
      throw error;
    }
  };

  const updateSubTask = async (goalId: string, subTaskId: string, updates: Partial<SubTask>) => {
    try {
      const subTask = await db.subTasks.get(subTaskId);
      if (!subTask) throw new Error('Sub-task not found');
      
      const updatedSubTask: SubTask = {
        ...subTask,
        ...updates,
        completedAt: updates.completed ? new Date().toISOString() : undefined,
      };
      await db.subTasks.update(subTaskId, updatedSubTask);
      
      const goal = await db.goals.get(goalId);
      if (goal) {
        const updatedGoal: Goal = {
          ...goal,
          subTasks: goal.subTasks.map(st => st.id === subTaskId ? updatedSubTask : st),
          updatedAt: new Date().toISOString(),
        };
        await db.goals.update(goalId, updatedGoal);
        dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update sub-task' });
      throw error;
    }
  };

  const deleteSubTask = async (goalId: string, subTaskId: string) => {
    try {
      await db.subTasks.delete(subTaskId);
      
      const goal = await db.goals.get(goalId);
      if (goal) {
        const updatedGoal: Goal = {
          ...goal,
          subTasks: goal.subTasks.filter(st => st.id !== subTaskId),
          updatedAt: new Date().toISOString(),
        };
        await db.goals.update(goalId, updatedGoal);
        dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete sub-task' });
      throw error;
    }
  };

  useEffect(() => {
    refreshGoals();
  }, []);

  return (
    <GoalsContext.Provider
      value={{
        state,
        getGoalByHabitId,
        createGoal,
        updateGoal,
        deleteGoal,
        addSubTask,
        updateSubTask,
        deleteSubTask,
        refreshGoals,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}

