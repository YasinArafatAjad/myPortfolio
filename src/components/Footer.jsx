import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

/**
 * Footer component with social links and site information
 */
const Footer = () => {
  const { settings } = useSettings();

  // Social media icon mapping
  const socialIcons = {
    github: FaGithub,
    linkedin: FaLinkedin,
    twitter: FaTwitter,
    instagram: FaInstagram,
    facebook: FaFacebook
  };

  // Get current year
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom ">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.siteName}
                  className="h-16 w-16 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {settings.siteName?.charAt(0) || 'P'}
                  </span>
                </div>
              )}
              <span className="font-bold text-xl">
                {settings.siteName}
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              {settings.siteDescription}
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              {Object.entries(settings.socialLinks || {}).map(([platform, url]) => {
                if (!url) return null;
                
                const IconComponent = socialIcons[platform];
                if (!IconComponent) return null;
                
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    aria-label={`Visit ${platform} profile`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <nav className="space-y-2">
              <Link
                to="/"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                About
              </Link>
              <Link
                to="/portfolio"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                Portfolio
              </Link>
              <Link
                to="/contact"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
            <div className="space-y-2 text-gray-400">
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="block hover:text-white transition-colors duration-200"
                >
                  {settings.contactEmail}
                </a>
              )}
              <p className="text-sm">
                Available for freelance projects and collaborations
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} {settings.siteName}. All rights reserved.
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Made with <span className="mx-2 text-red-500 h-4 w-4" >Yasin Arafat Ajad</span></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;