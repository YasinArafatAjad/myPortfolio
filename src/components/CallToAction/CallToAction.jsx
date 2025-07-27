import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BackgroundShapes from "./BackgroundShapes";

const CallToAction = () => {
  return (
    <>
      <section className="py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white relative overflow-hidden">
        <BackgroundShapes />
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Let's Create Something
              <span className="block pt-2 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Amazing Together
              </span>
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Ready to bring your ideas to life? I'm here to help you create
              digital experiences that not only look great but also deliver
              exceptional results.
            </p>
            <div className="group">
              <Link
                to="/contact"
                className="relative inline-flex items-center space-x-3 bg-white text-primary-600 pl-10 pr-14 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl"
              >
                <span>Start a Project</span>
                <span className="group-hover:right-5 absolute top-1/2 right-7  -translate-y-1/2 transition-all ease-in-out duration-300 ">
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
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CallToAction;
