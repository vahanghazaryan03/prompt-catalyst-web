import React, { useState, useEffect, useMemo } from 'react';
import { Cat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimationLoadingState = ({ 
  uploadedImage,
  duration,
  progress = 0
}) => {
  // Animation messages
  const generatingMessages = useMemo(() => [
    "Creating your animation...",
    "Making things move...",
    "Almost there...",
    "Adding some magic...",
    "Bringing your image to life..."
  ], []);

  const [currentMessage, setCurrentMessage] = useState(0);
  const [setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % generatingMessages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [generatingMessages]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="flex flex-col items-center space-y-12">
        {/* Cat Animation */}
        <motion.div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{ y: [0, -10, 0] }}
          transition={{ 
            y: { duration: 2, repeat: Infinity },
            rotateZ: { duration: 4, repeat: Infinity }
          }}
        >
          {/* Glow Effect */}
          <motion.div 
            className="absolute -inset-4 rounded-full blur-xl opacity-75 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              opacity: { duration: 2, repeat: Infinity }
            }}
          />
          
          {/* Icon Container */}
          <motion.div 
            className="relative bg-[var(--cardBackground)] p-8 rounded-full"
            animate={{ rotateZ: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Cat 
              size={48}
              className="text-[var(--primary)]"
            />
          </motion.div>
        </motion.div>

        {/* Message Section */}
        <AnimatePresence mode="wait" initial={false}>
  <motion.div 
    className="text-center max-w-md flex flex-col items-center"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.5 }}
  >
    <motion.p
      key={generatingMessages[currentMessage]}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
      className="text-lg font-medium text-[var(--text)]"
    >
      {generatingMessages[currentMessage]}
    </motion.p>
    
    <p className="text-sm text-[var(--textSecondary)] opacity-80 mt-3">
      This may take up to {duration === '10' ? '5' : '3'} minutes
    </p>

    {/* No loading dots - removed */}
  </motion.div>
</AnimatePresence>

      </div>
    </div>
  );
};

export default AnimationLoadingState;