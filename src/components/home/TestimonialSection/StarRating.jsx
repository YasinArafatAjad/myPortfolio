import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, size = "md" }) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className="animate-fade-in"
          style={{ animationDelay: `${star * 0.1}s` }}
        >
          <FaStar
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        </div>
      ))}
    </div>
  );
};

export default StarRating