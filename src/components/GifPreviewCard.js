import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Crown, Lock, ImageOff, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { assetCache } from '../utils/assetCache';
import { logger } from '../utils/logger';

// Renamed component but kept original name for backward compatibility
export const GifPreviewCard = ({
  label,
  value,
  type,
  isSelected,
  isPremium,
  isDisabled,
  onClick,
  className,
  inSidebar = false, // Add inSidebar prop for consistency with PreviewCard
  multiSelect = false
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoSrc, setVideoSrc] = useState(null);
  
  const getPreviewPath = () => {
    const baseUrl = '/previews';
    const typeMap = {
      videoStyle: 'video-styles',
      cameraMovement: 'camera-movements',
      cameraDirection: 'camera-directions',
      pacing: 'pacing',
      specialEffects: 'special-effects',
      'special-effects': 'special-effects', // Add additional mapping for hyphenated versions
      'special_effects': 'special-effects'
    };
    
    // Get the appropriate directory for this type
    const directory = typeMap[type];
    if (!directory) {
      // Fallback to a guess based on the type name
      const fallbackDir = type.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      return `${baseUrl}/${fallbackDir}/${value}-preview.webm`;
    }
    
    // Convert camelCase or underscore to hyphenated format
    const hyphenatedValue = value
      .replace(/_/g, '-') // Replace underscores with hyphens
      .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to hyphenated
      .toLowerCase();
    
    // Standard preview path without thumbnails
    const fileName = `${hyphenatedValue}-preview.webm`;
    const fullPath = `${baseUrl}/${directory}/${fileName}`;
    
    return fullPath;
  };

  // For "not_specified" values, don't try loading a video - just use placeholder
  // For other values, use the function to get the path
  let previewPath = null;
  if (value !== 'not_specified' && value !== 'not-specified') {
    previewPath = getPreviewPath();
  }
  
  // Load video using asset cache
  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      if (!previewPath) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setVideoError(false);
        
        const cachedUrl = await assetCache.getAsset(previewPath, {
          priority: isSelected ? 3 : (inSidebar ? 2 : 1)
        });
        
        if (isMounted) {
          setVideoSrc(cachedUrl);
          setIsLoading(false);
        }
      } catch (error) {
        logger.warn(`Failed to load preview video: ${previewPath}`, error);
        if (isMounted) {
          setVideoError(true);
          setIsLoading(false);
        }
      }
    };

    // Reset state when value changes
    setVideoError(false);
    setIsLoading(true);
    
    loadVideo();

    return () => {
      isMounted = false;
    };
  }, [previewPath, isSelected, inSidebar]);

  // Add handler to explicitly handle click
  const handleClick = (e) => {
    if (!isDisabled && onClick) {
      e.stopPropagation(); // Prevent event bubbling
      onClick();
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={classNames(
        'relative w-full bg-[var(--cardBackground)] rounded-xl overflow-hidden',
        'transition-colors duration-200',
        'focus:outline-none',
        {
          'border-2 border-emerald-500': isSelected && !inSidebar, // Only show green border when not in sidebar
          'opacity-75 cursor-not-allowed': isDisabled,
          'cursor-pointer border-2 border-transparent': !isDisabled && !isSelected,
        },
        className
      )}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
          onClick?.();
        }
      }}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <div className={`relative ${inSidebar ? 'pt-[50%]' : 'pt-[65%]'}`}>
          {isLoading ? (
            <div className="absolute inset-0 bg-[var(--dropdownBackground)] flex items-center justify-center flex-col gap-2">
              <div className="w-5 h-5 border-2 border-[var(--textSecondary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[var(--textSecondary)] text-xs">Loading</span>
            </div>
          ) : videoSrc && !videoError ? (
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover bg-[var(--dropdownBackground)]"
              onError={(e) => {
                logger.warn(`Video error for ${videoSrc}`);
                setVideoError(true);
              }}
            />
          ) : (!isLoading && (videoError || !previewPath || value === 'not_specified' || value === 'not-specified')) && (
            <div className="absolute inset-0 bg-[var(--dropdownBackground)] flex items-center justify-center flex-col gap-2">
              {value === 'not_specified' || value === 'not-specified' ? (
                <>
                  <span className={`${inSidebar ? 'text-sm' : 'text-base'} font-medium text-[var(--textSecondary)]`}>
                    Default
                  </span>
                  <span className="text-[var(--textSecondary)] text-xs">
                    No Style Applied
                  </span>
                </>
              ) : (
                <>
                  <ImageOff className={`${inSidebar ? 'w-4 h-4' : 'w-6 h-6'} text-[var(--textSecondary)]`} />
                  <span className="text-[var(--textSecondary)] text-xs">
                    {inSidebar ? label : "No preview"}
                  </span>
                </>
              )}
            </div>
          )}
          
         
          {/* Disabled overlay */}
          {isDisabled && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Lock className="w-6 h-6 text-white/90" />
                <span className="text-xs text-white/90 font-medium">Unlocks with Membership</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${inSidebar ? 'p-2' : 'p-3'} border-t border-[var(--border)] bg-[var(--cardBackground)]`}>
        <div className="flex items-center justify-between">
          <p className={`${inSidebar ? 'text-xs' : 'text-sm'} font-medium text-[var(--text)]`}>
            {label.replace(' (Premium)', '')}
          </p>
          {isSelected && !inSidebar && !multiSelect && (  // Only show Selected text when not in sidebar or multi-select mode
            <span className="text-xs font-medium text-emerald-500">
              Selected
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};