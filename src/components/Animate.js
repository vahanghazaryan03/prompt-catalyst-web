// Updated Animate.js with categorized animation presets and improved error handling

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Move, 
  XCircle,
  PlayCircle,
  Loader2, 
  Info,
  ChevronUp,
  Cat,
  ChevronDown,
Zap as Download,
  X,
  CircleFadingArrowUpIcon,
  Crown,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import apiService from '../services/api';
import AnimationLoadingState from './AnimationLoadingState';
import AnimationHistory from './AnimationHistory';
import AnimationPlayer from './AnimationPlayer';
import { useAnimationHistory } from '../hooks/useAnimationHistory';
import { 
    loadAnimationHistory, 
    saveAnimationHistory,
    addAnimationToHistory,
    createVideoThumbnail,
    createFallbackThumbnail,
    cleanupStorage,
    checkAndRepairAnimationHistory,
    compressDataUrl
} from '../utils/animationStorage';
import useAnimationStore from '../contexts/AnimationStore';
import CollapsibleCategory from './animation/CollapsibleCategory';
import { ANIMATION_PRESETS, findPresetById } from '../utils/animationPresets';
import ContentContainer from './layout/ContentContainer';
import TrashView from './animation/TrashView';
import { logger } from '../utils/logger';

// Animation durations - dynamic based on AI model
const getAnimationDurations = (aiModel) => {
  if (aiModel === 'haiulo-02') {
    return [
      { value: '6', label: '6 seconds', description: 'Standard length' },
      { value: '10', label: '10 seconds', description: 'Extended animation' }
    ];
  }
  return [
    { value: '5', label: '5 seconds', description: 'Standard length' },
    { value: '10', label: '10 seconds', description: 'Extended animation' }
  ];
};

// Video resolution options
const VIDEO_RESOLUTIONS = [
  { value: '720p', label: '720p', description: 'Standard quality' },
  { value: '1080p', label: '1080p', description: 'High quality' }
];

// AI Model options with additional models visible but disabled
const AI_MODELS = [
  { value: 'kling-2.1', label: 'Kling 2.5', description: 'High quality with dynamic motion'},
   { value: 'seedance-1.0', label: 'Seedance 1.0', description: 'Consistent animation' },
  
  
  //{ value: 'haiulo-02', label: 'MiniMax Hailuo-02', description: 'High quality with 6-second generation', isNew: true },
  
  { value: 'kling-1.6', label: 'Kling 1.6', description: 'Balanced performance' },
 
  { value: 'framepack-f1', label: 'Framepack F1', description: 'Coming soon', disabled: true }
 
];

// Enhanced Empty state component with animations
const EmptyState = () => {
  const [isHovered, setIsHovered] = useState(false);
  const messages = useMemo(() => [
    "Upload an image to start animating!",
    "Let's bring your images to life!",
    "Turn static images into motion!",
    "Add some magic to your images!",
    "Ready to animate?"
  ], []);
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
        {/* Glow Effect */}
        <motion.div 
          className="absolute -inset-4 rounded-full blur-xl opacity-75 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"
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
            className="text-[var(--primary)]"
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
        Upload an image, select an animation preset, and add an optional prompt to create an AI-powered animation.
      </p>
    </div>
  );
};

// Main Animate component
const Animate = ({ onViewChange, handleSubmit, setMessages, onPremiumClick, onTopUpClick }) => {
  // Subscribe to trash state from the store to ensure re-renders when it changes
  const isTrashOpen = useAnimationStore(state => state.isTrashOpen);
  const trashedAnimations = useAnimationStore(state => state.trashedAnimations);
  const restoreFromTrash = useAnimationStore(state => state.restoreFromTrash);
  const emptyTrash = useAnimationStore(state => state.emptyTrash);
  
  // Get other state from animation store
  const { 
    uploadedImage, setUploadedImage,
    selectedPreset: storedSelectedPreset,
    setSelectedPreset,
    customPrompt, setCustomPrompt,
    duration, setDuration,
    resolution, setResolution, // Use resolution directly from store
    isGenerating, setGenerationState: storeSetGenerationState,
    processingRequestId,
    generatedVideo, setGeneratedVideo,
    progress, setProgress,
    videoError, setVideoError,
    resetForm
  } = useAnimationStore();
  // Use the animation history hook for managing animation history
  const { 
    addAnimation,
    refreshHistory // Make sure this is properly extracted from the hook
  } = useAnimationHistory();
  
  // AI Model state - initialize directly from the store
  const [aiModel, setAiModel] = useState(() => {
    // Always prioritize the value from AnimationStore to ensure consistency
    return useAnimationStore.getState().aiModel || 'kling-2.1';
  });
  
  // Get dynamic animation durations based on selected AI model
  const animationDurations = useMemo(() => getAnimationDurations(aiModel), [aiModel]);
  
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState(() => {
    // Default to first category expanded
    return { [ANIMATION_PRESETS[0].id]: true };
  });
  
  const [isExpandedMobile, setIsExpandedMobile] = useState(true);
  
  // State for prompt suggestion loading
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  
  // Flag to track if the animation has been processed to prevent duplicate processing
  const [processingCompleted, setProcessingCompleted] = useState(false);
  
  // Use the improved animation history loading
  const [animationHistory, setAnimationHistory] = useState(() => {
    try {
      // First check and repair any corrupted data
      checkAndRepairAnimationHistory();
      // Then load the (possibly repaired) history
      const history = loadAnimationHistory();
      // Extra validation to ensure we're always working with an array
      return Array.isArray(history) ? history : [];
    } catch (error) {
      return []; // Always return an array as fallback
    }
  });
  
  const [pollingInterval, setPollingInterval] = useState(null);
  const videoRef = useRef(null);
  const thumbnailVideoRef = useRef(null);
  const isMounted = useRef(true);
  
  // Hooks
  const { addToast } = useToast();
  const { user } = useAuth();
  const { credits, refreshCredits } = useCredit();
  
  // Get pro or ultimate member status
  const isProMember = useMemo(() => {
    return !!user?.isProMember || !!user?.isUltimateMember;
  }, [user]);
  
  // Constants
  const isPremiumUser = user?.isPremium;
  const isMobile = window.innerWidth < 768;

  // Function to clear all polling intervals
  const clearAllPollingIntervals = useCallback(() => {
    // Clear the main pollingInterval
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // In case we have any zombie intervals, try to clear via ID
    try {
      // This is a bit of a hack to find and clear all intervals
      // Get a high interval ID that would encompass our interval
      const highestId = setTimeout(() => {}, 0);
      for (let i = highestId; i > highestId - 100; i--) {
        clearInterval(i);
      }
    } catch (e) {
      // Silently handle errors
    }
  }, [pollingInterval]);

  // Enhanced setGenerationState function with parameter storage
  const setGenerationState = useCallback((isGenerating, requestId = null, params = null) => {
    // When starting a new generation, store the parameters
    if (isGenerating && params) {
      // Store generation parameters in the store
      useAnimationStore.getState().setGenerationParams(params);
    }
    
    // Update generation state
    storeSetGenerationState(isGenerating, requestId);
    
    // Clear parameters when generation ends
    if (!isGenerating) {
      useAnimationStore.setState({ 
        processingRequestId: null,
        generationParams: null 
      });
    }
  }, [storeSetGenerationState]);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // One-time cleanup for stale animation requests on component mount
  useEffect(() => {
    const cleanupStaleAnimationRequests = async () => {
      try {
        // If there's a processing request ID but we aren't in a generating state,
        // we might have a stale request
        if (processingRequestId && !isGenerating) {
          try {
            // Try to check the status once
            await apiService.checkAnimationStatus(processingRequestId);
            
            // If that succeeds, start tracking it properly
            setGenerationState(true, processingRequestId);
            
            // Set up polling interval
            const intervalId = setInterval(() => {
              if (isMounted.current && !processingCompleted) {
                checkAnimationStatus(processingRequestId);
              } else {
                clearInterval(intervalId);
              }
            }, 3000);
            
            setPollingInterval(intervalId);
          } catch (error) {
            // If the request is not found, clear it
            if (error.response?.status === 404) {
              // Clear the state
              setGenerationState(false);
              useAnimationStore.setState({ processingRequestId: null });
              sessionStorage.removeItem('animationProcessingRequestId');
            }
          }
        }
      } catch (e) {
        // Silent error handling
      }
    };
    
    // Execute cleanup on mount
    cleanupStaleAnimationRequests();
    
    // Cleanup function
    return () => {
      clearAllPollingIntervals();
    };
  }, [clearAllPollingIntervals, processingRequestId, isGenerating, setGenerationState, processingCompleted]); 
  
  // Check and repair animation history when component mounts
  useEffect(() => {
    checkAndRepairAnimationHistory();
    
    // Sync aiModel with the store to ensure consistency
    const storeAiModel = useAnimationStore.getState().aiModel;
    if (storeAiModel && storeAiModel !== aiModel) {
      setAiModel(storeAiModel);
    }
  }, []);
  
  // Set mounted flag on mount and clean up on unmount
  useEffect(() => {
    // Set mounted flag to true when component mounts
    isMounted.current = true;
    
    // Set mounted flag to false when component unmounts
    return () => {
      isMounted.current = false;
      
      // Also ensure we clean up any polling intervals
      clearAllPollingIntervals();
    };
  }, [clearAllPollingIntervals]);
  
  // Subscribe to trash view toggle to refresh history when returning from trash view - optimized
  useEffect(() => {
    // Track the previous trash state to detect actual changes
    const previousTrashState = useAnimationStore.getState().isTrashOpen;
    let currentPreviousState = previousTrashState;
    
    // Subscribe to changes in isTrashOpen
    const unsubscribe = useAnimationStore.subscribe(
      state => state.isTrashOpen,
      (isTrashOpen) => {
        // Only refresh when actually switching FROM trash TO history view
        if (currentPreviousState === true && isTrashOpen === false) {
          // Small delay to ensure the view has changed first
          setTimeout(() => {
            if (refreshHistory) {
              refreshHistory();
            }
          }, 50);
        }
        
        // Update previous state for next change
        currentPreviousState = isTrashOpen;
      }
    );
    
    return () => unsubscribe();
  }, [refreshHistory]);

  // Effect to reset processingCompleted when the form is reset
  useEffect(() => {
    if (!generatedVideo && !isGenerating) {
      setProcessingCompleted(false);
    }
  }, [generatedVideo, isGenerating]);
  
  // Improved handling of tab changes with background processing
  // We don't need to track refresh time anymore - the hook handles caching
  useEffect(() => {
    // Subscribe to changes in the animation store
    const unsubscribe = useAnimationStore.subscribe(
      (state) => state.activeTab,
      (activeTab) => {
        if (activeTab === 'animate') {
          // Get the current animation state
          const currentState = useAnimationStore.getState();
          
          // If we have a completed animation and we're still showing as generating,
          // clean up the state (this can happen if the animation completed while in another tab)
          if (currentState.generatedVideo && 
              currentState.generatedVideo.url && 
              currentState.isGenerating) {
            setGenerationState(false);
            setProcessingCompleted(true);
            
            // Clear any active polling
            clearAllPollingIntervals();
            
            // Show notification that animation completed while user was away
            if (isMounted.current) {
              addToast('Your animation completed successfully!', 'success');
            }
          }
          // Continue polling if we left and came back during generation
          else if (currentState.isGenerating && 
                   currentState.processingRequestId && 
                   !pollingInterval) {
            // Start polling again if it's not already happening
            const intervalId = setInterval(() => {
              if (isMounted.current && !processingCompleted) {
                checkAnimationStatus(currentState.processingRequestId);
              } else {
                clearInterval(intervalId);
              }
            }, 3000);
            
            setPollingInterval(intervalId);
            
            // Check status immediately
            checkAnimationStatus(currentState.processingRequestId);
          }
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      unsubscribe();
      // Do NOT clear polling intervals here to allow background processing
      // Only clear when component unmounts completely
    };
  }, [setGenerationState, clearAllPollingIntervals, addToast]);
  
  // Cleanup polling and thumbnail video on component unmount
  useEffect(() => {
    return () => {
      clearAllPollingIntervals();
      
      // Additional cleanup for thumbnail video element
      if (thumbnailVideoRef.current) {
        try {
          thumbnailVideoRef.current.pause();
          thumbnailVideoRef.current.src = '';
          
          // Only call load if it's a function
          if (typeof thumbnailVideoRef.current.load === 'function') {
            try {
              thumbnailVideoRef.current.load();
            } catch (loadError) {
              // Silent error handling
            }
          }
          
          thumbnailVideoRef.current.remove();
        } catch (error) {
          // Silent error handling
          // Silent error handling
        }
      }
    };
  }, [clearAllPollingIntervals]);

  // Check for pending animation in session storage when component mounts
  useEffect(() => {
    const checkPendingAnimation = async () => {
      try {
        // Check if there's a pending animation in state
        if (processingRequestId && !processingCompleted) {
          // If we already have the generated video but still have a processing ID,
          // that means we're in an inconsistent state - just clear the processing state
          if (generatedVideo && generatedVideo.url) {
            setGenerationState(false);
            setProcessingCompleted(true);
            return;
          }
          
          if (!isGenerating) {
            setGenerationState(true, processingRequestId);
          }
          
          try {
            // Check the status directly
            const statusResponse = await apiService.checkAnimationStatus(processingRequestId);
            
            if (statusResponse.status === 'COMPLETED') {
              // Set processing completed flag to prevent duplicate processing
              setProcessingCompleted(true);
              
              // The animation was completed but we missed it
              
              // If we already have this exact video, don't recreate it
              if (generatedVideo && generatedVideo.url === statusResponse.videoUrl) {
                setGenerationState(false);
                return;
              }
              
              // Get the generation parameters that were stored when generation started
              const generationParams = useAnimationStore.getState().generationParams;
              const recoveryAiModel = generationParams?.aiModel || aiModel;
              const recoveryCustomPrompt = generationParams?.customPrompt || customPrompt;
              
              // Create recovery animation object
              const recoveredAnimation = {
                id: Date.now(),
                url: statusResponse.videoUrl,
                thumbnail: uploadedImage?.url || '',
                thumbnailDataUrl: uploadedImage?.dataUrl || '',
                movement: statusResponse.movement || 'Custom',
                movementId: statusResponse.movement || 'custom',
                categoryId: statusResponse.categoryId || null,
                duration: statusResponse.duration || '5',
                // Fix: Prioritize server response for resolution
                resolution: statusResponse.resolution || '720p',
                // CRITICAL FIX: Ensure both model fields are set consistently for recovery
                model: statusResponse.model || recoveryAiModel || 'kling-2.1',     // Primary model field
                aiModel: statusResponse.model || recoveryAiModel || 'kling-2.1',   // Backward compatibility
                // Fix: Ensure custom prompt is preserved for recovery - prioritize recovery prompt over server response
                prompt: recoveryCustomPrompt || statusResponse.prompt || null,
                // If we have a preset ID, assume this was a preset-generated prompt
                isPresetPrompt: !!statusResponse.presetId,
                timestamp: new Date().toISOString(),
                lastViewed: new Date().toISOString(),
                creditCost: statusResponse.creditsUsed || 350,
                recovered: true
              };
              
              // Check if this animation already exists in history by URL
              const existingAnimation = animationHistory.find(anim => 
                anim.url === statusResponse.videoUrl
              );
              
              if (!existingAnimation) {
                // Add recovered animation to history using our improved method
                // Add recovered animation to history using our improved method
                try {
                  const updatedHistory = await addAnimationToHistory(recoveredAnimation);
                  setAnimationHistory(updatedHistory);
                } catch (historyError) {
                  // Silent error handling
                }
              }
              
              // Show the recovered animation
              setGeneratedVideo(recoveredAnimation);
              setGenerationState(false);
            } else if (statusResponse.status === 'PROCESSING' || statusResponse.status === 'QUEUED') {
              // The animation is still being processed, resume tracking
              setGenerationState(true, processingRequestId);
              
              // Update progress if available
              if (statusResponse.progress) {
                setProgress(statusResponse.progress);
              }
              
              // Start polling again - but first clear any existing ones
              clearAllPollingIntervals();
              
              const intervalId = setInterval(() => {
                if (isMounted.current && !processingCompleted) {
                  checkAnimationStatus(processingRequestId);
                } else {
                  clearInterval(intervalId);
                }
              }, 3000);
              
              setPollingInterval(intervalId);
            } else {
              // The animation failed or is in an unknown state
              setGenerationState(false);
              useAnimationStore.setState({ processingRequestId: null });
            }
          } catch (error) {
            // Specifically handle not found errors
            if (error.response?.status === 404) {
              // Clear state completely
              setGenerationState(false);
              useAnimationStore.setState({ processingRequestId: null });
              sessionStorage.removeItem('animationProcessingRequestId');
            } else {
              // For other errors, just reset the generation state but don't try again
              setGenerationState(false);
            }
          }
        }
      } catch (e) {
        // Safety cleanup
        setGenerationState(false);
        useAnimationStore.setState({ processingRequestId: null });
      }
    };
    
    // Only run this effect if the user is authenticated
    if (user) {
      checkPendingAnimation();
    }
  }, [user, addToast, processingRequestId, generatedVideo, isGenerating, setGenerationState, uploadedImage, setGeneratedVideo, setProgress, processingCompleted, clearAllPollingIntervals]);

  // Handle tab visibility changes
  useEffect(() => {
    // Function to handle visibility change
    const handleVisibilityChange = () => {
      if (processingRequestId && !processingCompleted) {
        if (document.hidden) {
          // Tab is hidden, slow down polling to save resources
          clearAllPollingIntervals();
          
          // Set a slower polling interval when tab is not visible
          const slowIntervalId = setInterval(() => {
            if (isMounted.current && !processingCompleted) {
              checkAnimationStatus(processingRequestId);
            } else {
              clearInterval(slowIntervalId);
            }
          }, 10000); // Poll every 10 seconds when tab is not visible
          
          setPollingInterval(slowIntervalId);
        } else {
          // Tab is visible again, speed up polling
          clearAllPollingIntervals();
          
          // Set normal polling interval when tab is visible
          const normalIntervalId = setInterval(() => {
            if (isMounted.current && !processingCompleted) {
              checkAnimationStatus(processingRequestId);
            } else {
              clearInterval(normalIntervalId);
            }
          }, 3000); // Normal 3-second polling when tab is visible
          
          setPollingInterval(normalIntervalId);
          
          // Also check immediately when tab becomes visible again
          checkAnimationStatus(processingRequestId);
        }
      }
    };
    
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [processingRequestId, processingCompleted, clearAllPollingIntervals]);
  
  // Calculate credit cost based on duration, resolution, and AI model
  const calculateCreditCost = useCallback(() => {
    // Different credit costs for different AI models
    if (aiModel === 'kling-2.1') {
      // Higher costs for Kling 2.1
      if (resolution === '1080p') {
        return duration === '10' ? 2400 : 1200; // 1080p: 10s = 2400, 5s = 1200
      } else {
        return duration === '10' ? 1200 : 600;  // 720p: 10s = 1200, 5s = 600
      }
    } else if (aiModel === 'haiulo-02') {
      // MiniMax Hailuo-02 costs
      if (resolution === '1080p') {
        return duration === '10' ? 2800 : 1400; // 1080p: 10s = 2800, 6s = 1400
      } else {
        return duration === '10' ? 1400 : 700;  // 720p: 10s = 1400, 6s = 700
      }
    } else if (aiModel === 'seedance-1.0') {
      // Seedance 1.0 costs - now supports both 720p and 1080p
      if (resolution === '1080p') {
        return duration === '10' ? 3400 : 1700; // 1080p: 10s = 3400, 5s = 1700
      } else {
        return duration === '10' ? 800 : 450;   // 720p: 10s = 800, 5s = 400
      }
    } else {
      // Standard costs for Kling 1.6 and other models
      if (resolution === '1080p') {
        return duration === '10' ? 2200 : 1100; // 1080p: 10s = 2200, 5s = 1100
      } else {
        return duration === '10' ? 700 : 350;   // 720p: 10s = 700, 5s = 350
      }
    }
  }, [duration, resolution, aiModel]);

  // Total credits required
  const requiredCredits = calculateCreditCost();
  
  // Check if user has enough credits
  const hasEnoughCredits = useMemo(() => {
    return (credits !== null) && (credits >= requiredCredits);
  }, [credits, requiredCredits]);

  // Construct the animation prompt (enhanced for categories)
  const constructAnimationPrompt = useCallback(() => {
    let finalPrompt = '';
    let isPresetPrompt = false;
    
    // Add the custom prompt if provided
    if (customPrompt) {
      finalPrompt += customPrompt;
    }
    
    // Add preset instructions if a preset is selected
    if (storedSelectedPreset) {
      // Get the preset name
      let presetName = storedSelectedPreset.name.toLowerCase();
      
      // Get the category type (without the word "animation" if it exists)
      let categoryType = '';
      if (storedSelectedPreset.categoryId) {
        const category = ANIMATION_PRESETS.find(cat => cat.id === storedSelectedPreset.categoryId);
        if (category) {
          // Remove "Animation(s)" from category name to avoid redundancy
          categoryType = category.name
            .replace(/Animation(s)?/i, '')
            .trim()
            .toLowerCase();
            
          // Add space if categoryType is not empty
          if (categoryType) categoryType += ' ';
        }
      }
      
      // Create the complete effect description 
      const effectDescription = `${categoryType}${presetName}`;
      
      if (finalPrompt) {
        // Add effect to existing prompt
        finalPrompt += `. Apply ${effectDescription} animation to this image.`;
      } else {
        // Only effect instruction
        finalPrompt = `Apply ${effectDescription} animation to this image.`;
        isPresetPrompt = true; // Flag that this is purely a preset-generated prompt
      }
    }
    
    return { prompt: finalPrompt, isPresetPrompt };
  }, [customPrompt, storedSelectedPreset]);

  // Handle image upload
  const handleImageUpload = useCallback((file) => {
    // Create a FileReader to get the image data as base64 for thumbnail storage
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage({ 
        file, 
        url: imageUrl,
        dataUrl: reader.result, // Store base64 for reliable thumbnail
        name: file.name,
        type: file.type,
        lastModified: file.lastModified
      });
    };
    reader.readAsDataURL(file);
  }, [setUploadedImage]);

  // Handle image removal
  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
  }, [setUploadedImage]);
  
  // Handle restoring an animation from trash - optimized to prevent multiple refreshes
  const handleRestoreFromTrash = useCallback((animationId) => {
    // Find the animation in the trash
    const trashAnimation = trashedAnimations.find(anim => anim.id === animationId);
    if (!trashAnimation) return;
    
    // Flag to track if we're already in history view (affects refresh strategy)
    const wasInHistoryView = !useAnimationStore.getState().isTrashOpen;
    
    // Add animation to history
    addAnimation(trashAnimation);
    
    // Remove from trash
    restoreFromTrash(animationId);
    
    // Only force refresh if we're already in history view
    // Otherwise the view change will trigger a refresh automatically
    if (wasInHistoryView) {
      refreshHistory();
    }
    
    addToast(`Animation ${trashAnimation.movement || 'Untitled'} restored`, 'success');
  }, [trashedAnimations, addAnimation, refreshHistory, addToast, restoreFromTrash]);
  
  // Handle emptying the trash
  const handleEmptyTrash = useCallback(() => {
    emptyTrash();
    addToast('Trash has been emptied', 'success');
  }, [addToast]);

  // Capture video thumbnail function
  const captureVideoThumbnail = useCallback(async (videoElement, fallbackImage, videoUrl) => {
    // Special handling for fal.media URLs
    if (videoUrl && videoUrl.includes('fal.media')) {
      try {
        // Dynamically import the fal.media thumbnail generator
        const { generateFalMediaThumbnail } = await import('../utils/falMediaThumbnail');
        
        // Generate thumbnail directly from the URL
        const thumbnail = await generateFalMediaThumbnail(videoUrl, {
          width: 240,
          height: 135
        });
        
        if (thumbnail) {
          return thumbnail;
        }
      } catch (falMediaError) {
        // Silent error handling
        // Continue to standard methods if the special handler fails
      }
    }
    
    // Standard video thumbnail generation
    if (!videoElement) {
      return fallbackImage || createFallbackThumbnail();
    }
    
    try {
      // Try to create thumbnail from video with optimized size
      const thumbnail = await createVideoThumbnail(videoElement, 240, 135); // Reduced size
      
      // Compress the thumbnail if it's too large
      if (thumbnail && thumbnail.length > 50000) {
        try {
          return await compressDataUrl(thumbnail, 0.4); // More aggressive compression
        } catch (compressionError) {
          return thumbnail;
        }
      }
      
      return thumbnail;
    } catch (error) {
      // Use fallback if available, or create a new one
      if (fallbackImage) {
        return fallbackImage;
      }
      return createFallbackThumbnail();
    }
  }, []);
  
  // Enhanced function to check animation status with background processing
  const checkAnimationStatus = async (requestId) => {
    // If already completed, stop checking
    if (!requestId || processingCompleted) {
      return;
    }
    
    // Check if we're in the background
    const isInBackground = useAnimationStore.getState().activeTab !== 'animate';
    
    // Verify that this request ID matches the current one in the store
    // This prevents old polling from affecting new generation attempts
    const currentRequestId = useAnimationStore.getState().processingRequestId;
    if (currentRequestId !== requestId) {
      return;
    }
    
    // Get the current resolution from the animation store
    const currentResolution = useAnimationStore.getState().resolution || '720p';
    
    // Get the generation parameters that were stored when generation started
    const generationParams = useAnimationStore.getState().generationParams;
    // Ensure we get the correct AI model - prioritize stored params, then current component state, then store state
    const generationAiModel = generationParams?.aiModel || aiModel || useAnimationStore.getState().aiModel || 'kling-2.1';
    const generationResolution = generationParams?.resolution || currentResolution;
    
    try {
      // Check the status of the request
      const statusResponse = await apiService.checkAnimationStatus(requestId);
      
      // Continue processing even when component isn't actively displayed
      // Only stop if the component is totally unmounted
      if (!isMounted.current && window.document.visibilityState === 'hidden') {
        return;
      }
      
      // If we've already completed processing once, don't process again
      if (processingCompleted) {
        return;
      }
      
      // Update progress if available
      if (statusResponse.progress) {
        setProgress(statusResponse.progress);
      }
      
      // Check if the animation is completed
      if (statusResponse.status === 'COMPLETED') {
        // Prevent further processing if we've already completed this animation
        if (processingCompleted) {
          return;
        }
        
        // Server returned status with resolution
        
        // Set the processing completed flag to true to prevent further processing
        setProcessingCompleted(true);
        
        // Create a hidden video element for thumbnail generation
        if (!thumbnailVideoRef.current) {
          thumbnailVideoRef.current = document.createElement('video');
          thumbnailVideoRef.current.style.display = 'none';
          document.body.appendChild(thumbnailVideoRef.current);
        }
        
        let thumbnailUrl = '';
        
        // Try to generate a thumbnail from the video
        try {
          // Set the video source
          thumbnailVideoRef.current.src = statusResponse.videoUrl;
          thumbnailVideoRef.current.crossOrigin = 'anonymous';
          
          // Load the video and create a thumbnail
          await new Promise((resolve) => {
            thumbnailVideoRef.current.onloadeddata = resolve;
            
            try {
              if (typeof thumbnailVideoRef.current.load === 'function') {
                thumbnailVideoRef.current.load();
              } else {
                // If load function is not available, resolve immediately
                resolve();
              }
            } catch (loadError) {
              // Silent error handling
              // Still resolve the promise to continue execution
              resolve();
            }
          });
          
          // Set the currentTime to get a frame from the middle of the video
          const seekTime = Math.min(statusResponse.duration ? parseFloat(statusResponse.duration) / 2 : 1, 5);
          thumbnailVideoRef.current.currentTime = seekTime;
          
          // Wait for seeking to complete
          await new Promise((resolve) => {
            thumbnailVideoRef.current.onseeked = resolve;
          });
          
          // Capture the thumbnail with the video URL for special handling
          thumbnailUrl = await captureVideoThumbnail(thumbnailVideoRef.current, uploadedImage?.dataUrl, statusResponse.videoUrl);
        } catch (thumbnailError) {
          // Use the upload image as fallback
          thumbnailUrl = uploadedImage?.dataUrl || createFallbackThumbnail();
        }
        
        // Get preset information for the animation record
        const presetInfo = storedSelectedPreset ? {
          presetId: storedSelectedPreset.id,
          presetName: storedSelectedPreset.name,
          categoryId: storedSelectedPreset.categoryId,
          // Try to get category name from stored preset or from status response
          categoryName: storedSelectedPreset.categoryName || 
                       (storedSelectedPreset.categoryId ? 
                         ANIMATION_PRESETS.find(c => c.id === storedSelectedPreset.categoryId)?.name : 
                         null)
        } : {};
        
        // Create new animation record
    
        const newAnimation = {
          id: requestId, // Use the requestId as the id for cloud compatibility
          url: statusResponse.videoUrl,
          thumbnail: thumbnailUrl,
          // For backwards compatibility
          movement: storedSelectedPreset ? storedSelectedPreset.name : (customPrompt ? 'Custom Animation' : 'Custom'),
          movementId: presetInfo.presetId || statusResponse.presetId || 'custom',
          // New fields for categorized presets
          ...presetInfo,
          duration: statusResponse.duration || duration,
          // Fix: Prioritize server response for resolution, fall back to store value
          resolution: statusResponse.resolution || currentResolution,
          // Store the originally requested resolution for debugging
          requestedResolution: currentResolution,
          // CRITICAL FIX: Prioritize server model response, ensure both fields are set consistently
          model: statusResponse.model || generationAiModel || 'kling-2.1',    // Primary model field
          aiModel: statusResponse.model || generationAiModel || 'kling-2.1',  // Backward compatibility
          // Fix: Ensure custom prompt is always preserved - prioritize custom prompt over server response
          prompt: customPrompt || statusResponse.prompt || null,
          isPresetPrompt: storedSelectedPreset && !customPrompt, // Mark as preset-only prompt if using preset without custom prompt
          timestamp: new Date().toISOString(),
          lastViewed: new Date().toISOString(),
          creditCost: statusResponse.creditsUsed || calculateCreditCost(),
          cloudStored: true // Mark that this is stored in the cloud
        };
        
        // Creating animation with resolution
        
        // Clear all polling intervals to prevent multiple callbacks
        clearAllPollingIntervals();
        
        // First check if this animation already exists in history by URL
        const existingAnimation = animationHistory.find(anim => 
          anim.url === statusResponse.videoUrl
        );
        
        if (existingAnimation) {
        // Update with any new data
  
        
        const updatedAnimation = {
        ...existingAnimation,
        // Add/update any fields that might have changed or been added
        lastViewed: new Date().toISOString(),
        thumbnail: thumbnailUrl || existingAnimation.thumbnail,
        // Fix: Prioritize server response for resolution
        resolution: statusResponse.resolution || existingAnimation.resolution || currentResolution,
        // Always store the originally requested resolution
        requestedResolution: currentResolution,
        // CRITICAL FIX: Prioritize server model response for consistency
        model: statusResponse.model || generationAiModel || existingAnimation.model || 'kling-2.1',
        aiModel: statusResponse.model || generationAiModel || existingAnimation.aiModel || 'kling-2.1',
        // Fix: Ensure custom prompt is preserved - prioritize custom prompt, then existing prompt, then server response
        prompt: customPrompt || existingAnimation.prompt || statusResponse.prompt || null
          };
          
          // Updating existing animation with resolution
          
          // Update UI to show existing animation
          setGeneratedVideo(updatedAnimation);
          setGenerationState(false);
          
          // Update the history entry with new last viewed time
          addAnimation(updatedAnimation);
        } else {
          // Update state with new animation
          setGeneratedVideo(newAnimation);
          setGenerationState(false);
          
          // Add to animation history using the hook function
          addAnimation(newAnimation);
        }
        
        // Refresh credits after successful generation
        await refreshCredits();
        
        // Show toast notification with tab-specific message
        const currentTab = useAnimationStore.getState().activeTab;
        if (currentTab === 'animate') {
          addToast('Animation generated successfully!', 'success');
          
          // Refresh the animation history to show the new animation
          refreshHistory();
        } else {
          // When in a different tab, show a different message
          addToast('Your animation has completed in the background!', 'success');
          
          // Refresh the animation history to show the new animation
          refreshHistory();
        }
        
        // Clean up temporary video element
        try {
        if (thumbnailVideoRef.current) {
        thumbnailVideoRef.current.pause();
        thumbnailVideoRef.current.src = '';
        
        // Only call load if it's a function
          if (typeof thumbnailVideoRef.current.load === 'function') {
              try {
              thumbnailVideoRef.current.load();
              } catch (loadError) {
                  // Silent error handling
                }
              }
              
              thumbnailVideoRef.current.remove();
              thumbnailVideoRef.current = null;
            }
          } catch (cleanupError) {
            // Silent error handling
          }
      } else if (statusResponse.status === 'FAILED') {
        // Animation failed - clear all polling intervals
        clearAllPollingIntervals();
        
        // Set processing completed to prevent further processing
        setProcessingCompleted(true);
        
        // Explicitly clear the generation state and request ID
        setGenerationState(false);
        useAnimationStore.setState({ processingRequestId: null });
        
        // Only show toast if we're in the animate tab
        if (useAnimationStore.getState().activeTab === 'animate') {
          addToast('Animation generation failed. Please try again.', 'error');
        }
      } else {
        // Still processing - continue polling
      }
    } catch (error) {
      // Enhanced error detection
      const isNotFoundError = 
        error.response?.status === 404 || 
        (error.response?.data?.status === 'NOT_FOUND') ||
        (error.message && (
          error.message.includes('not found') || 
          error.message.includes('404')
        ));
      
      // Handle "not found" errors definitively - animation no longer exists
      if (isNotFoundError) {
        // Clear all polling intervals
        clearAllPollingIntervals();
        
        // Set processing completed to prevent further processing
        setProcessingCompleted(true);
        
        // Explicitly clear request ID from the animation store
        setGenerationState(false);
        useAnimationStore.setState({ processingRequestId: null });
        
        // Optional: Notify user the animation is no longer found - only if in animate tab
        if (useAnimationStore.getState().activeTab === 'animate') {
          addToast('Animation request expired or not found.', 'warning');
        }
        return;
      }
      
      // Only continue polling for actual network errors
      if (error.name === 'NetworkError' || 
          (error.message && error.message.includes('network')) ||
          error.code === 'ECONNABORTED') {
        // Will retry on next poll
        // Will retry on next poll
      } 
      // For all other server errors (500+), stop polling
      else if (error.response?.status && error.response.status >= 500) {
        clearAllPollingIntervals();
        
        // Set processing completed to prevent further processing
        setProcessingCompleted(true);
        
        // Explicitly clear the generation state and request ID
        setGenerationState(false);
        useAnimationStore.setState({ processingRequestId: null });
        
        // Only show toast if we're in the animate tab
        if (useAnimationStore.getState().activeTab === 'animate') {
          addToast('Lost connection to the animation server. Please try again.', 'error');
        }
      }
    }
  };
  
  // Subscribe to changes in the store's aiModel
  useEffect(() => {
    // Subscribe to the aiModel changes in the store
    const unsubscribe = useAnimationStore.subscribe(
      state => state.aiModel,
      (storeAiModel) => {
        if (storeAiModel && storeAiModel !== aiModel) {
          setAiModel(storeAiModel);
          
          // Auto-adjust duration when switching to/from haiulo-02
          const currentDuration = useAnimationStore.getState().duration;
          if (storeAiModel === 'haiulo-02' && currentDuration === '5') {
            // Switch from 5s to 6s when selecting haiulo-02
            setDuration('6');
          } else if (storeAiModel !== 'haiulo-02' && currentDuration === '6') {
            // Switch from 6s to 5s when switching away from haiulo-02
            setDuration('5');
          }
          
          // Note: seedance-1.0 now supports both 720p and 1080p
        }
      }
    );
    
    return () => unsubscribe();
  }, [aiModel, setDuration, setResolution]);
  
  // Handle animation generation
const handleGenerate = async () => {
if (!uploadedImage || !uploadedImage.file) {
  addToast('Please upload an image first', 'error');
  return;
}

if (!hasEnoughCredits) {
  addToast(`Not enough credits. You need ${requiredCredits} credits for this animation.`, 'error');
  return;
}

if (customPrompt.length >= 800) {
  addToast('Prompt is too long. Please keep it under 800 characters.', 'error');
  return;
}

// Explicitly reset all generation-related state
setProcessingCompleted(false);
setGeneratedVideo(null); // Clear any existing video
setVideoError(null);

// Create a unique request ID for this generation attempt
const generationAttemptId = Date.now().toString();
  
    // Initialize generation state with the unique attempt ID
    setGenerationState(true);
    setProgress(0);
  
  // Add a timestamp to the request to ensure uniqueness
  const requestTimestamp = Date.now();
    
    try {
      // Construct the final prompt on the frontend
      const { prompt: finalPrompt, isPresetPrompt } = constructAnimationPrompt();
      
      // Prepare additional metadata for categorized presets
      const metadata = {
        ...(storedSelectedPreset ? {
          presetId: storedSelectedPreset.id,
          categoryId: storedSelectedPreset.categoryId,
          preset: storedSelectedPreset.name,
          category: ANIMATION_PRESETS.find(c => c.id === storedSelectedPreset.categoryId)?.name || null,
          isPresetPrompt: isPresetPrompt // Add flag to identify preset-generated prompts
        } : {}),
        // Explicitly include resolution for the server to use
        resolution: resolution, // This will now be correctly passed to the server
        model: aiModel, // Always use the current component state for AI model
        aiModel: aiModel // Also include as aiModel for consistency
      };
      
      // Generating animation with resolution
      
      // Determine the closest standard aspect ratio
      let aspectRatio = '16:9'; // Default to landscape
      if (uploadedImage.file) {
        const img = new Image();
        img.src = uploadedImage.url;
        if (img.width && img.height) {
          const ratio = img.width / img.height;
          
          // Select the closest standard ratio
          if (ratio < 0.8) { // Tall images
            aspectRatio = '9:16'; // Portrait
          } else if (ratio > 0.8 && ratio < 1.2) { // Nearly square
            aspectRatio = '1:1'; // Square
          } else {
            aspectRatio = '16:9'; // Landscape
          }
        }
      }
      
      // Start the animation generation process with timestamp to prevent caching
      const response = await apiService.generateAnimation(
        uploadedImage.file,
        finalPrompt,
        null,  // Don't send movementId separately (it's now part of metadata)
        duration,
        {
          ...metadata,
          requestTimestamp: requestTimestamp, // Add timestamp to ensure uniqueness
          generationAttemptId: generationAttemptId, // Add unique ID for this generation attempt
          // Ensure resolution is correctly passed here
          resolution: resolution,
          // Explicitly include the AI model
          model: aiModel
        },  // Send the preset and category metadata with unique identifiers
        aspectRatio  // Send one of the three standard ratios: 16:9, 9:16, or 1:1
      );
      
      // Animation generation request submitted
      
      // If success, store the requestId and start polling
      if (response.success && response.requestId) {
        // Store generation parameters when starting
        const generationParams = {
          aiModel: aiModel,
          resolution: resolution,
          duration: duration,
          customPrompt: customPrompt,
          selectedPreset: storedSelectedPreset
        };
        
        setGenerationState(true, response.requestId, generationParams);
        
        // Clear any existing intervals first
        clearAllPollingIntervals();
        
        // Set up polling interval to check status
        const intervalId = setInterval(() => {
          if (isMounted.current && !processingCompleted) {
            checkAnimationStatus(response.requestId);
          } else {
            clearInterval(intervalId);
          }
        }, 3000);
        
        setPollingInterval(intervalId);
        
        // Immediately check once to get initial status
        checkAnimationStatus(response.requestId);
      } else {
        throw new Error('Missing request ID in response');
      }
    } catch (error) {
      setGenerationState(false);
      setProcessingCompleted(true);
      
      // Enhanced error debugging - silent
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        addToast('Not enough credits. Please upgrade your account or try again later.', 'error');
      } else if (error.response?.status === 413) {
        addToast('Image is too large. Maximum size is 10MB.', 'error');
      } else if (error.response?.status === 403) {
        // Pro-only feature error
        addToast('Animation generation requires a Pro membership.', 'error');
        // Show premium modal
        if (onPremiumClick) {
          onPremiumClick('pro');
        }
      } else if (error.response?.status === 400) {
        // Handle validation errors specifically
        const errorMessage = error.response.data?.error || 'Invalid parameters for animation generation';
        if (errorMessage.includes('resolution')) {
          // Resolution-specific error
          addToast(`Resolution error: ${errorMessage}. Defaulting to 720p.`, 'error');
          // Reset to 720p for next attempt
          setResolution('720p');
        } else {
          addToast(errorMessage, 'error');
        }
      } else {
        addToast('Failed to start animation generation. Please try again.', 'error');
      }
    }
  };

  // Handle selecting animation from history
  const handleSelectAnimation = useCallback((animation) => {
    // First check if this animation is in the trash
    const trashedAnimations = useAnimationStore.getState().trashedAnimations || [];
    const isInTrash = trashedAnimations.some(trashItem => 
      (trashItem.id && animation.id && trashItem.id === animation.id) ||
      (trashItem.url && animation.url && trashItem.url === animation.url)
    );
    
    // If it's in the trash, show a warning and don't allow selection
    if (isInTrash) {
      addToast('This animation is in the trash. Restore it first to view it.', 'warning');
      return;
    }
    
    // Reset any previous video error
    setVideoError(null);
    
    try {
      // Set the generated video with error handling
      setGeneratedVideo(animation);
    } catch (storageError) {
      // If storing in session storage fails, clean up and try again
      // Attempt to clean up storage
      try {
        cleanupStorage();
        
        // Second attempt after cleanup
        setGeneratedVideo(animation);
      } catch (secondError) {
        // If it still fails, just update in memory without session storage
        addToast('Storage is full, some animations may not be saved between refreshes', 'warning');
        
        // Direct state update bypassing session storage
        useAnimationStore.setState({ generatedVideo: animation });
      }
    }
    
    // Look for the preset in our categories
    if (animation.presetId && animation.categoryId) {
      // If we have both preset and category info, find the preset
      const preset = findPresetById(animation.presetId, animation.categoryId);
      if (preset) {
        setSelectedPreset(preset);
      } else {
        setSelectedPreset(null);
      }
    } 
    // Backwards compatibility: try to find by movementId
    else if (animation.movementId) {
      // Search all presets to find a match
      const allPresets = ANIMATION_PRESETS.flatMap(category => 
        category.presets.map(preset => ({
          ...preset,
          categoryId: category.id
        }))
      );
      
      const matchingPreset = allPresets.find(p => p.id === animation.movementId);
      if (matchingPreset) {
        setSelectedPreset(matchingPreset);
      } else {
        setSelectedPreset(null);
      }
    } else {
      setSelectedPreset(null);
    }
    
    setDuration(animation.duration || '5');
    setCustomPrompt(animation.prompt || '');
    
    // Don't override current resolution settings when just viewing an animation
    // Only set resolution if user explicitly wants to use this animation's settings
    // The resolution should remain what the user currently has selected
    
    // CRITICAL FIX: Always prioritize server-provided model field
    // If not available, fall back to aiModel, but never use a hardcoded default
    const modelToUse = animation.model || animation.aiModel;
    if (modelToUse) {
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
       
      }
      
      // The server-provided model field is the source of truth
      setAiModel(modelToUse);
      // Also update the store
      useAnimationStore.getState().setAiModel(modelToUse);
    }
    // Note: We intentionally don't provide a hardcoded fallback now to avoid overriding
    // the correct model with an incorrect default
    
    // Update video timestamp when selected with error handling
    const existingAnimation = animationHistory.find(a => a.id === animation.id);
    if (existingAnimation) {
      try {
        // Validate animation history is an array before mapping
        if (Array.isArray(animationHistory)) {
          const updatedHistory = animationHistory.map(a => {
            if (a.id === animation.id) {
              return { ...a, lastViewed: new Date().toISOString() };
            }
            return a;
          });
          
          setAnimationHistory(updatedHistory);
          saveAnimationHistory(updatedHistory);
        }
      } catch (historyError) {
        // Silent error handling
      }
    }
  }, [animationHistory, setVideoError, setGeneratedVideo, 
      setSelectedPreset, setDuration, setCustomPrompt, addToast]);
      
  // Handle deleting animation from history - functionality removed
  const handleDeleteAnimation = useCallback((id) => {
    // Animation deletion functionality has been removed
    return;
  }, []);

  // Handle download animation
  const handleDownloadAnimation = useCallback(async (animationOrEvent) => {
    // Determine which animation to download - if it's an animation object, use it directly
    // If it's not an animation object (could be an event or undefined), use the current generatedVideo
    const videoToDownload = 
      (animationOrEvent && typeof animationOrEvent === 'object' && animationOrEvent.url) 
        ? animationOrEvent 
        : generatedVideo;
    
    if (!videoToDownload || !videoToDownload.url) {
      addToast('No animation available to download', 'error');
      return;
    }
    
    try {
      // Show download starting message
      addToast('Starting download...', 'info');
      
      // Fetch the video as a blob
      const response = await fetch(videoToDownload.url);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      
      // Create a local URL for the blob
      const blobUrl = URL.createObjectURL(videoBlob);
      
      // Create a filename based on animation details
      const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
      const movement = videoToDownload.movement || 'animation';
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
      addToast(`Failed to download animation: ${error.message}`, 'error');
    }
  }, [generatedVideo, addToast]);
  
  // Toggle mobile controls expansion
  const toggleControlsExpansion = useCallback(() => {
    setIsExpandedMobile(!isExpandedMobile);
  }, [isExpandedMobile]);

  // Handle suggestion button click to generate animation prompt
  const handleSuggestPrompt = async () => {
    // Check if an image is uploaded
    if (!uploadedImage || !uploadedImage.file) {
      addToast('Please upload an image first', 'error');
      return;
    }

    // Set loading state
    setIsSuggestionLoading(true);

    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('image', uploadedImage.file);

      // Call the API
      const response = await apiService.suggestAnimationPrompt(formData);
      
      if (response && response.suggestion) {
        // Update the custom prompt with the suggestion
        setCustomPrompt(response.suggestion);
        addToast('Generated animation prompt suggestion', 'success');
      } else {
        addToast('Failed to generate suggestion', 'error');
      }
    } catch (error) {
      logger.error('Error suggesting animation prompt:', error);
      
      // Check for credit limit or premium errors
      if (error.response?.status === 429 || 
          error.response?.status === 403 || 
          error.response?.data?.error?.includes('premium')) {
        addToast('Not enough credits to generate a suggestion', 'error');
      } else {
        addToast('Failed to generate suggestion. Please try again.', 'error');
      }
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  // Handle video error
  const handleVideoError = useCallback((error) => {
    setVideoError("Error playing video. The video file might be corrupted or inaccessible.");
    
    // Attempt to retry loading the video after a short delay
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
      }
    }, 2000);
  }, [setVideoError]);

  // Handle the upgrade button click
  const handleUpgradeClick = useCallback(() => {
    // Call the provided premium modal opener with pro membership pre-selected
    if (onPremiumClick) {
      onPremiumClick('pro');
    }
  }, [onPremiumClick]);

  // Styling classes
  const labelClass = "text-sm font-medium text-[var(--text)]";
  const inputClass = "w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--inputBackground)] text-[var(--text)] placeholder-[var(--textSecondary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all duration-200";
  const cardClass = "bg-[var(--cardBackground)] rounded-xl border border-[var(--border)] shadow-sm";
  
  // Advanced options section toggle
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  return (
    <ContentContainer maxWidth="max-w-7xl">
      <div className="flex-1 flex flex-col min-h-0 p-4 bg-[var(--background)] overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 h-full min-h-0 overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-full md:w-[500px] flex flex-col min-h-0">

            {/* Mobile Controls Toggle */}
            {isMobile && (
              <button
                onClick={toggleControlsExpansion}
                className="flex items-center justify-between w-full p-4 mb-2 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)]"
              >
                <span className="font-medium text-[var(--text)]">Animation Controls</span>
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
                    <h2 className="text-xl font-semibold text-[var(--text)]">Image to Video Settings</h2>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Instructions */}
                    <div className="rounded-lg bg-[var(--cardBackground)]/50 p-3 border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Info size={14} className="text-[var(--primary)]" />
                        <span className="text-sm font-medium text-[var(--text)]">How It Works</span>
                      </div>
                      <p className="text-xs text-[var(--textSecondary)]">
                        Upload an image, select an animation type, and add an optional prompt to generate an AI-powered animation.
                      </p>
                      {!isProMember && (
                        <div className="flex items-center mt-2 text-xs premium-restriction-text">
                          <Crown size={12} className="mr-1" />
                          Only available to  <span className="ml-1 font-medium">
  Pro & Visionary <span className="font-normal">members</span>
</span>

                        </div>
                      )}
                    </div>

                    {/* Image Upload - Now at the top */}
                    <div className="space-y-2">
                      <label className={labelClass}>Source Image</label>
                      {uploadedImage ? (
                        <div className="relative rounded-lg border border-[var(--border)] overflow-hidden">
                          <img 
                            src={uploadedImage.url} 
                            alt="Preview" 
                            className="w-full object-contain max-h-40"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-[var(--text)] transition-colors"
                            aria-label="Remove image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <ImageUpload
                          onFileSelect={handleImageUpload}
                          accept="image/jpeg,image/png,image/webp"
                          maxSize={30485760} // 10MB
                          className="bg-[var(--inputBackground)] border-[var(--border)]"
                          initialPreview={uploadedImage?.url}
                        />
                      )}
                    </div>

                    {uploadedImage && (
                      <>
                        {/* Custom Prompt */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className={labelClass}>
                              Custom Prompt (Optional)
                            </label>
                            {uploadedImage && (
                        <button
                        onClick={handleSuggestPrompt}
                        disabled={isSuggestionLoading || isGenerating}
                        className="px-3 py-1.5 text-xs rounded-md bg-[var(--dropdownHover)] hover:bg-[var(--border)] text-[var(--text)] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-[var(--border)] hover:border-[var(--textSecondary)]"
                      >
                        {isSuggestionLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-[var(--text)]" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Cat size={14} className="text-[var(--text)]" />
                            <span>Generate Prompt</span>
                          </>
                        )}
                      </button>
                      
                      
                      
                       
                        
                        
                         
                          
                           
                            )}
                          </div>
                          <div className="relative group">
                            <textarea
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              placeholder="Add specific details to guide the animation..."
                              maxLength={800}
                              className={`${inputClass} h-24 resize-none pr-10 ${customPrompt.length >= 800 ? 'border-red-400' : customPrompt.length >= 720 ? 'border-yellow-400' : ''}`}
                            />
                            {customPrompt && (
                              <button
                                onClick={() => setCustomPrompt('')}
                                className="absolute right-3 top-3 p-1.5 rounded-full 
                                  bg-[var(--dropdownHover)] hover:bg-[var(--border)] 
                                  text-[var(--textSecondary)] hover:text-[var(--text)]
                                  transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                            
                            {/* Warning message when approaching limit */}
                            {customPrompt.length >= 720 && (
                              <div className="flex items-center justify-between mt-1 text-xs">
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <AlertCircle size={12} />
                                  <span>{customPrompt.length >= 800 ? "Maximum character limit reached" : `${800 - customPrompt.length} characters remaining`}</span>
                                </div>
                                <span className={`font-medium ${customPrompt.length >= 800 ? 'text-red-400' : 'text-yellow-400'}`}>
                                  {customPrompt.length}/800
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Animation Presets */}
                        <div className="space-y-2">
                          <label className={labelClass}>Animation Type (Optional)</label>
                          
                          {/* Categorized Animation Presets */}
                          <div className="space-y-2">
                            {ANIMATION_PRESETS.map(category => (
                              <CollapsibleCategory
                                key={category.id}
                                category={category}
                                isExpanded={!!expandedCategories[category.id]}
                                onToggle={() => toggleCategory(category.id)}
                                selectedPreset={storedSelectedPreset}
                                onSelectPreset={setSelectedPreset}
                                isPremiumUser={isPremiumUser}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Duration Selection */}
                        <div className="space-y-2">
                          <label className={labelClass}>Duration</label>
                          <div className="grid grid-cols-2 gap-2">
                            {animationDurations.map((option) => {
                              const isPremium = option.premium && !isPremiumUser;
                              
                              return (
                                <button 
                                  key={option.value}
                                  onClick={() => !isPremium && setDuration(option.value)}
                                  className={`flex flex-col px-3 py-2.5 rounded-lg border transition-all ${
                                    duration === option.value 
                                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                                      : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5'
                                  } ${isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={isPremium}
                                >
                                  <span className="font-medium text-sm text-[var(--text)]">{option.label}</span>
                                  <span className="text-xs text-[var(--textSecondary)] mt-0.5">{option.description}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Video Resolution */}
                    <div className="space-y-2">
                      <label className={labelClass}>Video Resolution</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VIDEO_RESOLUTIONS.map((option) => {
                          const isPremiumOption = option.premium && !isPremiumUser;
                          
                          // Calculate credit cost for this resolution option based on current duration and AI model
                          const getCreditCostForOption = (resolutionOption, durationValue, modelValue) => {
                            if (modelValue === 'kling-2.1') {
                              if (resolutionOption === '1080p') {
                                return durationValue === '10' ? 2400 : 1200; // 1080p: 10s = 2400, 5s = 1200
                              } else {
                                return durationValue === '10' ? 1200 : 600;  // 720p: 10s = 1200, 5s = 600
                              }
                            } else if (modelValue === 'haiulo-02') {
                              if (resolutionOption === '1080p') {
                                return durationValue === '10' ? 2800 : 1400; // 1080p: 10s = 2800, 6s = 1400
                              } else {
                                return durationValue === '10' ? 1400 : 700;  // 720p: 10s = 1400, 6s = 700
                              }
                            } else if (modelValue === 'seedance-1.0') {
                              // Seedance 1.0 costs - now supports both 720p and 1080p
                              if (resolutionOption === '1080p') {
                                return durationValue === '10' ? 3400 : 1700; // 1080p: 10s = 3400, 5s = 1700
                              } else {
                                return durationValue === '10' ? 800 : 400;   // 720p: 10s = 800, 5s = 400
                              }
                            } else {
                              if (resolutionOption === '1080p') {
                                return durationValue === '10' ? 2200 : 1100; // 1080p: 10s = 2200, 5s = 1100
                              } else {
                                return durationValue === '10' ? 700 : 350;   // 720p: 10s = 700, 5s = 350
                              }
                            }
                          };
                          
                          const creditCost = getCreditCostForOption(option.value, duration, aiModel);
                          
                          return (
                          <button 
                            key={option.value}
                            onClick={() => !isPremiumOption && setResolution(option.value)}
                            className={`flex flex-col px-3 py-2.5 rounded-lg border transition-all ${
                              resolution === option.value 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5'
                            } ${isPremiumOption ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isPremiumOption}
                          >
                            <span className="font-medium text-sm text-[var(--text)]">{option.label}</span>
                            <div className="flex flex-col items-center justify-center w-full">
                              <span className="text-xs text-[var(--textSecondary)]">
                                {option.description}
                              </span>
                              {/* Only show credit cost for non-pro users */}
                              {!isProMember && creditCost && (
                                <span className="text-xs text-gray-500 mt-0.5">
                                  {creditCost} credits
                                </span>
                              )}
                            </div>
                          </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>AI Model</label>
                      </div>
                      <div className="space-y-2">
                        {AI_MODELS.map((model) => (
                          <button 
                            key={model.value}
                            onClick={() => {
                              if (!model.disabled) {
                                setAiModel(model.value);
                                // Update the store when model changes
                                useAnimationStore.getState().setAiModel(model.value);
                              }
                            }}
                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border transition-all
                              ${model.value === aiModel 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
                                : 'border-[var(--border)] bg-[var(--inputBackground)]'
                              } ${model.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={model.disabled}
                          >
                            <div className="flex flex-col text-left">
                              <div className="flex items-center">
                                <span className="font-medium text-sm text-[var(--text)]">{model.label}</span>
                                {model.isNew && (
                                  <span className="ml-2 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-sm text-[10px] font-medium">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-[var(--textSecondary)] mt-0.5">{model.description}</span>
                            </div>
                          </button>
                        ))}
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
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[var(--primary)] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Loader2 size={20} className="animate-spin text-black" />
                          <span className="text-black">Generating...</span>
                        </motion.button>
                      ) : !uploadedImage ? (
                        // Disabled button when no image is uploaded
                        <motion.button
                          disabled={true}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[var(--primary)] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <PlayCircle size={20} className="shrink-0 text-black" />
                          <span className="flex-1 text-black">Generate Animation</span>
                          <span className="text-sm text-black opacity-80 bg-white/15 px-2 py-0.5 rounded">
                            {requiredCredits} Credits
                          </span>
                        </motion.button>
                      ) : customPrompt.length >= 800 ? (
                        // Disabled button when prompt is too long
                        <motion.button
                          disabled={true}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[var(--primary)] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <PlayCircle size={20} className="shrink-0 text-black" />
                          <span className="flex-1 text-black">Generate Animation</span>
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
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[var(--primary)] text-black font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <PlayCircle size={20} className="shrink-0 text-black" />
                          <span className="flex-1 text-black">Generate Animation</span>
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
                      // Free and Premium members see the upgrade button with credit cost
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUpgradeClick}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-green-500 text-black font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
              {!uploadedImage && !isGenerating && !generatedVideo ? (
                <EmptyState />
              ) : isGenerating ? (
                <div className="w-full max-w-4xl mx-auto">
                  <div className="aspect-video rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--inputBackground)] flex flex-col items-center justify-center" style={{ minHeight: '360px' }}>
                    <AnimationLoadingState 
                      uploadedImage={uploadedImage}
                      duration={duration}
                      progress={progress}
                    />
                  </div>
                </div>
              ) : generatedVideo ? (
                <div className="w-full max-w-4xl mx-auto">
                  <AnimationPlayer
                    animation={generatedVideo}
                    onClose={() => setGeneratedVideo(null)}
                    onDownload={() => handleDownloadAnimation(generatedVideo)}
                    onRetry={() => {
                      // Set video ref to null and force a reload
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                      setVideoError(null);
                    }}
                    onNewAnimation={() => resetForm()}
                  />
                </div>
              ) : uploadedImage ? (
                <div className="w-full max-w-2xl mx-auto">
                  {/* Image Preview */}
                  <div className="aspect-video rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--inputBackground)]">
                    <img 
                      src={uploadedImage.url} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Selected Settings Preview */}
                  {storedSelectedPreset && (
                    <div className="mt-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--inputBackground)]">
                      <h3 className="text-sm font-medium text-[var(--text)] mb-2">Selected Animation</h3>
                      
                      <div className="flex items-center gap-2">
                        <Move className="w-4 h-4 text-[var(--primary)]" />
                        <span className="text-sm text-[var(--primary)] font-medium">
                          {storedSelectedPreset.name}
                        </span>
                        {storedSelectedPreset.categoryId && (
                          <span className="text-xs text-[var(--textSecondary)]">
                            ({ANIMATION_PRESETS.find(c => c.id === storedSelectedPreset.categoryId)?.name})
                          </span>
                        )}
                       <span className="text-xs text-[var(--textSecondary)] ml-auto">{duration}s {resolution}</span>
                        </div>
                      
                      <p className="text-xs text-[var(--textSecondary)] mt-1">{storedSelectedPreset.description}</p>
                      
                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--textSecondary)]">
                          <span>Resolution: <strong>{resolution}</strong></span>
                          <div className="w-1 h-1 rounded-full bg-[var(--textSecondary)]/30"></div>
                          <span>Model: <strong>{AI_MODELS.find(m => m.value === aiModel)?.label}</strong></span>
                        </div>
                      </div>
                      
                      {customPrompt && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)]">
                          <p className="text-xs text-[var(--textSecondary)] mb-1">Custom Prompt:</p>
                          <p className="text-sm text-[var(--text)]">{customPrompt}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
              
              {/* Animation History or Trash View */}
              {isTrashOpen ? (
                <TrashView
                  onRestore={handleRestoreFromTrash}
                  onEmptyTrash={handleEmptyTrash}
                  onDownload={handleDownloadAnimation}
                />
              ) : (
                <AnimationHistory
                  history={animationHistory}
                  onSelect={handleSelectAnimation}
                  onDelete={handleDeleteAnimation}
                  onDownload={handleDownloadAnimation}
                  currentVideoId={generatedVideo?.id}
                  onProUpgradeClick={handleUpgradeClick}
                  isProMember={isProMember}
                  isGenerating={isGenerating}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
};

export default Animate;