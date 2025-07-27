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
  siteName: '',
  siteDescription: 'Professional portfolio website showcasing my work and skills',
  siteKeywords: 'portfolio, web developer, designer, creative, Yasin , Arafat , Ajad , Azad , আজাদ , ইয়াসিন , আরাফাত, আরাফত , আজদ, ইসিন, araft arfat , arft, ajd',
  logo: '',
  favicon: '/LogoBlack.png',
  primaryColor: '#3b82f6',
  secondaryColor: '#06b6d4',
  contactEmail: 'yasinarafatazad173@gmail.com',
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
        const mergedSettings = { ...defaultSettings, ...data };
        setSettings(mergedSettings);
        
        // Update favicon if logo exists
        if (mergedSettings.logo) {
          updateFavicon(mergedSettings.logo);
        }
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
      // Remove all existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());
      
      // Create new favicon link elements
      const createFaviconLink = (rel, type, href) => {
        const link = document.createElement('link');
        link.rel = rel;
        if (type) link.type = type;
        link.href = href;
        return link;
      };

      // Add multiple favicon formats for better browser support
      const head = document.head;
      
      // Standard favicon
      head.appendChild(createFaviconLink('icon', 'image/x-icon', logoUrl));
      
      // PNG favicon for modern browsers
      head.appendChild(createFaviconLink('icon', 'image/png', logoUrl));
      
      // Apple touch icon for iOS devices
      head.appendChild(createFaviconLink('apple-touch-icon', null, logoUrl));
      
      // Shortcut icon for older browsers
      head.appendChild(createFaviconLink('shortcut icon', 'image/x-icon', logoUrl));      
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
        const mergedSettings = { ...defaultSettings, ...data };
        setSettings(mergedSettings);
        
        // Update favicon when settings change in real-time
        if (mergedSettings.logo) {
          updateFavicon(mergedSettings.logo);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Update document title when site name changes
  useEffect(() => {
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }, [settings.siteName]);

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