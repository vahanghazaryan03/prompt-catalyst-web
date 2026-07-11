import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import apiService from '../services/api';
import { useToast } from './ToastContext';

const WeeklyPromptsContext = createContext(null);

// Cache keys
const CACHE_KEYS = {
  IMAGE_PROMPTS: 'weeklyPrompts',
  VIDEO_PROMPTS: 'weeklyVideoPrompts'
};

export const useWeeklyPrompts = () => {
  const context = useContext(WeeklyPromptsContext);
  if (!context) {
    throw new Error('useWeeklyPrompts must be used within a WeeklyPromptsProvider');
  }
  return context;
};

export const WeeklyPromptsProvider = ({ children }) => {
  const [imagePrompts, setImagePrompts] = useState([]);
  const [videoPrompts, setVideoPrompts] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [imageLastUpdated, setImageLastUpdated] = useState(null);
  const [videoLastUpdated, setVideoLastUpdated] = useState(null);
  const { addToast } = useToast();
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  const processPrompts = (weeklyPrompts) => {
    if (!Array.isArray(weeklyPrompts)) {
      console.error('Invalid prompts data structure:', weeklyPrompts);
      return [];
    }

    // Sort weeks by date range (most recent first)
    return weeklyPrompts.sort((a, b) => {
      const dateA = new Date(a.dateRange.start);
      const dateB = new Date(b.dateRange.start);
      return dateB - dateA;
    });
  };

  // Load weekly image prompts
  const loadWeeklyImagePrompts = async (force = false) => {
    try {
      // Check if cache is still valid
      if (!force && imageLastUpdated && (Date.now() - imageLastUpdated < CACHE_DURATION)) {
        const cached = localStorage.getItem(CACHE_KEYS.IMAGE_PROMPTS);
        if (cached) {
          const { prompts: cachedPrompts } = JSON.parse(cached);
          if (cachedPrompts && Array.isArray(cachedPrompts)) {
            setImagePrompts(processPrompts(cachedPrompts));
            return;
          }
        }
      }

      setImageLoading(true);
      const response = await apiService.getWeeklyPrompts();
      
      if (!response || !response.weeklyPrompts) {
        throw new Error('Invalid response format');
      }

      const processedPrompts = processPrompts(response.weeklyPrompts);
      setImagePrompts(processedPrompts);
      setImageLastUpdated(Date.now());
      
      // Cache the prompts in localStorage as backup
      localStorage.setItem(CACHE_KEYS.IMAGE_PROMPTS, JSON.stringify({
        prompts: processedPrompts,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error loading weekly image prompts:', error);
      addToast('Failed to load weekly image prompts. Please try again later.', 'error');
      
      // Try to load from localStorage if API fails
      const cached = localStorage.getItem(CACHE_KEYS.IMAGE_PROMPTS);
      if (cached) {
        try {
          const { prompts: cachedPrompts, timestamp } = JSON.parse(cached);
          if (cachedPrompts && Array.isArray(cachedPrompts)) {
            setImagePrompts(processPrompts(cachedPrompts));
            setImageLastUpdated(timestamp);
          }
        } catch (parseError) {
          console.error('Error parsing cached image prompts:', parseError);
        }
      }
    } finally {
      setImageLoading(false);
    }
  };

  // Load weekly video prompts
  const loadWeeklyVideoPrompts = async (force = false) => {
    try {
      // Check if cache is still valid
      if (!force && videoLastUpdated && (Date.now() - videoLastUpdated < CACHE_DURATION)) {
        const cached = localStorage.getItem(CACHE_KEYS.VIDEO_PROMPTS);
        if (cached) {
          const { prompts: cachedPrompts } = JSON.parse(cached);
          if (cachedPrompts && Array.isArray(cachedPrompts)) {
            setVideoPrompts(processPrompts(cachedPrompts));
            return;
          }
        }
      }

      setVideoLoading(true);
      // Try to use simplified video API first, then fall back to regular ones
      let response;
      try {
        // First try to get simplified video prompts
        response = await apiService.getSimplifiedVideoPrompts();
      } catch (apiError) {
        try {
          // Then try regular video-specific prompts
          response = await apiService.getWeeklyVideoPrompts();
        } catch (videoApiError) {
          // As a last resort, use the main endpoint
          response = await apiService.getWeeklyPrompts();
        }
      }
      
      if (!response || !response.weeklyPrompts) {
        throw new Error('Invalid response format');
      }

      // Process the prompts and filter for those that have video content
      const allProcessedPrompts = processPrompts(response.weeklyPrompts);
      
      // Transform the data to only include prompts with video URLs and simplify to just videoUrl and prompt
      const videoFilteredPrompts = allProcessedPrompts.map(week => ({
        ...week,
        prompts: week.prompts
          .filter(prompt => prompt.video || prompt.videoUrl)
          .map(prompt => ({
            prompt: prompt.prompt,
            video: prompt.video || prompt.videoUrl
          }))
      })).filter(week => week.prompts.length > 0);
      
      setVideoPrompts(videoFilteredPrompts);
      setVideoLastUpdated(Date.now());
      
      // Cache the prompts in localStorage as backup
      localStorage.setItem(CACHE_KEYS.VIDEO_PROMPTS, JSON.stringify({
        prompts: videoFilteredPrompts,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error loading weekly video prompts:', error);
      addToast('Failed to load weekly video prompts. Please try again later.', 'error');
      
      // Try to load from localStorage if API fails
      const cached = localStorage.getItem(CACHE_KEYS.VIDEO_PROMPTS);
      if (cached) {
        try {
          const { prompts: cachedPrompts, timestamp } = JSON.parse(cached);
          if (cachedPrompts && Array.isArray(cachedPrompts)) {
            setVideoPrompts(processPrompts(cachedPrompts));
            setVideoLastUpdated(timestamp);
          }
        } catch (parseError) {
          console.error('Error parsing cached video prompts:', parseError);
        }
      }
    } finally {
      setVideoLoading(false);
    }
  };

  // Load initial data for image prompts
  useEffect(() => {
    const initializeImagePrompts = async () => {
      // Try to load from localStorage first for immediate display
      const cached = localStorage.getItem(CACHE_KEYS.IMAGE_PROMPTS);
      if (cached) {
        try {
          const { prompts: cachedPrompts, timestamp } = JSON.parse(cached);
          if (cachedPrompts && Array.isArray(cachedPrompts)) {
            setImagePrompts(processPrompts(cachedPrompts));
            setImageLastUpdated(timestamp);
            setImageLoading(false);
          }
        } catch (error) {
          console.error('Error loading cached image prompts:', error);
        }
      }
      
      // Then fetch fresh data
      await loadWeeklyImagePrompts();
    };

    initializeImagePrompts();
  }, []);

  // Load initial data for video prompts
  useEffect(() => {
    const initializeVideoPrompts = async () => {
      // Try to load from localStorage first for immediate display
      const cached = localStorage.getItem(CACHE_KEYS.VIDEO_PROMPTS);
      if (cached) {
        try {
          const { prompts: cachedPrompts, timestamp } = JSON.parse(cached);
          if (cachedPrompts && Array.isArray(cachedPrompts)) {
            setVideoPrompts(processPrompts(cachedPrompts));
            setVideoLastUpdated(timestamp);
            setVideoLoading(false);
          }
        } catch (error) {
          console.error('Error loading cached video prompts:', error);
        }
      }
      
      // Then fetch fresh data
      await loadWeeklyVideoPrompts();
    };

    initializeVideoPrompts();
  }, []);

  // Periodic check for updates - both image and video prompts
  useEffect(() => {
    const imageInterval = setInterval(() => {
      loadWeeklyImagePrompts(true);
    }, CACHE_DURATION);

    const videoInterval = setInterval(() => {
      loadWeeklyVideoPrompts(true);
    }, CACHE_DURATION);

    return () => {
      clearInterval(imageInterval);
      clearInterval(videoInterval);
    };
  }, []);

  // Refresh both image and video prompts
  const refreshImagePrompts = () => loadWeeklyImagePrompts(true);
  const refreshVideoPrompts = () => loadWeeklyVideoPrompts(true);
  
  // Combined loading state
  const loading = useMemo(() => imageLoading || videoLoading, [imageLoading, videoLoading]);
  
  // For backward compatibility - use image prompts as default prompts
  const prompts = imagePrompts;

  return (
    <WeeklyPromptsContext.Provider value={{
      // Original API for backward compatibility
      prompts,
      loading,
      lastUpdated: imageLastUpdated,
      refreshPrompts: refreshImagePrompts,
      
      // Image-specific
      imagePrompts,
      imageLoading,
      imageLastUpdated,
      refreshImagePrompts,
      
      // Video-specific
      videoPrompts,
      videoLoading,
      videoLastUpdated,
      refreshVideoPrompts
    }}>
      {children}
    </WeeklyPromptsContext.Provider>
  );
};