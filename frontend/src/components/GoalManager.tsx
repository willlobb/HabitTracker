import { useState } from 'react';
import { Habit, Goal, SubTask } from '../types';
import { useGoals } from '../contexts/GoalsContext';
import GoalProgressBar from './GoalProgressBar';

interface GoalManagerProps {
  habit: Habit;
}

export default function GoalManager({ habit }: GoalManagerProps) {
  const { getGoalByHabitId, createGoal, updateGoal, addSubTask, updateSubTask, deleteSubTask } = useGoals();
  const goal = getGoalByHabitId(habit.id);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showSubTaskForm, setShowSubTaskForm] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newSubTaskName, setNewSubTaskName] = useState('');

  const handleCreateGoal = async () => {
    if (!newGoalName.trim()) return;
    
    try {
      await createGoal({
        habitId: habit.id,
        name: newGoalName,
        description: newGoalDescription || undefined,
        subTasks: [],
      });
      setNewGoalName('');
      setNewGoalDescription('');
      setShowGoalForm(false);
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleAddSubTask = async () => {
    if (!goal || !newSubTaskName.trim()) return;
    
    try {
      await addSubTask(goal.id, {
        goalId: goal.id,
        name: newSubTaskName,
        completed: false,
      });
      setNewSubTaskName('');
      setShowSubTaskForm(false);
    } catch (error) {
      console.error('Error adding sub-task:', error);
      alert('Failed to add sub-task. Please try again.');
    }
  };

  const handleToggleSubTask = async (subTaskId: string, completed: boolean) => {
    if (!goal) return;
    
    try {
      await updateSubTask(goal.id, subTaskId, { completed: !completed });
    } catch (error) {
      console.error('Error updating sub-task:', error);
      alert('Failed to update sub-task. Please try again.');
    }
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    if (!goal) return;
    
    if (!confirm('Are you sure you want to delete this sub-task?')) return;
    
    try {
      await deleteSubTask(goal.id, subTaskId);
    } catch (error) {
      console.error('Error deleting sub-task:', error);
      alert('Failed to delete sub-task. Please try again.');
    }
  };

  if (!goal) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        {!showGoalForm ? (
          <div>
            <p className="text-gray-600 mb-3">No goal set for this habit.</p>
            <button
              onClick={() => setShowGoalForm(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm"
            >
              Create Goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Name *
              </label>
              <input
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="e.g., Read 12 books this year"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                rows={2}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateGoal}
                disabled={!newGoalName.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowGoalForm(false);
                  setNewGoalName('');
                  setNewGoalDescription('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-800">{goal.name}</h4>
            {goal.description && (
              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
            )}
          </div>
        </div>
        <GoalProgressBar goal={goal} />
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-sm font-medium text-gray-700">Sub-Tasks</h5>
          {!showSubTaskForm && (
            <button
              onClick={() => setShowSubTaskForm(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + Add Sub-Task
            </button>
          )}
        </div>

        {showSubTaskForm && (
          <div className="mb-3 p-3 bg-white rounded border border-gray-200">
            <input
              type="text"
              value={newSubTaskName}
              onChange={(e) => setNewSubTaskName(e.target.value)}
              placeholder="Sub-task name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSubTask();
                }
              }}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddSubTask}
                disabled={!newSubTaskName.trim()}
                className="px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowSubTaskForm(false);
                  setNewSubTaskName('');
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {goal.subTasks.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No sub-tasks yet. Add one to get started!</p>
          ) : (
            goal.subTasks.map((subTask) => (
              <div
                key={subTask.id}
                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="checkbox"
                    checked={subTask.completed}
                    onChange={() => handleToggleSubTask(subTask.id, subTask.completed)}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span
                    className={`text-sm flex-1 ${
                      subTask.completed ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}
                  >
                    {subTask.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteSubTask(subTask.id)}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Delete sub-task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

