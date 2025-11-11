import { useState } from 'react';
import { useHabits } from '../contexts/HabitsContext';
import HabitCard from '../components/HabitCard';
import HabitForm from '../components/HabitForm';
import TemplateSelector from '../components/TemplateSelector';

export default function Dashboard() {
  const { state } = useHabits();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHabits = state.habits.filter(habit => {
    const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading habits...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Habits</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Habit</span>
        </button>
      </div>

      <TemplateSelector />

      {state.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {state.error}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {state.categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredHabits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            {state.habits.length === 0
              ? "You don't have any habits yet. Create your first habit to get started!"
              : "No habits match your search criteria."}
          </p>
          {state.habits.length === 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Create Your First Habit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}

      {showCreateForm && (
        <HabitForm onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}
