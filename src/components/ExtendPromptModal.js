import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, SunMedium, Package, Palette } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export const ExtendPromptModal = ({ isOpen, onClose, onConfirm }) => {
  const { addToast } = useToast();
  const [inputs, setInputs] = useState({
    style: '',
    lighting: '',
    objects: '',
    mood: ''
  });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setInputs({
        style: '',
        lighting: '',
        objects: '',
        mood: ''
      });
      setErrors({});
      setFocusedField(null);
    }
  }, [isOpen]);

  const validateInput = (name, value) => {
    if (value.length > 200) {
      setErrors(prev => ({
        ...prev,
        [name]: 'Input must be less than 200 characters'
      }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
    validateInput(name, value);
  };

  const handleSubmit = () => {
    let isValid = true;
    const newErrors = {};
    
    Object.entries(inputs).forEach(([name, value]) => {
      if (value.length > 200) {
        newErrors[name] = 'Input must be less than 200 characters';
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    const additionalDetails = Object.fromEntries(
      Object.entries(inputs).filter(([_, value]) => value.trim() !== '')
    );

    onConfirm(additionalDetails);
    onClose();
  };

  const inputFields = [
    { name: 'style', label: 'Style Details', icon: Palette, placeholder: 'e.g., watercolor-like, impressionistic...' },
    { name: 'lighting', label: 'Lighting Details', icon: SunMedium, placeholder: 'e.g., rim lighting, soft shadows...' },
    { name: 'objects', label: 'Objects/Elements', icon: Package, placeholder: 'e.g., floating crystals, ancient ruins...' },
    { name: 'mood', label: 'Mood/Atmosphere', icon: Sparkles, placeholder: 'e.g., mysterious, ethereal...' }
  ];

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
              className="relative w-full max-w-md bg-[var(--cardBackground)] rounded-xl overflow-hidden border border-[var(--border)] shadow-xl extend-modal-container"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-semibold text-[var(--primary)]">
                    Extend Prompt
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {inputFields.map(({ name, label, icon: Icon, placeholder }) => (
                    <div key={name} className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--text)] flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[var(--primary)]" />
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name={name}
                          value={inputs[name]}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField(name)}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full p-3 rounded-lg bg-[var(--inputBackground)] border ${
                            errors[name] 
                              ? 'border-red-500' 
                              : 'border-[var(--inputBorder)] focus:border-[var(--primary)]'
                          } text-[var(--text)] focus:outline-none transition-colors placeholder-[var(--textSecondary)]`}
                          placeholder={placeholder}
                        />
                        <div className={`absolute right-3 top-3 text-sm ${
                          inputs[name].length > 180 
                            ? 'text-[var(--primary)]' 
                            : 'text-[var(--textSecondary)]'
                        }`}>
                          {inputs[name].length}/200
                        </div>
                      </div>
                      {errors[name] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-1"
                        >
                          {errors[name]}
                        </motion.p>
                      )}
                    </div>
                  ))}
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
                    Extend
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