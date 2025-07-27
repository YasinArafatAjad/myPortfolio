import { FaQuoteLeft, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import StarRating from "./StarRating";

const TestimonialCard = ({ testimonial, isActive, index }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
        y: 50,
      }}
      animate={{
        opacity: isActive ? 1 : 0.7,
        scale: isActive ? 1 : 0.9,
        y: 0,
      }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative  white rounded-3xl shadow-xl p-8 mx-4 transform transition-all duration-500 ${
        isActive ? "z-10" : "z-0"
      }`}
      style={{
        minHeight: "320px",
        background: isActive
          ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      {/* top line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-secondary-500 to-primary-500 rounded-t-3xl" />

      {/* Quote Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <FaQuoteLeft className="w-5 h-5 text-white" />
      </motion.div>

      {/* Rating */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-center mb-6 pt-6"
      >
        <StarRating rating={testimonial.rating} size="lg" />
      </motion.div>

      {/* Comment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-gray-500 text-lg leading-relaxed italic font-medium text-wrap overflow-x-auto">
          "{testimonial.comment}"
        </p>
      </motion.div>

      {/* Author Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col items-center justify-center gap-1.5"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
          <FaUser className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <h4 className="font-bold text-gray-900 text-lg">
            {testimonial.name}
          </h4>
          <p className="text-gray-500 text-sm">{testimonial.email}</p>
          {!testimonial.projectTitle == "" && (
            <p className="text-primary-600 text-sm font-medium">
              Project: {testimonial.projectTitle}
            </p>
          )}
        </div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
            className="absolute w-2 h-2 bg-primary-400/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
