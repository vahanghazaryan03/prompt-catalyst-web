import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Clock, Bookmark, ArrowRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const NextSceneModal = ({ isOpen, onClose, onConfirm, originalPrompt }) => {
  const { addToast } = useToast();
  const [nextSceneInput, setNextSceneInput] = useState('');
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (!isOpen) {
      setNextSceneInput('');
      setErrors({});
    }
  }, [isOpen]);

  const validateInput = (value) => {
    if (value.length > 300) {
      setErrors({ nextScene: 'Input must be less than 300 characters' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNextSceneInput(value);
    validateInput(value);
  };

  const handleSubmit = () => {
    if (nextSceneInput.length > 300) {
      setErrors({ nextScene: 'Input must be less than 300 characters' });
      return;
    }

    // Get the user input
    const userInput = nextSceneInput.trim();
    
    // Pass the user input as a simple string to prevent loss during component transitions
    onConfirm(userInput.length > 0 ? userInput : 'Continue the scene');
    onClose();
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.6,
        bounce: 0.2
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={onClose}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              className="fixed inset-0 backdrop-blur-sm bg-black/50"
              aria-hidden="true"
              onClick={onClose}
            />

            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="relative w-full max-w-md bg-[var(--cardBackground)] rounded-xl overflow-hidden border border-[var(--border)] shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-xl font-semibold text-[var(--primary)] flex items-center gap-2">
                    <Film size={20} />
                    <span>Next Scene</span>
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="p-3 bg-[var(--inputBackground)] rounded-lg border border-[var(--inputBorder)] mb-4">
                    <h3 className="text-sm font-medium text-[var(--textSecondary)] flex items-center gap-1 mb-1">
                      <Bookmark size={14} />
                      <span>Current Scene</span>
                    </h3>
                    <p className="text-[var(--text)] text-sm">{originalPrompt}</p>
                  </div>

                  <div className="flex justify-center my-2">
                    <ArrowRight className="text-[var(--primary)] h-6 w-6" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[var(--primary)]" />
                      <span>What happens next? (5-10 seconds later)</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={nextSceneInput}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg bg-[var(--inputBackground)] border ${
                          errors.nextScene 
                            ? 'border-red-500' 
                            : 'border-[var(--inputBorder)] focus:border-[var(--primary)]'
                        } text-[var(--text)] focus:outline-none transition-colors placeholder-[var(--textSecondary)] min-h-[100px] max-h-[200px]`}
                        placeholder="Describe how the scene continues or what happens next..."
                      />
                      <div className={`absolute right-3 bottom-3 text-sm ${
                        nextSceneInput.length > 250 
                          ? 'text-[var(--primary)]' 
                          : 'text-[var(--textSecondary)]'
                      }`}>
                        {nextSceneInput.length}/300
                      </div>
                    </div>
                    {errors.nextScene && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-1"
                      >
                        {errors.nextScene}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg text-[var(--text)] hover:bg-[var(--dropdownHover)] transition-colors font-medium border border-[var(--inputBorder)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={Object.keys(errors).length > 0}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90 text-black font-medium transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue Scene
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default NextSceneModal;