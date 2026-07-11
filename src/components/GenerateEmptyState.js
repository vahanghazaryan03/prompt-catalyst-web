import React, { useState, useEffect, useMemo, memo } from 'react';
import { Cat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GenerateEmptyState = memo(({ 
  isGenerating, 
  error, 
  errorType, 
  creditsNeeded, 
  creditsAvailable 
}) => {
  // Use static messages arrays to prevent re-creation on each render
  const messages = useMemo(() => [
    "Let's create something amazing!",
    "Ready to generate some magic?",
    "Your gallery awaits...",
    "Time to make digital art!",
    "Let's bring your ideas to life!",
  ], []);

  const generatingMessages = useMemo(() => [
    "Adding some magic...",
    "Creating your image...",
    "Almost there...",
    "Making it purr-fect...",
    "Final touches..."
  ], []);

  const errorMessages = useMemo(() => ({
    server: [
      "Oops! Our creative cat is taking a catnap.",
      "Looks like our servers need a quick break.",
      "Technical hiccup! We'll be back on our paws soon.",
    ],
    credits: [
      `Need more credits to generate!`,
      "Time to recharge your creative energy!",
      "Our creative cat needs more credits!",
    ]
  }), []);

  const [currentMessage, setCurrentMessage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Only select a random error message once, not on every render
  const selectedErrorMessage = useMemo(() => {
    if (!error) return '';
    const messages = errorType === 'credits' ? errorMessages.credits : errorMessages.server;
    return messages[Math.floor(Math.random() * messages.length)];
  }, [error, errorType, errorMessages]);

  // Format credits message once to avoid recalculation
  const creditsErrorMessage = useMemo(() => {
    if (errorType !== 'credits' || !creditsNeeded) return '';
    return `Need ${creditsNeeded} more credit${creditsNeeded > 1 ? 's' : ''} to generate!`;
  }, [errorType, creditsNeeded]);

  useEffect(() => {
    if (error) return; // Don't rotate messages if there's an error
    
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % (isGenerating ? generatingMessages.length : messages.length));
    }, isGenerating ? 3000 : 8000);

    return () => clearInterval(interval);
  }, [isGenerating, error, messages, generatingMessages]);

  // Memoize error description to prevent unnecessary recalculations
  const errorDescription = useMemo(() => {
    if (errorType === 'credits') {
      return (
        <div className="text-center space-y-2">
          <p className="text-sm text-[var(--textSecondary)]">
            You need <span className="text-[var(--primary)]">{creditsNeeded} credit{creditsNeeded > 1 ? 's' : ''}</span> for this action.
          </p>
          <p className="text-sm text-[var(--textSecondary)]">
            Currently available: <span className="text-[var(--primary)]">{creditsAvailable} credit{creditsAvailable !== 1 ? 's' : ''}</span>
          </p>
          <p className="text-sm text-[var(--textSecondary)] mt-4">
           Upgrade your plan for more credits & features.
          </p>
        </div>
      );
    }
    return (
      <p className="text-sm text-[var(--textSecondary)]">
        Our team has been notified. Please try again in a few moments or contact support if the issue persists.
      </p>
    );
  }, [errorType, creditsNeeded, creditsAvailable]);

  // The current message to display
  const displayMessage = useMemo(() => {
    if (error) return selectedErrorMessage;
    if (isGenerating) return generatingMessages[currentMessage];
    return messages[currentMessage];
  }, [error, isGenerating, selectedErrorMessage, generatingMessages, messages, currentMessage]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="flex flex-col items-center space-y-12">
        <motion.div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={error ? 
            { rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] } : 
            isGenerating ? 
              { y: [0, -10, 0] } : 
              {}
          }
          transition={error ? 
            { 
              rotate: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] },
              scale: { duration: 0.5, times: [0, 0.5, 1] },
              repeat: 0 
            } : 
            isGenerating ? 
              { 
                y: { duration: 2, repeat: Infinity },
                rotateZ: { duration: 4, repeat: Infinity }
              } : 
              {}
          }
        >
          {/* Glow Effect */}
          <motion.div 
            className={`absolute -inset-4 rounded-full blur-xl opacity-75 ${
              error ? 
                errorType === 'credits' ?
                  'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500' :
                  'bg-gradient-to-r from-red-500 via-orange-500 to-red-500' :
                'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500'
            }`}
            animate={{
              scale: error ? 
                [1, 1.1, 1] :
                isGenerating ? 
                  [1, 1.1, 1] : 
                  isHovered ? 1.1 : 1,
              opacity: error ?
                [0.5, 0.8, 0.5] :
                isGenerating ? 
                  [0.5, 0.8, 0.5] : 
                  isHovered ? 0.8 : 0.5
            }}
            transition={{
              scale: { duration: 2, repeat: error ? 0 : Infinity },
              opacity: { duration: 2, repeat: error ? 0 : Infinity }
            }}
          />
          
          {/* Icon Container */}
          <motion.div 
            className="relative bg-[var(--cardBackground)] p-8 rounded-full"
            animate={error ? 
              { rotateZ: 0 } :
              isGenerating ? 
                { rotateZ: [-5, 5, -5] } : 
                {}
            }
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Cat 
              size={48}
              className={error ? 
                errorType === 'credits' ? 'text-yellow-500' : 'text-red-500' 
                : 'text-[var(--primary)]'
              }
            />
          </motion.div>
        </motion.div>

        {/* Message Section */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={error ? 'error' : isGenerating ? 'generating' : 'idle'}
            className="text-center max-w-md flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              key={displayMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className={`text-lg font-medium ${
                error ? 
                  errorType === 'credits' ? 'text-yellow-500' : 'text-red-500'
                  : 'text-[var(--text)]'
              }`}
            >
              {displayMessage}
            </motion.p>
            
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 max-w-[280px]"
              >
                {errorDescription}
              </motion.div>
            )}
            
            {!error && !isGenerating && (
              <p className="text-sm text-[var(--textSecondary)] opacity-80 mt-3">
                Configure your settings in the left panel
              </p>
            )}

            {isGenerating && !error && (
              <div className="flex justify-center items-center space-x-3 mt-8">
                <div className="w-4 h-4 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-[spin_0.6s_linear_infinite]" />
                  <div className="absolute inset-0 rounded-full border border-[var(--primary)] opacity-20" />
                </div>
                <span className="text-sm text-[var(--textSecondary)]">Generating images...</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

export default GenerateEmptyState;