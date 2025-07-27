import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import Dashboard from '../components/admin/Dashboard';
import ProjectsManager from '../components/admin/ProjectsManager';
import MessagesManager from '../components/admin/MessagesManager';
import ReviewsManager from '../components/admin/ReviewsManager';
import NotificationManager from '../components/admin/NotificationManager';
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
          <main className="p-6 animate-fade-in">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="projects/*" element={<ProjectsManager />} />
              <Route path="messages/*" element={<MessagesManager />} />
              <Route path="reviews" element={<ReviewsManager />} />
              <Route path="notifications" element={<NotificationManager />} />
              <Route path="settings" element={<SettingsManager />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;