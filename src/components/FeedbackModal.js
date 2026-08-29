import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FEEDBACK_OPTIONS = [
  { 
    id: 'prompt',
    label: "Didn't follow the prompt",
    solution: "Try using more specific language in your prompt. Be descriptive about the exact movement or animation you want to see."
  },
  { 
    id: 'image',
    label: "Didn't follow the image",
    solution: "Try using an image with clearer subjects and less complex backgrounds. Images with distinct foreground elements tend to animate better."
  },
  { 
    id: 'animation',
    label: "Image didn't animate",
    solution: "Try a different animation preset, use a custom prompt that clearly describes the motion you want to see, or try using a different image with clearer subjects."
    
  },
  { 
    id: 'movement',
    label: "Unrealistic movement",
    solution: "Consider using the 'Character Animation' presets for people and animals, or try reducing the animation duration to 5 seconds for more controlled movements."
  },
  { 
    id: 'transitions',
    label: "Unwanted transitions or scene cuts",
    solution: "Try using camera-based animation presets instead of transition effects, or specify 'continuous shot' in your custom prompt."
  },
  { 
    id: 'camera',
    label: "Unwanted camera motion",
    solution: "Choose a more subtle animation preset, or add 'keep camera stable' to your custom prompt to reduce camera movement."
  }
];

const FeedbackModal = ({ isOpen, onClose, onFeedbackGiven, onFeedbackReset, feedbackGiven }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowThankYou(true);
    if (onFeedbackGiven) onFeedbackGiven();
    // In a real implementation, you would send the feedback here
    // For now, we're just showing the thank you message
  };

  const handleClose = () => {
    // Only reset if not showing thank you message
    if (!showThankYou) {
      setSelectedOption(null);
    }
    setShowThankYou(false);
    onClose();
  };
  
  const handleReset = () => {
    setSelectedOption(null);
    setShowThankYou(false);
    if (onFeedbackReset) onFeedbackReset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={handleClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md p-6 mx-4 bg-[var(--cardBackground)] rounded-xl border border-[var(--border)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--text)]/10 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center mb-4 text-[var(--text)]">
              <h3 className="text-lg font-medium">Provide additional feedback</h3>
            </div>

            {feedbackGiven && !showThankYou ? (
              // Reset feedback screen
              <div className="space-y-4">
                <p className="text-sm text-[var(--textSecondary)]">
                  You already provided feedback for this video. Would you like to provide new feedback?
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 rounded-lg bg-[var(--primary)] text-black font-medium"
                  >
                    New Feedback
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-lg bg-[var(--text)]/10 text-[var(--text)] font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : !showThankYou ? (
              // Feedback options
              <>
                <p className="mb-4 text-sm text-[var(--textSecondary)]">
                  Let us know what's wrong with this video
                </p>
                <div className="space-y-2 mb-4">
                  {FEEDBACK_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      className="w-full p-3 text-left rounded-lg bg-[var(--inputBackground)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--dropdownHover)] transition-colors"
                      onClick={() => handleOptionSelect(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              // Thank you message with solution
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle size={20} />
                  <span className="font-medium">Thank you for your feedback!</span>
                </div>
                
                <div className="p-4 rounded-lg bg-[var(--inputBackground)] border border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--text)] mb-2">Suggested solution:</p>
                  <p className="text-sm text-[var(--textSecondary)]">{selectedOption.solution}</p>
                </div>
                
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 mt-2 rounded-lg bg-[var(--primary)] text-black font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;