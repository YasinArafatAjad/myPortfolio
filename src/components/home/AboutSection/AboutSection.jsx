import React from "react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

const AboutSection = () => {
  const [aboutRef, aboutInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const aboutCard = [
    {
      icon: (
        <svg
          className="w-10 h-10 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      headerTxt: "Frontend Development",
      desc: "Creating responsive and interactive user interfaces with modern frameworks like React, Vue, and Angular. Focused on performance, accessibility, and user experience.",
    },
    {
      icon: (
        <svg
          className="w-10 h-10 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      headerTxt: "Backend Development",
      desc: "Building robust server-side applications and APIs with scalable architectures.Experienced with Node.js, Express.js, databases, and cloud services.",
    },    
  ];

  return (
    <>
      <section
        ref={aboutRef}
        className="pt-8 pb-16 bg-gradient-to-br from-gray-50 to-gray-100 relative"
      >
        <div className="container-custom">
          {/* tittle */}
          <div className={`tittle text-center mb-20 ${aboutInView ? 'animate-fade-in' : 'opacity-0'}`}>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              About Me
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              I'm a passionate developer dedicated to creating exceptional
              digital experiences. With expertise in modern web technologies, I
              bring ideas to life through clean code, innovative solutions, and
              meticulous attention to detail.
            </p>
          </div>

          {/* All About Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* particular About Card */}
            {aboutCard.map((e, i) => (
              <div
                key={i}
                className={`group ${aboutInView ? 'animate-slide-up' : 'opacity-0'}`}
                style={{ animationDelay: `${0.4 + i * 0.2}s` }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-mt-3">
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform duration-300">
                    {e.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {e.headerTxt}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* About Button */}
          <div className={`group text-center mt-16 ${aboutInView ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <Link
              to="/about"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white pl-8 pr-12 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 relative"
            >
              <span>Learn More About Me</span>
              <span className="group-hover:right-4 absolute top-1/2 right-6 -translate-y-1/2 transition-all ease-in-out duration-300">
                <svg
                  className="w-5 h-5 "
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
