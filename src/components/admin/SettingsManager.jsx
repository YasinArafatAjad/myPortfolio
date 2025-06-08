import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../contexts/SettingsContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { uploadToCloudinary } from '../../config/cloudinary';
import { FaSave, FaUpload, FaGlobe, FaPalette, FaSearch, FaImage, FaShieldAlt, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Settings manager component for website configuration
 */
const SettingsManager = () => {
  const { settings, updateSettings, loading } = useSettings();
  const { showSuccess, showError } = useNotification();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    siteKeywords: '',
    logo: '',
    contactEmail: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: ''
    },
    seoSettings: {
      ogImage: '',
      twitterCard: 'summary_large_image',
      googleAnalytics: '',
      googleSiteVerification: ''
    }
  });
  
  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [ogImageFile, setOgImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  /**
   * Initialize form data with current settings
   */
  useEffect(() => {
    if (settings && !loading) {
      setFormData({
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        siteKeywords: settings.siteKeywords || '',
        logo: settings.logo || '',
        contactEmail: settings.contactEmail || '',
        socialLinks: {
          github: settings.socialLinks?.github || '',
          linkedin: settings.socialLinks?.linkedin || '',
          twitter: settings.socialLinks?.twitter || '',
          instagram: settings.socialLinks?.instagram || '',
          facebook: settings.socialLinks?.facebook || ''
        },
        seoSettings: {
          ogImage: settings.seoSettings?.ogImage || '',
          twitterCard: settings.seoSettings?.twitterCard || 'summary_large_image',
          googleAnalytics: settings.seoSettings?.googleAnalytics || '',
          googleSiteVerification: settings.seoSettings?.googleSiteVerification || ''
        }
      });
    }
  }, [settings, loading]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Handle security form input changes
   */
  const handleSecurityInputChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  /**
   * Handle logo file selection
   */
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logo: previewUrl }));
    }
  };

  /**
   * Handle OG image file selection
   */
  const handleOgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOgImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        seoSettings: {
          ...prev.seoSettings,
          ogImage: previewUrl
        }
      }));
    }
  };

  /**
   * Upload images to Cloudinary
   */
  const uploadImages = async () => {
    const uploads = [];
    
    if (logoFile) {
      uploads.push(
        uploadToCloudinary(logoFile, 'settings').then(url => ({ type: 'logo', url }))
      );
    }
    
    if (ogImageFile) {
      uploads.push(
        uploadToCloudinary(ogImageFile, 'settings').then(url => ({ type: 'ogImage', url }))
      );
    }
    
    if (uploads.length === 0) return {};
    
    try {
      const results = await Promise.all(uploads);
      const uploadedUrls = {};
      
      results.forEach(result => {
        if (result.type === 'logo') {
          uploadedUrls.logo = result.url;
        } else if (result.type === 'ogImage') {
          uploadedUrls.ogImage = result.url;
        }
      });
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      // Provide more specific error message
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      showError('Please fill in all password fields');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }

    if (securityData.currentPassword === securityData.newPassword) {
      showError('New password must be different from current password');
      return;
    }

    try {
      setChangingPassword(true);

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        securityData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, securityData.newPassword);
      
      showSuccess('Password updated successfully');
      
      // Clear form
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide passwords
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Failed to change password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log back in before changing your password';
      }
      
      showError(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.siteName || !formData.siteDescription) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      // Upload images if new files selected
      let uploadedUrls = {};
      try {
        uploadedUrls = await uploadImages();
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        showError(uploadError.message || 'Failed to upload images. Please try again.');
        return;
      }
      
      // Prepare settings data
      const settingsData = {
        ...formData,
        logo: uploadedUrls.logo || formData.logo,
        seoSettings: {
          ...formData.seoSettings,
          ogImage: uploadedUrls.ogImage || formData.seoSettings.ogImage
        }
      };

      await updateSettings(settingsData);
      showSuccess('Settings updated successfully');
      
      // Clear file inputs
      setLogoFile(null);
      setOgImageFile(null);
    } catch (error) {
      console.error('Error updating settings:', error);
      showError(error.message || 'Failed to update settings');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Tab navigation component
   */
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your website configuration and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2">
          <TabButton id="general" label="General" icon={FaGlobe} />
          <TabButton id="branding" label="Branding" icon={FaPalette} />
          <TabButton id="seo" label="SEO" icon={FaSearch} />
          <TabButton id="security" label="Security" icon={FaShieldAlt} />
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Site Name *</label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleInputChange}
                  className="form-input focus:outline-none focus:ring-0"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Contact Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="form-input focus:outline-none focus:ring-0"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="form-label">Site Description *</label>
              <textarea
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleInputChange}
                rows={3}
                className="form-input focus:outline-none focus:ring-0 resize-none"
                required
              />
            </div>

            <div className="mt-6">
              <label className="form-label">Keywords (comma-separated)</label>
              <input
                type="text"
                name="siteKeywords"
                value={formData.siteKeywords}
                onChange={handleInputChange}
                className="form-input focus:outline-none focus:ring-0"
                placeholder="..."
              />
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="url"
                    name="socialLinks.github"
                    value={formData.socialLinks.github}
                    onChange={handleInputChange}
                    className="form-input focus:outline-none focus:ring-0"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleInputChange}
                    className="form-input focus:outline-none focus:ring-0"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="form-label">Twitter URL</label>
                  <input
                    type="url"
                    name="socialLinks.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleInputChange}
                    className="form-input focus:outline-none focus:ring-0"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <label className="form-label">Instagram URL</label>
                  <input
                    type="url"
                    name="socialLinks.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleInputChange}
                    className="form-input focus:outline-none focus:ring-0"
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <label className="form-label">Facebook URL</label>
                  <input
                    type="url"
                    name="socialLinks.facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleInputChange}
                    className="form-input focus:outline-none focus:ring-0"
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Branding Settings */}
        {activeTab === 'branding' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Branding</h2>
            
            {/* Logo Upload */}
            <div className="mb-8">
              <label className="form-label">Logo</label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="form-input focus:outline-none focus:ring-0"
                />
                {formData.logo && (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current logo</p>
                      <p className="text-xs text-gray-500">This will also be used as favicon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* SEO Settings */}
        {activeTab === 'seo' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">SEO Settings</h2>
            
            {/* OG Image */}
            <div className="mb-6">
              <label className="form-label">Open Graph Image</label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOgImageChange}
                  className="form-input focus:outline-none focus:ring-0"
                />
                <p className="text-sm text-gray-500">
                  Recommended size: 1200x630px. This image will be shown when your site is shared on social media.
                </p>
                {formData.seoSettings.ogImage && (
                  <div className="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={formData.seoSettings.ogImage}
                      alt="OG image preview"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Twitter Card Type</label>
                <select
                  name="seoSettings.twitterCard"
                  value={formData.seoSettings.twitterCard}
                  onChange={handleInputChange}
                  className="form-input focus:outline-none focus:ring-0"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Google Analytics ID</label>
                <input
                  type="text"
                  name="seoSettings.googleAnalytics"
                  value={formData.seoSettings.googleAnalytics}
                  onChange={handleInputChange}
                  className="form-input focus:outline-none focus:ring-0"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="form-label">Google Site Verification</label>
              <input
                type="text"
                name="seoSettings.googleSiteVerification"
                value={formData.seoSettings.googleSiteVerification}
                onChange={handleInputChange}
                className="form-input focus:outline-none focus:ring-0"
                placeholder="Verification meta tag content"
              />
            </div>
          </motion.div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
            
            {/* Account Information */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Account Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Type:</span>
                  <span className="text-sm font-medium text-green-600">Administrator</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Sign In:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentUser?.metadata?.lastSignInTime 
                      ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Password Change Form */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <FaLock className="w-4 h-4 mr-2" />
                Change Password
              </h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="form-label">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={securityData.currentPassword}
                      onChange={handleSecurityInputChange}
                      className="form-input focus:outline-none focus:ring-0 pr-10"
                      required
                      disabled={changingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">New Password *</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={securityData.newPassword}
                      onChange={handleSecurityInputChange}
                      className="form-input focus:outline-none focus:ring-0 pr-10"
                      required
                      minLength={6}
                      disabled={changingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label className="form-label">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityInputChange}
                      className="form-input focus:outline-none focus:ring-0 pr-10"
                      required
                      disabled={changingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {securityData.newPassword && securityData.confirmPassword && 
                   securityData.newPassword !== securityData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={changingPassword || !securityData.currentPassword || 
                             !securityData.newPassword || !securityData.confirmPassword ||
                             securityData.newPassword !== securityData.confirmPassword}
                    className={`btn-primary ${
                      (changingPassword || !securityData.currentPassword || 
                       !securityData.newPassword || !securityData.confirmPassword ||
                       securityData.newPassword !== securityData.confirmPassword) 
                        ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {changingPassword ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Changing Password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FaLock />
                        <span>Change Password</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Tips */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Security Tips</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use a strong password with at least 8 characters</li>
                <li>• Include uppercase, lowercase, numbers, and special characters</li>
                <li>• Don't reuse passwords from other accounts</li>
                <li>• Change your password regularly</li>
                <li>• Never share your admin credentials</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Save Button - Only show for non-security tabs */}
        {activeTab !== 'security' && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className={`btn-primary ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <FaSave />
                  <span>Save Settings</span>
                </div>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsManager;