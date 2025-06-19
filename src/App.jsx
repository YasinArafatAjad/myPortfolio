import { Routes, Route, Suspense } from 'react-router-dom'
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

// Lazy load heavy components
import { 
  AdminDashboard, 
  AdminLogin, 
  ProjectDetail 
} from './components/LazyComponents'

import './App.css'

/**
 * Loading fallback component
 */
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="text-center">
      <div className="spinner mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

/**
 * Business notifications wrapper component
 */
const BusinessNotificationsWrapper = ({ children }) => {
  useBusinessNotifications();
  return children;
};

/**
 * Main App component with lazy loading and performance optimizations
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
              
              <Suspense fallback={<LoadingFallback />}>
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
                        <Suspense fallback={<LoadingFallback message="Loading project details..." />}>
                          <ProjectDetail />
                        </Suspense>
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
                  
                  {/* Admin routes - Lazy loaded */}
                  <Route path="/login" element={
                    <Suspense fallback={<LoadingFallback message="Loading admin login..." />}>
                      <AdminLogin />
                    </Suspense>
                  } />
                  
                  <Route path="/admin/dashboard/*" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback message="Loading admin dashboard..." />}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BusinessNotificationsWrapper>
          </AuthProvider>
        </SettingsProvider>
      </NotificationProvider>
    </div>
  )
}

export default App