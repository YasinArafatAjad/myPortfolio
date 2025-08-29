import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Link } from "react-router-dom";
import FeaturedProjectsCarousel from "./FeaturedProjectsCarousel";
import Loader from "../../Loader";

// Fetch featured projects on component mount

export const Featured = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  /**
   * Modern Carousel Component for Featured Projects
   */
  // const FeaturedProjectsCarousel = ({ projects }) => {
  //   const [currentIndex, setCurrentIndex] = useState(0);
  //   const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  //   const intervalRef = useRef(null);

  //   // Auto-play functionality
  //   useEffect(() => {
  //     if (isAutoPlaying && projects.length > 1) {
  //       intervalRef.current = setInterval(() => {
  //         setCurrentIndex((prevIndex) =>
  //           prevIndex === projects.length - 1 ? 0 : prevIndex + 1
  //         );
  //       }, 3000);
  //     }

  //     return () => {
  //       if (intervalRef.current) {
  //         clearInterval(intervalRef.current);
  //       }
  //     };
  //   }, [isAutoPlaying, projects.length]);

  //   const nextSlide = () => {
  //     setCurrentIndex((prevIndex) =>
  //       prevIndex === projects.length - 1 ? 0 : prevIndex + 1
  //     );
  //   };

  //   const prevSlide = () => {
  //     setCurrentIndex((prevIndex) =>
  //       prevIndex === 0 ? projects.length - 1 : prevIndex - 1
  //     );
  //   };

  //   const goToSlide = (index) => {
  //     setCurrentIndex(index);
  //   };

  //   if (projects.length === 0) return null;

  //   return (
  //     <div
  //       className="relative w-full h-[600px] overflow-hidden rounded-2xl shadow-2xl"
  //       onMouseEnter={() => setIsAutoPlaying(false)}
  //       onMouseLeave={() => setIsAutoPlaying(true)}
  //     >
  //       {/* Slides Container */}
  //       <div
  //         className="flex transition-transform duration-700 ease-in-out h-full"
  //         style={{ transform: `translateX(-${currentIndex * 100}%)` }}
  //       >
  //         {projects.map((project, index) => (
  //           <div
  //             key={project.id}
  //             className="w-full h-full flex-shrink-0 relative"
  //           >
  //             {/* Background Image */}
  //             <div className="absolute inset-0">
  //               <AnimatedHeroImage
  //                 src={getOptimizedImageUrl(project.imageUrl, {
  //                   width: 1200,
  //                   height: 600,
  //                 })}
  //                 alt={project.title}
  //                 className="w-full h-full"
  //                 delay={0}
  //               />
  //               <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
  //             </div>

  //             {/* Content */}
  //             <div className="relative z-10 h-full flex items-center">
  //               <div className="container-custom">
  //                 <div className="max-w-2xl text-white">
  //                   <motion.div
  //                     initial={{ opacity: 0, y: 50 }}
  //                     animate={{
  //                       opacity: index === currentIndex ? 1 : 0,
  //                       y: index === currentIndex ? 0 : 50,
  //                     }}
  //                     transition={{ duration: 0.8, delay: 0.2 }}
  //                   >
  //                     <span className="inline-block bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
  //                       {project.category}
  //                     </span>

  //                     <h3 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
  //                       {project.title}
  //                     </h3>

  //                     <p className="text-xl text-gray-200 mb-6 line-clamp-3">
  //                       {project.description}
  //                     </p>

  //                     {/* Technologies */}
  //                     {project.technologies && (
  //                       <div className="flex flex-wrap gap-2 mb-6">
  //                         {project.technologies
  //                           .slice(0, 4)
  //                           .map((tech, techIndex) => (
  //                             <span
  //                               key={techIndex}
  //                               className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
  //                             >
  //                               {tech}
  //                             </span>
  //                           ))}
  //                       </div>
  //                     )}

  //                     {/* Action Buttons */}
  //                     <div className="flex flex-wrap gap-4">
  //                       <Link
  //                         to={`/portfolio/${project.id}`}
  //                         className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
  //                       >
  //                         <FaEye className="w-4 h-4" />
  //                         <span>View Project</span>
  //                       </Link>

  //                       {project.liveUrl && (
  //                         <a
  //                           href={project.liveUrl}
  //                           target="_blank"
  //                           rel="noopener noreferrer"
  //                           className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
  //                         >
  //                           <FaExternalLinkAlt className="w-4 h-4" />
  //                           <span>Live Demo</span>
  //                         </a>
  //                       )}

  //                       {project.githubUrl && (
  //                         <a
  //                           href={project.githubUrl}
  //                           target="_blank"
  //                           rel="noopener noreferrer"
  //                           className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
  //                         >
  //                           <FaGithub className="w-4 h-4" />
  //                           <span>Source</span>
  //                         </a>
  //                       )}
  //                     </div>
  //                   </motion.div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>

  //       {/* Navigation Arrows */}
  //       {projects.length > 1 && (
  //         <>
  //           <button
  //             onClick={prevSlide}
  //             className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-zinc-800 backdrop-blur-sm hover:bg-zinc-600 hover:text-white p-3 rounded-full transition-colors duration-200 z-20"
  //           >
  //             <FaChevronLeft className="w-5 h-5" />
  //           </button>

  //           <button
  //             onClick={nextSlide}
  //             className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-zinc-800 backdrop-blur-sm hover:bg-zinc-600 hover:text-white p-3 rounded-full transition-colors duration-200 z-20"
  //           >
  //             <FaChevronRight className="w-5 h-5" />
  //           </button>
  //         </>
  //       )}

  //       {/* Dots Indicator */}
  //       {projects.length > 1 && (
  //         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
  //           {projects.map((_, index) => (
  //             <button
  //               key={index}
  //               onClick={() => goToSlide(index)}
  //               className={`w-3 h-3 rounded-full transition-colors duration-200 ${
  //                 index === currentIndex
  //                   ? "bg-white"
  //                   : "bg-white/50 hover:bg-white/70"
  //               }`}
  //             />
  //           ))}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  /**
     >> Fetch featured projects from Firestore
     */
  const fetchFeaturedProjects = async () => {
    try {
      setLoadingProjects(true);

      // Try the optimized query first (requires composite index)
      try {
        const q = query(
          collection(db, "projects"),
          where("published", "==", true),
          where("featured", "==", true),
          orderBy("createdAt", "desc")
          // limit(8) // Increased for floating cards
        );

        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeaturedProjects(projectsData);
        return;
      } catch (indexError) {
        console.warn(
          "Composite index not available, using fallback query:",
          indexError.message
        );

        // Fallback: Get all projects and filter client-side
        const basicQuery = query(collection(db, "projects"));
        const basicSnapshot = await getDocs(basicQuery);
        const allProjects = basicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter client-side for published and featured projects
        const filteredProjects = allProjects
          .filter(
            (project) => project.published === true && project.featured === true
          )
          .sort((a, b) => {
            const aDate =
              a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
            const bDate =
              b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
            return bDate - aDate;
          })
          .slice(0, 8);

        setFeaturedProjects(filteredProjects);
      }
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      setFeaturedProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const [projectsRef, projectsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  return (
    <>
      {/* Featured Projects Carousel Section */}
      {featuredProjects.length > 0 && (
        <section ref={projectsRef} className="pt-16 pb-8 bg-white relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={projectsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="tittle text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
                Featured Projects
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Just keep your eye for some seconds on my most impactful and
                innovative work that showcases creativity, technical expertise,
                and problem-solving abilities.
              </p>
            </motion.div>

            {loadingProjects ? (
              <Loader />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <FeaturedProjectsCarousel
                  projects={featuredProjects.slice(0, 10)}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={projectsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
              <Link
                to="/portfolio"
                className="inline-flex items-center space-x-3 bg-primary-500 hover:bg-[#fd5614] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform "
              >
                <span>View All Projects</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
};
