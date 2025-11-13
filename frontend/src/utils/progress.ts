import { CheckIn, Habit } from '../types';
import { startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { calculateExpectedCheckIns } from './validation';

export interface ProgressData {
  period: 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  completed: number;
  expected: number;
  completionRate: number;
  dailyData: { date: string; completed: boolean; value: number }[];
}

/**
 * Calculates progress for a specific period
 */
export function calculateProgress(
  habit: Habit,
  checkIns: CheckIn[],
  period: 'week' | 'month' | 'year' = 'week'
): ProgressData {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'week':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'month':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'year':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
  }

  const expected = calculateExpectedCheckIns(habit.frequency, startDate, endDate);
  
  // Filter check-ins within the period
  const periodCheckIns = checkIns.filter(ci => {
    const checkInDate = new Date(ci.date);
    return checkInDate >= startDate && checkInDate <= endDate && ci.completed;
  });

  const completed = periodCheckIns.length;

  // Create daily data for visualization
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dailyData = days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const checkIn = checkIns.find(ci => isSameDay(new Date(ci.date), date));
    return {
      date: dateStr,
      completed: checkIn?.completed || false,
      value: checkIn?.value || 0,
    };
  });

  return {
    period,
    startDate,
    endDate,
    completed,
    expected,
    completionRate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
    dailyData,
  };
}

/**
 * Calculates overall completion rate for a habit
 */
export function calculateCompletionRate(_habit: Habit, checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;
  
  const completed = checkIns.filter(ci => ci.completed).length;
  return Math.round((completed / checkIns.length) * 100);
}

