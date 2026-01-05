'use client';

import { useState, useEffect } from 'react';
import NotificationDisplay from '@/components/NotificationDisplay';
import useBrowserNotification from '@/components/BrowserNotification';

const NotificationTestPage = () => {
  const { permission, requestPermission, showNotification, showTaskReminderNotification, isSupported } = useBrowserNotification();
  const [taskTitle, setTaskTitle] = useState('Test Task');
  const [notificationBody, setNotificationBody] = useState('This is a test notification');

  const handleTestNotification = () => {
    if (permission === 'granted') {
      showNotification({
        title: 'Test Notification',
        body: notificationBody,
        icon: '/favicon.ico',
      });
    } else {
      alert('Please enable notifications first');
    }
  };

  const handleTaskReminder = () => {
    if (permission === 'granted') {
      showTaskReminderNotification(taskTitle, `Time to work on: ${taskTitle}`);
    } else {
      alert('Please enable notifications first');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Notification Test Page</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Notification Status</h2>
        <div className="p-4 bg-gray-100 rounded">
          <p>Supported: {isSupported ? 'Yes' : 'No'}</p>
          <p>Permission: {permission}</p>
        </div>
      </div>

      <NotificationDisplay taskTitle="Sample Task" />

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Custom Notification</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Notification Body:</label>
            <input
              type="text"
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter notification message"
            />
          </div>
          <button
            onClick={handleTestNotification}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Send Test Notification
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Task Reminder</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Task Title:</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter task title"
            />
          </div>
          <button
            onClick={handleTaskReminder}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Send Task Reminder
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Request Permission</h2>
        <button
          onClick={requestPermission}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Request Notification Permission
        </button>
      </div>
    </div>
  );
};

export default NotificationTestPage;