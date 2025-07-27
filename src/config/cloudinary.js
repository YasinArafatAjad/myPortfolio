/**
 * Cloudinary configuration for image uploads
 */
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
};

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - Uploaded image URL
 */
export const uploadToCloudinary = async (file, folder = 'portfolio') => {
  try {
    // Validate required configuration
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    // Validate file
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size too large. Please choose a file smaller than 10MB.');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image file.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific Cloudinary errors
      if (response.status === 400) {
        if (errorData.error?.message?.includes('Upload preset not found') || 
            errorData.error?.message?.includes('upload preset')) {
          throw new Error(`Upload preset "${cloudinaryConfig.uploadPreset}" not found. Please create an unsigned upload preset in your Cloudinary account or check your VITE_CLOUDINARY_UPLOAD_PRESET environment variable.`);
        }
        if (errorData.error?.message?.includes('Invalid upload preset')) {
          throw new Error('Upload preset is invalid or not configured for unsigned uploads. Please check your Cloudinary settings.');
        }
        throw new Error(errorData.error?.message || 'Invalid upload request');
      } else if (response.status === 401) {
        throw new Error('Unauthorized upload. Please check your Cloudinary configuration.');
      } else if (response.status === 403) {
        throw new Error('Upload forbidden. Please check your upload preset permissions.');
      } else {
        throw new Error(`Upload failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
      }
    }
    
    const data = await response.json();
    
    if (!data.secure_url) {
      throw new Error('Upload completed but no URL returned');
    }
    
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Re-throw with more specific error message
    if (error.message.includes('fetch')) {
      throw new Error('Network error during upload. Please check your internet connection.');
    }
    
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    // This would typically be done on the server side for security
    // For now, we'll just return true
    // console.log('Delete image:', publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Generate optimized image URL with better error handling
 * @param {string} url - Original image URL
 * @param {object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  // Return original URL if no URL provided
  if (!url) return url;
  
  // Return original URL if it's not a Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  try {
    const {
      width = 'auto',
      height = 'auto',
      quality = 'auto',
      format = 'auto'
    } = options;
    
    // Insert transformation parameters into Cloudinary URL
    const transformations = `w_${width},h_${height},q_${quality},f_${format}`;
    
    // Check if URL already has transformations
    if (url.includes('/upload/')) {
      // Replace existing transformations or add new ones
      if (url.match(/\/upload\/[^\/]+\//)) {
        // URL already has transformations, replace them
        return url.replace(/\/upload\/[^\/]+\//, `/upload/${transformations}/`);
      } else {
        // URL has no transformations, add them
        return url.replace('/upload/', `/upload/${transformations}/`);
      }
    }
    
    // If URL structure is unexpected, return original
    return url;
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
    // Return original URL if optimization fails
    return url;
  }
};