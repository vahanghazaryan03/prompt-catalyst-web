import { logger } from './logger';
// src/utils/animationStorage.js

/**
 * Utilities for managing animation history storage
 */

const STORAGE_KEY = 'animation_history';
const MAX_HISTORY_ITEMS = 500; // Maximum number of animations to keep in history
const MAX_RECENT_ITEMS = 5;   // Number of recent items to keep full thumbnails for

/**
 * Enhanced function to compress a data URL to reduce storage size
 * @param {string} dataUrl - The data URL to compress
 * @param {number} quality - The JPEG quality (0-1)
 * @param {number} maxWidth - Maximum width for resizing
 * @param {number} maxHeight - Maximum height for resizing
 * @returns {Promise<string>} Compressed data URL
 */
export const compressDataUrl = (dataUrl, quality = 0.6, maxWidth = 320, maxHeight = 180) => {
  return new Promise((resolve, reject) => {
    if (!dataUrl || typeof dataUrl !== 'string') {
      logger.warn('Invalid data URL for compression:', dataUrl);
      reject(new Error('Invalid data URL'));
      return;
    }
    
    if (!dataUrl.startsWith('data:image')) {
      logger.warn('Not an image data URL:', dataUrl.substring(0, 20) + '...');
      resolve(dataUrl); // Return as is if not an image
      return;
    }
    
    try {
      const img = new Image();
      
      // Set up load event
      img.onload = () => {
        try {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          const ctx = canvas.getContext('2d');
          
          // Fill with gray background first (prevents transparency issues)
          ctx.fillStyle = '#333333';
          ctx.fillRect(0, 0, width, height);
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Create compressed data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Verify the output is valid and not too small
          if (compressedDataUrl.length < 100 || !compressedDataUrl.startsWith('data:image')) {
            logger.warn('Compression produced invalid output:', compressedDataUrl.substring(0, 20));
            resolve(dataUrl); // Return original if compression failed
          } else {
            resolve(compressedDataUrl);
          }
          
          // Clean up
          canvas.remove();
        } catch (error) {
          logger.error('Error during image compression:', error);
          resolve(dataUrl); // Return original on error
        }
      };
      
      // Handle load errors
      img.onerror = (err) => {
        logger.warn('Failed to load image for compression:', err);
        resolve(dataUrl); // Return original on error
      };
      
      // Set source to start loading
      img.src = dataUrl;
      
      // Set timeout to avoid hanging
      setTimeout(() => {
        logger.warn('Image compression timed out');
        resolve(dataUrl);
      }, 5000);
    } catch (error) {
      logger.error('Error setting up image compression:', error);
      resolve(dataUrl); // Return original on error
    }
  });
};

/**
 * Load animation history from localStorage with optimizations
 * @returns {Array} The animation history array
 */
export const loadAnimationHistory = () => {
    try {
      const historyData = localStorage.getItem(STORAGE_KEY);
      
      // If no data exists, return empty array
      if (!historyData) return [];
      
      let parsedHistory;
      
      try {
        parsedHistory = JSON.parse(historyData);
      } catch (parseError) {
        logger.error('Failed to parse animation history data:', parseError);
        // If we can't parse the JSON, clear the corrupted data
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      
      // Triple validate the format - check if it's an array and has expected properties
      if (!Array.isArray(parsedHistory)) {
        logger.error('Animation history is not an array, resetting:', parsedHistory);
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      
      // Validate each item in the array to ensure it's a proper animation object
      const validatedHistory = parsedHistory.filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        // Must have at least these basic properties
        return (
          item.id && 
          (item.url || item.thumbnailDataUrl) && 
          typeof item.id !== 'undefined'
        );
      });
      
      // If we filtered out invalid items, update storage
      if (validatedHistory.length !== parsedHistory.length) {
        logger.warn(
          `Found ${parsedHistory.length - validatedHistory.length} invalid items in animation history, removing them`
        );
        saveAnimationHistory(validatedHistory);
      }
      
      return validatedHistory;
    } catch (error) {
      logger.error('Error loading animation history:', error);
      // In case of any unexpected error, return empty array
      return [];
    }
  };

/**
 * Save animation history to localStorage with size constraints
 * @param {Array} history - The animation history array to save
 */
export const saveAnimationHistory = (history) => {
    try {
      // First validate that we have an array
      if (!Array.isArray(history)) {
        logger.error('Attempted to save non-array history:', history);
        return false;
      }
      
      // Validate each item quickly
      const validHistory = history.filter(item => 
        item && typeof item === 'object' && item.id
      );
      
      // Limit history size to prevent localStorage issues
      const limitedHistory = validHistory.slice(0, MAX_HISTORY_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
        return true;
      } catch (storageError) {
        // If we hit quota limits, try more aggressive optimization
        logger.warn('Storage error when saving history, applying optimization:', storageError);
        
        // Optimize by removing thumbnails from older items
        const optimizedHistory = limitedHistory.map((item, index) => {
          if (index >= 3 && item.thumbnail) { // Keep only top 3 items with thumbnails
            return { ...item, thumbnail: null };
          }
          return item;
        });
        
        // Try again with optimized history
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(optimizedHistory));
          return true;
        } catch (secondError) {
          logger.error('Failed to save history even after optimization:', secondError);
          
          // As a last resort, try saving just the essential data
          try {
            const minimalHistory = limitedHistory.map(item => ({
              id: item.id,
              url: item.url,
              movement: item.movement || 'Unknown',
              movementId: item.movementId || 'unknown',
              duration: item.duration || '5',
              resolution: item.resolution || '720p',
              aiModel: item.aiModel || 'kling-1.6', // Keep AI model in minimal save
              timestamp: item.timestamp || new Date().toISOString(),
              lastViewed: item.lastViewed || new Date().toISOString(),
              // Omit all thumbnails and other large data
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalHistory.slice(0, 20)));
            return true;
          } catch (finalError) {
            logger.error('All attempts to save history failed:', finalError);
            return false;
          }
        }
      }
    } catch (error) {
      logger.error('Error processing animation history for save:', error);
      return false;
    }
  };

export const checkAndRepairAnimationHistory = () => {
    try {
      // Get raw data first
      const historyData = localStorage.getItem(STORAGE_KEY);
      if (!historyData) return true; // No data, nothing to repair
      
      try {
        // Attempt to parse
        const parsedHistory = JSON.parse(historyData);
        
        // Check if it's an array
        if (!Array.isArray(parsedHistory)) {
          logger.warn('Animation history is not an array, repairing');
          localStorage.removeItem(STORAGE_KEY);
          return true;
        }
        
        // If array, make sure items are valid
        const validItems = parsedHistory.filter(
          item => item && typeof item === 'object' && item.id
        );
        
        // If any invalid items were found, save the valid ones
        if (validItems.length !== parsedHistory.length) {
          saveAnimationHistory(validItems);
        }
        
        return true;
      } catch (parseError) {
        // If we can't parse the JSON, clear the corrupted data
        logger.error('Animation history data is corrupted, clearing:', parseError);
        localStorage.removeItem(STORAGE_KEY);
        return true;
      }
    } catch (error) {
      logger.error('Error checking animation history:', error);
      return false;
    }
  };

/**
 * Add an animation to history with improved thumbnail handling
 * @param {Object} animation - The animation object to add
 * @returns {Array} The updated history array
 */
export const addAnimationToHistory = async (animation) => {
  if (!animation || !animation.id || !animation.url) {
    logger.error('Invalid animation object for history', animation);
    return loadAnimationHistory();
  }
  
  try {
    const history = loadAnimationHistory();
    
    // Enhanced check for duplicates by both ID and URL
    const existingIndex = history.findIndex(item => 
      item.id === animation.id || (item.url && item.url === animation.url)
    );
    
    // Make a copy of the animation to avoid modifying the original
    let optimizedAnimation = { ...animation };
    
    // Enhanced thumbnail handling
    if (animation.thumbnail) {
      try {
        // For data URLs, ensure they're properly formed and not too large
        if (typeof animation.thumbnail === 'string' && animation.thumbnail.startsWith('data:')) {
          // Test if the thumbnail can be loaded as an image
          const isValidImage = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = animation.thumbnail;
            // Add timeout to avoid hanging
            setTimeout(() => resolve(false), 2000);
          });
          
          if (!isValidImage) {
            logger.warn('Invalid thumbnail detected, generating new one');
            // Replace with a fallback
            optimizedAnimation.thumbnail = createFallbackThumbnail(
              animation.movement || 'Animation',
              240, 
              135
            );
          }
          // If valid but large, compress it
          else if (animation.thumbnail.length > 10000) {
            try {
              optimizedAnimation.thumbnail = await compressDataUrl(animation.thumbnail, 0.6, 240, 135);
              logger.debug('Compressed thumbnail from', animation.thumbnail.length, 'to', optimizedAnimation.thumbnail.length);
            } catch (compressionError) {
              logger.warn('Failed to compress thumbnail:', compressionError);
              // If it's very large, create a new smaller one
              if (animation.thumbnail.length > 50000) {
                optimizedAnimation.thumbnail = createFallbackThumbnail(
                  animation.movement || 'Animation',
                  240, 
                  135
                );
              }
            }
          }
        }
        // For non-data URL thumbnails (e.g. URLs), keep as is but add a flag
        else if (typeof animation.thumbnail === 'string') {
          optimizedAnimation.thumbnailIsUrl = true;
        }
      } catch (thumbnailError) {
        logger.warn('Error processing thumbnail:', thumbnailError);
        // Create a fallback thumbnail
        optimizedAnimation.thumbnail = createFallbackThumbnail(
          animation.movement || 'Animation',
          240, 
          135
        );
      }
    } else {
      // No thumbnail provided, create a fallback
      optimizedAnimation.thumbnail = createFallbackThumbnail(
        animation.movement || 'Animation',
        240, 
        135
      );
    }
    
    // If it exists, remove it first (will be re-added at the top)
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    
    // Add new animation at the beginning of the array
    const updatedHistory = [optimizedAnimation, ...history];
    
    // Save and return updated history
    try {
      saveAnimationHistory(updatedHistory);
    } catch (storageError) {
      logger.warn('Storage error when saving animation history:', storageError);
      // Try with reduced quality
      try {
        // Replace all thumbnails with compressed versions
        const compressedHistory = await Promise.all(
          updatedHistory.map(async (item, index) => {
            // Only compress the first few items
            if (index < 5 && item.thumbnail && typeof item.thumbnail === 'string' && 
                item.thumbnail.startsWith('data:')) {
              try {
                const compressed = await compressDataUrl(item.thumbnail, 0.4, 120, 68);
                return { ...item, thumbnail: compressed };
              } catch (e) {
                return { ...item, thumbnail: null };
              }
            } else if (index >= 5) {
              // Remove thumbnails for older items
              return { ...item, thumbnail: null };
            }
            return item;
          })
        );
        
        saveAnimationHistory(compressedHistory);
      } catch (finalError) {
        logger.error('All attempts to save history with thumbnails failed:', finalError);
        // Last resort - save without thumbnails
        const minimalHistory = updatedHistory.map(item => ({
          ...item,
          thumbnail: null
        }));
        saveAnimationHistory(minimalHistory);
      }
    }
    
    return updatedHistory;
  } catch (error) {
    logger.error('Error adding animation to history:', error);
    return loadAnimationHistory();
  }
};

/**
 * Remove an animation from history - this functionality is disabled
 * @param {string|number} id - The id of the animation to remove, or 'all' to clear history
 * @returns {Array} The original history array
 */
export const removeAnimationFromHistory = (id) => {
  logger.debug("Animation deletion is disabled");
  return loadAnimationHistory();
};

/**
 * Creates a thumbnail from a video element with enhanced error handling and CORS support
 * @param {HTMLVideoElement} videoElement - The video element to create thumbnail from
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {Promise<string>} A promise that resolves to a data URL of the thumbnail
 */
export const createVideoThumbnail = (videoElement, width = 320, height = 180) => {
  return new Promise((resolve, reject) => {
    try {
      if (!videoElement) {
        logger.warn('No video element provided for thumbnail generation');
        reject(new Error('No video element provided'));
        return;
      }
      
      // Make sure video is ready
      const checkVideoState = () => {
        // Check if video has dimensions and readyState
        if (videoElement.videoWidth === 0 || 
            videoElement.videoHeight === 0 || 
            videoElement.readyState < 2) { // HAVE_CURRENT_DATA or higher
          
          logger.debug('Video not ready for thumbnail, waiting...');
          
          // Try again in a moment
          setTimeout(checkVideoState, 100);
          return;
        }
        
        // Now the video should be ready
        try {
          // Create a canvas to draw the thumbnail
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // Use a light gray background instead of transparent (helps avoid black thumbnails)
          ctx.fillStyle = '#333333';
          ctx.fillRect(0, 0, width, height);
          
          // Calculate dimensions to maintain aspect ratio
          const videoRatio = videoElement.videoWidth / videoElement.videoHeight;
          let drawWidth = width;
          let drawHeight = height;
          
          if (videoRatio > width/height) {
            // Video is wider than thumbnail
            drawHeight = width / videoRatio;
          } else {
            // Video is taller than thumbnail
            drawWidth = height * videoRatio;
          }
          
          // Center the image
          const x = (width - drawWidth) / 2;
          const y = (height - drawHeight) / 2;
          
          // Draw the frame
          ctx.drawImage(
            videoElement, 
            0, 0, videoElement.videoWidth, videoElement.videoHeight, // Source rectangle
            x, y, drawWidth, drawHeight // Destination rectangle
          );
          
          // Convert to data URL with reasonable quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Verify the data URL is valid by checking its length
          if (dataUrl.length < 100) {
            throw new Error('Generated thumbnail is too small, likely empty');
          }
          
          // Test that the image can be loaded
          const testImg = new Image();
          testImg.onload = () => {
            // Image loaded successfully
            resolve(dataUrl);
          };
          testImg.onerror = () => {
            // Image failed to load, use fallback
            logger.warn('Generated thumbnail failed to load as image');
            reject(new Error('Thumbnail failed verification'));
          };
          testImg.src = dataUrl;
        } catch (drawError) {
          logger.error('Error drawing video to canvas:', drawError);
          reject(drawError);
        }
      };
      
      // Start checking video state
      checkVideoState();
    } catch (error) {
      logger.error('Error in thumbnail generation:', error);
      reject(error);
    }
  });
};

/**
 * Creates an improved fallback thumbnail that's more distinctive
 * @param {string} text - Text to include in the thumbnail
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} A data URL of the fallback thumbnail
 */
export const createFallbackThumbnail = (text = 'Animation', width = 320, height = 180) => {
  try {
    // Create a canvas for the fallback thumbnail
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create a gradient background (more distinctive than solid color)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2a2a2a');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some visual elements
    // - Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 20; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 20; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw play icon
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    const iconSize = Math.min(width, height) * 0.3;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.moveTo(centerX - iconSize/4, centerY - iconSize/2);
    ctx.lineTo(centerX + iconSize/2, centerY);
    ctx.lineTo(centerX - iconSize/4, centerY + iconSize/2);
    ctx.closePath();
    ctx.fill();
    
    // Add text with shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${Math.floor(height/10)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(text, width/2, height * 0.85);
    
    // Use higher quality for these fallbacks since they're important
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    logger.error('Error creating fallback thumbnail:', error);
    
    // Ultimate fallback - create a simple SVG data URL
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#333"/>
      <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="${Math.floor(height/10)}" 
        fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>`;
    
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }
};

/**
 * Utility to clean up storage when needed
 * @returns {boolean} Success status
 */
export const cleanupStorage = () => {
  try {
    // List of session storage keys to check
    const SESSION_KEYS = {
      UPLOADED_IMAGE: 'animation_uploaded_image',
      SELECTED_MOVEMENT: 'animation_selected_movement',
      CUSTOM_PROMPT: 'animation_custom_prompt',
      DURATION: 'animation_duration',
      IS_GENERATING: 'animation_is_generating',
      REQUEST_ID: 'animation_request_id',
      GENERATED_VIDEO: 'animation_generated_video'
    };
    
    // Clear non-critical session data first
    const keysToPreserve = [
      SESSION_KEYS.REQUEST_ID, 
      SESSION_KEYS.IS_GENERATING
    ];
    
    Object.values(SESSION_KEYS).forEach(key => {
      if (!keysToPreserve.includes(key)) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Optimize animation history
    const history = loadAnimationHistory();
    
    // Keep only essential data for older items
    const optimizedHistory = history.map((item, index) => {
      if (index >= MAX_RECENT_ITEMS && item.thumbnail) {
        return {
          ...item,
          thumbnail: null, // Remove thumbnail data for older items
          prompt: item.prompt?.length > 100 ? item.prompt.substring(0, 100) + '...' : item.prompt
        };
      }
      return item;
    });
    
    // Limit total number of items
    if (optimizedHistory.length > MAX_HISTORY_ITEMS) {
      const trimmedHistory = optimizedHistory.slice(0, MAX_HISTORY_ITEMS);
      saveAnimationHistory(trimmedHistory);
    } else if (optimizedHistory.length !== history.length) {
      saveAnimationHistory(optimizedHistory);
    }
    
    return true;
  } catch (error) {
    logger.error('Storage cleanup failed:', error);
    return false;
  }
};