import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Info } from 'lucide-react';

const InputLengthWarning = ({ isVisible, onDismiss, currentLength, recommendedLength, maxLength }) => {
  // Don't render anything if not visible
  if (!isVisible) return null;

  const percentageOfRecommended = Math.min(100, Math.round((currentLength / recommendedLength) * 100));
  const percentageOfMax = Math.min(100, Math.round((currentLength / maxLength) * 100));
  
  const isNearRecommended = currentLength >= recommendedLength * 0.9;
  const isOverRecommended = currentLength > recommendedLength;
  const isNearMax = currentLength >= maxLength * 0.9;

  // Icon and color logic
  const icon = isOverRecommended ? <AlertTriangle /> : <Info />;
  const iconColor = isNearMax ? 'text-red-500' : isOverRecommended ? 'text-amber-500' : 'text-blue-500';
  const bgColor = isNearMax ? 'bg-red-50 dark:bg-red-900/20' : 
                isOverRecommended ? 'bg-amber-50 dark:bg-amber-900/20' : 
                'bg-blue-50 dark:bg-blue-900/20';
  const borderColor = isNearMax ? 'border-red-300 dark:border-red-700' : 
                     isOverRecommended ? 'border-amber-300 dark:border-amber-700' : 
                     'border-blue-300 dark:border-blue-700';
  const textColor = isNearMax ? 'text-red-800 dark:text-red-200' : 
                   isOverRecommended ? 'text-amber-800 dark:text-amber-200' : 
                   'text-blue-800 dark:text-blue-200';
  
  // Progress bar
  const progressBarBase = isOverRecommended ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-800/30';
  const progressBarFill = isNearMax ? 'bg-red-500' : 
                         isOverRecommended ? 'bg-amber-500' : 
                         'bg-blue-500';

  return (
    <AnimatePresence>
      {/* Overlay to catch taps outside the warning */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/10 z-40"
        onClick={onDismiss}
      />
      <motion.div
        key="warning"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed left-1/2 transform -translate-x-1/2 md:bottom-28 bottom-[5.5rem] z-50 w-[85vw] max-w-[360px] sm:w-[75vw] sm:max-w-[420px]"
      >
        <div className={`rounded-lg shadow-lg border p-3 sm:p-4 relative ${bgColor} ${borderColor}`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-1.5 sm:mb-2">
            <div className="flex items-center">
              <div className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 ${iconColor}`}>{icon}</div>
              <h3 className={`font-medium text-sm sm:text-base ${textColor}`}>
                {isNearMax ? 'Input too long' : 
                 isOverRecommended ? 'Shorten input' : 
                 'Length suggestion'}
              </h3>
            </div>
            {/* More visible close button */}
            <button
              onClick={onDismiss}
              className={`bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-1.5 transition-colors ${textColor} flex items-center justify-center`}
              aria-label="Close warning"
            >
              <X className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </button>
          </div>
          
          {/* Content - mobile optimized but larger on desktop */}
          <div className={`text-xs sm:text-sm ${textColor}`}>
            <p className="mb-1.5 sm:mb-2">
              {isOverRecommended ? (
                isNearMax ? (
                  `${currentLength}/${maxLength} chars. Approaching limit.`
                ) : (
                  `${currentLength} chars. ${Math.round((currentLength / recommendedLength - 1) * 100)}% over recommended.`
                )
              ) : (
                `${currentLength}/${recommendedLength} chars (${percentageOfRecommended}%).`
              )}
            </p>
            <p className="text-xs sm:text-sm">
              {isNearMax ? 
                `${maxLength} char limit. Please shorten text.` :
               isOverRecommended ? 
                `Shorter prompts work better. Try being more concise.` :
                `Aim for under ${recommendedLength} chars for best results.`}
            </p>
          </div>
          
          {/* Progress bar - smaller for mobile, slightly larger for desktop */}
          <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 rounded-full overflow-hidden relative">
            {/* Base progress bar showing % of recommended (only visible when under recommended) */}
            {!isOverRecommended && (
              <div className={`h-full w-full ${progressBarBase} rounded-full`}>
                <div 
                  className={`h-full rounded-full ${progressBarFill}`}
                  style={{ width: `${percentageOfRecommended}%` }}
                ></div>
              </div>
            )}
            
            {/* When over recommended, show progress toward max limit */}
            {isOverRecommended && (
              <div className={`h-full w-full ${progressBarBase} rounded-full`}>
                <div 
                  className={`h-full rounded-full ${progressBarFill}`}
                  style={{ width: `${percentageOfMax}%` }}
                ></div>
              </div>
            )}
          </div>
          
          {/* Arrow */}
          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-4 h-4 sm:w-5 sm:h-5 border-r border-b ${bgColor} ${borderColor}`}></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InputLengthWarning;