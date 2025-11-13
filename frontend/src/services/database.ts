import Dexie, { Table } from 'dexie';
import type { Habit, Goal, SubTask, CheckIn, Streak, Reminder, Badge, HabitTemplate } from '../types';

class HabitTrackerDB extends Dexie {
  habits!: Table<Habit>;
  goals!: Table<Goal>;
  subTasks!: Table<SubTask>;
  checkIns!: Table<CheckIn>;
  streaks!: Table<Streak>;
  reminders!: Table<Reminder>;
  badges!: Table<Badge>;
  templates!: Table<HabitTemplate>;

  constructor() {
    super('HabitTrackerDB');
    
    this.version(1).stores({
      habits: 'id, name, category, createdAt',
      goals: 'id, habitId, createdAt',
      subTasks: 'id, goalId, completed',
      checkIns: 'id, habitId, date, [habitId+date]',
      streaks: 'habitId',
      reminders: 'id, habitId, nextReminderDate',
      badges: 'id, unlockedAt',
      templates: 'id, isPreBuilt, category',
    });
  }
}

export const db = new HabitTrackerDB();

// Helper functions for common operations
export const dbHelpers = {
  async getAllHabits(): Promise<Habit[]> {
    return db.habits.toArray();
  },

  async getHabitById(id: string): Promise<Habit | undefined> {
    return db.habits.get(id);
  },

  async createHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.habits.add({
      ...habit,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },

  async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
    await db.habits.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteHabit(id: string): Promise<void> {
    await db.habits.delete(id);
    // Also delete related goals, check-ins, streaks, and reminders
    await db.goals.where('habitId').equals(id).delete();
    await db.checkIns.where('habitId').equals(id).delete();
    await db.streaks.where('habitId').equals(id).delete();
    await db.reminders.where('habitId').equals(id).delete();
  },

  async getCheckInsByHabit(habitId: string): Promise<CheckIn[]> {
    return db.checkIns.where('habitId').equals(habitId).toArray();
  },

  async getCheckInsByDateRange(habitId: string, startDate: string, endDate: string): Promise<CheckIn[]> {
    return db.checkIns
      .where('habitId')
      .equals(habitId)
      .filter(checkIn => checkIn.date >= startDate && checkIn.date <= endDate)
      .toArray();
  },
};

