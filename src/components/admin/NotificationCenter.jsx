import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  FaBell, 
  FaEnvelope, 
  FaTrophy, 
  FaTools, 
  FaChartLine, 
  FaShieldAlt,
  FaDatabase,
  FaProjectDiagram,
  FaTimes,
  FaCheck,
  FaEye
} from 'react-icons/fa';

/**
 * Notification Center Component - Real-time notification display
 */
const NotificationCenter = ({ isOpen, onClose, maxNotifications = 10 }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  /**
   * Get icon for notification category
   */
  const getCategoryIcon = (category) => {
    const icons = {
      contact: FaEnvelope,
      milestone: FaTrophy,
      maintenance: FaTools,
      summary: FaChartLine,
      project: FaProjectDiagram,
      performance: FaChartLine,
      security: FaShieldAlt,
      backup: FaDatabase
    };
    
    return icons[category] || FaBell;
  };

  /**
   * Get notification color scheme
   */
  const getNotificationStyle = (type, read) => {
    const baseStyle = read ? 'opacity-75' : '';
    
    const styles = {
      success: `bg-green-50 border-green-200 text-green-800 ${baseStyle}`,
      error: `bg-red-50 border-red-200 text-red-800 ${baseStyle}`,
      warning: `bg-yellow-50 border-yellow-200 text-yellow-800 ${baseStyle}`,
      info: `bg-blue-50 border-blue-200 text-blue-800 ${baseStyle}`
    };
    
    return styles[type] || styles.info;
  };

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      showSuccess('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showError('Failed to mark notification as read');
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      showSuccess('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('Failed to delete notification');
    }
  };

  /**
   * Format notification time
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  /**
   * Handle notification action based on category
   */
  const handleNotificationAction = (notification) => {
    const { category, metadata } = notification;
    
    switch (category) {
      case 'contact':
        if (metadata?.messageId) {
          window.location.href = `/admin/dashboard/messages/${metadata.messageId}`;
        }
        break;
      case 'project':
        if (metadata?.projectId) {
          window.location.href = `/admin/dashboard/projects/edit/${metadata.projectId}`;
        }
        break;
      case 'milestone':
        if (metadata?.projectId) {
          window.location.href = `/portfolio/${metadata.projectId}`;
        }
        break;
      default:
        // Mark as read for other types
        if (!notification.read) {
          markAsRead(notification.id);
        }
    }
  };

  // Set up real-time listener
  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(maxNotifications)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notificationsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [isOpen, maxNotifications]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaBell className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 px-6">
                <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  const IconComponent = getCategoryIcon(notification.category);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getNotificationStyle(notification.type, notification.read)}`}
                      onClick={() => handleNotificationAction(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                  title="Mark as read"
                                >
                                  <FaCheck className="w-3 h-3" />
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-red-600 hover:text-red-700 p-1"
                                title="Delete"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <button
                onClick={() => window.location.href = '/admin/dashboard/notifications'}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationCenter;