import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import "./BlogDetails.css";
import Loader from "../components/Loader";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBlog(docSnap.data());
        } else {
          alert("Blog not found");
          navigate("/admin/dashboard/blogs");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching blog");
        navigate("/admin/dashboard/blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  // Syntax highlight code after article loads
  useEffect(() => {
    if (!blog) return;

    // Select all pre blocks inside your article
    const preElements = document.querySelectorAll(".blog-article pre");

    preElements.forEach((pre) => {
      // Only add copy button if it doesn't exist yet
      if (!pre.querySelector(".copy-btn")) {
        const button = document.createElement("button");
        button.textContent = "Copy"; // simpler than innerHTML
        button.className =
          "copy-btn  bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600 transition";
        button.onclick = () => {
          navigator.clipboard.writeText(pre.innerText);
          button.textContent = "Copied!";
          setTimeout(() => (button.textContent = "Copy"), 3000);
        };

        pre.classList.add(
          "relative",
          "group",
          "overflow-auto",
          "rounded-lg",
          "bg-gray-900",
          "p-4",
          "text-sm",
          "text-white"
        );

        pre.appendChild(button);
      }
    });
  }, [blog]);

  if (loading)
    return <Loader />;
  if (!blog) return null;

  return (
    <div className="p-6 mt-[120px] dark:bg-gray-900 dark:text-white min-h-screen mx-auto">
      {/* Banner */}
      {blog.banner && (
        <div className="mb-8 relative rounded-t-lg overflow-hidden ">
          {blog.banner.endsWith(".mp4") ? (
            <video
              src={blog.banner}
              controls
              className="w-full h-96 object-cover rounded-lg transition-transform hover:scale-105"
            />
          ) : (
            <img
              src={blog.banner}
              alt={blog.title}
              className="w-full h-96 object-cover rounded-lg transition-transform hover:scale-105"
            />
          )}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
            <h1 className="text-4xl font-bold">{blog.title}</h1>
            <p className="text-sm text-gray-300 mt-1">
              By {blog.author} |{" "}
              {blog.createdAt
                ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString()
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* Article */}
      <div className="blog-article prose max-w-none dark:prose-invert prose-headings:text-primary-600 dark:prose-headings:text-primary-400 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <div dangerouslySetInnerHTML={{ __html: blog.article }} />
      </div>

      {/* Gallery */}
      {blog.gallery?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {blog.gallery.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg overflow-hidden  transition-transform transform"
            >
              {item.url.endsWith(".mp4") ? (
                <video
                  src={item.url}
                  controls
                  className="w-full border border-red-500 object-cover rounded-lg"
                />
              ) : (
                <img
                  src={item.url}
                  alt={`gallery-${idx}`}
                  className="w-full border border-red-500 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogDetails;
