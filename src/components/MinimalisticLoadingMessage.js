import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Brain, Palette, Stars } from 'lucide-react';

// Simple TypewriterText with minimal styling
const TypewriterText = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 40); // Slightly faster typing speed

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  }, [currentIndex, text, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
      {displayedText}
      <motion.span 
        className="inline-block w-[2px] h-[14px] ml-[2px]"
        style={{ backgroundColor: 'var(--primary)' }}
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    </span>
  );
};

const MinimalisticLoadingMessage = () => {
  const [phase, setPhase] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  // Simplified set of phases focused on prompt generation
  const phases = [
    { icon: Brain, text: "Analyzing context..." },
    { icon: Palette, text: "Crafting visual details..." },
    { icon: Wand2, text: "Refining prompt..." },
    { icon: Stars, text: "Finding the perfect words..." }
  ];

  useEffect(() => {
    let interval;
    if (isTypingComplete) {
      interval = setInterval(() => {
        setPhase((prev) => (prev + 1) % phases.length);
        setIsTypingComplete(false);
      }, 1800);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTypingComplete, phases.length]);

  const CurrentIcon = phases[phase].icon;

  return (
    <div className="relative flex items-center justify-start py-3">
      <div className="flex items-center">
        {/* Circle with pulse effect */}
        <div className="relative mr-4">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(var(--primary-rgb), 0.3)'
            }}
            animate={{
              scale: [1, 1.5],
              opacity: [0.7, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          
          {/* Icon with subtle animation */}
          <motion.div
            className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
            animate={{
              scale: [0.95, 1.05, 0.95],
              boxShadow: [
                '0 0 0 rgba(var(--primary-rgb), 0.2)',
                '0 0 8px rgba(var(--primary-rgb), 0.5)',
                '0 0 0 rgba(var(--primary-rgb), 0.2)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: 'rgba(var(--primary-rgb), 0.15)'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="text-white"
                style={{ color: 'var(--primary)' }}
              >
                <CurrentIcon size={18} />
              </motion.div>
            </AnimatePresence>
            
            {/* Subtle sparkle effect */}
            {isTypingComplete && (
              <motion.div 
                className="absolute -right-1 -top-1"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <Sparkles size={10} className="text-white" style={{ color: 'var(--primary)' }} />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Text container */}
        <div className="w-48">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <TypewriterText 
                text={phases[phase].text} 
                onComplete={() => setIsTypingComplete(true)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MinimalisticLoadingMessage;