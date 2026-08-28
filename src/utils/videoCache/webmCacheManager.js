import { logger } from '../logger';
/**
 * WebM Cache Manager
 * Handles preloading and caching of WebM preview videos
 */

// In-memory cache of video URLs - exported for direct access in components
export const VIDEO_CACHE = new Map();

/**
 * Preloads a WebM video and caches its URL
 * @param {string} url - The URL of the WebM video to preload
 * @returns {Promise<string>} - Promise that resolves to the URL once loaded
 */
export const preloadVideo = async (url) => {
  // Return from cache if already loaded
  if (VIDEO_CACHE.has(url)) {
    return VIDEO_CACHE.get(url);
  }
  
  // Create a new promise to handle video loading
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    // Set up event handlers
    video.onloadeddata = () => {
      VIDEO_CACHE.set(url, url);
      resolve(url);
    };
    
    video.onerror = (error) => {
      logger.error(`Failed to load video: ${url}`, error);
      reject(error);
    };
    
    // Required attributes for proper loading
    video.autoplay = false;
    video.muted = true;
    video.preload = 'metadata';
    video.src = url;
    
    // Start loading the video
    video.load();
    
    // Set a timeout to resolve even if onloadeddata never fires
    // This helps prevent hanging promises
    setTimeout(() => {
      if (!VIDEO_CACHE.has(url)) {
        VIDEO_CACHE.set(url, url);
        resolve(url);
      }
    }, 3000);
  });
};

/**
 * Gets a cached video URL if available
 * @param {string} url - The URL to check in cache
 * @returns {string|null} - The cached URL or null if not in cache
 */
export const getCachedVideo = (url) => {
  // Direct cache hit
  if (VIDEO_CACHE.has(url)) {
    return VIDEO_CACHE.get(url);
  }
  
  return null;
};

/**
 * Pre-caches commonly used WebM previews
 * Call this function during app initialization
 */
export const preloadCommonVideos = () => {
  // Only preload videos we know exist
  const commonVideos = [
    '/previews/video-styles/cinematic-preview.webm',
    '/previews/video-styles/documentary-preview.webm',
    '/previews/camera-movements/static-shot-preview.webm',
    '/previews/camera-movements/pan-shot-preview.webm'
    // Removed problematic videos that were causing 404 errors
  ];
  
  // Preload the videos with a staggered delay
  commonVideos.forEach((url, index) => {
    setTimeout(() => {
      preloadVideo(url).catch((err) => {
        // Log but don't show errors to user
        logger.debug(`Failed to preload: ${url}`, err);
      });
    }, 1000 + (index * 300)); // Start after 1s, then 300ms apart
  });
};

/**
 * Invalidates all cached videos
 * Useful when videos might have changed
 */
export const clearVideoCache = () => {
  // Clear everything
  VIDEO_CACHE.clear();
};

/**
 * Returns video cache size
 * @returns {number} The current number of cached videos
 */
export const getVideoCacheSize = () => {
  return VIDEO_CACHE.size;
};;
