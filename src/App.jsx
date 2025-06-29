import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { useBusinessNotifications } from './hooks/useBusinessNotifications'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import SEOHead from './components/SEOHead'

// Import components directly (no lazy loading)
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ProjectDetail from './pages/ProjectDetail'

import './App.css'

/**
 * Business notifications wrapper component
 */
const BusinessNotificationsWrapper = ({ children }) => {
  useBusinessNotifications();
  return children;
};

/**
 * Main App component without Suspense
 */
function App() {
  // Performance optimization: Preload critical resources
  useEffect(() => {
    // Preload fonts
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);

    // Preload critical images
    const criticalImages = ['/A.png'];
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="App min-h-[100vh] flex flex-col">
      <NotificationProvider>
        <SettingsProvider>
          <AuthProvider>
            <BusinessNotificationsWrapper>
              <SEOHead />
              
              <Routes>
                {/* Public routes with navbar */}
                <Route path="/" element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Home />
                    </main>
                    <Footer />
                  </>
                } />
                
                <Route path="/about" element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <About />
                    </main>
                    <Footer />
                  </>
                } />
                
                <Route path="/portfolio" element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Portfolio />
                    </main>
                    <Footer />
                  </>
                } />
                
                <Route path="/portfolio/:id" element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ProjectDetail />
                    </main>
                    <Footer />
                  </>
                } />
                
                <Route path="/contact" element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Contact />
                    </main>
                    <Footer />
                  </>
                } />
                
                {/* Admin routes */}
                <Route path="/login" element={<AdminLogin />} />
                
                <Route path="/admin/dashboard/*" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BusinessNotificationsWrapper>
          </AuthProvider>
        </SettingsProvider>
      </NotificationProvider>
    </div>
  )
}

export default App