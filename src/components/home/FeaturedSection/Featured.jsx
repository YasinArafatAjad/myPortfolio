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
