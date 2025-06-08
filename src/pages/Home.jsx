import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getOptimizedImageUrl } from '../config/cloudinary';
import { useSettings } from '../contexts/SettingsContext';
import SEOHead from '../components/SEOHead';

/**
 * Home page component with hero section and introduction
 */
const Home = () => {
  const { settings } = useSettings();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [aboutRef, aboutInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [cardRef, cardInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [projectsRef, projectsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  /**
   * Fetch featured projects from Firestore
   */
  const fetchFeaturedProjects = async () => {
    try {
      setLoadingProjects(true);
      const q = query(
        collection(db, 'projects'),
        where('published', '==', true),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFeaturedProjects(projectsData);
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      // If the composite index doesn't exist, fall back to fetching all projects and filtering
      try {
        const fallbackQuery = query(
          collection(db, 'projects'),
          orderBy('createdAt', 'desc')
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const allProjects = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const filteredProjects = allProjects
          .filter(project => project.published === true && project.featured === true)
          .slice(0, 3);
        
        setFeaturedProjects(filteredProjects);
      } catch (fallbackError) {
        console.error('Error with fallback query:', fallbackError);
      }
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch featured projects on component mount
  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  /**
   * Featured project card component
   */
  const FeaturedProjectCard = ({ project, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={projectsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.2 }}
        className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        {/* Project Image */}
        <div className="relative overflow-hidden">
          <img
            src={getOptimizedImageUrl(project.imageUrl, { width: 400, height: 250 })}
            alt={project.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
            <Link
              to={`/portfolio/${project.id}`}
              className="inline-flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <span>View Project</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          {/* Featured badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          </div>
        </div>

        {/* Project Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-600 font-medium">
              {project.category}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            <Link to={`/portfolio/${project.id}`}>
              {project.title}
            </Link>
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Technologies */}
          {project.technologies && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{project.technologies.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Project Links */}
          <div className="flex space-x-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>Live Demo</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>GitHub</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <SEOHead
        title="Home"
        description={settings.siteDescription}
        keywords="portfolio, home, professional"
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white relative overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-bounce-slow"></div>
          </div>

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              >
                Welcome to My
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Portfolio
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto"
              >
                {settings.siteDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  to="/portfolio"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
                >
                  View My Work
                </Link>
                <Link
                  to="/contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200 transform hover:scale-105"
                >
                  Get in Touch
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="animate-bounce">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </motion.div>
        </section>

        {/* Featured Projects Section */}
        {featuredProjects.length > 0 && (
          <section ref={projectsRef} className="py-20 bg-white">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Featured Projects
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover some of my most impactful and innovative work that showcases my skills and creativity.
                </p>
              </motion.div>

              {loadingProjects ? (
                <div className="flex justify-center items-center py-20">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredProjects.map((project, index) => (
                    <FeaturedProjectCard
                      key={project.id}
                      project={project}
                      index={index}
                    />
                  ))}
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center mt-12"
              >
                <Link
                  to="/portfolio"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span>View All Projects</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* About Preview Section */}
        <section ref={aboutRef} className="py-20 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={aboutInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About Me
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                I'm a passionate developer dedicated to creating exceptional digital experiences.
                With expertise in modern web technologies, I bring ideas to life through clean code and innovative solutions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={aboutInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              ref={cardRef}
              className="grid grid-cols-1 md:grid-cols-2 justify-items-center gap-8"
            >
              {/* Skills preview */}
              <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={cardInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }} 
              className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Frontend Development</h3>
                <p className="text-gray-600">
                  Creating responsive and interactive user interfaces with modern frameworks.
                </p>
              </motion.div>

              <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={cardInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
                className="card text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Backend Development</h3>
                <p className="text-gray-600">
                  Building robust server-side applications and APIs with scalable architectures.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={aboutInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mt-12"
            >
              <Link
                to="/about"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Learn More About Me</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;