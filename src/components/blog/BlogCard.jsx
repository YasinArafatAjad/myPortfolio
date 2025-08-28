import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaRegClock, FaUserAlt, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { getOptimizedImageUrl } from "../../config/cloudinary";

// Star Rating Display (optional)
const StarRating = ({ rating, size = "sm", showValue = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar
            key={`full-${i}`}
            className={`${sizeClasses[size]} text-yellow-400`}
          />
        ))}
        {hasHalfStar && (
          <FaStarHalfAlt className={`${sizeClasses[size]} text-yellow-400`} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar
            key={`empty-${i}`}
            className={`${sizeClasses[size]} text-gray-300`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

// BlogCard Component
const BlogCard = ({ blog, index = 0 }) => {
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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div className="relative h-[500px] bg-white rounded-2xl overflow-hidden shadow transition-all duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative overflow-hidden h-56 bg-gray-100">
          {!blog.banner || imageError ? (
            <div className="flex flex-col items-center justify-center py-16 h-64 text-gray-600">
              <FaRegClock className="w-16 h-16 mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2">No Image</h3>
            </div>
          ) : (
            <img
              src={blog.banner}
              alt={blog.title}
              className="w-full h-64 object-cover pointer-events-none"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>

        {/* Content */}
        <div className="p-6 relative z-10">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {blog.article
              ?.replace(/<[^>]*>/g, " ") // strip tags
              .trim()
              .split(/\s+/)
              .slice(0, 15)
              .join(" ") + "..."}
          </p>

          {/* Author & Reading time */}
          <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
            <div className="flex items-center space-x-2">
              <FaUserAlt /> <span>{blog.author}</span>
            </div>
            {/* <div className="flex items-center space-x-2">
              <FaRegClock /> <span>{blog.readingTime || "5 min"} read</span>
            </div> */}
          </div>

          {/* Optional Rating */}
          {/* {blog.rating && (
            <div className="mb-4">
              <StarRating rating={blog.rating} size="sm" />
            </div>
          )} */}

          {/* Read More */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={`/blog/${blog.id}`}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1 transition-colors"
            >
              <span>Read More</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlogCard;
