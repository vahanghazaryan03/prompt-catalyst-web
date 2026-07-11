import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import useAnimationStore from '../contexts/AnimationStore';

export const AnimationStatusIndicator = ({ onReturn }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Get animation status from the store
  const { isGenerating, progress } = useAnimationStore(state => ({
    isGenerating: state.isGenerating,
    progress: state.progress
  }));
  
  // Get the generation start time
  const generationStartedTime = useAnimationStore(state => state.generationStartedTime);
  
  // Update the time elapsed every second
  useEffect(() => {
    if (!isGenerating || !generationStartedTime) return;
    
    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - parseInt(generationStartedTime)) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isGenerating, generationStartedTime]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // If not generating or not visible, don't show
  if (!isGenerating || !isVisible) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 right-4 z-50 shadow-xl"
    >
      <div className="bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg shadow-md flex items-center overflow-hidden hover:border-[var(--primary)]/50 transition-colors duration-200">
        <div className="flex items-center gap-2 p-3 bg-[var(--primary)]/10">
          <div className="relative">
            <Film size={18} className="text-[var(--primary)]" />
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--primary)] rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[var(--text)]">Animation in progress</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--textSecondary)]">{formatTime(timeElapsed)}</span>
              {progress > 0 && (
                <>
                  <span className="text-xs text-[var(--textSecondary)]">•</span>
                  <span className="text-xs text-[var(--textSecondary)]">{Math.round(progress)}%</span>
                </>
              )}
              {progress === 0 && (
                <Loader2 size={10} className="animate-spin text-[var(--textSecondary)]" />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <button 
            className="px-3 py-2 hover:bg-[var(--primary)]/5 transition-colors flex items-center gap-1"
            onClick={onReturn}
            title="Return to animation"
          >
            <span className="text-xs text-[var(--textSecondary)]">Return</span>
            <ArrowRight size={14} className="text-[var(--textSecondary)]" />
          </button>
          
          <button 
            className="px-3 py-2 hover:bg-red-500/10 transition-colors"
            onClick={() => setIsVisible(false)}
            title="Hide notification"
          >
            <XCircle size={14} className="text-[var(--textSecondary)]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimationStatusIndicator;