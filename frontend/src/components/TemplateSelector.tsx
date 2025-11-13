import { useState, useEffect } from 'react';
import { HabitTemplate } from '../types';
import { preBuiltTemplates, templateToHabit, getAllTemplates } from '../services/templates';
import { db } from '../services/database';
import { useHabits } from '../contexts/HabitsContext';
import HabitForm from './HabitForm';

export default function TemplateSelector() {
  const { createHabit } = useHabits();
  const [templates, setTemplates] = useState<HabitTemplate[]>(preBuiltTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [showCustomizeForm, setShowCustomizeForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const allTemplates = await getAllTemplates(db);
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleUseTemplate = async (template: HabitTemplate) => {
    const habitData = templateToHabit(template);
    try {
      await createHabit(habitData);
      alert(`Habit "${habitData.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating habit from template:', error);
      alert('Failed to create habit. Please try again.');
    }
  };

  const handleCustomizeTemplate = (template: HabitTemplate) => {
    setSelectedTemplate(template);
    setShowCustomizeForm(true);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Habit Templates</h3>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="mb-2">
              <h4 className="font-semibold text-gray-800">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                {template.category}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="px-3 py-1 bg-primary-500 text-white text-sm rounded hover:bg-primary-600 transition-colors"
                >
                  Use
                </button>
                <button
                  onClick={() => handleCustomizeTemplate(template)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCustomizeForm && selectedTemplate && (
        <HabitForm
          habit={{
            id: '',
            name: selectedTemplate.name,
            description: selectedTemplate.description,
            category: selectedTemplate.category,
            frequency: selectedTemplate.frequency,
            targetType: selectedTemplate.targetType,
            targetValue: selectedTemplate.targetValue,
            createdAt: '',
            updatedAt: '',
          }}
          onClose={() => {
            setShowCustomizeForm(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}

