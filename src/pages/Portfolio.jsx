import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getOptimizedImageUrl } from '../config/cloudinary';
import SEOHead from '../components/SEOHead';

/**
 * Portfolio page component with filtering and search functionality
 */
const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  /**
   * Fetch projects from Firestore
   */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Filter published projects in JavaScript to avoid composite index requirement
      .filter(project => project.published === true);

      setProjects(projectsData);
      setFilteredProjects(projectsData);

      // Extract unique categories
      const uniqueCategories = [...new Set(projectsData.map(project => project.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter and sort projects based on current filters
   */
  const applyFilters = () => {
    let filtered = [...projects];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies?.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt);
        case 'oldest':
          return new Date(a.createdAt?.toDate?.() || a.createdAt) - new Date(b.createdAt?.toDate?.() || b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [projects, selectedCategory, searchTerm, sortBy]);

  /**
   * Project card component
   */
  const ProjectCard = ({ project, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="card group overflow-hidden"
      >
        {/* Project Image */}
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={getOptimizedImageUrl(project.imageUrl, { width: 400, height: 250 })}
            alt={project.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Link
              to={`/portfolio/${project.id}`}
              className="text-white font-semibold bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Project Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-600 font-medium">
              {project.category}
            </span>
            {project.featured && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            <Link to={`/portfolio/${project.id}`}>
              {project.title}
            </Link>
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Technologies */}
          {project.technologies && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{project.technologies.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Project Links */}
          <div className="flex space-x-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-700 font-medium text-sm"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <SEOHead
        title="Portfolio"
        description="Browse my portfolio of web development projects and creative work"
        keywords="portfolio, projects, web development, React, JavaScript"
      />
      
      <div className="pt-20">
        {/* Header Section */}
        <section ref={headerRef} className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                My Portfolio
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Explore my collection of projects showcasing creativity, technical skills, and problem-solving abilities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white border-b">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full md:w-64"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="w-full md:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input w-full md:w-40"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20">
          <div className="container-custom">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="spinner"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No projects found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'Try adjusting your filters or search term.'
                    : 'Projects will appear here once they are added.'}
                </p>
              </div>
            ) : (
              <div className="portfolio-grid">
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Portfolio;