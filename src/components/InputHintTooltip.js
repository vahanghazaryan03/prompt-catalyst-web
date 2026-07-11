import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

export const InputHintTooltip = ({ onDismiss, isVisible: externalIsVisible }) => {
  // Manage internal visibility state separately from permanent dismissal
  const [isVisible, setIsVisible] = useState(externalIsVisible !== undefined ? externalIsVisible : true);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(() => {
    return localStorage.getItem('inputHintSeen') === 'true';
  });
  
  // Update visibility when external prop changes
  useEffect(() => {
    if (externalIsVisible !== undefined) {
      setIsVisible(externalIsVisible);
    }
  }, [externalIsVisible]);

  // Handle temporary dismissal
  const handleTemporaryDismiss = (e) => {
    // Stop event propagation to prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsVisible(false);
    if (onDismiss) onDismiss(e);
  };
  
  // Handle permanent dismissal
  const handlePermanentDismiss = (e) => {
    // Stop event propagation to prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsVisible(false);
    setIsPermanentlyDismissed(true);
    localStorage.setItem('inputHintSeen', 'true');
    if (onDismiss) onDismiss(e);
  };

  // If permanently dismissed, don't show it
  if (isPermanentlyDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md mx-auto"
        >
          <div className="relative backdrop-blur-md bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 shadow-lg mb-6 w-full">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
                <span className="font-medium text-sm text-[var(--text)] whitespace-normal">Use short, descriptive phrases</span>
              </div>
              <button
                onClick={(e) => handlePermanentDismiss(e)}
                className="p-1 hover:bg-[var(--dropdownHover)] rounded-full text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors flex-shrink-0"
                title="Don't show again"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="mt-1.5 text-xs text-[var(--textSecondary)] pl-6 whitespace-normal">
              <p className="whitespace-normal break-words">Example: <span className="italic text-[var(--primary)]">sunset over mountains with a cabin</span></p>
              <p className="whitespace-normal break-words">Combine with sidebar settings for best results.
              Leave empty to use current settings.</p>
            </div>
            
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--background)] border-b border-r border-[var(--border)] transform rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Small indicator icon that can be added to the input
export const InputHintIndicator = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute left-12 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 transition-colors"
      title="Input field tips"
    >
      <HelpCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
    </button>
  );
};
