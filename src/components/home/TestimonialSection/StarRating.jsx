import { FaStar } from 'react-icons/fa';
import { motion } from "framer-motion";

const StarRating = ({ rating, size = "md" }) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.3, delay: star * 0.1 }}
        >
          <FaStar
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StarRating