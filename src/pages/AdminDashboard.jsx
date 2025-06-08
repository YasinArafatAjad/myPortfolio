import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import Dashboard from '../components/admin/Dashboard';
import ProjectsManager from '../components/admin/ProjectsManager';
import MessagesManager from '../components/admin/MessagesManager';
import SettingsManager from '../components/admin/SettingsManager';
import SEOHead from '../components/SEOHead';

/**
 * Admin dashboard layout component
 */
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser } = useAuth();

  return (
    <>
      <SEOHead
        title="Admin Dashboard"
        description="Portfolio admin dashboard for content management"
        noIndex={true}
      />
      
      <div className="min-h-[100vh] bg-gray-50 flex">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${'lg:ml-0'}`}>
          {/* Header */}
          <AdminHeader 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={currentUser}
          />

          {/* Page Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="projects/*" element={<ProjectsManager />} />
              <Route path="messages/*" element={<MessagesManager />} />
              <Route path="settings" element={<SettingsManager />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </motion.main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;