// src/hooks/useAnimationThumbnail.js

import { useState, useEffect, useCallback } from 'react';
import { createFallbackThumbnail } from '../utils/animationStorage';
import { logger } from '../utils/logger';

/**
 * Custom hook to handle animation thumbnails with fallbacks
 * 
 * @param {Object} animation - The animation object
 * @param {Object} options - Configuration options
 * @returns {Object} - Thumbnail state and handlers
 */
export function useAnimationThumbnail(animation, options = {}) {
  const {
    fallbackText = 'Animation',
    width = 320,
    height = 180,
    enableFallback = true,
    debug = false
  } = options;
  
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Logging function that only runs in debug mode
  const log = useCallback((message, data) => {
    if (debug) {
      logger.debug(`[AnimationThumbnail] ${message}`, data);
    }
  }, [debug]);
  
  // Process and set the thumbnail source when animation changes
  useEffect(() => {
    if (!animation) {
      setThumbnailSrc(null);
      setThumbnailError(false);
      setIsLoading(false);
      log('No animation provided, clearing thumbnail state');
      return;
    }
    
    // Reset states when animation changes
    setThumbnailError(false);
    setIsLoading(true);
    log('Animation changed, processing thumbnail', { animation });
    
    // Get the thumbnail source from animation
    const source = animation.thumbnail || animation.thumbnailDataUrl;
    
    if (source) {
      log('Found thumbnail source', { source: source.substring(0, 30) + '...' });
      
      // Check if source is a data URL or a blob URL
      if (source.startsWith('data:') || source.startsWith('blob:')) {
        setThumbnailSrc(source);
        setIsLoading(false);
        log('Direct URL set as thumbnail source');
      } else {
        // For regular URLs, preload the image to catch errors early
        log('Preloading image from URL');
        const img = new Image();
        img.onload = () => {
          setThumbnailSrc(source);
          setIsLoading(false);
          log('Image preloaded successfully');
        };
        img.onerror = (error) => {
          log('Error preloading image', { error });
          handleThumbnailError();
        };
        img.src = source;
      }
    } else {
      log('No thumbnail source found, using fallback');
      handleThumbnailError();
    }
  }, [animation, fallbackText, width, height, enableFallback, log]);
  
  // Handle thumbnail loading errors
  const handleThumbnailError = useCallback(() => {
    log('Handling thumbnail error');
    setThumbnailError(true);
    setIsLoading(false);
    
    if (enableFallback) {
      // Generate a fallback thumbnail
      const text = animation?.movement || fallbackText;
      log('Generating fallback thumbnail', { text, width, height });
      const fallbackThumbnail = createFallbackThumbnail(text, width, height);
      setThumbnailSrc(fallbackThumbnail);
    } else {
      log('Fallbacks disabled, setting thumbnail to null');
      setThumbnailSrc(null);
    }
  }, [animation, enableFallback, fallbackText, width, height, log]);
  
  return {
    thumbnailSrc,
    thumbnailError,
    isLoading,
    handleThumbnailError
  };
}

/**
 * Custom hook to handle video player state and events with improved error handling
 * 
 * @param {string} videoUrl - The URL of the video
 * @param {Object} options - Configuration options
 * @returns {Object} - Video player state and handlers
 */
export function useVideoPlayer(videoUrl, options = {}) {
  const {
    autoPlay = false,
    loop = true,
    muted = false,
    thumbnailSrc = null,
    onVideoLoad = () => {},
    onVideoError = () => {},
    onVideoEnd = () => {}
  } = options;
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Calculate progress as a percentage
  useEffect(() => {
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);
  
  // Reset state when video URL changes
  useEffect(() => {
    if (videoUrl) {
      setLoading(true);
      setError(null);
      setCurrentTime(0);
      setProgress(0);
      setDuration(0);
      setRetryCount(0);
    }
  }, [videoUrl]);
  
  // Event handlers
  const handlePlay = () => {
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const togglePlay = (videoElement) => {
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      // Add a retry mechanism for failed play attempts
      videoElement.play().catch(err => {
        logger.warn('Play attempt failed:', err);
        
        // If autoplay was blocked by browser policy, try with muted (which browsers allow)
        if (err.name === 'NotAllowedError') {
          logger.debug('Autoplay blocked, trying with muted...');
          videoElement.muted = true;
          setIsMuted(true);
          
          videoElement.play().catch(mutedErr => {
            logger.error('Even muted play failed:', mutedErr);
            setError(`Video playback failed: ${mutedErr.message}`);
            setIsPlaying(false);
          });
        } else {
          setError(`Video playback failed: ${err.message}`);
          setIsPlaying(false);
        }
      });
    }
  };
  
  const toggleMute = (videoElement) => {
    if (!videoElement) return;
    
    const newMutedState = !isMuted;
    videoElement.muted = newMutedState;
    setIsMuted(newMutedState);
  };
  
  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
    setLoading(false);
    
    if (typeof onVideoLoad === 'function') {
      onVideoLoad(e);
    }
    
    // Auto-play if specified
    if (autoPlay && !isPlaying) {
      e.target.play().catch(err => {
        logger.warn('Auto-play failed:', err);
        
        // If autoplay was blocked by browser policy, try with muted (which browsers allow)
        if (err.name === 'NotAllowedError') {
          logger.debug('Autoplay blocked, trying with muted...');
          e.target.muted = true;
          setIsMuted(true);
          
          e.target.play().catch(mutedErr => {
            logger.error('Even muted autoplay failed:', mutedErr);
            setIsPlaying(false);
          });
        } else {
          setIsPlaying(false);
        }
      });
    }
  };
  
  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };
  
  const handleVideoError = (e) => {
    const videoElement = e.target;
    logger.error('Video error event:', e);
    
    if (videoElement.error) {
      logger.error('Error code:', videoElement.error.code);
      logger.error('Error message:', videoElement.error.message);
    }
    
    logger.error('Network state:', videoElement.networkState);
    logger.error('Ready state:', videoElement.readyState);
    
    // Only set error state if we've exceeded retry attempts
    if (retryCount >= maxRetries) {
      setError('Video playback error after multiple attempts');
      setLoading(false);
      setIsPlaying(false);
      
      if (typeof onVideoError === 'function') {
        onVideoError(e);
      }
    } else {
      // Retry loading the video
      logger.debug(`Retrying video load (attempt ${retryCount + 1} of ${maxRetries})...`);
      setRetryCount(prev => prev + 1);
      
      // Small delay before retry
      setTimeout(() => {
        if (videoElement && typeof videoElement.load === 'function') {
          // Reset the video element
          try {
            videoElement.load();
          } catch (loadError) {
            logger.error('Error during video.load():', loadError);
          }
        } else {
          logger.debug('Cannot load video: load method not available');
        }
      }, 1000);
    }
  };
  
  const handleEnded = (e) => {
    if (loop) {
      e.target.currentTime = 0;
      e.target.play().catch(err => {
        logger.warn('Loop play failed:', err);
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
      
      if (typeof onVideoEnd === 'function') {
        onVideoEnd(e);
      }
    }
  };
  
  const seekTo = (videoElement, timeOrPercent, isPercentage = false) => {
    if (!videoElement || duration <= 0) return;
    
    let newTime;
    if (isPercentage) {
      newTime = (timeOrPercent / 100) * duration;
    } else {
      newTime = Math.min(Math.max(timeOrPercent, 0), duration);
    }
    
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Helper function to format time (MM:SS)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return {
    isPlaying,
    isMuted,
    duration,
    currentTime,
    progress,
    loading,
    error,
    formatTime,
    handlers: {
      handlePlay,
      handlePause,
      togglePlay,
      toggleMute,
      handleLoadedMetadata,
      handleTimeUpdate,
      handleVideoError,
      handleEnded,
      seekTo
    }
  };
}