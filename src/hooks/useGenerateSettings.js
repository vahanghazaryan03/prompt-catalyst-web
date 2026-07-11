import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useGenerate } from '../contexts/GenerateContext';

export const useGenerateSettings = (initialPrompt = '') => {
  const {
    settings,
    updateSettings,
    generatedImages,
    setGeneratedImages,
    clearGeneratedImages,
    isGenerating,
    setIsGenerating,
    startGeneration,
    generationError,
    setGenerationError,
    lastGeneratedPrompt,
    activePrompt,
    setActivePrompt,
    clearPromptOnly, // Add the new clearPromptOnly function
    resetState
  } = useGenerate();

  const previousPromptRef = useRef('');
  const userClearedRef = useRef(false);

  // Handle initial prompt setup and changes
  useEffect(() => {
    // Only update if we have a new prompt and the user hasn't manually cleared it
    if (initialPrompt !== previousPromptRef.current && !userClearedRef.current) {
      previousPromptRef.current = initialPrompt;
      
      if (!isGenerating) {
        if (initialPrompt) {
          // Batch these updates to reduce renders
          if (initialPrompt !== activePrompt) {
            updateSettings({ prompt: initialPrompt });
            setActivePrompt(initialPrompt);
          }
        }
        
        if (lastGeneratedPrompt !== initialPrompt) {
          clearGeneratedImages();
          setGenerationError(null);
        }
      }
    }
  }, [
    initialPrompt,
    updateSettings,
    clearGeneratedImages,
    setGenerationError,
    isGenerating,
    lastGeneratedPrompt,
    setActivePrompt,
    activePrompt
  ]);

  // Reset userCleared flag when component unmounts
  useEffect(() => {
    return () => {
      userClearedRef.current = false;
    };
  }, []);

  // Create a new function that just clears the prompt
  const clearPromptInput = useCallback(() => {
    userClearedRef.current = true;
    previousPromptRef.current = '';
    clearPromptOnly(); // Use the new function from context
  }, [clearPromptOnly]);

  // Keep the original resetPrompt for full reset functionality if needed
  const resetPrompt = useCallback(() => {
    userClearedRef.current = true;
    previousPromptRef.current = '';
    resetState();
  }, [resetState]);

  // Use useMemo to return a stable object reference
  return useMemo(() => ({
    settings,
    updateSettings,
    generatedImages,
    setGeneratedImages,
    clearGeneratedImages,
    isGenerating,
    setIsGenerating,
    startGeneration,
    generationError,
    setGenerationError,
    lastGeneratedPrompt,
    resetPrompt,
    clearPromptInput, // Add the new clearPromptInput function to the return value
    activePrompt
  }), [
    settings,
    updateSettings,
    generatedImages,
    setGeneratedImages,
    clearGeneratedImages,
    isGenerating,
    setIsGenerating,
    startGeneration,
    generationError,
    setGenerationError,
    lastGeneratedPrompt,
    resetPrompt,
    clearPromptInput, // Include in dependency array
    activePrompt
  ]);
};