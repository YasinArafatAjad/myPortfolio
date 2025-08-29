const AddProject = ({ isEdit = false }) => {
  const { id } = useParams(); // Get project ID from URL params for edit mode
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
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="form-input resize-none focus:outline-none focus:ring-0"
              required
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

export default AddProject;
