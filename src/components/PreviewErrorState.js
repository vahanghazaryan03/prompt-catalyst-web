import React from 'react';
import { Cat } from 'lucide-react';
import { motion } from 'framer-motion';

const errorMessages = [
  "Oops! Our preview cat is taking a quick break.",
  "Technical hiccup! Our preview service needs a catnap.",
  "The preview machine is purr-fectly fine, just needs a moment."
];

const PreviewErrorState = ({ onRetry, retryCount, maxRetries, size = 'medium', is500Error }) => {
  const sizeClasses = {
    small: 'w-48 h-48',
    medium: 'w-72 h-72',
    large: 'w-88 h-88'
  };

  const randomMessage = is500Error ? 
    errorMessages[Math.floor(Math.random() * errorMessages.length)] :
    "Failed to generate preview";

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} bg-[var(--cardBackground)] rounded-lg`}>
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        {/* Icon Container */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [-5, 5, -5, 0] }}
          transition={{
            duration: 0.5,
            times: [0, 0.2, 0.4, 0.6],
            repeat: 0
          }}
          className="relative"
        >
          {/* Glow Effect */}
          <motion.div 
            className="absolute -inset-4 rounded-full blur-xl opacity-75 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: 0
            }}
          />
          
          {/* Cat Icon */}
          <div className="relative bg-[var(--cardBackground)] p-4 rounded-full">
            <Cat 
              size={32}
              className="text-red-500"
            />
          </div>
        </motion.div>

        {/* Error Message Container */}
        <div className="flex flex-col items-center text-center w-full max-w-[200px] space-y-2">
          <p className="text-sm font-medium text-red-500 w-full">
            {randomMessage}
          </p>
          {is500Error && (
            <p className="text-xs text-[var(--textSecondary)] w-full">
              Our team has been notified. Please try again in a few moments.
            </p>
          )}
          {!is500Error && retryCount < maxRetries && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-[var(--primary)] text-black rounded-md hover:opacity-90 transition-colors text-sm w-full"
            >
              Retry
            </button>
          )}
          {retryCount > 0 && (
            <div className="text-xs text-[var(--textSecondary)] w-full">
              Retry attempt {retryCount}/{maxRetries}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewErrorState;