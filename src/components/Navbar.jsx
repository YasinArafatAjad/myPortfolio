import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * Navigation bar component with responsive design and smooth animations
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettings();
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    // Reset scrolled state when route changes
    setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Navigation items
  const navItems1 = [
    { path: "/", label: "Home" },
    { path: "/portfolio", label: "Portfolio" },
  ];
  const navItems2 = [
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    { 
      path: currentUser && isAdmin ? "/admin/dashboard" : "/login", 
      label: currentUser && isAdmin ? "Dashboard" : "Login" 
    },
  ];

  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if we're on the home page
  const isHomePage = location.pathname === "/";

  return (
    <nav className="fixed top-0 w-full py-3 bg-white/95 backdrop-blur-md shadow-lg z-50 transition-all duration-300 overflow-hidden">
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-8 w-full">
            {/* left navlinks */}
            <div className="leftNavLinks h-24 w-full">
              <div className="h-full flex items-end justify-end gap-5">
                {navItems1.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-lg font-medium mb-2.5 transition-colors duration-200 hover:text-primary-500 ${
                      isActive(item.path) ? "text-primary-500" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
            {/* logo */}
            <div className="desktopLogo flex items-center justify-center w-[85rem] relative">
              <Link to="/" className="flex items-center space-x-2">
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt={settings.siteName}
                    className="h-24 object-contain"
                    loading="eager"
                  />
                ) : (
                  <img
                    src="../../public/LogoBlack.png"
                    alt="Yasin Arafat Ajad"
                    className="h-24 object-contain"
                    loading="eager"
                  />
                )}
                <span
                  className={`font-bold text-xl ${
                    scrolled || !isHomePage ? "text-gray-900" : "text-white"
                  }`}
                >
                  {settings.siteName}
                </span>
              </Link>
              <img
                className="pointer-events-none h-24 w-full absolute top-0 left-0 -z-10"
                src="../../public/logo-bg.svg"
              />
            </div>
            {/* right navlinks */}
            <div className="rightNavlinks h-24 w-full">
              <div className="h-full flex justify-start items-end gap-5">
                {navItems2.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-lg font-medium mb-2.5 transition-colors duration-200 hover:text-primary-500 ${
                      isActive(item.path) ? "text-primary-500" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Logo */}
          <Link to={"/"}>
            <img
              src="../../public/LogoBlack.png"
              alt="Yasin Arafat Ajad"
              className=" md:hidden h-16"
            />
          </Link>
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors "text-gray-700 hover:bg-gray-100"
            }`}
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`block w-5 h-0.5 bg-current transform transition-transform duration-300 ${
                  isOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-current transition-opacity duration-300 ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-current transform transition-transform duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {[...navItems1, ...navItems2].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "text-primary-500 bg-primary-50"
                      : "text-gray-700 hover:text-primary-500 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
