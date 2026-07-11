import React, { useState } from 'react';

export const ExtendModal = ({ isOpen, onClose, onConfirm }) => {
  const [additionalDetails, setAdditionalDetails] = useState({
    style: '',
    lighting: '',
    objects: '',
    mood: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(additionalDetails);
    onClose();
  };

  if (!isOpen) return null;

  // Get the current theme mode
  const isLightMode = document.body.classList.contains('theme-light');
  
  // Define theme-aware styles as fallbacks
  const modalStyles = {
    backgroundColor: isLightMode ? '#f8fafc' : '#1e1e1e',
    borderColor: isLightMode ? '#e2e8f0' : '#333',
    color: isLightMode ? '#0f172a' : '#f5f5f5'
  };
  
  const inputStyles = {
    backgroundColor: isLightMode ? '#ffffff' : '#1e1e1e',
    borderColor: isLightMode ? '#cbd5e1' : '#555',
    color: isLightMode ? '#0f172a' : '#f5f5f5'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="extend-modal-container bg-[var(--cardBackground)] border border-[var(--border)] p-6 rounded-xl max-w-md w-full mx-4 shadow-xl" style={modalStyles}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Add Details to Extend Prompt
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--dropdownHover)] rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[var(--textSecondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Additional Style Elements
            </label>
            <input
              type="text"
              value={additionalDetails.style}
              onChange={(e) => setAdditionalDetails(prev => ({
                ...prev, style: e.target.value
              }))}
              className="w-full px-3 py-2 bg-[var(--inputBackground)] border border-[var(--inputBorder)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
              style={inputStyles}
              placeholder="e.g., watercolor-like, impressionistic, grainy texture"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Additional Lighting Details
            </label>
            <input
              type="text"
              value={additionalDetails.lighting}
              onChange={(e) => setAdditionalDetails(prev => ({
                ...prev, lighting: e.target.value
              }))}
              className="w-full px-3 py-2 bg-[var(--inputBackground)] border border-[var(--inputBorder)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
              style={inputStyles}
              placeholder="e.g., rim lighting, soft shadows, golden hour"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Additional Objects/Elements
            </label>
            <input
              type="text"
              value={additionalDetails.objects}
              onChange={(e) => setAdditionalDetails(prev => ({
                ...prev, objects: e.target.value
              }))}
              className="w-full px-3 py-2 bg-[var(--inputBackground)] border border-[var(--inputBorder)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
              style={inputStyles}
              placeholder="e.g., floating crystals, ancient ruins, butterflies"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Mood/Atmosphere
            </label>
            <input
              type="text"
              value={additionalDetails.mood}
              onChange={(e) => setAdditionalDetails(prev => ({
                ...prev, mood: e.target.value
              }))}
              className="w-full px-3 py-2 bg-[var(--inputBackground)] border border-[var(--inputBorder)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
              style={inputStyles}
              placeholder="e.g., mysterious, ethereal, energetic"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--text)] bg-[var(--inputBackground)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors border border-[var(--inputBorder)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90 rounded-lg transition-all duration-200 shadow-md"
            >
              Extend Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};