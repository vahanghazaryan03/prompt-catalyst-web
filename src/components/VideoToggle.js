import React from 'react';
import { Clapperboard as Film, Image } from 'lucide-react';
import { motion } from 'framer-motion';

const VideoToggle = ({ isVideoMode, onToggle }) => {
  return (
    <div className="flex items-center px-1 py-0.5 rounded-lg">
      <button 
        onClick={() => !isVideoMode || onToggle()}
        className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
          !isVideoMode ? 'text-[var(--primary)]' : 'text-[var(--textSecondary)] hover:text-[var(--text)]'
        }`}
        title="Image Mode"
      >
        <Image className="h-5 w-5" />
        
        {!isVideoMode && (
          <motion.div 
            layoutId="mode-indicator"
            className="absolute bottom-0 w-4 h-0.5 bg-[var(--primary)] rounded-full"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          />
        )}
      </button>
      
      <div className="mx-1 h-4 w-px bg-[var(--border)]" />
      
      <button 
        onClick={() => isVideoMode || onToggle()}
        className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
          isVideoMode ? 'text-[var(--primary)]' : 'text-[var(--textSecondary)] hover:text-[var(--text)]'
        }`}
        title="Video Mode"
      >
        <Film className="h-5 w-5" />
        
        {isVideoMode && (
          <motion.div 
            layoutId="mode-indicator"
            className="absolute bottom-0 w-4 h-0.5 bg-[var(--primary)] rounded-full"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          />
        )}
      </button>
    </div>
  );
};

export default VideoToggle;