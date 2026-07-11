// src/components/VideoGenerateHistoryContainer.js
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, HistoryIcon, RefreshCw, Video, Clock, Calendar, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoHistory } from '../hooks/useVideoHistory';
import useVideoStore from '../contexts/VideoStore';
import { useToast } from '../contexts/ToastContext';
import { createVideoThumbnail, createFallbackThumbnail, compressDataUrl } from '../utils/animationStorage';
import VideoTrashView from './VideoTrashView';

// Component for displaying a video card in the history
const VideoCard = ({ video, onSelect, onDelete, onDownload, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoRef = useRef(null);
  
  // Format the date to show only what's needed
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    // If less than 24 hours, show relative time
    if (diffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diffMs / (60 * 60 * 1000));
      if (hours === 0) {
        const minutes = Math.floor(diffMs / (60 * 1000));
        return minutes === 0 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    
    // If less than 7 days, show day of week
    if (diffMs < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  // Generate or load thumbnail when component mounts
  useEffect(() => {
    if (!video || !video.videoUrl) return;
    
    // Check if video already has a thumbnail
    if (video.thumbnail) {
      setThumbnailSrc(video.thumbnail);
      return;
    }
    
    // Function to create thumbnail from video
    const generateThumbnail = async () => {
      setIsThumbnailLoading(true);
      try {
        // Create a hidden video element if it doesn't exist
        if (!videoRef.current) {
          videoRef.current = document.createElement('video');
          videoRef.current.style.display = 'none';
          document.body.appendChild(videoRef.current);
        }
        
        // Load the video
        videoRef.current.crossOrigin = 'anonymous';
        videoRef.current.src = video.videoUrl;
        videoRef.current.muted = true; // Important for autoplay

        // Wait for the video to load enough data
        await new Promise((resolve) => {
          videoRef.current.onloadeddata = resolve;
          // Set a timeout in case the video doesn't load
          const timeout = setTimeout(resolve, 5000);
          
          // Start loading
          videoRef.current.load();
          
          // Clean up timeout on success
          videoRef.current.onloadeddata = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        
        // Seek to a specific point in the video for the thumbnail
        videoRef.current.currentTime = Math.min(parseFloat(video.duration) / 3, 2);
        
        // Wait for seeking to complete
        await new Promise((resolve) => {
          videoRef.current.onseeked = resolve;
          // Set a timeout in case seeking doesn't complete
          const timeout = setTimeout(resolve, 5000);
          
          // Clean up timeout on success
          videoRef.current.onseeked = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        
        // Generate thumbnail
        let thumbnail = await createVideoThumbnail(videoRef.current, 320, 180);
        
        // Compress the thumbnail to save storage space
        if (thumbnail && thumbnail.length > 20000) {
          try {
            thumbnail = await compressDataUrl(thumbnail, 0.6, 320, 180);
          } catch (compressionError) {
            console.warn('Failed to compress thumbnail:', compressionError);
          }
        }
        
        // Save the thumbnail in the video object
        if (thumbnail) {
          setThumbnailSrc(thumbnail);
          
          // Store the thumbnail in localStorage for future use
          try {
            // Get existing video history
            const videoHistory = JSON.parse(localStorage.getItem('text_to_video_history') || '[]');
            
            // Find the video and update its thumbnail
            const updatedHistory = videoHistory.map(v => {
              if (v.id === video.id) {
                return { ...v, thumbnail };
              }
              return v;
            });
            
            // Save back to localStorage
            localStorage.setItem('text_to_video_history', JSON.stringify(updatedHistory));
            
            // Also update the video in the global store if it matches
            const currentVideo = useVideoStore.getState().generatedVideo;
            if (currentVideo && currentVideo.id === video.id) {
              useVideoStore.getState().setGeneratedVideo({
                ...currentVideo,
                thumbnail
              });
            }
          } catch (storageError) {
            console.warn('Failed to save thumbnail to history:', storageError);
          }
        } else {
          throw new Error('Failed to create thumbnail');
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        setThumbnailError(true);
        
        // Create a fallback thumbnail with video prompt text
        const fallbackText = video.prompt ? video.prompt.substring(0, 30) : 'Video';
        const fallback = createFallbackThumbnail(fallbackText, 320, 180);
        setThumbnailSrc(fallback);
      } finally {
        setIsThumbnailLoading(false);
        
        // Clean up the video element
        if (videoRef.current) {
          videoRef.current.pause();
          try {
            videoRef.current.src = '';
            document.body.removeChild(videoRef.current);
            videoRef.current = null;
          } catch (e) {}
        }
      }
    };
    
    generateThumbnail();
  }, [video]);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-[var(--primary)] shadow-lg' : 'hover:shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(video)}
    >
      {/* Video Thumbnail */}
      <div className="aspect-video bg-[var(--inputBackground)] relative">
        {video.videoUrl ? (
          <>
            {/* Play video on hover */}
            {isHovered ? (
              <video 
                className="w-full h-full object-cover"
                src={video.videoUrl}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--cardBackground)] border border-[var(--border)]">
                {isThumbnailLoading ? (
                  <Loader className="text-[var(--textSecondary)] animate-spin" size={32} />
                ) : thumbnailSrc ? (
                  <img 
                    src={thumbnailSrc} 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                    onError={() => setThumbnailError(true)}
                  />
                ) : (
                  <Video className="text-[var(--textSecondary)]" size={32} />
                )}
              </div>
            )}
            
            {/* Overlay for video details */}
            <div className="absolute inset-0 bg-[var(--background)]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <div className="flex justify-end">
                {/* Video actions */}
                <div className="space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(video);
                    }}
                    className="p-1.5 rounded-full bg-[var(--cardBackground)]/90 text-[var(--text)] hover:bg-[var(--dropdownHover)] transition-colors border border-[var(--border)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(video.id);
                    }}
                    className="p-1.5 rounded-full bg-[var(--cardBackground)]/90 text-[var(--text)] hover:bg-red-500/90 hover:text-white transition-colors border border-[var(--border)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                {/* Video details */}
                <div className="text-xs text-[var(--text)]/80">
                  {/* Always use server model field first, then fall back to aiModel */}
                  {video.duration || '5'}s • {video.resolution || '720p'} • {video.model || video.aiModel || 'Seedance 1.0'}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-red-500/20">
            <AlertCircle className="text-red-500" size={32} />
          </div>
        )}
        
        {/* Video duration label */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-[var(--background)]/80 text-[var(--text)] text-xs font-medium border border-[var(--border)]">
          {video.duration || '5'}s
        </div>
      </div>
      
      {/* Video details */}
      <div className="p-2 bg-[var(--cardBackground)] border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text)] line-clamp-2 mb-1 h-8 overflow-hidden">
          {video.prompt?.substring(0, 60) || "Text-to-Video Generation"}
          {video.prompt?.length > 60 ? "..." : ""}
        </p>
        
        <div className="flex items-center justify-between text-[10px] text-[var(--textSecondary)]">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{formatDate(video.timestamp)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Video size={10} />
            <span>{video.resolution || '720p'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main VideoGenerateHistoryContainer component
const VideoGenerateHistoryContainer = ({ 
  onSelect, 
  onDownload,
  currentVideoId,
  onProUpgradeClick,
  isProMember,
  isGenerating
}) => {
  const { history, loading, error, refreshHistory, deleteVideo } = useVideoHistory();
  const { toggleTrashView, isTrashOpen, trashedVideos, restoreFromTrash, emptyTrash } = useVideoStore();
  const { addToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshHistory();
      addToast('Video history refreshed', 'success');
    } catch (error) {
      addToast('Failed to refresh history', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle trash button click
  const handleTrashClick = () => {
    toggleTrashView();
  };
  
  // Handle delete video
  const handleDeleteVideo = (id) => {
    deleteVideo(id);
    addToast('Video moved to trash', 'success');
  };
  
  // Handle restore from trash
  const handleRestoreFromTrash = (id) => {
    restoreFromTrash(id);
    refreshHistory(); // Refresh to show the restored video
    addToast('Video restored from trash', 'success');
  };
  
  // Handle empty trash
  const handleEmptyTrash = () => {
    emptyTrash();
    addToast('Trash emptied successfully', 'success');
  };
  
  // If in trash view, show trash component
  if (isTrashOpen) {
    return (
      <VideoTrashView
        onRestore={handleRestoreFromTrash}
        onEmptyTrash={handleEmptyTrash}
        onDownload={onDownload}
      />
    );
  }
  
  // If no videos and not loading, show empty state
  if (!loading && history.length === 0 && !error) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)] text-center">
        <div className="flex flex-col items-center">
          <HistoryIcon size={32} className="text-[var(--textSecondary)] mb-3" />
          <h3 className="text-[var(--text)] font-medium mb-2">No Video History</h3>
          <p className="text-[var(--textSecondary)] text-sm max-w-md mx-auto mb-4">
            Generated videos will appear here. Create your first video by entering a prompt and clicking Generate.
          </p>
          {!isProMember && (
            <button
              onClick={() => onProUpgradeClick('pro')}
              className="px-4 py-2 bg-blue-500 text-black rounded-md font-medium text-sm"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error && !loading && history.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)] text-center">
        <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
        <h3 className="text-[var(--text)] font-medium mb-2">Failed to Load History</h3>
        <p className="text-[var(--textSecondary)] text-sm mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-[var(--inputBackground)] text-[var(--text)] rounded-md font-medium text-sm flex items-center gap-2 mx-auto border border-[var(--border)] hover:bg-[var(--dropdownHover)]"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      {/* History header with actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-[var(--text)] font-medium flex items-center gap-2">
          <HistoryIcon size={16} className="text-[var(--primary)]" />
          <span>Video History</span>
          {loading && <RefreshCw size={14} className="text-[var(--textSecondary)] animate-spin ml-2" />}
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] transition-colors"
            disabled={isRefreshing || loading}
            title="Refresh history"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={handleTrashClick}
            className={`hidden p-2 rounded-full ${  // Added 'hidden' class to hide the button
              isTrashOpen 
                ? 'text-red-400 hover:text-red-300'
                : 'text-[var(--textSecondary)] hover:text-[var(--text)]'
            } hover:bg-[var(--dropdownHover)] transition-colors`}
            title={isTrashOpen ? "Exit trash" : "View trash"}
          >
            <Trash2 size={16} />
            {trashedVideos.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {trashedVideos.length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Video grid */}
      {history.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
          <AnimatePresence>
            {history.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelect}
                onDelete={handleDeleteVideo}
                onDownload={onDownload}
                isSelected={video.id === currentVideoId}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center p-12">
          <RefreshCw size={24} className="text-[var(--textSecondary)] animate-spin" />
        </div>
      ) : (
        <div className="p-8 text-center text-[var(--textSecondary)]">
          No videos found. Generate your first video!
        </div>
      )}
    </div>
  );
};

export default VideoGenerateHistoryContainer;