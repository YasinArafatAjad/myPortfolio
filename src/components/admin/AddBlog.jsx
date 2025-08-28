import React, { useState, useRef } from "react";
import { db } from "../../config/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaTimes } from "react-icons/fa";
import { uploadToCloudinary } from "../../config/cloudinary";

const AddBlog = () => {
  const [title, setTitle] = useState(null);
  const [banner, setBanner] = useState(null);
  const [author, setAuthor] = useState("");
  const [gallery, setGallery] = useState([]);
  const [article, setArticle] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const quillRef = useRef(null);

  // Handle banner change
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) setBanner({ file, preview: URL.createObjectURL(file) });
  };

  // Handle gallery change
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGallery(
      files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    );
  };

  const removeGalleryItem = (idx) =>
    setGallery((prev) => prev.filter((_, i) => i !== idx));

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title?.trim() || !author.trim() || !article.trim()) {
      return alert("Title, Author and Article are required.");
    }

    setLoading(true);
    try {
      // Upload banner
      const bannerUrl = banner
        ? await uploadToCloudinary(banner.file, "blogs/banner")
        : "";

      // Upload gallery
      const galleryUrls = await Promise.all(
        gallery.map(async (item) => {
          if (!item.file) return null;
          const url = await uploadToCloudinary(item.file, "blogs/gallery");
          return url ? { url, type: item.file.type } : null;
        })
      );

      // Save to Firestore
      await addDoc(collection(db, "blogs"), {
        title,
        banner: bannerUrl,
        author,
        gallery: galleryUrls.filter(Boolean),
        article,
        status,
        createdAt: Timestamp.now(),
      });

      alert("Blog saved successfully!");
      navigate("/admin/dashboard/blogs");
    } catch (err) {
      console.error(err);
      alert("Error saving blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h2 className="text-xl font-semibold mb-6">Add New Blog</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-2 font-medium">Title</label>
          <input
            type="text"
            value={title || ""}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
            placeholder="Enter blog title"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block mb-2 font-medium">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Banner */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Banner
          </label>
          {banner ? (
            <div className="relative inline-block">
              {banner.file.type.startsWith("video/") ? (
                <video
                  src={banner.preview}
                  controls
                  className="w-60 h-36 rounded-lg shadow-md object-cover"
                />
              ) : (
                <img
                  src={banner.preview}
                  alt="banner"
                  className="w-60 h-36 rounded-lg shadow-md object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition"
              >
                <FaTimes size={14} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="banner-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition"
            >
              <input
                type="file"
                accept="image/*,video/*"
                id="banner-upload"
                onChange={handleBannerChange}
                className="hidden"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mb-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6-4v12m0 0l-4-4m4 4l4-4"
                />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Click to upload Banner
              </span>
            </label>
          )}
        </div>

        {/* Gallery */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Gallery (Images / Videos)
          </label>
          <label
            htmlFor="gallery-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition"
          >
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              id="gallery-upload"
              onChange={handleGalleryChange}
              className="hidden"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mb-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6-4v12m0 0l-4-4m4 4l4-4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Click to upload
            </span>
            <span className="text-xs text-gray-400">
              PNG, JPG, MP4 up to 10MB
            </span>
          </label>

          {gallery.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {gallery.map((item, idx) => (
                <div key={idx} className="relative">
                  {item.file.type.startsWith("video/") ? (
                    <video
                      src={item.preview}
                      controls
                      className="w-40 h-28 rounded-lg shadow-md object-cover"
                    />
                  ) : (
                    <img
                      src={item.preview}
                      alt={`gallery-${idx}`}
                      className="w-40 h-28 rounded-lg shadow-md object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Article */}
        <div>
          <label className="block mb-2 font-medium">Article</label>
          <ReactQuill
            ref={quillRef}
            value={article}
            onChange={setArticle}
            theme="snow"
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                ["blockquote", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image", "video"],
              ],
            }}
            className="dark:bg-gray-800 dark:text-white rounded-lg"
            style={{ minHeight: "300px", height: "450px", overflowY: "auto" }}
          />
        </div>

        {/* status */}
        <div>
          <label className="block mb-2 font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* upload button */}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded shadow"
        >
          {loading ? "Uploading..." : "Upload Blog"}
        </button>
      </form>
    </div>
  );
};

export default AddBlog;
