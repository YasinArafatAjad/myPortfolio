import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNotification } from '../../contexts/NotificationContext';
import { FaStar, FaCheck, FaTimes, FaEye, FaTrash, FaUser, FaTrophy, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import Loader from '../Loader';

// Star Rating Display Component

const StarRating = ({ rating, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating}</span>
    </div>
  );
};

// Reviews manager component for admin dashboard

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { showSuccess, showError } = useNotification();

  //  Fetch reviews from Firestore

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  // Approve review

  const approveReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        approved: true
      });
      showSuccess('Review approved successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      showError('Failed to approve review');
    }
  };

   // Reject/Unapprove review

  const rejectReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        approved: false
      });
      showSuccess('Review rejected successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      showError('Failed to reject review');
    }
  };

   // Toggle testimonial status
  const toggleTestimonial = async (reviewId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        isTestimonial: !currentStatus
      });
      showSuccess(`Review ${!currentStatus ? 'added to' : 'removed from'} testimonials`);
      fetchReviews();
    } catch (error) {
      console.error('Error updating testimonial status:', error);
      showError('Failed to update testimonial status');
    }
  };

   // Delete review
  const deleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      showSuccess('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      showError('Failed to delete review');
    }
  };

   // Filter and sort reviews
  const getFilteredReviews = () => {
    let filtered = [...reviews];

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'approved') {
        filtered = filtered.filter(review => review.approved);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(review => !review.approved);
      } else if (filterStatus === 'testimonials') {
        filtered = filtered.filter(review => review.isTestimonial);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
        case 'oldest':
          return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

   // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = getFilteredReviews();
  const pendingCount = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;
  const testimonialCount = reviews.filter(r => r.isTestimonial).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-600 mt-1">
          Manage project reviews, ratings, and testimonials
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {pendingCount} pending approval
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaStar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaEye className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaTrophy className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Testimonials</p>
              <p className="text-2xl font-bold text-gray-900">{testimonialCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            >
              <option value="all">All Reviews</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
              <option value="testimonials">Testimonials</option>
            </select>
          </div>
          <div>
            <label className="form-label">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loader />
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <FaStar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {reviews.length === 0 
                ? 'No reviews have been submitted yet.' 
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !review.approved ? 'bg-orange-50' : review.isTestimonial ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-x-10 gap-y-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 ">
                      {/* Header */}
                      <div className="flex flex-col items-start gap-2 mb-2">
                        <h3 className="text-lg -mb-2.5 font-semibold text-gray-900">
                          {review.name}
                        </h3>
                        <StarRating rating={review.rating} size="md" />
                        <div className="flex items-center -mb-1 -ml-2">
                          {!review.approved && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Pending Approval
                            </span>
                          )}
                          {review.isTestimonial && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <FaTrophy className="w-3 h-3 mr-1" />
                              Testimonial
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="mb-3">
                        <p className="text-gray-500 text-sm leading-relaxed italic  pl-6 pr-2 py-2 inline-block relative bg-gr een-400">
                          <FaQuoteLeft className="absolute top-2 left-0 w-4 h-4 text-purple-300" />
                          {review.comment}
                        </p>
                      </div>
                      
                      {/* Email and Project */}
                      <div className="text-xs text-gray-600 flex flex-col mb-1.5">
                        <span>Email: {review.email}</span>
                        {review.projectId && (
                          <span className="">• Project ID: {review.projectId}</span>
                        )}
                      </div>                      
                      
                      
                      {/* Date */}
                      <p className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col  items-center gap-x-1 gap-y-3 ml-4 border-l">
                    {!review.approved ? (
                      <button
                        onClick={() => approveReview(review.id)}
                        className="p-2 px-4 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve review"
                      >
                        <FaCheck className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => rejectReview(review.id)}
                        className="p-2 px-4 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Unapprove review"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    )}

                    {/* Testimonial Toggle */}
                    {review.approved && (
                      <button
                        onClick={() => toggleTestimonial(review.id, review.isTestimonial)}
                        className={`p-2 px-4 rounded-lg transition-colors ${
                          review.isTestimonial
                            ? 'text-purple-600 hover:bg-purple-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={review.isTestimonial ? 'Remove from testimonials' : 'Add to testimonials'}
                      >
                        <FaTrophy className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsManager;