// Re-export shared types for convenience
export * from '../../../shared/types';

// Frontend-specific types
export interface ProgressData {
  habitId: string;
  period: 'week' | 'month' | 'year';
  completionRate: number;
  totalCheckIns: number;
  targetCheckIns: number;
}

export interface DashboardStats {
  totalHabits: number;
  activeHabits: number;
  totalStreaks: number;
  completionRate: number;
  recentCheckIns: CheckIn[];
}

