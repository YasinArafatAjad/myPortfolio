import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { getOptimizedImageUrl } from "../../config/cloudinary";
import {
  FaImage,
  FaTools,
  FaExternalLinkAlt,
  FaGithub,
  FaEye,
  FaStar,
  FaStarHalfAlt,
  FaHourglassStart,
} from "react-icons/fa";
import { GiEmptyHourglass } from "react-icons/gi";

// Star Rating Display Component
const StarRating = ({ rating, size = "sm", showValue = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <FaStar
            key={`full-${i}`}
            className={`${sizeClasses[size]} text-yellow-400`}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <FaStarHalfAlt className={`${sizeClasses[size]} text-yellow-400`} />
        )}

        {/* Empty stars */}
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

// Animated SVG Background Lines
const AnimatedLines = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 300"
        fill="none"
      >
        {/* Animated gradient lines */}
        <defs>
          <linearGradient
            id="line-gradient-1"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient
            id="line-gradient-2"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Curved lines */}
        <path
          d="M0,150 Q100,50 200,150 T400,150"
          stroke="url(#line-gradient-1)"
          strokeWidth="2"
          fill="none"
          className="animate-fade-in"
        />

        <path
          d="M0,200 Q150,100 300,200 T400,100"
          stroke="url(#line-gradient-2)"
          strokeWidth="1.5"
          fill="none"
          className="animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        />

        {/* Geometric shapes */}
        <circle
          cx="350"
          cy="50"
          r="30"
          stroke="url(#line-gradient-1)"
          strokeWidth="1"
          fill="none"
          className="animate-fade-in opacity-30"
          style={{ animationDelay: '1s' }}
        />

        <rect
          x="20"
          y="20"
          width="40"
          height="40"
          stroke="url(#line-gradient-2)"
          strokeWidth="1"
          fill="none"
          rx="8"
          className="animate-fade-in opacity-20"
          style={{ animationDelay: '0.8s', transform: 'rotate(45deg)' }}
        />
      </svg>
    </div>
  );
};

// Modern Project Card Component
const ProjectCard = ({ project, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const imageUrl = getOptimizedImageUrl(project.imageUrl, {
    width: 400,
    height: 250,
  });

  // Fetch reviews for this project (now all auto-approved)
  const fetchProjectReviews = async () => {
    try {
      setReviewsLoading(true);

      // Query reviews for this specific project that are approved (all new reviews are auto-approved)
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("projectId", "==", project.id),
        where("approved", "==", true)
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(reviewsData);
      setReviewCount(reviewsData.length);

      // Calculate average rating
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const avgRating = totalRating / reviewsData.length;
        setAverageRating(avgRating);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Error fetching project reviews:", error);
      setReviews([]);
      setReviewCount(0);
      setAverageRating(0);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };


  // Fetch reviews when component mounts
  useEffect(() => {
    if (project.id) {
      fetchProjectReviews();
    }
  }, [project.id]);

  return (
    <div
      className="group relative animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
        {/* Animated background lines */}
        <AnimatedLines />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Project Image */}
        <div className="relative overflow-hidden h-56 bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Status badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {project.underConstruction && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-lg animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <FaTools className="w-3 h-3 mr-1" />
                In Progress
              </span>
            )}
          </div>
          {/* View count */}
          <div className="absolute top-4 right-4">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <FaEye className="w-3 h-3" />
              <span>{project.views || 0}</span>
            </div>
          </div>
          {/* Project image with Fallback */}
          {!project.imageUrl || project.imageUrl === "" ? (
            <div className="flex flex-col items-center justify-center py-16 h-56 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
              <FaImage className="w-20 h-20 mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2">No Image Found</h3>
            </div>
          ) : (
            <>              
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-56 pointer-events-none"
              />
            </>
          )}
        </div>

        {/* Project Info */}
        <div className="p-6 relative z-10">
          {/* Category  */}
          <div className="flex items-center justify-between min-h-[2.5rem] mb-3">
            <span className="text-sm text-primary-600 font-semibold uppercase tracking-wide animate-fade-in" style={{ animationDelay: '0.5s' }}>
              Category: {project.category}
            </span>

            {/* Featured Badge */}
            {project.featured && (
              <span className="flex gap-1 items-center bg-green-400 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg animate-slide-up">
                <GiEmptyHourglass size={20} /> <span>Featured</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <Link to={`/portfolio/${project.id}`}>{project.title}</Link>
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed animate-fade-in" style={{ animationDelay: '0.8s' }}>
            {project.description}
          </p>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4 animate-slide-up" style={{ animationDelay: '0.9s' }}>
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium hover:from-primary-100 hover:to-primary-200 hover:text-primary-700 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${1 + techIndex * 0.1}s` }}
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-xs text-gray-500 flex items-center">
                  +{project.technologies.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <div className="h-[1.6rem] mb-4" /> // to balance card height
          )}

          {/* Reviews and Rating */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <div className="flex items-center space-x-2">
              {reviewsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : reviewCount > 0 ? (
                <>
                  <StarRating rating={averageRating} size="sm" />
                  <span className="text-sm text-gray-500">
                    ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">No reviews yet</span>
              )}
            </div>

            <div className="hover:scale-105 transition-transform duration-200">
              <Link
                to={`/portfolio/${project.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1 transition-colors"
              >
                <span>Learn More</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
