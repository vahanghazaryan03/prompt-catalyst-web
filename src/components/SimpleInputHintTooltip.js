import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Cat, Terminal } from 'lucide-react';

const SimpleInputHintTooltip = ({ isVisible, onDismiss }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay that captures taps outside the tooltip */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 z-40"
            onClick={onDismiss}
          />
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ 
              type: "tween",
              duration: 0.2, 
              ease: "easeOut"
            }}
            className="fixed z-50 
                      sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:bottom-28 sm:w-[85vw] sm:max-w-[360px] sm:w-[75vw] sm:max-w-[420px]
                      left-4 right-4 bottom-20 top-auto w-auto max-w-none"
          >
            <div className="bg-[var(--background)] rounded-lg shadow-lg border border-[var(--border)] p-3 sm:p-4 relative">
              {/* Header */}
              <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                <div className="flex items-center">
                  <Cat className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--primary)] mr-1.5 sm:mr-2" />
                  <h3 className="font-medium text-sm sm:text-base text-[var(--text)]">Input Tips</h3>
                </div>
                {/* Larger, more visible close button */}
                <button
                  onClick={onDismiss}
                  className="text-[var(--textSecondary)] hover:text-[var(--text)] bg-[var(--dropdownHover)]/50 hover:bg-[var(--dropdownHover)] rounded-full p-1.5 transition-colors flex items-center justify-center"
                  aria-label="Close tooltip"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Content - responsive sizing for different screens */}
              <div className="text-xs sm:text-sm text-[rgb(170,170,170)]">
                <p className="mb-1 sm:mb-2">Use short, descriptive phrases like:</p>
                <p className="mb-1.5 "><span className="italic text-[var(--primary)]">person, smiling, sunset</span></p>
                <p className="text-xs sm:text-sm sm:mb-3">Combine with sidebar settings for best results, or leave empty to generate prompts using the current settings.</p>
              </div>
              
              {/* Arrow - show for all screens but positioned differently */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-4 h-4 sm:w-5 sm:h-5 bg-[var(--background)] border-r border-b border-[var(--border)]"></div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SimpleInputHintTooltip;