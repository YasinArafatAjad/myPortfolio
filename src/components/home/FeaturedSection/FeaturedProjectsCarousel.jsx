import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { getOptimizedImageUrl } from "../../../config/cloudinary";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaGithub,
  FaEye,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const FeaturedProjectsCarousel = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && projects.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === projects.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, projects.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === projects.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (projects.length === 0) return null;

  return (
    <div
      className="relative w-full h-[25rem] overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            {/* Background Image */}
            <div
              className='absolute inset-0'
              style={{
                backgroundImage: `url("${project.imageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "top",
                backgroundRepeat: "no-repeat"
              }}
            >
              {/* <img src={project.imageUrl} alt="" /> */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container-custom">
                <div className="max-w-2xl text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: index === currentIndex ? 1 : 0,
                      y: index === currentIndex ? 0 : 50,
                    }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <span className="inline-block bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                      {project.category}
                    </span>

                    <h3 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                      {project.title}
                      {/* {project.imageUrl} */}
                    </h3>

                    <p className="text-xl text-gray-200 mb-6 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies
                          .slice(0, 4)
                          .map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <Link
                        to={`/portfolio/${project.id}`}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>View Project</span>
                      </Link>

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                        >
                          <FaExternalLinkAlt className="w-4 h-4" />
                          <span>Live Demo</span>
                        </a>
                      )}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
                        >
                          <FaGithub className="w-4 h-4" />
                          <span>Source</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {projects.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-zinc-800 backdrop-blur-sm hover:bg-zinc-600 hover:text-white p-3 rounded-full transition-colors duration-200 z-20"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-zinc-800 backdrop-blur-sm hover:bg-zinc-600 hover:text-white p-3 rounded-full transition-colors duration-200 z-20"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {projects.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedProjectsCarousel;
