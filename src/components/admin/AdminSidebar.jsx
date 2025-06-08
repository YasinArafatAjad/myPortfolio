import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  FaHome, 
  FaProjectDiagram, 
  FaEnvelope, 
  FaCog, 
  FaChartBar,
  FaTimes 
} from 'react-icons/fa';

/**
 * Admin sidebar component with navigation
 */
const AdminSidebar = ({ isOpen, onClose }) => {
  const { settings } = useSettings();
  const location = useLocation();
  const [stats, setStats] = useState({
    activeProjects: 0,
    unreadMessages: 0,
    totalViews: 0
  });

  // Navigation items
  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: FaHome,
      exact: true
    },
    {
      path: '/admin/dashboard/projects',
      label: 'Projects',
      icon: FaProjectDiagram
    },
    {
      path: '/admin/dashboard/messages',
      label: 'Messages',
      icon: FaEnvelope
    },
    {
      path: '/admin/dashboard/settings',
      label: 'Settings',
      icon: FaCog
    }
  ];

  /**
   * Fetch real-time stats for sidebar
   */
  const fetchStats = async () => {
    try {
      // Fetch projects
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch messages
      const messagesSnapshot = await getDocs(collection(db, 'messages'));
      const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate stats
      const activeProjects = projects.filter(p => p.published === true).length;
      const unreadMessages = messages.filter(m => m.read !== true).length;
      const totalViews = projects.reduce((sum, p) => sum + (parseInt(p.views) || 0), 0);

      setStats({
        activeProjects,
        unreadMessages,
        totalViews
      });
    } catch (error) {
      console.error('Error fetching sidebar stats:', error);
    }
  };

  // Fetch stats on component mount and periodically
  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Check if navigation item is active
   */
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {settings.siteName?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            <span className="font-semibold text-gray-900">
              Admin Panel
            </span>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    // Close mobile sidebar when navigating
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <IconComponent
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      active ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 px-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Active Projects</span>
                <span className="font-medium">{stats.activeProjects}</span>
              </div>
              <div className="flex justify-between">
                <span>Unread Messages</span>
                <span className={`font-medium ${stats.unreadMessages > 0 ? 'text-orange-600' : ''}`}>
                  {stats.unreadMessages}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Views</span>
                <span className="font-medium">{stats.totalViews.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Site Link */}
        <div className="absolute bottom-6 left-6 right-6">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
            View Site
          </a>
        </div>
      </motion.div>
    </>
  );
};

export default AdminSidebar;