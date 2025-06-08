import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Settings context for managing website configuration
 */
const SettingsContext = createContext();

/**
 * Custom hook to use settings context
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

/**
 * Default settings object
 */
const defaultSettings = {
  siteName: 'My Portfolio',
  siteDescription: 'Professional portfolio website showcasing my work and skills',
  siteKeywords: 'portfolio, web developer, designer, creative',
  logo: '',
  favicon: '/favicon.ico',
  primaryColor: '#3b82f6',
  secondaryColor: '#06b6d4',
  contactEmail: 'contact@example.com',
  socialLinks: {
    github: '',
    linkedin: '',
    twitter: '',
    instagram: ''
  },
  seoSettings: {
    ogImage: '',
    twitterCard: 'summary_large_image',
    googleAnalytics: '',
    googleSiteVerification: ''
  }
};

/**
 * Settings provider component
 */
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  /**
   * Load settings from Firestore
   */
  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings({ ...defaultSettings, ...data });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  /**
   * Update settings in Firestore
   * @param {object} newSettings - Updated settings object
   */
  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await setDoc(doc(db, 'settings', 'site'), updatedSettings);
      setSettings(updatedSettings);
      
      // Update favicon if logo changed
      if (newSettings.logo && newSettings.logo !== settings.logo) {
        updateFavicon(newSettings.logo);
      }
      
      // Update document title
      if (newSettings.siteName && newSettings.siteName !== settings.siteName) {
        document.title = newSettings.siteName;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  /**
   * Update favicon dynamically
   * @param {string} logoUrl - Logo URL to use as favicon
   */
  const updateFavicon = (logoUrl) => {
    try {
      // Remove existing favicon
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }
      
      // Create new favicon
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/x-icon';
      newFavicon.href = logoUrl;
      document.head.appendChild(newFavicon);
      
      // Update settings
      setSettings(prev => ({ ...prev, favicon: logoUrl }));
    } catch (error) {
      console.error('Error updating favicon:', error);
    }
  };

  /**
   * Get setting by key
   * @param {string} key - Setting key
   * @param {any} defaultValue - Default value if key not found
   */
  const getSetting = (key, defaultValue = null) => {
    const keys = key.split('.');
    let value = settings;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Listen for real-time settings updates
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings({ ...defaultSettings, ...data });
      }
    });

    return unsubscribe;
  }, []);

  // Context value
  const value = {
    settings,
    loading,
    updateSettings,
    getSetting,
    updateFavicon
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};