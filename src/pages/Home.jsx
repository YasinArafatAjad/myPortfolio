import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useAnimation,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
// import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
// import { db } from '../config/firebase';
import { getOptimizedImageUrl } from "../config/cloudinary";
import { useSettings } from "../contexts/SettingsContext";
import SEOHead from "../components/SEOHead";
import TestimonialSection from "../components/home/TestimonialSection/TestimonialSection";
import { Featured } from "../components/home/FeaturedSection/Featured";
import AboutSection from "../components/home/AboutSection/AboutSection";
import CallToAction from "../components/CallToAction/CallToAction";

/**
 * Animated Hero Image Component
 */
const AnimatedHeroImage = ({ src, alt, className, delay = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (imageLoaded && !imageError) {
      controls.start({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.8,
          delay: delay,
          ease: "easeOut",
        },
      });
    }
  }, [imageLoaded, imageError, controls, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={controls}
      className={`relative overflow-hidden ${className}`}
    >
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-secondary-200 animate-pulse rounded-2xl" />
      )}

      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="w-12 h-12 bg-gray-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">IMG</span>
            </div>
            <span className="text-sm">{alt}</span>
          </div>
        </div>
      )}

      {src && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover rounded-2xl transition-opacity duration-300 ${
            imageLoaded && !imageError ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      {/* Animated overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded && !imageError ? 0.1 : 0 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"
      />
    </motion.div>
  );
};

/**
 * Floating Project Cards Component
 */
const FloatingProjectCards = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {projects.slice(0, 6).map((project, index) => {
        const positions = [
          { top: "10%", left: "5%", size: "w-32 h-20" },
          { top: "20%", right: "8%", size: "w-28 h-18" },
          { top: "60%", left: "3%", size: "w-36 h-24" },
          { bottom: "25%", right: "5%", size: "w-30 h-20" },
          { top: "45%", left: "15%", size: "w-24 h-16" },
          { bottom: "10%", right: "20%", size: "w-32 h-20" },
        ];

        const position = positions[index] || positions[0];

        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0, rotate: -10 }}
            animate={{
              opacity: 0.8,
              scale: 1,
              rotate: 0,
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.8,
              delay: 1.5 + index * 0.2,
              y: {
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className={`absolute ${position.size} pointer-events-auto`}
            style={position}
          >
            <div className="relative w-full h-full group cursor-pointer">
              <AnimatedHeroImage
                src={getOptimizedImageUrl(project.imageUrl, {
                  width: 200,
                  height: 120,
                })}
                alt={project.title}
                className="w-full h-full shadow-xl hover:shadow-2xl transition-shadow duration-300"
                delay={0}
              />

              {/* Project info overlay */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col justify-center items-center text-white text-center p-2"
              >
                <h4 className="text-xs font-semibold mb-1 line-clamp-1">
                  {project.title}
                </h4>
                <p className="text-xs opacity-80">{project.category}</p>
                <Link
                  to={`/portfolio/${project.id}`}
                  className="mt-1 text-xs bg-primary-600 hover:bg-primary-700 px-2 py-1 rounded transition-colors"
                >
                  View
                </Link>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/**
 * Animated Background Shapes
 */
const AnimatedBackgroundShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Large floating shapes */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          y: [0, 40, 0],
          rotate: [0, -15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-secondary-400/10 to-primary-400/10 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/2 left-10 w-48 h-48 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl"
      />

      {/* Smaller animated dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -Math.random() * 50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Home page component with animated hero and modern carousel
 */
const Home = () => {
  const { settings } = useSettings();
  const [loadingProjects, setLoadingProjects] = useState(true);

  // const heroRef = useRef(null);
  // const { scrollYProgress } = useScroll({
  //   target: heroRef,
  //   offset: ["start start", "end start"],
  //   layoutEffect: false,
  // });

  // const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  // const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  // const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <>
      <SEOHead
        title="Home | Yasin Arafat Ajad"
        description={settings.siteDescription}
        keywords={settings.siteKeywords}
      />

      <div className="min-h-screen">
        {/* Hero Section with Animated Images */}
        {/* <section
          ref={heroRef}
          className="min-h-screen flex items-center justify-center relative overflow-hidden"
        >
          {/* Parallax Background /}
          <motion.div 
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600"
          />
          
          {/* Animated Background Shapes /}
          <AnimatedBackgroundShapes />
          
          {/* Floating Project Cards /}
          {!loadingProjects && featuredProjects.length > 0 && (
            <FloatingProjectCards projects={featuredProjects} />
          )}
          
          {/* Hero Content /}
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="container-custom relative z-10 text-white text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Animated Profile Image /}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl"
                  >
                    <AnimatedHeroImage
                      src="/A.png"
                      alt="Profile"
                      className="w-full h-full"
                      delay={0.3}
                    />
                  </motion.div>
                  
                  {/* Animated ring around profile /}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-white/30"
                  />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
              >
                <motion.span 
                  className="block"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: "linear-gradient(45deg, #ffffff, #fbbf24, #f59e0b, #ffffff)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Welcome to
                </motion.span>
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  My Portfolio
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-xl md:text-2xl mb-12 text-white/90 max-w-4xl mx-auto leading-relaxed"
              >
                {settings.siteDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/portfolio"
                    className="bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl inline-block"
                  >
                    Explore My Work
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/contact"
                    className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 backdrop-blur-sm inline-block"
                  >
                    Message Me
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator /}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center space-y-2"
            >
              <span className="text-sm font-medium">Scroll to explore</span>
              <motion.svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </motion.svg>
            </motion.div>
          </motion.div>
        </section> */}

        {/* Featured Projects Carousel Section */}
        <Featured />

        {/* Testimonials Section */}
        <TestimonialSection />
        {/* About Preview  */}
        <AboutSection />

        {/* Call to Action Section */}
        <CallToAction />
      </div>
    </>
  );
};

export default Home;
