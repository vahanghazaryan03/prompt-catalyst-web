// src/components/animation/TrashView.js
import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RefreshCw, 
  Download, 
  ArrowUpRight,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Video,
  Tag,
  Search,
  Info,
  SlidersHorizontal,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import useAnimationStore from '../../contexts/AnimationStore';
import { formatDistanceToNow } from 'date-fns';
import { createFallbackThumbnail } from '../../utils/animationStorage';
// Lazy import for falMediaThumbnail when needed

const TrashView = ({ onRestore, onEmptyTrash, onDownload }) => {
  const { trashedAnimations, toggleTrashView } = useAnimationStore();
  const [isConfirmingRestore, setIsConfirmingRestore] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('animationHistoryViewMode') || 'grid';
  });
  const { addToast } = useToast();

  const handleRestore = (animation) => {
    if (typeof onRestore === 'function') {
      onRestore(animation.id);
     
    }
  };

  // Function to restore all animations from trash
  const handleRestoreAll = () => {
    if (typeof onRestore === 'function') {
      // Create a copy to avoid issues with the array changing during iteration
      const animationsToRestore = [...trashedAnimations];
      let restoreCount = 0;
      
      // Restore each animation
      animationsToRestore.forEach(animation => {
        onRestore(animation.id);
        restoreCount++;
      });
      
      setIsConfirmingRestore(false);
      addToast(`${restoreCount} animation${restoreCount !== 1 ? 's' : ''} restored`, 'success');
    }
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (trashedAnimations.length === 0) {
    return (
      <div className="text-center py-6 px-4">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={toggleTrashView}
              className="p-2 mr-2 text-white hover:text-blue-500 transition-colors"
              title="Return to animation history"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Trash2 size={20} className="mr-2" />
              Trash
            </h3>
          </div>
        </div>
        
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-neutral-800">
          <Trash2 size={32} className="text-neutral-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-white">Trash is empty</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Deleted animations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={toggleTrashView}
            className="p-2 mr-2 text-white hover:text-blue-500 transition-colors"
            title="Return to animation history"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Trash2 size={20} className="mr-2" />
            Trash
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setViewMode(viewMode === 'compact' ? 'grid' : 'compact');
              localStorage.setItem('animationHistoryViewMode', viewMode === 'compact' ? 'grid' : 'compact');
            }}
            className="p-1.5 mr-2 rounded-full hover:bg-[var(--border)] transition-colors"
            title={viewMode === 'compact' ? "Switch to grid view" : "Switch to list view"}
          >
            {viewMode === 'compact' ? 
              <SlidersHorizontal size={16} className="text-white" /> : 
              <List size={16} className="text-white"/>
            }
          </button>
          <button
            onClick={() => setIsConfirmingRestore(true)}
            className="px-3 py-1.5 text-xs rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
          >
            Restore All
          </button>
        </div>
      </div>

      {isConfirmingRestore && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start">
            <Info size={20} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white">
                Restore all animations?
              </h4>
              <p className="mt-1 text-xs text-neutral-400">
                This will restore all {trashedAnimations.length} animation{trashedAnimations.length !== 1 ? 's' : ''} to your history.
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleRestoreAll}
                  className="px-3 py-1.5 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Restore All
                </button>
                <button
                  onClick={() => setIsConfirmingRestore(false)}
                  className="px-3 py-1.5 text-xs rounded-md bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            <button 
              onClick={() => setIsConfirmingRestore(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {trashedAnimations.map((animation) => (
            <AnimationGridItem
              key={animation.id}
              animation={animation}
              onRestore={() => handleRestore(animation)}
              onDownload={() => onDownload && onDownload(animation)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {trashedAnimations.map((animation) => (
            <AnimationListItem
              key={animation.id}
              animation={animation}
              onRestore={() => handleRestore(animation)}
              onDownload={() => onDownload && onDownload(animation)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Grid Item component for animations - copied from AnimationHistory.js and modified for trash
const AnimationGridItem = ({ 
  animation, 
  onRestore, 
  onDownload
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  
  // Effect to handle thumbnail loading with fal.media support
  useEffect(() => {
    if (!animation) return;
    
    // Create a cleanup function for any created object URLs
    let objectUrl = null;
    
    const loadThumbnail = async () => {
      try {
        // Check if this is a fal.media URL and we have their special handler
        if (animation.url && animation.url.includes('fal.media')) {
          try {
            // Dynamically import the fal.media thumbnail generator to avoid loading it unnecessarily
            const { generateFalMediaThumbnail } = await import('../../utils/falMediaThumbnail');
            
            // Generate thumbnail from the video URL
            const thumbnail = await generateFalMediaThumbnail(animation.url, {
              width: 320,
              height: 180
            });
            
            if (thumbnail) {
              setThumbnailSrc(thumbnail);
              return; // Successfully generated thumbnail, exit early
            }
          } catch (falMediaError) {
            // Continue to fallback methods
          }
        }
        
        // Try to get the thumbnail from the animation object (standard approach)
        const source = animation.thumbnail || animation.thumbnailDataUrl;
        
        if (source) {
          // First, test if this is a data URL by checking the prefix
          if (source.startsWith('data:image/')) {
            // It's a data URL, we can use it directly
            setThumbnailSrc(source);
          } 
          // Check if it's a URL that needs to be fetched (not a data URL)
          else if (source.startsWith('http')) {
            // For network URLs, we'll create a new Image to test loading
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Create a Promise to handle the image loading
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              
              // Set timeout to avoid hanging
              const timeout = setTimeout(() => {
                reject(new Error('Thumbnail load timeout'));
              }, 5000);
              
              // Set the source to trigger loading
              img.src = source;
              
              // Cleanup timeout on success
              img.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
            });
            
            // If we get here, the image loaded successfully
            setThumbnailSrc(source);
          }
          else {
            // Neither a data URL nor a valid network URL, fallback
            throw new Error('Invalid thumbnail source format');
          }
        } else {
          // No thumbnail available at all
          throw new Error('No thumbnail source available');
        }
      } catch (error) {
        setThumbnailError(true);
        
        // Generate a fallback thumbnail
        try {
          // Use preset name if available, otherwise fall back to movement
          const text = animation?.presetName || animation?.movement || 'Animation';
          const fallbackThumbnail = createFallbackThumbnail(text, 320, 180);
          setThumbnailSrc(fallbackThumbnail);
        } catch (fallbackError) {
          // Silent error handling
        }
      }
    };
    
    // Start the thumbnail loading process
    loadThumbnail();
    
    // Cleanup function
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [animation]);
  
  // Create fallback thumbnail if there's an error or no thumbnail
  const handleThumbnailError = () => {
    setThumbnailError(true);
    
    // Generate a new fallback each time there's an error
    try {
      // Use preset name if available, otherwise fall back to movement
      const text = animation?.presetName || animation?.movement || 'Animation';
      
      // Create fallback with a unique timestamp to avoid caching issues
      const timestamp = Date.now();
      const fallbackThumbnail = createFallbackThumbnail(`${text} #${timestamp}`, 320, 180);
      
      // Short delay before setting new source to avoid potential loading loop
      setTimeout(() => {
        setThumbnailSrc(fallbackThumbnail);
      }, 100);
    } catch (error) {
      // Last resort - set a solid color placeholder with text
      try {
        const text = animation?.presetName || animation?.movement || 'Animation';
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="#232323"/><text x="160" y="90" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
        setThumbnailSrc(dataUrl);
      } catch (svgError) {
        setThumbnailSrc('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="%23333"/><text x="160" y="90" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Animation</text></svg>');
      }
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get animation display name (preferring newer preset fields)
  const getAnimationName = () => {
    // Use presetName if available, but for presets display their name as is
    if (animation.presetId && animation.movement) {
      return animation.movement; // Use movement as it now correctly holds the preset name
    }
    return animation.presetName || animation.movement || 'Unknown Animation';
  };
  
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#222] transition-colors cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div 
        className="w-full aspect-video bg-black relative flex items-center justify-center"
      >
        {thumbnailError || !thumbnailSrc ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111]">
            <Video size={24} className="text-[var(--textSecondary)] mb-1" />
            <span className="text-xs text-[var(--textSecondary)]">{getAnimationName()}</span>
          </div>
        ) : (
          <img
            src={thumbnailSrc}
            alt={getAnimationName()}
            className="w-full h-full object-contain bg-[#111]" 
            onError={handleThumbnailError}
            crossOrigin="anonymous"
          />
        )}
        
        {/* Category badge */}
        {animation.categoryName && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 text-xs bg-black/70 rounded-full">
            {animation.categoryName}
          </div>
        )}
        
        {/* Duration badge */}
        <div className="absolute bottom-1 right-1 flex space-x-1">
          <span className="px-1.5 py-0.5 text-xs bg-black/60 rounded text-white">
            {animation.duration}s
          </span>
        </div>
        
        {/* Play overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/90 flex items-center justify-center">
              <Play size={18} className="text-green-500 ml-0.5" />
            </div>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-2">
        <div className="flex items-center mb-1">
          <Video size={14} className="text-[var(--primary)] mr-1.5 flex-shrink-0" />
          <span className="text-sm font-medium text-[var(--text)] truncate">
            {getAnimationName()}
          </span>
        </div>
        <div className="flex items-center text-xs text-[var(--textSecondary)]">
          {animation.trashedAt ? `Moved to trash ${formatDistanceToNow(new Date(animation.trashedAt), { addSuffix: true })}` : formatDate(animation.timestamp)}

          {animation.prompt && (
            <span className="ml-2 truncate max-w-xs opacity-75" title={animation.prompt}>
              {animation.isPresetPrompt ? '• Using preset' : '• Custom prompt'}
            </span>
          )}
        </div>
      </div>
      
      {/* Actions - only visible on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1 right-1 flex gap-1 p-1 rounded bg-black/70"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onDownload === 'function') {
                  onDownload(animation);
                }
              }}
              className="p-1.5 rounded-full text-white hover:text-[var(--primary)] hover:bg-white/10 transition-colors"
              title="Download animation"
            >
              <Download size={14} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onRestore === 'function') {
                  onRestore(animation);
                }
              }}
              className="p-1.5 rounded-full text-white hover:text-blue-500 hover:bg-white/10 transition-colors"
              title="Restore animation"
            >
              <RotateCcw size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// List Item component for trash animations - copied from AnimationHistory.js and modified for trash
const AnimationListItem = ({ 
  animation, 
  onRestore, 
  onDownload
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  
  // Effect to handle thumbnail loading
  useEffect(() => {
    if (!animation) return;
    
    // Create a cleanup function for any created object URLs
    let objectUrl = null;
    
    const loadThumbnail = async () => {
      try {
        // Check if this is a fal.media URL and handle it specially
        if (animation.url && animation.url.includes('fal.media')) {
          try {
            // Dynamically import the fal.media thumbnail generator
            const { generateFalMediaThumbnail } = await import('../../utils/falMediaThumbnail');
            
            // Generate thumbnail directly from the video URL
            const thumbnail = await generateFalMediaThumbnail(animation.url, {
              width: 112,  // Smaller size for list view
              height: 63
            });
            
            if (thumbnail) {
              setThumbnailSrc(thumbnail);
              return; // Successfully generated thumbnail, exit early
            }
          } catch (falMediaError) {
            // Continue to fallback methods
          }
        }
        
        // Try to get the thumbnail from the animation object
        const source = animation.thumbnail || animation.thumbnailDataUrl;
        
        if (source) {
          // First, test if this is a data URL by checking the prefix
          if (source.startsWith('data:image/')) {
            // It's a data URL, we can use it directly
            setThumbnailSrc(source);
          } 
          // Check if it's a URL that needs to be fetched (not a data URL)
          else if (source.startsWith('http')) {
            // For network URLs, we'll create a new Image to test loading
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Create a Promise to handle the image loading
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              
              // Set timeout to avoid hanging
              const timeout = setTimeout(() => {
                reject(new Error('Thumbnail load timeout'));
              }, 5000);
              
              // Set the source to trigger loading
              img.src = source;
              
              // Cleanup timeout on success
              img.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
            });
            
            // If we get here, the image loaded successfully
            setThumbnailSrc(source);
          }
          else {
            // Neither a data URL nor a valid network URL, fallback
            throw new Error('Invalid thumbnail source format');
          }
        } else {
          // No thumbnail available at all
          throw new Error('No thumbnail source available');
        }
      } catch (error) {
        setThumbnailError(true);
        
        // Generate a fallback thumbnail
        try {
          const text = animation?.presetName || animation?.movement || 'Animation';
          const fallbackThumbnail = createFallbackThumbnail(text, 112, 63);
          setThumbnailSrc(fallbackThumbnail);
        } catch (fallbackError) {
          // Silent error handling
        }
      }
    };
    
    // Start the thumbnail loading process
    loadThumbnail();
    
    // Cleanup function
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [animation]);
  
  // Create fallback thumbnail if there's an error or no thumbnail
  const handleThumbnailError = () => {
    setThumbnailError(true);
    
    // Generate a fallback thumbnail
    try {
      const text = animation?.presetName || animation?.movement || 'Animation';
      const timestamp = Date.now();
      const fallbackThumbnail = createFallbackThumbnail(`${text} #${timestamp}`, 112, 63);
      setThumbnailSrc(fallbackThumbnail);
    } catch (error) {
      // Last resort - set a solid color placeholder with text
      try {
        const text = animation?.presetName || animation?.movement || 'Animation';
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="63" viewBox="0 0 112 63"><rect width="112" height="63" fill="#232323"/><text x="56" y="32" font-family="Arial" font-size="10" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
        setThumbnailSrc(dataUrl);
      } catch (svgError) {
        // Silent error handling - use default svg
        setThumbnailSrc('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="112" height="63" viewBox="0 0 112 63"><rect width="112" height="63" fill="%23333"/><text x="56" y="32" font-family="Arial" font-size="8" fill="white" text-anchor="middle">Animation</text></svg>');
      }
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get animation display name (preferring newer preset fields)
  const getAnimationName = () => {
    // Use presetName if available, but for presets display their name as is
    if (animation.presetId && animation.movement) {
      return animation.movement; // Use movement as it now correctly holds the preset name
    }
    return animation.presetName || animation.movement || 'Unknown Animation';
  };
  
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg border border-[#333] bg-[#1a1a1a] hover:bg-[#222] transition-colors cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-16 rounded overflow-hidden bg-black flex-shrink-0">
        {thumbnailError || !thumbnailSrc ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111]">
            <Video size={20} className="text-[var(--textSecondary)]" />
            <span className="text-xs text-[var(--textSecondary)] mt-1">{getAnimationName()}</span>
          </div>
        ) : (
          <img
            src={thumbnailSrc}
            alt={getAnimationName()}
            className="w-full h-full object-contain bg-[#111]" 
            onError={handleThumbnailError}
            crossOrigin="anonymous"
          />
        )}
        
        {/* Duration and resolution badges */}
        <div className="absolute bottom-1 right-1 flex space-x-1">
          <span className="px-1.5 py-0.5 text-xs bg-black/60 rounded text-white">
            {animation.duration}s
          </span>
        </div>
        
        {/* Play overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Play size={18} className="text-green-500" />
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <Video size={14} className="text-[var(--primary)] mr-1.5 flex-shrink-0" />
          <span className="text-sm font-medium text-[var(--text)] truncate">
            {getAnimationName()}
          </span>
          
          {/* Category tag - only if available */}
          {animation.categoryName && (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-[#333] rounded-full text-white/70 flex items-center">
                  <Tag size={10} className="mr-1" />
                  {animation.categoryName}
              </span>
          )}
        </div>
        
        <div className="flex items-center mt-1 text-xs text-[var(--textSecondary)]">
          <span>{animation.trashedAt ? `Moved to trash ${formatDistanceToNow(new Date(animation.trashedAt), { addSuffix: true })}` : formatDate(animation.timestamp)}</span>
          
          {animation.prompt && (
            <span className="ml-2 truncate max-w-xs opacity-75" title={animation.prompt}>
              {animation.isPresetPrompt ? '• Using preset' : '• Custom prompt: ' + animation.prompt.substring(0, 30) + (animation.prompt.length > 30 ? '...' : '')}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isHovered ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--textSecondary)]'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onDownload === 'function') {
              onDownload(animation);
            }
          }}
          title="Download animation"
        >
          <Download size={14} />
        </button>
        
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isHovered ? 'text-blue-500 bg-blue-500/10' : 'text-[var(--textSecondary)]'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onRestore === 'function') {
              onRestore(animation);
            }
          }}
          title="Restore animation"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};

export default TrashView;