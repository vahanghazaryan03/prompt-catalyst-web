import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import { useToast } from '../contexts/ToastContext';
import { ImagePreview } from './ImagePreview';
import apiService from '../services/api';
import { logger } from '../utils/logger';

export const ImageAnalysis = ({ onAnalysisComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [analysisStage, setAnalysisStage] = useState('');
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { credits, refreshCredits } = useCredit();
  const { addToast } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      addToast('Only JPG, PNG and WebP images are allowed', 'error');
      return false;
    }

    if (file.size > maxSize) {
      addToast('File size must be less than 10MB', 'error');
      return false;
    }

    return true;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
    e.target.value = ''; // Reset file input
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setAnalysisStage('');
  };

  const startProgressAnimation = () => {
    // Reset progress
    setUploadProgress(0);
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Create new interval that increases progress to 90% over ~20 seconds
    progressIntervalRef.current = setInterval(() => {
      setUploadProgress(prevProgress => {
        if (prevProgress >= 90) {
          clearInterval(progressIntervalRef.current);
          return 90;
        }
        
        // Adjusted increments for a ~20 second animation
        const increment = prevProgress < 20 ? 0.6 : 
                         prevProgress < 50 ? 0.7 : 
                         prevProgress < 75 ? 0.5 : 0.3;
                         
        return Math.min(90, prevProgress + increment);
      });
    }, 150); // Update every 150ms
  };
  
  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const analyzeImage = async () => {
    if (!selectedFile) return;

    // Start loading immediately
    setIsUploading(true);
    setAnalysisStage('Uploading image...');
    startProgressAnimation();

    try {
      // Check credits before starting analysis
      if (!user) {
        // User not logged in - close modal and show in chat
        const error = {
          isLoginRequired: true,
          view: 'login'
        };
        onAnalysisComplete(null, null, error);
        return;
      }

      // Refresh credits to get the latest count
      await refreshCredits();
      
      // Check if user has enough credits (image analysis typically costs 2 credits)
      const requiredCredits = 2;
      if (credits !== null && credits < requiredCredits) {
        // Not enough credits - close modal and show in chat
        const error = {
          isInsufficientCredits: true,
          remaining: credits,
          required: requiredCredits
        };
        onAnalysisComplete(null, null, error);
        return;
      }
      
      const formData = new FormData();
      formData.append('image', selectedFile);

      setAnalysisStage('Processing image...');
      const response = await apiService.analyzeImage(formData);
      
      // Complete the progress animation
      clearInterval(progressIntervalRef.current);
      setUploadProgress(100);
      setAnalysisStage('Analysis complete!');
      
      if (response && response.prompts) {
        const imageUrl = URL.createObjectURL(selectedFile);
        
        // User message with the image
        const userMessage = {
          content: imageUrl,
          fileName: selectedFile.name,
          imageUrl: imageUrl // Explicitly include the imageUrl
        };

        // Assistant message with the analysis results
        const assistantMessage = {
          content: typeof response.prompts === 'string' ? response.prompts : JSON.stringify(response.prompts),
          fileName: selectedFile.name,
          imageUrl: imageUrl // Explicitly include the imageUrl
        };

        // Pass messages to parent component
        onAnalysisComplete(userMessage, assistantMessage);
        addToast('Image analysis completed successfully', 'success');
      }
      
      setTimeout(handleRemoveFile, 1500);
    } catch (error) {
      logger.error('Image analysis error:', error);
      
      // Check for credit limit or premium errors
      if (error.response?.status === 429 || 
          error.response?.status === 403 || 
          error.response?.data?.error?.includes('premium')) {
        // Pass the error to parent component to handle limit message
        onAnalysisComplete(null, null, error);
      } else {
        addToast('Failed to analyze image. Please try again.', 'error');
      }
    } finally {
      // Clear interval if it's still running
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Clear loading state after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setAnalysisStage('');
        setUploadProgress(0);
      }, 500); // Shorter delay for error cases
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer 
          ${dragActive ? 'border-primary bg-primary/10' : 'border-[var(--border)] hover:border-primary/50'}
          ${selectedFile ? 'border-primary/50' : ''} 
          transition-colors duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-full max-w-md bg-gray-700/30 rounded-full h-5 mb-4 overflow-hidden relative shadow-inner">
              <div 
                className="h-full relative overflow-hidden" 
                style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease-in-out' }}
              >
                {/* Liquid gradient fill */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-300" 
                  style={{ 
                    backgroundSize: '200% 100%',
                    animation: 'liquidGradient 2s ease infinite'
                  }}
                ></div>
                
                {/* Animated wave effect */}
                <div
                  className="absolute top-0 right-0 left-0 bottom-0 opacity-70"
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)',
                    transform: 'translateY(5px)',
                    animation: 'liquidWave 1.5s ease-in-out infinite alternate'
                  }}
                ></div>
              </div>
            </div>
            
            {/* Add keyframes to your existing CSS file (InputArea.css) */}
            <p className="text-[var(--text)]">{analysisStage}</p>
          </div>
        ) : selectedFile ? (
          <div className="max-w-md mx-auto">
            <ImagePreview file={selectedFile} onRemove={handleRemoveFile} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                analyzeImage();
              }}
              className="mt-4 px-6 py-2 bg-green-400 text-black 
                       rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium"
              disabled={isUploading}
            >
              Analyze Image
            </button>
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" 
                 className="mx-auto h-12 w-12 text-[var(--textSecondary)]" 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor">
              <path strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-sm text-[var(--text)]">
              Drag and drop an image here, or click to select
            </p>
            <p className="mt-2 text-xs text-[var(--textSecondary)]">
              Supported formats: JPG, PNG, WebP (max 10MB)
             
             
            </p>
          </>
        )}
      </div>
    </div>
  );
};