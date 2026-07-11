// src/contexts/VideoStore.js
import { create } from 'zustand';

// Keys for session storage
const SESSION_KEYS = {
  VIDEO_PROMPT: 'text_to_video_prompt',
  VIDEO_DURATION: 'text_to_video_duration',
  VIDEO_RESOLUTION: 'text_to_video_resolution',
  VIDEO_ASPECT_RATIO: 'text_to_video_aspect_ratio',

  VIDEO_CFG_SCALE: 'text_to_video_cfg_scale',
  VIDEO_IS_GENERATING: 'text_to_video_is_generating',
  VIDEO_REQUEST_ID: 'text_to_video_request_id',
  VIDEO_GENERATED: 'text_to_video_generated',
  VIDEO_ACTIVE_TAB: 'text_to_video_active_tab',
  VIDEO_TRASH_VIEW: 'text_to_video_trash_view'
};

// Local storage keys for persisted data
const LOCAL_STORAGE_KEYS = {
  TRASHED_VIDEOS: 'text_to_video_trashed_items',
  TRASH_VIEW: 'text_to_video_trash_view'
};

// Helper functions for session storage
const getSessionItem = (key, defaultValue) => {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error parsing ${key} from session storage:`, e);
    return defaultValue;
  }
};

const setSessionItem = (key, value) => {
  try {
    if (value !== null && value !== undefined) {
      sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (e) {
    console.warn(`Failed to save ${key} to session storage:`, e);
  }
};

// Helper functions for local storage
const getLocalItem = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error parsing ${key} from local storage:`, e);
    return defaultValue;
  }
};

const setLocalItem = (key, value) => {
  try {
    if (value !== null && value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn(`Failed to save ${key} to local storage:`, e);
  }
};

// Get trashed videos from local storage
const getTrashedVideos = () => getLocalItem(LOCAL_STORAGE_KEYS.TRASHED_VIDEOS, []);

// Get generated video from session storage
const getGeneratedVideo = () => getSessionItem(SESSION_KEYS.VIDEO_GENERATED, null);

// Create the store
const useVideoStore = create((set, get) => ({
  // Video generation settings
  videoPrompt: getSessionItem(SESSION_KEYS.VIDEO_PROMPT, ''),
  duration: getSessionItem(SESSION_KEYS.VIDEO_DURATION, '5'),
  resolution: getSessionItem(SESSION_KEYS.VIDEO_RESOLUTION, '720p'),
  aspectRatio: getSessionItem(SESSION_KEYS.VIDEO_ASPECT_RATIO, '16:9'),
  cfgScale: getSessionItem(SESSION_KEYS.VIDEO_CFG_SCALE, 0.5),
  
  // Generation state
  isGenerating: getSessionItem(SESSION_KEYS.VIDEO_IS_GENERATING, false),
  processingRequestId: getSessionItem(SESSION_KEYS.VIDEO_REQUEST_ID, null),
  generatedVideo: getGeneratedVideo(),
  
  // Progress tracking
  progress: 0,
  videoError: null,
  
  // Tab state
  activeTab: getSessionItem(SESSION_KEYS.VIDEO_ACTIVE_TAB, 'video'),
  previousTab: null,
  
  // Trash state
  isTrashOpen: getLocalItem(LOCAL_STORAGE_KEYS.TRASH_VIEW, false),
  trashedVideos: getTrashedVideos(),

  // Set active tab
  setActiveTab: (tab) => {
    const prevTab = get().activeTab;
    
    // Skip if tab isn't changing
    if (prevTab === tab) return;
    
    set({ activeTab: tab });
    setSessionItem(SESSION_KEYS.VIDEO_ACTIVE_TAB, tab);
  },
  
  // Set video prompt
  setVideoPrompt: (prompt) => {
    set({ videoPrompt: prompt });
    setSessionItem(SESSION_KEYS.VIDEO_PROMPT, prompt);
  },
  
  // Set duration
  setDuration: (duration) => {
    set({ duration });
    setSessionItem(SESSION_KEYS.VIDEO_DURATION, duration);
  },
  
  // Set resolution
  setResolution: (resolution) => {
    set({ resolution });
    setSessionItem(SESSION_KEYS.VIDEO_RESOLUTION, resolution);
  },
  
  // Set aspect ratio
  setAspectRatio: (aspectRatio) => {
    set({ aspectRatio });
    setSessionItem(SESSION_KEYS.VIDEO_ASPECT_RATIO, aspectRatio);
  },
  
  
  // Set cfg scale
  setCfgScale: (cfgScale) => {
    set({ cfgScale });
    setSessionItem(SESSION_KEYS.VIDEO_CFG_SCALE, cfgScale);
  },
  
  // Update generation state
  setGenerationState: (isGenerating, requestId = null, progress = 0) => {
    set({ 
      isGenerating, 
      processingRequestId: isGenerating ? requestId : null,
      progress
    });
    
    setSessionItem(SESSION_KEYS.VIDEO_IS_GENERATING, isGenerating);
    
    if (requestId && isGenerating) {
      setSessionItem(SESSION_KEYS.VIDEO_REQUEST_ID, requestId);
    } else {
      sessionStorage.removeItem(SESSION_KEYS.VIDEO_REQUEST_ID);
    }
  },
  
  // Set generated video
  setGeneratedVideo: (video) => {
    if (video) {
      // Ensure both url and videoUrl properties exist for compatibility with AnimationPlayer
      const enhancedVideo = {
        ...video,
        // Make sure both URL properties exist
        url: video.url || video.videoUrl,
        videoUrl: video.videoUrl || video.url
      };
      
      // Update state with enhanced video object
      set({ generatedVideo: enhancedVideo });
      
      // Store minimal version in session storage
      const videoForStorage = {
        ...enhancedVideo,
        // Don't store large data URLs
        thumbnail: enhancedVideo.thumbnail?.length > 10000 ? null : enhancedVideo.thumbnail
      };
      setSessionItem(SESSION_KEYS.VIDEO_GENERATED, videoForStorage);
    } else {
      // When video is null, we're clearing the video
      console.log('VideoStore: clearing generated video');
      set({ generatedVideo: null });
      sessionStorage.removeItem(SESSION_KEYS.VIDEO_GENERATED);
    }
  },
  
  // Set video error
  setVideoError: (error) => {
    set({ videoError: error });
  },
  
  // Set progress
  setProgress: (progress) => {
    set({ progress });
  },
  
  // Reset form
  resetForm: () => {
    set({ 
      generatedVideo: null,
      videoPrompt: '',
      duration: '5',
      resolution: '720p',
      aspectRatio: '16:9',
      cfgScale: 0.5,
      progress: 0,
      videoError: null,
      isGenerating: false,
      processingRequestId: null
    });
    
    // Clear session storage
    sessionStorage.removeItem(SESSION_KEYS.VIDEO_GENERATED);
    sessionStorage.removeItem(SESSION_KEYS.VIDEO_PROMPT);
    sessionStorage.removeItem(SESSION_KEYS.VIDEO_IS_GENERATING);
    sessionStorage.removeItem(SESSION_KEYS.VIDEO_REQUEST_ID);
    setSessionItem(SESSION_KEYS.VIDEO_DURATION, '5');
    setSessionItem(SESSION_KEYS.VIDEO_RESOLUTION, '720p');
    setSessionItem(SESSION_KEYS.VIDEO_ASPECT_RATIO, '16:9');
    setSessionItem(SESSION_KEYS.VIDEO_CFG_SCALE, 0.5);
  },
  
  // Toggle trash view
  toggleTrashView: () => {
    const newTrashState = !get().isTrashOpen;
    set({ isTrashOpen: newTrashState });
    setLocalItem(LOCAL_STORAGE_KEYS.TRASH_VIEW, newTrashState);
  },
  
  // Move video to trash
  trashVideo: (video) => {
    // Add to trashed videos
    const currentTrashedVideos = [...get().trashedVideos];
    
    // Add trash metadata
    const videoWithTrashInfo = {
      ...JSON.parse(JSON.stringify(video)),
      trashedAt: new Date().toISOString(),
    };
    
    // Check if video already exists in trash
    const existingIndex = currentTrashedVideos.findIndex(v => v.id === video.id);
    if (existingIndex !== -1) {
      currentTrashedVideos[existingIndex] = videoWithTrashInfo;
    } else {
      currentTrashedVideos.push(videoWithTrashInfo);
    }
    
    set({ trashedVideos: currentTrashedVideos });
    setLocalItem(LOCAL_STORAGE_KEYS.TRASHED_VIDEOS, currentTrashedVideos);
    
    return currentTrashedVideos;
  },
  
  // Restore video from trash
  restoreFromTrash: (videoId) => {
    const currentTrashedVideos = [...get().trashedVideos];
    const updatedTrashedVideos = currentTrashedVideos.filter(v => v.id !== videoId);
    
    // If this was the last item, toggle back to history view
    if (updatedTrashedVideos.length === 0 && get().isTrashOpen) {
      set({ 
        trashedVideos: updatedTrashedVideos,
        isTrashOpen: false
      });
      setLocalItem(LOCAL_STORAGE_KEYS.TRASHED_VIDEOS, updatedTrashedVideos);
      setLocalItem(LOCAL_STORAGE_KEYS.TRASH_VIEW, false);
    } else {
      set({ trashedVideos: updatedTrashedVideos });
      setLocalItem(LOCAL_STORAGE_KEYS.TRASHED_VIDEOS, updatedTrashedVideos);
    }
    
    return updatedTrashedVideos;
  },
  
  // Empty the trash
  emptyTrash: () => {
    set({ trashedVideos: [] });
    setLocalItem(LOCAL_STORAGE_KEYS.TRASHED_VIDEOS, []);
    
    // Update isTrashOpen if trash is now empty
    const currentState = get();
    if (currentState.isTrashOpen && currentState.trashedVideos.length === 0) {
      set({ isTrashOpen: false });
      setLocalItem(LOCAL_STORAGE_KEYS.TRASH_VIEW, false);
    }
  }
}));

// Make the store available globally for emergency recovery
window.useVideoStore = useVideoStore;

export default useVideoStore;