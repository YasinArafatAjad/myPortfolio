import React, { useState, useEffect } from "react";
import { Link, replace, useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";
import "react-quill/dist/quill.snow.css";


const BlogsManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      const querySnapshot = await getDocs(collection(db, "blogs"));
      setBlogs(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmed) return;
    await deleteDoc(doc(db, "blogs", id));
    setBlogs(blogs.filter((blog) => blog.id !== id));
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(filter.toLowerCase()) ||
      blog.author?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Manage Blogs</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by title or author"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 pl-10 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <Link
            to="/admin/dashboard/blogs/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-700 text-white rounded-lg shadow"
          >
            <FaPlus /> Add Blog
          </Link>
        </div>
      </div>

      {filteredBlogs.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No blogs found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              <img
                src={blog.banner}
                alt={blog.title}
                className="w-full h-44 object-cover"
              />
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg">{blog.title || "Untitled"}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  By {blog.author || "Unknown"}
                </p>
                <div className="mt-auto flex justify-between">
                  <button
                    onClick={() => navigate(`/admin/dashboard/blogs/edit/${blog.id}`)}
                    className="flex items-center gap-1 text-yellow-600 hover:underline"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    className="flex items-center gap-1 text-green-600 hover:underline"
                  >
                    <FaEye /> View
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsManagement;
