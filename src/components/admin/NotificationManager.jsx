import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNotification } from '../../contexts/NotificationContext';
import { FaBell, FaTrash, FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa';

/**
 * Notification manager component for admin dashboard
 */
const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { showSuccess, showError } = useNotification();

  /**
   * Fetch notifications from Firestore
   */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Exclude any numeric 'id' field from the document data and use the actual document ID
        const { id: _, ...cleanData } = data;
        return {
          id: doc.id, // Use the actual Firestore document ID
          ...cleanData
        };
      });
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark notification as read/unread
   */
  const toggleNotificationRead = async (notificationId, currentStatus) => {
    // Validate notificationId
    if (!notificationId || typeof notificationId !== 'string' || notificationId.trim() === '') {
      console.error('Invalid notification ID:', notificationId);
      showError('Invalid notification ID');
      return;
    }

    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: !currentStatus
      });
      showSuccess(`Notification marked as ${!currentStatus ? 'read' : 'unread'}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      showError('Failed to update notification');
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId) => {
    // Validate notificationId
    if (!notificationId || typeof notificationId !== 'string' || notificationId.trim() === '') {
      console.error('Invalid notification ID:', notificationId);
      showError('Invalid notification ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      showSuccess('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('Failed to delete notification');
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      );
      
      await Promise.all(updatePromises);
      showSuccess('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      showError('Failed to mark all notifications as read');
    }
  };

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <FaTimes className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <FaInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  /**
   * Filter notifications based on current filters
   */
  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(notification =>
        filterStatus === 'read' ? notification.read : !notification.read
      );
    }

    return filtered;
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Manage system notifications and alerts
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-primary"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="form-label">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <FaBell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {notifications.length === 0 
                ? 'No notifications have been received yet.' 
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleNotificationRead(notification.id, notification.read)}
                      className={`p-2 rounded-lg transition-colors ${
                        notification.read
                          ? 'text-gray-400 hover:bg-gray-100'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title={notification.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {notification.read ? (
                        <FaBell className="w-4 h-4" />
                      ) : (
                        <FaCheck className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;