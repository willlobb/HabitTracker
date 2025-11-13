import { useState } from 'react';
import { Habit } from '../types';
import { useHabits } from '../contexts/HabitsContext';
import HabitForm from './HabitForm';
import GoalManager from './GoalManager';
import CheckInInterface from './CheckInInterface';
import ProgressView from './ProgressView';
import ReminderManager from './ReminderManager';
import CalendarIntegration from './CalendarIntegration';

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { deleteHabit } = useHabits();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteHabit(habit.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const getTargetLabel = (targetType: string, targetValue: number) => {
    if (targetType === 'boolean') return 'Complete';
    const labels: Record<string, string> = {
      times: 'times',
      minutes: 'minutes',
      pages: 'pages',
      count: 'items',
    };
    return `${targetValue} ${labels[targetType] || 'units'}`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{habit.name}</h3>
            {habit.description && (
              <p className="text-gray-600 text-sm mb-2">{habit.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {habit.category && (
                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  {habit.category}
                </span>
              )}
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {getFrequencyLabel(habit.frequency)}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {getTargetLabel(habit.targetType, habit.targetValue)}
              </span>
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => setShowEditForm(true)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="Edit habit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete habit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <GoalManager habit={habit} />
        <CheckInInterface habit={habit} />
        <ReminderManager habit={habit} />
        <CalendarIntegration habit={habit} />
        <ProgressView habit={habit} />
      </div>

      {showEditForm && (
        <HabitForm habit={habit} onClose={() => setShowEditForm(false)} />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Delete Habit</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{habit.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

