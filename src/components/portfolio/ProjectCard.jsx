import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../../config/cloudinary';
import { FaImage, FaTools, FaExternalLinkAlt, FaGithub, FaEye, FaStar, FaStarHalfAlt } from 'react-icons/fa';

/**
 * Star Rating Component
 */
const StarRating = ({ rating, size = 'sm', showValue = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className={`${sizeClasses[size]} text-yellow-400`} />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <FaStarHalfAlt className={`${sizeClasses[size]} text-yellow-400`} />
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`} />
        ))}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

/**
 * Animated SVG Background Lines
 */
const AnimatedLines = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" fill="none">
        {/* Animated gradient lines */}
        <defs>
          <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="line-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Curved lines */}
        <motion.path
          d="M0,150 Q100,50 200,150 T400,150"
          stroke="url(#line-gradient-1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        <motion.path
          d="M0,200 Q150,100 300,200 T400,100"
          stroke="url(#line-gradient-2)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
        />
        
        {/* Geometric shapes */}
        <motion.circle
          cx="350"
          cy="50"
          r="30"
          stroke="url(#line-gradient-1)"
          strokeWidth="1"
          fill="none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1, delay: 1 }}
        />
        
        <motion.rect
          x="20"
          y="20"
          width="40"
          height="40"
          stroke="url(#line-gradient-2)"
          strokeWidth="1"
          fill="none"
          rx="8"
          initial={{ rotate: 0, opacity: 0 }}
          animate={{ rotate: 45, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        />
      </svg>
    </div>
  );
};

/**
 * Modern Project Card Component
 */
const ProjectCard = ({ project, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  
  // Mock review data (in real app, this would come from the project data)
  const mockReviews = {
    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
    count: Math.floor(Math.random() * 50) + 10 // Random count between 10-60
  };

  const imageUrl = getOptimizedImageUrl(project.imageUrl, { width: 400, height: 250 });

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  useEffect(() => {
    if (isHovered) {
      controls.start({
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      });
    } else {
      controls.start({
        y: 0,
        scale: 1,
        transition: { duration: 0.3, ease: "easeOut" }
      });
    }
  }, [isHovered, controls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={controls}
        className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
      >
        {/* Animated background lines */}
        <AnimatedLines />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Project Image */}
        <div className="relative overflow-hidden h-56 bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error/No image state */}
          {(imageError || !imageUrl) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <FaImage className="w-16 h-16 mb-3 text-gray-400" />
                <h4 className="font-semibold text-lg mb-1">{project.title}</h4>
                <span className="text-sm text-gray-500">{project.category}</span>
              </motion.div>
            </div>
          )}

          {/* Actual image */}
          {imageUrl && (
            <motion.img
              src={imageUrl}
              alt={project.title}
              className={`w-full h-56 object-cover transition-all duration-500 ${
                imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* Hover overlay with actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center space-x-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Link
                to={`/portfolio/${project.id}`}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <FaEye className="w-4 h-4" />
                <span>View Details</span>
              </Link>
            </motion.div>
            
            <div className="flex space-x-2">
              {project.liveUrl && (
                <motion.a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 transition-colors"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                </motion.a>
              )}
              
              {project.githubUrl && (
                <motion.a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaGithub className="w-4 h-4" />
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Status badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {project.featured && (
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
              >
                ⭐ Featured
              </motion.span>
            )}
            
            {project.underConstruction && (
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-lg"
              >
                <FaTools className="w-3 h-3 mr-1" />
                In Progress
              </motion.span>
            )}
          </div>

          {/* View count */}
          <div className="absolute top-4 right-4">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1 backdrop-blur-sm"
            >
              <FaEye className="w-3 h-3" />
              <span>{project.views || 0}</span>
            </motion.div>
          </div>
        </div>

        {/* Project Info */}
        <div className="p-6 relative z-10">
          {/* Category and Rating */}
          <div className="flex items-center justify-between mb-3">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm text-primary-600 font-semibold uppercase tracking-wide"
            >
              {project.category}
            </motion.span>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <StarRating rating={mockReviews.rating} size="sm" showValue={false} />
            </motion.div>
          </div>
          
          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2"
          >
            <Link to={`/portfolio/${project.id}`}>
              {project.title}
            </Link>
          </motion.h3>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-gray-600 mb-4 line-clamp-2 leading-relaxed"
          >
            {project.description}
          </motion.p>

          {/* Technologies */}
          {project.technologies && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <motion.span
                  key={techIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1 + techIndex * 0.1 }}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium hover:from-primary-100 hover:to-primary-200 hover:text-primary-700 transition-all duration-200"
                >
                  {tech}
                </motion.span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-xs text-gray-500 flex items-center">
                  +{project.technologies.length - 3} more
                </span>
              )}
            </motion.div>
          )}

          {/* Reviews and Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="flex items-center justify-between pt-4 border-t border-gray-100"
          >
            <div className="flex items-center space-x-2">
              <StarRating rating={mockReviews.rating} size="sm" />
              <span className="text-sm text-gray-500">
                ({mockReviews.count} reviews)
              </span>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={`/portfolio/${project.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1 transition-colors"
              >
                <span>Learn More</span>
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative corner element */}
        <div className="absolute bottom-0 right-0 w-20 h-20 overflow-hidden">
          <motion.div
            className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-tl from-primary-100 to-transparent rounded-full"
            animate={{
              scale: isHovered ? 1.5 : 1,
              opacity: isHovered ? 0.8 : 0.3,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard;