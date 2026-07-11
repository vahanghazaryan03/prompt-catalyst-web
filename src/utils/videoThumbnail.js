// src/utils/videoThumbnail.js

/**
 * Utility function to generate a thumbnail from a video URL
 * @param {string} videoUrl - The URL of the video
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - A Promise that resolves to a dataURL of the thumbnail
 */
export const generateVideoThumbnail = (videoUrl, options = {}) => {
  const {
    width = 320,
    height = 180,
    quality = 0.7,
    seekTime = 0.1, // Seek to 10% of the video duration by default
    timeout = 10000, // 10 second timeout
    corsProxy = null // Optional CORS proxy
  } = options;

  return new Promise((resolve, reject) => {
    // Create timeout handler
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Thumbnail generation timed out'));
    }, timeout);

    // Create video element
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // Enable CORS for video element
    video.muted = true;
    video.playsInline = true;
    
    // Handle video loading
    video.onloadedmetadata = () => {
      // Calculate the seek time (as a percentage of duration)
      const targetTime = video.duration * seekTime;
      video.currentTime = targetTime;
    };

    // Handle when we have a frame at the desired position
    video.onseeked = () => {
      try {
        // Create canvas for thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fill with dark background first (prevents transparency issues)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Calculate dimensions to maintain aspect ratio
        const videoRatio = video.videoWidth / video.videoHeight;
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
          video, 
          0, 0, video.videoWidth, video.videoHeight, // Source rectangle
          x, y, drawWidth, drawHeight // Destination rectangle
        );
        
        // Convert to data URL with reasonable quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Cleanup
        cleanup();
        
        // Return the thumbnail
        resolve(dataUrl);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    // Handle errors
    video.onerror = (error) => {
      console.error('Video error during thumbnail generation:', error);
      cleanup();
      reject(new Error(`Video loading error: ${video.error?.message || 'Unknown error'}`));
    };

    // Set the source and begin loading
    // If a CORS proxy is provided, use it
    video.src = corsProxy ? `${corsProxy}${videoUrl}` : videoUrl;
    video.load();
    
    // Attempt to play (needed for some browsers to properly seek)
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Play failed during thumbnail generation, continuing with seek:', error);
        // Even if play fails, we can still seek and grab a frame in most browsers
      });
    }

    // Cleanup function
    function cleanup() {
      clearTimeout(timeoutId);
      video.pause();
      video.src = '';
      video.remove();
    }
  });
};

/**
 * Cache for storing generated thumbnails
 */
const thumbnailCache = new Map();

/**
 * Get a thumbnail for a video URL, using cache if available
 * @param {string} videoUrl - The URL of the video
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - A Promise that resolves to a dataURL of the thumbnail
 */
export const getVideoThumbnail = async (videoUrl, options = {}) => {
  // Check cache first
  if (thumbnailCache.has(videoUrl)) {
    return thumbnailCache.get(videoUrl);
  }

  try {
    const thumbnail = await generateVideoThumbnail(videoUrl, options);
    // Store in cache
    thumbnailCache.set(videoUrl, thumbnail);
    return thumbnail;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};

/**
 * Clear the thumbnail cache
 */
export const clearThumbnailCache = () => {
  thumbnailCache.clear();
};
