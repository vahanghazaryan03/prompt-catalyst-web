import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const EditDisplayNameForm = ({ onClose }) => {
  const { user, updateDisplayName } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input on mount
    if (inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy editing
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update the display name (frontend-only)
      const success = updateDisplayName(displayName.trim());
      
      if (success) {
        toast.success('Display name updated');
        onClose();
      } else {
        toast.error('Failed to update display name');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3 bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg shadow-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Edit2 size={14} className="text-[var(--primary)]" />
            <h3 className="text-sm font-medium text-[var(--text)]">Edit Display Name</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        
        <div>
          <input
            ref={inputRef}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter display name"
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--text)] placeholder-[var(--textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--textSecondary)] hover:text-[var(--text)] text-xs"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-md bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 text-xs flex items-center gap-1"
            disabled={isSubmitting}
          >
            <Check size={12} />
            <span>Save</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditDisplayNameForm;