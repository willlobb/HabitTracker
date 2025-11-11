import { useState } from 'react';
import { Habit } from '../../shared/types';
import { exportHabitToICS, parseICSFile } from '../services/calendar';

interface CalendarIntegrationProps {
  habit: Habit;
}

export default function CalendarIntegration({ habit }: CalendarIntegrationProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportHabitToICS(habit);
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert('Failed to export calendar. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const events = await parseICSFile(file);
      // Here you could map events to reminders or check-ins
      alert(`Imported ${events.length} events from calendar. You can now sync these with your habit reminders.`);
      console.log('Imported events:', events);
    } catch (error) {
      console.error('Error importing calendar:', error);
      alert('Failed to import calendar file. Please ensure it is a valid .ics file.');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">Calendar Integration</h4>
      
      <div className="space-y-3">
        <div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isExporting ? 'Exporting...' : 'Export to Calendar (.ics)'}
          </button>
          <p className="mt-1 text-xs text-gray-500">
            Export your habit schedule to import into Google Calendar, Outlook, or other calendar apps.
          </p>
        </div>

        <div>
          <label className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm text-center cursor-pointer">
            {isImporting ? 'Importing...' : 'Import from Calendar (.ics)'}
            <input
              type="file"
              accept=".ics"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Import events from your calendar to sync with habit reminders.
          </p>
        </div>
      </div>
    </div>
  );
}

