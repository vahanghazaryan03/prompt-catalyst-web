import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Loader2, 
  XCircle, 
  Info,
  ChevronUp,
  ChevronDown,
  Wand2,
  Sparkles,
  PencilRuler,
  AlertTriangle,
  Cat,
  Crown,
  BadgePercent,
  CircleFadingArrowUpIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import { useEditSettings } from '../hooks/useEditSettings';
import apiService from '../services/api';
import ContentContainer from './layout/ContentContainer';
import LightboxModal from './LightboxModal';
import ImageCard from './ImageCard';
import EditHistoryContainer from './EditHistoryContainer';
import useAnimationStore from '../contexts/AnimationStore';
import { analyzeImageForEditing, formatDimensions, getAspectRatioString } from '../utils/editImageUtils';
import { logger } from '../utils/logger';

// Edit models
const EDIT_MODELS = [
  {
    value: 'flux-kontext-max',
    label: 'Flux Kontext Max',
    icon: Sparkles,
    description: 'Highest quality editing results',
    creditCost: 160
  },
  {
    value: 'flux-kontext-pro',
    label: 'Flux Kontext Pro',
    icon: Wand2,
    description: 'Balanced quality and performance',
    creditCost: 80
  },
  {
    value: 'flux-kontext-dev',
    label: 'Flux Kontext Dev',
    icon: BadgePercent,
    description: 'Cost efficient model',
    creditCost: 40
  }
  
];

// Empty state component
const EmptyState = () => {
  const [isHovered, setIsHovered] = useState(false);
  const messages = useMemo(() => [
    "Upload an image to start editing!",
    "Transform your images with AI!",
    "Let's edit your images with prompts!",
    "Add creative edits to your images!",
    "Ready to transform your images?"
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
        Upload an image, provide editing instructions, and let AI transform your image according to your prompts.
      </p>
    </div>
  );
};

// Edit Loading state component - Similar to GenerateEmptyState but themed for editing
const EditLoadingState = ({ uploadedImage }) => {
  const [setIsHovered] = useState(false);
  
  // Edit-specific messages that cycle during generation
  const generatingMessages = useMemo(() => [
    "Transforming your image...",
    "AI is working its magic!",
    "Applying your creative edits!",
    "Almost ready with your edit!",
    "Bringing your vision to life!"
  ], []);
  
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % generatingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [generatingMessages]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 pt-16">
      <div className="flex flex-col items-center space-y-8 mt-12">
        {/* Cat Animation with green theme - similar to GenerateEmptyState */}
        <motion.div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{ y: [0, -10, 0] }}
          transition={{ 
            y: { duration: 2, repeat: Infinity },
            rotateZ: { duration: 4, repeat: Infinity }
          }}
        >
          {/* Glow Effect - Same as EmptyState purple/blue background */}
          <motion.div 
            className="absolute -inset-4 rounded-full blur-xl opacity-75 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              opacity: { duration: 2, repeat: Infinity }
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
              className="text-[var(--primary)]" // Same green as EmptyState
            />
          </motion.div>
        </motion.div>

        {/* Message Section - Similar structure to GenerateEmptyState */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            className="text-center max-w-md flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              key={generatingMessages[currentMessage]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-lg font-medium text-[var(--text)]"
            >
              {generatingMessages[currentMessage]}
            </motion.p>
            
            <div className="flex flex-col items-center">
              <p className="text-sm text-[var(--textSecondary)] opacity-80 mt-3">
                AI is applying your edits to the image. This may take a few moments...
              </p>
              
              {/* Show uploaded image preview if available - unique to edit */}
              {uploadedImage && (
                <motion.div 
                  className="mt-4 w-24 h-24 rounded-lg overflow-hidden border border-[var(--border)] shadow-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img src={uploadedImage.url} alt="Editing preview" className="w-full h-full object-cover" />
                </motion.div>
              )}
            </div>
            
            {/* Loading indicator with primary color theme - matching EmptyState */}
            <div className="flex justify-center items-center space-x-3 mt-6">
              <div className="w-4 h-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-[spin_0.6s_linear_infinite]" />
                <div className="absolute inset-0 rounded-full border border-[var(--primary)] opacity-20" />
              </div>
              <span className="text-sm text-[var(--textSecondary)]">Editing image...</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Main Edit component
const Edit = ({ 
  onViewChange,
  handleSubmit,
  setMessages,
  onEdit,
  onPremiumClick,
  onTopUpClick
}) => {
  // Use the edit settings hook instead of local state
  const {
    // Settings
    selectedModel,
    variationsCount,
    setSelectedModel,
    setVariationsCount,
    
    // Current state
    editPrompt,
    uploadedImage,
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
    
    // Utility functions
    clearUploadedImage,
    completeEdit,
    canEdit
  } = useEditSettings();
  
  // Local UI state (not persisted)
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedEditItem, setSelectedEditItem] = useState(null); // Track which edit session we're viewing
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isImagePanelFullscreen, setIsImagePanelFullscreen] = useState(false);
  
  // Image analysis state (local UI only)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  
  // Hooks
  const { addToast } = useToast();
  const { user } = useAuth();
  const { credits, refreshCredits } = useCredit();
  const isMobile = window.innerWidth < 768;
  
  // Get pro or ultimate member status
  const isProMember = useMemo(() => {
    return !!user?.isProMember || !!user?.isUltimateMember;
  }, [user]);
  
  // Note: Image analysis is now automatically restored from persistent storage
  // No need for special handling of pre-analyzed images
  
  // Effects
  useEffect(() => {
    // Clear error when prompt changes
    if (editError) setEditError(null);
  }, [editPrompt, editError]);
  
  // Set active tab when component mounts and check for images sent from other tabs
  useEffect(() => {
    // This helps other parts of the app know we're in the Edit tab
    // Note: If you have a tab management system, you can use it here
    document.title = 'Edit Image - Prompt Catalyst';
    
    return () => {
      document.title = 'Prompt Catalyst';
    };
  }, []);
  

  // Handle selecting an edited image for further editing
  const handleReEditImage = useCallback(async (image) => {
    setIsAnalyzingImage(true);
    
    try {
      // First, fetch the image as a blob
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const imageFile = new File([blob], `re-edit-image-${Date.now()}.png`, { type: 'image/png' });
      
      // Analyze the image dimensions to find the best output size
      const analysis = await analyzeImageForEditing(imageFile);
      
      // Create a FileReader to get the image data
      const reader = new FileReader();
      
      // Set up the onload handler
      reader.onload = () => {
        // Create image data object
        const imageData = { 
          file: imageFile, 
          url: image.url,
          dataUrl: reader.result,
          name: imageFile.name,
          type: imageFile.type,
          lastModified: imageFile.lastModified,
          _analysis: analysis // Attach analysis to image data
        };
        
        // Clear any previous error
        setEditError(null);
        
        // Replace the current uploaded image with analysis
        setUploadedImage(imageData, analysis);
        
        // Clear generated images to focus on the new edit
        setGeneratedImages([]);
      };
      
      // Start reading the file as DataURL
      reader.readAsDataURL(blob);
      
    } catch (error) {
      logger.error('Error preparing image for re-editing:', error);
      
      // Fall back to the original method without analysis
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const imageFile = new File([blob], `re-edit-image-${Date.now()}.png`, { type: 'image/png' });
        
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
          
          setEditError(null);
          setUploadedImage(imageData);
          setGeneratedImages([]);
        };
        
        reader.readAsDataURL(blob);
        addToast('Image ready for re-editing (using default dimensions)', 'success');
        
      } catch (fallbackError) {
        logger.error('Fallback re-edit preparation also failed:', fallbackError);
        addToast('Failed to prepare image for re-editing', 'error');
      }
    } finally {
      setIsAnalyzingImage(false);
    }
  }, [setUploadedImage, setEditError, setGeneratedImages, addToast]);

  // Handle sending image to Animate tab
  const handleAnimateImage = useCallback((image) => {
    const isProOrUltimateMember = user?.isProMember || user?.isUltimateMember;
    
    // If user is not a Pro or Ultimate member, show upgrade prompt
    if (!isProOrUltimateMember) {
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
        const imageFile = new File([blob], `edited-image-${Date.now()}.png`, { type: 'image/png' });
        
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
          
          useAnimationStore.getState().setUploadedImage(imageData);
          
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
  }, [user?.isProMember, user?.isUltimateMember, onPremiumClick, onViewChange, addToast]);

  // Calculate required credits
  const calculateCreditCost = useCallback(() => {
    const model = EDIT_MODELS.find(m => m.value === selectedModel);
    return model ? model.creditCost * variationsCount : 0;
  }, [selectedModel, variationsCount]);

  const requiredCredits = calculateCreditCost();
  
  // Check if user has enough credits
  const hasEnoughCredits = useMemo(() => {
    return (credits !== null) && (credits >= requiredCredits);
  }, [credits, requiredCredits]);

  // Handle image upload
  const handleImageUpload = useCallback(async (file) => {
    setIsAnalyzingImage(true);
    
    try {
      // Analyze the image dimensions to find the best output size
      const analysis = await analyzeImageForEditing(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = URL.createObjectURL(file);
        const imageData = { 
          file, 
          url: imageUrl,
          dataUrl: reader.result,
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          _analysis: analysis // Attach analysis to image data
        };
        
        // Set both image and analysis
        setUploadedImage(imageData, analysis);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      logger.error('Error analyzing image:', error);
      // Fall back to regular upload without analysis
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage({ 
          file, 
          url: imageUrl,
          dataUrl: reader.result,
          name: file.name,
          type: file.type,
          lastModified: file.lastModified
        });
      };
      reader.readAsDataURL(file);
      
      addToast('Image uploaded (using default dimensions)', 'success');
    } finally {
      setIsAnalyzingImage(false);
    }
  }, [setUploadedImage, addToast]);

  // Handle image removal
  const handleRemoveImage = useCallback(() => {
    clearUploadedImage(); // This now also clears imageAnalysis
    setIsAnalyzingImage(false); // Also clear analyzing state
  }, [clearUploadedImage]);

  // Handle edit generation
  const handleGenerate = useCallback(async () => {
    if (!canEdit) {
      if (!uploadedImage) {
        addToast('Please upload an image first', 'error');
      } else if (!editPrompt.trim()) {
        addToast('Please enter editing instructions', 'error');
      }
      return;
    }

    if (!hasEnoughCredits) {
      addToast(`Not enough credits. Required: ${requiredCredits}`, 'error');
      return;
    }

    // Clear previous error and results
    setEditError(null);
    
    // Set generating state
    setIsGenerating(true);
    
    // Close settings panel on mobile when generating
    if (isMobile && isControlsVisible) {
      setIsControlsVisible(false);
    }

    try {
      // Create form data for API request
      const formData = new FormData();
      formData.append('image', uploadedImage.file);
      formData.append('prompt', editPrompt.trim());
      formData.append('model', selectedModel);
      formData.append('numberResults', variationsCount.toString());
      
      // Use analyzed dimensions if available, otherwise fall back to default square
      const outputWidth = imageAnalysis?.outputDimensions?.width || 1024;
      const outputHeight = imageAnalysis?.outputDimensions?.height || 1024;
      
      formData.append('width', outputWidth.toString());
      formData.append('height', outputHeight.toString());
      formData.append('outputQuality', '85'); // Default output quality

      // Call the actual API
      const response = await apiService.editImage(formData);
      
      if (response.success && response.images) {
        // Process the response images
        const processedImages = response.images.map((imageUrl, index) => ({
          url: imageUrl,
          width: response.settings?.width || 1024,
          height: response.settings?.height || 1024
        }));
        
        addToast('Images edited successfully!', 'success');
        
        // Complete the edit operation (this handles state updates and history)
        const editCompletionData = {
          originalImage: uploadedImage,
          editedImages: processedImages,
          instructions: editPrompt.trim(),
          model: selectedModel,
          variationsCount,
          originalImageName: uploadedImage.name
        };
        
        await completeEdit(editCompletionData);
        
        // Refresh credits
        await refreshCredits();
      } else {
        throw new Error('No edited images received from the server');
      }
      
    } catch (error) {
      logger.error('Image editing error:', error);
      
      // Handle specific error types
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        setEditError(`Insufficient credits. Required: ${errorData.creditsRequired || requiredCredits}, Available: ${errorData.creditsAvailable || credits}`);
        addToast('Not enough credits for this operation', 'error');
      } else if (error.response?.status === 401) {
        setEditError('Authentication required. Please log in.');
        addToast('Please log in to use image editing', 'error');
      } else if (error.response?.status === 400) {
        const errorDetails = error.response.data?.details;
        if (errorDetails && Array.isArray(errorDetails)) {
          const validationErrors = errorDetails.map(err => err.msg).join(', ');
          setEditError(`Validation error: ${validationErrors}`);
          addToast(`Invalid input: ${validationErrors}`, 'error');
        } else {
          setEditError(error.response.data?.error || 'Invalid request parameters');
          addToast('Invalid request. Please check your input.', 'error');
        }
      } else if (error.response?.status === 413) {
        setEditError('Image file is too large. Maximum size is 15MB.');
        addToast('Image file is too large. Please use a smaller image.', 'error');
      } else if (error.response?.status === 415) {
        setEditError('Unsupported image format. Please use JPG, PNG, or WebP.');
        addToast('Unsupported image format. Please use JPG, PNG, or WebP.', 'error');
      } else {
        setEditError(error.response?.data?.error || 'Failed to edit image. Please try again.');
        addToast('Failed to edit image. Please try again.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [
    canEdit,
    uploadedImage, 
    editPrompt, 
    selectedModel, 
    variationsCount, 
    hasEnoughCredits, 
    requiredCredits,
    addToast, 
    refreshCredits,
    isMobile,
    isControlsVisible,
    setEditError,
    setIsGenerating,
    completeEdit,
    imageAnalysis,
    credits // Add these to dependencies so function updates when they change
  ]);

  // Handle download
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
              a.download = `edited-image-${index + 1}.png`;
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
        a.download = `edited-image-${index + 1}.png`;
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

  // Handle copy prompt
  const handleCopyPrompt = useCallback((promptText) => {
    navigator.clipboard.writeText(promptText);
    addToast('Prompt copied to clipboard!', 'success');
  }, [addToast]);

  const handleImageClick = useCallback((image, editItem = null) => {
    setSelectedImage(image);
    setSelectedEditItem(editItem); // Store the edit context if provided
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedImage(null);
    setSelectedEditItem(null); // Clear edit context too
  }, []);

  const handleNavigate = useCallback((newIndex) => {
    if (selectedEditItem) {
      // Navigating within a historical edit session
      const validImages = selectedEditItem.editedImages.filter(img => img && img.url);
      if (newIndex >= 0 && newIndex < validImages.length && validImages[newIndex]) {
        setSelectedImage(validImages[newIndex]);
      }
    } else {
      // Navigating within current generation
      const isCurrentGeneration = selectedImage && generatedImages.some(img => {
        const imgUrl = typeof img === 'string' ? img : (img?.url || '');
        const selectedUrl = typeof selectedImage === 'string' ? selectedImage : (selectedImage?.url || '');
        return imgUrl === selectedUrl;
      });
      
      if (isCurrentGeneration) {
        const validImages = generatedImages.filter(img => img && (img.url || typeof img === 'string'));
        if (newIndex >= 0 && newIndex < validImages.length && validImages[newIndex]) {
          setSelectedImage(validImages[newIndex]);
        }
      }
    }
  }, [generatedImages, selectedImage, selectedEditItem]);

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
  
  // Handle reusing edit settings from history
  const handleReuseEdit = useCallback((editItem) => {
    // Set the instructions
    setEditPrompt(editItem.instructions);
    
    // Set the model
    setSelectedModel(editItem.model);
    
    // Set variations count
    setVariationsCount(editItem.variationsCount);
    
    // Note: We don't set the original image since user needs to upload a new one
    // This just pre-fills the form with the same edit settings
    
    addToast('Edit settings applied! Upload an image to use these settings.', 'success');
  }, [setEditPrompt, setSelectedModel, setVariationsCount, addToast]);

  // Styling classes
  const labelClass = "text-sm font-medium text-[var(--text)]";
  const inputClass = "w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--inputBackground)] text-[var(--text)] placeholder-[var(--textSecondary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all duration-200";
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
        {isControlsVisible ? 'Hide Controls' : 'Show Editing Controls'}
        {!isControlsVisible && (
          <span className="ml-2 text-xs bg-[var(--primary)]/20 px-2 py-1 rounded-full text-[var(--primary)]">
            {selectedModel} • {variationsCount} {variationsCount === 1 ? 'variation' : 'variations'}
          </span>
        )}
      </span>
      {isControlsVisible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
    </button>
  );

  // Rendered content for the right panel
  const renderEditContent = useMemo(() => {
    if (editError) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-500/10 dark:bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-red-500">Editing Failed</h3>
            <p className="text-[var(--text)]/60 text-sm mt-2">{editError}</p>
            <button
              onClick={() => setEditError(null)}
              className="mt-4 px-4 py-2 bg-[var(--primary)] text-black rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    } else if (isGenerating) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <EditLoadingState uploadedImage={uploadedImage} />
        </div>
      );
    } else if (!uploadedImage) {
      // Show empty state when no image is uploaded, regardless of generated images
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-[400px] flex items-center justify-center">
            <EmptyState />
          </div>
          <div className="p-4">
            <EditHistoryContainer
              onReuseEdit={handleReuseEdit}
              onImageClick={handleImageClick}
            />
          </div>
        </div>
      );
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
                  onSendToEdit={handleReEditImage}
                  activePrompt={editPrompt}
                  isEdited={true}
                  isProMember={isProMember}
                />
              ))}
            </div>
            
            {/* Edit History */}
            <div className="mt-4">
              <EditHistoryContainer
                onReuseEdit={handleReuseEdit}
                onImageClick={handleImageClick}
              />
            </div>
          </div>
        </div>
      );
    } else if (uploadedImage) {
      return (
        <div className="w-full max-w-2xl mx-auto p-4">
          <div className="aspect-video rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--inputBackground)]">
            <img 
              src={uploadedImage.url} 
              alt="Preview" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {editPrompt && (
            <div className="mt-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--inputBackground)]">
              <h3 className="text-sm font-medium text-[var(--text)] mb-2">Instructions Preview</h3>
              <p className="text-sm text-[var(--text)]">{editPrompt}</p>
              
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--textSecondary)]">
                  <span>Model: <strong>{EDIT_MODELS.find(m => m.value === selectedModel)?.label}</strong></span>
                  <div className="w-1 h-1 rounded-full bg-[var(--textSecondary)]/30"></div>
                  <span>Variations: <strong>{variationsCount}</strong></span>
                  {imageAnalysis && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-[var(--textSecondary)]/30"></div>
                      <span>Output: <strong>{formatDimensions(imageAnalysis.outputDimensions.width, imageAnalysis.outputDimensions.height)}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-[400px] flex items-center justify-center">
            <EmptyState />
          </div>
          <div className="p-4">
            <EditHistoryContainer
              onReuseEdit={handleReuseEdit}
              onImageClick={handleImageClick}
            />
          </div>
        </div>
      );
    }
  }, [
    editError, 
    isGenerating, 
    uploadedImage,
    generatedImages, 
    editPrompt, 
    selectedModel, 
    variationsCount,
    handleImageClick,
    handleCopyPrompt,
    handleDownload,
    handleReuseEdit
  ]);

  return (
    <ContentContainer maxWidth="max-w-7xl">
      <div className="flex-1 flex flex-col min-h-0 p-4 bg-[var(--background)] overflow-hidden overscroll-none">
        <div className="flex flex-col md:flex-row gap-4 h-full min-h-0 overflow-hidden mobile-container">
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
                  {/* Control panel header */}
                  <div className="p-3 md:p-4 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--cardBackground)] z-10 shadow-md">
                    <div className="relative z-10 flex justify-between items-center w-full">
                      {isMobile && isControlsVisible && (
                        <button
                          onClick={toggleControls}
                          className="p-1.5 rounded-md bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)]"
                        >
                          <ChevronDown size={16} />
                        </button>
                      )}
                      <h2 className={`text-lg md:text-xl font-semibold text-[var(--text)] ${isMobile && isControlsVisible ? 'absolute left-1/2 transform -translate-x-1/2' : ''}`}>
                        Edit Settings
                      </h2>
                      {isMobile && !isControlsVisible && (
                        <button
                          onClick={toggleControls}
                          className="p-1.5 rounded-md bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)]"
                        >
                          <ChevronUp size={16} />
                        </button>
                      )}
                      <div className={`${isMobile && isControlsVisible ? 'w-5' : ''}`}></div>
                    </div>
                  </div>
                  
                  {/* Scrollable content area */}
                  <div className={`flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 ${isMobile ? 'pb-20 max-w-full overflow-x-hidden' : ''}`}>
                    {/* Instructions */}
                    <div className="rounded-lg bg-[var(--cardBackground)]/50 p-3 border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Info size={14} className="text-[var(--primary)]" />
                        <span className="text-sm font-medium text-[var(--text)]">How It Works</span>
                      </div>
                      <p className="text-xs text-[var(--textSecondary)]">
                        Upload an image and provide specific editing instructions. The AI will automatically analyze your image 
                        and select the optimal output dimensions to preserve aspect ratio. Be clear and specific about what you want to change.
                      </p>
                      {!isProMember && (
                        <div className="flex items-center mt-2 text-xs premium-restriction-text">
                          <Crown size={12} className="mr-1" />
                          Only available to <span className="ml-1 font-medium">
                            Pro & Visionary <span className="font-normal">members</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className={labelClass}>Source Image</label>
                      {uploadedImage ? (
                        <div className="space-y-2">
                          <div className="relative rounded-lg border border-[var(--border)] overflow-hidden">
                            <img 
                              src={uploadedImage.url} 
                              alt="Preview" 
                              className="w-full object-contain max-h-40"
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                              aria-label="Remove image"
                            >
                              <XCircle size={16} />
                            </button>
                            {isAnalyzingImage && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="bg-white/90 dark:bg-black/90 rounded-lg p-2 flex items-center gap-2">
                                  <Loader2 size={16} className="animate-spin" />
                                  <span className="text-sm">Analyzing...</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Image Analysis Info */}
                          {imageAnalysis ? (
                            <div className="rounded-lg bg-[var(--inputBackground)] border border-[var(--border)] p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Info size={14} className="text-[var(--primary)]" />
                                <span className="text-sm font-medium text-[var(--text)]">Size Analysis</span>
                                <span className="text-xs text-[var(--textSecondary)] ml-auto">
                                  {uploadedImage && uploadedImage._analysis ? 'Transferred' : 'Analyzed'}
                                </span>
                              </div>
                              
                              <div className="space-y-1 text-xs text-[var(--textSecondary)]">
                                <div className="flex justify-between">
                                  <span>Input:</span>
                                  <span className="font-medium">
                                    {formatDimensions(imageAnalysis.inputDimensions.width, imageAnalysis.inputDimensions.height)}
                                    {' '}({getAspectRatioString(imageAnalysis.inputDimensions.width, imageAnalysis.inputDimensions.height)})
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Output:</span>
                                  <span className="font-medium">
                                    {formatDimensions(imageAnalysis.outputDimensions.width, imageAnalysis.outputDimensions.height)}
                                    {' '}({imageAnalysis.outputDimensions.label})
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Match:</span>
                                  <span className={`font-medium ${
                                    imageAnalysis.matchInfo.ratioMatchPercentage >= 90 ? 'text-green-500' :
                                    imageAnalysis.matchInfo.ratioMatchPercentage >= 70 ? 'text-yellow-500' :
                                    'text-orange-500'
                                  }`}>
                                    {imageAnalysis.matchInfo.ratioMatchPercentage}%
                                    {imageAnalysis.matchInfo.willStretch && ' (will resize)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-[var(--textSecondary)] p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                              
                            </div>
                          )}
                        </div>
                      ) : (
                        <ImageUpload
                          onFileSelect={handleImageUpload}
                          accept="image/jpeg,image/png,image/webp"
                          maxSize={15728640} // 15MB
                          className="bg-[var(--inputBackground)] border-[var(--border)]"
                        />
                      )}
                    </div>

                    {/* Edit Instructions */}
                    <div className="space-y-2">
                      <label className={labelClass}>Editing Instructions</label>
                      <div className="relative group">
                        <textarea
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder="Describe the edits you want to make... (e.g., 'Change hair color to blonde', 'Make this image pixel art')"
                          className={`${inputClass} h-32 resize-none pr-10`}
                        />
                        {editPrompt && (
                          <button
                            onClick={() => setEditPrompt('')}
                            className="absolute right-3 top-3 p-1.5 rounded-full 
                              bg-[var(--dropdownHover)] hover:bg-[var(--border)] 
                              text-[var(--textSecondary)] hover:text-[var(--text)]
                              opacity-90 transition-all duration-200"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <label className={labelClass}>Model</label>
                      <div className="grid grid-cols-1 gap-2">
                        {EDIT_MODELS.map((model) => (
                          <div
                            key={model.value}
                            onClick={() => setSelectedModel(model.value)}
                            className={`flex items-start gap-3 px-3 py-2 ${buttonBaseClass} ${
                              selectedModel === model.value ? buttonActiveClass : buttonInactiveClass
                            } cursor-pointer relative`}
                          >
                            <model.icon size={16} className="mt-0.5" />
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm flex items-center">
                                {model.label}
                                {model.isNew && (
                                  <span className="ml-2 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-sm text-[10px] font-medium">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <div className="text-xs opacity-70 mt-0.5">
                              {model.description}
                              </div>
                              </div>
                              {!isProMember && (
                              <span className="text-xs bg-[var(--dropdownHover)] px-2 py-1 rounded text-[var(--textSecondary)] ml-auto">
                                  {model.creditCost} credits
                          </span>
                        )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Variations Amount */}
                    <div className="space-y-2">
                      <label className={labelClass}>Number of Variations</label>
                      <div className="grid grid-cols-4 gap-1 md:gap-2">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            onClick={() => setVariationsCount(num)}
                            className={`px-3 py-2 ${buttonBaseClass} ${
                              variationsCount === num ? buttonActiveClass : buttonInactiveClass
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className={`p-3 md:p-4 border-t border-[var(--border)] ${isMobile ? 'sticky bottom-0 bg-[var(--cardBackground)] z-10' : ''}`}>
                    {isProMember ? (
                      <button
                        onClick={handleGenerate}
                        disabled={!canEdit || isGenerating || !hasEnoughCredits}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[var(--primary)] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 size={20} className="animate-spin text-black" />
                            <span>Editing...</span>
                          </>
                        ) : (
                          <>
                            <PencilRuler size={20} className="text-black" />
                            <span className="flex-1">Edit Image</span>
                            <span className="text-sm text-black opacity-80 bg-white/15 px-2 py-0.5 rounded">
                              {requiredCredits} Credits
                            </span>
                          </>
                        )}
                      </button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onPremiumClick('pro')}
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
            <ControlsToggle />
          </div>

          {/* Right Panel - Preview/Results */}
          <div className={`${isMobile && isImagePanelFullscreen ? 'fixed inset-0 z-20 pt-16 max-h-[100vh] overflow-auto' : `md:w-[65%] lg:w-[60%]`} ${cardClass} flex flex-col min-h-0 overflow-hidden order-1 md:order-2 ${isMobile ? (isControlsVisible && !isImagePanelFullscreen ? 'max-h-[35vh]' : (isImagePanelFullscreen ? 'h-[calc(100vh-64px)]' : 'h-[calc(100vh-180px)]')) : ''}`}>
            <div className="p-3 md:p-4 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--cardBackground)] z-10 shadow-md">
              <div className="relative z-10 flex justify-between items-center w-full">
                {isMobile && isImagePanelFullscreen && (
                  <button
                    onClick={toggleImagePanelFullscreen}
                    className="p-1.5 rounded-md bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)] flex items-center"
                  >
                    <ChevronDown size={16} />
                  </button>
                )}
                <h2 className={`text-lg md:text-xl font-semibold text-[var(--text)] ${isMobile && isImagePanelFullscreen ? 'absolute left-1/2 transform -translate-x-1/2' : ''}`}>
                  {generatedImages.length > 0 ? "Edited Images" : "Preview"}
                </h2>
                <div className="flex items-center space-x-2">
                  {isMobile && generatedImages.length > 0 && (
                    <span className="text-xs text-[var(--textSecondary)] bg-[var(--dropdownHover)] px-2 py-1 rounded-full">
                      {generatedImages.length} {generatedImages.length === 1 ? 'image' : 'images'}
                    </span>
                  )}
                  {isMobile && !isControlsVisible && generatedImages.length > 0 && (
                    <button
                      onClick={toggleImagePanelFullscreen}
                      className="p-1.5 rounded-md bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)]"
                      title={isImagePanelFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                      {isImagePanelFullscreen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto overflow-x-hidden ${isImagePanelFullscreen ? 'pb-16' : ''}`}>
              {renderEditContent}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence mode="wait">
          {selectedImage && (() => {
            if (selectedEditItem) {
              // Show historical edit session images with navigation
              const validImages = selectedEditItem.editedImages.filter(img => img && img.url);
              const mappedImages = validImages.map(img => ({
                url: img.url,
                width: img.width || 1024,
                height: img.height || 1024
              }));
              
              const currentIndex = validImages.findIndex(img => {
                const selectedUrl = typeof selectedImage === 'string' ? selectedImage : (selectedImage?.url || '');
                return img.url === selectedUrl;
              });
              
              return (
                <LightboxModal
                  key="lightbox-historical"
                  images={mappedImages}
                  currentIndex={Math.max(0, currentIndex)}
                  onClose={handleCloseLightbox}
                  onDownload={handleDownload}
                  onCopyPrompt={handleCopyPrompt}
                  onNavigate={handleNavigate}
                  prompt={selectedEditItem.instructions} // Use the historical prompt
                  onAnimate={handleAnimateImage}
                  onSendToEdit={handleReEditImage}
                />
              );
            } else {
              // Check if selected image is from current generation
              const isCurrentGeneration = generatedImages.some(img => {
                const imgUrl = typeof img === 'string' ? img : (img?.url || '');
                const selectedUrl = typeof selectedImage === 'string' ? selectedImage : (selectedImage?.url || '');
                return imgUrl === selectedUrl;
              });
              
              if (isCurrentGeneration) {
                // Show current generation images with navigation
                const validImages = generatedImages.filter(img => img && (img.url || typeof img === 'string'));
                const mappedImages = validImages.map(img => ({
                  url: typeof img === 'string' ? img : img.url,
                  width: (typeof img === 'object' && img.width) || 1024,
                  height: (typeof img === 'object' && img.height) || 1024
                }));
                
                const currentIndex = validImages.findIndex(img => {
                  const imgUrl = typeof img === 'string' ? img : img.url;
                  const selectedUrl = typeof selectedImage === 'string' ? selectedImage : selectedImage.url;
                  return imgUrl === selectedUrl;
                });
                
                return (
                  <LightboxModal
                  key="lightbox-current"
                  images={mappedImages}
                  currentIndex={Math.max(0, currentIndex)}
                  onClose={handleCloseLightbox}
                  onDownload={handleDownload}
                  onCopyPrompt={handleCopyPrompt}
                  onNavigate={handleNavigate}
                  prompt={editPrompt}
                  onAnimate={handleAnimateImage}
                    onSendToEdit={handleReEditImage}
                />
                );
              } else {
                // Show single orphaned image (shouldn't happen now, but safety fallback)
                const orphanedImage = {
                  url: typeof selectedImage === 'string' ? selectedImage : (selectedImage?.url || ''),
                  width: (typeof selectedImage === 'object' && selectedImage?.width) || 1024,
                  height: (typeof selectedImage === 'object' && selectedImage?.height) || 1024
                };
                
                return (
                  <LightboxModal
                    key="lightbox-orphaned"
                    images={[orphanedImage]}
                    currentIndex={0}
                    onClose={handleCloseLightbox}
                    onDownload={handleDownload}
                    onCopyPrompt={handleCopyPrompt}
                    onNavigate={() => {}} // No navigation for orphaned images
                    prompt={editPrompt}
                    onAnimate={handleAnimateImage}
                    onSendToEdit={handleReEditImage}
                  />
                );
              }
            }
          })()}
        </AnimatePresence>
      </div>
    </ContentContainer>
  );
};

export default Edit;