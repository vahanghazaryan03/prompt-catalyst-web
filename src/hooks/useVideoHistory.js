// src/hooks/useVideoHistory.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import useVideoStore from '../contexts/VideoStore';
import { logger } from '../utils/logger';

// Global cache for video history
if (!window.videoHistoryCache) {
  window.videoHistoryCache = {
    history: null,
    lastFetchTime: 0,
    isFetching: false,
    lastBackgroundCheck: 0,
    loadStartTime: 0,
    loadEndTime: 0
  };
}

// Helper function to save video history to local storage
const saveVideoHistory = (history) => {
  try {
    localStorage.setItem('text_to_video_history', JSON.stringify(history));
    return true;
  } catch (error) {
    logger.error('Failed to save video history to localStorage:', error);
    
    // Try to save a minimal version if the full save fails
    try {
      const minimalHistory = history.map(video => ({
        id: video.id,
        requestId: video.requestId,
        videoUrl: video.videoUrl,
        prompt: video.prompt,
        duration: video.duration,
        resolution: video.resolution,
        aspectRatio: video.aspectRatio,
        timestamp: video.timestamp,
        lastViewed: video.lastViewed
      }));
      localStorage.setItem('text_to_video_history', JSON.stringify(minimalHistory));
      return true;
    } catch (e) {
      logger.error('Failed to save even minimal video history:', e);
      return false;
    }
  }
};

// Helper function to load video history from local storage
const loadVideoHistory = () => {
  try {
    const saved = localStorage.getItem('text_to_video_history');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    logger.error('Failed to load video history from localStorage:', error);
    return [];
  }
};

export function useVideoHistory() {
  const [history, setHistory] = useState(() => {
    return window.videoHistoryCache.history || [];
  });
  
  const [loading, setLoading] = useState(!window.videoHistoryCache.history);
  const [error, setError] = useState(null);
  const { user, isProMember, isUltimateMember } = useAuth();
  
  // Function to load videos from server and local storage
  const loadVideos = useCallback(async (options = { 
    showLoading: true, 
    forceRefresh: false,
    backgroundRefresh: false
  }) => {
    // Record start time for performance tracking
    window.videoHistoryCache.loadStartTime = Date.now();
    
    // Check if cache is valid
    const isCacheValid = window.videoHistoryCache.history && 
                        (Date.now() - window.videoHistoryCache.lastFetchTime < 5 * 60 * 1000); // 5 minutes
    
    // Return cached data if valid and not forcing refresh
    if (isCacheValid && !options.forceRefresh) {
      setHistory(window.videoHistoryCache.history);
      setLoading(false);
      return;
    }
    
    // Prevent multiple concurrent fetches
    if (window.videoHistoryCache.isFetching && !options.forceRefresh) {
      return;
    }
    
    // Only show loading if requested AND we don't have cached data OR forcing refresh
    if (options.showLoading && 
        (!window.videoHistoryCache.history || options.forceRefresh) && 
        !options.backgroundRefresh) {
      setLoading(true);
    }
    
    // Mark as fetching to prevent multiple requests
    window.videoHistoryCache.isFetching = true;
    
    setError(null);
    
    try {
      // Always load local history first for immediate display
      const localHistory = loadVideoHistory();
      
      // Initialize with local history
      setHistory(localHistory);
      
      // Update cache with local history immediately
      window.videoHistoryCache.history = localHistory;
      
      // Only fetch from server if user is logged in and has Pro or Ultimate membership
      if (user && (isProMember || isUltimateMember)) {
        try {
          // Get map of local videos by URL for quick lookups
          const localVideoUrls = new Map();
          localHistory.forEach(video => {
            if (video.videoUrl) {
              localVideoUrls.set(video.videoUrl, video);
            }
          });
          
          // Fetch all videos from the server
          const response = await apiService.getUserTextToVideos();
          
          if (response && response.success && Array.isArray(response.videos)) {
            // Filter completed videos
            const completedVideos = response.videos.filter(
              video => video.status === 'COMPLETED' && video.videoUrl
            );
            
            if (completedVideos.length === 0) {
              // Update cache timestamp and mark as not fetching
              window.videoHistoryCache.lastFetchTime = Date.now();
              window.videoHistoryCache.isFetching = false;
              setLoading(false);
              return;
            }
            
            // Transform server data to match expected format
            const serverVideos = completedVideos.map(video => ({
              id: video.requestId,
              requestId: video.requestId,
              videoUrl: video.videoUrl,
              prompt: video.prompt,
              duration: video.duration || '5',
              resolution: video.resolution || '720p',
              aspectRatio: video.aspectRatio || '16:9',
              negativePrompt: video.negativePrompt || '',
              cfgScale: video.cfgScale || 0.5,
              // CRITICAL FIX: Add model fields for text-to-video with correct fallback
              model: video.model || 'seedance-1.0',        // Text-to-video always uses Seedance 1.0 for now
              aiModel: video.model || 'seedance-1.0',      // Backward compatibility alias
              timestamp: video.createdAt,
              lastViewed: video.completedAt || video.createdAt,
              creditCost: video.creditCost,
              serverStored: true // Flag to indicate this is from server
            }));
            
            // Merge with local videos, preferring server data but keeping local thumbnails
            const mergedVideos = serverVideos.map(serverVideo => {
              // Look for matching local video by URL
              const localVideo = serverVideo.videoUrl ? localVideoUrls.get(serverVideo.videoUrl) : null;
              
              if (localVideo) {
                // Merge, favoring server data for most fields
                return {
                  ...localVideo,                     // Start with local data
                  id: serverVideo.id,                // Use server ID
                  requestId: serverVideo.requestId,  // Use server request ID
                  videoUrl: serverVideo.videoUrl,    // Use server URL
                  serverStored: true,                // Mark as server-stored
                  // CRITICAL FIX: Ensure model fields are set for text-to-video merging
                  model: serverVideo.model || localVideo.model || 'seedance-1.0',
                  aiModel: serverVideo.aiModel || localVideo.aiModel || 'seedance-1.0',
                  // Preserve thumbnail from local if available
                  thumbnail: localVideo.thumbnail || null,
                  timestamp: serverVideo.timestamp || localVideo.timestamp,
                  lastViewed: new Date().toISOString() // Update last viewed time
                };
              }
              
              // If no local match, use server data
              return serverVideo;
            });
            
            // Find local videos that don't exist on the server
            const localOnlyVideos = localHistory.filter(localVideo => {
              // Skip if no URL (can't compare)
              if (!localVideo.videoUrl) return true;
              
              // Check if URL exists in server videos
              return !serverVideos.some(serverVideo => serverVideo.videoUrl === localVideo.videoUrl);
            });
            
            // Get trashed videos to exclude them from history
            let trashedVideos = [];
            try {
              const trashedFromStorage = localStorage.getItem('text_to_video_trashed_items');
              if (trashedFromStorage) {
                trashedVideos = JSON.parse(trashedFromStorage);
              } else {
                trashedVideos = useVideoStore.getState().trashedVideos || [];
              }
            } catch (error) {
              trashedVideos = useVideoStore.getState().trashedVideos || [];
            }
            
            // Function to check if a video is in trash
            const isInTrash = (video) => {
              return trashedVideos.some(trashItem => 
                (trashItem.id && video.id && trashItem.id === video.id) ||
                (trashItem.videoUrl && video.videoUrl && trashItem.videoUrl === video.videoUrl)
              );
            };
            
            // Filter out videos that are in trash
            const filteredMergedVideos = mergedVideos.filter(video => !isInTrash(video));
            const filteredLocalVideos = localOnlyVideos.filter(video => !isInTrash(video));
            
            // Create final merged history, sorted by timestamp (newest first)
            const updatedHistory = [...filteredMergedVideos, ...filteredLocalVideos].sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            // Update state and storage
            setHistory(updatedHistory);
            saveVideoHistory(updatedHistory);
            
            // Update global cache
            window.videoHistoryCache.history = updatedHistory;
            window.videoHistoryCache.lastFetchTime = Date.now();
            window.videoHistoryCache.isFetching = false;
            
            // Record end time and log performance
            window.videoHistoryCache.loadEndTime = Date.now();
            const loadTime = window.videoHistoryCache.loadEndTime - window.videoHistoryCache.loadStartTime;
            logger.debug(`Video history loaded in ${loadTime}ms with ${updatedHistory.length} items`);
            
            setLoading(false);
            return;
          }
        } catch (serverError) {
          logger.error('Failed to fetch videos from server:', serverError);
          setError('Failed to fetch videos from server. Please try again.');
        }
      }
      
      // If no server fetch or it failed, just use local history
      window.videoHistoryCache.history = localHistory;
      window.videoHistoryCache.lastFetchTime = Date.now();
      window.videoHistoryCache.isFetching = false;
      
      setLoading(false);
    } catch (err) {
      logger.error('Video history load error:', err);
      setError(err.message || 'Failed to load video history');
      setHistory([]);
      
      window.videoHistoryCache.isFetching = false;
      setLoading(false);
    }
  }, [user, isProMember, isUltimateMember]);
  
  // Function to add a new video to history
  const addVideo = useCallback(async (video) => {
    // Flag to track recently added videos
    const now = Date.now();
    const lastAddTime = sessionStorage.getItem('video_last_added_time');
    
    // Only set the flag if we haven't added anything in the last 2 seconds
    if (!lastAddTime || now - parseInt(lastAddTime, 10) > 2000) {
      try {
        sessionStorage.setItem('video_recently_added', now.toString());
        sessionStorage.setItem('video_last_added_time', now.toString());
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    // If the video has a dataUrl property but no thumbnail, convert it to a thumbnail
    let processedVideo = { ...video };
    if (video.dataUrl && !video.thumbnail) {
      try {
        // Create an image from the dataUrl that we can use to generate a thumbnail
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = video.dataUrl;
        });
        
        // Create a canvas for the thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        
        // Fill the background
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image maintaining aspect ratio
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, x, y;
        
        if (imgRatio > canvasRatio) {
          // Image is wider than canvas ratio
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          x = 0;
          y = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller than canvas ratio
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          x = (canvas.width - drawWidth) / 2;
          y = 0;
        }
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Convert to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Update the video object with the thumbnail
        processedVideo.thumbnail = thumbnailDataUrl;
      } catch (error) {
        logger.error('Failed to convert dataUrl to thumbnail:', error);
        // Don't set thumbnail if conversion fails
      }
    }
    
    setHistory(prev => {
      // Check if video is in trash
      const trashedVideos = useVideoStore.getState().trashedVideos || [];
      const isInTrash = trashedVideos.some(trashItem => 
        (trashItem.id && processedVideo.id && trashItem.id === processedVideo.id) ||
        (trashItem.videoUrl && processedVideo.videoUrl && trashItem.videoUrl === processedVideo.videoUrl)
      );
      
      // If in trash, don't add to history
      if (isInTrash) {
        return prev;
      }
      
      // Check if video already exists by URL or ID
      const existingIndex = prev.findIndex(item => 
        (item.videoUrl && item.videoUrl === processedVideo.videoUrl) || 
        (item.id && item.id === processedVideo.id)
      );
      
      let newHistory;
      
      if (existingIndex !== -1) {
        // Update existing video
        const existingItem = prev[existingIndex];
        const mergedItem = {
          ...existingItem,
          ...processedVideo,
          // Preserve thumbnail if new one isn't set
          thumbnail: processedVideo.thumbnail || existingItem.thumbnail,
          // Update lastViewed
          lastViewed: new Date().toISOString()
        };
        
        newHistory = [...prev];
        newHistory[existingIndex] = mergedItem;
      } else {
        // Add to front of array
        newHistory = [processedVideo, ...prev];
      }
      
      // Sort by timestamp (newest first)
      newHistory = newHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Save to localStorage
      saveVideoHistory(newHistory);
      
      // Update global cache
      window.videoHistoryCache.history = newHistory;
      
      return newHistory;
    });
  }, []);
  
  // Function to move a video to trash
  const deleteVideo = useCallback(async (id) => {
    // Find the video in history
    const videoToTrash = history.find(video => video.id === id);
    
    if (!videoToTrash) {
      logger.warn(`Video with ID ${id} not found for trashing`);
      return;
    }
    
    // Move to trash using the video store
    useVideoStore.getState().trashVideo(videoToTrash);
    
    // Remove from regular history
    setHistory(prev => {
      const newHistory = prev.filter(video => video.id !== id);
      
      // Update local storage
      saveVideoHistory(newHistory);
      
      // Update global cache
      window.videoHistoryCache.history = newHistory;
      
      return newHistory;
    });
  }, [history]);
  
  // Load history on mount
  useEffect(() => {
    const isCacheValid = window.videoHistoryCache.history && 
                       (Date.now() - window.videoHistoryCache.lastFetchTime < 5 * 60 * 1000); // 5 minutes
    
    if (!isCacheValid) {
      loadVideos({ showLoading: true });
    } else {
      // Use cached data
      setHistory(window.videoHistoryCache.history);
      setLoading(false);
      
      // Check if it's time for a background refresh
      const lastBackgroundCheck = window.videoHistoryCache.lastBackgroundCheck || 0;
      if (Date.now() - lastBackgroundCheck > 60 * 1000) { // 1 minute
        window.videoHistoryCache.lastBackgroundCheck = Date.now();
        // Refresh in background without loading indicators
        setTimeout(() => {
          loadVideos({ showLoading: false, backgroundRefresh: true });
        }, 2000); // Small delay to ensure UI is responsive first
      }
    }
  }, [loadVideos]);
  
  // Manual refresh function with debouncing
  const lastManualRefreshRef = useRef(0);
  const manualRefresh = useCallback(() => {
    const now = Date.now();
    
    // Prevent refreshing too frequently (minimum 2 seconds between refreshes)
    if (now - lastManualRefreshRef.current < 2000) {
      return Promise.resolve();
    }
    
    // Update last refresh time
    lastManualRefreshRef.current = now;
    
    // Clear background check timer when manually refreshing
    window.videoHistoryCache.lastBackgroundCheck = now;
    return loadVideos({ showLoading: true, forceRefresh: true });
  }, [loadVideos]);
  
  return {
    history,
    loading,
    error,
    refreshHistory: manualRefresh,
    addVideo,
    deleteVideo
  };
}