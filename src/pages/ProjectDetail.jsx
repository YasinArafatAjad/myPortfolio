import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getOptimizedImageUrl } from '../config/cloudinary';
import { useBusinessNotifications } from '../hooks/useBusinessNotifications';
import SEOHead from '../components/SEOHead';
import { FaArrowLeft, FaExternalLinkAlt, FaGithub, FaEye } from 'react-icons/fa';

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
              
              <div className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                <p className="whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                    <span>View Live Demo</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-gray-400 hover:text-gray-800 transition-colors duration-200 inline-flex items-center space-x-2"
                  >
                    <FaGithub className="w-4 h-4" />
                    <span>View Source Code</span>
                  </a>
                )}
              </div>
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
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={getOptimizedImageUrl(project.imageUrl, { width: 1200, height: 600 })}
                alt={project.title}
                className="w-full h-auto object-cover"
              />
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
                    
                    {/* Additional project details can be added here */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Key Features
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Responsive design that works on all devices</li>
                        <li>Modern and clean user interface</li>
                        <li>Optimized for performance and accessibility</li>
                        <li>Built with best practices and clean code</li>
                      </ul>
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
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
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
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Category</span>
                      <p className="text-gray-900">{project.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date</span>
                      <p className="text-gray-900">
                        {project.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Views</span>
                      <p className="text-gray-900">{project.views || 0}</p>
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