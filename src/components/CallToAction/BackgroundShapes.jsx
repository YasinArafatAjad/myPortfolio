import React from "react";
import { motion } from "framer-motion";

const BackgroundShapes = () => {
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

export default BackgroundShapes;
