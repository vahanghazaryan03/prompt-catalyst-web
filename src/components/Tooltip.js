import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export const Tooltip = ({ content, children, compact = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Container for the icon */}
      <div className="relative"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          // Wrapper div for translation:
          <div className="absolute bottom-full left-0 -translate-x-[2px] mb-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              // Apply absolute positioning here:
              className={`absolute bottom-full left-0 text-sm bg-[var(--cardBackground)] border border-[var(--border)] rounded-md shadow-lg z-[60] ${
                compact 
                  ? 'px-3 py-2 whitespace-nowrap'
                  : 'px-4 py-3 whitespace-normal min-w-[280px] max-w-[400px]'
              }`}
            >
              <div className={`text-[var(--text)] ${compact ? '' : 'leading-6'}`}>{content}</div>
              {/* Arrow */}
              <div
                className="absolute top-full left-4 -translate-y-[45%] w-2 h-2 bg-[var(--cardBackground)] border-r border-b border-[var(--border)] rotate-45"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};