import { Streak } from '../types';

interface StreakDisplayProps {
  streak: Streak;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakDisplay({ streak, size = 'md' }: StreakDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center space-x-4 ${sizeClasses[size]}`}>
      <div className="flex items-center space-x-2">
        <div className="text-2xl">🔥</div>
        <div>
          <div className="text-gray-600 text-xs">Current Streak</div>
          <div className="font-bold text-primary-600">{streak.currentStreak} days</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-2xl">⭐</div>
        <div>
          <div className="text-gray-600 text-xs">Longest Streak</div>
          <div className="font-bold text-gray-700">{streak.longestStreak} days</div>
        </div>
      </div>
    </div>
  );
}

