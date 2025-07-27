import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../config/firebase";
import { useBusinessNotifications } from "../hooks/useBusinessNotifications";
import ReviewSystem from "../components/portfolio/ReviewSystem";
import CallToAction from "../components/CallToAction/CallToAction";
import SEOHead from "../components/SEOHead";
import {
  FaArrowLeft,
  FaExternalLinkAlt,
  FaGithub,
  FaEye,
  FaImage,
  FaTools,
  FaStar,
} from "react-icons/fa";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { notifyProjectMilestone } = useBusinessNotifications();

  // Fetch project details and increment view count
  const fetchProject = async () => {
    try {
      setLoading(true);
      const projectDoc = await getDoc(doc(db, "projects", id));

      if (projectDoc.exists()) {
        const projectData = { id: projectDoc.id, ...projectDoc.data() };

        // Check if project is published
        if (!projectData.published) {
          setNotFound(true);
          return;
        }

        setProject(projectData);

        // Increment view count and check for milestones
        try {
          const newViewCount = (projectData.views || 0) + 1;

          await updateDoc(doc(db, "projects", id), {
            views: increment(1),
          });

          // Check for view milestones and create notifications
          await notifyProjectMilestone(projectData, newViewCount);

          // Update local state
          setProject((prev) => ({ ...prev, views: newViewCount }));
        } catch (error) {
          console.error("Error updating view count:", error);
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !project) {
    return <Navigate to="/portfolio" replace />;
  }

  return (
    <>
      <SEOHead
        title={project.title}
        description={project.description}
        keywords={`${project.category}, ${
          project.technologies?.join(", ") || ""
        }`}
        image={project.imageUrl}
      />

      <main className="mt-28 pt-8">
        {/* Back Navigation */}
        <section className="py-6 bg-gray-50 border-b">
          <div className="container-custom">
            <div className="animate-slide-up">
              <Link
                to="/portfolio"
                className="inline-flex items-center space-x-2  border-r-[3px] border-zinc-800 pr-2 py-1.5 text-gray-600 hover:text-primary-600 transition-colors group"
              >
                <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Portfolio</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Project Header */}
        <section className="pt-8 pb-4">
          <div className="container-custom">
            <div className="text-center animate-fade-in">
              {/* tittle */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 uppercase">
                {project.title}
              </h1>
              {/* available badges */}
              <div className="flex items-center justify-center space-x-4 mb-4 flex-wrap">
                <span className="text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-full">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                    <FaStar className="w-3 h-3 mr-1" />
                    Featured Project
                  </span>
                )}
                {project.underConstruction && (
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                    <FaTools className="w-3 h-3 mr-1" />
                    Under Construction
                  </span>
                )}
                <div className="flex items-center space-x-1 text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  <FaEye className="w-4 h-4" />
                  <span className="text-sm">{project.views || 0} views</span>
                </div>
              </div>              
            </div>
          </div>
        </section>

        {/* Project Image */}
        <div
          className="projectImage container-custom"
          className="projectImage container-custom animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          {!project.imageUrl || project.imageUrl === "" ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
              <FaImage className="w-20 h-20 mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2">No Image Found</h3>
            </div>
          ) : (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full pointer-events-none"
            />
          )}
        </div>

        {/* Project Details */}
        <section className="pt-12 pb-4 bg-gray-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Project Overview
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>

                    {/* Development Process */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Development Process
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Planning & Design
                          </h4>
                          <p className="text-sm text-gray-600">
                            User research, wireframing, and creating detailed
                            mockups
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Development
                          </h4>
                          <p className="text-sm text-gray-600">
                            Clean code implementation with modern technologies
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Testing
                          </h4>
                          <p className="text-sm text-gray-600">
                            Comprehensive testing across devices and browsers
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Deployment
                          </h4>
                          <p className="text-sm text-gray-600">
                            Optimized deployment with performance monitoring
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Technologies */}
                {!project.technologies.length == 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 px-3 py-1 rounded-full text-sm font-medium hover:from-primary-200 hover:to-primary-300 transition-all duration-200 cursor-default animate-fade-in"
                          style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Project Info
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">
                        Category
                      </span>
                      <span className="text-gray-900 font-medium">
                        {project.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">
                        Date
                      </span>
                      <span className="text-gray-900 font-medium">
                        {project.createdAt?.toDate?.()?.toLocaleDateString() ||
                          "Recently"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">
                        Views
                      </span>
                      <span className="text-gray-900 font-medium">
                        {project.views || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-500">
                        Status
                      </span>
                      <div className="flex items-center space-x-2">
                        {project.underConstruction ? (
                          <span className="bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <FaTools className="w-3 h-3 mr-1" />
                            Under Construction
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Links */}
                {(project.liveUrl || project.githubUrl) && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Project Links
                    </h3>
                    <div className="inline-flex flex-col gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-green-600 hover:text-primary-700 transition-colors group hover:translate-x-1"
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
                          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors group hover:translate-x-1"
                        >
                          <FaGithub className="w-4 h-4" />
                          <span>Source Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Share Project */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Share Project
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: project.title,
                            text: project.description,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Link copied to clipboard!");
                        }
                      }}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:scale-105"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:scale-105"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <ReviewSystem
                projectId={project.id}
                projectTitle={project.title}
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="flex items-center justify-center py-4">
          <Link
            to="/portfolio"
            className="border-2 bg-black text-white px-8 py-4 rounded-ss-lg rounded-ee-lg font-semibold transition-all duration-200 inline-block text-center shadow"
          >
            View More Projects
          </Link>
        </div>
        <CallToAction />
      </main>
    </>
  );
};

export default ProjectDetail;
