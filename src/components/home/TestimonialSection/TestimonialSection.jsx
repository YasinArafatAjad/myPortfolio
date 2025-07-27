import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CountUp from "react-countup";
import TestimonialCard from "./TestimonialCard";
import { useInView } from "react-intersection-observer";

// Individual Testimonial Card Component
// const TestimonialCard = ({ testimonial, isActive, index }) => {
//   return (
//     <motion.div
//       initial={{
//         opacity: 0,
//         scale: 0.8,
//         y: 50,
//       }}
//       animate={{
//         opacity: isActive ? 1 : 0.7,
//         scale: isActive ? 1 : 0.9,
//         y: 0,
//       }}
//       transition={{ duration: 0.6, delay: index * 0.1 }}
//       className={`relative  white rounded-3xl shadow-xl p-8 mx-4 transform transition-all duration-500 ${
//         isActive ? "z-10" : "z-0"
//       }`}
//       style={{
//         minHeight: "320px",
//         background: isActive
//           ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
//           : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
//       }}
//     >
//       {/* top line */}
//       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-purple-500 rounded-t-3xl" />

//       {/* Quote Icon */}
//       <motion.div
//         initial={{ scale: 0, rotate: -45 }}
//         animate={{ scale: 1, rotate: 0 }}
//         transition={{ duration: 0.5, delay: 0.3 }}
//         className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg"
//       >
//         <FaQuoteLeft className="w-5 h-5 text-white" />
//       </motion.div>

//       {/* Rating */}
//       <motion.div
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.5, delay: 0.4 }}
//         className="flex justify-center mb-6 pt-6"
//       >
//         <StarRating rating={testimonial.rating} size="lg" />
//       </motion.div>

//       {/* Comment */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.5 }}
//         className="text-center mb-8"
//       >
//         <p className="text-gray-500 text-lg leading-relaxed italic font-medium text-wrap overflow-x-auto">
//           "{testimonial.comment}"
//         </p>
//       </motion.div>

//       {/* Author Info */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.6 }}
//         className="flex flex-col items-center justify-center gap-1.5"
//       >
//         <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
//           <FaUser className="w-6 h-6 text-white" />
//         </div>
//         <div className="text-center">
//           <h4 className="font-bold text-gray-900 text-lg">
//             {testimonial.name}
//           </h4>
//           <p className="text-gray-500 text-sm">{testimonial.email}</p>
//           {!testimonial.projectTitle == "" && (
//             <p className="text-primary-600 text-sm font-medium">
//               Project: {testimonial.projectTitle}
//             </p>
//           )}
//         </div>
//       </motion.div>

//       {/* Floating Particles */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <motion.div
//             key={i}
//             animate={{
//               y: [0, -20, 0],
//               x: [0, Math.random() * 10 - 5, 0],
//               opacity: [0.3, 0.8, 0.3],
//             }}
//             transition={{
//               duration: 3 + Math.random() * 2,
//               repeat: Infinity,
//               delay: Math.random() * 2,
//               ease: "easeInOut",
//             }}
//             className="absolute w-2 h-2 bg-primary-400/30 rounded-full"
//             style={{
//               top: `${Math.random() * 100}%`,
//               left: `${Math.random() * 100}%`,
//             }}
//           />
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// Main Testimonial Section Component
const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  const [stateRef, stateInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  /**
   >> Fetch testimonials from Firestore
   */
  const fetchTestimonials = async () => {
    try {
      setLoading(true);

      // First, try to get all approved reviews without orderBy to avoid composite index requirement
      const q = query(
        collection(db, "reviews"),
        where("approved", "==", true)
        // limit(50) // Get more to filter client-side
      );

      const querySnapshot = await getDocs(q);
      const allApprovedReviews = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          projectTitle: data.projectTitle || "",
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      // Filter for testimonials and sort client-side
      const testimonialsData = allApprovedReviews
        .filter((review) => review.isTestimonial === true)
        .sort((a, b) => b.createdAt - a.createdAt); // Sort by date descending
      // .slice(0, 10); // Limit to 10 testimonials

      setTestimonials(testimonialsData);
    } catch (error) {
      console.error("Error fetching testimonials:", error);

      // Final fallback: try to get any reviews at all
      try {
        const fallbackQuery = query(collection(db, "reviews"), limit(20));

        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackData = fallbackSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              projectTitle: data.projectTitle || "",
              createdAt: data.createdAt?.toDate() || new Date(),
            };
          })
          .filter(
            (review) =>
              review.approved === true && review.isTestimonial === true
          )
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 10);

        setTestimonials(fallbackData);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        setTestimonials([]);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   >> Auto-play functionality
   */
  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // loop 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, testimonials.length]);

  /**
   >> Navigation functions
   */
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const avgRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => sum + t.rating, 0) /
          testimonials.length
        ).toFixed(1)
      : "5";
  const happyClients = testimonials.length;

  // Don't render if no testimonials
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container-custom">
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary-600 border-b-transparent border-l-transparent rounded-t-full rounded-r-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't render section if no testimonials
  }

  return (
    <section className="py-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-secondary-100 px-6 py-3 rounded-full mb-6 animate-fade-in">
            <FaStar className="w-5 h-5 text-primary-600" />
            <span className="text-primary-700 font-semibold">
              Client Testimonials
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            What Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take my word for it. Here's what clients have to say
            about working with me and the results we've achieved together.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Testimonial Display */}
          <div className="relative h-96 flex items-center justify-center">
            <div className="w-full max-w-2xl transition-all duration-600 ease-in-out">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`${index === currentIndex ? 'block' : 'hidden'}`}
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    isActive={true}
                    index={0}
                  />
                </div>
              ))}
            </div>
            {/* <div className="w-full max-w-2xl">
                <TestimonialCard
                  testimonial={testimonials[currentIndex]}
                  isActive={true}
                  index={0}
                />
            </div> */}
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-zinc-50 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-secondary-600 p-4 rounded-full shadow-xl transition-all duration-300 z-20"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-primary-600 p-4 rounded-full shadow-xl transition-all duration-300 z-20"
              >
                <FaChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary-600 scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div
          ref={stateRef}
          className={`grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 mt-20 ${stateInView ? 'animate-slide-up' : 'opacity-0'}`}
          style={{ animationDelay: '0.4s' }}
        >
          <div className="text-center scale-150 md:scale-100">
            {stateInView && (
              <div className="text-4xl font-bold text-primary-600 mb-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                {/* {testimonials.length}+ */}
                <CountUp
                  start={0}
                  end={happyClients}
                  duration={6}
                  separator=","
                  delay={2}
                />{" "}
                <span>+</span>
              </div>
            )}
            <p className="text-gray-600 font-medium">Happy Clients</p>
          </div>

          <div className="text-center scale-150 md:scale-100">
            {stateInView && (
              <div className="text-4xl font-bold text-secondary-600 mb-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <CountUp
                  start={0}
                  end={avgRating}
                  duration={4}
                  separator=","
                  decimals={2}
                  decimal="."
                  delay={2}
                />
              </div>
            )}
            <p className="text-gray-600 font-medium">Average Rating</p>
          </div>

          <div className="text-center scale-150 md:scale-100">
            {stateInView && (
              <div className="text-4xl font-bold text-green-600 mb-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <CountUp
                  start={0}
                  end={99.67}
                  duration={8}
                  separator=","
                  decimals={2}
                  decimal="."
                  delay={2}
                ></CountUp>
              </div>
            )}
            <p className="text-gray-600 font-medium">Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
