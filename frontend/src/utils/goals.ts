import { Goal, SubTask } from '../types';

/**
 * Calculates the progress percentage for a goal based on completed sub-tasks
 */
export function calculateGoalProgress(goal: Goal): number {
  if (!goal.subTasks || goal.subTasks.length === 0) {
    return 0;
  }
  
  const completedCount = goal.subTasks.filter(st => st.completed).length;
  return Math.round((completedCount / goal.subTasks.length) * 100);
}

/**
 * Gets the number of completed sub-tasks
 */
export function getCompletedSubTasksCount(goal: Goal): number {
  if (!goal.subTasks) return 0;
  return goal.subTasks.filter(st => st.completed).length;
}

/**
 * Gets the total number of sub-tasks
 */
export function getTotalSubTasksCount(goal: Goal): number {
  return goal.subTasks?.length || 0;
}

