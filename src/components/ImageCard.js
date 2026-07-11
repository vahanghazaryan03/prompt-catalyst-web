// A standalone optimized ImageCard component to be used in Generate.js
import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import CopyAnimation from './CopyAnimation';
import { motion } from 'framer-motion';
import { Copy, Download, Play, PencilRuler } from 'lucide-react';

const ImageCard = memo(({ 
  image, 
  index, 
  onImageClick, 
  onCopyPrompt, 
  onDownload, 
  activePrompt,
  onAnimate,
  onSendToEdit,
  isProMember,
  // Add imagePrompt as a dedicated prop
  imagePrompt
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCopyAnimation, setShowCopyAnimation] = useState(false);
  const copyButtonRef = useRef(null);
  const [copyInProgress, setCopyInProgress] = useState(false);
  
  // Normalize the image object to handle both string and object formats
  const imageUrl = image.url || image;
  const { width, height } = image.width && image.height ? image : { width: 1024, height: 1024 };
  const aspectRatio = width / height;
  const isMobile = window.innerWidth < 768;
  
  const maxWidth = isMobile ? window.innerWidth - 32 : 800;
  const maxHeight = isMobile ? window.innerHeight * 0.6 : 600;
  
  let scaledWidth = width;
  let scaledHeight = height;
  
  if (width > maxWidth || height > maxHeight) {
    if (width / maxWidth > height / maxHeight) {
      scaledWidth = maxWidth;
      scaledHeight = maxWidth / aspectRatio;
    } else {
      scaledHeight = maxHeight;
      scaledWidth = maxHeight * aspectRatio;
    }
  }
  
  const handleImageClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const processedImage = typeof image === 'string' 
      ? { url: image, width, height }
      : { 
          url: image.url || image,
          width: image.width || width,
          height: image.height || height
        };
    
    if (onImageClick) {
      onImageClick(processedImage);
    }
  }, [image, width, height, onImageClick]);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    if (onCopyPrompt && typeof onCopyPrompt === 'function') {
      // Use imagePrompt first if provided, then activePrompt as fallback
      const promptToCopy = imagePrompt || activePrompt;
      
      if (promptToCopy && typeof promptToCopy === 'string') {
        onCopyPrompt(promptToCopy);
      } else {
        // If both are missing or invalid, use a generic fallback
        onCopyPrompt('Generated image prompt');
      }
      
      setCopyInProgress(true);
      setShowCopyAnimation(true);
    }
  }, [onCopyPrompt, activePrompt, imagePrompt]);

  const handleAnimationComplete = useCallback(() => {
    setShowCopyAnimation(false);
    setCopyInProgress(false);
  }, []);

  const handleDownload = useCallback((e) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(imageUrl, index);
    }
  }, [onDownload, imageUrl, index]);
  
  const handleAnimate = useCallback((e) => {
    e.stopPropagation();
    if (onAnimate) {
      // Process the image to be compatible with the Animation tab
      const imageForAnimation = typeof image === 'string' 
        ? { url: image, width, height }
        : { 
            url: image.url || image,
            width: image.width || width,
            height: image.height || height
          };
      
      onAnimate(imageForAnimation);
    }
  }, [onAnimate, image, width, height]);
  
  const handleSendToEdit = useCallback((e) => {
    e.stopPropagation();
    if (onSendToEdit) {
      // Process the image to be compatible with the Edit tab
      const imageForEdit = typeof image === 'string' 
        ? { url: image, width, height }
        : { 
            url: image.url || image,
            width: image.width || width,
            height: image.height || height
          };
      
      onSendToEdit(imageForEdit);
    }
  }, [onSendToEdit, image, width, height]);
  
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setIsHovered(true);
  }, [isMobile]);
  
  const handleMouseLeave = useCallback(() => {
    if (!isMobile) setIsHovered(false);
  }, [isMobile]);
  
  const handleTouchStart = useCallback(() => {
    if (isMobile) setIsHovered(true);
  }, [isMobile]);
  
  const handleTouchEnd = useCallback(() => {
    if (isMobile) setIsHovered(false);
  }, [isMobile]);
  
  // Simplified loading state management
  useEffect(() => {
    // Reset loading state when the image URL changes
    setIsLoading(true);
  }, [imageUrl]);
  
  return (
    <div
      className="relative rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--inputBackground)] hover:border-[var(--primary)]/30 transition-colors duration-200 shadow-sm hover:shadow-md"
      style={{
        width: '100%',
        maxWidth: `${scaledWidth}px`,
        margin: '0 auto'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Aspect ratio maintained container */}
      <div style={{ paddingBottom: `${(height / width) * 100}%` }} />
      
      {/* Image container */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleImageClick}
      >
        <img
          src={imageUrl}
          alt={`Generated ${index + 1}`}
          className="w-full h-full object-contain bg-[var(--cardBackground)]"
          onLoad={() => setIsLoading(false)}
        />
        
        {/* Overlay loading indicator that doesn't block the image */}
        {isLoading && (
          <div className="absolute top-2 right-2 z-10">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Overlay for hover effects - using CSS transitions instead of motion */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Image size indicator */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-end">
          <span
            className={`text-xs text-white/70 bg-black/40 px-2 py-1 rounded-md backdrop-blur-[2px] transition-all duration-200 ${isHovered ? 'opacity-70 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          >
            {width}×{height}
          </span>
        </div>

        {/* Action buttons */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 pointer-events-auto z-10 transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          {/* Animate button */}
          {onAnimate && (
            <button 
              onClick={handleAnimate}
              className={`p-2 rounded-lg ${isProMember 
                ? 'bg-white/90 hover:bg-white shadow-md hover:shadow-lg' 
                : 'bg-green-600 hover:bg-green-500 text-white shadow-md hover:shadow-lg'} 
                backdrop-blur-[2px] transition-colors`}
              title={isProMember ? "Animate this image" : "Go Pro to animate"}
            >
              <Play size={16} className={isProMember ? "text-gray-800" : "text-white"} />
            </button>
          )}
          
          {/* Edit button */}
          {onSendToEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onSendToEdit) {
                  const imageForEdit = typeof image === 'string' 
                    ? { url: image, width, height }
                    : { 
                        url: image.url || image,
                        width: image.width || width,
                        height: image.height || height
                      };
                  onSendToEdit(imageForEdit);
                }
              }}
              className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-[2px] transition-colors"
              title="Send to Edit"
            >
              <PencilRuler size={16} className="text-gray-800" />
            </button>
          )}
          
          <div className="relative">
            <button 
              ref={copyButtonRef}
              onClick={handleCopy}
              className={`p-2 rounded-lg ${copyInProgress ? 'bg-white' : 'bg-white/90 hover:bg-white'} shadow-md hover:shadow-lg backdrop-blur-[2px] transition-colors`}
              title="Copy Prompt"
              disabled={copyInProgress}
            >
              <Copy size={16} className="text-gray-800" />
            </button>
            {showCopyAnimation && (
              <CopyAnimation 
                isVisible={showCopyAnimation} 
                onAnimationComplete={handleAnimationComplete} 
              />
            )}
          </div>

          <button 
            onClick={handleDownload}
            className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-[2px] transition-colors"
            title="Download Image"
          >
            <Download size={16} className="text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );
});

ImageCard.displayName = 'ImageCard';

export default ImageCard;