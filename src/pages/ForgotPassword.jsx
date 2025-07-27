import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';
import SEOHead from '../components/SEOHead';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';

/**
 * Forgot Password page component
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { showSuccess, showError } = useNotification();
  const { settings } = useSettings();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showError('Please enter your email address.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      showSuccess('Password reset email sent! Check your inbox.');
    } catch (error) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Forgot Password"
        description="Reset your admin password"
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
            {/* Back to Login Link */}
            <div className="mb-6">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors group"
              >
                <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Login</span>
              </Link>
            </div>

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
                Reset Password
              </h1>
              <p className="text-gray-600 mt-2">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {!emailSent ? (
              /* Reset Password Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input pl-10"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
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
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Reset Email'
                  )}
                </motion.button>
              </form>
            ) : (
              /* Success Message */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                  >
                    Try again with different email
                  </button>
                </div>
              </motion.div>
            )}

            {/* Additional Help */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Back to Home Link */}
            <div className="mt-6 text-center">
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
              🔒 Password reset links expire after 1 hour for security
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;