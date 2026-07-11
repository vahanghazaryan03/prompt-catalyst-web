// src/hooks/useTextToVideo.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { createVideoThumbnail, createFallbackThumbnail, compressDataUrl } from '../utils/animationStorage';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import apiService from '../services/api';
import useVideoStore from '../contexts/VideoStore';
import { useVideoHistory } from './useVideoHistory';

// Global state for tracking active polling
if (!window._videoPollingState) {
  window._videoPollingState = {
    // Persistent flags for tracking background polling
    activeRequestId: null,          // Current request being processed
    isPollingActive: false,         // Whether polling is enabled globally
    lastPollingTime: 0,             // Last successful poll timestamp
    currentInterval: null,          // Main polling interval reference
    processingCompleted: false,     // Has processing been marked as completed
    lastProgressUpdate: 0,          // When was progress last updated
    // Store for generated video that completed while away
    completedVideo: null,           // Video data that completed processing
    activeTab: null,                // Current app tab
    videoInfo: {                    // Store info about the video being processed
      prompt: '',
      duration: '',
      resolution: '',
      aspectRatio: ''
    }
  };
}

// Helper function to clear all polling intervals
function clearAllVideoPollingIntervals() {
  // Clear the main polling interval
  if (window._videoPollingState.currentInterval) {
    clearInterval(window._videoPollingState.currentInterval);
    window._videoPollingState.currentInterval = null;
  }
  
  // Set polling inactive
  window._videoPollingState.isPollingActive = false;
}


export const useTextToVideo = () => {
  const {
    videoPrompt,
    duration,
    resolution,
    aspectRatio,
    cfgScale,
    isGenerating,
    processingRequestId,
    generatedVideo,
    progress,
    videoError,
    setGenerationState,
    setGeneratedVideo,
    setProgress,
    setVideoError,
    setVideoPrompt,
    setDuration,
    setResolution,
    setAspectRatio,
    setCfgScale,
    activeTab,
    setActiveTab
  } = useVideoStore();

  const { user } = useAuth();
  const { credits, refreshCredits } = useCredit();
  const { addToast } = useToast();
  const { addVideo, refreshHistory } = useVideoHistory();

  // Refs
  const isMounted = useRef(true);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [processingCompleted, setProcessingCompleted] = useState(false);
  const thumbnailVideoRef = useRef(null); // Reference for thumbnail generation

  // Clear all polling intervals
  const clearAllPollingIntervals = useCallback(() => {
    // Use the global helper function
    clearAllVideoPollingIntervals();
    
    // Also clear our local state
    setPollingInterval(null);
    
    // Mark polling as inactive in global state
    window._videoPollingState.isPollingActive = false;
    window._videoPollingState.processingCompleted = true;
  }, []);

  // Enhanced setGenerationState function - similar to Animate tab implementation
  const updateGenerationState = useCallback((isGenerating, requestId = null) => {
    // When starting a new generation, ensure all previous state is cleared
    if (isGenerating) {
      // If we're already generating but a new requestId is provided,
      // we need to clear the old one first
      const currentState = useVideoStore.getState();
      if (currentState.isGenerating && 
          currentState.processingRequestId && 
          requestId && 
          currentState.processingRequestId !== requestId) {
        // Clear any existing polling for the old request
        clearAllPollingIntervals();
      }
      
      // Starting generation with a new request ID
      setGenerationState(true, requestId);
      
      // Store the request ID in our global state for robust cross-tab tracking
      window._videoPollingState.activeRequestId = requestId;
      window._videoPollingState.isPollingActive = true;
      window._videoPollingState.processingCompleted = false;
      window._videoPollingState.lastPollingTime = Date.now();
      window._videoPollingState.activeTab = 'video';
      window._videoPollingState.videoInfo = {
        prompt: videoPrompt,
        duration: duration,
        resolution: resolution,
        aspectRatio: aspectRatio
      };
      
      // Persist in session storage for refreshes
      try {
        sessionStorage.setItem('videoProcessingRequestId', requestId);
        sessionStorage.setItem('videoGenerationTimestamp', Date.now().toString());
        sessionStorage.setItem('videoPollingActive', 'true');
      } catch (e) {
        // Ignore storage errors
      }
    } else {
      // Ending generation - clear everything
      setGenerationState(false);
      
      // Update global state
      window._videoPollingState.isPollingActive = false;
      
      // Also clear from session storage
      try {
        sessionStorage.removeItem('videoProcessingRequestId');
        sessionStorage.removeItem('videoGenerationTimestamp');
        sessionStorage.removeItem('videoPollingActive');
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [setGenerationState, clearAllPollingIntervals, videoPrompt, duration, resolution, aspectRatio]);

  // Enhanced video status check function with better completion handling
  const checkVideoStatus = useCallback(async (requestId) => {
    // If no requestId or processing already completed, exit
    if (!requestId || processingCompleted) {
      return;
    }
    
    // Update the last polling time to track activity
    window._videoPollingState.lastPollingTime = Date.now();
    
    // Get the current request ID from global state
    const globalRequestId = window._videoPollingState.activeRequestId;
    
    // If the request IDs don't match and we have a global one, use that instead
    if (globalRequestId && globalRequestId !== requestId) {
      requestId = globalRequestId;
    }
        
    // Store the validated request ID back in global state
    window._videoPollingState.activeRequestId = requestId;
    
    try {
      // Check the status of the request
      const statusResponse = await apiService.checkTextToVideoStatus(requestId);
      
      // Update last polling time
      window._videoPollingState.lastPollingTime = Date.now();
      
      // Only continue if component is mounted
      if (!isMounted.current) {
        return;
      }
      
      // Double-check processing completed flag
      if (processingCompleted || window._videoPollingState.processingCompleted) {
        clearAllPollingIntervals();
        return;
      }
      
      // Update progress if available
      if (statusResponse.progress) {
        setProgress(statusResponse.progress);
        window._videoPollingState.lastProgressUpdate = Date.now();
      }
      
      // Check if the video is completed
      if (statusResponse.status === 'COMPLETED') {
        // Generate thumbnail for the completed video
        let thumbnailUrl = null;
        try {
          // Create a hidden video element for thumbnail generation if it doesn't exist
          if (!thumbnailVideoRef.current) {
            thumbnailVideoRef.current = document.createElement('video');
            thumbnailVideoRef.current.style.display = 'none';
            document.body.appendChild(thumbnailVideoRef.current);
          }
          
          // Set up video element
          thumbnailVideoRef.current.crossOrigin = 'anonymous';
          thumbnailVideoRef.current.src = statusResponse.videoUrl;
          thumbnailVideoRef.current.muted = true;
          
          // Load the video
          await new Promise((resolve) => {
            thumbnailVideoRef.current.onloadeddata = resolve;
            // Set a timeout in case the video doesn't load
            const timeout = setTimeout(resolve, 5000);
            thumbnailVideoRef.current.load();
            thumbnailVideoRef.current.onloadeddata = () => {
              clearTimeout(timeout);
              resolve();
            };
          });
          
          // Seek to a specific point for the thumbnail
          const seekTime = Math.min(parseFloat(statusResponse.duration || duration) / 3, 2);
          thumbnailVideoRef.current.currentTime = seekTime;
          
          // Wait for seeking to complete
          await new Promise((resolve) => {
            thumbnailVideoRef.current.onseeked = resolve;
            // Set a timeout in case seeking doesn't complete
            const timeout = setTimeout(resolve, 5000);
            thumbnailVideoRef.current.onseeked = () => {
              clearTimeout(timeout);
              resolve();
            };
          });
          
          // Generate and compress thumbnail
          let thumbnail = await createVideoThumbnail(thumbnailVideoRef.current, 320, 180);
          if (thumbnail && thumbnail.length > 20000) {
            try {
              thumbnail = await compressDataUrl(thumbnail, 0.6, 320, 180);
            } catch (e) {}
          }
          
          thumbnailUrl = thumbnail;
          
          // Clean up
          thumbnailVideoRef.current.pause();
          thumbnailVideoRef.current.src = '';
          document.body.removeChild(thumbnailVideoRef.current);
          thumbnailVideoRef.current = null;
        } catch (thumbnailError) {
          console.error('Error generating thumbnail:', thumbnailError);
          // Generate fallback thumbnail
          try {
            const promptText = statusResponse.prompt || videoPrompt || 'Video';
            thumbnailUrl = createFallbackThumbnail(promptText.substring(0, 30), 320, 180);
          } catch (e) {}
          
          // Clean up on error
          if (thumbnailVideoRef.current) {
            try {
              thumbnailVideoRef.current.pause();
              thumbnailVideoRef.current.src = '';
              document.body.removeChild(thumbnailVideoRef.current);
              thumbnailVideoRef.current = null;
            } catch (e) {}
          }
        }
        
        // CRITICAL: Force an immediate UI sync update - this is the key fix
        // Directly update video store before any other operation
        try {
          // Ensure store state is updated FIRST before any other operations
          // ALWAYS use server values for critical fields without fallbacks
          useVideoStore.setState({
            isGenerating: false,
            processingRequestId: null,
            generatedVideo: {
              id: requestId,
              requestId: requestId,
              url: statusResponse.videoUrl,
              videoUrl: statusResponse.videoUrl,
              // Strict server values for core fields
              prompt: statusResponse.prompt,
              duration: statusResponse.duration,
              resolution: statusResponse.resolution,
              // Use model field from server (matches DB field) and keep aiModel for compatibility
              model: statusResponse.model || 'seedance-1.0',
              aiModel: statusResponse.model || 'seedance-1.0',
              // Only use local value for aspectRatio if not provided by server
              aspectRatio: statusResponse.aspectRatio || aspectRatio,
              timestamp: new Date().toISOString(),
              lastViewed: new Date().toISOString(),
              creditCost: statusResponse.creditCost || statusResponse.creditsUsed || calculateCreditCost(),
              thumbnail: thumbnailUrl // Add the thumbnail
            }
          });
        } catch (e) {
          // Silent error handling
        }
        
        // First update the global state - this is critical for the UI update mechanism
        window._videoPollingState.processingCompleted = true;
        
        // Now update the generating state BEFORE we create the video object and add to history
        // This helps the UI know to look for the completed video
        updateGenerationState(false);
        
        // Set the local completion flag
        setProcessingCompleted(true);
        
        // Clear all intervals to stop polling - do this before updating any other state
        clearAllPollingIntervals();
        
        // Validate videoUrl before updating state
        if (!statusResponse.videoUrl) {
          addToast('Video completed but URL is missing. Check history tab.', 'warning');
          return;
        }
        
        // Helper function to calculate credits used
        const getCredits = () => {
          // Always use server-provided creditCost if available
          if (statusResponse.creditCost) {
            return statusResponse.creditCost;
          }
          // Fallback: Calculate based on server duration and resolution only
          const videoDur = statusResponse.duration || '5';
          const videoRes = statusResponse.resolution || '720p';
          
          if (videoRes === '1080p') {
            return videoDur === '10' ? 3400 : 1700; // 1080p: 10s = 3400, 5s = 1700
          } else {
            return videoDur === '10' ? 900 : 450; // 720p: 10s = 900, 5s = 450
          }
        };
        
        // Create new video record with correct structure
        // ALWAYS prioritize server values for core fields without fallbacks
        const newVideo = {
          id: requestId,
          requestId: requestId,
          url: statusResponse.videoUrl,
          videoUrl: statusResponse.videoUrl,
          // Strict server values for core fields
          prompt: statusResponse.prompt,
          duration: statusResponse.duration,
          resolution: statusResponse.resolution,
          // Use model field from server (matches DB field) and keep aiModel for compatibility
          model: statusResponse.model || 'seedance-1.0',
          aiModel: statusResponse.model || 'seedance-1.0',
          // Only use local value for aspectRatio if not provided by server
          aspectRatio: statusResponse.aspectRatio || aspectRatio,
          timestamp: new Date().toISOString(),
          lastViewed: new Date().toISOString(),
          creditCost: statusResponse.creditCost || statusResponse.creditsUsed || getCredits(),
          thumbnail: thumbnailUrl // Add the thumbnail generated earlier
        };
        
        try {
          // IMPORTANT: Always update the UI regardless of which tab we think we're in
          // This fixes the main issue where the UI doesn't update when the video completes
          
          // Step 1: Update the store state directly with the new video
          // This is critical - must happen before any other updates
          useVideoStore.setState({
            isGenerating: false,
            processingRequestId: null,
            generatedVideo: newVideo
          });
          
          // Step 2: Update the component state via hooks
          setGeneratedVideo(newVideo);
          // Note: updateGenerationState was already called above
          
          // Step 3: Update history
          addVideo(newVideo);
          refreshHistory();
          
          // Step 4: Store the completed video in global state for tab switching
          window._videoPollingState.completedVideo = newVideo;
          
          // Step 5: Clean up session storage
          try {
            sessionStorage.removeItem('videoProcessingRequestId');
            sessionStorage.removeItem('videoGenerationTimestamp');
            sessionStorage.removeItem('videoPollingActive');
            sessionStorage.setItem('videoLastCompleted', JSON.stringify(newVideo));
          } catch (e) {}
          
          // Step 6: Refresh credits in the background
          refreshCredits().catch(() => {});
          
          // Step 7: Dispatch a custom event that components can listen for
          try {
            // Create a direct DOM event that can be listened for
            const event = new CustomEvent('videoGenerationComplete', { 
              detail: { video: newVideo } 
            });
            // Dispatch at document level to ensure it propagates
            document.dispatchEvent(event);
            
            // Also try window level as a backup
            window.dispatchEvent(new CustomEvent('videoGenerationComplete', { 
              detail: { video: newVideo } 
            }));
            
            // Force a global flag as a last resort
            window._forceVideoUpdate = {
              timestamp: Date.now(),
              video: newVideo
            };
          } catch (e) {
            // Silent error handling
          }
          
         
          
        } catch (error) {
          // Last resort error handling - force state update with the video
          try {
            // Try 3 different methods to update the UI
            // 1. Direct store update
            useVideoStore.setState({
              isGenerating: false,
              processingRequestId: null,
              generatedVideo: newVideo
            });
            
            // 2. Custom event
            document.dispatchEvent(new CustomEvent('videoGenerationComplete', { 
              detail: { video: newVideo } 
            }));
            
            // 3. Global state
            window._videoPollingState.completedVideo = newVideo;
            
            // Show a notification - even if other updates failed
            addToast('Video generation completed - refresh the page if you don\'t see it.', 'success');
          } catch (e) {
            // Silent error handling
          }
        }
      } else if (statusResponse.status === 'FAILED') {
        // Video failed - stop polling
        clearAllPollingIntervals();
        setProcessingCompleted(true);
        window._videoPollingState.processingCompleted = true;
        updateGenerationState(false);
        addToast('Video generation failed. Please try again.', 'error');
      } else {
        // Still processing - continue polling
        window._videoPollingState.lastPollingTime = Date.now();
      }
    } catch (error) {
      // Handle "not found" errors definitively
      const isNotFoundError = 
        error.response?.status === 404 || 
        (error.response?.data?.status === 'NOT_FOUND') ||
        (error.message && (
          error.message.includes('not found') || 
          error.message.includes('404')
        ));
      
      if (isNotFoundError) {
        clearAllPollingIntervals();
        setProcessingCompleted(true);
        window._videoPollingState.processingCompleted = true;
        updateGenerationState(false);
        addToast('Video request expired or not found.', 'warning');
        return;
      }
      
      // For network errors, just continue polling
      const isNetworkError = 
        error.name === 'NetworkError' || 
        (error.message && error.message.includes('network')) ||
        error.code === 'ECONNABORTED';
      
      if (isNetworkError) {
        // Will retry on next poll
        return;
      }
      
      // For server errors, stop polling
      const isServerError = error.response?.status && error.response.status >= 500;
      if (isServerError) {
        clearAllPollingIntervals();
        setProcessingCompleted(true);
        window._videoPollingState.processingCompleted = true;
        updateGenerationState(false);
        addToast('Lost connection to the video server. Please try again.', 'error');
      }
    }
  }, [
    processingCompleted, videoPrompt, duration, resolution, aspectRatio, 
    clearAllPollingIntervals, setProgress, setGeneratedVideo, updateGenerationState, 
    addVideo, refreshCredits, addToast, refreshHistory
  ]);

  // Calculate credit cost based on duration and resolution
  const calculateCreditCost = useCallback(() => {
    // Credits based on both duration and resolution
    if (resolution === '1080p') {
      return duration === '10' ? 3400 : 1700; // 1080p: 10s = 3400, 5s = 1700
    } else {
      return duration === '10' ? 900 : 450; // 720p: 10s = 900, 5s = 450
    }
  }, [duration, resolution]);

  // Check if user has enough credits
  const hasEnoughCredits = credits !== null && credits >= calculateCreditCost();

  // Simplified for app tab switching only - browser tab visibility handling removed
  useEffect(() => {
    // Set mounted flag on mount
    isMounted.current = true;
    
    // Check for completed video that finished while in another tab
    const checkForCompletedVideo = () => {
      try {
        const completedVideoJson = sessionStorage.getItem('videoCompletedWhileAway');
        if (completedVideoJson) {
          const completedVideo = JSON.parse(completedVideoJson);
          if (completedVideo && completedVideo.videoUrl) {
            // Update UI with completed video
            setGeneratedVideo(completedVideo);
            updateGenerationState(false);
            setProcessingCompleted(true);
            window._videoPollingState.processingCompleted = true;
            
            // Show notification
            addToast('Video was completed while you were away!', 'success');
            
            // Clear from session storage
            sessionStorage.removeItem('videoCompletedWhileAway');
          }
        }
      } catch (e) {}
    };
    
    // Check if we have a pending video generation on mount
    const resumePollingIfNeeded = () => {
      try {
        // First check if we have a completed video
        checkForCompletedVideo();
        
        // Check if we have an ongoing video generation
        const requestId = sessionStorage.getItem('videoProcessingRequestId');
        const timestamp = parseInt(sessionStorage.getItem('videoGenerationTimestamp') || '0', 10);
        const isActive = sessionStorage.getItem('videoPollingActive') === 'true';
        const storeIsGenerating = useVideoStore.getState().isGenerating;
        
        // Only resume if the request is less than 30 minutes old
        if (requestId && Date.now() - timestamp < 30 * 60 * 1000 && (isActive || storeIsGenerating)) {
          // Update global state
          window._videoPollingState.activeRequestId = requestId;
          window._videoPollingState.isPollingActive = true;
          window._videoPollingState.lastPollingTime = Date.now();
          window._videoPollingState.processingCompleted = false;
          
          // Make sure the store state matches
          if (!storeIsGenerating) {
            setGenerationState(true, requestId);
          }
          
          // Set up polling interval
          if (!window._videoPollingState.currentInterval) {
            const intervalId = setInterval(() => {
              if (window._videoPollingState.isPollingActive && !window._videoPollingState.processingCompleted) {
                checkVideoStatus(requestId);
              } else {
                clearInterval(intervalId);
                window._videoPollingState.currentInterval = null;
              }
            }, 3000);
            
            window._videoPollingState.currentInterval = intervalId;
          }
          
          // Check status immediately
          checkVideoStatus(requestId);
        }
      } catch (e) {
        // Silent error handling
      }
    };
    
    // Resume polling if needed
    resumePollingIfNeeded();
    
    // Cleanup function
    return () => {
      // Set mounted flag to false
      isMounted.current = false;
      
      // Don't clear intervals on unmount if we're still generating
      // This allows the process to continue in the background
      if (!useVideoStore.getState().isGenerating) {
        clearAllPollingIntervals();
      } else {
        // Update the global state to indicate we're no longer in the video tab
        window._videoPollingState.activeTab = 'background';
        // Add one immediate check to ensure we don't miss anything
        checkVideoStatus(window._videoPollingState.activeRequestId);
      }
      
      // Clean up thumbnail video element if it exists
      if (thumbnailVideoRef.current) {
        try {
          thumbnailVideoRef.current.pause();
          thumbnailVideoRef.current.src = '';
          document.body.removeChild(thumbnailVideoRef.current);
          thumbnailVideoRef.current = null;
        } catch (e) {}
      }
    };
  }, [clearAllPollingIntervals, checkVideoStatus, setProcessingCompleted, updateGenerationState, addToast, setGeneratedVideo, setGenerationState]);
  
  // Monitor active tab changes to handle returning to the Video tab
  useEffect(() => {
    // Subscribe to active tab changes
    const unsubscribe = useVideoStore.subscribe(
      state => state.activeTab,
      (activeTab) => {
        // Only process if returning to the video tab
        if (activeTab === 'video') {
          // Update global state
          window._videoPollingState.activeTab = activeTab;
          
          // Check if we have a completed video waiting
          try {
            if (window._videoPollingState.completedVideo) {
              // Video completed while we were in another tab
              const completedVideo = window._videoPollingState.completedVideo;
              
              // Update UI
              setGeneratedVideo(completedVideo);
              updateGenerationState(false);
              setProcessingCompleted(true);
              window._videoPollingState.processingCompleted = true;
              
              // Show notification
              addToast('Your video was completed while you were in another tab!', 'success');
              
              // Clear from global state
              window._videoPollingState.completedVideo = null;
            } else {
              // Check if we need to resume polling
              const requestId = window._videoPollingState.activeRequestId;
              
              if (requestId && window._videoPollingState.isPollingActive && !window._videoPollingState.processingCompleted) {
                // Make sure the store state is updated
                if (!useVideoStore.getState().isGenerating) {
                  setGenerationState(true, requestId);
                }
                
                // Restart polling if needed
                if (!window._videoPollingState.currentInterval) {
                  const intervalId = setInterval(() => {
                    if (window._videoPollingState.isPollingActive && !window._videoPollingState.processingCompleted) {
                      checkVideoStatus(requestId);
                    } else {
                      clearInterval(intervalId);
                      window._videoPollingState.currentInterval = null;
                    }
                  }, 3000);
                  
                  window._videoPollingState.currentInterval = intervalId;
                  
                  // Check immediately
                  checkVideoStatus(requestId);
                }
              }
            }
          } catch (e) {
            // Silent error handling
          }
        } else if (activeTab && activeTab !== 'video') {
          // Switched away from video tab - update global state
          window._videoPollingState.activeTab = activeTab;
        }
      }
    );
    
    // Cleanup subscription
    return unsubscribe;
  }, [addToast, checkVideoStatus, setGeneratedVideo, setGenerationState, setProcessingCompleted, updateGenerationState]);

  // Retry loading a video if it fails to display
  const retryLoadVideo = useCallback(async (videoObj) => {
    if (!videoObj || (!videoObj.videoUrl && !videoObj.url)) {
      addToast('No video available to retry loading', 'error');
      return;
    }
    
    // Reset the processing state to try again
    setProcessingCompleted(false);
    
    // Update UI with the video again
    setGeneratedVideo(null); // First clear it
    
    // Small delay before setting it again to force a refresh
    setTimeout(() => {
      setGeneratedVideo(videoObj); // Then set it again
      addToast('Reloaded video player', 'info');
    }, 300);
  }, [setGeneratedVideo, addToast]);
  
  // Generate video function - optimized with Animate-style implementation
  const generateVideo = useCallback(async (aiModel = 'seedance-1.0') => {
    if (!videoPrompt || videoPrompt.trim().length < 10) {
      addToast('Please enter a detailed prompt (minimum 10 characters)', 'error');
      return;
    }

    if (!hasEnoughCredits) {
      addToast(`Not enough credits. You need ${calculateCreditCost()} credits for this video.`, 'error');
      return;
    }

    if (videoPrompt.length >= 1200) {
      addToast('Prompt is too long. Please keep it under 1200 characters.', 'error');
      return;
    }

    // Reset all states
    setProcessingCompleted(false);
    window._videoPollingState.processingCompleted = false;
    setGeneratedVideo(null);
    setVideoError(null);
    setProgress(0);
    
    // Clear any existing intervals
    clearAllPollingIntervals();
    
    // Set up for new generation
    const generationAttemptId = Date.now().toString();
    updateGenerationState(true);
    
    try {
      // Request payload
      const videoParams = {
        prompt: videoPrompt,
        duration,
        aspectRatio,
        resolution,
        cfgScale
      };
      
      // Save current parameters to global state for recovery, including AI model
      window._videoPollingState.videoInfo = {
        prompt: videoPrompt,
        duration,
        resolution,
        aspectRatio,
        aiModel: aiModel
      };
      
      // Submit the request
      const response = await apiService.generateTextToVideo(videoParams);
      
      // If success, store the requestId and start polling
      if (response.success && response.requestId) {
        // Update the state with the request ID
        updateGenerationState(true, response.requestId);
        
        // Set global state for background processing
        window._videoPollingState.activeRequestId = response.requestId;
        window._videoPollingState.isPollingActive = true;
        window._videoPollingState.processingCompleted = false;
        window._videoPollingState.lastPollingTime = Date.now();
        window._videoPollingState.activeTab = 'video';
        
        // Persist in both session and local storage for recovery
        try {
          sessionStorage.setItem('videoProcessingRequestId', response.requestId);
          sessionStorage.setItem('videoGenerationTimestamp', Date.now().toString());
          sessionStorage.setItem('videoPollingActive', 'true');
        } catch (e) {}
        
        // Set up the polling interval
        if (!window._videoPollingState.currentInterval) {
          // Force-clear any existing intervals first
          if (window._videoPollingState.currentInterval) {
            clearInterval(window._videoPollingState.currentInterval);
          }
          
          const intervalId = setInterval(() => {
            // Double-check all conditions are still valid
            if (window._videoPollingState.isPollingActive && 
                !window._videoPollingState.processingCompleted && 
                window._videoPollingState.activeRequestId) {
              
              // Check if we've gone too long without a successful poll (5x normal interval)
              const timeSinceLastPoll = Date.now() - window._videoPollingState.lastPollingTime;
              
              checkVideoStatus(response.requestId);
            } else {
              // Conditions no longer valid
              clearInterval(intervalId);
              window._videoPollingState.currentInterval = null;
            }
          }, 3000);
          
          window._videoPollingState.currentInterval = intervalId;
          setPollingInterval(intervalId);
        }
        
        // Check status immediately
        checkVideoStatus(response.requestId);
      } else {
        throw new Error('Missing request ID in response');
      }
    } catch (error) {
      // Handle errors
      window._videoPollingState.isPollingActive = false;
      window._videoPollingState.processingCompleted = true;
      clearAllPollingIntervals();
      updateGenerationState(false);
      setProcessingCompleted(true);
      
      // Handle specific error types
      if (error.response?.status === 429) {
        addToast('Not enough credits. Please upgrade your account or try again later.', 'error');
      } else if (error.response?.status === 403) {
        addToast('Video generation requires a Pro membership.', 'error');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Invalid parameters for video generation';
        addToast(errorMessage, 'error');
      } else {
        addToast('Failed to start video generation. Please try again.', 'error');
      }
    }
  }, [
    videoPrompt, duration, aspectRatio, resolution, cfgScale,
    hasEnoughCredits, calculateCreditCost, setProcessingCompleted, 
    setGeneratedVideo, setVideoError, updateGenerationState, setProgress,
    clearAllPollingIntervals, checkVideoStatus, addToast
  ]);

  // Download video
  const downloadVideo = useCallback(async (videoToDownload = null) => {
    // Use the provided video or the current generated video
    const videoObj = videoToDownload || generatedVideo;
    
    if (!videoObj || (!videoObj.videoUrl && !videoObj.url)) {
      addToast('No video available to download', 'error');
      return;
    }
    
    const videoUrl = videoObj.videoUrl || videoObj.url;
    
    try {
      addToast('Starting download...', 'info');
      
      // Fetch the video as a blob
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      
      // Create a local URL for the blob
      const blobUrl = URL.createObjectURL(videoBlob);
      
      // Create a filename based on video details
      const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
      const safePrompt = (videoObj.prompt || 'video')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 30);
      const filename = `promptcatalyst-${safePrompt}-${timestamp}.mp4`;
      
      // Create an anchor and trigger download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      addToast(`Failed to download video: ${error.message}`, 'error');
    }
  }, [generatedVideo, addToast]);

  // Enhanced recovery function for emergency recovery
  const checkForCompletedVideo = useCallback(async () => {
    // Get the request ID - try all possible sources
    let requestId = window._videoPollingState.activeRequestId;
    
    if (!requestId) {
      requestId = useVideoStore.getState().processingRequestId;
    }
    
    if (!requestId) {
      try {
        requestId = sessionStorage.getItem('videoProcessingRequestId');
      } catch (e) {}
    }
    
    if (!requestId) {
      addToast('No video generation found to recover', 'error');
      return false;
    }
    
    try {
      // Show loading toast
      addToast('Checking video status...', 'info');
      
      // Update global state
      window._videoPollingState.activeRequestId = requestId;
      window._videoPollingState.isPollingActive = true;
      window._videoPollingState.processingCompleted = false;
      
      // Make the API call
      const status = await apiService.checkTextToVideoStatus(requestId);
      
      // Helper function to calculate credits used
      const getCredits = () => {
        // Credits based on both duration and resolution
        const videoDur = status.duration || duration || window._videoPollingState.videoInfo.duration || '5';
        const videoRes = status.resolution || resolution || window._videoPollingState.videoInfo.resolution || '720p';
        
        if (videoRes === '1080p') {
          return videoDur === '10' ? 3400 : 1700; // 1080p: 10s = 3400, 5s = 1700
        } else {
          return videoDur === '10' ? 900 : 450; // 720p: 10s = 900, 5s = 450
        }
      };
      
      // Handle different status cases
      if (status.status === 'COMPLETED' && status.videoUrl) {
        // Create a video object with both url properties for compatibility
        const video = {
          id: requestId,
          requestId: requestId,
          url: status.videoUrl, // Add url property for AnimationPlayer compatibility
          videoUrl: status.videoUrl,
          // Strict server values for core fields
          prompt: status.prompt,
          duration: status.duration,
          resolution: status.resolution,
          // Use model field from server (matches DB field) and keep aiModel for compatibility
          model: status.model || 'seedance-1.0',
          aiModel: status.model || 'seedance-1.0',
          // Only use local value for aspectRatio if not provided by server
          aspectRatio: status.aspectRatio || aspectRatio,
          timestamp: new Date().toISOString(),
          lastViewed: new Date().toISOString(),
          creditCost: status.creditsUsed || getCredits()
        };
        
        // Update all states
        window._videoPollingState.processingCompleted = true;
        window._videoPollingState.isPollingActive = false;
        window._videoPollingState.completedVideo = video;
        
        // Update UI
        setGeneratedVideo(video);
        updateGenerationState(false);
        setProcessingCompleted(true);
        clearAllPollingIntervals();
        
        // Update history and credits
        addVideo(video);
        refreshHistory();
        refreshCredits();
        
        // Success notification
        addToast('Video successfully recovered!', 'success');
        return true;
      } else if (status.status === 'PROCESSING') {
        // Update progress
        if (status.progress) {
          setProgress(status.progress);
        }
        
        // Make sure polling is active
        if (!window._videoPollingState.currentInterval) {
          const intervalId = setInterval(() => {
            if (window._videoPollingState.isPollingActive && !window._videoPollingState.processingCompleted) {
              checkVideoStatus(requestId);
            } else {
              clearInterval(intervalId);
              window._videoPollingState.currentInterval = null;
            }
          }, 3000);
          
          window._videoPollingState.currentInterval = intervalId;
          setPollingInterval(intervalId);
        }
        
        // Make sure the store state is updated
        if (!useVideoStore.getState().isGenerating) {
          setGenerationState(true, requestId);
        }
        
        addToast(`Video still processing (${status.progress || 0}%)`, 'info');
        return false;
      } else if (status.status === 'FAILED') {
        // Handle failure
        window._videoPollingState.processingCompleted = true;
        window._videoPollingState.isPollingActive = false;
        updateGenerationState(false);
        setProcessingCompleted(true);
        clearAllPollingIntervals();
        
        addToast('Video generation failed', 'error');
        return false;
      } else {
        addToast(`Video status: ${status.status || 'unknown'}`, 'info');
        return false;
      }
    } catch (error) {
      // Handle not found errors
      if (error.response?.status === 404 || error.message?.includes('not found')) {
        window._videoPollingState.processingCompleted = true;
        window._videoPollingState.isPollingActive = false;
        updateGenerationState(false);
        setProcessingCompleted(true);
        clearAllPollingIntervals();
        
        addToast('Video request no longer exists', 'error');
      } else {
        addToast('Failed to check video status', 'error');
      }
      
      return false;
    }
  }, [videoPrompt, duration, resolution, aspectRatio, calculateCreditCost, setGeneratedVideo, 
      updateGenerationState, setProcessingCompleted, clearAllPollingIntervals, addVideo, 
      refreshCredits, addToast, setProgress, setPollingInterval, checkVideoStatus, 
      refreshHistory, setGenerationState]);

  return {
    // State
    videoPrompt,
    duration,
    resolution,
    aspectRatio, 
    cfgScale,
    isGenerating,
    generatedVideo,
    progress,
    videoError,
    processingRequestId,
    
    // Computed values
    creditCost: calculateCreditCost(),
    hasEnoughCredits,
    
    // Actions
    setVideoPrompt,
    setDuration,
    setResolution,
    setAspectRatio,
    setCfgScale,
    setGeneratedVideo,
    setProgress,
    generateVideo,
    downloadVideo,
    retryLoadVideo,
    
    // Additional helpers
    clearPolling: clearAllPollingIntervals,
    checkForCompletedVideo, // Recovery function
    checkPolling: checkVideoStatus // Expose the status checking function
  };
};

export default useTextToVideo;