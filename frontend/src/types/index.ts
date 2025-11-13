// Shared types - copied from shared/types for build compatibility
// This file re-exports all shared types to avoid path resolution issues

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type TargetType = 'times' | 'minutes' | 'pages' | 'count' | 'boolean';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  frequency: Frequency;
  targetType: TargetType;
  targetValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  habitId: string;
  name: string;
  description?: string;
  subTasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  goalId: string;
  name: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string;
  value: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Streak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate?: string;
}

export interface Reminder {
  id: string;
  habitId: string;
  enabled: boolean;
  time?: string;
  daysOfWeek?: number[];
  nextReminderDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlockedAt?: string;
}

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: Frequency;
  targetType: TargetType;
  targetValue: number;
  isPreBuilt: boolean;
}

// Frontend-specific types

export interface DashboardStats {
  totalHabits: number;
  activeHabits: number;
  totalStreaks: number;
  completionRate: number;
  recentCheckIns: CheckIn[];
}
