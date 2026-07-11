import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddPromptModal = ({ isOpen, onClose, onSubmit }) => {
  const [promptText, setPromptText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (promptText.trim()) {
      onSubmit(promptText.trim());
      setPromptText('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-[var(--cardBackground)] rounded-xl p-6 w-[600px] max-w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.h3 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-semibold text-[var(--text)]"
              >
                Add New Prompt
              </motion.h3>
              <motion.button
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={onClose}
                className="p-1 hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[var(--textSecondary)]" />
              </motion.button>
            </div>

            <motion.form 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
            >
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter your prompt here..."
                className="w-full h-32 p-3 rounded-lg bg-[var(--background)] text-[var(--text)] placeholder-[var(--textSecondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] resize-none"
                autoFocus
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!promptText.trim()}
                  className="px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Prompt
                </button>
              </div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddPromptModal;