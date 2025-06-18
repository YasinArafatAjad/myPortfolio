import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNotification } from '../../contexts/NotificationContext';
import { FaStar, FaUser, FaQuoteLeft } from 'react-icons/fa';

/**
 * Interactive Star Rating Component
 */
const InteractiveStarRating = ({ rating, onRatingChange, size = 'md', readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div 
      className="flex items-center space-x-1"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || rating);
        return (
          <motion.button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-all duration-200`}
            disabled={readonly}
            whileHover={readonly ? {} : { scale: 1.1 }}
            whileTap={readonly ? {} : { scale: 0.95 }}
          >
            <FaStar
              className={`${sizeClasses[size]} transition-colors duration-200 ${
                isActive ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

/**
 * Review Form Component
 */
const ReviewForm = ({ projectId, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.rating || !formData.comment) {
      showError('Please fill in all fields and provide a rating');
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      showError('Please provide a rating between 1 and 5 stars');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reviewData = {
        ...formData,
        projectId,
        createdAt: serverTimestamp(),
        approved: false // Reviews need approval before showing
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      
      showSuccess('Thank you for your review! It will be published after approval.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        rating: 0,
        comment: ''
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">Leave a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div>
          <label className="form-label">Rating *</label>
          <div className="flex items-center space-x-4">
            <InteractiveStarRating
              rating={formData.rating}
              onRatingChange={handleRatingChange}
              size="lg"
            />
            <span className="text-sm text-gray-600">
              {formData.rating > 0 ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Click to rate'}
            </span>
          </div>
        </div>

        <div>
          <label className="form-label">Comment *</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            rows={4}
            className="form-input resize-none"
            placeholder="Share your thoughts about this project..."
            required
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className={`btn-primary w-full ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          whileHover={isSubmitting ? {} : { scale: 1.02 }}
          whileTap={isSubmitting ? {} : { scale: 0.98 }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Review'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

/**
 * Review Display Component
 */
const ReviewCard = ({ review, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative overflow-hidden"
    >
      {/* Decorative quote */}
      <div className="absolute top-4 right-4 text-primary-100">
        <FaQuoteLeft className="w-8 h-8" />
      </div>
      
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <FaUser className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Review content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{review.name}</h4>
            <InteractiveStarRating rating={review.rating} readonly size="sm" />
          </div>
          
          <p className="text-gray-600 mb-3 leading-relaxed">
            {review.comment}
          </p>
          
          <div className="text-sm text-gray-500">
            {review.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Reviews Summary Component
 */
const ReviewsSummary = ({ reviews }) => {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">Reviews Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <InteractiveStarRating rating={averageRating} readonly size="lg" />
          <div className="text-sm text-gray-600 mt-2">
            Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Rating distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-12">
                <span className="text-sm text-gray-600">{rating}</span>
                <FaStar className="w-3 h-3 text-yellow-400" />
              </div>
              
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-yellow-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Main Review System Component
 */
const ReviewSystem = ({ projectId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /**
   * Fetch approved reviews for the project
   */
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'reviews'),
        where('projectId', '==', projectId),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchReviews();
    }
  }, [projectId]);

  const handleReviewSubmitted = () => {
    setShowForm(false);
    // Note: Don't refetch reviews immediately since they need approval
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      {reviews.length > 0 && <ReviewsSummary reviews={reviews} />}
      
      {/* Add Review Button */}
      <div className="text-center">
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </motion.button>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewForm 
              projectId={projectId} 
              onReviewSubmitted={handleReviewSubmitted}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Customer Reviews ({reviews.length})
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FaStar className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to share your thoughts about this project!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;