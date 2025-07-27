import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

/**
 * 404 Not Found page component
 */
const NotFound = () => {
  return (
    <>
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist"
        noIndex={true}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600">
        <div className="text-center text-white px-4">
          <div className="animate-fade-in">
            {/* 404 Number */}
            <h1 className="text-9xl md:text-[200px] font-bold leading-none mb-4 text-white/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              404
            </h1>

            {/* Error Message */}
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Page Not Found
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
                Oops! The page you're looking for seems to have wandered off into the digital void.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Link
                to="/"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
              >
                Go Home
              </Link>
              <Link
                to="/portfolio"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200 transform hover:scale-105"
              >
                View Portfolio
              </Link>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-white/20 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <p className="text-white/70 mb-4">You might be looking for:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/about"
                  className="text-white/80 hover:text-white underline"
                >
                  About Me
                </Link>
                <Link
                  to="/portfolio"
                  className="text-white/80 hover:text-white underline"
                >
                  My Work
                </Link>
                <Link
                  to="/contact"
                  className="text-white/80 hover:text-white underline"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full animate-bounce-slow"></div>
            <div className="absolute top-1/2 left-10 w-24 h-24 bg-white/5 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-10 w-16 h-16 bg-white/5 rounded-full animate-bounce-slow"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;