import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

/**
 * Enhanced ModelTooltip component that adapts to mobile/desktop
 * Uses portal rendering for mobile to escape positioning constraints
 */
const ModelTooltip = ({ 
  modelId, 
  modelName, 
  images, 
  isVisible, 
  referenceRect, 
  onClose,
  isMobile 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Reset to first image when tooltip becomes visible or model changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsLoading(true);
  }, [isVisible, modelId]);

  // Auto-advance slideshow
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(current => 
        current === images.length - 1 ? 0 : current + 1
      );
    }, 3000); // Change slide every 3 seconds
    
    return () => clearInterval(interval);
  }, [isVisible, images?.length]);

  // Handle image loading
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  // Navigation handlers
  const goToPrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(current => 
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const goToNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(current => 
      current === images.length - 1 ? 0 : current + 1
    );
  };

  // If tooltip is not visible or no images, don't render
  if (!isVisible || !images || images.length === 0) return null;

  // DESKTOP VERSION - Positioned tooltip
  if (!isMobile) {
    // Calculate position based on the eye icon's position
    const tooltipStyle = referenceRect ? {
      left: `${referenceRect.left + (referenceRect.width / 2)}px`,
      transform: 'translateX(-50%)',
      bottom: `${window.innerHeight - referenceRect.top + 10}px`
    } : {};

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed z-50 max-w-xs w-64 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-sm rounded-lg border border-[#444] shadow-xl overflow-hidden"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => window.tooltipHideTimeout && clearTimeout(window.tooltipHideTimeout)}
        onMouseLeave={() => {
          window.tooltipHideTimeout = setTimeout(() => {
            if (isVisible && onClose) {
              onClose();
            }
          }, 100);
        }}
      >
        <div className="relative h-52 w-full bg-transparent">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#333] border-t-[var(--primary)] rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Current image */}
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "linear" }}
              src={images[currentImageIndex]} 
              alt={`${modelName} example ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </AnimatePresence>
          
          {/* Navigation arrows */}
          <button
            className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all duration-300"
            onClick={goToPrevImage}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all duration-300"
            onClick={goToNextImage}
          >
            <ChevronRight size={16} />
          </button>
          
          {/* Page indicators */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // MOBILE VERSION - Full overlay modal
  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1a1a1a] w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with model name */}
            <div className="flex justify-between items-center px-4 py-3 bg-[#282828] border-b border-[#444]">
              <h3 className="text-lg font-medium text-white">{modelName}</h3>
              <button 
                className="p-1.5 rounded-full hover:bg-[#444] text-white/80 hover:text-white transition-colors"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
              
            {/* Image container with better height on mobile */}
            <div className="relative w-full aspect-square bg-[#111] overflow-hidden">
              {/* Loading state */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[#333] border-t-[var(--primary)] rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Current image */}
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "linear" }}
                  src={images[currentImageIndex]} 
                  alt={`${modelName} example ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </AnimatePresence>
              
              {/* Navigation arrows - larger for mobile */}
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300"
                onClick={goToPrevImage}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300"
                onClick={goToNextImage}
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            {/* Caption area with image number */}
            <div className="px-4 py-3 bg-[#282828] border-t border-[#444] flex justify-between items-center">
              <span className="text-sm text-white/70">
                Image {currentImageIndex + 1} of {images.length}
              </span>
              
              {/* Page indicators */}
              <div className="flex justify-center gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-[var(--primary)]' : 'bg-white/30 hover:bg-white/50'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ModelTooltip;