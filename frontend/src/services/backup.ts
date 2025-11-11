import { db } from './database';

/**
 * Export all data as JSON for backup
 */
export async function exportData(): Promise<string> {
  try {
    const habits = await db.habits.toArray();
    const goals = await db.goals.toArray();
    const subTasks = await db.subTasks.toArray();
    const checkIns = await db.checkIns.toArray();
    const streaks = await db.streaks.toArray();
    const reminders = await db.reminders.toArray();
    const badges = await db.badges.toArray();
    const templates = await db.templates.toArray();

    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      habits,
      goals,
      subTasks,
      checkIns,
      streaks,
      reminders,
      badges,
      templates,
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Import data from JSON backup
 */
export async function importData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate data structure
    if (!data.habits || !Array.isArray(data.habits)) {
      throw new Error('Invalid backup file format');
    }

    // Clear existing data (optional - could merge instead)
    await db.habits.clear();
    await db.goals.clear();
    await db.subTasks.clear();
    await db.checkIns.clear();
    await db.streaks.clear();
    await db.reminders.clear();
    await db.badges.clear();
    await db.templates.clear();

    // Import data
    if (data.habits.length > 0) await db.habits.bulkAdd(data.habits);
    if (data.goals?.length > 0) await db.goals.bulkAdd(data.goals);
    if (data.subTasks?.length > 0) await db.subTasks.bulkAdd(data.subTasks);
    if (data.checkIns?.length > 0) await db.checkIns.bulkAdd(data.checkIns);
    if (data.streaks?.length > 0) await db.streaks.bulkAdd(data.streaks);
    if (data.reminders?.length > 0) await db.reminders.bulkAdd(data.reminders);
    if (data.badges?.length > 0) await db.badges.bulkAdd(data.badges);
    if (data.templates?.length > 0) await db.templates.bulkAdd(data.templates);
  } catch (error) {
    throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download backup file
 */
export async function downloadBackup(): Promise<void> {
  try {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to download backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

