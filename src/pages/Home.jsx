import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getOptimizedImageUrl } from '../config/cloudinary';
import { useSettings } from '../contexts/SettingsContext';
import SEOHead from '../components/SEOHead';
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaGithub, FaEye } from 'react-icons/fa';

/**
 * Animated Hero Image Component
 */
const AnimatedHeroImage = ({ src, alt, className, delay = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (imageLoaded && !imageError) {
      controls.start({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.8,
          delay: delay,
          ease: "easeOut"
        }
      });
    }
  }, [imageLoaded, imageError, controls, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={controls}
      className={`relative overflow-hidden ${className}`}
    >
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-secondary-200 animate-pulse rounded-2xl" />
      )}
      
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="w-12 h-12 bg-gray-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">IMG</span>
            </div>
            <span className="text-sm">{alt}</span>
          </div>
        </div>
      )}
      
      {src && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover rounded-2xl transition-opacity duration-300 ${
            imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      
      {/* Animated overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded && !imageError ? 0.1 : 0 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"
      />
    </motion.div>
  );
};

/**
 * Floating Project Cards Component
 */
const FloatingProjectCards = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {projects.slice(0, 6).map((project, index) => {
        const positions = [
          { top: '10%', left: '5%', size: 'w-32 h-20' },
          { top: '20%', right: '8%', size: 'w-28 h-18' },
          { top: '60%', left: '3%', size: 'w-36 h-24' },
          { bottom: '25%', right: '5%', size: 'w-30 h-20' },
          { top: '45%', left: '15%', size: 'w-24 h-16' },
          { bottom: '10%', right: '20%', size: 'w-32 h-20' }
        ];
        
        const position = positions[index] || positions[0];
        
        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0, rotate: -10 }}
            animate={{ 
              opacity: 0.8, 
              scale: 1, 
              rotate: 0,
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.8,
              delay: 1.5 + index * 0.2,
              y: {
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className={`absolute ${position.size} pointer-events-auto`}
            style={position}
          >
            <div className="relative w-full h-full group cursor-pointer">
              <AnimatedHeroImage
                src={getOptimizedImageUrl(project.imageUrl, { width: 200, height: 120 })}
                alt={project.title}
                className="w-full h-full shadow-xl hover:shadow-2xl transition-shadow duration-300"
                delay={0}
              />
              
              {/* Project info overlay */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col justify-center items-center text-white text-center p-2"
              >
                <h4 className="text-xs font-semibold mb-1 line-clamp-1">{project.title}</h4>
                <p className="text-xs opacity-80">{project.category}</p>
                <Link
                  to={`/portfolio/${project.id}`}
                  className="mt-1 text-xs bg-primary-600 hover:bg-primary-700 px-2 py-1 rounded transition-colors"
                >
                  View
                </Link>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/**
 * Animated Background Shapes
 */
const AnimatedBackgroundShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Large floating shapes */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{
          y: [0, 40, 0],
          rotate: [0, -15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-secondary-400/10 to-primary-400/10 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/2 left-10 w-48 h-48 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl"
      />
      
      {/* Smaller animated dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -Math.random() * 50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3
          }}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Modern Carousel Component for Featured Projects
 */
const FeaturedProjectsCarousel = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && projects.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === projects.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, projects.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === projects.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (projects.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[600px] overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {projects.map((project, index) => (
          <div key={project.id} className="w-full h-full flex-shrink-0 relative">
            {/* Background Image */}
            <div className="absolute inset-0">
              <AnimatedHeroImage
                src={getOptimizedImageUrl(project.imageUrl, { width: 1200, height: 600 })}
                alt={project.title}
                className="w-full h-full"
                delay={0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container-custom">
                <div className="max-w-2xl text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: index === currentIndex ? 1 : 0, y: index === currentIndex ? 0 : 50 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <span className="inline-block bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                      {project.category}
                    </span>
                    
                    <h3 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                      {project.title}
                    </h3>
                    
                    <p className="text-xl text-gray-200 mb-6 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.slice(0, 4).map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <Link
                        to={`/portfolio/${project.id}`}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>View Project</span>
                      </Link>
                      
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                        >
                          <FaExternalLinkAlt className="w-4 h-4" />
                          <span>Live Demo</span>
                        </a>
                      )}
                      
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                        >
                          <FaGithub className="w-4 h-4" />
                          <span>Source</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {projects.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-zinc-800 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200 z-20"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-zinc-800 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200 z-20"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {projects.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Parallax Background Component
 */
const ParallaxBackground = ({ children, offset = 0.5 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, offset * 100]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y: springY }}>
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Home page component with animated hero and modern carousel
 */
const Home = () => {
  const { settings } = useSettings();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  
  const [aboutRef, aboutInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [projectsRef, projectsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  /**
   * Fetch featured projects from Firestore
   */
  const fetchFeaturedProjects = async () => {
    try {
      setLoadingProjects(true);
      
      // Try the optimized query first (requires composite index)
      try {
        const q = query(
          collection(db, 'projects'),
          where('published', '==', true),
          where('featured', '==', true),
          orderBy('createdAt', 'desc'),
          limit(8) // Increased for floating cards
        );
        
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setFeaturedProjects(projectsData);
        return;
      } catch (indexError) {
        console.warn('Composite index not available, using fallback query:', indexError.message);
        
        // Fallback: Get all projects and filter client-side
        const basicQuery = query(collection(db, 'projects'));
        const basicSnapshot = await getDocs(basicQuery);
        const allProjects = basicSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter client-side for published and featured projects
        const filteredProjects = allProjects
          .filter(project => project.published === true && project.featured === true)
          .sort((a, b) => {
            const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
            const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
            return bDate - aDate;
          })
          .slice(0, 8);
        
        setFeaturedProjects(filteredProjects);
      }
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      setFeaturedProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch featured projects on component mount
  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  return (
    <>
      <SEOHead
        title="Home"
        description={settings.siteDescription}
        keywords="portfolio, home, professional"
      />
      
      <div className="min-h-screen">
        {/* Hero Section with Animated Images */}
        <section
          ref={heroRef}
          className="min-h-screen flex items-center justify-center relative overflow-hidden"
        >
          {/* Parallax Background */}
          <motion.div 
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600"
          />
          
          {/* Animated Background Shapes */}
          <AnimatedBackgroundShapes />
          
          {/* Floating Project Cards */}
          {!loadingProjects && featuredProjects.length > 0 && (
            <FloatingProjectCards projects={featuredProjects} />
          )}
          
          {/* Hero Content */}
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="container-custom relative z-10 text-white text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Animated Profile Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl"
                  >
                    <AnimatedHeroImage
                      src="/A.png"
                      alt="Profile"
                      className="w-full h-full"
                      delay={0.3}
                    />
                  </motion.div>
                  
                  {/* Animated ring around profile */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-white/30"
                  />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
              >
                <motion.span 
                  className="block"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: "linear-gradient(45deg, #ffffff, #fbbf24, #f59e0b, #ffffff)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Welcome to
                </motion.span>
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  My Portfolio
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-xl md:text-2xl mb-12 text-white/90 max-w-4xl mx-auto leading-relaxed"
              >
                {settings.siteDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/portfolio"
                    className="bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl inline-block"
                  >
                    Explore My Work
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/contact"
                    className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 backdrop-blur-sm inline-block"
                  >
                    Let's Connect
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center space-y-2"
            >
              <span className="text-sm font-medium">Scroll to explore</span>
              <motion.svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </motion.svg>
            </motion.div>
          </motion.div>
        </section>

        {/* Featured Projects Carousel Section */}
        {featuredProjects.length > 0 && (
          <ParallaxBackground offset={0.3}>
            <section ref={projectsRef} className="py-32 bg-white relative">
              <div className="container-custom">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-20"
                >
                  <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
                    Featured Projects
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Discover my most impactful and innovative work that showcases creativity, 
                    technical expertise, and problem-solving abilities.
                  </p>
                </motion.div>

                {loadingProjects ? (
                  <div className="flex justify-center items-center py-32">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <FeaturedProjectsCarousel projects={featuredProjects.slice(0, 5)} />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center mt-16"
                >
                  <Link
                    to="/portfolio"
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <span>View All Projects</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </section>
          </ParallaxBackground>
        )}

        {/* About Preview Section with Parallax */}
        <ParallaxBackground offset={0.2}>
          <section ref={aboutRef} className="py-32 bg-gradient-to-br from-gray-50 to-gray-100 relative">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={aboutInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
                  About Me
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  I'm a passionate developer dedicated to creating exceptional digital experiences.
                  With expertise in modern web technologies, I bring ideas to life through clean code, 
                  innovative solutions, and meticulous attention to detail.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Frontend Development */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={aboutInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 h-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Frontend Development</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Creating responsive and interactive user interfaces with modern frameworks like React, 
                      Vue, and Angular. Focused on performance, accessibility, and user experience.
                    </p>
                  </div>
                </motion.div>

                {/* Backend Development */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={aboutInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 h-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Backend Development</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Building robust server-side applications and APIs with scalable architectures. 
                      Experienced with Node.js, Python, databases, and cloud services.
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={aboutInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center mt-16"
              >
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <span>Learn More About Me</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </section>
        </ParallaxBackground>

        {/* Call to Action Section */}
        <ParallaxBackground offset={0.1}>
          <section className="py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white relative overflow-hidden">
            <AnimatedBackgroundShapes />
            
            <div className="container-custom text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl md:text-6xl font-bold mb-8">
                  Let's Create Something
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    Amazing Together
                  </span>
                </h2>
                <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Ready to bring your ideas to life? I'm here to help you create digital experiences 
                  that not only look great but also deliver exceptional results.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/contact"
                    className="inline-flex items-center space-x-3 bg-white text-primary-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl"
                  >
                    <span>Start a Project</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </ParallaxBackground>
      </div>
    </>
  );
};

export default Home;