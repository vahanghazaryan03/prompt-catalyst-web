
// src/components/VideoGenerate.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlayCircle,
  Loader2,
  Info,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Sparkles,
  CircleFadingArrowUpIcon,
  XCircle,
  Text,
  Video,
  Crown,
  Cat,
  Zap as Download,

  RefreshCw,
  X
} from 'lucide-react';
import VideoLoadingState from './VideoLoadingState';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { Tooltip } from './Tooltip';
import { useAuth } from '../contexts/AuthContext';
import { useVideoHistory } from '../hooks/useVideoHistory';
import ContentContainer from './layout/ContentContainer';
import VideoGenerateHistoryContainer from './VideoGenerateHistoryContainer';
import AnimationPlayer from './AnimationPlayer';
import MessageActions from './MessageActions';
import apiService from '../services/api';
import useVideoStore from '../contexts/VideoStore';
import useTextToVideo from '../hooks/useTextToVideo';
import { logger } from '../utils/logger';

// Video durations
const VIDEO_DURATIONS = [
  { value: '5', label: '5 seconds', description: 'Standard length' },
  { value: '10', label: '10 seconds', description: 'Extended animation' }
];

// Video resolution options
const VIDEO_RESOLUTIONS = [
  { value: '720p', label: '720p', description: 'Standard quality' },
  { value: '1080p', label: '1080p', description: 'High quality' }
];

// Video aspect ratio options
const VIDEO_ASPECT_RATIOS = [
  { value: '16:9', label: '16:9', description: 'Landscape format' },
  { value: '4:3', label: '4:3', description: 'Standard format' },
  { value: '1:1', label: '1:1', description: 'Square format' },
  { value: '9:21', label: '9:21', description: 'Vertical format' }
];

// AI model options
const AI_MODELS = [
  { value: 'seedance-1.0', label: 'Seedance 1.0', description: 'Default model', isAvailable: true }
];

// Enhanced Empty state component
const EmptyState = () => {
  const [isHovered, setIsHovered] = useState(false);
  const messages = [
    "Let's create a video!",
    "Describe what video you want to generate",
    "Turn your text into amazing videos",
    "Add some motion to your ideas!"
  ];
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="text-center max-w-md mx-auto p-6 flex flex-col items-center mt-24 mb-24">
      <motion.div 
        className="relative group mb-8 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow Effect - Blue theme */}
        <motion.div 
          className="absolute -inset-4 rounded-full blur-xl opacity-75 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500"
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.8 : 0.5
          }}
          transition={{
            scale: { duration: 0.3 },
            opacity: { duration: 0.3 }
          }}
        />
        
        {/* Icon Container */}
        <motion.div 
          className="relative bg-[var(--cardBackground)] p-8 rounded-full"
          animate={{ rotateZ: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Cat
            size={48}
            className="text-blue-500" // Blue color for the cat
          />
        </motion.div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.h3 
          key={messages[currentMessage]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-medium text-[var(--text)] mb-6"
        >
          {messages[currentMessage]}
        </motion.h3>
      </AnimatePresence>
      
      <p className="text-[var(--textSecondary)] text-sm">
        Enter a descriptive prompt, select your settings, and let AI create a custom video for you.
      </p>
    </div>
  );
};

// Main VideoGenerate component
const VideoGenerate = ({ onViewChange, onPremiumClick, onTopUpClick, setMessages, handleSubmit, generatePrompt, onEdit }) => {
  // Refresh function reference that we'll use if needed
  let refreshVideo;
  let videoStatusCheck;
  
  // Use our custom hook that handles all the text-to-video functionality
  const {
    // State
    videoPrompt,
    duration,
    resolution,
    aspectRatio,

    isGenerating,
    generatedVideo,
    progress,
    videoError,
    processingRequestId,
    
    // Computed values
    creditCost: requiredCredits,
    hasEnoughCredits,
    
    // Actions
    setVideoPrompt,
    setDuration,
    setResolution,
    setAspectRatio,

    setGeneratedVideo,
    setProgress,
    generateVideo: handleGenerateBase,
    downloadVideo: handleDownloadVideo,
    retryLoadVideo: handleRetryLoadVideo,
    
    // Recovery and polling functions
    checkForCompletedVideo: handleCheckForCompletedVideo,
    checkPolling
  } = useTextToVideo();
  

  // For model selection (currently only one model available)
  const [selectedModel, setSelectedModel] = useState('seedance-1.0');
  
  // State for expanded mobile view
  const [isExpandedMobile, setIsExpandedMobile] = useState(true);
  
  // State for the image-to-video notice
  const [showImageToVideoNotice, setShowImageToVideoNotice] = useState(() => {
    // Check localStorage to see if the user has dismissed the notice before
    return localStorage.getItem('videoModeImgToVideoNoticeClosed') !== 'true';
  });
  
  // Get user info for status checks
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // Use the VideoHistory hook
  const { refreshHistory } = useVideoHistory();
  refreshVideo = refreshHistory; // Store reference for usage in loading state
  videoStatusCheck = checkPolling; // Store reference to status check function for emergency buttons
  
  // User status
  const isProMember = !!user?.isProMember || !!user?.isUltimateMember;
  const isPremiumUser = user?.isPremium;
  const isMobile = window.innerWidth < 768;
  
  // Toggle mobile controls expansion
  const toggleControlsExpansion = () => {
    setIsExpandedMobile(!isExpandedMobile);
  };
  
  // Handle closing/opening the image-to-video notice
  const handleCloseNotice = useCallback(() => {
    setShowImageToVideoNotice(false);
    localStorage.setItem('videoModeImgToVideoNoticeClosed', 'true');
  }, []);
  
  const handleOpenNotice = useCallback(() => {
    setShowImageToVideoNotice(true);
    localStorage.setItem('videoModeImgToVideoNoticeClosed', 'false');
  }, []);
  
  // Handle operations for prompt commands (variations, nextscene, shorten)
  const handleOperations = useCallback((operation, details = {}) => {
    const userMessage = {
      type: 'user',
      content: `/${operation} ${videoPrompt}`,
      isCommand: true,
      commandType: operation,
      timestamp: new Date().toISOString()
    };
  
    if (setMessages) {
      setMessages(prevMessages => [...prevMessages, userMessage]);
    }
    
    // Store current prompt before resetting
    const currentPrompt = videoPrompt;
    
    // Reset prompt state before view change
    setVideoPrompt('');
    
    // Set a small timeout to ensure state is reset before view change
    setTimeout(() => {
      onViewChange('chat');
      
      switch (operation) {
        case 'variations':
          handleSubmit(currentPrompt, {
            isVariation: true,
            isCommand: true,
            commandType: 'variations',
            originalPrompt: currentPrompt,
            skipUserMessage: true,
            isVideoMode: true,
            promptType: 'variation'
          });
          break;
        case 'nextscene':
          handleSubmit(currentPrompt, {
            isNextScene: true,
            isCommand: true,
            commandType: 'nextscene',
            originalPrompt: currentPrompt,
            skipUserMessage: true,
            nextSceneDetails: details && details.nextSceneDetails ? details.nextSceneDetails : '',
            isVideoMode: true,
            promptType: 'nextscene'
          });
          logger.debug('Next Scene Details:', details); // Debug log to see what's being passed
          break;
        case 'shorten':
          handleSubmit(currentPrompt, {
            isShortened: true,
            isCommand: true,
            commandType: 'shorten',
            originalPrompt: currentPrompt,
            skipUserMessage: true,
            isVideoMode: true,
            promptType: 'shortened'
          });
          break;
        default:
          break;
      }
    }, 0);
  }, [videoPrompt, handleSubmit, onViewChange, setMessages]);

  // Handle selecting video from history
  const handleSelectVideo = (video) => {
    // Set the generated video using our hook function
    setGeneratedVideo(video);
    
    // Set form values based on selected video
    setVideoPrompt(video.prompt || '');
    setDuration(video.duration || '5');
    setResolution(video.resolution || '720p');
    setAspectRatio(video.aspectRatio || '16:9');

   
  };
  
  // Handle the upgrade button click
  const handleUpgradeClick = () => {
    if (onPremiumClick) {
      // Explicitly pass 'pro' to select Pro plan in the premium modal
      onPremiumClick('pro');
    }
  };
  
  // Wrapper function to pass AI model information to the base generate function
  const handleGenerate = useCallback(() => {
    // Pass the selected AI model to the generation process
    handleGenerateBase(selectedModel);
  }, [handleGenerateBase, selectedModel]);

  // Set the videoPrompt when generatePrompt changes or on initial mount if it exists
  useEffect(() => {
    if (generatePrompt && generatePrompt.trim() !== '') {
      setVideoPrompt(generatePrompt);
    }
  }, [generatePrompt, setVideoPrompt]);
  
  // Modified to only handle in-app tab switching, browser tab switching removed
  useEffect(() => {
    // Set the active tab when component mounts
    useVideoStore.getState().setActiveTab('video');
    
    // Update global state for tracking
    if (window._videoPollingState) {
      window._videoPollingState.activeTab = 'video';
    }
    
    return () => {
      // Track that we're leaving the video tab
      if (window._videoPollingState) {
        // Store previous tab when leaving
        window._videoPollingState.previousTab = 'video';
      }
    };
  }, []);
  
  // Add simple polling status check for video completion
  useEffect(() => {
    // Check if there's polling that should be completed
    const checkPollingStatus = () => {
      if (!isGenerating && window._videoPollingState && 
          window._videoPollingState.isPollingActive && 
          window._videoPollingState.activeRequestId) {
        logger.debug('Possible stuck video - checking status');
        // Run a single status check
        if (videoStatusCheck && typeof videoStatusCheck === 'function') {
          videoStatusCheck(window._videoPollingState.activeRequestId);
        }
      }
    };
    
    // Run a check once when this component mounts
    if (window._videoPollingState && window._videoPollingState.isPollingActive) {
      checkPollingStatus();
    }
    
    // Set up a periodic check
    const statusInterval = setInterval(checkPollingStatus, 8000); // Check every 8 seconds
    
    // Cleanup on unmount
    return () => {
      clearInterval(statusInterval);
    };
  }, [isGenerating, videoStatusCheck]);
  
  // NEW EFFECT: Monitor for completed videos and force UI updates
  useEffect(() => {
    // This effect specifically watches for the case where a video completes
    // but the UI doesn't update, requiring a tab switch to see the video
    
    // Method 1: Polling the store for changes
    const checkCompletionInterval = setInterval(() => {
      // Get the latest state directly from the store
      const storeState = useVideoStore.getState();
      
      // Check for the specific condition: 
      // 1. Store has a video but component doesn't show it
      // 2. Store says not generating but component still shows as generating
      // 3. The global state indicates completion
      const storeHasVideo = !!storeState.generatedVideo;
      const storeNotGenerating = !storeState.isGenerating;
      const globalCompletion = window._videoPollingState && window._videoPollingState.processingCompleted;
      const uiOutOfSync = isGenerating || !generatedVideo;
      const forceUpdatePresent = window._forceVideoUpdate && window._forceVideoUpdate.timestamp > Date.now() - 30000;
      
      if ((storeHasVideo && storeNotGenerating && (globalCompletion || forceUpdatePresent) && uiOutOfSync) ||
          (forceUpdatePresent && window._forceVideoUpdate.video)) {
        // Force UI update with the completed video
        const videoToShow = forceUpdatePresent ? window._forceVideoUpdate.video : storeState.generatedVideo;
        setGeneratedVideo(videoToShow);
        
        // Also ensure the other state matches
        if (isGenerating) {
          // Update generation state
          setProgress(100);
          
          // Refresh history to ensure video appears there
          if (refreshVideo && typeof refreshVideo === 'function') {
            refreshVideo();
          }
          
          // Show a toast notification
         
        }
        
        // Clear the force update flag after using it
        if (forceUpdatePresent) {
          window._forceVideoUpdate = null;
        }
      }
    }, 1000); // Check every second for this condition
    
    // Method 2: Event listener for video completion
    const handleVideoComplete = (event) => {
      try {
        const { video } = event.detail;
        
        // Only update if we're still showing as generating or don't have a video
        if (isGenerating || !generatedVideo) {
          // Force UI update with the completed video
          setGeneratedVideo(video);
          setProgress(100);
          
          // Refresh history
          if (refreshVideo && typeof refreshVideo === 'function') {
            refreshVideo();
          }
          
          // Show notification only if we weren't already showing the video
          
        }
      } catch (e) {
        // Error handling silently fails
      }
    };
    
    // Method 3: Force direct check on mount and periodically
    const forceCheckCompletion = () => {
      if (isGenerating && window._videoPollingState && window._videoPollingState.activeRequestId) {
        if (videoStatusCheck && typeof videoStatusCheck === 'function') {
          videoStatusCheck(window._videoPollingState.activeRequestId);
        }
      }
    };
    
    // Check on mount and every 3 seconds
    forceCheckCompletion();
    const forceCheckInterval = setInterval(forceCheckCompletion, 3000);
    
    // Register the event listener on both document and window
    document.addEventListener('videoGenerationComplete', handleVideoComplete);
    window.addEventListener('videoGenerationComplete', handleVideoComplete);
    
    // Clean up both the interval and event listener on unmount
    return () => {
      clearInterval(checkCompletionInterval);
      clearInterval(forceCheckInterval);
      document.removeEventListener('videoGenerationComplete', handleVideoComplete);
      window.removeEventListener('videoGenerationComplete', handleVideoComplete);
    };
  }, [isGenerating, generatedVideo, setGeneratedVideo, refreshVideo, setProgress, videoStatusCheck]);
  
  // Refs for emergency recovery system
  const emergencyTimeoutRef = useRef(null);
  const emergencyIntervalRef = useRef(null);
  
  // Ref to track state for interval functions
  const stateRef = useRef({
    isGenerating: isGenerating,
    generatedVideo: generatedVideo,
    processingRequestId: processingRequestId
  });
  
  // Update ref when state changes
  useEffect(() => {
    stateRef.current = {
      isGenerating,
      generatedVideo,
      processingRequestId
    };
  }, [isGenerating, generatedVideo, processingRequestId]);
  
  // Emergency recovery for stuck videos - check completion status if still generating
  useEffect(() => {
    // Function to clear both timeout and interval
    const clearEmergencyChecks = () => {
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current);
        emergencyTimeoutRef.current = null;
      }
      if (emergencyIntervalRef.current) {
        clearInterval(emergencyIntervalRef.current);
        emergencyIntervalRef.current = null;
      }
    };
    
    // Create a safe check function that doesn't use hooks
    const checkForStuckVideo = () => {
      // Get current state from the ref instead of calling hooks
      const currentState = stateRef.current;
      
      // Only make the call if we're still generating and don't have a video
      if (currentState.isGenerating && !currentState.generatedVideo && currentState.processingRequestId) {
        // Call the status check function
        if (videoStatusCheck && typeof videoStatusCheck === 'function') {
          videoStatusCheck(currentState.processingRequestId);
        }
      } else {
        // If we have a video or aren't generating anymore, clear the interval
        clearEmergencyChecks();
      }
    };

    // If we're generating but don't have a video yet, start the emergency system
    if (!generatedVideo && isGenerating && videoStatusCheck && processingRequestId) {
      // Clear any existing emergency checks first
      clearEmergencyChecks();
      
      // Only add the emergency check after the video has been generating for 30+ seconds
      emergencyTimeoutRef.current = setTimeout(() => {
        // Run an immediate check
        checkForStuckVideo();
        
        // Set up interval for regular checks
        emergencyIntervalRef.current = setInterval(checkForStuckVideo, 15000); // Check every 15 seconds
      }, 30000); // Start emergency system after 30 seconds of generation
    } else if (generatedVideo || !isGenerating) {
      // If we have a video or generation stopped, clear the emergency system
      clearEmergencyChecks();
    }
    
    // Clean up on unmount
    return clearEmergencyChecks;
  }, [generatedVideo, isGenerating, videoStatusCheck, processingRequestId]);

  // Styling classes
  const labelClass = "text-sm font-medium text-[var(--text)]";
  const inputClass = "w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--inputBackground)] text-[var(--text)] placeholder-[var(--text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all duration-200";
  const cardClass = "bg-[var(--cardBackground)] rounded-xl border border-[var(--border)] shadow-sm";

  return (
    <ContentContainer maxWidth="max-w-7xl">
      <div className="video-generate-container flex-1 flex flex-col min-h-0 p-4 bg-[var(--background)] overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 h-full min-h-0 overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-full md:w-[500px] flex flex-col min-h-0">
            {/* Mobile Controls Toggle */}
            {isMobile && (
              <button
                onClick={toggleControlsExpansion}
                className="flex items-center justify-between w-full p-4 mb-2 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)]"
              >
                <span className="font-medium text-[var(--text)]">Video Generation Controls</span>
                {isExpandedMobile ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            )}
            
            {/* Controls Card */}
            <AnimatePresence>
              {(!isMobile || isExpandedMobile) && (
                <motion.div
                  initial={isMobile ? { height: 0, opacity: 0 } : false}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={isMobile ? { height: 0, opacity: 0 } : {}}
                  transition={{ duration: 0.3 }}
                  className={`flex-1 ${cardClass} flex flex-col min-h-0 overflow-hidden`}
                >
                  <div className="p-4 border-b border-[var(--border)]">
                    <h2 className="text-xl font-semibold text-[var(--text)]">Text to Video Settings</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-5">


                    {/* Video Prompt */}
                    <div className="space-y-2">
                      <label className={labelClass}>Video Prompt</label>
                      <div className="relative group">
                        <textarea
                          value={videoPrompt}
                          onChange={(e) => setVideoPrompt(e.target.value)}
                          placeholder="Describe the video you want to generate in detail..."
                          maxLength={1200}
                          className={`${inputClass} h-36 resize-none pr-10 ${videoPrompt.length >= 1200 ? 'border-red-400' : videoPrompt.length >= 1080 ? 'border-yellow-400' : ''}`}
                        />
                        {videoPrompt && (
                          <button
                            onClick={() => setVideoPrompt('')}
                            className="absolute right-3 top-3 p-1.5 rounded-full 
                              bg-[var(--dropdownHover)] hover:bg-[var(--dropdownBackground)] 
                              text-[var(--textSecondary)] hover:text-[var(--text)]
                              transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        
                        {/* Character count */}
                        {videoPrompt.length > 0 && (
                          <div className="flex items-center justify-between mt-1 text-xs">
                            <div className="flex items-center gap-1 text-[var(--textSecondary)]">
                              <Text size={12} />
                              <span>{videoPrompt.length >= 1200 ? "Maximum character limit reached" : `${1200 - videoPrompt.length} characters remaining`}</span>
                            </div>
                            <span className={`font-medium ${videoPrompt.length >= 1200 ? 'text-red-400' : videoPrompt.length >= 1080 ? 'text-yellow-400' : 'text-[var(--textSecondary)]'}`}>
                              {videoPrompt.length}/1200
                            </span>
                          </div>
                        )}
                        
                        {/* Message Actions - Display below prompt when there is content */}
                        {videoPrompt.trim() && (
                          <div className="mt-2 overflow-hidden max-w-full">
                            <MessageActions
                              prompt={videoPrompt}
                              onVariations={() => handleOperations('variations')}
                              onNextScene={(details) => {
                                logger.debug('VideoGenerate - onNextScene received details:', details);
                                handleOperations('nextscene', details);
                              }}
                              onShorten={() => handleOperations('shorten')}
                              onEdit={() => onEdit && onEdit(videoPrompt)}
                              onCopyPrompt={() => {
                                navigator.clipboard.writeText(videoPrompt);
                                addToast('Prompt copied to clipboard', 'success');
                              }}
                              showPreview={false}
                              showUseButton={false}
                              isVideoMode={true}
                              isCompact={true}
                              isGenerating={isGenerating}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Image-to-Video Notice (dismissible) */}
                    {showImageToVideoNotice ? (
                      <div className="mt-2 rounded-md bg-[var(--tooltipBackground)]/70 border border-[var(--border)] p-2 relative">
                        <div className="flex items-start gap-2">
                          <Info size={14} className="text-[var(--textSecondary)] mt-0.5 shrink-0" />
                          <div className="text-xs text-[var(--textSecondary)]">
                            Want to animate a static image? <span className="text-[var(--primary)]">Switch to Image Mode</span> and use the <span className="text-[var(--primary)]">Animate tab</span> to create videos from your images.
                          </div>
                          <button 
                            onClick={handleCloseNotice} 
                            className="absolute top-1 right-1 p-1 rounded-full hover:bg-[var(--dropdownHover)] text-[var(--textSecondary)]"
                            aria-label="Dismiss notice"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <button 
                          onClick={handleOpenNotice}
                          className="flex items-center gap-1.5 rounded-full p-1 hover:bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)]/80 transition-colors"
                          title="Image-to-video animation tip"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    )}
                    

                    
                    {/* Model Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>AI Model</label>
                      </div>
                      <div className="space-y-2">
                        {AI_MODELS.map((option) => (
                          <button 
                            key={option.value}
                            onClick={() => option.isAvailable && setSelectedModel(option.value)}
                            disabled={!option.isAvailable}
                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border transition-all
                            ${selectedModel === option.value 
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
                            : 'border-[var(--border)] bg-[var(--inputBackground)]'}
                            ${!option.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-medium text-sm text-[var(--text)]">{option.label}</span>
                              <span className="text-xs text-[var(--textSecondary)] mt-0.5">{option.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Aspect Ratio */}
                    <div className="space-y-2">
                      <label className={labelClass}>Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VIDEO_ASPECT_RATIOS.map((option) => (
                          <button 
                            key={option.value}
                            onClick={() => setAspectRatio(option.value)}
                            className={`flex flex-col items-center px-2 py-2 rounded-lg border transition-all ${
                              aspectRatio === option.value 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5'
                            }`}
                          >
                            {/* Visual representation of aspect ratio */}
                            <div className={`w-16 h-9 bg-[var(--border)] mb-2 rounded overflow-hidden flex items-center justify-center`}>
                              {option.value === '16:9' && (
                                <div className="w-full h-full bg-[var(--textSecondary)] opacity-60"></div>
                              )}
                              {option.value === '4:3' && (
                                <div className="w-[75%] h-full bg-[var(--textSecondary)] opacity-60 mx-auto"></div>
                              )}
                              {option.value === '1:1' && (
                                <div className="w-9 h-9 bg-[var(--textSecondary)] opacity-60 mx-auto"></div>
                              )}
                              {option.value === '9:21' && (
                                <div className="w-[25%] h-full bg-[var(--textSecondary)] opacity-60 mx-auto"></div>
                              )}
                            </div>
                            <span className="font-medium text-sm">{option.label}</span>
                            <span className="text-xs text-[var(--textSecondary)]">{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Duration Selection */}
                    <div className="space-y-2">
                      <label className={labelClass}>Duration</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VIDEO_DURATIONS.map((option) => (
                          <button 
                            key={option.value}
                            onClick={() => setDuration(option.value)}
                            className={`flex flex-col px-3 py-2.5 rounded-lg border transition-all ${
                              duration === option.value 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5'
                            }`}
                          >
                            <span className="font-medium text-sm text-[var(--text)]">{option.label}</span>
                            <span className="text-xs text-[var(--textSecondary)] mt-0.5">{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Video Resolution */}
                    <div className="space-y-2">
                      <label className={labelClass}>Video Resolution</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VIDEO_RESOLUTIONS.map((option) => {
                          // Calculate credit cost for this resolution
                          const creditCost = option.value === '1080p'
                            ? (duration === '10' ? 3400 : 1700)
                            : (duration === '10' ? 900 : 450);
                            
                          return (
                            <button 
                              key={option.value}
                              onClick={() => setResolution(option.value)}
                              className={`flex flex-col px-3 py-2.5 rounded-lg border transition-all ${
                                resolution === option.value 
                                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                                  : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5'
                              }`}
                            >
                              <span className="font-medium text-sm text-[var(--text)]">{option.label}</span>
                              <div className="flex flex-col items-center justify-center w-full">
                                <span className="text-xs text-[var(--textSecondary)]">{option.description}</span>
                                {/* Only show credit cost for non-pro users */}
                                {!isProMember && (
                                  <span className="text-xs text-[var(--textSecondary)] mt-0.5">
                                    {creditCost} credits
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Generate/Upgrade Button Section */}
                  <div className="p-4 border-t border-[var(--border)]">
                    {isProMember ? (
                      isGenerating ? (
                        // Show loading state when generating
                        <motion.button
                          disabled={true}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-blue-500 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Loader2 size={20} className="animate-spin text-black" />
                          <span className="text-black">Generating Video...</span>
                        </motion.button>
                      ) : !videoPrompt || videoPrompt.trim().length < 10 ? (
                        // Disabled button when prompt is too short
                        <motion.button
                          disabled={true}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-blue-500 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <PlayCircle size={20} className="shrink-0 text-black" />
                          <span className="flex-1 text-black">Generate Video</span>
                          <span className="text-sm text-black opacity-80 bg-white/15 px-2 py-0.5 rounded">
                            {requiredCredits} Credits
                          </span>
                        </motion.button>
                      ) : videoPrompt.length >= 800 ? (
                        // Disabled button when prompt is too long
                        <motion.button
                          disabled={true}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-blue-500 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <PlayCircle size={20} className="shrink-0 text-black" />
                          <span className="flex-1 text-black">Generate Video</span>
                          <span className="text-sm text-black opacity-80 bg-white/15 px-2 py-0.5 rounded">
                            {requiredCredits} Credits
                          </span>
                        </motion.button>
                      ) : hasEnoughCredits ? (
                        // Generate button when user has enough credits
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGenerate}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-blue-500 text-black font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <PlayCircle size={20} className="shrink-0 text-black" />
                          <span className="flex-1 text-black">Generate Video</span>
                          <span className="text-sm text-black opacity-80 bg-white/15 px-2 py-0.5 rounded">
                            {requiredCredits} Credits
                          </span>
                        </motion.button>
                      ) : (
                        // Purchase Credits button when user doesn't have enough credits
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onTopUpClick}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-green-500 text-black font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Download size={20} className="shrink-0" />
                          <span className="flex-1">Purchase Credits</span>
                          <span className="text-sm opacity-80 bg-white/15 px-2 py-0.5 rounded">
                            Need {requiredCredits} Credits
                          </span>
                        </motion.button>
                      )
                    ) : (
                      // Free and Premium members see the upgrade button - now with blue color to match Animate tab
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUpgradeClick}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-blue-500 text-black font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <CircleFadingArrowUpIcon size={20} className="shrink-0" />
                        <span className="flex-1">Upgrade to Pro</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right Panel - Preview */}
          <div className={`flex-1 ${cardClass} flex flex-col min-h-0 overflow-hidden`}>
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-xl font-semibold text-[var(--text)]">Preview</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {!videoPrompt && !isGenerating && !generatedVideo ? (
                <EmptyState />
              ) : isGenerating ? (
                <div className="w-full max-w-4xl mx-auto">
                  <div className="aspect-video rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--inputBackground)] flex flex-col items-center justify-center" style={{ minHeight: '360px' }}>
                    {/* Use our new VideoLoadingState component */}
                    <VideoLoadingState
                      videoPrompt={videoPrompt}
                      duration={duration}
                      progress={progress}
                    />
                  </div>
                </div>
              ) : generatedVideo ? (
                <div className="w-full max-w-4xl mx-auto">
                  {/* Use the AnimationPlayer for video display */}
                  <AnimationPlayer
                    animation={{
                      ...generatedVideo,
                      // Handle both url and videoUrl properties for maximum compatibility
                      url: generatedVideo.url || generatedVideo.videoUrl, // Prioritize existing url if it exists
                      videoUrl: generatedVideo.videoUrl || generatedVideo.url, // Ensure videoUrl is also available
                      movement: 'Text-to-Video',    // Add for compatibility
                      timestamp: generatedVideo.timestamp || new Date().toISOString()
                    }}
                    onClose={() => {
                      logger.debug('Close video clicked, clearing generated video');
                      setGeneratedVideo(null);
                    }}
                    onDownload={() => handleDownloadVideo(generatedVideo)}
                    onRetry={() => {
                      // Try to reload the video using our retry function
                      handleRetryLoadVideo(generatedVideo);
                    }}
                    onNewAnimation={() => {
                      setVideoPrompt('');
                      setGeneratedVideo(null);
                    }}
                    setGeneratedVideo={setGeneratedVideo}
                  />
                </div>
              ) : videoPrompt ? (
                <div className="w-full max-w-2xl mx-auto p-6">
                  {/* Prompt Preview */}
                  <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--inputBackground)]">
                    <h3 className="text-sm font-medium text-[var(--text)] mb-2">Your Prompt Preview</h3>
                    <p className="text-[var(--textSecondary)] text-sm">{videoPrompt}</p>
                    
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <div className="grid grid-cols-3 gap-3 text-xs text-[var(--textSecondary)]">
                        <div className="flex items-center gap-1">
                          <Video size={12} className="text-[var(--primary)]" />
                          <span><strong>{duration}s</strong> duration</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles size={12} className="text-[var(--primary)]" />
                          <span><strong>{resolution}</strong> quality</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Info size={12} className="text-[var(--primary)]" />
                          <span><strong>{aspectRatio}</strong> ratio</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Generate button for desktop layout (optional) */}
                    <div className="mt-6">
                      {isProMember && hasEnoughCredits && !isGenerating && (
                        <button
                        onClick={handleGenerate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-black font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                        <PlayCircle size={18} className="text-black" />
                        <span>Generate Now ({requiredCredits} Credits)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
              
              {/* Video History Container */}
              <VideoGenerateHistoryContainer
                onSelect={handleSelectVideo}
                onDownload={handleDownloadVideo}
                currentVideoId={generatedVideo?.id}
                onProUpgradeClick={handleUpgradeClick}
                isProMember={isProMember}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
};

export default VideoGenerate;