import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Crown, Lock, ImageOff, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { assetCache } from '../utils/assetCache';

// Simple folder mapping for preview images
const getFolderName = (type) => {
  const folderMap = {
    style: 'styles',
    cameraAngle: 'camera-angles',
    cameraMovement: 'camera-movements',
    lighting: 'lighting',
    model: 'models',
    purpose: 'purposes',
    videoStyle: 'video-styles'
  };
  return folderMap[type] || type;
};

export const PreviewCard = ({
  label,
  value,
  type,
  isSelected,
  isPremium,
  isDisabled,
  onClick,
  className,
  inSidebar = false  // New prop to handle sidebar case
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPreviewPath = () => {
    if (value === 'not_specified') return null;
    const folder = getFolderName(type);
    return `/previews/${folder}/${value}-preview.png`;
  };

  const previewPath = getPreviewPath();

  // Load image using asset cache
  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!previewPath) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setImageError(false);
        
        const cachedUrl = await assetCache.getAsset(previewPath, {
          priority: isSelected ? 3 : (inSidebar ? 2 : 1)
        });
        
        if (isMounted) {
          setImageUrl(cachedUrl);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn(`Failed to load preview image: ${previewPath}`, error);
        if (isMounted) {
          setImageError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

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
          ) : imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover bg-[var(--dropdownBackground)]"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--dropdownBackground)] flex items-center justify-center flex-col gap-2">
              <ImageOff className="w-6 h-6 text-[var(--textSecondary)]" />
              <span className="text-[var(--textSecondary)] text-xs">No preview</span>
            </div>
          )}
          
          {/* Premium badge */}
          {/* Temporary "Free Premium" badge for Miniature Design */}
{type === 'purpose' && value === 'miniature_design' && (
   <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
   <Clock className="w-3 h-3" />
   <span>Free Premium</span>
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
      {value === 'realism' ? 'Photorealism' : label.replace(' (Premium)', '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </p>
    {isSelected && !inSidebar && (  // Only show Selected text when not in sidebar
      <span className="text-xs font-medium text-emerald-500">
        Selected
      </span>
    )}
  </div>
</div>
    </motion.div>
  );
};