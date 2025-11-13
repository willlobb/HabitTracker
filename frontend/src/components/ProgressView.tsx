import { useState, useEffect } from 'react';
import { Habit, Streak } from '../types';
import { useCheckIns } from '../contexts/CheckInsContext';
import { calculateProgress, calculateCompletionRate, type ProgressData } from '../utils/progress';
import { calculateStreak } from '../utils/streaks';
import { db } from '../services/database';
import ProgressChart from './ProgressChart';
import StreakDisplay from './StreakDisplay';

interface ProgressViewProps {
  habit: Habit;
}

export default function ProgressView({ habit }: ProgressViewProps) {
  const { getCheckInsByHabit } = useCheckIns();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    const checkIns = getCheckInsByHabit(habit.id);
    const progress = calculateProgress(habit, checkIns, selectedPeriod);
    const calculatedStreak = calculateStreak(habit, checkIns);
    const rate = calculateCompletionRate(habit, checkIns);

    setProgressData(progress);
    setStreak(calculatedStreak);
    setCompletionRate(rate);

    // Update streak in database
    db.streaks.put(calculatedStreak).catch(console.error);
  }, [habit, selectedPeriod, getCheckInsByHabit]);

  if (!progressData || !streak) {
    return <div className="text-gray-500">Loading progress...</div>;
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold text-gray-800">Progress & Stats</h4>
          <div className="flex space-x-2">
            {(['week', 'month', 'year'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="text-2xl font-bold text-primary-600">{completionRate}%</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">This {selectedPeriod}</div>
            <div className="text-2xl font-bold text-gray-800">
              {progressData.completed} / {progressData.expected}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-2xl font-bold text-green-600">{progressData.completionRate}%</div>
          </div>
        </div>

        <StreakDisplay streak={streak} />

        <div className="mt-4">
          <ProgressChart data={progressData} />
        </div>
      </div>
    </div>
  );
}

