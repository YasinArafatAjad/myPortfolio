import { FaQuoteLeft, FaUser } from "react-icons/fa";
import StarRating from "./StarRating";

const TestimonialCard = ({ testimonial, isActive, index }) => {
  return (
    <div
      className={`relative white rounded-3xl shadow-xl p-8 mx-4 transform transition-all duration-500 animate-fade-in ${
        isActive ? "z-10" : "z-0"
      }`}
      style={{
        minHeight: "320px",
        opacity: isActive ? 1 : 0.7,
        transform: `scale(${isActive ? 1 : 0.9})`,
        background: isActive
          ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* top line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-secondary-500 to-primary-500 rounded-t-3xl" />

      {/* Quote Icon */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <FaQuoteLeft className="w-5 h-5 text-white" />
      </div>

      {/* Rating */}
      <div className="flex justify-center mb-6 pt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <StarRating rating={testimonial.rating} size="lg" />
      </div>

      {/* Comment */}
      <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <p className="text-gray-500 text-lg leading-relaxed italic font-medium text-wrap overflow-x-auto">
          "{testimonial.comment}"
        </p>
      </div>

      {/* Author Info */}
      <div className="flex flex-col items-center justify-center gap-1.5 animate-slide-up" style={{ animationDelay: '0.6s' }}>
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
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary-400/30 rounded-full float-animation"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCard;
