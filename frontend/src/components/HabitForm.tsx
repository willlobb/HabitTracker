import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Habit, Frequency, TargetType } from '../types';
import { useHabits } from '../contexts/HabitsContext';
import { validateFrequencyTarget } from '../utils/validation';

interface HabitFormData {
  name: string;
  description: string;
  category: string;
  frequency: Frequency;
  targetType: TargetType;
  targetValue: number;
}

interface HabitFormProps {
  habit?: Habit;
  onClose: () => void;
}

export default function HabitForm({ habit, onClose }: HabitFormProps) {
  const { createHabit, updateHabit } = useHabits();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<HabitFormData>({
    defaultValues: habit ? {
      name: habit.name,
      description: habit.description || '',
      category: habit.category || '',
      frequency: habit.frequency,
      targetType: habit.targetType,
      targetValue: habit.targetValue,
    } : {
      frequency: 'daily',
      targetType: 'boolean',
      targetValue: 1,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const targetType = watch('targetType');
  const frequency = watch('frequency');
  const targetValue = watch('targetValue');

  // Validate frequency/target combination when values change
  useEffect(() => {
    if (frequency && targetType && targetValue) {
      const error = validateFrequencyTarget(frequency, targetType, targetValue);
      setValidationError(error);
    } else {
      setValidationError(null);
    }
  }, [frequency, targetType, targetValue]);

  const onSubmit = async (data: HabitFormData) => {
    // Final validation
    const error = validateFrequencyTarget(data.frequency, data.targetType, data.targetValue);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);
    try {
      if (habit) {
        await updateHabit(habit.id, data);
      } else {
        await createHabit(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving habit:', error);
      alert('Failed to save habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {habit ? 'Edit Habit' : 'Create New Habit'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              id="category"
              type="text"
              {...register('category')}
              placeholder="e.g., Health, Learning, Work"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency *
            </label>
            <select
              id="frequency"
              {...register('frequency', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label htmlFor="targetType" className="block text-sm font-medium text-gray-700 mb-1">
              Target Type *
            </label>
            <select
              id="targetType"
              {...register('targetType', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="boolean">Completion (Yes/No)</option>
              <option value="times">Number of Times</option>
              <option value="minutes">Minutes</option>
              <option value="pages">Pages</option>
              <option value="count">Count</option>
            </select>
          </div>

          {targetType !== 'boolean' && (
            <div>
              <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 mb-1">
                Target Value *
              </label>
              <input
                id="targetValue"
                type="number"
                min="1"
                step="1"
                {...register('targetValue', { 
                  required: (targetType as string) !== 'boolean' ? 'Target value is required' : false,
                  min: { value: 1, message: 'Target value must be at least 1' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.targetValue && (
                <p className="mt-1 text-sm text-red-600">{errors.targetValue.message}</p>
              )}
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!validationError}
              className="px-4 py-2 text-white bg-primary-500 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : habit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

