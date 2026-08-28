import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw, 
  ChevronLeft, 
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Video,
  Sparkles,
  ThumbsDown,
  Move,
  Film,
  Clock,
  Calendar,
  MessageSquare
} from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '../hooks/useAnimationThumbnail';
import { useToast } from '../contexts/ToastContext';
import { createFallbackThumbnail } from '../utils/animationStorage';
import { formatAiModelName } from '../utils/promptUtils';
import { logger } from '../utils/logger';

const AnimationPlayer = ({ 
  animation,
  onClose,
  onDownload,
  onRetry,
  onNewAnimation,
  setGeneratedVideo
}) => {
  // Refs
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const progressRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  // State
  const [showControls, setShowControls] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [videoAttempt, setVideoAttempt] = useState(0);
  const [showNativeControls, setShowNativeControls] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [localMuted, setLocalMuted] = useState(false); // Add local muted state
  const { addToast } = useToast();
  
  // Load thumbnail
  useEffect(() => {
    if (!animation) return;
    
    const source = animation.thumbnail || animation.thumbnailDataUrl;
    
    if (source) {
      setThumbnailSrc(source);
    } else {
      // Generate fallback thumbnail
      const text = animation?.movement || 'Animation';
      const fallbackThumbnail = createFallbackThumbnail(text, 640, 360);
      setThumbnailSrc(fallbackThumbnail);
    }
  }, [animation]);

  // Debug: Log animation URL
  useEffect(() => {
    if (animation?.url) {
     
      setDebugInfo(prev => ({
        ...prev,
        animationUrl: animation.url
      }));
    }
  }, [animation]);
  
  // Custom hook for video playback
  const {
    isPlaying,
    isMuted,
    duration,
    currentTime,
    progress,
    loading,
    error,
    formatTime,
    handlers
  } = useVideoPlayer(animation?.url, {
    autoPlay: false, // Start with autoplay off to ensure proper loading
    loop: true,
    muted: localMuted, // Use local muted state
    thumbnailSrc,
    onVideoError: (err) => {
      // Video player error - silent
      setDebugInfo(prev => ({
        ...prev,
        hookError: err?.message || 'Unknown error'
      }));
    }
  });

  // Sync our local muted state with the hook
  useEffect(() => {
    setLocalMuted(isMuted);
  }, [isMuted]);
  
  // Enhanced error logging for debugging
  useEffect(() => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      
      // Log detailed info when video errors occur
      const handleVideoError = (e) => {
        // Video error event - silent
        
        const errorInfo = {
          errorCode: videoElement.error ? videoElement.error.code : 'unknown',
          errorMessage: videoElement.error ? videoElement.error.message : 'unknown',
          networkState: videoElement.networkState,
          readyState: videoElement.readyState,
          currentSrc: videoElement.currentSrc,
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight
        };
        
        // Video error details - silent
        setDebugInfo(prev => ({ ...prev, ...errorInfo }));
      };
      
      // Enhanced logging for video load events
      const handleLoadedData = () => {
       
        
        setDebugInfo(prev => ({
          ...prev,
          videoLoaded: true,
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          readyState: videoElement.readyState
        }));
        
        // If video has dimensions, it has loaded content successfully
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          setLoading(false);
          
          // Attempt to play
          videoElement.play().catch(err => {
            // Auto-play failed after load - silent
            
            // If autoplay was blocked by browser policy, try with muted (which browsers allow)
            if (err.name === 'NotAllowedError') {
             
              videoElement.muted = true;
              setLocalMuted(true); // Use our local state setter
              
              videoElement.play().catch(mutedErr => {
                // Even muted play failed - silent
              });
            }
          });
        }
      };
      
      const handleLoadedMetadata = () => {
       
        setDebugInfo(prev => ({
          ...prev,
          metadataLoaded: true,
          duration: videoElement.duration
        }));
      };
      
      const handleWaiting = () => {
      
        setLoading(true);
      };
      
      const handleCanPlay = () => {
       
        setLoading(false);
      };
      
      // Add event listeners
      videoElement.addEventListener('error', handleVideoError);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('waiting', handleWaiting);
      videoElement.addEventListener('canplay', handleCanPlay);
      
      return () => {
        // Remove event listeners on cleanup
        videoElement.removeEventListener('error', handleVideoError);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('waiting', handleWaiting);
        videoElement.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [videoRef, videoAttempt]);
  
  // Auto-hide controls after inactivity when playing
  useEffect(() => {
    if (!isPlaying || error) {
      setShowControls(true);
      return;
    }
    
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, error]);
  
  // Toggle play/pause
  const togglePlay = () => {
    handlers.togglePlay(videoRef.current);
  };
  
  // Toggle mute
  const toggleMute = () => {
    handlers.toggleMute(videoRef.current);
  };
  
  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!progressRef.current || !videoRef.current || duration <= 0) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    handlers.seekTo(videoRef.current, position, true);
  };
  
  // Restart animation
  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    
    if (!isPlaying) {
      handlers.togglePlay(videoRef.current);
    }
  };
  
  // Retry video loading
  const handleRetryVideo = () => {
   
    
    if (!videoRef.current || !animation?.url) return;
    
    // Reset any error states
    setDebugInfo({});
    setVideoAttempt(prev => prev + 1);
    
    // Reset video element
    const video = videoRef.current;
    video.pause();
    video.removeAttribute('src');
    
    try {
      if (typeof video.load === 'function') {
        video.load();
      }
    } catch (loadError) {
      // Error during video.load() - silent
    }
    
    // Set source again
    video.src = animation.url;
    
    try {
      if (typeof video.load === 'function') {
        video.load();
      }
    } catch (loadError) {
      // Error during video.load() after setting src - silent
    }
    
    // Try to play
    setTimeout(() => {
      video.play().catch(err => {
        // Error playing after retry - silent
      });
    }, 100);
  };
  
  // Toggle native controls
  const toggleNativeControls = () => {
    setShowNativeControls(prev => !prev);
    addToast('Switched to browser native controls', 'info');
  };
  
  // Download animation using Fetch API and Blob
  const handleDownload = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isDownloading) return;
    
    if (!animation || !animation.url) {
      addToast('No animation available to download', 'error');
      return;
    }
    
    try {
      setIsDownloading(true);
      addToast('Starting download...', 'info');
      
      // Fetch the video as a blob
      const response = await fetch(animation.url);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      
      // Create a local URL for the blob
      const blobUrl = URL.createObjectURL(videoBlob);
      
      // Create a filename based on animation details
      const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
      const movement = animation.movement || 'animation';
      const filename = `promptcatalyst-${movement.toLowerCase()}-${timestamp}.mp4`;
      
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
      // Download error - silent
      addToast(`Failed to download animation: ${error.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Simplified state management for loading indicator
  const [isLoading, setLoading] = useState(true);
  
  // State for feedback modal and tracking if feedback was given
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  // Check if feedback was previously given for this specific video
  useEffect(() => {
    if (animation && animation.id) {
      try {
        // Get feedback data from localStorage
        const feedbackData = localStorage.getItem('animation_feedback') || '{}';
        const parsedData = JSON.parse(feedbackData);
        
        // Check if this specific video has received feedback
        setFeedbackGiven(!!parsedData[animation.id]);
      } catch (error) {
        logger.error('Error checking feedback status:', error);
        setFeedbackGiven(false);
      }
    }
  }, [animation]);
  
  // Function to save feedback state for a specific video
  const saveFeedbackState = useCallback((videoId, state) => {
    try {
      // Get existing feedback data
      const feedbackData = localStorage.getItem('animation_feedback') || '{}';
      const parsedData = JSON.parse(feedbackData);
      
      // Update data for this video
      if (state) {
        parsedData[videoId] = true;
      } else {
        delete parsedData[videoId];
      }
      
      // Save back to localStorage
      localStorage.setItem('animation_feedback', JSON.stringify(parsedData));
      
      // Update state
      setFeedbackGiven(state);
    } catch (error) {
      logger.error('Error saving feedback state:', error);
    }
  }, []);
  
  if (!animation) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center p-8">
        <div className="text-[var(--textSecondary)]">No animation selected</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animation-player-container">
      {/* Video Player */}
      <div 
        ref={videoContainerRef}
        className="relative aspect-video rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--cardBackground)]"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && !error && setShowControls(false)}
      >
        {/* Top buttons group */}
        <div className="absolute z-20 top-2 right-2 flex gap-2">
          {/* Download button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(e);
            }}
            className="p-1.5 rounded-full bg-[var(--background)]/50 text-[var(--text)] hover:bg-[var(--background)]/70 transition-colors"
            title="Download animation"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
          </button>
          
          {/* Feedback button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFeedbackModalOpen(true);
            }}
            className={`p-1.5 rounded-full bg-[var(--background)]/50 text-[var(--text)] hover:bg-[var(--background)]/70 transition-colors`}
            title={feedbackGiven ? "Edit feedback" : "Give feedback"}
          >
            <ThumbsDown size={18} fill={feedbackGiven ? "currentColor" : "none"} />
          </button>
          
          {/* Close button */}
          <button
          onClick={(e) => {
          e.stopPropagation();
          // First check onClose function
          if (typeof onClose === 'function') {
            onClose();
          } 
          // Then check setGeneratedVideo as fallback
          else if (typeof setGeneratedVideo === 'function') {
              setGeneratedVideo(null);
            }
              // Log if neither method is available
            else {
                logger.error('AnimationPlayer: Neither onClose nor setGeneratedVideo are available');
              }
            }}
            className="p-1.5 rounded-full bg-[var(--background)]/50 text-[var(--text)] hover:bg-red-500/80 hover:text-white transition-colors shadow-lg hover:shadow-red-500/30" 
            title="Close video"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Video Element */}
        {!error ? (
          <video
            key={`video-${videoAttempt}`}
            ref={videoRef}
            src={animation.url}
            poster={thumbnailSrc}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            playsInline
            crossOrigin="anonymous"
            preload="auto"
            controls={showNativeControls}
            onLoadedMetadata={handlers.handleLoadedMetadata}
            onTimeUpdate={handlers.handleTimeUpdate}
            onPlay={handlers.handlePlay}
            onPause={handlers.handlePause}
            onEnded={handlers.handleEnded}
            onError={handlers.handleVideoError}
            muted={localMuted}
            autoPlay={false}
          >
            {/* Add explicit source elements for better format support */}
            <source src={animation.url} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--cardBackground)] p-4">
            <AlertTriangle size={40} className="text-red-500 mb-3" />
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">Playback Error</h3>
            <p className="text-sm text-[var(--textSecondary)] text-center mb-4">
              The video couldn't be played. It may be corrupted or no longer available.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRetryVideo}
                className="px-3 py-1.5 bg-[var(--primary)] text-[var(--background)] rounded-md font-medium text-sm"
              >
                Retry
              </button>
              <button
                onClick={toggleNativeControls}
                className="px-3 py-1.5 bg-[var(--text)]/10 text-[var(--text)] rounded-md font-medium text-sm"
              >
                Use Native Controls
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-[var(--textSecondary)]/20 text-[var(--text)] rounded-md font-medium text-sm flex items-center gap-1.5"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        )}
        
        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && !showNativeControls && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--background)]/50"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={36} className="animate-spin text-[var(--text)]" />
                <p className="text-[var(--text)] text-sm">Loading animation...</p>
                <button
                  onClick={handleRetryVideo}
                  className="mt-2 px-3 py-1.5 rounded-md bg-[var(--text)]/10 text-[var(--text)] flex items-center gap-1.5 text-sm hover:bg-[var(--text)]/20 transition-colors"
                >
                  <RefreshCw size={14} />
                  Retry Load
                </button>
                <button
                  onClick={toggleNativeControls}
                  className="mt-1 px-3 py-1.5 rounded-md bg-[var(--primary)]/80 text-[var(--background)] text-sm hover:bg-[var(--primary)] transition-colors"
                >
                  Use Browser Player
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Play/Pause Overlay Button - REMOVED */}
        
        {/* Modern Controls Bar */}
        <AnimatePresence>
          {!error && !isLoading && !showNativeControls && (
            <>
              {/* Progress Bar - Always visible but thinner when not hovering */}
              <motion.div 
                initial={{ opacity: 0.4 }}
                animate={{ opacity: showControls || !isPlaying ? 0.8 : 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 cursor-pointer group pointer-events-auto"
              >
                <div 
                  ref={progressRef}
                  className="w-full h-0.5 group-hover:h-1.5 bg-[var(--text)]/20 transition-all duration-300 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-[var(--primary)] relative" 
                    style={{ width: `${progress}%` }}
                  >
                    {/* Progress handle - only visible on hover */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--primary)] rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  </div>
                </div>
              </motion.div>

              {/* Main Controls - Only visible when hovering or paused */}
              <AnimatePresence>
                {(showControls || !isPlaying) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
                  >
                    {/* Bottom controls tray */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-3 p-2">
                        <button 
                          className="p-1.5 rounded-full text-[var(--text)]/80 hover:text-[var(--text)] hover:bg-[var(--text)]/10 transition-all"
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>
                        
                        <button 
                          onClick={handleRestart}
                          className="p-1.5 rounded-full text-[var(--text)]/80 hover:text-[var(--text)] hover:bg-[var(--text)]/10 transition-all"
                        >
                          <RotateCcw size={16} />
                        </button>
                        
                        <span className="text-xs font-medium video-time-display" style={{ color: 'white' }}>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2">
                        <button 
                          className="p-1.5 rounded-full text-[var(--text)]/80 hover:text-[var(--text)] hover:bg-[var(--text)]/10 transition-all"
                          onClick={toggleNativeControls}
                          title="Use browser's native video controls"
                        >
                          <RefreshCw size={16} />
                        </button>
                        
                        <button 
                          className="p-1.5 rounded-full text-[var(--text)]/80 hover:text-[var(--text)] hover:bg-[var(--text)]/10 transition-all"
                          onClick={onNewAnimation}
                          title="Create new animation"
                        >
                          <ChevronLeft size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </AnimatePresence>
      </div>
      
      {/* Animation Details - Modern Design */}
      {animation && (
        <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)] bg-gradient-to-br from-[var(--cardBackground)] to-[var(--background)] shadow-lg">
          {/* Header without gradient accent */}
          <div className="py-3 px-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
              <Film size={16} className="text-[var(--primary)]" />
              Animation Details
            </h3>
          </div>
          
          <div className="p-4">
            {/* Basic details in a compact 2-column grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Type */}
              <div className="bg-[var(--background)]/20 p-2 rounded-md flex flex-col">
                <span className="text-xs text-[var(--textSecondary)] mb-1 flex items-center gap-1">
                  <Move size={12} className="text-[var(--primary)]" /> Type
                </span>
                <span className="text-sm text-[var(--text)] font-medium">{animation.movement}</span>
              </div>

              {/* Duration */}
              <div className="bg-[var(--background)]/20 p-2 rounded-md flex flex-col">
                <span className="text-xs text-[var(--textSecondary)] mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-[var(--primary)]" /> Duration
                </span>
                <span className="text-sm text-[var(--text)] font-medium">{animation.duration || '5'}s</span>
              </div>

              {/* Resolution - Fixed display logic */}
              <div className="bg-[var(--background)]/20 p-2 rounded-md flex flex-col">
                <span className="text-xs text-[var(--textSecondary)] mb-1 flex items-center gap-1">
                  <Video size={12} className="text-[var(--primary)]" /> Resolution
                </span>
                <span className="text-sm text-[var(--text)] font-medium">
                  {/* Always use server-provided resolution, no fallbacks */}
                  {animation.resolution || '720p'}
                </span>
              </div>

              {/* AI Model - always shown */}
              <div className="bg-[var(--background)]/20 p-2 rounded-md flex flex-col">
                <span className="text-xs text-[var(--textSecondary)] mb-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-yellow-500" /> AI Model
                </span>
                <span className="text-sm text-[var(--text)] font-medium">
                  {(() => {
                    // CRITICAL FIX: Detect if this is a text-to-video vs image-to-video animation
                    const isTextToVideo = animation.movement === 'Text-to-Video' || 
                                         animation.aspectRatio || 
                                         animation.cfgScale !== undefined ||
                                         (!animation.presetId && !animation.categoryId);
                    
                    // Use appropriate fallback based on animation type
                    const defaultModel = isTextToVideo ? 'seedance-1.0' : 'kling-2.1';
                    const modelToUse = animation.model || animation.aiModel || defaultModel;
                    
                    return formatAiModelName(modelToUse);
                  })()}
                </span>
              </div>
            </div>

            {/* Created date with time icon */}
            {animation.timestamp && (
              <div className="flex items-center gap-2 text-xs text-[var(--textSecondary)] mb-3 px-1">
                <Calendar size={12} className="text-[var(--primary)]" />
                <span>Created {new Date(animation.timestamp).toLocaleString()}</span>
              </div>
            )}
            
            {/* Prompt section with styled container */}
            {animation.prompt && (
              <div className="mt-3 bg-gradient-to-r from-[var(--background)]/30 to-[var(--background)]/10 rounded-md overflow-hidden">
                <div className="bg-[var(--primary)]/10 px-3 py-2 border-l-2 border-[var(--primary)]">
                  <p className="text-xs text-[var(--text)]/80 font-medium mb-1 flex items-center gap-1">
                    <MessageSquare size={12} className="text-[var(--primary)]" /> 
                    Custom Prompt
                  </p>
                  <p className="text-sm text-[var(--text)] leading-relaxed">{animation.prompt}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onFeedbackGiven={() => animation && animation.id && saveFeedbackState(animation.id, true)}
        onFeedbackReset={() => animation && animation.id && saveFeedbackState(animation.id, false)}
        feedbackGiven={feedbackGiven}
      />
    </div>
  );
};

export default AnimationPlayer;
