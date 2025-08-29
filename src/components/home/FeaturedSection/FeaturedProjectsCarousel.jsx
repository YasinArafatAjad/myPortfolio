import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaGithub,
  FaEye,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../../pages/BlogDetails.css";

const FeaturedProjectsCarousel = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  // Keep <br> but remove other HTML tags
  // const getFirstLinesHtml = (html, lines = 3) => {
  //   if (!html) return "";

  //   // Replace </p> and <br> with a newline marker
  //   let temp = html.replace(/<\/p>/gi, "\n").replace(/<br\s*\/?>/gi, "\n");

  //   // Remove all remaining HTML tags
  //   temp = temp.replace(/<[^>]+>/g, "");

  //   // Split by newline and take first N lines
  //   const splitLines = temp
  //     .split("\n")
  //     .map((line) => line.trim())
  //     .filter(Boolean);

  //   const firstLines = splitLines.slice(0, lines).join("<br>");

  //   return firstLines;
  // };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && projects.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % projects.length);
      }, 4000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAutoPlaying, projects.length]);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  const goToSlide = (index) => setCurrentIndex(index);

  if (!projects.length) return null;

  return (
    <div
      className="relative w-full max-w-[1200px] mx-auto h-[28rem] md:h-[32rem] lg:h-[36rem] overflow-hidden rounded-3xl shadow-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
      <AnimatePresence initial={false} mode="wait">
        {projects.map(
          (project, index) =>
            index === currentIndex && (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-center bg-black/70"
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center z-0 rounded-3xl"
                  style={{
                    backgroundImage: `url(${project.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: project.bgPosition || "center top",
                    filter: "brightness(0.6)",
                    transition: "transform 0.8s ease",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent rounded-3xl z-10" />

                {/* Content */}
                <div className="relative z-20 p-6 md:p-12 inline-flex flex-col md:flex-1 text-white">
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className=" bg-primary-600 px-4 py-2 rounded text-sm font-medium mb-4 w-fit"
                  >
                    {project.category}
                  </motion.span>

                  <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
                  >
                    {project.title}
                  </motion.h3>

                  {/* Description (first 3 lines) */}
                  {/* <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-4 prose max-w-none text-gray-200 overflow-hidden"
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getFirstLinesHtml(project.description, 3),
                      }}
                    />
                  </motion.div> */}

                  {/* Technologies */}
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={`/portfolio/${project.id}`}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200"
                    >
                      <FaEye /> View Project
                    </Link>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200"
                      >
                        <FaExternalLinkAlt /> Live Demo
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200"
                      >
                        <FaGithub /> Source
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Navigation */}
      {projects.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white text-black p-3 rounded-full z-20 transition"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white text-black p-3 rounded-full z-20 transition"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {projects.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {projects.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                idx === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedProjectsCarousel;
