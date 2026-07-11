import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useCredit } from '../contexts/CreditContext';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { stripMidjourneyParams } from '../utils/promptUtils';
import LimitReachedMessage from './LimitReachedMessage';
import PreviewErrorState from './PreviewErrorState';
const PREVIEW_CACHE_PREFIX = 'preview_';
const PREVIEW_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const sizeClasses = {
  small: 'w-48 h-48',
  medium: 'w-72 h-72',
  large: 'w-88 h-88'
};

// Keep track of ongoing generations globally
const ongoingGenerations = new Map();
export const clearOngoingGenerations = () => {
  ongoingGenerations.clear();
};

export const PreviewImage = ({ 
  prompt, 
  shouldGenerate = false, 
  size = 'medium', 
  initialUrl = null,
  onPreviewGenerated = () => {},
  onError = () => {},
  onPremiumClick,
  onLoginModalOpen,
  globalGenerationInProgress = false // New prop to track global generation state
}) => {
  const [previewUrl, setPreviewUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limitError, setLimitError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { addToast } = useToast();
  const { refreshCredits } = useCredit();
  const { user } = useAuth();
  const maxRetries = 3;
  const componentMounted = useRef(true);
  const prevUserRef = useRef(user);
  

  // Cache management functions
  const getCacheKey = (prompt) => `${PREVIEW_CACHE_PREFIX}${prompt}`;

  const clearCache = (prompt) => {
    try {
      localStorage.removeItem(getCacheKey(prompt));
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const getCachedPreview = (prompt) => {
    try {
      // First check localStorage
      const cached = localStorage.getItem(getCacheKey(prompt));
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        if (now - timestamp <= PREVIEW_CACHE_EXPIRY) {
          // If we found a valid cached URL, immediately notify the parent component
          // This helps with synchronizing preview visibility across components
          setTimeout(() => onPreviewGenerated(prompt, url), 0);
          return url;
        }
        // If expired, clear it
        clearCache(prompt);
      }
  
      // If not in localStorage or expired, check collections
      const collections = JSON.parse(localStorage.getItem('promptCollections') || '{}');
      for (const collection of Object.values(collections)) {
        for (const promptObj of collection.prompts) {
          if (promptObj.text === prompt && promptObj.previewUrls?.[prompt]) {
            // If found in collections, also update localStorage
            setCachedPreview(prompt, promptObj.previewUrls[prompt]);
            return promptObj.previewUrls[prompt];
          }
        }
      }
  
      return null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

  const setCachedPreview = (prompt, url) => {
    try {
      // Cache in localStorage
      const cacheData = {
        url,
        timestamp: Date.now()
      };
      localStorage.setItem(getCacheKey(prompt), JSON.stringify(cacheData));
  
      // Try to find and update the prompt in collections
      const collections = JSON.parse(localStorage.getItem('promptCollections') || '{}');
      let updated = false;
  
      Object.entries(collections).forEach(([collectionId, collection]) => {
        collection.prompts.forEach(promptObj => {
          if (promptObj.text === prompt) {
            if (!promptObj.previewUrls) promptObj.previewUrls = {};
            promptObj.previewUrls[prompt] = url;
            updated = true;
          }
        });
      });
  
      if (updated) {
        localStorage.setItem('promptCollections', JSON.stringify(collections));
      }
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  };

  const handleRetry = async () => {
    // Don't retry if we have a limit error
    if (limitError) {
      return;
    }
  
    if (retryCount >= maxRetries) {
      setError({
        message: 'Maximum retry attempts reached',
        is500Error: false
      });
      addToast('Failed to generate preview after multiple attempts', 'error');
      return;
    }
  
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
    await generatePreview();
  };
  const clearAllPreviews = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(PREVIEW_CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing preview cache:', error);
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    const userChanged = (
      (!prevUserRef.current && user) || // logged in
      (prevUserRef.current && !user) || // logged out
      (prevUserRef.current?.userId !== user?.userId) // switched accounts
    );

    if (userChanged) {
      // Reset component state
      setLimitError(null);
      setError(null);
      setLoading(false);
      setRetryCount(0);

      // Clear cache and ongoing generations
      clearAllPreviews();
      clearOngoingGenerations();

      // Regenerate preview if needed
      if (shouldGenerate && user) {
        generatePreview();
      }
    }

    prevUserRef.current = user;
  }, [user, shouldGenerate]);

  const generatePreview = async () => {
    if (!prompt) return;

    // Check cache first
    const cachedUrl = getCachedPreview(prompt);
    if (cachedUrl) {
      if (componentMounted.current) {
        setPreviewUrl(cachedUrl);
        onPreviewGenerated(prompt, cachedUrl);
      }
      return;
    }

    // Clean prompt for API request
    const cleanPrompt = stripMidjourneyParams(prompt);

    // Check for ongoing generation
    if (ongoingGenerations.has(prompt)) {
      try {
        const result = await ongoingGenerations.get(prompt);
        if (componentMounted.current) {
          setPreviewUrl(result);
          setCachedPreview(prompt, result);
          onPreviewGenerated(prompt, result);
        }
        return;
      } catch (error) {
        ongoingGenerations.delete(prompt);
      }
    }

    const generationPromise = (async () => {
      try {
        if (componentMounted.current) {
          setLoading(true);
          setError(null);
          setLimitError(null);
        }
  
        const response = await apiService.generatePreview(cleanPrompt);
        const imageUrl = response?.imageUrl || response?.preview || response;
  
        if (!imageUrl || typeof imageUrl !== 'string') {
          throw new Error('Invalid preview response format');
        }
  
        return imageUrl;
      } catch (error) {
        // Handle limit errors
        if (error.response?.status === 429 || error.response?.data?.error?.includes('premium')) {
          const creditInfo = error.response?.data?.credits || {};
          const isLimitError = error.response?.status === 429;
          const isPremiumError = error.response?.data?.error?.includes('premium');
          
          setLimitError({
            type: isPremiumError ? 'premium' : 'prompt',
            creditInfo: isLimitError ? {
              remaining: creditInfo.remaining,
              total: creditInfo.total,
              resetTime: creditInfo.resetTime,
              type: creditInfo.type
            } : undefined,
            limitType: error.response?.data?.limitType || 'daily'
          });
          
          // Refresh credits
          await refreshCredits();
          
          // Clear retry count and prevent further retries for limit errors
          setRetryCount(0);
          throw error; // Re-throw to prevent retry
        }
        
        onError(error);
        throw error;
      } finally {
        if (componentMounted.current) {
          setLoading(false);
        }
        ongoingGenerations.delete(prompt);
      }
    })();
  
    ongoingGenerations.set(prompt, generationPromise);
  
    try {
      const imageUrl = await generationPromise;
      if (componentMounted.current) {
        setPreviewUrl(imageUrl);
        setCachedPreview(prompt, imageUrl);
        onPreviewGenerated(prompt, imageUrl);
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      
      // Only handle non-limit errors here
      if (componentMounted.current && 
          error.response?.status !== 429 && 
          !error.response?.data?.error?.includes('premium')) {
        
        const is500Error = error.response?.status === 500;
        setError({
          message: error.message || 'Failed to generate preview',
          is500Error
        });
        
        // Only attempt retry for non-500 and non-limit errors
        if (!is500Error && retryCount < maxRetries) {
          setTimeout(() => handleRetry(), 2000 * (retryCount + 1));
        }
      }
    }
  };

  // Initialize preview generation
  useEffect(() => {
    componentMounted.current = true;

    const initializePreview = async () => {
      if (initialUrl) {
        setPreviewUrl(initialUrl);
        setCachedPreview(prompt, initialUrl);
        return;
      }

      const cachedUrl = getCachedPreview(prompt);
      if (cachedUrl) {
        setPreviewUrl(cachedUrl);
        return;
      }

      // Always generate previews when requested, even during global generation
      if (shouldGenerate && !ongoingGenerations.has(prompt)) {
        await generatePreview();
      }
    };

    initializePreview();

    return () => {
      componentMounted.current = false;
    };
  }, [prompt, shouldGenerate, initialUrl, globalGenerationInProgress]);

  const handleImageError = () => {
    console.error('Image load error');
    setError('Failed to load preview image');
    clearCache(prompt);
    
    if (retryCount < maxRetries) {
      handleRetry();
    } else {
      addToast('Failed to load preview image', 'error');
    }
  };

  // Render limit error
  if (limitError) {
    return (
      <div className="w-full">
        <LimitReachedMessage 
          type={limitError.type}
          creditInfo={limitError.creditInfo}
          limitType={limitError.limitType}
          onPremiumClick={onPremiumClick}
          onLoginModalOpen={onLoginModalOpen}  // Add this prop
        />
      </div>
    );
  }


  // Render loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} bg-[var(--cardBackground)] rounded-lg`}>
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--primary)] border-t-transparent" />
          <div className="text-sm text-[var(--textSecondary)]">
            Generating preview...
          </div>
          {retryCount > 0 && (
            <div className="text-xs text-[var(--textSecondary)]">
              Retry attempt {retryCount}/{maxRetries}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <PreviewErrorState
        onRetry={handleRetry}
        retryCount={retryCount}
        maxRetries={maxRetries}
        size={size}
        is500Error={error.is500Error}
      />
    );
  }

  // Don't render anything if no preview URL
  if (!previewUrl) {
    return null;
  }

  // Render preview image
  return (
    <div className="relative rounded-lg overflow-hidden mt-2 border border-[var(--border)]">
      <div className={sizeClasses[size]}>
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleImageError}
        />
      </div>
    </div>
  );
};