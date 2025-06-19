import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: `${particle.x}vw`,
                y: `${particle.y}vh`
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: `${particle.y - 20}vh`,
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute ${particle.color}`}
              style={{
                width: particle.size,
                height: particle.size
              }}
            >
              <FaStar className="w-full h-full" />
            </motion.div>
          ))}
        </div>

        {/* Main Feedback Card */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 300,
            duration: 0.6
          }}
          className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Background Gradient */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-br ${currentStepData.color} rounded-3xl`}
          />

          {/* Progress Indicator */}
          <div className="relative z-10 mb-6">
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ 
                    scale: index <= currentStep ? 1.2 : 0.8,
                    opacity: index <= currentStep ? 1 : 0.3,
                    backgroundColor: index <= currentStep ? '#10B981' : '#E5E7EB'
                  }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="w-3 h-3 rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Main Icon with Pulse Animation */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              damping: 10, 
              stiffness: 200,
              delay: 0.2 
            }}
            className="relative z-10 flex justify-center mb-6"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0.4)",
                  "0 0 0 20px rgba(59, 130, 246, 0)",
                  "0 0 0 0 rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`w-20 h-20 ${currentStepData.bgColor} rounded-full flex items-center justify-center`}
            >
              <IconComponent className={`w-10 h-10 ${currentStepData.textColor}`} />
            </motion.div>
          </motion.div>

          {/* Title and Subtitle with Typewriter Effect */}
          <div className="relative z-10 text-center mb-6">
            <motion.h3
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {currentStepData.title}
            </motion.h3>
            
            <motion.p
              key={`subtitle-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-gray-600"
            >
              {currentStepData.subtitle}
            </motion.p>
          </div>

          {/* Review Data Display */}
          {reviewData && currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.div
                    key={star}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.8 + star * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <FaStar 
                      className={`w-6 h-6 ${
                        star <= (reviewData.rating || 0) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">
                "{reviewData.comment?.substring(0, 50)}..."
              </p>
            </motion.div>
          )}

          {/* Success Metrics */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="relative z-10 grid grid-cols-2 gap-4 mb-6"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="text-2xl font-bold text-green-600"
                >
                  <FaThumbsUp className="w-6 h-6 mx-auto mb-1" />
                </motion.div>
                <p className="text-xs text-gray-600">Helpful Review</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="text-2xl font-bold text-blue-600"
                >
                  <FaRocket className="w-6 h-6 mx-auto mb-1" />
                </motion.div>
                <p className="text-xs text-gray-600">Now Live</p>
              </div>
            </motion.div>
          )}

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            onClick={onClose}
            className="relative z-10 w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Continue Exploring
          </motion.button>

          {/* Decorative Elements */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-4 right-4 w-8 h-8 text-yellow-400/20"
          >
            <FaStar className="w-full h-full" />
          </motion.div>

          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-4 left-4 w-6 h-6 text-pink-400/20"
          >
            <FaHeart className="w-full h-full" />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedReviewFeedback;