import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ChatNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const ChatNotification: React.FC<ChatNotificationProps> = ({
  type,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(onClose, 300); // Wait for animation to complete
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-300';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-[60] transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${getColors()}`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatNotification;