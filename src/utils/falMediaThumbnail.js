// src/utils/falMediaThumbnail.js
// Specialized utility for generating thumbnails from fal.media video URLs

// In-memory cache for thumbnails to improve performance
const thumbnailCache = new Map();

/**
 * Generates a thumbnail for a fal.media video URL with proper CORS handling
 * @param {string} videoUrl - The URL of the video (must be from fal.media)
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - A promise that resolves to a data URL of the thumbnail
 */
export const generateFalMediaThumbnail = async (videoUrl, options = {}) => {
  const {
    width = 320,
    height = 180,
    quality = 0.8,
    seekTime = 0.1, // Seek to 0.1 seconds by default for quicker loading
    timeout = 12000, // 12 second timeout
    forceRegenerate = false // Force regeneration even if cached
  } = options;

  // Validate URL - must be from fal.media
  if (!videoUrl || !videoUrl.includes('fal.media')) {
    throw new Error('Not a fal.media URL');
  }

  // Check in-memory cache first
  const cacheKey = `fal_${videoUrl}`;
  if (!forceRegenerate && thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey);
  }

  // Check session storage cache
  if (!forceRegenerate) {
    try {
      const cachedThumbnail = sessionStorage.getItem(cacheKey);
      if (cachedThumbnail && cachedThumbnail.startsWith('data:image/')) {
        // Also store in memory cache for faster access next time
        thumbnailCache.set(cacheKey, cachedThumbnail);
        return cachedThumbnail;
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Create a video element specifically configured for cross-origin video
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous'; // Critical for CORS support
  video.style.display = 'none';
  video.muted = true;
  video.playsInline = true;
  document.body.appendChild(video);

  try {
    // Create a timeout promise to avoid hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Thumbnail generation timed out')), timeout);
    });

    // Create a promise for the video loading and seeking
    const videoPromise = new Promise((resolve, reject) => {
      // Set up error handler
      video.onerror = (error) => {
        console.warn('Error loading video for thumbnail:', error, video.error);
        reject(new Error(`Video failed to load: ${video.error?.message || 'Unknown error'}`));
      };

      // Set up metadata handler - when metadata is loaded we can seek
      video.onloadedmetadata = () => {
        // Seek to the specified position for the thumbnail
        video.currentTime = seekTime;
      };

      // Set up seeked handler - when the seek is complete, we can capture the frame
      video.onseeked = () => {
        // Make sure we have a valid video frame
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          reject(new Error('Video frame unavailable'));
          return;
        }
        resolve(video);
      };

      // Try to catch any uncaught issues
      try {
        // Set the source and start loading
        video.src = videoUrl;
        video.load();
        
        // For some browsers, playing might help with seeking
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              // Ignore play errors, we only need the frame
              console.warn('Play failed during thumbnail generation:', error);
            });
          }
        } catch (playError) {
          // Ignore play errors
        }
      } catch (setupError) {
        reject(setupError);
      }
    });

    // Race the video loading against the timeout
    const loadedVideo = await Promise.race([videoPromise, timeoutPromise]);

    // Create a canvas and draw the video frame
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill with a background color first (prevents transparency issues)
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, width, height);

    // Calculate dimensions to maintain aspect ratio
    const videoRatio = loadedVideo.videoWidth / loadedVideo.videoHeight;
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

    // Draw the video frame
    ctx.drawImage(
      loadedVideo,
      0, 0, loadedVideo.videoWidth, loadedVideo.videoHeight, // Source rectangle
      x, y, drawWidth, drawHeight // Destination rectangle
    );

    // Convert to data URL
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);

    // Validate the thumbnail
    if (thumbnailDataUrl.length < 100 || !thumbnailDataUrl.startsWith('data:image/')) {
      throw new Error('Generated thumbnail is invalid');
    }

    // Clean up the video element
    try {
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (document.body.contains(video)) {
        document.body.removeChild(video);
      }
    } catch (cleanupError) {
      console.warn('Error cleaning up video element:', cleanupError);
    }

    // Store in caches
    thumbnailCache.set(cacheKey, thumbnailDataUrl);
    try {
      sessionStorage.setItem(cacheKey, thumbnailDataUrl);
    } catch (storageError) {
      console.warn('Failed to store thumbnail in session storage:', storageError);
    }

    return thumbnailDataUrl;
  } catch (error) {
    console.warn(`Failed to generate thumbnail for fal.media video:`, error);

    // Clean up the video element
    try {
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (document.body.contains(video)) {
        document.body.removeChild(video);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    // Create a fallback thumbnail
    return createFallbackThumbnail(videoUrl, width, height);
  }
};

/**
 * Creates a fallback thumbnail for fal.media videos
 * @param {string} videoUrl - The URL of the video
 * @param {number} width - Width of the thumbnail
 * @param {number} height - Height of the thumbnail
 * @returns {string} - A data URL containing the fallback thumbnail
 */
const createFallbackThumbnail = (videoUrl, width = 320, height = 180) => {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    const displayText = videoId || 'Animation';

    // Create canvas for the fallback
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add grid lines for visual interest
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let y = 20; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let x = 20; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw play icon
    ctx.beginPath();
    ctx.fillStyle = 'rgba(75, 85, 99, 0.6)';
    const iconSize = Math.min(width, height) * 0.3;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.moveTo(centerX - iconSize/4, centerY - iconSize/2);
    ctx.lineTo(centerX + iconSize/2, centerY);
    ctx.lineTo(centerX - iconSize/4, centerY + iconSize/2);
    ctx.closePath();
    ctx.fill();

    // Add text with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${Math.floor(height/12)}px sans-serif`;
    ctx.textAlign = 'center';

    // Truncate display text if too long
    const truncatedText = displayText.length > 12
      ? displayText.substring(0, 10) + '...'
      : displayText;

    ctx.fillText(truncatedText, width/2, height * 0.85);

    // Add fal.media indicator
    ctx.font = `${Math.floor(height/18)}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('fal.media', width/2, height * 0.15);

    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.error('Error creating fallback thumbnail:', error);
    
    // Ultimate fallback - create a simple colored rectangle with text
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="#0f172a"/>
        <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="${Math.floor(height/10)}" 
          fill="white" text-anchor="middle" dominant-baseline="middle">fal.media</text>
      </svg>
    `)}`;
  }
};

/**
 * Extracts a video ID from a fal.media URL
 * @param {string} url - The video URL
 * @returns {string} - The extracted video ID or a default string
 */
const extractVideoId = (url) => {
  try {
    if (!url) return 'Animation';

    // Extract the file name from the URL
    const urlParts = url.split('/');
    let fileName = urlParts[urlParts.length - 1];

    // Remove any query parameters
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }

    // Remove file extension
    if (fileName.includes('.')) {
      fileName = fileName.split('.')[0];
    }

    // If this is a panda file, try to extract just the ID portion
    if (fileName.includes('_')) {
      // For patterns like 'FoJKWGRWQhSFb7-OQD1JU_output'
      // Take just the first part which is usually the ID
      return fileName.split('_')[0];
    }

    return fileName || 'Animation';
  } catch (error) {
    return 'Animation';
  }
};

/**
 * Clear the thumbnail cache
 */
export const clearThumbnailCache = () => {
  thumbnailCache.clear();
  
  // Also clear sessionStorage cache
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('fal_')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove the keys in a separate loop to avoid index issues
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * A utility function to regenerate thumbnails for all fal.media videos
 * in the animation history. Call from browser console via window.fixFalMediaThumbnails()
 */
export const regenerateAllFalMediaThumbnails = async () => {
  // Import required functions
  const { loadAnimationHistory, saveAnimationHistory } = await import('./animationStorage');
  
  try {
    // Load the animation history
    const history = loadAnimationHistory();
    
    if (!Array.isArray(history)) {
      console.warn('Animation history is not an array, cannot regenerate thumbnails');
      return { success: false, error: 'Invalid history format' };
    }
    
    // Find all animations with fal.media URLs
    const falMediaAnimations = history.filter(
      animation => animation && animation.url && animation.url.includes('fal.media')
    );
    
    console.log(`Found ${falMediaAnimations.length} fal.media animations of ${history.length} total`);
    
    if (falMediaAnimations.length === 0) {
      return { success: true, count: 0, processed: 0 };
    }
    
    // Process animations in small batches to avoid overloading the browser
    const batchSize = 2;
    const batches = Math.ceil(falMediaAnimations.length / batchSize);
    
    let processed = 0;
    let updated = 0;
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, falMediaAnimations.length);
      const batch = falMediaAnimations.slice(start, end);
      
      console.log(`Processing batch ${i+1}/${batches} (${batch.length} animations)`);
      
      // Process this batch
      const batchResults = await Promise.allSettled(
        batch.map(async (animation) => {
          processed++;
          
          try {
            // Generate a thumbnail for this animation
            const thumbnail = await generateFalMediaThumbnail(animation.url, {
              forceRegenerate: true
            });
            
            if (thumbnail) {
              updated++;
              return {
                id: animation.id,
                thumbnail
              };
            }
          } catch (error) {
            console.warn(`Failed to generate thumbnail for animation ${animation.id}:`, error);
          }
          
          return null;
        })
      );
      
      // Extract successful thumbnail generations
      const successfulUpdates = batchResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);
      
      if (successfulUpdates.length > 0) {
        // Update animation history with new thumbnails
        const updatedHistory = history.map(item => {
          const update = successfulUpdates.find(u => u.id === item.id);
          if (update) {
            return { ...item, thumbnail: update.thumbnail };
          }
          return item;
        });
        
        // Save updated history
        saveAnimationHistory(updatedHistory);
        console.log(`Saved ${successfulUpdates.length} updated thumbnails in batch ${i+1}`);
      }
      
      // Pause between batches to allow UI to remain responsive
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return {
      success: true,
      total: falMediaAnimations.length,
      processed,
      updated
    };
  } catch (error) {
    console.error('Failed to regenerate fal.media thumbnails:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export a function that can be called from the browser console
export const setupThumbnailFixer = () => {
  window.fixFalMediaThumbnails = async () => {
    console.log('Starting fal.media thumbnail regeneration...');
    const result = await regenerateAllFalMediaThumbnails();
    console.log('Thumbnail regeneration completed:', result);
    return result;
  };
};

// Setup the fixer function when this module is loaded
setupThumbnailFixer();
