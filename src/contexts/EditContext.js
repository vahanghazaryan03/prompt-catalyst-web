// src/contexts/EditContext.js
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const EditContext = createContext();

const MAX_EDIT_HISTORY_ITEMS = 75; // More generous limit with smart storage
const EDIT_HISTORY_STORAGE_KEY = 'edit_history';
const EDIT_SETTINGS_STORAGE_KEY = 'edit_settings';
const EDIT_STATE_STORAGE_KEY = 'edit_current_state';

// Use sessionStorage for current state (like Animate tab) and localStorage for persistent settings
const EDIT_SESSION_STATE_KEY = 'edit_session_state';

// Size limit for images in sessionStorage (more generous than localStorage)
const MAX_IMAGE_SIZE_FOR_SESSION = 5 * 1024 * 1024; // 5MB base64 limit

// Default settings for edit operations
const DEFAULT_EDIT_SETTINGS = {
  selectedModel: 'flux-kontext-pro',
  variationsCount: 1
};

// Debug utility to check edit history status
const debugEditHistory = () => {
  try {
    const stored = localStorage.getItem(EDIT_HISTORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const storageUsed = new Blob([stored]).size;
      const storageUsedKB = Math.round(storageUsed / 1024 * 100) / 100;
      
      console.log('Edit History Debug:', {
        totalItems: parsed.length,
        maxItems: MAX_EDIT_HISTORY_ITEMS,
        storageUsedKB: storageUsedKB,
        recentItems: parsed.slice(0, 3).map(item => ({
          id: item.id,
          timestamp: item.timestamp,
          instructions: item.instructions?.substring(0, 30) + '...',
          model: item.model,
          imageCount: item.editedImages?.length
        }))
      });
    } else {
      console.log('No edit history found in localStorage');
    }
  } catch (error) {
    console.error('Error debugging edit history:', error);
  }
};

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  window.debugEditHistory = debugEditHistory;
}

// Utility function to create small thumbnail data from full image dataUrl
const createThumbnailData = async (dataUrl, maxSize = 64, quality = 0.3) => {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions maintaining aspect ratio
        const { width, height } = img;
        let thumbnailWidth = maxSize;
        let thumbnailHeight = maxSize;
        
        if (width > height) {
          thumbnailHeight = (height / width) * maxSize;
        } else {
          thumbnailWidth = (width / height) * maxSize;
        }
        
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;
        
        // Draw scaled image with good quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
        
        // Get compressed thumbnail dataUrl
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(thumbnailDataUrl);
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  } catch (error) {
    console.warn('Failed to create thumbnail:', error);
    return null;
  }
};

// Synchronous version for immediate use
const createThumbnailSync = (dataUrl) => {
  try {
    // Return a promise that resolves quickly for async handling
    return createThumbnailData(dataUrl, 64, 0.3);
  } catch (error) {
    return Promise.resolve(null);
  }
};

export const EditProvider = ({ children }) => {
  // Edit history state
  const [editHistory, setEditHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem(EDIT_HISTORY_STORAGE_KEY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        
        // Clean up old format entries that might have large image data
        const cleanedHistory = parsed
          .filter(item => item && item.instructions) // Remove invalid entries
          .slice(0, 50) // Keep most recent items within reasonable limit
          .map(item => {
            // Ensure old entries have consistent structure but don't remove working image URLs
            if (item.originalImage) {
              return {
                ...item,
                originalImage: {
                  ...item.originalImage,
                  // Only remove blob URLs and very large dataUrls to save space
                  url: item.originalImage.url?.startsWith('blob:') ? null : item.originalImage.url,
                  dataUrl: (item.originalImage.dataUrl && item.originalImage.dataUrl.length > 50000) ? null : item.originalImage.dataUrl
                },
                editedImages: (item.editedImages || []).map((img, index) => ({
                  // Keep all non-blob URLs - these should be persistent API URLs
                  url: img.url?.startsWith('blob:') ? null : img.url,
                  width: img.width || 1024,
                  height: img.height || 1024,
                  index: img.index || index + 1
                }))
              };
            }
            return item;
          });
        
        // Save cleaned history back to localStorage
        try {
          localStorage.setItem(EDIT_HISTORY_STORAGE_KEY, JSON.stringify(cleanedHistory));
        } catch (cleanupError) {
          console.warn('Could not save cleaned history:', cleanupError);
        }
        
        return cleanedHistory;
      }
      return [];
    } catch (error) {
      console.error('Failed to load edit history:', error);
      // If history is corrupted, clear it
      try {
        localStorage.removeItem(EDIT_HISTORY_STORAGE_KEY);
      } catch (clearError) {
        console.error('Could not clear corrupted history:', clearError);
      }
      return [];
    }
  });

  // Current edit settings state
  const [editSettings, setEditSettings] = useState(() => {
    try {
      const storedSettings = localStorage.getItem(EDIT_SETTINGS_STORAGE_KEY);
      return storedSettings ? JSON.parse(storedSettings) : DEFAULT_EDIT_SETTINGS;
    } catch (error) {
      console.error('Failed to load edit settings:', error);
      return DEFAULT_EDIT_SETTINGS;
    }
  });

  // Current edit state (prompt, images, etc.)
  const [currentEditState, setCurrentEditState] = useState(() => {
    try {
      // Try sessionStorage first (for current session with larger limits)
      let storedState = sessionStorage.getItem(EDIT_SESSION_STATE_KEY);
      if (storedState) {
        return JSON.parse(storedState);
      }
      
      // Fall back to localStorage (for older data)
      storedState = localStorage.getItem(EDIT_STATE_STORAGE_KEY);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        // Migrate to sessionStorage if we have data
        try {
          sessionStorage.setItem(EDIT_SESSION_STATE_KEY, JSON.stringify(parsedState));
        } catch (e) {
          console.warn('Could not migrate edit state to sessionStorage:', e);
        }
        return parsedState;
      }
      
      return {
        editPrompt: '',
        generatedImages: [],
        uploadedImageData: null,
        imageAnalysis: null,
        isGenerating: false,
        editError: null
      };
    } catch (error) {
      console.error('Failed to load edit state:', error);
      return {
        editPrompt: '',
        generatedImages: [],
        uploadedImageData: null,
        imageAnalysis: null,
        isGenerating: false,
        editError: null
      };
    }
  });

  const addToEditHistory = useCallback(async (editData) => {
    const {
      originalImage,
      editedImages,
      instructions,
      model,
      variationsCount,
      originalImageName
    } = editData;

    // Generate a more unique ID to prevent collisions
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create thumbnail for original image (async)
    let thumbnail = null;
    if (originalImage.dataUrl) {
      try {
        thumbnail = await createThumbnailData(originalImage.dataUrl, 64, 0.4);
      } catch (error) {
        console.warn('Failed to create thumbnail for history:', error);
      }
    }

    const historyItem = {
      id: uniqueId,
      timestamp: new Date().toISOString(),
      originalImage: {
        // Store thumbnail for visual reference
        url: null, // Don't store blob URLs as they expire
        name: originalImageName || originalImage.name || 'Uploaded Image',
        size: originalImage.size || 0,
        type: originalImage.type || 'image/png',
        thumbnail: thumbnail // Small compressed thumbnail
      },
      editedImages: editedImages
        .filter(img => img && (img.url || typeof img === 'string')) // Filter out invalid images
        .map((img, index) => {
          const imageUrl = typeof img === 'string' ? img : img.url;
          return {
            // Store all API URLs - these are hosted and should persist
            url: imageUrl,
            width: (typeof img === 'object' && img.width) || 1024,
            height: (typeof img === 'object' && img.height) || 1024,
            index: index + 1
          };
        }),
      instructions,
      model,
      variationsCount,
      settings: {
        model,
        variationsCount
      }
    };

    setEditHistory(prev => {
      // Much more specific duplicate detection:
      // Only prevent duplicates if it's the exact same image + instructions + model within 30 seconds
      const thirtySecondsAgo = Date.now() - 30 * 1000;
      const isDuplicate = prev.some(item => {
        const isSameImage = (
          // Compare by name AND size (most reliable for our structure)
          (originalImage.name === item.originalImage.name && 
           originalImage.size && item.originalImage.size &&
           originalImage.size === item.originalImage.size)
        );
        
        return isSameImage &&
               item.instructions === instructions && 
               item.model === model &&
               item.variationsCount === variationsCount &&
               new Date(item.timestamp).getTime() > thirtySecondsAgo;
      });
      
      if (isDuplicate) {
        return prev;
      }
      
      const updated = [historyItem, ...prev].slice(0, MAX_EDIT_HISTORY_ITEMS);
      
      try {
        const historyJson = JSON.stringify(updated);
        localStorage.setItem(EDIT_HISTORY_STORAGE_KEY, historyJson);
      } catch (error) {
        console.error('Failed to save edit history:', {
          error: error.message,
          historyLength: updated.length,
          editId: uniqueId,
          instructions: instructions.substring(0, 30)
        });
        
        // If localStorage is full, try removing oldest entries and retry
        if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
          try {
            // Keep recent entries but remove large data
            const reducedHistory = updated.slice(0, 20).map(item => ({
              ...item,
              originalImage: {
                ...item.originalImage,
                // Remove only very large data, keep small thumbnails and API URLs
                dataUrl: (item.originalImage?.dataUrl?.length > 20000) ? null : item.originalImage?.dataUrl
              },
              editedImages: item.editedImages.map(img => ({
                ...img,
                // Keep all non-blob URLs
                url: img.url?.startsWith('blob:') ? null : img.url
              }))
            }));
            localStorage.setItem(EDIT_HISTORY_STORAGE_KEY, JSON.stringify(reducedHistory));
            return reducedHistory;
          } catch (retryError) {
            console.error('Failed to save even reduced history:', retryError);
          }
        }
      }
      
      return updated;
    });
  }, []);

  const removeFromEditHistory = useCallback((id) => {
    setEditHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      
      try {
        localStorage.setItem(EDIT_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to update edit history:', error);
      }
      
      return updated;
    });
  }, []);

  const clearEditHistory = useCallback(() => {
    setEditHistory([]);
    try {
      localStorage.removeItem(EDIT_HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear edit history:', error);
    }
  }, []);

  // Update edit settings and persist to localStorage
  const updateEditSettings = useCallback((newSettings) => {
    setEditSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(EDIT_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save edit settings:', error);
      }
      return updated;
    });
  }, []);

  // Update current edit state and persist to storage
  const updateEditState = useCallback((newState) => {
    setCurrentEditState(prev => {
      const updated = { ...prev, ...newState };
      
      try {
        // Use sessionStorage for current state (like Animate tab) with larger image support
        const stateToStore = {
          ...updated,
          // Remove non-serializable data
          uploadedImageFile: undefined,
          // For uploaded image data, be much more generous with size limits in sessionStorage
          uploadedImageData: updated.uploadedImageData ? {
            ...updated.uploadedImageData,
            url: undefined, // Never store blob URLs - they become invalid
            // Keep dataUrl for images up to 5MB (much more practical)
            dataUrl: updated.uploadedImageData.dataUrl?.length > MAX_IMAGE_SIZE_FOR_SESSION 
              ? null 
              : updated.uploadedImageData.dataUrl
          } : null,
          // Store image analysis results for dimension matching
          imageAnalysis: updated.imageAnalysis || null,
          generatedImages: updated.generatedImages?.map(img => ({
            url: img.url?.startsWith('blob:') ? null : img.url, // Don't store blob URLs
            width: img.width,
            height: img.height
          })) || []
        };
        
        // Primary storage: sessionStorage (survives tab switches, cleared on browser close)
        sessionStorage.setItem(EDIT_SESSION_STATE_KEY, JSON.stringify(stateToStore));
        
        // Backup storage: localStorage (survives browser restarts, but with size limits)
        try {
          const backupState = {
            ...stateToStore,
            // For localStorage backup, don't store large images
            uploadedImageData: updated.uploadedImageData ? {
              ...updated.uploadedImageData,
              url: undefined, // Never store blob URLs
              dataUrl: updated.uploadedImageData.dataUrl?.length > 50000 ? null : updated.uploadedImageData.dataUrl
            } : null,
            // Keep imageAnalysis in backup storage (it's small)
            imageAnalysis: updated.imageAnalysis || null
          };
          localStorage.setItem(EDIT_STATE_STORAGE_KEY, JSON.stringify(backupState));
        } catch (backupError) {
          // If localStorage fails, that's ok - we have sessionStorage
          console.warn('Could not backup to localStorage:', backupError);
        }
        
      } catch (error) {
        console.error('Failed to save edit state:', error);
        // Try fallback to localStorage only
        try {
          const fallbackState = {
            ...updated,
            uploadedImageFile: undefined,
            uploadedImageData: updated.uploadedImageData ? {
              ...updated.uploadedImageData,
              url: undefined, // Never store blob URLs
              dataUrl: null // No image data in fallback
            } : null,
            // Keep imageAnalysis even in fallback (it's small and important)
            imageAnalysis: updated.imageAnalysis || null,
            generatedImages: updated.generatedImages?.map(img => ({
              url: img.url?.startsWith('blob:') ? null : img.url,
              width: img.width,
              height: img.height
            })) || []
          };
          localStorage.setItem(EDIT_STATE_STORAGE_KEY, JSON.stringify(fallbackState));
        } catch (fallbackError) {
          console.error('Failed to save even fallback edit state:', fallbackError);
        }
      }
      
      return updated;
    });
  }, []);

  // Clear current edit state (useful for reset)
  const clearEditState = useCallback(() => {
    const defaultState = {
      editPrompt: '',
      generatedImages: [],
      uploadedImageData: null,
      uploadedImageFile: null,
      imageAnalysis: null,
      isGenerating: false,
      editError: null
    };
    setCurrentEditState(defaultState);
    try {
      // Clear both session and localStorage
      sessionStorage.setItem(EDIT_SESSION_STATE_KEY, JSON.stringify(defaultState));
      localStorage.setItem(EDIT_STATE_STORAGE_KEY, JSON.stringify(defaultState));
    } catch (error) {
      console.error('Failed to clear edit state:', error);
    }
  }, []);

  // Reset all edit settings to defaults
  const resetEditSettings = useCallback(() => {
    setEditSettings(DEFAULT_EDIT_SETTINGS);
    try {
      localStorage.setItem(EDIT_SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_EDIT_SETTINGS));
    } catch (error) {
      console.error('Failed to reset edit settings:', error);
    }
  }, []);

  const value = useMemo(() => ({
    // History management
    editHistory,
    addToEditHistory,
    removeFromEditHistory,
    clearEditHistory,
    
    // Settings management
    editSettings,
    updateEditSettings,
    resetEditSettings,
    
    // Current state management
    currentEditState,
    updateEditState,
    clearEditState
  }), [
    editHistory,
    addToEditHistory,
    removeFromEditHistory,
    clearEditHistory,
    editSettings,
    updateEditSettings,
    resetEditSettings,
    currentEditState,
    updateEditState,
    clearEditState
  ]);

  return (
    <EditContext.Provider value={value}>
      {children}
    </EditContext.Provider>
  );
};

export const useEditHistory = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditHistory must be used within an EditProvider');
  }
  return context;
};

// Note: For full edit functionality including current state management,
// use the useEditSettings hook from '../hooks/useEditSettings'
// This hook (useEditHistory) is primarily for history management only
