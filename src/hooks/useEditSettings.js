import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useEditHistory } from '../contexts/EditContext';
import { logger } from '../utils/logger';

export const useEditSettings = () => {
  // Ref to track active blob URLs for cleanup
  const activeBlobUrlRef = useRef(null);
  
  const {
    // Settings management
    editSettings,
    updateEditSettings,
    resetEditSettings,
    
    // Current state management
    currentEditState,
    updateEditState,
    clearEditState,
    
    // History management
    addToEditHistory
  } = useEditHistory();

  // Convenience getters for current state
  const {
    editPrompt,
    generatedImages,
    uploadedImageData,
    uploadedImageFile,
    imageAnalysis,
    isGenerating,
    editError
  } = currentEditState;

  const {
    selectedModel,
    variationsCount
  } = editSettings;

  // Update edit prompt
  const setEditPrompt = useCallback((prompt) => {
    updateEditState({ editPrompt: prompt });
  }, [updateEditState]);

  // Update uploaded image (handles both file and metadata)
  const setUploadedImage = useCallback((imageData, analysisData = null) => {
    // Clean up previous blob URL before setting new one
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    
    if (imageData) {
      // Track the blob URL for cleanup if it exists
      if (imageData.url && imageData.url.startsWith('blob:')) {
        activeBlobUrlRef.current = imageData.url;
      }
      
      // Store both the file object and serializable metadata
      // IMPORTANT: Clear previous edit results when uploading a new image
      updateEditState({
        uploadedImageFile: imageData.file || imageData, // Store the actual file object
        uploadedImageData: {
          name: imageData.name || 'uploaded-image',
          type: imageData.type || 'image/jpeg',
          size: imageData.size || 0,
          lastModified: imageData.lastModified || Date.now(),
          url: imageData.url, // blob URL (not persisted)
          dataUrl: imageData.dataUrl, // base64 data (can be persisted if needed)
          _analysis: imageData._analysis // Include analysis if attached to image
        },
        imageAnalysis: analysisData || imageData._analysis || null, // Store analysis results
        generatedImages: [], // Clear previous edit results
        editError: null // Clear any previous errors
      });
    } else {
      // Clear the image
      updateEditState({
        uploadedImageFile: null,
        uploadedImageData: null,
        imageAnalysis: null // Also clear analysis when clearing image
      });
    }
  }, [updateEditState]);

  // Update generated images
  const setGeneratedImages = useCallback((images) => {
    updateEditState({ generatedImages: images || [] });
  }, [updateEditState]);

  // Set generating state
  const setIsGenerating = useCallback((generating) => {
    updateEditState({ isGenerating: generating });
  }, [updateEditState]);

  // Set edit error
  const setEditError = useCallback((error) => {
    updateEditState({ editError: error });
  }, [updateEditState]);

  // Set image analysis
  const setImageAnalysis = useCallback((analysis) => {
    updateEditState({ imageAnalysis: analysis });
  }, [updateEditState]);

  // Update model selection
  const setSelectedModel = useCallback((model) => {
    updateEditSettings({ selectedModel: model });
  }, [updateEditSettings]);

  // Update variations count
  const setVariationsCount = useCallback((count) => {
    updateEditSettings({ variationsCount: count });
  }, [updateEditSettings]);

  // Clear generated images only
  const clearGeneratedImages = useCallback(() => {
    updateEditState({ generatedImages: [], editError: null });
  }, [updateEditState]);

  // Clear uploaded image only
  const clearUploadedImage = useCallback(() => {
    // Clean up blob URL if it exists using the ref (more reliable)
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    
    // Also clean up if URL exists in the data (backup)
    if (uploadedImageData?.url && uploadedImageData.url.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImageData.url);
    }
    
    updateEditState({
      uploadedImageFile: null,
      uploadedImageData: null,
      imageAnalysis: null // Also clear analysis
    });
  }, [updateEditState, uploadedImageData]);

  // Clear edit prompt only
  const clearEditPrompt = useCallback(() => {
    updateEditState({ editPrompt: '' });
  }, [updateEditState]);

  // Reset all edit state (but keep settings)
  const resetEditState = useCallback(() => {
    // Clean up any blob URLs using the ref
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    
    clearEditState();
  }, [clearEditState]);

  // Complete edit operation and add to history
  const completeEdit = useCallback(async (editData) => {
    const {
      originalImage,
      editedImages,
      instructions,
      model,
      variationsCount: editVariationsCount,
      originalImageName
    } = editData;

    // Add to edit history (now async)
    await addToEditHistory({
      originalImage,
      editedImages,
      instructions,
      model,
      variationsCount: editVariationsCount,
      originalImageName
    });

    // Update current state with the results
    updateEditState({
      generatedImages: editedImages,
      isGenerating: false,
      editError: null
    });
  }, [addToEditHistory, updateEditState]);

  // Get the complete uploaded image object (combines file and metadata)
  const uploadedImage = useMemo(() => {
    if (!uploadedImageData) return null;
    
    let imageUrl = uploadedImageData.url;
    let fileObject = uploadedImageFile;
    
    // Always recreate blob URL from dataUrl if we have dataUrl
    // This ensures fresh blob URLs after tab switches
    if (uploadedImageData.dataUrl) {
      try {
        // Convert dataUrl back to blob and create blob URL
        const byteCharacters = atob(uploadedImageData.dataUrl.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: uploadedImageData.type });
        imageUrl = URL.createObjectURL(blob);
        
        // Track the new blob URL for cleanup
        activeBlobUrlRef.current = imageUrl;
        
        // Also recreate the file object for API compatibility
        fileObject = new File([blob], uploadedImageData.name, {
          type: uploadedImageData.type,
          lastModified: uploadedImageData.lastModified
        });
        
      } catch (error) {
        logger.error('Failed to recreate blob URL from dataUrl:', error);
      }
    }
    
    const result = {
      file: fileObject,
      url: imageUrl,
      name: uploadedImageData.name,
      type: uploadedImageData.type,
      size: uploadedImageData.size,
      lastModified: uploadedImageData.lastModified,
      dataUrl: uploadedImageData.dataUrl
    };
    
    return result;
  }, [uploadedImageFile, uploadedImageData]);

  // Check if we have the minimum required data for editing
  const canEdit = useMemo(() => {
    // For editing, we need:
    // 1. An uploaded image (either with file object OR restored from dataUrl)
    // 2. A prompt with text
    // 3. The image should have a usable URL (blob URL or recreated from dataUrl)
    return !!(uploadedImage?.url && editPrompt.trim());
  }, [uploadedImage?.url, editPrompt]);

  // Only clean up blob URLs when component is truly destroyed (page unload)
  // Don't clean up on tab switches to preserve images
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Don't clean up here - let the browser handle it or clean up only when setting new images
    };
  }, []);

  // Return the hook interface
  return useMemo(() => ({
    // Settings
    selectedModel,
    variationsCount,
    setSelectedModel,
    setVariationsCount,
    updateEditSettings,
    resetEditSettings,
    
    // Current state
    editPrompt,
    uploadedImage,
    uploadedImageFile,
    uploadedImageData,
    imageAnalysis,
    generatedImages,
    isGenerating,
    editError,
    
    // State setters
    setEditPrompt,
    setUploadedImage,
    setGeneratedImages,
    setIsGenerating,
    setEditError,
    setImageAnalysis,
    
    // Clear functions
    clearGeneratedImages,
    clearUploadedImage,
    clearEditPrompt,
    resetEditState,
    
    // Complete edit operation
    completeEdit,
    
    // Computed properties
    canEdit
  }), [
    selectedModel,
    variationsCount,
    setSelectedModel,
    setVariationsCount,
    updateEditSettings,
    resetEditSettings,
    editPrompt,
    uploadedImage,
    uploadedImageFile,
    uploadedImageData,
    imageAnalysis,
    generatedImages,
    isGenerating,
    editError,
    setEditPrompt,
    setUploadedImage,
    setGeneratedImages,
    setIsGenerating,
    setEditError,
    setImageAnalysis,
    clearGeneratedImages,
    clearUploadedImage,
    clearEditPrompt,
    resetEditState,
    completeEdit,
    canEdit
  ]);
};
