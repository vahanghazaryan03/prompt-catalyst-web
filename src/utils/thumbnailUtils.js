// src/utils/thumbnailUtils.js

import { storeThumbnailForUrl, getThumbnailForUrl, createFallbackThumbnail, loadAnimationHistory, saveAnimationHistory } from './animationStorage';

// Enhanced thumbnail generator with proper CORS handling and multiple fallback methods
export const generateThumbnail = async (videoUrl, options = {}) => {
  const {
    width = 320,
    height = 180,
    useProxy = true,
    timeout = 15000,
    attemptCORSBypass = true,
    forceRegenerate = false
  } = options;
  
  // Check if we already have a cached thumbnail
  if (!forceRegenerate) {
    const cachedThumbnail = getThumbnailForUrl(videoUrl);
    if (cachedThumbnail) {
      console.log('Using cached thumbnail:', videoUrl);
      return cachedThumbnail;
    }
  }
  
  // Create a hidden video element
  const video = document.createElement('video');
  video.setAttribute('crossOrigin', 'anonymous'); // Try with crossOrigin
  video.style.display = 'none';
  video.muted = true;
  video.playsInline = true;
  document.body.appendChild(video);

  try {
    // Set up timeout to avoid hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Thumbnail generation timeout')), timeout);
    });

    // Function to clean up the video element
    const cleanup = () => {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (document.body.contains(video)) {
          document.body.removeChild(video);
        }
      } catch (e) {
        console.warn('Error during video cleanup:', e);
      }
    };

    // Set the video source and wait for metadata
    const loadPromise = new Promise((resolve, reject) => {
      // Handle errors
      video.onerror = (e) => {
        console.warn('Video load error:', e);
        reject(new Error('Video failed to load'));
      };

      // Handle successful metadata load
      video.onloadedmetadata = () => {
        // Now seek to an appropriate position
        const seekPosition = Math.min(video.duration / 3, 2); // Aim for 1/3 of video but max 2 sec
        video.currentTime = seekPosition;
      };

      // Handle successful seek
      video.onseeked = () => {
        resolve(video);
      };

      // Start loading
      video.src = videoUrl;
      video.load();
    });

    // Race against timeout
    const loadedVideo = await Promise.race([loadPromise, timeoutPromise]);
    
    // Create the thumbnail from the successfully loaded video
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with background color first to avoid transparency issues
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, width, height);
    
    // Draw the video frame, maintaining aspect ratio
    const videoRatio = loadedVideo.videoWidth / loadedVideo.videoHeight;
    let drawWidth = width;
    let drawHeight = height;
    
    if (videoRatio > width/height) {
      drawHeight = width / videoRatio;
    } else {
      drawWidth = height * videoRatio;
    }
    
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    
    ctx.drawImage(loadedVideo, 0, 0, loadedVideo.videoWidth, loadedVideo.videoHeight, 
                 x, y, drawWidth, drawHeight);
    
    // Generate the data URL
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    
    // Cleanup
    cleanup();
    
    // Validate the thumbnail
    if (thumbnailDataUrl.length < 100 || !thumbnailDataUrl.startsWith('data:image/')) {
      throw new Error('Generated thumbnail is invalid');
    }
    
    // Cache the successful thumbnail
    storeThumbnailForUrl(videoUrl, thumbnailDataUrl);
    
    return thumbnailDataUrl;
  } catch (error) {
    console.warn(`Thumbnail generation failed for ${videoUrl}:`, error);
    
    // Cleanup
    if (document.body.contains(video)) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      document.body.removeChild(video);
    }
    
    // If we haven't tried CORS bypass yet and it's enabled, try the alternative method
    if (attemptCORSBypass) {
      try {
        console.log('Attempting alternative thumbnail generation method...');
        return await generateThumbnailAlternative(videoUrl, width, height);
      } catch (altError) {
        console.warn('Alternative thumbnail generation failed:', altError);
        // Fall through to default thumbnail
      }
    }
    
    // As a last resort, create a fallback thumbnail
    return createFallbackThumbnail(
      getVideoDisplayName(videoUrl),
      width, 
      height
    );
  }
};

// Alternative method that attempts to use a proxy or different approach for CORS-restricted videos
const generateThumbnailAlternative = async (videoUrl, width, height) => {
  // Detect video sites that are known to have CORS issues
  const isFalMedia = videoUrl.includes('fal.media');
  const isPandaFile = videoUrl.includes('files/panda/');
  
  // For videos from fal.media specifically, use this approach
  if (isFalMedia || isPandaFile) {
    return await generateFalMediaThumbnail(videoUrl, width, height);
  }
  
  throw new Error('No alternative thumbnail method available for this URL');
};

// Improved handler for fal.media videos which properly handles CORS issues
const generateFalMediaThumbnail = async (videoUrl, width, height) => {
  // Create a thumbnail cache key
  const cacheKey = `fal_thumbnail_${videoUrl}`;
  
  // Check if we have this in sessionStorage cache
  try {
    const cachedThumbnail = sessionStorage.getItem(cacheKey);
    if (cachedThumbnail && cachedThumbnail.startsWith('data:image/')) {
      return cachedThumbnail;
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  // Create a hidden video element with proper attributes for CORS handling
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.style.display = 'none';
  video.muted = true;
  video.playsInline = true;
  document.body.appendChild(video);
  
  try {
    // Set up timeout to avoid hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Thumbnail generation timeout')), 15000);
    });

    // Function to clean up the video element
    const cleanup = () => {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (document.body.contains(video)) {
          document.body.removeChild(video);
        }
      } catch (e) {
        console.warn('Error during video cleanup:', e);
      }
    };

    // Promise to load the video and seek to a good frame
    const loadPromise = new Promise((resolve, reject) => {
      // Set up event handlers before setting the source
      video.onerror = (e) => {
        console.warn('Video load error:', e);
        reject(new Error(`Video failed to load: ${video.error?.message || 'Unknown error'}`));
      };
      
      // Handle metadata loaded - now we can seek
      video.onloadedmetadata = () => {
        // Seek to a frame 0.1 seconds in - this is usually loaded quickly
        video.currentTime = 0.1;
      };
      
      // Handle the seeked event - now we have a frame
      video.onseeked = () => {
        resolve(video);
      };
      
      // Set source and load
      video.src = videoUrl;
      video.load();
    });

    // Race the load promise against the timeout
    const loadedVideo = await Promise.race([loadPromise, timeoutPromise]);
    
    // Create the thumbnail from the loaded video frame
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with background color first to handle transparency
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, width, height);
    
    // Draw the video frame, maintaining aspect ratio
    const videoRatio = loadedVideo.videoWidth / loadedVideo.videoHeight;
    let drawWidth = width;
    let drawHeight = height;
    
    if (videoRatio > width/height) {
      drawHeight = width / videoRatio;
    } else {
      drawWidth = height * videoRatio;
    }
    
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    
    ctx.drawImage(loadedVideo, 0, 0, loadedVideo.videoWidth, loadedVideo.videoHeight, 
                 x, y, drawWidth, drawHeight);
    
    // Generate the data URL
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    
    // Validate the thumbnail
    if (thumbnailDataUrl.length < 100 || !thumbnailDataUrl.startsWith('data:image/')) {
      throw new Error('Generated thumbnail is invalid');
    }
    
    // Cache the successful thumbnail
    try {
      sessionStorage.setItem(cacheKey, thumbnailDataUrl);
    } catch (storageError) {
      console.warn('Failed to cache thumbnail in session storage:', storageError);
    }
    
    // Cleanup
    cleanup();
    
    return thumbnailDataUrl;
  } catch (error) {
    console.warn(`Fal.media thumbnail generation failed for ${videoUrl}:`, error);
    
    // Cleanup
    if (document.body.contains(video)) {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
        document.body.removeChild(video);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Create a fallback as last resort
    const videoId = extractVideoId(videoUrl);
    const placeholderText = videoId || 'Animation';
    
    // Create a more sophisticated placeholder with animation name and timing info
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
    
    // Add some visual elements for better appearance
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw grid lines
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
    
    // Add text with shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${Math.floor(height/12)}px sans-serif`;
    ctx.textAlign = 'center';
    
    // Split video ID to show at most 10 characters
    const displayText = placeholderText.length > 12 
      ? placeholderText.substring(0, 10) + '...' 
      : placeholderText;
    
    ctx.fillText(displayText, width/2, height * 0.85);
    
    // Add fal.media indicator
    ctx.font = `${Math.floor(height/18)}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('fal.media', width/2, height * 0.15);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }
};

// Helper to extract a video ID from URL
const extractVideoId = (url) => {
  try {
    // Extract the last part of the URL which is often the ID
    const parts = url.split('/');
    let filename = parts[parts.length - 1];
    
    // Remove any parameters
    filename = filename.split('?')[0];
    
    // Remove extension
    filename = filename.split('.')[0];
    
    // If it has underscores, take the first part which is often the ID
    if (filename.includes('_')) {
      const idParts = filename.split('_');
      return idParts[0];
    }
    
    return filename;
  } catch (e) {
    return 'Animation';
  }
};

// Helper to get a display name from a video URL
const getVideoDisplayName = (url) => {
  try {
    const parts = url.split('/');
    let filename = parts[parts.length - 1];
    
    // Remove extension
    filename = filename.split('.')[0];
    
    // Make it more readable
    return filename.replace(/[_-]/g, ' ');
  } catch (e) {
    return 'Animation';
  }
};

// Function to regenerate thumbnails for all animations in history
export const regenerateHistoryThumbnails = async () => {
  try {
    // Load the animation history
    const history = loadAnimationHistory();
    
    if (!Array.isArray(history) || history.length === 0) {
      console.log('No animations in history to process');
      return { success: true, processed: 0, updated: 0 };
    }
    
    console.log(`Processing ${history.length} animations for thumbnail regeneration`);
    
    let processed = 0;
    let updated = 0;
    
    // Process animations in batches to avoid overwhelming the browser
    const batchSize = 5;
    const batches = Math.ceil(history.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, history.length);
      const batch = history.slice(start, end);
      
      // Process this batch
      const updates = await Promise.all(batch.map(async (animation) => {
        processed++;
        
        // Skip if no video URL
        if (!animation.url) {
          console.log(`Animation ${animation.id} has no video URL, skipping`);
          return null;
        }
        
        // Skip if already has a valid data URL thumbnail
        if (animation.thumbnail && 
            typeof animation.thumbnail === 'string' && 
            animation.thumbnail.startsWith('data:image/') &&
            animation.thumbnail.length > 1000) {
          console.log(`Animation ${animation.id} already has a valid thumbnail`);
          return null;
        }
        
        try {
          // Generate a new thumbnail
          console.log(`Generating thumbnail for animation ${animation.id}`);
          const newThumbnail = await generateThumbnail(animation.url, {
            attemptCORSBypass: true,
            forceRegenerate: false,
            width: 320,
            height: 180
          });
          
          if (newThumbnail && newThumbnail !== animation.thumbnail) {
            updated++;
            console.log(`Generated new thumbnail for animation ${animation.id}`);
            return {
              id: animation.id,
              thumbnail: newThumbnail
            };
          }
        } catch (error) {
          console.warn(`Failed to generate thumbnail for animation ${animation.id}:`, error);
        }
        
        return null;
      }));
      
      // Apply any updates to the history
      const validUpdates = updates.filter(update => update !== null);
      
      if (validUpdates.length > 0) {
        // Update the history with new thumbnails
        const updatedHistory = history.map(item => {
          const update = validUpdates.find(u => u.id === item.id);
          if (update) {
            return { ...item, thumbnail: update.thumbnail };
          }
          return item;
        });
        
        // Save the updated history
        saveAnimationHistory(updatedHistory);
        console.log(`Batch ${i+1}/${batches}: Saved ${validUpdates.length} thumbnail updates`);
      } else {
        console.log(`Batch ${i+1}/${batches}: No thumbnails needed updating`);
      }
      
      // Small delay between batches to avoid locking up the browser
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return { 
      success: true, 
      processed,
      updated
    };
  } catch (error) {
    console.error('Error regenerating thumbnails:', error);
    return { 
      success: false, 
      error: error.message
    };
  }
};
