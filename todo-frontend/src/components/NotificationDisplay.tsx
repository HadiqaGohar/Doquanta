'use client';

import { useEffect, useState } from 'react';
import useBrowserNotification from './BrowserNotification';

interface NotificationDisplayProps {
  taskId?: number;
  taskTitle?: string;
  reminderTime?: string;
}


const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  taskId,
  taskTitle = 'Task Reminder',
  reminderTime
}) => {
  const {
    permission,
    requestPermission,
    showTaskReminderNotification,
    isSupported
  } = useBrowserNotification();
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  useEffect(() => {
    // Show permission banner if notifications are supported but not yet granted
    if (isSupported && permission === 'default') {
      setShowPermissionBanner(true);
    } else {
      setShowPermissionBanner(false);
    }
  }, [permission, isSupported]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setShowPermissionBanner(false);
      // Show a test notification to confirm it's working
      showTaskReminderNotification('Welcome!', 'You will now receive task reminders.');
    }
  };

  const handleShowTestNotification = () => {
    showTaskReminderNotification(taskTitle, `This is a test reminder for: ${taskTitle}`);
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Browser notifications are not supported in your browser.</p>
      </div>
    );
  }

  if (showPermissionBanner) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <div className="flex justify-between items-center">
          <p>Enable notifications to receive task reminders</p>
          <button
            onClick={handleRequestPermission}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Enable
          </button>
        </div>
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p>Notifications are enabled. You'll receive task reminders.</p>
        <button
          onClick={handleShowTestNotification}
          className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          Test Notification
        </button>
      </div>
    );
  }

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>Notifications are blocked. Please enable them in your browser settings to receive task reminders.</p>
    </div>
  );
};

export default NotificationDisplay;