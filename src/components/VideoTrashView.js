// src/components/VideoTrashView.js
import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw, ArrowLeft, Video, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useVideoStore from '../contexts/VideoStore';
import { useToast } from '../contexts/ToastContext';

// Component for displaying a video card in the trash
const TrashedVideoCard = ({ video, onRestore, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format the trashed date
  const formatTrashedDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
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
      return `${date.toLocaleDateString(undefined, { weekday: 'short' })}`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded-lg overflow-hidden border border-red-500/30 hover:border-red-500/50 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
                <Video className="text-[var(--textSecondary)]" size={32} />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-[var(--background)]/80 flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button
                  onClick={() => onRestore(video.id)}
                  className="px-3 py-1.5 bg-[var(--primary)] text-black rounded-md font-medium text-sm"
                >
                  Restore
                </button>
                <button
                  onClick={() => onDownload(video)}
                  className="px-3 py-1.5 bg-[var(--cardBackground)]/90 text-[var(--text)] rounded-md font-medium text-sm border border-[var(--border)]"
                >
                  Download
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-red-900/20">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        )}
        
        {/* Video duration label */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-[var(--background)]/80 text-[var(--text)] text-xs font-medium border border-[var(--border)]">
          {video.duration || '5'}s
        </div>
        
        {/* Trash indicator */}
        <div className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white">
          <Trash2 size={12} />
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
            <Trash2 size={10} />
            <span>Deleted {formatTrashedDate(video.trashedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Video size={10} />
            <span>{video.resolution || '720p'} • {video.model || video.aiModel || 'Seedance 1.0'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main VideoTrashView component
const VideoTrashView = ({ onRestore, onEmptyTrash, onDownload }) => {
  const { trashedVideos, toggleTrashView } = useVideoStore();
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Handle restore video
  const handleRestore = (id) => {
    onRestore(id);
  };
  
  // Handle empty trash with confirmation
  const handleEmptyTrash = () => {
    // If already in deleting state, confirm the action
    if (isDeleting) {
      onEmptyTrash();
      addToast('Trash emptied successfully', 'success');
      setIsDeleting(false);
    } else {
      // First click - show confirmation UI
      setIsDeleting(true);
      
      // Auto-reset after 5 seconds
      setTimeout(() => {
        setIsDeleting(false);
      }, 5000);
    }
  };
  
  // Handle exit trash view
  const handleExitTrash = () => {
    toggleTrashView();
  };
  
  // If trash is empty, show empty state
  if (trashedVideos.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)] text-center">
        <div className="flex flex-col items-center">
          <Trash2 size={32} className="text-[var(--textSecondary)] mb-3" />
          <h3 className="text-[var(--text)] font-medium mb-2">Trash is Empty</h3>
          <p className="text-[var(--textSecondary)] text-sm max-w-md mx-auto mb-4">
            Deleted videos will appear here.
          </p>
          <button
            onClick={handleExitTrash}
            className="px-4 py-2 bg-[var(--inputBackground)] text-[var(--text)] rounded-md font-medium text-sm flex items-center gap-2 border border-[var(--border)] hover:bg-[var(--dropdownHover)]"
          >
            <ArrowLeft size={14} />
            Back to History
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      {/* Trash header with actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExitTrash}
            className="p-1.5 rounded-full text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] transition-colors"
            title="Back to history"
          >
            <ArrowLeft size={16} />
          </button>
          <h3 className="text-[var(--text)] font-medium flex items-center gap-2">
            <Trash2 size={16} className="text-red-500" />
            <span>Trash</span>
            <span className="text-xs text-[var(--textSecondary)]">({trashedVideos.length} item{trashedVideos.length !== 1 ? 's' : ''})</span>
          </h3>
        </div>
        
        <button
          onClick={handleEmptyTrash}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            isDeleting 
              ? 'bg-red-600 text-white'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          } transition-colors`}
        >
          {isDeleting ? (
            <>
              <span>Confirm Empty</span>
            </>
          ) : (
            <>
              <span>Empty Trash</span>
            </>
          )}
        </button>
      </div>
      
      {/* Warning message */}
      <div className="mx-4 mb-4 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[var(--text)] mb-1">Videos in trash will be permanently deleted in 30 days.</p>
            <p className="text-xs text-[var(--textSecondary)]">You can restore videos back to your history or download them before they're permanently deleted.</p>
          </div>
        </div>
      </div>
      
      {/* Trashed videos grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
        <AnimatePresence>
          {trashedVideos.map(video => (
            <TrashedVideoCard
              key={video.id}
              video={video}
              onRestore={handleRestore}
              onDownload={onDownload}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoTrashView;