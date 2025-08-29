import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Routes, Route, useNavigate, Link, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { uploadToCloudinary } from "../../config/cloudinary";
import { useNotification } from "../../contexts/NotificationContext";
import { useBusinessNotifications } from "../../hooks/useBusinessNotifications";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaImage,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaTimes,
  FaTools,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Loader from "../Loader";

/**
 * Projects list component
 */
const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { showSuccess, showError } = useNotification();
  const { notifyProjectStatus } = useBusinessNotifications();
  const navigate = useNavigate();

  /**
   * Fetch projects from Firestore
   */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete project
   */
  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "projects", projectId));
      showSuccess("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      showError("Failed to delete project");
    }
  };

  /**
   * Toggle project published status
   */
  const togglePublished = async (project) => {
    try {
      const newStatus = !project.published;
      await updateDoc(doc(db, "projects", project.id), {
        published: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Create business notification for status change
      await notifyProjectStatus(
        project,
        project.published ? "published" : "unpublished",
        newStatus ? "published" : "unpublished"
      );

      showSuccess(
        `Project ${newStatus ? "published" : "unpublished"} successfully`
      );
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      showError("Failed to update project");
    }
  };

  /**
   * Toggle project featured status
   */
  const toggleFeatured = async (project) => {
    try {
      const newFeaturedStatus = !project.featured;
      await updateDoc(doc(db, "projects", project.id), {
        featured: newFeaturedStatus,
        updatedAt: serverTimestamp(),
      });

      // Create business notification for featured status change
      await notifyProjectStatus(
        project,
        project.featured ? "featured" : "unfeatured",
        newFeaturedStatus ? "featured" : "unfeatured"
      );

      showSuccess(
        `Project ${newFeaturedStatus ? "featured" : "unfeatured"} successfully`
      );
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      showError("Failed to update project");
    }
  };

  /**
   * Toggle project under construction status
   */
  const toggleUnderConstruction = async (project) => {
    try {
      const newConstructionStatus = !project.underConstruction;
      await updateDoc(doc(db, "projects", project.id), {
        underConstruction: newConstructionStatus,
        updatedAt: serverTimestamp(),
      });

      showSuccess(
        `Project marked as ${
          newConstructionStatus ? "under construction" : "completed"
        }`
      );
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      showError("Failed to update project");
    }
  };

  /**
   * Filter and sort projects
   */
  const getFilteredProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (project) => project.category === filterCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt?.toDate?.() || b.createdAt) -
            new Date(a.createdAt?.toDate?.() || a.createdAt)
          );
        case "oldest":
          return (
            new Date(a.createdAt?.toDate?.() || a.createdAt) -
            new Date(b.createdAt?.toDate?.() || b.createdAt)
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Get unique categories
  const categories = [...new Set(projects.map((p) => p.category))];

  useEffect(() => {
    fetchProjects();
  }, []);

  /**
   * Project card component for mobile view
   */
  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 h-16 w-16">
          {project.imageUrl ? (
            <img
              className="h-16 w-16 rounded-lg object-cover"
              src={project.imageUrl}
              alt={project.title}
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
              <FaImage className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {project.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {project.category}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.published
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {project.published ? "Published" : "Draft"}
        </span>
        {project.featured && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Featured
          </span>
        )}
        {project.underConstruction && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <FaTools className="w-3 h-3 mr-1" />
            Under Construction
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <span className="text-sm text-gray-500">
          Views: {project.views || 0}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => togglePublished(project)}
            className={`p-2 rounded-lg transition-colors ${
              project.published
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-400 hover:bg-gray-50"
            }`}
            title={project.published ? "Unpublish" : "Publish"}
          >
            {project.published ? (
              <FaEye className="w-4 h-4" />
            ) : (
              <FaEyeSlash className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => toggleFeatured(project)}
            className={`p-2 rounded-lg transition-colors ${
              project.featured
                ? "text-purple-600 hover:bg-purple-50"
                : "text-gray-400 hover:bg-gray-50"
            }`}
            title={project.featured ? "Unfeature" : "Feature"}
          >
            ⭐
          </button>
          <button
            onClick={() => toggleUnderConstruction(project)}
            className={`p-2 rounded-lg transition-colors ${
              project.underConstruction
                ? "text-orange-600 hover:bg-orange-50"
                : "text-gray-400 hover:bg-gray-50"
            }`}
            title={
              project.underConstruction
                ? "Mark as Complete"
                : "Mark as Under Construction"
            }
          >
            <FaTools className="w-4 h-4" />
          </button>
          <Link
            to={`/admin/dashboard/projects/edit/${project.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="View Live"
            >
              <FaExternalLinkAlt className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => handleDelete(project.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your portfolio projects</p>
        </div>
        <Link
          to="/admin/dashboard/projects/new"
          className="btn-primary w-full md:w-auto text-center text-nowrap flex gap-2 items-center"
        >
          <FaPlus className="mr-2" />
          Add Project
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input focus:outline-none focus:ring-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loader />
        ) : getFilteredProjects().length === 0 ? (
          <div className="text-center py-12">
            <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600">
              {projects.length === 0
                ? "Get started by creating your first project."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredProjects().map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {project.imageUrl ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={project.imageUrl}
                                alt={project.title}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <FaImage className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {project.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {project.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col justify-center items-center space-y-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.published
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {project.published ? "Published" : "Draft"}
                          </span>
                          {project.featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Featured
                            </span>
                          )}
                          {project.underConstruction && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <FaTools className="w-3 h-3 mr-1" />
                              Under Construction
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                        {project.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => togglePublished(project)}
                            className={`p-2 rounded-lg transition-colors ${
                              project.published
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-50"
                            }`}
                            title={project.published ? "Unpublish" : "Publish"}
                          >
                            {project.published ? <FaEye /> : <FaEyeSlash />}
                          </button>
                          <button
                            onClick={() => toggleFeatured(project)}
                            className={`p-2 rounded-lg transition-colors ${
                              project.featured
                                ? "text-purple-600 hover:bg-purple-50"
                                : "text-gray-400 hover:bg-gray-50"
                            }`}
                            title={project.featured ? "Unfeature" : "Feature"}
                          >
                            ⭐
                          </button>
                          <button
                            onClick={() => toggleUnderConstruction(project)}
                            className={`p-2 rounded-lg transition-colors ${
                              project.underConstruction
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-gray-400 hover:bg-gray-50"
                            }`}
                            title={
                              project.underConstruction
                                ? "Mark as Complete"
                                : "Mark as Under Construction"
                            }
                          >
                            <FaTools />
                          </button>
                          <Link
                            to={`/admin/dashboard/projects/edit/${project.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Live"
                            >
                              <FaExternalLinkAlt />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {getFilteredProjects().map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Project form component (for both new and edit)
 */
const ProjectForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    technologies: [],
    imageUrl: "",
    liveUrl: "",
    githubUrl: "",
    featured: false,
    published: false,
    underConstruction: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProject, setFetchingProject] = useState(isEdit);
  const [techInput, setTechInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const quillRef = useRef(null);

  const { showSuccess, showError } = useNotification();
  const { notifyProjectStatus } = useBusinessNotifications();
  const navigate = useNavigate();

  /**
   * Fetch existing categories
   */
  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "projects"));
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map((doc) => doc.data());
      const uniqueCategories = [
        ...new Set(projects.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories.sort());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  /**
   * Fetch project data for editing
   */
  const fetchProject = async () => {
    if (!isEdit || !id) return;

    try {
      setFetchingProject(true);
      const projectDoc = await getDoc(doc(db, "projects", id));

      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        setFormData({
          title: projectData.title || "",
          description: projectData.description || "",
          category: projectData.category || "",
          technologies: projectData.technologies || [],
          imageUrl: projectData.imageUrl || "",
          liveUrl: projectData.liveUrl || "",
          githubUrl: projectData.githubUrl || "",
          featured: projectData.featured || false,
          published: projectData.published || false,
          underConstruction: projectData.underConstruction || false,
        });
      } else {
        showError("Project not found");
        navigate("/admin/dashboard/projects");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      showError("Failed to fetch project data");
      navigate("/admin/dashboard/projects");
    } finally {
      setFetchingProject(false);
    }
  };

  /**
   * Generate title-based UID
   */
  const generateTitleUID = (title) => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50) +
      "-" +
      uuidv4().substring(0, 8)
    );
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Handle category selection
   */
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "new") {
      setShowNewCategoryInput(true);
      setFormData((prev) => ({ ...prev, category: "" }));
    } else {
      setShowNewCategoryInput(false);
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  /**
   * Add new category
   */
  const addNewCategory = () => {
    const trimmedCategory = newCategoryInput.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      setCategories((prev) => [...prev, trimmedCategory].sort());
      setFormData((prev) => ({ ...prev, category: trimmedCategory }));
      setNewCategoryInput("");
      setShowNewCategoryInput(false);
      showSuccess("New category added successfully");
    }
  };

  /**
   * Add technology to the list
   */
  const addTechnology = () => {
    const trimmedTech = techInput.trim();
    if (trimmedTech && !formData.technologies.includes(trimmedTech)) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, trimmedTech],
      }));
      setTechInput("");
    }
  };

  /**
   * Remove technology from the list
   */
  const removeTechnology = (techToRemove) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((tech) => tech !== techToRemove),
    }));
  };

  /**
   * Handle technology input key press
   */
  const handleTechKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTechnology();
    } else if (e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addTechnology();
    }
  };

  /**
   * Handle image file selection
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  /**
   * Upload image to Cloudinary
   */
  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl;

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(imageFile, "portfolio");
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Upload image if new file selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const projectData = {
        ...formData,
        imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (isEdit && id) {
        // Get old project data for comparison
        const oldProjectDoc = await getDoc(doc(db, "projects", id));
        const oldProjectData = oldProjectDoc.data();

        // Update existing project
        await updateDoc(doc(db, "projects", id), projectData);

        // Check for status changes and create notifications
        if (oldProjectData.published !== formData.published) {
          await notifyProjectStatus(
            { id, title: formData.title },
            oldProjectData.published ? "published" : "unpublished",
            formData.published ? "published" : "unpublished"
          );
        }

        if (oldProjectData.featured !== formData.featured) {
          await notifyProjectStatus(
            { id, title: formData.title },
            oldProjectData.featured ? "featured" : "unfeatured",
            formData.featured ? "featured" : "unfeatured"
          );
        }

        showSuccess("Project updated successfully");
      } else {
        // Create new project
        projectData.titleUID = generateTitleUID(formData.title);
        projectData.createdAt = serverTimestamp();
        projectData.views = 0;
        const newProjectRef = await addDoc(
          collection(db, "projects"),
          projectData
        );

        // Create notification for new project
        if (formData.published) {
          await notifyProjectStatus(
            { id: newProjectRef.id, title: formData.title },
            "draft",
            "published"
          );
        }

        showSuccess("Project created successfully");
      }

      navigate("/admin/dashboard/projects");
    } catch (error) {
      console.error("Error saving project:", error);
      showError("Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  // Fetch project data and categories when component mounts
  useEffect(() => {
    fetchCategories();
    fetchProject();
  }, [isEdit, id]);

  // Show loading spinner while fetching project data
  if (fetchingProject) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/dashboard/projects"
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Project" : "Add New Project"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? "Update project information"
              : "Create a new portfolio project"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input focus:outline-none focus:ring-0"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            {/* <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="form-input resize-none focus:outline-none focus:ring-0"
              required
            /> */}
            <ReactQuill
              ref={quillRef}
              value={formData.description}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, description: value }))
              }
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

          {/* Category */}
          <div>
            <label className="form-label">Category *</label>
            <div className="space-y-3">
              <select
                value={showNewCategoryInput ? "new" : formData.category}
                onChange={handleCategoryChange}
                className="form-input focus:outline-none focus:ring-0"
                required={!showNewCategoryInput}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="new">+ Add New Category</option>
              </select>

              {showNewCategoryInput && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="Enter new category name"
                    className="form-input focus:outline-none focus:ring-0 flex-1"
                    required
                  />
                  <button
                    type="button"
                    onClick={addNewCategory}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryInput("");
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label className="form-label">Technologies</label>
            <div className="space-y-3">
              {/* Technology Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyPress}
                  className="form-input focus:outline-none focus:ring-0 flex-1"
                  placeholder="Type a technology and press Enter or comma to add"
                />
                <button
                  type="button"
                  onClick={addTechnology}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Technology Tags */}
              {formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="text-primary-500 hover:text-primary-700"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500">
                Add technologies one by one. Press Enter, comma, or Tab to add
                each technology.
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="form-label">Project Image</label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input focus:outline-none focus:ring-0"
              />
              {formData.imageUrl && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Live URL</label>
              <input
                type="url"
                name="liveUrl"
                value={formData.liveUrl}
                onChange={handleInputChange}
                className="form-input focus:outline-none focus:ring-0"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                className="form-input focus:outline-none focus:ring-0"
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2"
              />
              Featured Project
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="mr-2"
              />
              Published
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="underConstruction"
                checked={formData.underConstruction}
                onChange={handleInputChange}
                className="mr-2"
              />
              <FaTools className="w-4 h-4 mr-1" />
              Under Construction
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-end pt-6 border-t border-gray-200">
            <Link
              to="/admin/dashboard/projects"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className={`btn-primary ${
                loading || uploading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading || uploading
                ? "Saving..."
                : isEdit
                ? "Update Project"
                : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Main projects manager component with routing
 */
const ProjectsManager = () => {
  return (
    <Routes>
      <Route index element={<ProjectsList />} />
      <Route path="new" element={<ProjectForm />} />
      <Route path="edit/:id" element={<ProjectForm isEdit={true} />} />
    </Routes>
  );
};

export default ProjectsManager;
