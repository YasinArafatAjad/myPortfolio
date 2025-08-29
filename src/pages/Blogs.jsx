import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import BlogCard from "../components/blog/BlogCard";
import SEOHead from "../components/SEOHead";
import { FaSearch, FaFilter, FaFileAlt } from "react-icons/fa";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Fetch blogs from Firestore
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "blogs"),
        orderBy("createdAt", "desc", { nullsLast: true })
      );
      const querySnapshot = await getDocs(q);
      const blogsData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((blog) => blog.status === "published");

      setBlogs(blogsData);
      setFilteredBlogs(blogsData);

      // Unique categories
      const uniqueCategories = [
        ...new Set(blogsData.map((blog) => blog.category)),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...blogs];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((blog) => blog.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBlogs(filtered);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);
  useEffect(() => {
    applyFilters();
  }, [blogs, selectedCategory, searchTerm]);

  return (
    <>
      <SEOHead
        title="Blogs"
        description="Read my latest blog posts and insights on web development and tech"
        keywords="blogs, web development, React, JavaScript"
      />

      {/* Header */}
      <section
        ref={headerRef}
        className="py-20 mt-[120px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            My Blogs
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explore my latest posts, insights, and tutorials on web development
            and modern tech.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="container-cutom p-8 bg-white border-b shadow-sm flex items-center justify-between">
        {/* Search */}
        <div className="w-full lg:w-auto relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 w-full lg:w-80"
          />
        </div>
        {/* project number */}
        <div className="text-center text-gray-600">
          {loading
            ? "Loading blogs..."
            : `Showing ${filteredBlogs.length} of ${blogs.length} blogs`}
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Blogs;
