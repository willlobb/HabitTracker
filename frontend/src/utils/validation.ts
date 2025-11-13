import { Frequency, TargetType } from '../types';

/**
 * Validates frequency and target combinations
 */
export function validateFrequencyTarget(frequency: Frequency, targetType: TargetType, targetValue: number): string | null {
  // Boolean targets are always valid
  if (targetType === 'boolean') {
    return null;
  }

  // Validate target value is positive
  if (targetValue <= 0) {
    return 'Target value must be greater than 0';
  }

  // Validate reasonable limits based on frequency
  const limits: Record<Frequency, { min: number; max: number }> = {
    daily: { min: 1, max: 100 },
    weekly: { min: 1, max: 50 },
    monthly: { min: 1, max: 100 },
    quarterly: { min: 1, max: 200 },
    yearly: { min: 1, max: 1000 },
  };

  const limit = limits[frequency];
  if (targetValue < limit.min || targetValue > limit.max) {
    return `Target value for ${frequency} frequency should be between ${limit.min} and ${limit.max}`;
  }

  // Specific validations for different target types
  if (targetType === 'minutes' && targetValue > 1440) {
    return 'Target minutes cannot exceed 1440 (24 hours)';
  }

  return null;
}

/**
 * Calculates expected check-ins for a given period
 */
export function calculateExpectedCheckIns(
  frequency: Frequency,
  startDate: Date,
  endDate: Date
): number {
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (frequency) {
    case 'daily':
      return daysDiff;
    case 'weekly':
      return Math.ceil(daysDiff / 7);
    case 'monthly':
      return Math.ceil(daysDiff / 30);
    case 'quarterly':
      return Math.ceil(daysDiff / 90);
    case 'yearly':
      return Math.ceil(daysDiff / 365);
    default:
      return 0;
  }
}

