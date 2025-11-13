import { useState } from 'react';
import { Habit, CheckIn } from '../types';
import { useCheckIns } from '../contexts/CheckInsContext';
import { format, startOfDay, isSameDay } from 'date-fns';

interface CheckInInterfaceProps {
  habit: Habit;
  date?: Date;
}

export default function CheckInInterface({ habit, date = new Date() }: CheckInInterfaceProps) {
  const { getCheckInByDate, createCheckIn, updateCheckIn } = useCheckIns();
  const [value, setValue] = useState<number>(habit.targetType === 'boolean' ? 1 : 0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingCheckIn = getCheckInByDate(habit.id, date);
  const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const checkInData: Omit<CheckIn, 'id' | 'createdAt'> = {
        habitId: habit.id,
        date: dateStr,
        value: habit.targetType === 'boolean' ? (value > 0 ? 1 : 0) : value,
        completed: habit.targetType === 'boolean' ? value > 0 : value >= habit.targetValue,
        notes: notes.trim() || undefined,
      };

      if (existingCheckIn) {
        await updateCheckIn(existingCheckIn.id, checkInData);
      } else {
        await createCheckIn(checkInData);
      }
      
      // Reset form if it's a boolean check-in
      if (habit.targetType === 'boolean') {
        setValue(1);
        setNotes('');
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
      alert('Failed to save check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async () => {
    if (habit.targetType === 'boolean') {
      const newValue = existingCheckIn?.completed ? 0 : 1;
      setValue(newValue);
      
      const checkInData: Omit<CheckIn, 'id' | 'createdAt'> = {
        habitId: habit.id,
        date: dateStr,
        value: newValue,
        completed: newValue > 0,
        notes: existingCheckIn?.notes,
      };

      try {
        if (existingCheckIn) {
          await updateCheckIn(existingCheckIn.id, checkInData);
        } else {
          await createCheckIn(checkInData);
        }
      } catch (error) {
        console.error('Error toggling check-in:', error);
        alert('Failed to update check-in. Please try again.');
      }
    }
  };

  const getValueLabel = () => {
    if (habit.targetType === 'boolean') {
      return existingCheckIn?.completed ? 'Completed' : 'Not Completed';
    }
    const labels: Record<string, string> = {
      times: 'times',
      minutes: 'minutes',
      pages: 'pages',
      count: 'items',
    };
    return `${value} ${labels[habit.targetType] || 'units'}`;
  };

  if (habit.targetType === 'boolean') {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Check-in for {format(date, 'MMM d, yyyy')}
            </p>
            {existingCheckIn && (
              <p className="text-xs text-gray-500">
                Last updated: {format(new Date(existingCheckIn.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
          <button
            onClick={handleToggle}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              existingCheckIn?.completed
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {existingCheckIn?.completed ? '✓ Completed' : 'Mark Complete'}
          </button>
        </div>
        {existingCheckIn?.notes && (
          <div className="mt-3 p-2 bg-white rounded border border-gray-200">
            <p className="text-sm text-gray-700">{existingCheckIn.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        Check-in for {format(date, 'MMM d, yyyy')}
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {habit.targetType === 'times' ? 'Number of Times' :
             habit.targetType === 'minutes' ? 'Minutes' :
             habit.targetType === 'pages' ? 'Pages' :
             'Count'}
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setValue(Math.max(0, value - 1))}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-center"
            />
            <button
              onClick={() => setValue(value + 1)}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              +
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Target: {habit.targetValue} {habit.targetType}
            {value >= habit.targetValue && (
              <span className="ml-2 text-green-600 font-medium">✓ Target met!</span>
            )}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add any notes about this check-in..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : existingCheckIn ? 'Update Check-in' : 'Save Check-in'}
        </button>

        {existingCheckIn && (
          <p className="text-xs text-gray-500 text-center">
            Last updated: {format(new Date(existingCheckIn.createdAt), 'MMM d, yyyy h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}

