import { Goal } from '../../shared/types';
import { calculateGoalProgress } from '../utils/goals';

interface GoalProgressBarProps {
  goal: Goal;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function GoalProgressBar({ goal, showLabel = true, size = 'md' }: GoalProgressBarProps) {
  const progress = calculateGoalProgress(goal);
  const completedCount = goal.subTasks.filter(st => st.completed).length;
  const totalCount = goal.subTasks.length;

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{goal.name}</span>
          <span className="text-sm text-gray-600">
            {completedCount} / {totalCount} tasks
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className="h-full bg-primary-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-500 text-right">{progress}% complete</div>
      )}
    </div>
  );
}

