import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';
import SEOHead from '../components/SEOHead';

/**
 * Admin login page component
 */
const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { login, register, currentUser, isAdmin } = useAuth();
  const { showError, showSuccess } = useNotification();
  const { settings } = useSettings();

  // Check if admin needs to be registered
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const [needsRegistration, setNeedsRegistration] = useState(false);

  // Redirect if already logged in as admin
  if (currentUser && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle admin registration
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError('Please fill in all fields.');
      return;
    }

    if (formData.email !== adminEmail) {
      showError('Only the configured admin email can be registered.');
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(formData.email, formData.password);
      showSuccess('Admin account created successfully! You are now logged in.');
      setNeedsRegistration(false);
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Try logging in instead.';
        setNeedsRegistration(false);
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission (login)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      // Navigation will be handled by the redirect logic above
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        if (formData.email === adminEmail) {
          setNeedsRegistration(true);
          errorMessage = 'Admin account not found. Please register first.';
        } else {
          errorMessage = 'No account found with this email address.';
        }
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Admin Login"
        description="Admin login page for portfolio management"
        noIndex={true}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-2xl p-8"
          >
            {/* Logo and Title */}
            <div className="text-center mb-8">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.siteName}
                  className="h-12 w-12 object-contain mx-auto mb-4"
                />
              ) : (
                <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">
                    {settings.siteName?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {needsRegistration ? 'Register Admin' : 'Admin Login'}
              </h1>
              <p className="text-gray-600 mt-2">
                {needsRegistration 
                  ? 'Create your admin account' 
                  : 'Sign in to manage your portfolio'
                }
              </p>
            </div>

            {/* Registration Notice */}
            {needsRegistration && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>First time setup:</strong> Create your admin account using the configured admin email.
                </p>
              </div>
            )}

            {/* Login/Register Form */}
            <form onSubmit={needsRegistration ? handleRegister : handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={needsRegistration ? adminEmail : "admin@example.com"}
                  required
                />
                {needsRegistration && (
                  <p className="text-xs text-gray-500 mt-1">
                    Must use the configured admin email: {adminEmail}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={needsRegistration ? "Create a secure password (min 6 chars)" : "Enter your password"}
                  required
                />
                {needsRegistration && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full btn-primary ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{needsRegistration ? 'Creating Account...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  needsRegistration ? 'Create Admin Account' : 'Sign In'
                )}
              </motion.button>
            </form>

            {/* Forgot Password Link */}
            {!needsRegistration && (
              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            {/* Toggle between login and register */}
            {!loading && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setNeedsRegistration(!needsRegistration);
                    setFormData({ email: '', password: '' });
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {needsRegistration 
                    ? 'Already have an account? Sign in' 
                    : 'Need to create admin account? Register'
                  }
                </button>
              </div>
            )}

            {/* Back to Home Link */}
            <div className="mt-8 text-center">
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                ← Back to Portfolio
              </a>
            </div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-400">
              🔒 This area is restricted to authorized personnel only
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;