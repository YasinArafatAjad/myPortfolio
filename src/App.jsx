import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import ProjectDetail from './pages/ProjectDetail'
import Contact from './pages/Contact'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import SEOHead from './components/SEOHead'
import './App.css'

/**
 * Main App component that handles routing and provides global context
 */
function App() {
  // Performance optimization: Preload critical resources
  useEffect(() => {
    // Preload fonts and critical CSS
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="App min-h-screen flex flex-col">
      {/* Global context providers */}
      <NotificationProvider>
        <SettingsProvider>
          <AuthProvider>
            {/* Global SEO component */}
            <SEOHead />
            
            {/* Main application routes */}
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
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </SettingsProvider>
      </NotificationProvider>
    </div>
  )
}

export default App