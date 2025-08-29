import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SEOHead from "../components/SEOHead";
import CallToAction from "../components/CallToAction/CallToAction";
import Logo from "../assets/LogoBlack.png";

/**
 * About page component with personal information and skills
 */
const About = () => {
  const [skillsRef, skillsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [experienceRef, experienceInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Skills data
  const skills = [
    { name: "React", level: 90 },
    { name: "JavaScript", level: 85 },
    { name: "Node.js", level: 80 },
    { name: "Firebase", level: 75 },
    { name: "CSS/Tailwind", level: 95 },
  ];

  // Experience/Timeline data
  // const timeline = [
  //   {
  //     year: "2023",
  //     title: "Senior Full Stack Developer",
  //     company: "Tech Company",
  //     description:
  //       "Led development of multiple web applications using React and Node.js",
  //   },
  //   {
  //     year: "2022",
  //     title: "Frontend Developer",
  //     company: "Digital Agency",
  //     description:
  //       "Created responsive web applications and improved user experiences",
  //   },
  //   {
  //     year: "2021",
  //     title: "Junior Developer",
  //     company: "Startup",
  //     description:
  //       "Learned modern web development practices and contributed to team projects",
  //   },
  // ];
  const timeline = [];

  const experienceYear = new Date().getFullYear() - 2023;

  return (
    <>
      <SEOHead
        title="About Me"
        description="Learn more about my background, skills, and experience in web development"
        keywords="about, skills, experience, developer, background"
      />

      <div className="pt-20">
        {/* Hero Header Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">About Me</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                I'm a passionate web developer with a love for creating
                beautiful, functional, and user-friendly digital experiences.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Personal Story Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="w-full"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center md:text-left">
                  My Journey
                </h2>
                <div className="space-y-6 text-gray-600">
                  <p>
                    With over {experienceYear} years of experience in web
                    development, I've had the privilege of working on diverse
                    projects that have shaped my understanding of both technical
                    excellence and user-centered design.
                  </p>
                  <p>
                    My journey began with a curiosity about how websites work,
                    which quickly evolved into a passion for creating digital
                    solutions that make a difference. I believe in writing
                    clean, maintainable code and creating experiences that users
                    love.
                  </p>
                  <p>
                    When I'm not coding, you can find me exploring new
                    technologies, contributing to open-source projects, or
                    sharing knowledge with the developer community.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl pt-3 pr-3 lg:h-[70vh] w-full flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-xl backdrop-blur-sm flex items-center justify-center">
                    <img
                      src={Logo}
                      alt="Yasin Arafat Ajad"
                      className="w-[70%] h- 32 object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section ref={skillsRef} className="py-20 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={skillsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Skills & Expertise
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Here are the technologies and tools I work with to bring ideas
                to life.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={skillsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="card w-full"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {skill.name}
                    </h3>
                    <span className="text-sm font-medium text-gray-500">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={skillsInView ? { width: `${skill.level}%` } : {}}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Timeline */}
        <section ref={experienceRef} className="py-20">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={experienceInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="tittle text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                My professional journey and key milestones.
              </p>
            </motion.div>
            <div className="max-w-4xl mx-auto">
              {timeline.length === 0 ? (
                <>
                  <div className="card text-center">
                    <div className="text-rose-600 font-bold text-lg mb-2">
                      <h4 className="text-3xl ">Bad Luck!</h4>
                    </div>
                    <div className="description w-[65%] mx-auto">
                      <p className="text-gray-500">
                        Still now I don't have job experience on Real World. But
                        i have experience in hands-on code in a lots of project.
                      </p>
                      <p className="mt-4">
                        I am looking for a remote job now .
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={experienceInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    className={`flex items-center mb-12 ${
                      index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`flex-1 ${index % 2 === 0 ? "pr-8" : "pl-8"}`}
                    >
                      <div className="card">
                        <div className="text-primary-600 font-bold text-lg mb-2">
                          {item.year}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <div className="text-secondary-600 font-medium mb-3">
                          {item.company}
                        </div>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="flex-1"></div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <CallToAction />
      </div>
    </>
  );
};

export default About;
