import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../utils/logger';

export const ImageUpload = ({ 
  onFileSelect,
  accept = "image/jpeg,image/png,image/webp",
  maxSize = 10 * 1024 * 1024, // 5MB default
  className = "",
  onAnalysis = null, // Keep this for backwards compatibility
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef();
  const { user } = useAuth();
  const { addToast } = useToast(); // Changed from showToast to addToast

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = accept.split(',');
    if (!allowedTypes.includes(file.type)) {
      addToast('Invalid file type. Please check the allowed formats.', 'error');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      addToast(`File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`, 'error');
      return;
    }

    setIsProcessing(true);

    try {
      if (onAnalysis) {
        // Original image analysis logic
        const formData = new FormData();
        formData.append('image', file);

        const token = user?.token;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch('https://catalystmedia.ai/pctest/analyze-image', {
          method: 'POST',
          headers,
          body: formData
        });

        const data = await response.json();

        if (response.status === 429) {
          addToast('You have reached the maximum number of image analysis requests for today.', 'error');
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze image');
        }

        onAnalysis(data.prompts, file.name);
        addToast('Image analyzed successfully!', 'success');
      } else if (onFileSelect) {
        // New simple file selection logic
        onFileSelect(file);
      
      }
    } catch (error) {
      logger.error('Error processing image:', error);
      addToast(error.message || 'Error processing image. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    await processFile(file);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    await processFile(file);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-[var(--border)] hover:border-primary hover:bg-[var(--dropdownHover)]'
        }
        ${isProcessing || disabled ? 'pointer-events-none opacity-70' : ''}
        ${className}
      `}
      onDragOver={!disabled ? handleDragOver : undefined}
      onDragLeave={!disabled ? handleDragLeave : undefined}
      onDrop={!disabled ? handleDrop : undefined}
      onClick={!disabled ? () => fileInputRef.current?.click() : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
      />

      {isProcessing || disabled ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <p className="text-[var(--text)]">{isProcessing ? 'Processing image...' : 'Generating animation...'}</p>
        </div>
      ) : (
        <>
          <svg
            className="w-12 h-12 mb-4 text-[var(--textSecondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="text-lg text-[var(--text)] text-center mb-2">
            {isDragging ? 'Drop your image here' : 'Drag & drop your image here'}
          </p>
          <p className="text-sm text-[var(--textSecondary)] text-center">
            or click to select a file
          </p>
          <p className="text-xs text-[var(--textSecondary)] mt-4">
            Supports {accept.split(',').map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </>
      )}
    </div>
  );
};
