import React, { useState, useEffect, useRef, useCallback } from 'react';
import CopyAnimation from './CopyAnimation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Copy, Play, PencilRuler } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import useAnimationStore from '../contexts/AnimationStore';
import { logger } from '../utils/logger';

const LightboxModal = ({ 
  images,
  currentIndex,
  onClose,
  onDownload,
  onCopyPrompt,
  onNavigate,
  prompt,
  onAnimate, // This prop may not be passed in some contexts
  onSendToEdit // New prop for sending to Edit tab
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [showCopyAnimation, setShowCopyAnimation] = useState(false);
  const [copyInProgress, setCopyInProgress] = useState(false);
  const copyButtonRef = useRef(null);
  // Safely get current image with fallback
  const currentImage = images && images[currentIndex] ? images[currentIndex] : null;
  const { user } = useAuth(); 
  const { addToast } = useToast();
  const setUploadedImage = useAnimationStore(state => state.setUploadedImage);
  
  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
        case '+':
          handleZoom(Math.min(zoom + 0.25, 3));
          break;
        case '-':
          handleZoom(Math.max(zoom - 0.25, 1));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, zoom, images.length, onClose, onNavigate]);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    setShowCopyAnimation(false);
    setCopyInProgress(false);
  }, []);
  
  // Early return if no valid current image (after all hooks)
  if (!currentImage) {
    logger.warn('LightboxModal: No valid current image found');
    return null;
  }

  const handleZoom = (newZoom) => {
    setZoom(newZoom);
    setPosition({ x: 0, y: 0 }); // Reset position on zoom change
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContentClick = (e) => {
    // Only stop propagation if clicking on the image, controls, or navigation
    if (
      e.target.closest('.lightbox-interactive-area') ||
      e.target.closest('.lightbox-controls') ||
      e.target.closest('.lightbox-navigation')
    ) {
      e.stopPropagation();
    }
  };

  // Default built-in animate handler (if onAnimate prop is not provided)
  const handleDefaultAnimate = (image) => {
    const isProOrUltimateMember = user?.isProMember || user?.isUltimateMember;
    
    // If user is not a Pro or Ultimate member, show info toast
    if (!isProOrUltimateMember) {
      addToast('Pro membership required for animations', 'info');
      return;
    }
    
    // Directly use the AnimationStore
    fetch(image.url)
      .then(response => response.blob())
      .then(blob => {
        // Create a File object from the blob
        const imageFile = new File([blob], `generated-image-${Date.now()}.png`, { type: 'image/png' });
        
        // Create a FileReader to get the image data as base64 for thumbnail storage
        const reader = new FileReader();
        reader.onload = () => {
          // Set the uploaded image in the AnimationStore
          setUploadedImage({ 
            file: imageFile, 
            url: image.url,
            dataUrl: reader.result,
            name: imageFile.name,
            type: imageFile.type,
            lastModified: imageFile.lastModified
          });
          
          // We can't directly navigate here since we don't have the navigation function
          addToast('Image set for animation! Go to the Animation tab to continue.', 'success');
          
          // Close the lightbox
          onClose();
        };
        
        // Start reading the file as DataURL
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        logger.error('Error preparing image for animation:', error);
        addToast('Failed to prepare image for animation', 'error');
      });
  };

  // Handle the animate button click with enhanced functionality
  const handleAnimateClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use provided handler if available, otherwise use default
    if (typeof onAnimate === 'function') {
      onAnimate(currentImage);
    } else {
      handleDefaultAnimate(currentImage);
    }
  };

  // Handle sending to Edit tab
  const handleSendToEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof onSendToEdit === 'function') {
      onSendToEdit(currentImage);
    }
  };

  // Check if the user is a Pro or Ultimate member 
  const isProMember = user?.isProMember || user?.isUltimateMember;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] }
      }}
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Main Content */}
      <div 
        className="relative h-full w-full flex items-center justify-center"
        onClick={handleContentClick}
      >
        {/* Image Container */}
        <div
          className="relative overflow-hidden lightbox-interactive-area"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
        >
          <motion.img
            src={typeof currentImage === 'string' ? currentImage : (currentImage?.url || '')}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            style={{
              scale: zoom,
              x: position.x,
              y: position.y,
              cursor: isDragging ? 'grabbing' : 'inherit'
            }}
            drag={zoom > 1}
            dragConstraints={{
              left: -100 * zoom,
              right: 100 * zoom,
              top: -100 * zoom,
              bottom: 100 * zoom
            }}
          />
        </div>

        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between lightbox-controls">
          {/* Image Info */}
          <div className="flex items-center gap-4 text-white">
            <span className="bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm">
              {(typeof currentImage === 'object' && currentImage?.width) || 1024}×{(typeof currentImage === 'object' && currentImage?.height) || 1024}
            </span>
            <span className="bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
          <button
          onClick={(e) => {
          e.stopPropagation();
          handleZoom(Math.max(zoom - 0.25, 1));
          }}
          className="p-2 rounded-lg bg-white/85 text-gray-800 hover:bg-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
          disabled={zoom === 1}
          >
          <ZoomOut size={20} />
          </button>
          <button
          onClick={(e) => {
          e.stopPropagation();
          handleZoom(Math.min(zoom + 0.25, 3));
          }}
          className="p-2 rounded-lg bg-white/85 text-gray-800 hover:bg-white transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
          disabled={zoom === 3}
          >
          <ZoomIn size={20} />
          </button>
          
          {/* The Animate Button - Always show it */}
          <button
          onClick={handleAnimateClick}
          className={`p-2 rounded-lg ${isProMember 
          ? 'bg-white/85 text-gray-800 hover:bg-white' 
          : 'bg-green-500 text-white hover:bg-green-400'} 
          transition-colors shadow-md hover:shadow-lg`}
          title={isProMember ? "Send to Animate" : "Go Pro to animate"}
          >
          <Play size={20} />
          </button>
          
          {/* The Edit Button */}
          {onSendToEdit && (
          <button
          onClick={handleSendToEditClick}
          className="p-2 rounded-lg bg-white/85 text-gray-800 hover:bg-white transition-colors shadow-md hover:shadow-lg"
          title="Send to Edit"
          >
          <PencilRuler size={20} />
          </button>
          )}
          
          <button
          onClick={(e) => {
          e.stopPropagation();
          const imageUrl = typeof currentImage === 'string' ? currentImage : (currentImage?.url || '');
          if (imageUrl) {
          onDownload(imageUrl, currentIndex);
          }
          }}
          className="p-2 rounded-lg bg-white/85 text-gray-800 hover:bg-white transition-colors shadow-md hover:shadow-lg"
          >
          <Download size={20} />
          </button>
          
          <div className="relative">
          <button
          ref={copyButtonRef}
          onClick={(e) => {
          e.stopPropagation();
          if (onCopyPrompt && typeof onCopyPrompt === 'function') {
            if (prompt && typeof prompt === 'string') {
              onCopyPrompt(prompt);
            } else {
              // Fallback if prompt is missing or invalid
              onCopyPrompt('Generated image prompt');
            }
            setCopyInProgress(true);
            setShowCopyAnimation(true);
          }
          }}
          className={`p-2 rounded-lg ${copyInProgress ? 'bg-white' : 'bg-white/85 hover:bg-white'} text-gray-800 transition-colors shadow-md hover:shadow-lg`}
          disabled={copyInProgress}
          title="Copy Prompt"
          >
          <Copy size={20} />
          </button>
          {showCopyAnimation && (
          <CopyAnimation
          isVisible={showCopyAnimation}
          onAnimationComplete={handleAnimationComplete}
          />
          )}
          </div>
          <button
          onClick={(e) => {
          e.stopPropagation();
          onClose();
          }}
          className="p-2 rounded-lg bg-white/85 text-gray-800 hover:bg-white transition-colors shadow-md hover:shadow-lg ml-2"
          >
          <X size={20} />
          </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/85 text-gray-800 hover:bg-white transition-colors shadow-md hover:shadow-lg lightbox-navigation"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/85 text-gray-800 hover:bg-white transition-colors shadow-md hover:shadow-lg lightbox-navigation"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default LightboxModal;