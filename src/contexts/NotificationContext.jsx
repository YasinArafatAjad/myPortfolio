import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Notification context for managing app notifications
 */
const NotificationContext = createContext();

/**
 * Custom hook to use notification context
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Notification component
 */
const Notification = ({ notification, onClose }) => {
  const getNotificationStyles = (type) => {
    const baseStyles = 'p-4 rounded-lg shadow-lg max-w-sm mx-4 mb-4';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-500 text-white`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
      className={getNotificationStyles(notification.type)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <span className="text-lg mr-3 flex-shrink-0">
            {getIcon(notification.type)}
          </span>
          <div className="flex-1">
            {notification.title && (
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
            )}
            <p className="text-sm opacity-90">
              {notification.message}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-white opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Notification provider component
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Add notification
   * @param {object} notification - Notification object
   */
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  /**
   * Remove notification
   * @param {string|number} id - Notification ID
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Show success notification
   * @param {string} message - Success message
   * @param {string} title - Optional title
   */
  const showSuccess = useCallback((message, title = null) => {
    return addNotification({
      type: 'success',
      message,
      title
    });
  }, [addNotification]);

  /**
   * Show error notification
   * @param {string} message - Error message
   * @param {string} title - Optional title
   */
  const showError = useCallback((message, title = null) => {
    return addNotification({
      type: 'error',
      message,
      title,
      duration: 7000 // Longer duration for errors
    });
  }, [addNotification]);

  /**
   * Show warning notification
   * @param {string} message - Warning message
   * @param {string} title - Optional title
   */
  const showWarning = useCallback((message, title = null) => {
    return addNotification({
      type: 'warning',
      message,
      title
    });
  }, [addNotification]);

  /**
   * Show info notification
   * @param {string} message - Info message
   * @param {string} title - Optional title
   */
  const showInfo = useCallback((message, title = null) => {
    return addNotification({
      type: 'info',
      message,
      title
    });
  }, [addNotification]);

  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification container */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {notifications.map(notification => (
              <Notification
                key={notification.id}
                notification={notification}
                onClose={() => removeNotification(notification.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </NotificationContext.Provider>
  );
};