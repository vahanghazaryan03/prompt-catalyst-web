import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, ImagePlus, Play, FolderPlus } from 'lucide-react';

const WelcomeMessage = ({ onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    // Delay the actual close callback until animation completes
    setTimeout(onClose, 500);
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div 
          className="welcome-backdrop fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="welcome-message-container relative w-full max-w-3xl p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-2xl z-[9999] overflow-y-auto max-h-[90vh] sm:max-h-[85vh]"
          >
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.h1
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3 welcome-title"
              >
                Welcome to Prompt Catalyst
              </motion.h1>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="welcome-text-secondary text-base sm:text-lg"
              >
                Your Advanced Prompt Engineering Platform
              </motion.p>
            </div>

            {/* Feature Cards - Now with workflow ordering */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-1 gap-3 sm:gap-4"
            >
              {/* Design Prompts */}
              <FeatureCard
                icon={<Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />}
                title="Design Prompts"
                description="Craft perfect prompts using AI powered tools, templates, and instant previews"
                exitDelay={0.1}
                isExiting={isExiting}
              />

              {/* Generate Images */}
              <FeatureCard
                icon={<ImagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />}
                title="Generate Images"
                description="Transform your prompts into visuals with multiple AI models"
                exitDelay={0.15}
                isExiting={isExiting}
              />

              {/* Animate Content */}
              <FeatureCard
                icon={<Play className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />}
                title="Animate Images"
                description="Bring your static images to life with motion and effects"
                exitDelay={0.2}
                isExiting={isExiting}
              />

              {/* Organize Collections */}
              <FeatureCard
                icon={<FolderPlus className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />}
                title="Save & Organize"
                description="Build your prompt library with your best creations for future use"
                exitDelay={0.25}
                isExiting={isExiting}
              />
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 sm:mt-8 text-center"
            >
              <button
                onClick={handleClose}
                className="welcome-cta-button px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-200 hover:opacity-90 hover:transform hover:scale-105 text-sm sm:text-base"
              >
                Get Started
              </button>
              <p className="welcome-text-description mt-3 text-xs sm:text-sm">
                Unleash the full potential of AI with better prompts
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

// Feature Card Component with exit animation
const FeatureCard = ({ icon, title, description, exitDelay, isExiting }) => (
  <motion.div 
    className="welcome-feature-card flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all duration-200"
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -20, opacity: 0 }}
    transition={{ 
      duration: 0.4,
      delay: exitDelay,
      exit: { delay: exitDelay } 
    }}
  >
    <div className="welcome-icon-container p-1.5 sm:p-2 rounded-md shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="welcome-text-primary font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">
        {title}
      </h3>
      <p className="welcome-text-description text-xs sm:text-sm">
        {description}
      </p>
    </div>
  </motion.div>
);

export default WelcomeMessage;