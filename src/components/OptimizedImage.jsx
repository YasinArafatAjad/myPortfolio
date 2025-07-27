import { useState } from 'react';

/**
 * Optimized image component with lazy loading and WebP support
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  fallback = null,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);

  // Generate WebP and fallback URLs
  const generateSources = (originalSrc) => {
    if (!originalSrc) return { webp: null, original: originalSrc };
    
    if (originalSrc.includes('cloudinary.com')) {
      // Cloudinary optimization
      const webpSrc = originalSrc.replace('/upload/', '/upload/f_webp,q_auto/');
      return { webp: webpSrc, original: originalSrc };
    }
    
    return { webp: null, original: originalSrc };
  };

  const { webp, original } = generateSources(src);

  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Don't render if no src
  if (!src && !fallback) return null;

  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      {/* Loading placeholder */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error fallback */}
      {imageError && fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {fallback}
        </div>
      )}

      {/* Optimized image with WebP support */}
      {src && !imageError && (
        <picture>
          {webp && (
            <source srcSet={webp} type="image/webp" />
          )}
          <img
            src={original}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;