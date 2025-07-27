import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useNotification } from "../../contexts/NotificationContext";
import AnimatedReviewFeedback from "./AnimatedReviewFeedback";
import { FaStar, FaUser, FaQuoteLeft, FaPaperPlane } from "react-icons/fa";

/**
 * Interactive Star Rating Component with Enhanced Animations
 */
const InteractiveStarRating = ({
  rating,
  onRatingChange,
  size = "md",
  readonly = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      setIsAnimating(true);
      onRatingChange(starRating);
      setTimeout(() => setIsAnimating(false), 300);
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
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            className={`${
              readonly ? "cursor-default" : "cursor-pointer"
            } transition-all duration-200 relative hover:scale-110`}
            disabled={readonly}
          >
            <FaStar
              className={`${sizeClasses[size]} transition-all duration-200 ${
                isActive ? "text-yellow-400 drop-shadow-lg" : "text-gray-300"
              }`}
            />
            {isActive && !readonly && (
              <div className="absolute inset-0 pointer-events-none animate-ping">
                <FaStar className={`${sizeClasses[size]} text-yellow-400`} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Enhanced Review Form Component with Modern Animations
 */
const ReviewForm = ({ projectId, projectTitle, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const { showSuccess, showError } = useNotification();

  const formSteps = [
    {
      field: "name",
      label: "Your Name",
      type: "text",
      placeholder: "Enter your name",
    },
    {
      field: "email",
      label: "Email Address",
      type: "email",
      placeholder: "your@email.com",
    },
    { field: "rating", label: "Your Rating", type: "rating" },
    {
      field: "comment",
      label: "Your Review",
      type: "textarea",
      placeholder: "Share your thoughts about this project...",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.rating ||
      !formData.comment
    ) {
      showError("Please fill in all fields and provide a rating");
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      showError("Please provide a rating between 1 and 5 stars");
      return;
    }

    try {
      setIsSubmitting(true);

      const reviewData = {
        ...formData,
        projectId,
        projectTitle,
        createdAt: serverTimestamp(),
        approved: true, // Auto-approve reviews - no admin approval needed
      };

      await addDoc(collection(db, "reviews"), reviewData);

      // Show animated feedback instead of simple notification
      setShowFeedback(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        rating: 0,
        comment: "",
      });
      setCurrentStep(0);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step) => {
    const field = formSteps[step].field;
    if (field === "rating") return formData.rating > 0;
    return formData[field] && formData[field].trim() !== "";
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 relative overflow-hidden animate-fade-in">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-gray-100 to-blue-100" />

        <div className="relative z-10">
          <div className="text-center mb-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              <FaStar className="w-6 h-6 text-yellow-400 mr-2" />
              Leave a Review
            </h3>
            <p className="text-gray-600">
              Share your experience with this project
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {formSteps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / formSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="min-h-[120px] transition-all duration-300">
              <div key={currentStep} className="animate-slide-up">
                {formSteps[currentStep].type === "rating" ? (
                  <div className="text-center">
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      {formSteps[currentStep].label} *
                    </label>
                    <div className="flex justify-center mb-4">
                      <InteractiveStarRating
                        rating={formData.rating}
                        onRatingChange={handleRatingChange}
                        size="lg"
                      />
                    </div>
                    <p className={`text-sm text-gray-600 transition-opacity duration-300 ${formData.rating > 0 ? 'opacity-100' : 'opacity-0'}`}>
                      {formData.rating > 0 && (
                        <>
                          {formData.rating === 5 && "Outstanding! 🌟"}
                          {formData.rating === 4 && "Great work! 👏"}
                          {formData.rating === 3 && "Good project! 👍"}
                          {formData.rating === 2 && "Needs improvement 🤔"}
                          {formData.rating === 1 && "Could be better 💭"}
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      {formSteps[currentStep].label} *
                    </label>
                    {formSteps[currentStep].type === "textarea" ? (
                      <textarea
                        name={formSteps[currentStep].field}
                        value={formData[formSteps[currentStep].field]}
                        onChange={handleInputChange}
                        onFocus={() =>
                          setFocusedField(formSteps[currentStep].field)
                        }
                        onBlur={() => setFocusedField(null)}
                        rows={4}
                        className={`w-full px-4 py-3 border-2 rounded-xl resize-none transition-all duration-300 ${
                          focusedField === formSteps[currentStep].field
                            ? "border-blue-500 ring-4 ring-blue-100"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder={formSteps[currentStep].placeholder}
                        required
                      />
                    ) : (
                      <input
                        type={formSteps[currentStep].type}
                        name={formSteps[currentStep].field}
                        value={formData[formSteps[currentStep].field]}
                        onChange={handleInputChange}
                        onFocus={() =>
                          setFocusedField(formSteps[currentStep].field)
                        }
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                          focusedField === formSteps[currentStep].field
                            ? "border-blue-500 ring-4 ring-blue-100"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder={formSteps[currentStep].placeholder}
                        required
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              {currentStep < formSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isStepValid(currentStep)
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !isStepValid(currentStep)}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    isSubmitting || !isStepValid(currentStep)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-4 h-4" />
                      <span>Publish Review</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Animated Feedback Modal */}
      <AnimatedReviewFeedback
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}
        reviewData={formData}
        duration={5000}
      />
    </>
  );
};

/**
 * Enhanced Review Display Component
 */
const ReviewCard = ({ review, index = 0 }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 overflow-hidden w-[80%] lg:w-[65%] mx-auto relative hover:-translate-y-1 transition-transform duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* top line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="flex flex-col md:flex-row items-start gap-x-4 gap-y-2">
        {/* Avatar */}
        <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <FaUser className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Review content */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{review.name}</h4>
            <div>
              <InteractiveStarRating
                rating={review.rating}
                readonly
                size="sm"
              />
            </div>
          </div>

          <div className="text-sm text-gray-500 relative mb-4 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.5}s` }}>
            <div className="absolute top-0 left-0 text-primary-100">
              <FaQuoteLeft className="w-8 h-8" />
            </div>
            <p className="text-gray-600 leading-relaxed ml-10">
              {review.comment}
            </p>
          </div>

          <div className="text-sm text-gray-500 animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.6}s` }}>
            {review.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Reviews Summary Component
 */
const ReviewsSummary = ({ reviews }) => {
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 relative overflow-hidden animate-fade-in">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-gray-50 to-yellow-100" />

      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
          <FaStar className="w-6 h-6 text-yellow-400 mr-2" />
          Reviews Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
              {averageRating.toFixed(1)}
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <InteractiveStarRating
                rating={averageRating}
                readonly
                size="lg"
              />
            </div>
            <div className="text-sm text-gray-600 mt-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Rating distribution */}
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }, index) => (
              <div
                key={rating}
                className="flex items-center space-x-3 animate-slide-up"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm text-gray-600 font-medium">
                    {rating}
                  </span>
                  <FaStar className="w-3 h-3 text-yellow-400" />
                </div>

                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                    style={{ 
                      width: `${percentage}%`,
                      transition: 'width 1s ease-in-out',
                      transitionDelay: `${1 + index * 0.1}s`
                    }}
                  />
                </div>

                <span className="text-sm text-gray-600 w-8 font-medium">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Review System Component with Enhanced UI
 */
const ReviewSystem = ({ projectId, projectTitle }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /**
   * Fetch all approved reviews for the project
   */
  const fetchReviews = async () => {
    try {
      setLoading(true);

      try {
        const q = query(
          collection(db, "reviews"),
          where("projectId", "==", projectId),
          where("approved", "==", true),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReviews(reviewsData);
        return;
      } catch (indexError) {
        console.warn(
          "Composite index not available, using fallback query:",
          indexError.message
        );

        if (
          indexError.code === "failed-precondition" ||
          indexError.message.includes("index") ||
          indexError.message.includes("requires an index")
        ) {
          const fallbackQuery = query(
            collection(db, "reviews"),
            where("projectId", "==", projectId),
            where("approved", "==", true)
          );

          const querySnapshot = await getDocs(fallbackQuery);
          const reviewsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          reviewsData.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime - aTime;
          });

          setReviews(reviewsData);
        } else {
          throw indexError;
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
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
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      {reviews.length > 0 && <ReviewsSummary reviews={reviews} />}

      {/* Add Review Button */}
      <div className="text-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-8 py-4 rounded-ee-md rounded-ss-md font-bold text-lg transition-all duration-300 transform ${
            showForm
              ? "bg-gray-200 text-gray-700"
              : "bg-zinc-800 text-white"
          }`}
        >
          {showForm ? "Cancel Review" : "Write a Review"}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="animate-slide-up">
          <ReviewForm
            projectId={projectId}
            projectTitle={projectTitle}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 text-center animate-fade-in">
            Customer Reviews ({reviews.length})
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl animate-fade-in">
          <div className="text-gray-400 mb-6 float-animation">
            <FaStar className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No reviews yet
          </h3>
          <p className="text-gray-600 text-lg">
            Be the first to share your thoughts about this project!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;
