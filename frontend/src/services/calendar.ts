import { createEvents, EventAttributes } from 'ics';
import { Habit, Frequency } from '../../shared/types';
import { format, addDays, addWeeks, addMonths, addYears, startOfDay } from 'date-fns';

/**
 * Export habit schedule to .ics file
 */
export async function exportHabitToICS(habit: Habit, startDate: Date = new Date(), weeks: number = 12): Promise<void> {
  const events: EventAttributes[] = [];
  const endDate = addWeeks(startDate, weeks);

  let currentDate = startOfDay(startDate);
  const frequencyMap: Record<Frequency, (date: Date) => Date> = {
    daily: (d) => addDays(d, 1),
    weekly: (d) => addWeeks(d, 1),
    monthly: (d) => addMonths(d, 1),
    quarterly: (d) => addMonths(d, 3),
    yearly: (d) => addYears(d, 1),
  };

  const incrementDate = frequencyMap[habit.frequency];

  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyyMMdd');
    const timeStr = '090000'; // Default to 9 AM

    events.push({
      title: habit.name,
      description: habit.description || `Habit: ${habit.name}`,
      start: [parseInt(dateStr.substring(0, 4)), parseInt(dateStr.substring(4, 6)), parseInt(dateStr.substring(6, 8)), 9, 0],
      duration: { hours: 0, minutes: 30 },
      categories: habit.category ? [habit.category] : undefined,
    });

    currentDate = incrementDate(currentDate);
  }

  const { error, value } = createEvents(events);
  
  if (error) {
    throw new Error(`Failed to create calendar events: ${error.message}`);
  }

  if (!value) {
    throw new Error('Failed to generate calendar file');
  }

  // Create blob and download
  const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${habit.name.replace(/\s+/g, '_')}_schedule.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse .ics file and extract events
 */
export function parseICSFile(file: File): Promise<Array<{ title: string; start: Date; end: Date; description?: string }>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const events: Array<{ title: string; start: Date; end: Date; description?: string }> = [];
        
        let currentEvent: Partial<{ title: string; start: Date; end: Date; description: string }> = {};
        
        for (const line of lines) {
          if (line.startsWith('SUMMARY:')) {
            currentEvent.title = line.substring(8).trim();
          } else if (line.startsWith('DTSTART:')) {
            const dateStr = line.substring(8).trim();
            currentEvent.start = parseICSDate(dateStr);
          } else if (line.startsWith('DTEND:')) {
            const dateStr = line.substring(6).trim();
            currentEvent.end = parseICSDate(dateStr);
          } else if (line.startsWith('DESCRIPTION:')) {
            currentEvent.description = line.substring(12).trim();
          } else if (line === 'END:VEVENT' && currentEvent.title && currentEvent.start) {
            events.push({
              title: currentEvent.title,
              start: currentEvent.start!,
              end: currentEvent.end || currentEvent.start!,
              description: currentEvent.description,
            });
            currentEvent = {};
          }
        }
        
        resolve(events);
      } catch (error) {
        reject(new Error(`Failed to parse ICS file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Parse ICS date format (YYYYMMDDTHHMMSS or YYYYMMDD)
 */
function parseICSDate(dateStr: string): Date {
  // Remove timezone info if present
  const cleanDate = dateStr.replace(/[TZ].*$/, '');
  
  if (cleanDate.length === 8) {
    // YYYYMMDD format
    const year = parseInt(cleanDate.substring(0, 4));
    const month = parseInt(cleanDate.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(cleanDate.substring(6, 8));
    return new Date(year, month, day);
  } else if (cleanDate.length >= 14) {
    // YYYYMMDDHHMMSS format
    const year = parseInt(cleanDate.substring(0, 4));
    const month = parseInt(cleanDate.substring(4, 6)) - 1;
    const day = parseInt(cleanDate.substring(6, 8));
    const hour = parseInt(cleanDate.substring(8, 10));
    const minute = parseInt(cleanDate.substring(10, 12));
    return new Date(year, month, day, hour, minute);
  }
  
  throw new Error(`Invalid date format: ${dateStr}`);
}

