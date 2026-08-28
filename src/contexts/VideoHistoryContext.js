import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

// Create a new context for video history
const VideoHistoryContext = createContext();

export const useVideoHistory = () => {
  return useContext(VideoHistoryContext);
};

export const VideoHistoryProvider = ({ children }) => {
  // State to store the video history
  const [videoHistory, setVideoHistory] = useState([]);
  
  // Load video history from localStorage on component mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const storedHistory = localStorage.getItem('videoHistory');
        if (storedHistory) {
          setVideoHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        logger.error('Error loading video history:', error);
        // If there's an error, initialize with empty array
        setVideoHistory([]);
      }
    };
    
    loadHistory();
    
    // Listen for storage events to keep history in sync across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'videoHistory') {
        loadHistory();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Save video history to localStorage whenever it changes
  useEffect(() => {
    if (videoHistory.length > 0) {
      localStorage.setItem('videoHistory', JSON.stringify(videoHistory));
    }
  }, [videoHistory]);
  
  // Function to add a new entry to video history
  const addToVideoHistory = useCallback((videoEntry) => {
    setVideoHistory(prevHistory => {
      const updatedHistory = [videoEntry, ...prevHistory];
      
      // Limit history for non-premium users
      if (!videoEntry.isPremium && updatedHistory.length > 5) {
        return updatedHistory.slice(0, 5);
      }
      
      return updatedHistory;
    });
  }, []);
  
  // Function to clear the entire history
  const clearVideoHistory = useCallback(() => {
    setVideoHistory([]);
    localStorage.removeItem('videoHistory');
  }, []);
  
  // Function to remove a specific entry
  const removeVideoHistoryEntry = useCallback((timestamp) => {
    setVideoHistory(prevHistory => 
      prevHistory.filter(entry => entry.timestamp !== timestamp)
    );
  }, []);
  
  // Value to provide to consumers
  const value = {
    videoHistory,
    addToVideoHistory,
    clearVideoHistory,
    removeVideoHistoryEntry
  };
  
  return (
    <VideoHistoryContext.Provider value={value}>
      {children}
    </VideoHistoryContext.Provider>
  );
};

// Helper function to save video to history that components can import directly
export const saveToVideoHistory = (videoData, options = {}) => {
  const {
    description = 'Video Generation',
    promptType = 'standard',
    originalPrompt = '',
    inputText = '',
    isPremium = false,
    settings = {}
  } = options;

  // Get existing history
  let history = JSON.parse(localStorage.getItem('videoHistory') || '[]');

  const historyEntry = {
    description,
    type: 'video',
    promptType,
    originalPrompt: originalPrompt || undefined,
    inputText,
    settings,
    videoData,
    timestamp: Date.now()
  };

  // Limit history for non-premium users
  if (!isPremium && history.length >= 5) {
    history = history.slice(0, 4);
  }

  // Add new entry at the beginning
  history.unshift(historyEntry);
  localStorage.setItem('videoHistory', JSON.stringify(history));
};
