import { HabitTemplate, Habit, Frequency, TargetType } from '../../shared/types';

/**
 * Pre-built habit templates
 */
export const preBuiltTemplates: HabitTemplate[] = [
  {
    id: 'template-read',
    name: 'Read Daily',
    description: 'Read for at least 30 minutes every day',
    category: 'Learning',
    frequency: 'daily',
    targetType: 'minutes',
    targetValue: 30,
    isPreBuilt: true,
  },
  {
    id: 'template-exercise',
    name: 'Exercise',
    description: 'Exercise for at least 30 minutes',
    category: 'Health',
    frequency: 'daily',
    targetType: 'minutes',
    targetValue: 30,
    isPreBuilt: true,
  },
  {
    id: 'template-meditate',
    name: 'Meditate',
    description: 'Meditate for 10 minutes daily',
    category: 'Wellness',
    frequency: 'daily',
    targetType: 'minutes',
    targetValue: 10,
    isPreBuilt: true,
  },
  {
    id: 'template-water',
    name: 'Drink Water',
    description: 'Drink 8 glasses of water per day',
    category: 'Health',
    frequency: 'daily',
    targetType: 'count',
    targetValue: 8,
    isPreBuilt: true,
  },
  {
    id: 'template-study',
    name: 'Study',
    description: 'Study for 2 hours daily',
    category: 'Learning',
    frequency: 'daily',
    targetType: 'minutes',
    targetValue: 120,
    isPreBuilt: true,
  },
  {
    id: 'template-journal',
    name: 'Journal',
    description: 'Write in journal daily',
    category: 'Wellness',
    frequency: 'daily',
    targetType: 'boolean',
    targetValue: 1,
    isPreBuilt: true,
  },
  {
    id: 'template-walk',
    name: 'Walk',
    description: 'Take a 30-minute walk',
    category: 'Health',
    frequency: 'daily',
    targetType: 'minutes',
    targetValue: 30,
    isPreBuilt: true,
  },
  {
    id: 'template-gratitude',
    name: 'Gratitude Practice',
    description: 'Write down 3 things you are grateful for',
    category: 'Wellness',
    frequency: 'daily',
    targetType: 'count',
    targetValue: 3,
    isPreBuilt: true,
  },
];

/**
 * Convert a template to a habit (for cloning)
 */
export function templateToHabit(template: HabitTemplate): Omit<Habit, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: template.name,
    description: template.description,
    category: template.category,
    frequency: template.frequency,
    targetType: template.targetType,
    targetValue: template.targetValue,
  };
}

/**
 * Save a custom template
 */
export async function saveCustomTemplate(template: Omit<HabitTemplate, 'id' | 'isPreBuilt'>, db: any): Promise<string> {
  const id = crypto.randomUUID();
  const customTemplate: HabitTemplate = {
    ...template,
    id,
    isPreBuilt: false,
  };
  await db.templates.add(customTemplate);
  return id;
}

/**
 * Get all templates (pre-built + custom)
 */
export async function getAllTemplates(db: any): Promise<HabitTemplate[]> {
  const customTemplates = await db.templates.where('isPreBuilt').equals(0).toArray();
  return [...preBuiltTemplates, ...customTemplates];
}

