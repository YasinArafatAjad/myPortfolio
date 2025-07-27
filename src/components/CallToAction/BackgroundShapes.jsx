import React from "react";

const BackgroundShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Large floating shapes */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl animate-pulse" />

      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-secondary-400/10 to-primary-400/10 rounded-full blur-3xl animate-pulse" />

      <div className="absolute top-1/2 left-10 w-48 h-48 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-pulse" />

      {/* Smaller animated dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
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
