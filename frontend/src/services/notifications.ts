/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show a notification
 */
export function showNotification(title: string, options?: NotificationOptions): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(title, {
    icon: '/vite.svg',
    badge: '/vite.svg',
    ...options,
  });

  return notification;
}

/**
 * Calculate next reminder date based on frequency
 */
export function calculateNextReminderDate(
  frequency: string,
  lastReminderDate?: Date
): Date {
  const now = new Date();
  const baseDate = lastReminderDate || now;

  switch (frequency) {
    case 'daily':
      return new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, baseDate.getDate());
    case 'quarterly':
      return new Date(baseDate.getFullYear(), baseDate.getMonth() + 3, baseDate.getDate());
    case 'yearly':
      return new Date(baseDate.getFullYear() + 1, baseDate.getMonth(), baseDate.getDate());
    default:
      return new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  }
}

