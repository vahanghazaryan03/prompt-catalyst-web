// src/hooks/useAnimationHistory.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import useAnimationStore from '../contexts/AnimationStore';
import { 
  loadAnimationHistory as loadLocalHistory,
  saveAnimationHistory as saveLocalHistory
} from '../utils/animationStorage';
import { logger } from '../utils/logger';

// Enhanced global cache for animation history
// This prevents unnecessary loading state when switching tabs
if (!window.animationHistoryCache) {
  window.animationHistoryCache = {
    history: null,
    lastFetchTime: 0,
    isFetching: false,
    lastBackgroundCheck: 0, // Track last background refresh
    loadStartTime: 0,       // For performance tracking
    loadEndTime: 0          // For performance tracking
  };
}

export function useAnimationHistory() {
  const [history, setHistory] = useState(() => {
    // Initialize with cached data if available
    return window.animationHistoryCache.history || [];
  });
  
  // Only show loading state if we don't have cached data
  const [loading, setLoading] = useState(!window.animationHistoryCache.history);
  const [error, setError] = useState(null);
  const { user, isProMember, isUltimateMember } = useAuth();
  
  // Enhanced function to load animations from both sources
  const loadAnimations = useCallback(async (options = { 
    showLoading: true, 
    forceRefresh: false,
    backgroundRefresh: false // New option for silent background refreshes
  }) => {
    // Record start time for performance tracking
    window.animationHistoryCache.loadStartTime = Date.now();
    // Skip loading state if we have cached data and not forcing refresh
    // Use a shorter cache validity time for better freshness
    const isCacheValid = window.animationHistoryCache.history && 
                        (Date.now() - window.animationHistoryCache.lastFetchTime < 5 * 60 * 1000); // 5 minutes
    
    // Return cached data if valid and not forcing refresh
    if (isCacheValid && !options.forceRefresh) {
   
      setHistory(window.animationHistoryCache.history);
      setLoading(false);
      return;
    }
    
    // Prevent multiple concurrent fetches
    if (window.animationHistoryCache.isFetching && !options.forceRefresh) {
      
      return;
    }
    
    // Only show loading if requested AND we don't have cached data OR forcing refresh
    // AND not doing a background refresh
    if (options.showLoading && 
        (!window.animationHistoryCache.history || options.forceRefresh) && 
        !options.backgroundRefresh) {
      setLoading(true);
    }
    
    // Mark as fetching to prevent multiple requests
    window.animationHistoryCache.isFetching = true;
    
    setError(null);
    
    try {
      // Always load local history first for immediate display
      const localHistory = loadLocalHistory();
      
      // Initialize with local history
      setHistory(localHistory);
      
      // Update cache with local history immediately
      window.animationHistoryCache.history = localHistory;
      
      // Only fetch from server if user is logged in and has Pro or Ultimate membership
      if (user && (isProMember || isUltimateMember)) {
        try {
          // Get map of local animations by URL for quick lookups
          const localAnimationUrls = new Map();
          localHistory.forEach(anim => {
            if (anim.url) {
              localAnimationUrls.set(anim.url, anim);
            }
          });
          
          // Fetch all animations from the cloud - the source of truth
          const response = await apiService.getUserAnimations();
          
          if (response && response.success && Array.isArray(response.animations)) {
            // Filter completed animations
            const completedAnimations = response.animations.filter(
              animation => animation.status === 'COMPLETED' && animation.videoUrl
            );
            
            if (completedAnimations.length === 0) {
              // Update cache timestamp
              window.animationHistoryCache.lastFetchTime = Date.now();
              window.animationHistoryCache.isFetching = false;
              setLoading(false);
              return;
            }
            
            // Transform cloud data to match expected format
            const cloudHistory = completedAnimations.map(animation => ({
              id: animation.requestId,
              url: animation.videoUrl,
              thumbnail: animation.thumbnailUrl || '',
              movement: 'Custom Animation',
              movementId: animation.presetId || 'custom',
              categoryId: animation.categoryId || null,
              presetId: animation.presetId || null,
              duration: animation.duration || '5',
              // Fix: Use server response resolution directly
              resolution: animation.resolution || '720p',
              requestedResolution: animation.requestedResolution || animation.resolution || '720p',
              // CRITICAL FIX: Include model field from server response
              model: animation.model,                     // Server's model field (e.g., "kling-2.1")
              aiModel: animation.model,                   // Backward compatibility alias
              prompt: animation.prompt || null,
              timestamp: animation.createdAt,
              lastViewed: animation.completedAt || animation.createdAt,
              creditCost: animation.creditCost || 350,
              cloudStored: true  // Flag to indicate this came from cloud
            }));
            
            // For cloud animations, trust the cloud as the source of truth
            // But preserve local thumbnails and additional metadata if available
            const mergedAnimations = cloudHistory.map(cloudAnim => {
              // Look for a matching local animation by URL
              const localAnim = cloudAnim.url ? localAnimationUrls.get(cloudAnim.url) : null;
              
              if (localAnim) {
                // If we have a local version, merge them strictly favoring cloud data for all fields
                // that come from the server, only keeping local data for UI-specific fields
                return {
                  // Start with base local structure, but server values will override most properties
                  ...localAnim,                 
                  // Core fields - always use cloud/server data as source of truth
                  id: cloudAnim.id,            
                  requestId: cloudAnim.requestId || cloudAnim.id,
                  url: cloudAnim.url,          
                  videoUrl: cloudAnim.videoUrl || cloudAnim.url,
                  prompt: cloudAnim.prompt,    // Always use server prompt
                  duration: cloudAnim.duration, // Always use server duration
                  resolution: cloudAnim.resolution, // Always use server resolution
                  // CRITICAL FIX: Ensure server model is always used as primary source
                  model: cloudAnim.model,      // Always use server model (e.g., "kling-2.1")
                  aiModel: cloudAnim.model || cloudAnim.aiModel, // Backward compatibility
                  creditCost: cloudAnim.creditCost, // Always use server credit cost
                  timestamp: cloudAnim.timestamp, // Always use server timestamp
                  // UI-specific fields that might not be in the server response
                  cloudStored: true,
                  // Preserve thumbnail from local if available (server doesn't store this)
                  thumbnail: localAnim.thumbnail || cloudAnim.thumbnail || '',
                  // Only use local aspect ratio if server doesn't provide it
                  aspectRatio: cloudAnim.aspectRatio || localAnim.aspectRatio
                };
              }
              
              // If no local match, use cloud data
              return cloudAnim;
            });
            
            // Find local animations that don't exist in the cloud
            // These might be animations that failed to upload or are still processing
            const localOnlyAnimations = localHistory.filter(localAnim => {
              // Skip if no URL (can't compare)
              if (!localAnim.url) return true;
              
              // Check if this URL exists in the cloud animations
              return !cloudHistory.some(cloudAnim => cloudAnim.url === localAnim.url);
            });
            
            // Get trashed animations to exclude them from history
            // Try getting them directly from localStorage for better reliability on initial load
            let trashedAnimations = [];
            try {
              const trashedFromStorage = localStorage.getItem('animation_trashed_items');
              if (trashedFromStorage) {
                trashedAnimations = JSON.parse(trashedFromStorage);
              } else {
                // Fallback to store if localStorage didn't have anything
                trashedAnimations = useAnimationStore.getState().trashedAnimations || [];
              }
            } catch (error) {
              // Fallback to store if localStorage parse failed
              trashedAnimations = useAnimationStore.getState().trashedAnimations || [];
            }
            
            // Create helper function to check if an animation is in the trash
            const isInTrash = (animation) => {
              return trashedAnimations.some(trashItem => 
                // Check by ID
                (trashItem.id && animation.id && trashItem.id === animation.id) ||
                // Check by URL as fallback
                (trashItem.url && animation.url && trashItem.url === animation.url)
              );
            };
            
            // Filter out animations that are in the trash
            const filteredMergedAnimations = mergedAnimations.filter(anim => !isInTrash(anim));
            const filteredLocalAnimations = localOnlyAnimations.filter(anim => !isInTrash(anim));
            
            // Always update for Pro users to ensure cloud is source of truth
            // Create a merged history with prioritized cloud animations and unique local ones
            // but excluding any that are already in the trash
            const updatedHistory = [...filteredMergedAnimations, ...filteredLocalAnimations].sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
              
            // Update local state and storage
            setHistory(updatedHistory);
            saveLocalHistory(updatedHistory);
            
            // Update global cache
            window.animationHistoryCache.history = updatedHistory;
            window.animationHistoryCache.lastFetchTime = Date.now();
            window.animationHistoryCache.isFetching = false;
      
      // Record end time and calculate load duration
      window.animationHistoryCache.loadEndTime = Date.now();
      const loadTime = window.animationHistoryCache.loadEndTime - window.animationHistoryCache.loadStartTime;
      logger.debug(`Animation history loaded in ${loadTime}ms with ${updatedHistory.length} items`);
            
            setLoading(false);
            return;
          }
        } catch (cloudError) {
          logger.error('Failed to fetch cloud animations:', cloudError);
          setError('Failed to fetch animations from server. Please try again.');
        }
      }
      
      // If we get here, we're already using local history, just finish loading
      // Update global cache with local history and timestamp
      window.animationHistoryCache.history = localHistory;
      window.animationHistoryCache.lastFetchTime = Date.now();
      window.animationHistoryCache.isFetching = false;
      
      setLoading(false);
    } catch (err) {
      logger.error('Animation history load error:', err);
      setError(err.message || 'Failed to load animation history');
      setHistory([]);
      
      // Reset isFetching on error
      window.animationHistoryCache.isFetching = false;
      
      setLoading(false);
    }
  }, [user, isProMember, isUltimateMember]);
  
  // Enhanced function to add a new animation with refresh trigger and debouncing
  const addAnimation = useCallback((animation) => {
    // Debounce setting the recently added flag to prevent multiple refreshes
    const now = Date.now();
    const lastAddTime = sessionStorage.getItem('animation_last_added_time');
    
    // Only set the flag if we haven't added anything in the last 2 seconds
    if (!lastAddTime || now - parseInt(lastAddTime, 10) > 2000) {
      try {
        sessionStorage.setItem('animation_recently_added', now.toString());
        sessionStorage.setItem('animation_last_added_time', now.toString());
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    setHistory(prev => {
      // First check if this animation is in the trash
      const trashedAnimations = useAnimationStore.getState().trashedAnimations || [];
      const isInTrash = trashedAnimations.some(trashItem => 
        (trashItem.id && animation.id && trashItem.id === animation.id) ||
        (trashItem.url && animation.url && trashItem.url === animation.url)
      );
      
      // If it's in the trash, don't add it to history
      if (isInTrash) {
        return prev; // Return current history unchanged
      }
      
      // Check if this animation already exists in history by URL or ID
      const existingIndex = prev.findIndex(item => 
        (item.url && item.url === animation.url) || 
        (item.id && item.id === animation.id)
      );
      
      let newHistory;
      
      if (existingIndex !== -1) {
        // Replace the existing entry with the new one (which might have more details)
        // but maintain some properties from the existing entry if they're not in the new one
        const existingItem = prev[existingIndex];
        const mergedItem = {
          ...existingItem,                // Start with existing data
          ...animation,                   // Overwrite with new data
          // For some fields, prefer existing values if the new ones aren't set
          thumbnail: animation.thumbnail || existingItem.thumbnail,
          // Update lastViewed
          lastViewed: new Date().toISOString()
        };
        
        // Update history by replacing the existing item
        newHistory = [...prev];
        newHistory[existingIndex] = mergedItem;
      } else {
        // Add to front of array 
        newHistory = [animation, ...prev];
      }
      
      // Sort by timestamp (newest first)
      newHistory = newHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Save to localStorage as backup
      saveLocalHistory(newHistory);
      
      // Update the global cache
      window.animationHistoryCache.history = newHistory;
      
      return newHistory;
    });
  }, []);
  
  // Function to move an animation to trash instead of deleting it
  const deleteAnimation = useCallback(async (id) => {
    // Find the animation in history
    const animationToTrash = history.find(anim => anim.id === id);
    
    if (!animationToTrash) {
      logger.warn(`Animation with ID ${id} not found for trashing`);
      return;
    }
    
    // Move to trash using the animation store
    useAnimationStore.getState().trashAnimation(animationToTrash);
    
    // Remove from regular history
    setHistory(prev => {
      const newHistory = prev.filter(anim => anim.id !== id);
      
      // Update local storage
      saveLocalHistory(newHistory);
      
      // Update global cache
      window.animationHistoryCache.history = newHistory;
      
      return newHistory;
    });
  }, [history]);
  
  // Refresh history on mount and when user changes - only if cache is invalid
  useEffect(() => {
    const isCacheValid = window.animationHistoryCache.history && 
                       (Date.now() - window.animationHistoryCache.lastFetchTime < 5 * 60 * 1000); // 5 minutes
    
    // Only load on initial mount if cache is invalid
    if (!isCacheValid) {
      loadAnimations({ showLoading: true });
    } else {
      // Just use the cached data
      setHistory(window.animationHistoryCache.history);
      setLoading(false);
      
      // If it's been a while since our last background check, do one silently
      const lastBackgroundCheck = window.animationHistoryCache.lastBackgroundCheck || 0;
      if (Date.now() - lastBackgroundCheck > 60 * 1000) { // 1 minute
        window.animationHistoryCache.lastBackgroundCheck = Date.now();
        // Refresh in the background without loading indicators
        setTimeout(() => {
          loadAnimations({ showLoading: false, backgroundRefresh: true });
        }, 2000); // Small delay to ensure UI is responsive first
      }
    }
  }, [loadAnimations]);
  
  // Make the manual refresh explicitly show loading and force a refresh, with debouncing
  const lastManualRefreshRef = useRef(0);
  const manualRefresh = useCallback(() => {
    const now = Date.now();
    
    // Prevent refreshing too frequently (minimum 2 seconds between refreshes)
    if (now - lastManualRefreshRef.current < 2000) {
      // If less than 2 seconds since last refresh, don't refresh again
      return Promise.resolve();
    }
    
    // Update last refresh time
    lastManualRefreshRef.current = now;
    
    // Clear background check timer when manually refreshing
    window.animationHistoryCache.lastBackgroundCheck = now;
    return loadAnimations({ showLoading: true, forceRefresh: true });
  }, [loadAnimations]);
  
  return {
    history,
    loading,
    error,
    refreshHistory: manualRefresh,
    addAnimation,
    deleteAnimation
  };
}