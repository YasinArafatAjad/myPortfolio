import { useState, useEffect } from 'react';
import { FaStar, FaCheck, FaHeart, FaRocket, FaThumbsUp } from 'react-icons/fa';

/** 
 * Animated Review Submit Feedback Component
 * Shows beautiful animations and feedback after review submission
 */
const AnimatedReviewFeedback = ({ 
  isVisible, 
  onClose, 
  reviewData = null,
  duration = 4000 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [particles, setParticles] = useState([]);

  // Animation steps
  const steps = [
    {
      icon: FaCheck,
      title: "Review Submitted!",
      subtitle: "Thank you for your feedback",
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: FaStar,
      title: "Rating Recorded",
      subtitle: `${reviewData?.rating || 5} star${(reviewData?.rating || 5) !== 1 ? 's' : ''} - Amazing!`,
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      icon: FaHeart,
      title: "Your Voice Matters",
      subtitle: "Helping others discover great work",
      color: "from-pink-400 to-red-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      icon: FaRocket,
      title: "Published Successfully",
      subtitle: "Your review is now live!",
      color: "from-blue-400 to-purple-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    }
  ];

  // Generate floating particles
  useEffect(() => {
    if (isVisible) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2,
        color: ['text-yellow-400', 'text-pink-400', 'text-blue-400', 'text-green-400'][Math.floor(Math.random() * 4)]
      }));
      setParticles(newParticles);
    }
  }, [isVisible]);

  // Step progression
  useEffect(() => {
    if (!isVisible) return;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, duration / steps.length);

    // Auto close after duration
    const closeTimeout = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(closeTimeout);
    };
  }, [isVisible, duration, onClose, steps.length]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={`absolute ${particle.color} float-animation`}
              style={{
                left: `${particle.x}vw`,
                top: `${particle.y}vh`,
                width: particle.size,
                height: particle.size,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            >
              <FaStar className="w-full h-full" />
            </div>
          ))}
        </div>

        {/* Main Feedback Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
          {/* Animated Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${currentStepData.color} rounded-3xl opacity-10 animate-fade-in`} />

          {/* Progress Indicator */}
          <div className="relative z-10 mb-6">
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-green-500 scale-125 opacity-100' 
                      : 'bg-gray-300 scale-100 opacity-30'
                  }`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          {/* Main Icon with Pulse Animation */}
          <div className="relative z-10 flex justify-center mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className={`w-20 h-20 ${currentStepData.bgColor} rounded-full flex items-center justify-center animate-pulse`}>
              <IconComponent className={`w-10 h-10 ${currentStepData.textColor}`} />
            </div>
          </div>

          {/* Title and Subtitle with Typewriter Effect */}
          <div className="relative z-10 text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {currentStepData.title}
            </h3>
            
            <p className="text-gray-600 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {currentStepData.subtitle}
            </p>
          </div>

          {/* Review Data Display */}
          {reviewData && currentStep === 1 && (
            <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className="animate-fade-in"
                    style={{ animationDelay: `${0.8 + star * 0.1}s` }}
                  >
                    <FaStar 
                      className={`w-6 h-6 ${
                        star <= (reviewData.rating || 0) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">
                "{reviewData.comment?.substring(0, 50)}..."
              </p>
            </div>
          )}

          {/* Success Metrics */}
          {currentStep === 3 && (
            <div className="relative z-10 grid grid-cols-2 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600 animate-fade-in" style={{ animationDelay: '1s' }}>
                  <FaThumbsUp className="w-6 h-6 mx-auto mb-1" />
                </div>
                <p className="text-xs text-gray-600">Helpful Review</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 animate-fade-in" style={{ animationDelay: '1.2s' }}>
                  <FaRocket className="w-6 h-6 mx-auto mb-1" />
                </div>
                <p className="text-xs text-gray-600">Now Live</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="relative z-10 w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: '1s' }}
          >
            Continue Exploring
          </button>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-8 h-8 text-yellow-400/20 float-animation">
            <FaStar className="w-full h-full" />
          </div>

          <div className="absolute bottom-4 left-4 w-6 h-6 text-pink-400/20 float-animation-reverse">
            <FaHeart className="w-full h-full" />
          </div>
        </div>
    </div>
  );
};

export default AnimatedReviewFeedback;