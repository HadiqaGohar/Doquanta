'use client';

import { useEffect, useState } from 'react';

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

const useBrowserNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current permission status on mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = (): Promise<NotificationPermission> => {
    return new Promise((resolve) => {
      if (!('Notification' in window)) {
        console.error('Browser does not support notifications');
        resolve('denied');
        return;
      }

      if (Notification.permission === 'granted') {
        setPermission('granted');
        resolve('granted');
        return;
      }

      if (Notification.permission === 'denied') {
        setPermission('denied');
        resolve('denied');
        return;
      }

      // Request permission
      Notification.requestPermission().then((result) => {
        setPermission(result);
        resolve(result);
      });
    });
  };

  const showNotification = (options: NotificationOptions, onClick?: () => void): void => {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.tag,
        requireInteraction: options.requireInteraction,
      });

      // Add click handler if provided
      if (onClick) {
        notification.onclick = () => {
          onClick();
          notification.close();
        };
      } else {
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const showTaskReminderNotification = (taskTitle: string, message?: string, onClick?: () => void) => {
    if (permission === 'granted') {
      showNotification({
        title: 'Task Reminder',
        body: message || `Time to work on: ${taskTitle}`,
        icon: '/favicon.ico',
        tag: `task-reminder-${Date.now()}`,
      }, onClick);
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
    showTaskReminderNotification,
    isSupported: 'Notification' in window,
  };
};

export default useBrowserNotification;