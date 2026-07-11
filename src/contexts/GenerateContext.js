// src/contexts/GenerateContext.js
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const GenerateContext = createContext();

const MAX_HISTORY_ITEMS = 1000;

const DEFAULT_SETTINGS = {
  prompt: '',
  imageCount: 1,
  model: 'flux',
  size: '1024x1024',
  rawMode: false // Toggle for Flux Ultra raw image generation
};

export const GenerateProvider = ({ children }) => {
  // Initialize settings from localStorage
  const [settings, setSettings] = useState(() => {
    const storedSettings = localStorage.getItem('generate_settings');
    return storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
  });

  const [generateHistory, setGenerateHistory] = useState(() => {
    const storedHistory = localStorage.getItem('generate_history');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  // Store images in a ref to prevent unnecessary re-renders
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState(null);
  const [activePrompt, setActivePrompt] = useState('');

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      if (newSettings.hasOwnProperty('prompt')) {
        setActivePrompt(newSettings.prompt || '');
      }
      
      localStorage.setItem('generate_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addToHistory = useCallback((images, prompt, settings) => {
    // Keep the full settings object with all multi-selection arrays
    // For backward compatibility, also set individual properties if needed
    const enhancedSettings = {...settings};
    
    // If styles array exists and has values, also set the style property for backward compatibility
    if (settings.styles && settings.styles.length > 0) {
      if (!enhancedSettings.style || enhancedSettings.style === 'not_specified') {
        enhancedSettings.style = settings.styles[0];
      }
    }
    
    // If lightingEffects array exists and has values, also set the lighting property for backward compatibility
    if (settings.lightingEffects && settings.lightingEffects.length > 0) {
      if (!enhancedSettings.lighting || enhancedSettings.lighting === 'not_specified') {
        enhancedSettings.lighting = settings.lightingEffects[0];
      }
    }
    
    // If cameraAngles array exists and has values, also set the cameraAngle property for backward compatibility
    if (settings.cameraAngles && settings.cameraAngles.length > 0) {
      if (!enhancedSettings.cameraAngle || enhancedSettings.cameraAngle === 'not_specified') {
        enhancedSettings.cameraAngle = settings.cameraAngles[0];
      }
    }
    
    // Create a normalized version of the image objects
    const normalizedImages = images.map(img => ({
      url: img.url || img,
      width: img.width || 1024,
      height: img.height || 1024
    }));
    
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      prompt,
      settings: enhancedSettings,
      images: normalizedImages
    };

    setGenerateHistory(prev => {
      // Check if we already have an identical entry (same prompt, same settings) from the last few minutes
      // This helps prevent accidental duplicates from quick regeneration
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5 minutes in milliseconds
      const isDuplicate = prev.some(item => 
        item.prompt === prompt && 
        JSON.stringify(item.settings) === JSON.stringify(enhancedSettings) &&
        item.images.length === normalizedImages.length &&
        new Date(item.timestamp).getTime() > fiveMinutesAgo
      );
      
      // If it's a duplicate created in the last 5 minutes, don't add it to history
      if (isDuplicate) return prev;
      
      const updated = [historyItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem('generate_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setGenerateHistory([]);
    localStorage.removeItem('generate_history');
  }, []);

  const removeFromHistory = useCallback((id) => {
    setGenerateHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('generate_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setGenerationResults = useCallback((images, prompt = null) => {
    // Normalize the image objects to ensure consistent structure
    const normalizedImages = images.map(img => ({
      url: img.url || img,
      width: img.width || 1024,
      height: img.height || 1024
    }));
    
    setGeneratedImages(normalizedImages);
    
    if (normalizedImages.length > 0) {
      const finalPrompt = prompt || activePrompt;
      setLastGeneratedPrompt(finalPrompt);
      
      // Create a settings object that includes both standard fields and multi-selection arrays
      const historySettings = { ...settings };
      addToHistory(normalizedImages, finalPrompt, historySettings);
    }
    
    setIsGenerating(false);
    setGenerationError(null);
  }, [settings, activePrompt, addToHistory]);

  const clearGeneratedImages = useCallback(() => {
    setGeneratedImages([]);
    setLastGeneratedPrompt(null);
    setGenerationError(null);
  }, []);

  const startGeneration = useCallback(() => {
    setIsGenerating(true);
    setGenerationError(null);
  }, []);

  // Add a new function that only clears the prompt without resetting other settings
  const clearPromptOnly = useCallback(() => {
    setActivePrompt('');
    // Update settings with empty prompt while preserving other settings
    setSettings(prev => {
      const updated = { ...prev, prompt: '' };
      localStorage.setItem('generate_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetState = useCallback(() => {
    setActivePrompt('');
    setGeneratedImages([]);
    setLastGeneratedPrompt(null);
    setGenerationError(null);
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('generate_settings', JSON.stringify(DEFAULT_SETTINGS));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    settings,
    updateSettings,
    generatedImages,
    setGeneratedImages: setGenerationResults,
    clearGeneratedImages,
    isGenerating,
    setIsGenerating,
    startGeneration,
    generationError,
    setGenerationError,
    lastGeneratedPrompt,
    generateHistory,
    clearHistory,
    removeFromHistory,
    activePrompt,
    setActivePrompt,
    clearPromptOnly, // Add the new function to the context value
    resetState
  }), [
    settings,
    updateSettings,
    generatedImages,
    setGenerationResults,
    clearGeneratedImages,
    isGenerating,
    setIsGenerating,
    startGeneration,
    generationError,
    setGenerationError,
    lastGeneratedPrompt,
    generateHistory,
    clearHistory,
    removeFromHistory,
    activePrompt,
    setActivePrompt,
    clearPromptOnly, // Include in dependency array
    resetState
  ]);

  return (
    <GenerateContext.Provider value={value}>
      {children}
    </GenerateContext.Provider>
  );
};

export const useGenerate = () => {
  const context = useContext(GenerateContext);
  if (!context) {
    throw new Error('useGenerate must be used within a GenerateProvider');
  }
  return context;
};