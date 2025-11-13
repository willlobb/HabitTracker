import { CheckIn, Habit, Streak } from '../types';
import { startOfDay, differenceInDays, isSameDay, subDays } from 'date-fns';

/**
 * Calculates the current streak for a habit based on check-ins
 */
export function calculateStreak(habit: Habit, checkIns: CheckIn[]): Streak {
  if (checkIns.length === 0) {
    return {
      habitId: habit.id,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Sort check-ins by date (newest first)
  const sortedCheckIns = [...checkIns]
    .filter(ci => ci.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedCheckIns.length === 0) {
    return {
      habitId: habit.id,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: undefined,
    };
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = startOfDay(new Date());
  let checkDate = startOfDay(new Date(sortedCheckIns[0].date));
  
  // Check if the most recent check-in is today or yesterday (allowing for 1 day gap)
  const daysSinceLastCheckIn = differenceInDays(today, checkDate);
  if (daysSinceLastCheckIn > 1) {
    // Streak is broken
    currentStreak = 0;
  } else {
    // Count consecutive days
    for (let i = 0; i < sortedCheckIns.length; i++) {
      const expectedDate = subDays(today, currentStreak);
      const checkInDate = startOfDay(new Date(sortedCheckIns[i].date));
      
      if (isSameDay(checkInDate, expectedDate) || isSameDay(checkInDate, subDays(expectedDate, 1))) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;
  
  for (let i = 1; i < sortedCheckIns.length; i++) {
    const prevDate = startOfDay(new Date(sortedCheckIns[i - 1].date));
    const currDate = startOfDay(new Date(sortedCheckIns[i].date));
    const daysDiff = differenceInDays(prevDate, currDate);
    
    if (daysDiff === 1 || daysDiff === 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    habitId: habit.id,
    currentStreak,
    longestStreak,
    lastCheckInDate: sortedCheckIns[0].date,
  };
}

/**
 * Updates or creates a streak record in the database
 */
export async function updateStreakInDB(streak: Streak, db: any) {
  const existing = await db.streaks.get(streak.habitId);
  if (existing) {
    await db.streaks.update(streak.habitId, streak);
  } else {
    await db.streaks.add(streak);
  }
}

