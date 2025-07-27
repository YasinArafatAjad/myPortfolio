import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNotification } from '../../contexts/NotificationContext';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaReply, FaSearch, FaArrowLeft } from 'react-icons/fa';

/**
 * Messages list component
 */
const MessagesList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  /**
   * Fetch messages from Firestore
   */
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark message as read/unread
   */
  const toggleMessageRead = async (messageId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        read: !currentStatus
      });
      showSuccess(`Message marked as ${!currentStatus ? 'read' : 'unread'}`);
      fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      showError('Failed to update message');
    }
  };

  /**
   * Delete message
   */
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'messages', messageId));
      showSuccess('Message deleted successfully');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showError('Failed to delete message');
    }
  };

  /**
   * Filter and sort messages
   */
  const getFilteredMessages = () => {
    let filtered = [...messages];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(message =>
        filterStatus === 'read' ? message.read : !message.read
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
        case 'oldest':
          return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

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

  /**
   * Handle reply to message (opens email client)
   */
  const handleReply = (message) => {
    const subject = `Re: ${message.subject || 'Your message'}`;
    const body = `Hi ${message.name},\n\nThank you for your message. \n\n---\nOriginal message:\n${message.message}`;
    const mailtoUrl = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  /**
   * Handle message click
   */
  const handleMessageClick = (message) => {
    // Navigate to message detail
    navigate(`/admin/dashboard/messages/${message.id}`);

    // Mark as read if unread
    if (!message.read) {
      toggleMessageRead(message.id, false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Manage contact form submissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
        <div className="grid  grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Search</label>
            <div className="relative">
              {/* <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div>
            <label className="form-label">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div> 
        ) : getFilteredMessages().length === 0 ? (
          <div className="text-center py-12 overflow-x-auto ">
            <FaEnvelope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {messages.length === 0 ? 'No messages have been received yet.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {getFilteredMessages().map((message) => (
              <div
                key={message.id}
                className={`p-6 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!message.read ? 'bg-blue-50' : ''
                  }`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex items-center justify-between ">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {message.read ? (
                        <FaEnvelopeOpen className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FaEnvelope className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium truncate ${!message.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                          {message.name}
                        </p>
                        {!message.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        ({message.email})
                      </p>
                      <b className="text-sm text-gray-600 truncate">
                        {message.subject || 'No subject'}
                      </b>
                      <p className="text-sm text-gray-500 w-full mt-1 mb-3">
                        {message.message}
                      </p>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(message.createdAt)}
                    </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(message);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Reply"
                      >
                        <FaReply size={20}/>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={20}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        )}
      </div>
    </div>
  );
};

/**
 * Message detail view component
 */
const MessageDetail = () => {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  /**
   * Fetch message details
   */
  const fetchMessage = async () => {
    try {
      setLoading(true);
      const messageDoc = await getDoc(doc(db, 'messages', id));
      if (messageDoc.exists()) {
        setMessage({ id: messageDoc.id, ...messageDoc.data() });
      } else {
        showError('Message not found');
        navigate('/admin/dashboard/messages');
      }
    } catch (error) {
      console.error('Error fetching message:', error);
      showError('Failed to fetch message');
      navigate('/admin/dashboard/messages');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark message as read/unread
   */
  const toggleMessageRead = async (currentStatus) => {
    try {
      await updateDoc(doc(db, 'messages', id), {
        read: !currentStatus
      });
      showSuccess(`Message marked as ${!currentStatus ? 'read' : 'unread'}`);
      setMessage(prev => ({ ...prev, read: !currentStatus }));
    } catch (error) {
      console.error('Error updating message:', error);
      showError('Failed to update message');
    }
  };

  /**
   * Handle reply to message
   */
  const handleReply = () => {
    const subject = `Re: ${message.subject || 'Your message'}`;
    const body = `Hi ${message.name},\n\nThank you for your message. \n\n---\nOriginal message:\n${message.message}`;
    const mailtoUrl = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
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
    fetchMessage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Message not found</h3>
        <Link to="/admin/dashboard/messages" className="text-primary-600 hover:text-primary-700">
          Back to Messages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/dashboard/messages"
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Details</h1>
          <p className="text-gray-600 mt-1">View and respond to message</p>
        </div>
      </div>

      {/* Message Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Message Header */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">From</label>
              <p className="text-gray-900">{message.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{message.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Subject</label>
              <p className="text-gray-900">{message.subject || 'No subject'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-gray-900">{formatDate(message.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-500 block mb-2">Message</label>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => toggleMessageRead(message.read)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Mark as {message.read ? 'Unread' : 'Read'}
          </button>
          <button
            onClick={handleReply}
            className="btn-primary"
          >
            <FaReply className="mr-2" />
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main messages manager component with routing
 */
const MessagesManager = () => {
  return (
    <Routes>
      <Route index element={<MessagesList />} />
      <Route path=":id" element={<MessageDetail />} />
    </Routes>
  );
};

export default MessagesManager;