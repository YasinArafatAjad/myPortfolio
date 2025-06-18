import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useBusinessNotifications } from '../hooks/useBusinessNotifications';
import SEOHead from '../components/SEOHead';
import { FaArrowLeft, FaExternalLinkAlt, FaGithub, FaEye, FaImage } from 'react-icons/fa';

/**
 * Project Image Component with fallback handling
 */
const ProjectImage = ({ project }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100" style={{ minHeight: '400px' }}>
      {/* Loading State */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <div className="text-gray-400 flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span>Loading image...</span>
          </div>
        </div>
      )}
      
      {/* Error/No Image Fallback */}
      {(imageError || !project.imageUrl) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
          <FaImage className="w-20 h-20 mb-4 text-gray-400" />
          <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
          <p className="text-lg text-gray-500 mb-4">{project.category}</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-md mb-4">
            {project.technologies?.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Project Image */}
      {project.imageUrl && !imageError && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className={`w-full h-auto max-h-[70vh] object-contain bg-white transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            minHeight: '400px',
            maxHeight: '70vh'
          }}
        />
      )}
      
      {/* Image Overlay with Project Links */}
     
    </div>
  );
};

/**
 * Project detail page component
 */
const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { notifyProjectMilestone } = useBusinessNotifications();

  /**
   * Fetch project details and increment view count
   */
  const fetchProject = async () => {
    try {
      setLoading(true);
      const projectDoc = await getDoc(doc(db, 'projects', id));
      
      if (projectDoc.exists()) {
        const projectData = { id: projectDoc.id, ...projectDoc.data() };
        
        // Check if project is published
        if (!projectData.published) {
          setNotFound(true);
          return;
        }
        
        setProject(projectData);
        
        // Increment view count and check for milestones
        try {
          const newViewCount = (projectData.views || 0) + 1;
          
          await updateDoc(doc(db, 'projects', id), {
            views: increment(1)
          });

          // Check for view milestones and create notifications
          await notifyProjectMilestone(projectData, newViewCount);
          
          // Update local state
          setProject(prev => ({ ...prev, views: newViewCount }));
        } catch (error) {
          console.error('Error updating view count:', error);
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="spinner"></div>
      </div>
    );
  }

  if (notFound || !project) {
    return <Navigate to="/portfolio" replace />;
  }

  return (
    <>
      <SEOHead
        title={project.title}
        description={project.description}
        keywords={`${project.category}, ${project.technologies?.join(', ') || ''}`}
        image={project.imageUrl}
      />
      
      <div className="pt-20">
        {/* Back Navigation */}
        <section className="py-6 bg-gray-50 border-b">
          <div className="container-custom">
            <Link
              to="/portfolio"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </section>

        {/* Project Hero */}
        <section className="py-12">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-primary-600 font-medium">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    Featured Project
                  </span>
                )}
                <div className="flex items-center space-x-1 text-gray-500">
                  <FaEye className="w-4 h-4" />
                  <span className="text-sm">{project.views || 0} views</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {project.title}
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Project Image */}
        <section className="py-12">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ProjectImage project={project} />
            </motion.div>
          </div>
        </section>

        {/* Project Details */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="card"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Project Overview
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                    
                    {/* Key Features */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Key Features
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Responsive design that works seamlessly across all devices</li>
                        <li>Modern and intuitive user interface with smooth interactions</li>
                        <li>Optimized for performance, accessibility, and SEO</li>
                        <li>Built with industry best practices and clean, maintainable code</li>
                        <li>Cross-browser compatibility and progressive enhancement</li>
                      </ul>
                    </div>

                    {/* Development Process */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Development Process
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Planning & Design</h4>
                          <p className="text-sm text-gray-600">User research, wireframing, and creating detailed mockups</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Development</h4>
                          <p className="text-sm text-gray-600">Clean code implementation with modern technologies</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Testing</h4>
                          <p className="text-sm text-gray-600">Comprehensive testing across devices and browsers</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Deployment</h4>
                          <p className="text-sm text-gray-600">Optimized deployment with performance monitoring</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Technologies */}
                {project.technologies && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="card"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Project Info */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Project Info
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Category</span>
                      <span className="text-gray-900 font-medium">{project.category}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Date</span>
                      <span className="text-gray-900 font-medium">
                        {project.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Views</span>
                      <span className="text-gray-900 font-medium">{project.views || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Live
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Project Links */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Project Links
                  </h3>
                  <div className="space-y-3">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
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
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        <FaGithub className="w-4 h-4" />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </motion.div>

                {/* Share Project */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Share Project
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: project.title,
                            text: project.description,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
          <div className="container-custom text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <h2 className="text-3xl font-bold mb-6">
                Interested in Working Together?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                I'm always open to discussing new projects and opportunities.
                Let's create something amazing together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                >
                  Get in Touch
                </Link>
                <Link
                  to="/portfolio"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
                >
                  View More Projects
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProjectDetail;