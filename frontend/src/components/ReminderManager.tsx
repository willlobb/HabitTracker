import { useState, useEffect } from 'react';
import { Habit } from '../types';
import { useReminders } from '../contexts/RemindersContext';
import { requestNotificationPermission, showNotification } from '../services/notifications';
import { calculateNextReminderDate } from '../services/notifications';
import { format } from 'date-fns';

interface ReminderManagerProps {
  habit: Habit;
}

export default function ReminderManager({ habit }: ReminderManagerProps) {
  const { getReminderByHabit, createReminder, updateReminder, snoozeReminder, markReminderAsDone } = useReminders();
  const reminder = getReminderByHabit(habit.id);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [reminderTime, setReminderTime] = useState('09:00');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (reminder?.nextReminderDate) {
      const reminderDate = new Date(reminder.nextReminderDate);
      const timeStr = format(reminderDate, 'HH:mm');
      setReminderTime(timeStr);
    }
  }, [reminder]);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
    } else {
      setNotificationPermission('denied');
    }
  };

  const handleEnableReminder = async () => {
    if (notificationPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('Notification permission is required to enable reminders.');
        return;
      }
      setNotificationPermission('granted');
    }

    try {
      const nextDate = calculateNextReminderDate(habit.frequency);
      const [hours, minutes] = reminderTime.split(':').map(Number);
      nextDate.setHours(hours, minutes, 0, 0);

      if (reminder) {
        await updateReminder(reminder.id, {
          enabled: true,
          nextReminderDate: nextDate.toISOString(),
          time: reminderTime,
        });
      } else {
        await createReminder({
          habitId: habit.id,
          enabled: true,
          time: reminderTime,
          nextReminderDate: nextDate.toISOString(),
        });
      }
    } catch (error) {
      console.error('Error enabling reminder:', error);
      alert('Failed to enable reminder. Please try again.');
    }
  };

  const handleDisableReminder = async () => {
    if (!reminder) return;
    
    try {
      await updateReminder(reminder.id, { enabled: false });
    } catch (error) {
      console.error('Error disabling reminder:', error);
      alert('Failed to disable reminder. Please try again.');
    }
  };

  const handleSnooze = async (minutes: number) => {
    if (!reminder) return;
    
    try {
      await snoozeReminder(reminder.id, minutes);
      showNotification(`Reminder snoozed for ${minutes} minutes`, {
        body: `You'll be reminded about "${habit.name}" in ${minutes} minutes.`,
      });
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  const handleMarkAsDone = async () => {
    if (!reminder) return;
    
    try {
      await markReminderAsDone(reminder.id);
      showNotification('Great job!', {
        body: `You've completed "${habit.name}" for today.`,
      });
    } catch (error) {
      console.error('Error marking reminder as done:', error);
    }
  };

  if (notificationPermission === 'denied') {
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 mb-2">
          Notifications are blocked. Please enable them in your browser settings to use reminders.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-800">Reminders</h4>
        {notificationPermission !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
          >
            Enable Notifications
          </button>
        )}
      </div>

      {reminder?.enabled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Next reminder: {reminder.nextReminderDate 
                  ? format(new Date(reminder.nextReminderDate), 'MMM d, yyyy h:mm a')
                  : 'Not set'}
              </p>
            </div>
            <button
              onClick={handleDisableReminder}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Disable
            </button>
          </div>
          
          {reminder.nextReminderDate && new Date(reminder.nextReminderDate) <= new Date() && (
            <div className="p-3 bg-primary-100 border border-primary-300 rounded">
              <p className="text-sm font-medium text-primary-800 mb-2">
                Time to check in on "{habit.name}"!
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSnooze(15)}
                  className="px-3 py-1 text-xs bg-white text-primary-700 border border-primary-300 rounded hover:bg-primary-50 transition-colors"
                >
                  Snooze 15min
                </button>
                <button
                  onClick={() => handleSnooze(60)}
                  className="px-3 py-1 text-xs bg-white text-primary-700 border border-primary-300 rounded hover:bg-primary-50 transition-colors"
                >
                  Snooze 1hr
                </button>
                <button
                  onClick={handleMarkAsDone}
                  className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                >
                  Mark as Done
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleEnableReminder}
            disabled={notificationPermission !== 'granted'}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Enable Reminder
          </button>
        </div>
      )}
    </div>
  );
}

