// Simple in-memory cache for thumbnails
const thumbnailCache = new Map();

/**
 * Store a thumbnail in the cache
 * @param {string} url - The video URL
 * @param {string} thumbnailDataUrl - The thumbnail data URL
 */
export const storeThumbnail = (url, thumbnailDataUrl) => {
  if (!url || !thumbnailDataUrl) return;
  
  console.log('Storing thumbnail for:', url);
  thumbnailCache.set(url, thumbnailDataUrl);
};

/**
 * Get a thumbnail from the cache
 * @param {string} url - The video URL
 * @returns {string|null} The thumbnail data URL or null if not found
 */
export const getThumbnail = (url) => {
  return thumbnailCache.get(url) || null;
};

/**
 * Utility to clear the entire cache
 */
export const clearCache = () => {
  thumbnailCache.clear();
};

// Export the cache object for debugging
export const debugCache = () => {
  return {
    size: thumbnailCache.size,
    keys: Array.from(thumbnailCache.keys())
  };
};
