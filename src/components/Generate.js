import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import './AspectRatioScroller.css';
import AspectRatioScroller from './AspectRatioScroller';
import { 
  getPixelDimensionsFromRatio, 
  getRatioFromPixelDimensions, 
  formatDimensions,
  getRatioDimensions,
  isValidRatioForModel,
  getDefaultRatioForModel,
  isSpecialModelOnlyRatio
} from '../utils/aspectRatioUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImagePlus, 
  Loader2, 
  Wand2, 
  Camera, 
  Sparkles, 
  XCircle, 
  ChevronUp, 
  ChevronDown, 
  BadgePlus,
  CircleGauge,
  Zap, 
  Palette,
  ArrowLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';
import OpenAISVGIcon from './icons/OpenAISVGIcon';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import GenerateEmptyState from './GenerateEmptyState';
import LightboxModal from './LightboxModal';
import { useGenerateSettings } from '../hooks/useGenerateSettings';
import GenerateButton from './GenerateButton';
import GenerateHistoryContainer from './GenerateHistoryContainer';
import MessageActions from './MessageActions';
import { useCredit } from '../contexts/CreditContext';
import ImageCard from './ImageCard';
import useAnimationStore from '../contexts/AnimationStore';
import { useEditSettings } from '../hooks/useEditSettings';
import ContentContainer from './layout/ContentContainer';
import ModelOption from './ModelOption';
import { analyzeImageForEditing, formatDimensions as formatEditDimensions } from '../utils/editImageUtils';
import { logger } from '../utils/logger';

// Constants stay the same
const MODELS = [
  {
      value: 'flux-pro-1.1-ultra',
      label: 'Flux Pro 1.1 Ultra',
      icon: Sparkles,
      description: 'Highest quality for professional results',
      proOnly: true,
      creditCost: 80
  },
  {
      value: 'flux-pro-1.1',
      label: 'Flux Pro 1.1',
      icon: Camera,
      description: 'Enhanced quality and consistency',
      proOnly: true,
      creditCost: 60
  },
   {
      value: 'seedream-4.0',
      label: 'Seedream 4.0',
      icon: Camera,
      description: 'Industry-leading realism and high-quality image generation',
      creditCost: 80
   
  },
  {
      value: 'hidream-full',
      label: 'HiDream Full',
      icon: Palette,
      description: 'High-quality detailed image generation',
      creditCost: 25
     
  },
  
 
  
  //{
     // value: 'hidream-fast',
      //label: 'HiDream Fast',
      //icon: Zap,
      //description: 'Quick generation with solid quality',
      //creditCost: 15,
     // isNew: true
  //},
  { 
      value: 'juggernaut-flux-pro',
      label: 'Juggernaut Flux Pro',
      icon: BadgePlus, 
      description: 'Upgraded Flux model with sharper details and better realism',
      creditCost: 15,
    
  },
  
  { 
      value: 'flux',
      label: 'Flux Dev',
      icon: Wand2, 
      description: 'Best for artistic and creative images',
      creditCost: 10
  },
  
  {
      value: 'gpt-image-1',
      label: 'GPT Image 1',
      icon: OpenAISVGIcon,
      description: 'OpenAI-powered image generation model',
      proOnly: true, // Changed to true to move to Advanced Models section
      requiresPro: true, // Property to require Pro access
      creditCost: 80
      
  },
 
  { 
    value: 'juggernaut-flux-lightning',
    label: 'Juggernaut Lightning',
    icon: Zap,
    description: 'Improved fast model with fewer artifacts',
    creditCost: 5,
   
},
  { 
      value: 'flux-schnell', 
      label: 'Flux Schnell',
      icon: CircleGauge,
      description: 'Faster generation with good quality',
      creditCost: 5
  }
];

// We no longer need these legacy size constants since we're using AspectRatioScroller
// Instead we'll dynamically generate sizes based on the selected aspect ratio
// This function is kept for backwards compatibility with other parts of the app
const getAvailableSizes = (isPremium) => {
  return [
    { value: '1024x1024', label: '1:1', description: 'Square - Perfect for social media', premium: false },
    { value: '1024x576', label: '16:9', description: 'Landscape - Ideal for desktop wallpapers', premium: false },
    { value: '576x1024', label: '9:16', description: 'Portrait - Great for mobile wallpapers', premium: false }
  ].filter(size => !size.premium || isPremium);
};

const Generate = ({ 
  generatePrompt = '',
  onViewChange,
  handleSubmit,
  setMessages,
  onEdit,
  onPremiumClick,
  onTopUpClick
}) => {
  const { credits, creditType, refreshCredits } = useCredit();
  const { user } = useAuth();
  const { addToast } = useToast();
  // Use localStorage to persist the expanded state of advanced models
  const [isMoreModelsExpanded, setIsMoreModelsExpanded] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('advanced_models_expanded')) || false;
    } catch (e) {
      return false;
    }
  });
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isImagePanelFullscreen, setIsImagePanelFullscreen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  
  // State for mobile detection
  const isMobile = window.innerWidth < 768;
  
  // Get the setUploadedImage function from AnimationStore to set the image for animation
  const setUploadedImage = useAnimationStore(state => state.setUploadedImage);
  
  // Get the setUploadedImage function from EditSettings to set the image for editing
  const { setUploadedImage: setEditUploadedImage } = useEditSettings();
  
  const {
    settings,
    updateSettings,
    generatedImages,
    setGeneratedImages,
    isGenerating,
    setIsGenerating,
    startGeneration,
    generationError,
    setGenerationError,
    resetPrompt,
    clearPromptInput,
    activePrompt,
    lastGeneratedPrompt
  } = useGenerateSettings(generatePrompt);
  
  // Make sure we set the active tab when component mounts
  useEffect(() => {
    useAnimationStore.getState().setActiveTab('generate');
    
    // Set up event listener for tooltip close events
    const handleCloseTooltip = () => {
      // This is now handled by the ModelExamplesButton component
      document.dispatchEvent(new CustomEvent('closeModelTooltip'));
    };
    
    document.addEventListener('closeModelTooltip', handleCloseTooltip);
    
    // Set up a global navigation method for the edit tab
    if (typeof window !== 'undefined') {
      window.onViewChange = onViewChange;
    }
    
    // Clean up when component unmounts
    return () => {
      if (useAnimationStore.getState().activeTab === 'generate') {
        useAnimationStore.getState().setActiveTab('none');
      }
      document.removeEventListener('closeModelTooltip', handleCloseTooltip);
      
      // Clean up global method
      if (typeof window !== 'undefined') {
        window.onViewChange = undefined;
      }
    };
  }, [onViewChange]);

  // Update aspect ratio when component mounts to ensure consistency
  useEffect(() => {
    const correctRatio = getRatioFromPixelDimensions(size, model);
    if (correctRatio !== selectedAspectRatio) {
      setSelectedAspectRatio(correctRatio);
    }
  }, []); // Only run on mount

  // Destructure settings (excluding prompt since we use activePrompt now)
  const { imageCount, model, size } = settings;
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(() => {
    // Initialize based on existing size setting
    return getRatioFromPixelDimensions(size, model);
  });

  // Get ratio object based on selected ID
  const selectedRatioObj = getRatioDimensions(selectedAspectRatio);

  const handleAspectRatioChange = useCallback((ratioId) => {
    setSelectedAspectRatio(ratioId);
    
    // Calculate pixel dimensions based on the selected ratio
    const dimensions = getPixelDimensionsFromRatio(ratioId);
    
    // Update the size setting (format: "widthxheight")
    updateSettings({ size: formatDimensions(dimensions) });
  }, [updateSettings]);

  // Handle special models aspect ratio compatibility
  useEffect(() => {
    // If the current ratio is not valid for the selected model, use the default ratio for that model
    if (!isValidRatioForModel(selectedAspectRatio, model)) {
      // Removed logging
      handleAspectRatioChange(getDefaultRatioForModel(model));
    }
    
    // Also check if this is a special model-only ratio but we're on a standard model
    const specialModels = ['flux-pro-1.1-ultra', 'gpt-image-1', 'seedream-4.0'];
    const isCurrentModelSpecial = specialModels.includes(model);
    
    if (!isCurrentModelSpecial && isSpecialModelOnlyRatio(selectedAspectRatio)) {
      // Removed logging
      handleAspectRatioChange(getDefaultRatioForModel(model));
    }
  }, [model, selectedAspectRatio, handleAspectRatioChange]);

  // Sync aspect ratio with size setting when model changes
  useEffect(() => {
    const currentRatioFromSize = getRatioFromPixelDimensions(size, model);
    if (currentRatioFromSize !== selectedAspectRatio && isValidRatioForModel(currentRatioFromSize, model)) {
      setSelectedAspectRatio(currentRatioFromSize);
    }
  }, [model, size, selectedAspectRatio]);

  // Memoize these functions to prevent unnecessary re-renders
  const getImageDimensions = useCallback((sizeString) => {
    const [width, height] = sizeString.split('x').map(Number);
    // Make sure we have valid numbers
    if (isNaN(width) || isNaN(height)) {
      return { width: 1024, height: 1024 }; // Default to square if parsing fails
    }
    return { width, height };
  }, []);

  const calculateCreditCost = useCallback((selectedModel, count) => {
    const model = MODELS.find(m => m.value === selectedModel);
    return model ? model.creditCost * count : 0;
  }, []);

  // Check if the selected model requires Pro membership
  const isProModelSelected = useMemo(() => {
    const selectedModel = MODELS.find(m => m.value === model);
    return selectedModel && 
      ((selectedModel.proOnly || selectedModel.requiresPro) && 
       !user?.isProMember && 
       !user?.isUltimateMember);
  }, [model, user?.isProMember, user?.isUltimateMember]);

  const hasEnoughCredits = useMemo(() => {
    // For premium users, still check credits for pro models
    const requiredCredits = calculateCreditCost(model, imageCount);
    
    // If credits is null, assume we don't have enough (still loading)
    if (credits === null) return false;
    
    return credits >= requiredCredits;
  }, [credits, model, imageCount, calculateCreditCost]);

  const handleOperations = useCallback((operation, details = {}) => {
    const userMessage = {
      type: 'user',
      content: `/${operation} ${activePrompt}`,
      isCommand: true,
      commandType: operation,
      timestamp: new Date().toISOString()
    };
  
    setMessages(prevMessages => [...prevMessages, userMessage]);
    resetPrompt();
    setTimeout(() => {
      onViewChange('chat');
      
      switch (operation) {
        case 'variations':
          handleSubmit(activePrompt, {
            isVariation: true,
            originalPrompt: activePrompt,
            skipUserMessage: true
          });
          break;
        case 'extend':
          handleSubmit(activePrompt, {
            isExtended: true,
            originalPrompt: activePrompt,
            skipUserMessage: true,
            settings: details
          });
          break;
        case 'shorten':
          handleSubmit(activePrompt, {
            isShortened: true,
            originalPrompt: activePrompt,
            skipUserMessage: true
          });
          break;
        default:
          break;
      }
    }, 0);
  }, [activePrompt, handleSubmit, onViewChange, resetPrompt, setMessages]);

  const handleError = useCallback((err) => {
    logger.error('Image generation error:', err);
    
    // Always stop generating state when handling errors
    setIsGenerating(false);
    
    // Check for specific dimension error from Runware API
    const errorData = err.response?.data?.error;
    if (errorData && (errorData.code === 'invalidHeight' || errorData.code === 'invalidWidth')) {
      setGenerationError(`API Dimension Error: ${errorData.message}`);
      addToast(`Image dimension error: ${errorData.message}. Please try a different aspect ratio.`, 'error');
      return;
    }
    
    if (err.response?.status === 500) {
      setGenerationError('500 Server Error');
      addToast('Our servers are taking a quick break. Please try again in a moment.', 'error');
    } else if (err.response?.status === 403) {
      setGenerationError('This feature requires a premium subscription');
      addToast('This feature requires a premium subscription', 'error');
    } else if (err.response?.status === 429) {
      setGenerationError('Rate limit reached');
      addToast('Not enough credits', 'error');
      refreshCredits();
    } else {
      setGenerationError(err.response?.data?.error || 'Failed to generate images');
      addToast('Failed to generate images. Please try again.', 'error');
    }
  }, [addToast, refreshCredits, setGenerationError, setIsGenerating]);

  const handleGenerate = useCallback(async () => {
    // Check if Pro model is selected but user is not Pro
    // This should be done first, before checking for empty prompt
    if (isProModelSelected) {
      // Redirect to premium page if Pro is required
      if (onPremiumClick) {
        onPremiumClick('pro');
      }
      return;
    }
    
    if (!activePrompt.trim()) {
      addToast('Please enter a prompt first', 'error');
      return;
    }
  
    // Reset any previous error state
    setGenerationError(null);
  
    // Check if premium model is selected but user is not premium
    const selectedModel = MODELS.find(m => m.value === model);
    if (selectedModel?.premium && !user?.isPremium) {
      setGenerationError('This model requires a premium subscription');
      addToast('Premium subscription required for this model', 'error');
      return;
    }
  
    // Calculate required credits
    const requiredCredits = calculateCreditCost(model, imageCount);
  
    // Check credits
    if (!hasEnoughCredits) {
      const errorObj = {
        type: 'not_enough_credits',
        creditsNeeded: requiredCredits,
        creditsAvailable: credits
      };
      setGenerationError(JSON.stringify(errorObj));
      addToast(`Not enough credits. Required: ${requiredCredits}`, 'error');
      return;
    }
    
    // Important: Check if we're in the Generate tab, and only proceed if we are
    // This helps prevent state leakage between tabs
    const activeTab = useAnimationStore.getState().activeTab;
    if (activeTab !== 'generate') {
      useAnimationStore.getState().setActiveTab('generate');
    }
    
    setIsGenerating(true);
    
    // Close settings panel on mobile when generating
    if (isMobile && isControlsVisible) {
      setIsControlsVisible(false);
    }
  
    try {
    // Get dimensions from the size setting
    const { width, height } = getImageDimensions(size);
    
    // Make sure we have valid dimensions
    if (width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
    throw new Error('Invalid dimensions for image generation');
    }
        
    // Create request parameters
    const requestParams = {
    prompt: activePrompt.trim(),
    width,
    height,
    model,
      numberResults: imageCount
      };
      
      // Add rawMode parameter only for Flux Ultra model
      if (model === 'flux-pro-1.1-ultra' && settings.rawMode) {
        requestParams.rawMode = true;
      }
  
      const response = await apiService.generateImage(requestParams);
  
      if (response.success && response.images) {
        const processedImages = response.images.map(imageUrl => ({
          url: imageUrl,
          width: response.settings?.width || width,
          height: response.settings?.height || height
        }));
        
        // Use a more optimized way to update images to avoid flickering
        setGeneratedImages(processedImages, activePrompt.trim());
        addToast('Images generated successfully!', 'success');
        
        await refreshCredits();
      } else {
        throw new Error('No images received from the server');
      }
    } catch (err) {
      handleError(err);
      if (err.response?.status === 403 || err.response?.status === 429) {
        resetPrompt();
      }
    } finally {
      setIsGenerating(false);
    }
  }, [
    activePrompt,
    addToast,
    calculateCreditCost,
    credits,
    getImageDimensions,
    handleError,
    hasEnoughCredits,
    imageCount,
    model,
    refreshCredits,
    resetPrompt,
    setGeneratedImages,
    setGenerationError,
    setIsGenerating,
    size,
    user?.isPremium,
    isProModelSelected,
    onPremiumClick
  ]);

  const handleGenerateSimilar = useCallback(async (originalPrompt) => {
    updateSettings({ prompt: originalPrompt });
    handleGenerate();
  }, [handleGenerate, updateSettings]);

  // Only render history components when actually visible - this prevents flashing
  // Moved after handleGenerateSimilar to fix "Cannot access before initialization" error
  const renderHistory = useCallback(() => {
    return <GenerateHistoryContainer onRegeneratePrompt={handleGenerateSimilar} />;
  }, [handleGenerateSimilar]);

  const handleCopyPrompt = useCallback((promptText) => {
    navigator.clipboard.writeText(promptText);
    addToast('Prompt copied to clipboard!', 'success');
  }, [addToast]);

  const handleDownload = useCallback(async (imageUrl, index) => {
    try {
      // Create a new image element to load the image
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Attempt anonymous CORS access
      
      // Set up promise to wait for image load or error
      const imgPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => {
          // If loading with crossOrigin fails, try without it
          // This will create a tainted canvas but might still work for some cases
          logger.debug('Trying fallback download method for:', imageUrl);
          img.crossOrigin = null;
          img.src = imageUrl;
        };
        
        // Second chance onload handler
        img.addEventListener('load', () => {
          // This will catch both the first and second attempts
          resolve();
        });
      });
      
      // Start loading the image
      img.src = imageUrl;
      
      // Wait for image to load
      await imgPromise;
      
      // Method 1: Try canvas approach first
      try {
        // Draw image to canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1024;
        canvas.height = img.naturalHeight || 1024;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Try to export as blob
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = `generated-image-${index + 1}.png`;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
              }, 100);
              addToast('Image downloaded successfully!', 'success');
            } else {
              throw new Error('Failed to create blob');
            }
          }, 'image/png');
        } catch (canvasError) {
          logger.error('Canvas export error:', canvasError);
          throw canvasError;
        }
      } catch (err) {
        // Method 2: Fall back to direct anchor approach
        logger.debug('Canvas method failed, trying direct download approach');
        const a = document.createElement('a');
        a.href = imageUrl;
        a.target = '_blank';
        a.download = `generated-image-${index + 1}.png`;
        a.rel = 'noopener noreferrer';
        
        // Simulate a click event
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: false
        });
        a.dispatchEvent(clickEvent);
        
        // This might not work in all cases due to CORS, but worth trying
        addToast('Opening image in a new tab. Right-click and select "Save image as..."', 'info');
      }
    } catch (error) {
      logger.error('Download error:', error);
      
      // Final fallback - open in new tab
      window.open(imageUrl, '_blank');
      addToast('Please right-click the image in the new tab and select "Save image as..."', 'info');
    }
  }, [addToast]);

  // Define handleAnimate without useCallback to avoid memoization issues
  function handleAnimateImage(image) {
    const isProOrUltimateMember = user?.isProMember || user?.isUltimateMember;
    
    // If user is not a Pro or Ultimate member, show upgrade prompt or navigate to premium page
    if (!isProOrUltimateMember) {
      // Navigate to premium page if Pro is required
      if (onPremiumClick) {
        onPremiumClick('pro');
      } else {
        addToast('Pro membership required for animations', 'info');
      }
      return;
    }
    
    // First, fetch the image as a blob to prepare it for upload
    fetch(image.url)
      .then(response => response.blob())
      .then(blob => {
        // Create a File object from the blob
        const imageFile = new File([blob], `generated-image-${Date.now()}.png`, { type: 'image/png' });
        
        // Create a FileReader to get the image data as base64 for thumbnail storage
        const reader = new FileReader();
        reader.onload = () => {
          // Set the uploaded image in the AnimationStore
          const imageData = { 
            file: imageFile, 
            url: image.url,
            dataUrl: reader.result,
            name: imageFile.name,
            type: imageFile.type,
            lastModified: imageFile.lastModified
          };
          
          setUploadedImage(imageData);
          
          // Navigate to the Animate tab
          onViewChange('animate');
          
          addToast('Image ready for animation!', 'success');
        };
        
        // Start reading the file as DataURL
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        logger.error('Error preparing image for animation:', error);
        addToast('Failed to prepare image for animation', 'error');
      });
  }

  // Define handleSendToEdit function for sending images to Edit tab
  async function handleSendToEdit(image) {
    try {
      // First, fetch the image as a blob to prepare it for upload
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const imageFile = new File([blob], `edit-image-${Date.now()}.png`, { type: 'image/png' });
      
      // Perform image analysis to find the best output size
      const analysis = await analyzeImageForEditing(imageFile);
      
      // Create a FileReader to get the image data as base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        // Set the uploaded image in the EditSettings with analysis data
        const imageData = { 
          file: imageFile, 
          url: image.url,
          dataUrl: reader.result,
          name: imageFile.name,
          type: imageFile.type,
          lastModified: imageFile.lastModified,
          // Include analysis data for the Edit component to use
          _analysis: analysis
        };
        
        // Store analysis in localStorage as backup since the hook might filter it out
        localStorage.setItem('editImageAnalysis', JSON.stringify(analysis));
        localStorage.setItem('editImageAnalysisTimestamp', Date.now().toString());
        
        setEditUploadedImage(imageData);
        
        // Navigate to the Edit tab
        onViewChange('edit');
      };
      
      // Start reading the file as DataURL
      reader.readAsDataURL(blob);
      
    } catch (error) {
      logger.error('Error preparing image for editing:', error);
      
      // Fall back to the original method without analysis
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const imageFile = new File([blob], `edit-image-${Date.now()}.png`, { type: 'image/png' });
        
        const reader = new FileReader();
        reader.onload = () => {
          const imageData = { 
            file: imageFile, 
            url: image.url,
            dataUrl: reader.result,
            name: imageFile.name,
            type: imageFile.type,
            lastModified: imageFile.lastModified
          };
          
          setEditUploadedImage(imageData);
          onViewChange('edit');
        };
        
        reader.readAsDataURL(blob);
        addToast('Image ready for editing (using default dimensions)', 'success');
        
      } catch (fallbackError) {
        logger.error('Fallback image preparation also failed:', fallbackError);
        addToast('Failed to prepare image for editing', 'error');
      }
    }
  }

  const toggleControls = useCallback(() => {
    setIsControlsVisible(prev => !prev);
    if (isImagePanelFullscreen) {
      setIsImagePanelFullscreen(false);
    }
  }, [isImagePanelFullscreen]);
  
  const toggleImagePanelFullscreen = useCallback(() => {
    setIsImagePanelFullscreen(prev => !prev);
    if (isControlsVisible) {
      setIsControlsVisible(false);
    }
  }, [isControlsVisible]);

  const toggleMoreModels = useCallback(() => {
    setIsMoreModelsExpanded(prev => {
      const newState = !prev;
      // Store expanded state in localStorage
      localStorage.setItem('advanced_models_expanded', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const handleImageClick = useCallback((processedImage) => {
    setSelectedImage(processedImage);
  }, []);

  // Update this function to use clearPromptInput instead of resetPrompt
  const handleResetPrompt = useCallback(() => {
    // Use clearPromptInput instead of resetPrompt to only clear the prompt
    // without resetting other settings
    clearPromptInput();
  }, [clearPromptInput]);

  const handlePromptChange = useCallback((e) => {
    const newValue = e.target.value;
    if (newValue === '') {
      clearPromptInput(); // Updated to use clearPromptInput instead of resetPrompt
    } else {
      updateSettings({ prompt: newValue });
    }
  }, [clearPromptInput, updateSettings]);

  const handleCloseLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleNavigate = useCallback((newIndex) => {
    setSelectedImage(generatedImages[newIndex]);
  }, [generatedImages]);

  const handleModelChange = useCallback((modelOption) => {
    // Only check for premium restriction, pro models are allowed for everyone
    const isDisabled = (modelOption.premium && !user?.isPremium);
    if (!isDisabled) {
      const newModel = modelOption.value;
      const currentModel = model;
      
      // Update model selection
      updateSettings({ model: newModel });
      
      // Define special models that need specific aspect ratios
      const specialModels = ['flux-pro-1.1-ultra', 'gpt-image-1', 'seedream-4.0'];
      const isCurrentModelSpecial = specialModels.includes(currentModel);
      const isNewModelSpecial = specialModels.includes(newModel);
      
      // Check if the current aspect ratio is special model-only
      const isCurrentRatioSpecialOnly = isSpecialModelOnlyRatio(selectedAspectRatio);
      
      // Check if the current aspect ratio is valid for the new model
      const isCurrentRatioValidForNewModel = isValidRatioForModel(selectedAspectRatio, newModel);
      
      // ALWAYS change aspect ratio in these scenarios:
      if (newModel !== currentModel && (
          // 1. Current ratio isn't valid for the new model
          !isCurrentRatioValidForNewModel || 
          // 2. Moving from special model to standard model with a special-only ratio
          (isCurrentModelSpecial && !isNewModelSpecial && isCurrentRatioSpecialOnly) ||
          // 3. Moving to any special model (they have their own required ratios)
          (!isCurrentModelSpecial && isNewModelSpecial) ||
          // 4. Moving between different special models
          (isCurrentModelSpecial && isNewModelSpecial && currentModel !== newModel)
        )) {
        // Log for debugging
        logger.debug(`Resetting aspect ratio when switching from ${currentModel} to ${newModel}`);
        logger.debug(`Current ratio: ${selectedAspectRatio}, isSpecialOnly: ${isCurrentRatioSpecialOnly}`);
        
        // Use default ratio for the new model
        handleAspectRatioChange(getDefaultRatioForModel(newModel));
      }
    }
  }, [handleAspectRatioChange, model, selectedAspectRatio, updateSettings, user?.isPremium]);

  // Legacy method - kept for backwards compatibility with other parts of the code
  const handleSizeChange = useCallback((sizeOption) => {
    // Update size directly
    updateSettings({ size: sizeOption.value });
    
    // Also update the aspect ratio state
    const ratioId = getRatioFromPixelDimensions(sizeOption.value, model);
    setSelectedAspectRatio(ratioId);
  }, [updateSettings, model]);

  const handleImageCountChange = useCallback((num) => {
    updateSettings({ imageCount: num });
  }, [updateSettings]);

  const handleOpenPremiumModal = useCallback(() => {
    if (onPremiumClick) {
      onPremiumClick('pro'); // Pass 'pro' to pre-select the Pro tier
    }
  }, [onPremiumClick]);

  const handleOpenTopUpModal = useCallback(() => {
    if (onTopUpClick) {
      onTopUpClick();
    } else {
      // Fallback if no handler is provided
      setTopUpModalOpen(true);
    }
  }, [onTopUpClick]);

  // Style classes
  const labelClass = "text-sm font-medium text-[var(--text)] opacity-90";
  const inputClass = "w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--inputBackground)] text-[var(--text)] placeholder-[var(--text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all duration-200";
  const cardClass = "bg-[var(--cardBackground)] rounded-xl border border-[var(--border)] shadow-sm";
  const buttonBaseClass = "rounded-lg border transition-all duration-200";
  const buttonActiveClass = "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]";
  const buttonInactiveClass = "border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5";

  // The improved controls toggle for mobile
  const ControlsToggle = () => (
    <button
      onClick={toggleControls}
      className={`md:hidden w-full flex items-center justify-between px-4 py-3 bg-[var(--cardBackground)] border-t border-[var(--border)] text-[var(--text)] sticky bottom-0 ${isControlsVisible || isImagePanelFullscreen ? 'z-30' : 'z-10'} shadow-lg ${isImagePanelFullscreen ? 'hidden' : ''}`}
    >
      <span className="font-medium flex items-center">
        {isControlsVisible ? 'Hide Controls' : 'Show Generation Controls'}
        {!isControlsVisible && (
          <span className="ml-2 text-xs bg-[var(--primary)]/20 px-2 py-1 rounded-full text-[var(--primary)]">
            {model} • {selectedRatioObj.label} • {imageCount} images
          </span>
        )}
      </span>
      {isControlsVisible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
    </button>
  );

  // Parse the error object if it's a JSON string
  const parsedError = useMemo(() => {
    if (typeof generationError === 'string') {
      try {
        const errorObj = JSON.parse(generationError);
        return errorObj.type === 'not_enough_credits' ? errorObj : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [generationError]);

  // Using new ModelOption component which internally handles both mobile & desktop

  // Memoize the main content to prevent unnecessary re-renders
  const generateImagesContent = useMemo(() => {
    if (generationError) {
      const creditErrorObj = parsedError;

      if (creditErrorObj) {
        return (
          <div className="h-full flex items-center justify-center">
            <div className="w-full flex flex-col items-center">
              <GenerateEmptyState 
                error={true} 
                errorType="credits"
                creditsNeeded={creditErrorObj.creditsNeeded}
                creditsAvailable={creditErrorObj.creditsAvailable}
              />
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => onPremiumClick('pro')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-medium rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  Upgrade Plan
                </button>
                
                {user?.isPremium && (
                  <button
                    onClick={handleOpenTopUpModal}
                    className="px-5 py-2.5 bg-[#333] hover:bg-[#444] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    Top Up Credits
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      } else if (generationError.includes('500') || generationError.includes('server')) {
        return (
          <div className="h-full flex items-center justify-center">
            <div className="w-full">
              <GenerateEmptyState 
                error={true} 
                errorType="server"
                isGenerating={isGenerating} 
              />
            </div>
          </div>
        );
      } else {
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="bg-red-500/10 dark:bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-red-500">Generation Failed</h3>
              <p className="text-[var(--text)]/60 text-sm mt-2">
                {typeof generationError === 'string' ? generationError : 'An error occurred during generation'}
              </p>
            </div>
          </div>
        );
      }
    } else if (generatedImages.length > 0) {
      return (
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-3 md:p-4 space-y-4">
          <div className={`grid gap-4 sm:gap-5 ${
          generatedImages.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
          generatedImages.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
          } w-full`}>
              {generatedImages.map((image, index) => (
                <ImageCard
                  key={`${image.url}-${index}`}
                  image={image}
                  index={index}
                  onImageClick={handleImageClick}
                  onCopyPrompt={handleCopyPrompt}
                  onDownload={handleDownload}
                  onAnimate={handleAnimateImage}
                  onSendToEdit={handleSendToEdit}
                  activePrompt={activePrompt}
                  imagePrompt={lastGeneratedPrompt}
                  isProMember={user?.isProMember || user?.isUltimateMember}
                />
              ))}
            </div>
            
            {/* Generate History added with 'mt-auto' to push it to the bottom */}
            <div className="mt-4">
              {renderHistory()}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-[400px] flex items-center justify-center">
            <GenerateEmptyState isGenerating={isGenerating} />
          </div>
          {renderHistory()}
        </div>
      );
    }
  }, [
    generationError, 
    parsedError,
    generatedImages, 
    isGenerating, 
    handleImageClick, 
    handleCopyPrompt, 
    handleDownload, 
    activePrompt, 
    user?.isProMember,
    handleOpenPremiumModal,
    handleOpenTopUpModal,
    user,
    renderHistory
  ]);

  // Memoize the models lists to prevent re-renders
  const regularModels = useMemo(() => 
    MODELS.filter(m => !m.proOnly).map((modelOption) => (
      <ModelOption
        key={modelOption.value}
        modelOption={modelOption}
        handleModelChange={handleModelChange}
        model={model}
        user={user}
        isMobile={isMobile}
      />
    )),
    [handleModelChange, model, user, isMobile]
  );
  
  // Memoize the pro models list
  const proModels = useMemo(() => 
    MODELS.filter(m => m.proOnly).map((modelOption) => (
      <ModelOption
        key={modelOption.value}
        modelOption={modelOption}
        handleModelChange={handleModelChange}
        model={model}
        user={user}
        isMobile={isMobile}
      />
    )),
    [handleModelChange, model, user, isMobile]
  );

  // Memoize the image count buttons
// Memoize the image count buttons
const imageCountButtons = useMemo(() => 
  [1, 2, 3, 4].map((num) => (
    <button
      key={num}
      onClick={() => handleImageCountChange(num)}
      className={`px-3 py-2 ${buttonBaseClass} ${
        imageCount === num ? buttonActiveClass : buttonInactiveClass
      }`}
    >
      {num}
    </button>
  )),
  [buttonActiveClass, buttonBaseClass, buttonInactiveClass, handleImageCountChange, imageCount]
);

return (
  <ContentContainer maxWidth="max-w-7xl">
    <div className="flex-1 flex flex-col min-h-0 p-4 bg-[var(--background)] overflow-hidden overscroll-none">
      <div className="flex flex-col md:flex-row gap-4 h-full min-h-0 overflow-hidden mobile-container">
          {/* Add specific mobile constraint class */}
        {/* Left Panel - Controls - Optimized for mobile */}
        <div className={`${isMobile && isControlsVisible ? 'w-full fixed inset-0 z-20 bg-[var(--background)] pt-16' : 'w-full'} md:w-[33%] lg:w-[37%] flex flex-col min-h-0 order-2 md:order-1`}>
          <AnimatePresence>
            {(isControlsVisible || !isMobile) && (
              <motion.div
                initial={isMobile ? { height: 0, opacity: 0 } : false}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`flex-1 ${cardClass} flex flex-col min-h-0 overflow-hidden ${isMobile ? (isControlsVisible ? 'h-[calc(100vh-180px)]' : 'max-h-[70vh]') : ''} overflow-y-auto`}
              >
                {/* Control panel content */}
                <div className="p-3 md:p-4 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--cardBackground)] z-10 shadow-md">
                  <div className="relative z-10 flex justify-between items-center w-full">
                    {isMobile && isControlsVisible && (
                      <button
                        onClick={toggleControls}
                        className="p-1.5 rounded-md bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)] flex items-center"
                      >
                        <ArrowLeft size={16} />
                      </button>
                    )}
                    <h2 className={`text-lg md:text-xl font-semibold text-[var(--text)] ${isMobile && isControlsVisible ? 'absolute left-1/2 transform -translate-x-1/2' : ''}`}>
                      Image Settings
                    </h2>
                    {isMobile && !isControlsVisible && (
                      <button
                        onClick={toggleControls}
                        className="p-1.5 rounded-md bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)]"
                      >
                        <ChevronDown size={16} />
                      </button>
                    )}
                    <div className={`${isMobile && isControlsVisible ? 'w-5' : ''}`}></div> {/* Empty space to balance the header on mobile */}
                  </div>
                </div>
                
                {/* Scrollable content area - make more compact for mobile */}
                <div className={`flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 ${isMobile ? 'pb-20 max-w-full overflow-x-hidden' : ''}`}>
                  {/* Prompt Input - more compact on mobile */}
                  <div className="space-y-2 relative">
                    <label className={`${labelClass} text-xs md:text-sm flex justify-between items-center`}>
                      <span>Prompt</span>
                      <span className="text-xs text-zinc-400">{activePrompt.length} chars</span>
                    </label>
                    <div className="relative group">
                      <textarea
                        value={activePrompt}
                        onChange={handlePromptChange}
                        placeholder="Describe what you want to generate..."
                        className={`${inputClass} ${isMobile ? 'h-32 md:h-48' : 'h-48'} resize-none pr-10`}
                      />
                      {activePrompt && (
                        <button
                          onClick={handleResetPrompt}
                          className="absolute right-3 top-3 p-1.5 rounded-full 
                            bg-[var(--dropdownHover)] hover:bg-[var(--border)] 
                            text-[var(--textSecondary)] hover:text-[var(--text)]
                            opacity-90 transition-all duration-200"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                    {/* Compact prompt actions for mobile */}
                    {activePrompt.trim() && (
                      <div className="overflow-hidden max-w-full">
                        <MessageActions
                          prompt={lastGeneratedPrompt || activePrompt}
                          onVariations={() => handleOperations('variations')}
                          onExtend={(details) => handleOperations('extend', details)}
                          onShorten={() => handleOperations('shorten')}
                          onEdit={onEdit}
                          showPreview={false}
                          showUseButton={false}
                          className="pt-1 md:pt-2"
                          isLoading={isGenerating}
                          isCompact={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Model Selection - Compact for mobile */}
                  <div className="space-y-2">
                    <label className={`${labelClass} text-xs md:text-sm`}>Model</label>
                    <div className={`${isMobile ? 'grid grid-cols-2 gap-1.5' : 'grid grid-cols-1 gap-2'}`}>
                      {/* Regular models - more compact layout */}
                      {regularModels}

                      {/* Pro Models Collapsible Section */}
                      {MODELS.some(m => m.proOnly) && (
                        <div className={`${isMobile ? 'col-span-2' : ''} mt-2 md:mt-3`}>
                          <button
                            onClick={toggleMoreModels}
                            className="flex items-center justify-between w-full px-1 py-1.5 text-[var(--text)] hover:bg-[var(--dropdownHover)] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles size={14} className="text-[var(--textSecondary)]" />
                              <span className="text-sm text-[var(--text)]">Advanced Models</span>
                            </div>
                            <div>
                              {isMoreModelsExpanded ? 
                                <ChevronUp size={14} className="text-[var(--textSecondary)]" /> : 
                                <ChevronDown size={14} className="text-[var(--textSecondary)]" />
                              }
                            </div>
                          </button>

                          <AnimatePresence>
                            {isMoreModelsExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className={`pt-2 ${isMobile ? 'grid grid-cols-2 gap-1.5' : 'grid grid-cols-1 gap-2'}`}>
                                  {proModels}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Size Selection - Make it mobile friendly */}
                  <div className="space-y-2">
                    <label className={`${labelClass} text-xs md:text-sm`}>Size</label>
                    <AspectRatioScroller 
                      selectedRatio={selectedAspectRatio}
                      onRatioChange={handleAspectRatioChange}
                      isPremium={user?.isPremium}
                      modelType={model}
                      isMobile={isMobile} // Add this prop
                    />
                  </div>

                  {/* Raw Mode Toggle - Only for Flux Ultra */}
                  {model === 'flux-pro-1.1-ultra' && (
                    <div className="mt-3 mb-2 px-1 border-t border-b border-[#333] py-1">
                      <RawModeToggle
                        isEnabled={settings.rawMode}
                        onChange={(value) => updateSettings({ rawMode: value })}
                        isMobile={isMobile}
                      />
                    </div>
                  )}

                  {/* Image Count - More compact on mobile */}
                  <div className="space-y-2">
                    <label className={`${labelClass} text-xs md:text-sm`}>Number of Images</label>
                    <div className="grid grid-cols-4 gap-1 md:gap-2">
                      {imageCountButtons}
                    </div>
                  </div>
                </div>

                {/* Generate Button - Sticky at bottom for mobile */}
                <div className={`p-3 md:p-4 border-t border-[var(--border)] ${isMobile ? 'sticky bottom-0 bg-[var(--cardBackground)] z-10' : ''}`}>
                  <GenerateButton 
                    onClick={isProModelSelected ? () => onPremiumClick('pro') : handleGenerate}
                    isGenerating={isGenerating}
                    disabled={!activePrompt.trim()}
                    model={model}
                    imageCount={imageCount}
                    isMobile={isMobile}
                    showUpgradeButton={isProModelSelected}
                    onPremiumClick={() => onPremiumClick('pro')}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <ControlsToggle />
        </div>

        {/* Right Panel - Generated Images - Optimized for mobile */}
        <div className={`${isMobile && isImagePanelFullscreen ? 'fixed inset-0 z-20 pt-16 max-h-[100vh] overflow-auto' : `md:w-[65%] lg:w-[60%]`} ${cardClass} flex flex-col min-h-0 overflow-hidden order-1 md:order-2 ${isMobile ? (isControlsVisible && !isImagePanelFullscreen ? 'max-h-[35vh]' : (isImagePanelFullscreen ? 'h-[calc(100vh-64px)]' : 'h-[calc(100vh-180px)]')) : ''}`}>
          <div className="p-3 md:p-4 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--cardBackground)] z-10 shadow-md">
            <div className="relative z-10 flex justify-between items-center w-full">
              {isMobile && isImagePanelFullscreen && (
              <button
              onClick={toggleImagePanelFullscreen}
              className="p-1.5 rounded-md bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)] flex items-center"
              >
              <ArrowLeft size={16} />
              </button>
              )}
              <h2 className={`text-lg md:text-xl font-semibold text-[var(--text)] ${isMobile && isImagePanelFullscreen ? 'absolute left-1/2 transform -translate-x-1/2' : ''}`}>
                Generated Images
              </h2>
              <div className="flex items-center space-x-2">
                {isMobile && generatedImages.length > 0 && (
                  <span className="text-xs text-[var(--textSecondary)] bg-[var(--dropdownHover)] px-2 py-1 rounded-full">
                  {generatedImages.length} images
                  </span>
                )}
                {isMobile && !isControlsVisible && generatedImages.length > 0 && (
                  <button
                    onClick={toggleImagePanelFullscreen}
                    className="p-1.5 rounded-md bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)]"
                    title={isImagePanelFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isImagePanelFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto overflow-x-hidden ${isImagePanelFullscreen ? 'pb-16' : ''}`}>
            {generateImagesContent}
          </div>
        </div>
      </div>

      {/* Lightbox Modal - Only render when needed */}
      <AnimatePresence mode="wait">
        {selectedImage && (
          <LightboxModal
            key="lightbox"
            images={generatedImages.map(img => ({
              url: img.url || img,
              width: img.width || 1024,
              height: img.height || 1024
            }))}
            currentIndex={generatedImages.findIndex(img => 
              (img.url || img) === (selectedImage.url || selectedImage)
            )}
            onClose={handleCloseLightbox}
            onDownload={handleDownload}
            onCopyPrompt={handleCopyPrompt}
            onNavigate={handleNavigate}
            prompt={lastGeneratedPrompt || activePrompt}
            onAnimate={(image) => handleAnimateImage(image)}
            onSendToEdit={(image) => handleSendToEdit(image)}
          />
        )}
      </AnimatePresence>
    </div>
  </ContentContainer>
);
};

// Add a new RawModeToggle component for Flux Ultra
const RawModeToggle = ({ isEnabled, onChange, isMobile }) => {
  return (
    <div className="flex items-center justify-between py-2 group relative">
      <div className="flex items-center">
        <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-[var(--text)]`}>Raw Mode</span>
        <div className="relative ml-1 inline-block">
          <span className="text-[var(--text)]/40 text-xs cursor-help">ⓘ</span>
          <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-0 mb-2 px-3 py-1.5 bg-[var(--cardBackground)] border border-[var(--border)] text-xs text-[var(--text)] rounded shadow-lg transition-opacity duration-200 pointer-events-none z-30 w-[180px] text-left whitespace-normal leading-relaxed">
            Less processed, more natural-looking images
            <div className="absolute -bottom-1 left-2 w-2 h-2 bg-[var(--cardBackground)] border-r border-b border-[var(--border)] transform rotate-45"></div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onChange(!isEnabled)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]/50 ${isEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
        aria-pressed={isEnabled}
        aria-label="Toggle Raw Mode"
      >
        <span 
          className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isEnabled ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );
};

export default React.memo(Generate);