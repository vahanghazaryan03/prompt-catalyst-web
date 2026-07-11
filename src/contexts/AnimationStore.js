// Updated src/contexts/AnimationStore.js
import { create } from 'zustand';
import { cleanupStorage } from '../utils/animationStorage';

// Keys for session storage backup
const SESSION_KEYS = {
  UPLOADED_IMAGE: 'animation_uploaded_image',
  SELECTED_PRESET: 'animation_selected_preset',
  CUSTOM_PROMPT: 'animation_custom_prompt',
  DURATION: 'animation_duration',
  RESOLUTION: 'animation_resolution',
  AI_MODEL: 'animation_ai_model',
  IS_GENERATING: 'animation_is_generating',
  REQUEST_ID: 'animation_request_id',
  GENERATED_VIDEO: 'animation_generated_video',
  ACTIVE_TAB: 'animation_active_tab', // Track which tab is active
  TRASH_VIEW: 'animation_trash_view' // New key to track if we're in trash view
};

// Constants for localStorage keys (these persist across sessions)
const LOCAL_STORAGE_KEYS = {
  TRASHED_ANIMATIONS: 'animation_trashed_items', // Store for trashed animations - in localStorage to persist
  TRASH_VIEW: 'animation_trash_view' // Track if trash view is open - in localStorage to persist
};

// Helper to get image data from session storage
const getSessionImage = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_KEYS.UPLOADED_IMAGE);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error parsing uploaded image from session storage:', e);
    return null;
  }
};

// Helper to save image data to session storage
const saveSessionImage = (imageData) => {
  if (imageData) {
    try {
      // Only store the necessary information, not the file object itself
      // And limit the size of dataUrl by not storing it if it's too large
      const imageInfo = {
        url: imageData.url,
        // Only store small thumbnails, limit size for larger ones
        dataUrl: imageData.dataUrl?.length > 10000 
          ? null 
          : imageData.dataUrl,
        name: imageData.file?.name,
        type: imageData.file?.type,
        lastModified: imageData.file?.lastModified
      };
      sessionStorage.setItem(SESSION_KEYS.UPLOADED_IMAGE, JSON.stringify(imageInfo));
    } catch (e) {
      console.warn('Session storage quota exceeded for image, using fallback storage', e);
      // Just continue without storing in session
    }
  } else {
    sessionStorage.removeItem(SESSION_KEYS.UPLOADED_IMAGE);
  }
};

// Helper to get generated video from session storage
const getSessionVideo = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_KEYS.GENERATED_VIDEO);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error parsing generated video from session storage:', e);
    return null;
  }
};

// Helper to get selected preset with category
const getSessionPreset = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_KEYS.SELECTED_PRESET);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error parsing selected preset from session storage:', e);
    return null;
  }
};

// Helper to get trashed animations from local storage for persistence
const getTrashedAnimations = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TRASHED_ANIMATIONS);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error parsing trashed animations from local storage:', e);
    return [];
  }
};

// Helper to save trashed animations to local storage for persistence across sessions
const saveTrashedAnimations = (trashedItems) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRASHED_ANIMATIONS, JSON.stringify(trashedItems));
  } catch (e) {
    console.warn('Local storage quota exceeded for trashed animations', e);
    // Try to save with minimal data if full save fails
    try {
      // Create minimal version with only essential data
      const minimalTrashedItems = trashedItems.map(item => ({
        id: item.id,
        url: item.url,
        movement: item.movement || 'Unknown',
        movementId: item.movementId || 'unknown',
        presetName: item.presetName,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        duration: item.duration,
        timestamp: item.timestamp,
        trashedAt: item.trashedAt || new Date().toISOString()
        // Exclude thumbnails and other large data
      }));
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRASHED_ANIMATIONS, JSON.stringify(minimalTrashedItems));
    } catch (fallbackError) {
      console.error('Failed to store trashed animations even with minimal data', fallbackError);
      // Continue without storing
    }
  }
};

// Create the store
const useAnimationStore = create((set, get) => ({
  // Image state
  uploadedImage: getSessionImage(),
  
  // Animation settings
  selectedPreset: getSessionPreset(),
  customPrompt: sessionStorage.getItem(SESSION_KEYS.CUSTOM_PROMPT) || '',
  duration: sessionStorage.getItem(SESSION_KEYS.DURATION) || '5',
  resolution: sessionStorage.getItem(SESSION_KEYS.RESOLUTION) || '720p',
  aiModel: sessionStorage.getItem(SESSION_KEYS.AI_MODEL) || 'kling-2.1',
  
  // Generation state
  isGenerating: sessionStorage.getItem(SESSION_KEYS.IS_GENERATING) === 'true',
  processingRequestId: sessionStorage.getItem(SESSION_KEYS.REQUEST_ID) || null,
  generatedVideo: getSessionVideo(),
  
  // Store generation parameters when generation starts
  generationParams: null,
  
  // Progress tracking
  progress: 0,
  videoError: null,
  
  // Tab state
  activeTab: sessionStorage.getItem(SESSION_KEYS.ACTIVE_TAB) || 'none',
  
  // Trash state - use localStorage for persistence across sessions
  isTrashOpen: localStorage.getItem(LOCAL_STORAGE_KEYS.TRASH_VIEW) === 'true',
  trashedAnimations: getTrashedAnimations(),

  // Action: Set active tab while preserving animation state - optimized to avoid unnecessary refreshes
  setActiveTab: (tab) => {
    const prevTab = get().activeTab;
    const prevIsGenerating = get().isGenerating;
    
    // Skip if the tab isn't actually changing
    if (prevTab === tab) return;
    
    // Update the active tab
    set({ activeTab: tab });
    
    try {
      sessionStorage.setItem(SESSION_KEYS.ACTIVE_TAB, tab);
    } catch (error) {
      // Ignore storage errors
    }
    
    // Store the previous tab if it was animate and we're processing
    if (prevTab === 'animate' && prevIsGenerating) {
      set({ previousAnimateTab: 'animate' });
      try {
        sessionStorage.setItem('previousAnimateTab', 'animate');
      } catch (error) {
        // Ignore storage errors
      }
    }
  },
  
  // Action: Set uploaded image
  setUploadedImage: (imageData) => {
    // If removing an existing image, revoke its URL
    const currentImage = get().uploadedImage;
    if (currentImage?.url && currentImage.url.startsWith('blob:') && !imageData) {
      URL.revokeObjectURL(currentImage.url);
    }
    
    // Update the state
    set({ uploadedImage: imageData });
    
    // Update session storage
    saveSessionImage(imageData);
    
    // Clear video when uploading new image
    if (imageData) {
      set({ 
        generatedVideo: null,
        videoError: null
      });
      sessionStorage.removeItem(SESSION_KEYS.GENERATED_VIDEO);
    }
  },
  
  // Action: Set selected preset
  setSelectedPreset: (preset) => {
    set({ selectedPreset: preset });
    
    try {
      if (preset) {
        sessionStorage.setItem(SESSION_KEYS.SELECTED_PRESET, JSON.stringify(preset));
      } else {
        sessionStorage.removeItem(SESSION_KEYS.SELECTED_PRESET);
      }
    } catch (error) {
      // If storage fails, just keep in memory
      console.warn('Failed to save preset to session storage:', error);
    }
  },
  
  // Action: Set custom prompt
  setCustomPrompt: (prompt) => {
    set({ customPrompt: prompt });
    try {
      sessionStorage.setItem(SESSION_KEYS.CUSTOM_PROMPT, prompt);
    } catch (error) {
      // If storage fails, just keep in memory
      console.warn('Failed to save prompt to session storage:', error);
    }
  },
  
  // Action: Set duration
  setDuration: (duration) => {
    // Validate duration based on current AI model
    const currentAiModel = get().aiModel;
    const validDurations = currentAiModel === 'haiulo-02' ? ['6', '10'] : ['5', '10'];
    
    if (!validDurations.includes(duration)) {
      // Auto-correct invalid duration based on model
      duration = currentAiModel === 'haiulo-02' ? '6' : '5';
    }
    
    set({ duration });
    try {
      sessionStorage.setItem(SESSION_KEYS.DURATION, duration);
    } catch (error) {
      // If storage fails, just keep in memory
      console.warn('Failed to save duration to session storage:', error);
    }
  },
  
  // Action: Set resolution
  setResolution: (resolution) => {
    // Validate resolution is either 720p or 1080p
    if (resolution !== '720p' && resolution !== '1080p') {
      resolution = '720p'; // Default to 720p if invalid
    }
    set({ resolution });
    try {
      sessionStorage.setItem(SESSION_KEYS.RESOLUTION, resolution);
    } catch (error) {
      // If storage fails, just keep in memory
      console.warn('Failed to save resolution to session storage:', error);
    }
  },
  
  // Action: Set AI model
  setAiModel: (model) => {
    const currentDuration = get().duration;
    const currentResolution = get().resolution;
    
    // Auto-adjust duration when switching to/from haiulo-02
    let newDuration = currentDuration;
    if (model === 'haiulo-02' && currentDuration === '5') {
      newDuration = '6'; // Switch from 5s to 6s for haiulo-02
    } else if (model !== 'haiulo-02' && currentDuration === '6') {
      newDuration = '5'; // Switch from 6s to 5s for other models
    }
    
    // Auto-adjust resolution when switching to/from seedance-1.0 (720p only)
    let newResolution = currentResolution;
    if (model === 'seedance-1.0' && currentResolution === '1080p') {
      newResolution = '720p'; // Switch to 720p for seedance-1.0 (only supports 720p)
    }
    
    set({ aiModel: model, duration: newDuration, resolution: newResolution });
    try {
      sessionStorage.setItem(SESSION_KEYS.AI_MODEL, model);
      sessionStorage.setItem(SESSION_KEYS.DURATION, newDuration);
      sessionStorage.setItem(SESSION_KEYS.RESOLUTION, newResolution);
    } catch (error) {
      // If storage fails, just keep in memory
      console.warn('Failed to save AI model/settings to session storage:', error);
    }
  },
  
  // Action: Update generation state
  setGenerationState: (isGenerating, requestId = null, progress = 0) => {
    set({ 
      isGenerating, 
      processingRequestId: isGenerating ? requestId : null, // Always clear requestId when setting isGenerating to false
      progress
    });
    
    try {
      sessionStorage.setItem(SESSION_KEYS.IS_GENERATING, isGenerating);
      
      if (requestId && isGenerating) {
        sessionStorage.setItem(SESSION_KEYS.REQUEST_ID, requestId);
      } else {
        // Always clear request ID when generation is complete
        sessionStorage.removeItem(SESSION_KEYS.REQUEST_ID);
      }
    } catch (error) {
      // If storage fails, just keep in memory
      console.warn('Failed to save generation state to session storage:', error);
    }
  },
  
  // Action: Store generation parameters when generation starts
  setGenerationParams: (params) => {
    set({ generationParams: params });
  },
  
  // Action: Set generated video with optimized storage approach
  setGeneratedVideo: (video) => {
    try {
      if (video) {
        // Keep full video in memory
        set({ generatedVideo: video });
        
        // Create a storage-optimized version without large data URLs
        const storageOptimizedVideo = {
          ...video,
          // Don't store the thumbnail data URL in session storage if it's large
          thumbnail: video.thumbnail?.startsWith('data:') && video.thumbnail?.length > 10000
            ? '[thumbnail-data-url]' // Replace with marker instead of actual data
            : video.thumbnail, // Keep the thumbnail if it's not a data URL or if it's small
          thumbnailDataUrl: undefined // Never store this in session
        };
        
        sessionStorage.setItem(SESSION_KEYS.GENERATED_VIDEO, JSON.stringify(storageOptimizedVideo));
      } else {
        set({ generatedVideo: null });
        sessionStorage.removeItem(SESSION_KEYS.GENERATED_VIDEO);
      }
    } catch (error) {
      // Handle storage quota error gracefully
      console.warn('Session storage error when saving video:', error.message);
      
      // Still update the in-memory state even if storage fails
      set({ generatedVideo: video });
      
      // Try to clear other session items to make space
      try {
        cleanupStorage();
        
        // Try again with minimal data
        if (video) {
          const minimalVideo = {
            id: video.id,
            url: video.url,
            // For backward compatibility
            movement: video.movement || video.presetName || 'Unknown',
            movementId: video.movementId || video.presetId || 'unknown',
            // New categorized preset fields
            presetId: video.presetId,
            presetName: video.presetName,
            categoryId: video.categoryId,
            categoryName: video.categoryName,
            duration: video.duration,
            resolution: video.resolution,
            aiModel: video.aiModel,
            prompt: video.prompt,
            timestamp: video.timestamp,
            lastViewed: video.lastViewed,
            creditCost: video.creditCost
            // Explicitly omit all thumbnail data
          };
          sessionStorage.setItem(SESSION_KEYS.GENERATED_VIDEO, JSON.stringify(minimalVideo));
        }
      } catch (secondError) {
        console.error('Failed to save video even after cleanup:', secondError);
        // Just continue with in-memory state
      }
    }
  },
  
  // Action: Set video error
  setVideoError: (error) => {
    set({ videoError: error });
  },
  
  // Action: Set progress
  setProgress: (progress) => {
    set({ progress });
  },
  
  // Action: Reset form
  resetForm: () => {
    // Get current state to preserve aiModel
    const currentState = get();
    
    // Set appropriate default duration based on AI model
    const defaultDuration = currentState.aiModel === 'haiulo-02' ? '6' : '5';
    
    set({ 
      generatedVideo: null,
      selectedPreset: null,
      customPrompt: '',
      duration: defaultDuration,
      // Don't reset resolution - this is a user preference that should persist
      // resolution: '720p', // REMOVED - keep user's current resolution setting
      // Keep the current AI model instead of resetting it
      aiModel: currentState.aiModel,
      progress: 0,
      videoError: null,
      isGenerating: false,
      processingRequestId: null,
      generationParams: null // Clear generation params on reset
    });
    
    // Clear session storage
    try {
      sessionStorage.removeItem(SESSION_KEYS.GENERATED_VIDEO);
      sessionStorage.removeItem(SESSION_KEYS.SELECTED_PRESET);
      sessionStorage.removeItem(SESSION_KEYS.CUSTOM_PROMPT);
      sessionStorage.removeItem(SESSION_KEYS.IS_GENERATING);
      sessionStorage.removeItem(SESSION_KEYS.REQUEST_ID);
      sessionStorage.setItem(SESSION_KEYS.DURATION, defaultDuration);
      // Don't reset resolution in session storage - keep user's preference
      // sessionStorage.setItem(SESSION_KEYS.RESOLUTION, '720p'); // REMOVED
      // Keep existing AI model in session storage
      // sessionStorage.setItem(SESSION_KEYS.AI_MODEL, 'kling-1.6');
    } catch (error) {
      console.warn('Error clearing session storage during reset:', error);
    }
  },
  
  // Action: Clear everything
  clearEverything: () => {
    // Revoke any blob URLs first
    const currentImage = get().uploadedImage;
    if (currentImage?.url && currentImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(currentImage.url);
    }
    
    // Reset all state
    set({
      uploadedImage: null,
      generatedVideo: null,
      selectedPreset: null,
      customPrompt: '',
      duration: '5',
      resolution: '720p',
      aiModel: 'kling-2.1',
      isGenerating: false,
      processingRequestId: null,
      progress: 0,
      videoError: null
    });
    
    // Clear all session storage
    try {
      Object.values(SESSION_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Error clearing session storage during full reset:', error);
    }
  },
  
  // Toggle trash view with improved return behavior - persists across sessions
  toggleTrashView: () => {
    const newTrashState = !get().isTrashOpen;
    
    // When toggling back to history view, update state immediately
    set({ isTrashOpen: newTrashState });
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRASH_VIEW, newTrashState.toString());
    } catch (error) {
      console.warn('Failed to save trash view state to local storage:', error);
    }
  },
  
  // Move animation to trash
  trashAnimation: (animation) => {
    // Add to trashed animations
    const currentTrashedAnimations = [...get().trashedAnimations];
    
    // Make sure we preserve all necessary fields, especially thumbnails
    // Create a deep copy to avoid reference issues
    const animationWithTrashInfo = {
      ...JSON.parse(JSON.stringify(animation)),
      trashedAt: new Date().toISOString(),
      // Ensure thumbnail is preserved
      thumbnail: animation.thumbnail || animation.thumbnailDataUrl || null,
      thumbnailDataUrl: animation.thumbnailDataUrl || animation.thumbnail || null,
    };
    
    // Check if animation already exists in trash
    const existingIndex = currentTrashedAnimations.findIndex(a => a.id === animation.id);
    if (existingIndex !== -1) {
      // Update existing animation
      currentTrashedAnimations[existingIndex] = animationWithTrashInfo;
    } else {
      // Add new animation to trash
      currentTrashedAnimations.push(animationWithTrashInfo);
    }
    
    set({ trashedAnimations: currentTrashedAnimations });
    saveTrashedAnimations(currentTrashedAnimations);
    
    return currentTrashedAnimations;
  },
  
  // Restore animation from trash
  restoreFromTrash: (animationId) => {
    const currentTrashedAnimations = [...get().trashedAnimations];
    const updatedTrashedAnimations = currentTrashedAnimations.filter(a => a.id !== animationId);
    
    // If this was the last item in trash, automatically toggle back to history view
    if (updatedTrashedAnimations.length === 0 && get().isTrashOpen) {
    set({ 
    trashedAnimations: updatedTrashedAnimations,
    isTrashOpen: false
    });
    try {
    saveTrashedAnimations(updatedTrashedAnimations);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRASH_VIEW, 'false');
    } catch (error) {
    console.warn('Failed to save trash state to local storage:', error);
    }
    } else {
    set({ trashedAnimations: updatedTrashedAnimations });
    saveTrashedAnimations(updatedTrashedAnimations);
    }
    
    return updatedTrashedAnimations;
  },
  
  // Empty the trash - ensures localStorage is updated
  emptyTrash: () => {
    set({ trashedAnimations: [] });
    saveTrashedAnimations([]);
    
    // Also update isTrashOpen if trash is now empty (optional UX improvement)
    const currentState = get();
    if (currentState.isTrashOpen && currentState.trashedAnimations.length === 0) {
      set({ isTrashOpen: false });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.TRASH_VIEW, 'false');
      } catch (error) {
        console.warn('Failed to update trash view state in local storage:', error);
      }
    }
  }
}));

export default useAnimationStore;