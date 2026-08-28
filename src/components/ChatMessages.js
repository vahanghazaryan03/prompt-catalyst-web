import React, { useState, useRef, useEffect } from 'react';
import { PreviewImage } from './PreviewImage';
import { LoadingAnimation } from './LoadingAnimation';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import MessageActions from './MessageActions';
import EmptyChat from './EmptyChat';
import LimitReachedMessage from './LimitReachedMessage';
import LoadingMessage from './LoadingMessage';
import { motion, AnimatePresence } from 'framer-motion';

import TypingAnimation from './TypingAnimation';
import { RefreshCw, ArrowUpCircle } from 'lucide-react';
import './CommandStyles.css';
import { Dices, Image as ImageIcon, Cat as Bot, User, Wand2, Eye, Info } from 'lucide-react';
import { logger } from '../utils/logger';

export const ChatMessages = ({ 
  messages, 
  settings, 
  onNewMessages, 
  isGenerating, 
  setIsGenerating, // Add new prop
  onUseInGenerate, 
  isSidebarOpen,
  onPremiumClick,
  currentView,
  onLoginModalOpen,
  onRerunPrompt,  // Add new prop for rerunning prompts
  onSubmit,     // Add prop for submitting text directly
  isVideoMode,    // Add prop to detect video mode
  onEdit        // Add prop for editing prompts
}) => {
  const messagesEndRef = useRef(null);
  const scrollTimeout = useRef(null);
  const [previewStates, setPreviewStates] = useState(() => {
    try {
      const savedStates = localStorage.getItem('previewStates');
      return savedStates ? JSON.parse(savedStates) : {};
    } catch (error) {
      logger.error('Error loading preview states:', error);
      return {};
    }
  });
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [typedMessages, setTypedMessages] = useState(new Set());

 
  
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loadingStates, setLoadingStates] = useState({
    variations: {},
    extend: {},
    shorten: {},
    nextScene: {}
  });

  // Enhanced smooth scroll with fallback
  const scrollToBottom = (useSmooth = true, force = false) => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      if (!messagesEndRef.current) return;

      const container = document.querySelector('.messages-container');
      if (!container) return;

      // For forced scrolls, always use auto behavior for reliability
      if (force) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        return;
      }

      const targetPosition = messagesEndRef.current.offsetTop;
      const startPosition = container.scrollTop;
      const distance = targetPosition - startPosition;
      
      // If distance is small, just jump to it
      if (Math.abs(distance) < 100 || !useSmooth) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        return;
      }

      // Smooth scroll animation
      const duration = 500; // ms
      const start = performance.now();

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smoother animation
        const easeOutCubic = progress => 1 - Math.pow(1 - progress, 3);
        const easedProgress = easeOutCubic(progress);

        const currentPosition = startPosition + (distance * easedProgress);
        container.scrollTop = currentPosition;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }, 50);
  };

  // Handle tab changes
  useEffect(() => {
    if (currentView === 'chat') {
      // When switching to chat, use smooth scroll
      scrollToBottom(true);
    }
  }, [currentView]);

  // Handle message updates
  useEffect(() => {
    if (messages.length > 0) {
      // Use consistent smooth scrolling for all messages
      scrollToBottom(true, false);
    }
  }, [messages, isGenerating]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'previewStates') {
        try {
          const newStates = JSON.parse(e.newValue);
          setPreviewStates(newStates);
        } catch (error) {
          logger.error('Error parsing preview states from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleNextScene = async (prompt, nextSceneDetails) => {
    setLoadingStates(prev => ({
      ...prev,
      nextScene: { ...prev.nextScene, [prompt]: true }
    }));
    
    // Set the global loading state to trigger the chat loading animation
    setIsGenerating(true);
    
    // Log the actual nextSceneDetails to ensure they're being passed correctly
   
    
    onNewMessages?.([
      {
        type: 'user',
        content: `/nextscene ${prompt}`,
        isCommand: true,
        commandType: 'nextscene',
        timestamp: new Date().toISOString()
      }
    ]);
    
    try {
      // Extract details from the object passed from MessageActions
      let userInput = '';
      
      // Handle different formats of nextSceneDetails
      if (typeof nextSceneDetails === 'string') {
        userInput = nextSceneDetails;
      } else if (nextSceneDetails && typeof nextSceneDetails === 'object') {
        // Extract from object - could be { nextSceneDetails: 'text' }
        userInput = nextSceneDetails.nextSceneDetails || '';
      }
      
      // IMPORTANT: Don't use formattedDetails = prompt as fallback
      if (!userInput || userInput === prompt) {
        userInput = 'Continue the scene';
      }
      
      
      
      // Generate continuation prompt using the dedicated next scene endpoint
      const response = await apiService.generateNextScene(prompt, userInput);
      
      if (response.prompt) {
        onNewMessages?.([
          {
            type: 'assistant',
            content: response.prompt,
            timestamp: new Date().toISOString(),
            settings: { ...settings },
            promptType: 'nextscene',
            originalPrompt: prompt
          }
        ]);
        addToast('Next scene generated successfully', 'success');
      }
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isPremiumError = error.response?.data?.error?.includes('premium') || error.response?.status === 403;
      
      if (isRateLimit || isPremiumError) {
        onNewMessages?.([
          {
            type: 'limit',
            content: (
              <LimitReachedMessage 
                type={isPremiumError ? 'premium' : 'prompt'}
                creditInfo={{
                  remaining: error.response?.data?.credits?.remaining,
                  total: error.response?.data?.credits?.total,
                  resetTime: error.response?.data?.credits?.resetTime,
                  type: error.response?.data?.credits?.type
                }}
                limitType={error.response?.data?.limitType || 'daily'} 
                onPremiumClick={onPremiumClick}
                onLoginModalOpen={onLoginModalOpen}
              />
            ),
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        onNewMessages?.([
          {
            type: 'error',
            content: error.message || 'Failed to generate next scene',
            timestamp: new Date().toISOString()
          }
        ]);
        addToast('Failed to generate next scene', 'error');
      }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        nextScene: { ...prev.nextScene, [prompt]: false }
      }));
      
      // Turn off the global loading state
      setIsGenerating(false);
    }
  };

  const handleVariations = async (prompt) => {
    setLoadingStates(prev => ({
      ...prev,
      variations: { ...prev.variations, [prompt]: true }
    }));
    
    // Set the global loading state to trigger the chat loading animation
    setIsGenerating(true);
    
    onNewMessages?.([{
      type: 'user',
      content: `/variations ${prompt}`,
      isCommand: true,
      commandType: 'variations',
      timestamp: new Date().toISOString()
    }]);
    
    try {
      const response = await apiService.generateVariations(prompt);
      if (response.variations) {
        onNewMessages?.([{
          type: 'assistant',
          content: response.variations,
          timestamp: new Date().toISOString(),
          settings: { ...settings },
          promptType: 'variation',
          originalPrompt: prompt
        }]);
        addToast('Variations generated successfully', 'success');
      }
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isPremiumError = error.response?.data?.error?.includes('premium') || error.response?.status === 403;
      
      if (isRateLimit || isPremiumError) {
        onNewMessages?.([{
          type: 'limit',
          content: (
            <LimitReachedMessage 
              type={isPremiumError ? 'premium' : 'prompt'}
              creditInfo={{
                remaining: error.response?.data?.credits?.remaining,
                total: error.response?.data?.credits?.total,
                resetTime: error.response?.data?.credits?.resetTime,
                type: error.response?.data?.credits?.type
              }}
              limitType={error.response?.data?.limitType || 'daily'} 
              onPremiumClick={onPremiumClick}
              onLoginModalOpen={onLoginModalOpen} // Add this prop
            />
          ),
          timestamp: new Date().toISOString()
        }]);
      } else {
        onNewMessages?.([{
          type: 'error',
          content: error.message || 'Failed to generate variations',
          timestamp: new Date().toISOString()
        }]);
        addToast('Failed to generate variations', 'error');
      }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        variations: { ...prev.variations, [prompt]: false }
      }));
      
      // Turn off the global loading state
      setIsGenerating(false);
    }
  };

  const handleExtend = async (prompt, additionalDetails) => {
    setLoadingStates(prev => ({
      ...prev,
      extend: { ...prev.extend, [prompt]: true }
    }));
    
    // Set the global loading state to trigger the chat loading animation
    setIsGenerating(true);
    
    onNewMessages?.([{
      type: 'user',
      content: `/extend ${prompt}`,
      isCommand: true,
      commandType: 'extend',
      timestamp: new Date().toISOString()
    }]);
    
    try {
      const response = await apiService.generateExtended(prompt, additionalDetails);
      if (response.extended) {
        onNewMessages?.([{
          type: 'assistant',
          content: response.extended,
          timestamp: new Date().toISOString(),
          settings: { ...settings },
          promptType: 'extended',
          originalPrompt: prompt
        }]);
        addToast('Extended prompts generated successfully', 'success');
      }
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isPremiumError = error.response?.data?.error?.includes('premium') || error.response?.status === 403;
      
      if (isRateLimit || isPremiumError) {
        onNewMessages?.([{
          type: 'limit',
          content: (
            <LimitReachedMessage 
              type={isPremiumError ? 'premium' : 'prompt'}
              creditInfo={{
                remaining: error.response?.data?.credits?.remaining,
                total: error.response?.data?.credits?.total,
                resetTime: error.response?.data?.credits?.resetTime,
                type: error.response?.data?.credits?.type
              }}
              limitType={error.response?.data?.limitType || 'daily'} 
              onPremiumClick={onPremiumClick}
              onLoginModalOpen={onLoginModalOpen} // Add this prop
            />
          ),
          timestamp: new Date().toISOString()
        }]);
      }else {
        onNewMessages?.([{
          type: 'error',
          content: error.message || 'Failed to extend prompt',
          timestamp: new Date().toISOString()
        }]);
        addToast('Failed to extend prompt', 'error');
      }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        extend: { ...prev.extend, [prompt]: false }
      }));
      
      // Turn off the global loading state
      setIsGenerating(false);
    }
  };

  const handleShorten = async (prompt) => {
    setLoadingStates(prev => ({
      ...prev,
      shorten: { ...prev.shorten, [prompt]: true }
    }));
    
    // Set the global loading state to trigger the chat loading animation
    setIsGenerating(true);
    
    onNewMessages?.([{
      type: 'user',
      content: `/shorten ${prompt}`,
      isCommand: true,
      commandType: 'shorten',
      timestamp: new Date().toISOString()
    }]);
    
    try {
      const response = await apiService.generateShortened(prompt);
      if (response.shortened) {
        onNewMessages?.([{
          type: 'assistant',
          content: response.shortened,
          timestamp: new Date().toISOString(),
          settings: { ...settings },
          promptType: 'shortened',
          originalPrompt: prompt
        }]);
        addToast('Shortened prompts generated successfully', 'success');
      }
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isPremiumError = error.response?.data?.error?.includes('premium') || error.response?.status === 403;
      
      if (isRateLimit || isPremiumError) {
        onNewMessages?.([{
          type: 'limit',
          content: (
            <LimitReachedMessage 
              type={isPremiumError ? 'premium' : 'prompt'}
              creditInfo={{
                remaining: error.response?.data?.credits?.remaining,
                total: error.response?.data?.credits?.total,
                resetTime: error.response?.data?.credits?.resetTime,
                type: error.response?.data?.credits?.type
              }}
              limitType={error.response?.data?.limitType || 'daily'} 
              onPremiumClick={onPremiumClick}
              onLoginModalOpen={onLoginModalOpen} // Add this prop
            />
          ),
          timestamp: new Date().toISOString()
        }]);
      }
     else {
        onNewMessages?.([{
          type: 'error',
          content: error.message || 'Failed to shorten prompt',
          timestamp: new Date().toISOString()
        }]);
        addToast('Failed to shorten prompt', 'error');
      }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        shorten: { ...prev.shorten, [prompt]: false }
      }));
      
      // Turn off the global loading state
      setIsGenerating(false);
    }
  };

  const togglePreview = (prompt) => {
    setPreviewStates(prev => {
      const newState = {
        ...prev,
        [prompt]: !prev[prompt]
      };
      
      try {
        localStorage.setItem('previewStates', JSON.stringify(newState));
      } catch (error) {
        logger.error('Error saving preview states:', error);
      }
      
      return newState;
    });
  };

  const onPreviewGenerated = (prompt, url) => {
    try {
      const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
      const updatedHistory = history.map(entry => {
        let cleanPrompts = [];
        if (typeof entry.prompts === 'string') {
          cleanPrompts = entry.prompts.split('\n').map(p => p.trim());
        } else if (Array.isArray(entry.prompts)) {
          cleanPrompts = entry.prompts.map(p => p.trim());
        } else if (entry.content) {
          cleanPrompts = typeof entry.content === 'string' 
            ? entry.content.split('\n').map(p => p.trim())
            : Array.isArray(entry.content)
              ? entry.content.map(p => p.trim())
              : [];
        }

        if (cleanPrompts.includes(prompt)) {
          return {
            ...entry,
            previewUrls: {
              ...(entry.previewUrls || {}),
              [prompt]: url
            }
          };
        }
        return entry;
      });

      localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      logger.error('Error updating preview in history:', error);
    }
  };

  const handleRerun = (inputText, originalSettings, message) => {
    // Make sure originalSettings includes the promptType and originalPrompt from message if available
    const enhancedSettings = {
      ...originalSettings,
      ...(message?.promptType && { promptType: message.promptType }),
      ...(message?.originalPrompt && { originalPrompt: message.originalPrompt }),
      // Explicitly preserve isVideoMode flag to fix random prompt regeneration in video mode
      isVideoMode: isVideoMode
    };
    
    // Get the most reliable version of the input text based on the message type
    const isPromptOperation = message?.promptType === 'variation' || 
                             message?.promptType === 'shortened' || 
                             message?.promptType === 'extended' ||
                             message?.promptType === 'nextscene';
    
    // For prompt operations, prioritize originalPrompt, otherwise prioritize inputText
    const bestInputText = isPromptOperation
      ? (message?.originalPrompt || originalSettings?.originalPrompt || inputText)
      : (inputText || message?.inputText || originalSettings?.inputText || message?.originalPrompt);
    
    // Direct handling for all prompt operations when in video mode or image mode
    if (message?.originalPrompt) {
      // Rerun Next Scene operation from History View
      if (message?.promptType === 'nextscene' || originalSettings?.promptType === 'nextscene') {
      // When rerunning, don't pass the original prompt as the nextSceneDetails
      // Instead, use the explicit nextSceneDetails from original settings if available
      const nextSceneText = originalSettings?.nextSceneDetails || 'Continue the scene';
      
      
      // Ensure we pass the details as a direct string to prevent loss
      onSubmit(message.originalPrompt, {
      isCommand: true,
      commandType: 'nextscene',
      isNextScene: true,
      promptType: 'nextscene',
      originalPrompt: message.originalPrompt,
      // Pass as simple string
      nextSceneDetails: nextSceneText,
      skipUserMessage: true,
      isVideoMode: true // Force video mode for next scene
      });
      
      return;
      }
      
      // Handle Variations operations
      if (message?.promptType === 'variation') {
        // Execute handleVariations directly with the original prompt
        handleVariations(message.originalPrompt);
        return;
      }
      
      // Handle Shorten operations
      if (message?.promptType === 'shortened') {
        // Execute handleShorten directly with the original prompt
        handleShorten(message.originalPrompt);
        return;
      }
      
      // Handle Extend operations
      if (message?.promptType === 'extended') {
        // Execute handleExtend directly with the original prompt
        handleExtend(message.originalPrompt, {});
        return;
      }
      
      // Handle Edit operations
      if (message?.promptType === 'edited') {
        // For edit operations, we need both the original prompt and edit instructions
        const originalPrompt = message.originalPrompt;
        const editInstructions = message.editInstructions || originalSettings?.editInstructions || 'Edit this prompt';
        
        // Create user message showing the edit command
        const userMessage = {
          type: 'user',
          content: `/edit ${originalPrompt} → ${editInstructions}`,
          isCommand: true,
          commandType: 'edit',
          timestamp: new Date().toISOString(),
          isRerun: true
        };
        
        // Add user message first
        onSubmit(null, {
          skipUserMessage: true,
          newMessages: [userMessage]
        });
        
        // Then submit the edit request
        onSubmit(originalPrompt, {
          isEdited: true,
          originalPrompt: originalPrompt,
          editInstructions: editInstructions,
          skipUserMessage: true,
          isRerun: true
        });
        return;
      }
    }
    
    if (onRerunPrompt && originalSettings) {
      // Check if this is a random prompt
      const isRandomPrompt = enhancedSettings.promptType === 'random' || enhancedSettings.isRandomPrompt === true;
      
      // Check if this is an image analysis message
      const isImageAnalysis = enhancedSettings.isImageAnalysis === true || enhancedSettings.promptType === 'imageAnalysis';
      
      // Check if this is an edited prompt - handle it differently
      if (enhancedSettings.promptType === 'edited' || enhancedSettings.isEdited === true) {
        // For edit operations, we need both the original prompt and edit instructions
        const originalPrompt = enhancedSettings.originalPrompt || message?.originalPrompt || bestInputText;
        const editInstructions = enhancedSettings.editInstructions || message?.editInstructions || 'Edit this prompt';
        
        // Create user message showing the edit command
        const userMessage = {
          type: 'user',
          content: `/edit ${originalPrompt} → ${editInstructions}`,
          isCommand: true,
          commandType: 'edit',
          timestamp: new Date().toISOString(),
          isRerun: true
        };
        
        // Add user message first
        onSubmit(null, {
          skipUserMessage: true,
          newMessages: [userMessage]
        });
        
        // Then submit the edit request
        onSubmit(originalPrompt, {
          isEdited: true,
          originalPrompt: originalPrompt,
          editInstructions: editInstructions,
          skipUserMessage: true,
          isRerun: true
        });
        return;
      }
      
      // Pass this information to the main handler, using the best input text
      onRerunPrompt(bestInputText, enhancedSettings, isRandomPrompt, isImageAnalysis);
    }
  };

  const renderPrompt = (prompt, message, isPartOfMultiple = false) => {
    if (typeof prompt !== 'string') return null;

    // Only show local loading animation if isGenerating is false
    // This avoids duplicate loading animations
    const showLocalLoading = (
      loadingStates.variations[prompt] || 
      loadingStates.extend[prompt] || 
      loadingStates.shorten[prompt] ||
      loadingStates.nextScene[prompt]
    ) && !isGenerating;

    const hasMidjourneyParams = message?.settings?.model === 'midjourney' && message?.midjourneyParams?.length > 0;

    let displayPrompt = prompt;
    let midjourneyParamsDisplay = null;
    
    if (hasMidjourneyParams) {
      const paramString = message.midjourneyParams.join(' ');
      displayPrompt = prompt;
      
      if (!prompt.includes(paramString)) {
        midjourneyParamsDisplay = (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.midjourneyParams.map((param, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-500"
              >
                {param}
              </span>
            ))}
          </div>
        );
      }
    }

  return (
    <div className="modern-card group">
      <div className="p-4">
        <p className="text-[var(--text)] mb-2 leading-relaxed">{displayPrompt}</p>
        {midjourneyParamsDisplay}
        
        <div className="message-actions mt-3">
          {showLocalLoading ? (
            <LoadingAnimation message={
              loadingStates.variations[prompt] ? "Generating variations..." :
              loadingStates.extend[prompt] ? "Extending prompt..." :
              "Shortening prompt..."
            } />
          ) : (
            <MessageActions
              prompt={prompt}
              onVariations={() => handleVariations(prompt)}
              onExtend={(additionalDetails) => handleExtend(prompt, additionalDetails)}
              onShorten={() => handleShorten(prompt)}
              onNextScene={(nextSceneDetails) => {
               
                // Pass the input directly to handleNextScene
                handleNextScene(prompt, nextSceneDetails);
              }}
              onEdit={onEdit}
              onTogglePreview={() => togglePreview(prompt)}
              onUseInGenerate={() => onUseInGenerate(prompt)}
              isGenerating={isGenerating} // Pass isGenerating flag to disable command buttons
              showingPreview={previewStates[prompt]}
              hasMidjourneyParams={hasMidjourneyParams}
              previewImage={message.previewUrl} // Add this if available
              isVideoMode={isVideoMode} // Pass video mode flag
            />
          )}
        </div>

        {previewStates[prompt] && !showLocalLoading && (
  <div className="mt-4">
    <PreviewImage 
      prompt={prompt}
      shouldGenerate={true}
      onPreviewGenerated={onPreviewGenerated}
      onPremiumClick={onPremiumClick}
      onLoginModalOpen={onLoginModalOpen}
      globalGenerationInProgress={isGenerating} // Pass the global generation state
    />
  </div>
)}
      </div>
    </div>
  );
};
const renderMessage = (message, index) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

   if (message.type === 'user') {
  // Check if this is a random prompt request
  if (message.diceRequest) {
    return (
      <div key={index} className="message-group message-group-user">
        <div className="message-content-container message-content-container-user">
          <div className="message-bubble message-bubble-user rounded-full py-2 px-4">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-black text-white">
                <Dices size={16} className="text-white" />
              </div>
            </div>
          </div>
          <div className="message-icon">
            <User size={20} className="text-[var(--textSecondary)] mb-2" />
          </div>
        </div>
        <div className="message-metadata">
          <span>{time}</span>
        </div>
      </div>
    );
  }
  
  // Check if this is an empty message
  if (message.isEmpty) {
    return (
      <div key={index} className="message-group message-group-user">
        <div className="message-content-container message-content-container-user">
          {/* No message bubble for empty messages */}
          <div className="message-icon">
            <User size={20} className="text-[var(--textSecondary)] mb-2" />
          </div>
        </div>
        <div className="message-metadata">
          <span>{time}</span>
        </div>
      </div>
    );
  }
  
  // Check if this is an edit message
  if (message.isEdit) {
    return (
      <div key={index} className="message-group message-group-user">
        <div className="message-content-container message-content-container-user">
          <div className="message-bubble message-bubble-user rounded-full py-2 px-4">
            <div>
              <div className="flex items-center gap-2">
                {message.isRerun && (
                  <div className="inline-flex items-center px-1.5 py-1 rounded text-xs bg-black text-white">
                    <RefreshCw size={12} className="text-white" />
                  </div>
                )}
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                  <Wand2 size={12} className="mr-1" />
                  Edit
                </span>
                <span className="text-sm">{message.content}</span>
              </div>
            </div>
          </div>
          <div className="message-icon">
            <User size={20} className="text-[var(--textSecondary)] mb-2" />
          </div>
        </div>
        <div className="message-metadata">
          <span>{time}</span>
        </div>
      </div>
    );
  }
  
  // Check if this is a command message
  if (message.isCommand) {
    // Extract the command parameters (everything after the command itself)
    const commandParams = message.content.split(' ').slice(1).join(' ');
    
    return (
      <div key={index} className="message-group message-group-user">
        <div className="message-content-container message-content-container-user">
          <div className="message-bubble message-bubble-user rounded-full py-2 px-4">
            <div>
              <div className="flex items-center gap-2">
                {message.isRerun && (
                  <div className="inline-flex items-center px-1.5 py-1 rounded text-xs bg-black text-white">
                    <RefreshCw size={12} className="text-white" />
                  </div>
                )}
                <span className={`command-tag command-tag-${message.commandType}`}>
                  /{message.commandType}
                </span>
                <span>{commandParams}</span>
              </div>
            </div>
          </div>
          <div className="message-icon">
            <User size={20} className="text-[var(--textSecondary)] mb-2" />
          </div>
        </div>
        <div className="message-metadata">
          <span>{time}</span>
        </div>
      </div>
    );
  }
  
  if (message.isImage) {
    return (
      <div key={index} className="message-group message-group-user">
        <div className="message-content-container message-content-container-user">
          <div className="max-w-[400px] modern-card p-2">
          {message.isRerun && (
          <div className="inline-flex items-center px-1.5 py-1 rounded text-xs bg-black text-white mb-2">
          <RefreshCw size={12} className="text-white" />
          </div>
          )}
          <img 
          src={message.content} 
            alt={message.fileName || 'Uploaded image'} 
            className="w-full h-auto max-h-[400px] object-contain rounded-lg"
          />
          </div>
          <div className="message-icon">
            <User size={20} className="text-[var(--textSecondary)] mb-2" />
          </div>
        </div>
        <div className="message-metadata">
          <span>{time}</span>
        </div>
      </div>
    );
  }

  // Check if this is a regular text message (not a command, not an image, not empty)  
  const isRegularTextInput = !message.isCommand && !message.isImage && !message.isEmpty && message.type === 'user' && !message.diceRequest;
  
  // User message rendering
  return (
    <div key={index} className="message-group message-group-user relative">
      <div className="message-content-container message-content-container-user">
        <div className="message-bubble message-bubble-user rounded-full py-2 px-4">
          <div className="flex items-center gap-2">
            {message.isRerun && (
              <div className="inline-flex items-center px-1.5 py-1 rounded text-xs bg-black text-white">
                <RefreshCw size={12} className="text-white" />
              </div>
            )}
            <p className="leading-relaxed">{message.content}</p>
          </div>
        </div>
        <div className="message-icon">
          <User size={20} className="text-[var(--textSecondary)] mb-2" />
        </div>
      </div>
      <div className="message-metadata flex items-center">
        <span>{time}</span>
        
        {/* Add minimalistic rerun button right next to timestamp */}
        {isRegularTextInput && (
        <button
        onClick={() => {
        // Directly submit the text with current settings as if typed
        // This uses the App's main submit function instead of creating a new message
        if (!isGenerating) {
        onSubmit(message.content, {
            useFastMode: localStorage.getItem('useFastMode') === 'true'
            });
          }
        }}
        className="ml-0.5 text-xs text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors flex items-center"
        title={isGenerating ? 'Cannot rerun while generating' : 'Rerun this text with current settings'}
          style={{ cursor: isGenerating ? 'not-allowed' : 'pointer' }}
        >
          <ArrowUpCircle size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

    if (message.type === 'error') {
      return (
        <div key={index} className="message-group message-group-assistant">
          <div className="message-bubble bg-red-500/10 text-red-500">
            <p className="leading-relaxed">{message.content}</p>
          </div>
          <div className="message-metadata">
            <span>{time}</span>
          </div>
        </div>
      );
    }

    // Add the new info message type for conversational responses
    if (message.type === 'info') {
      // Create a unique ID for this message
      const messageId = `${message.timestamp}-${index}`;
      const isTyped = typedMessages.has(messageId);
      
      // Handle typing completion
      const handleTypingComplete = () => {
        setTypedMessages(prev => new Set([...prev, messageId]));
      };
      
      return (
        <AnimatePresence mode="sync">
          <motion.div
            key={`${index}-info`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="message-group message-group-assistant"
          >
            <div className="flex items-start gap-3">
              <Bot size={20} className="text-[var(--primary)] mt-2" />
              <div className="flex-1 modern-card p-5 overflow-hidden shadow-sm">
                {isTyped ? (
                  <div dangerouslySetInnerHTML={{ __html: message.content }} />
                ) : (
                  <TypingAnimation 
                    html={message.content} 
                    typingSpeed={50} 
                    onComplete={handleTypingComplete} 
                  />
                )}
              </div>
            </div>
            <div className="message-metadata ml-9 flex items-center space-x-3">
              <span>{time}</span>
              {/* Rerun button - special styling for random prompts */}
              <button
                onClick={() => {
                  if (!isGenerating) {
                    handleRerun(message.inputText, message.settings, message);
                  }
                }}
                className="flex items-center text-xs text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors"
                title={isGenerating ? 'Cannot rerun while generating' : (message.promptType === 'random' || message.settings?.isRandomPrompt ? "Generate new random prompts" : (message.promptType === 'edited' ? "Try editing again" : "Rerun with same settings"))}
                style={{ cursor: isGenerating ? 'not-allowed' : 'pointer' }}
              >
                <RefreshCw size={12} className="mr-1" />
                <span>{message.promptType === 'random' || message.settings?.isRandomPrompt ? 'New Random' : 
               (message.promptType === 'variation' || message.promptType === 'shortened' || message.promptType === 'extended' || message.promptType === 'nextscene' || message.promptType === 'edited') ? 'Try Again' : 'Rerun'}</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    // Add the new limit message case here:
    if (message.type === 'limit') {
      return (
        <AnimatePresence mode="sync">
          <motion.div
            key={`${index}-limit`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="message-group message-group-assistant"
          >
            <div className="flex items-start gap-3">
              <Bot size={20} className="text-[var(--textSecondary)] mt-2" />
              <div className="flex-1">
                {React.cloneElement(message.content, { 
                  onPremiumClick,
                  onLoginModalOpen 
                })}
              </div>
            </div>
            <div className="message-metadata ml-9 flex items-center space-x-3">
              <span>{time}</span>
              {/* Rerun button with special styling for random prompts */}
              <button
                onClick={() => {
                  if (!isGenerating) {
                    handleRerun(message.inputText, message.settings, message);
                  }
                }}
                className="flex items-center text-xs text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors"
                title={isGenerating ? 'Cannot rerun while generating' : (message.promptType === 'random' || message.settings?.isRandomPrompt ? "Generate new random prompts" : (message.promptType === 'edited' ? "Try editing again" : "Rerun with same settings"))}
                style={{ cursor: isGenerating ? 'not-allowed' : 'pointer' }}
              >
                <RefreshCw size={12} className="mr-1" />
                <span>{message.promptType === 'random' || message.settings?.isRandomPrompt ? 'New Random' : 
                 (message.promptType === 'variation' || message.promptType === 'shortened' || message.promptType === 'extended' || message.promptType === 'nextscene' || message.promptType === 'edited') ? 'Try Again' : 'Rerun'}</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }


    if (message.type === 'assistant') {
  if (message.isRandomPrompts) {
    const prompts = Array.isArray(message.content) 
      ? message.content 
      : typeof message.content === 'string'
        ? message.content.split('\n').filter(p => p.trim())
        : [];

    return (
      <div key={index} className="message-group message-group-assistant">
        <div className="flex items-start gap-3">
          <Bot size={20} className="text-[var(--textSecondary)] mt-2" />
          <div className="max-w-[80%] w-full">
            <div className="modern-card gradient-card">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Dices className="h-5 w-5 text-[var(--primary)]" />
                  <h3 className="font-medium text-[var(--text)]">Random Prompts</h3>
                </div>
                <div className="space-y-4">
                  {prompts.map((prompt, i) => (
  <div key={i} className="bg-[var(--background)]/50 rounded-xl p-4 backdrop-blur-sm">
    <p className="text-[var(--text)] mb-3 leading-relaxed">{prompt}</p>
    <div className="message-actions">
      <MessageActions
          prompt={prompt}
          onVariations={() => handleVariations(prompt)}
          onExtend={(additionalDetails) => handleExtend(prompt, additionalDetails)}
          onShorten={() => handleShorten(prompt)}
          onEdit={onEdit}
          onTogglePreview={() => togglePreview(prompt)}
          onUseInGenerate={() => onUseInGenerate(prompt)}
          isGenerating={isGenerating} // Pass isGenerating flag to disable command buttons
          showingPreview={previewStates[prompt]}
          hasMidjourneyParams={message.settings?.model === 'midjourney' && message.midjourneyParams?.length > 0}
        />
    </div>
    {previewStates[prompt] && (
  <div className="mt-4">
    <PreviewImage 
      prompt={prompt}
      shouldGenerate={true}
      onPreviewGenerated={onPreviewGenerated}
      onPremiumClick={onPremiumClick}
      onLoginModalOpen={onLoginModalOpen}
      globalGenerationInProgress={isGenerating} // Pass the global generation state
    />
  </div>
)}
  </div>
))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="message-metadata ml-9 flex items-center space-x-3">
          <span>{time}</span>
          {/* Rerun button - special styling for random prompts */}
          <button
            onClick={() => {
              if (!isGenerating) {
                handleRerun(message.inputText, message.settings, message);
              }
            }}
            className="flex items-center text-xs text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors"
            title={isGenerating ? 'Cannot rerun while generating' : (message.promptType === 'random' || message.settings?.isRandomPrompt ? "Generate new random prompts" : (message.promptType === 'edited' ? "Try editing again" : "Rerun with same settings"))}
            style={{ cursor: isGenerating ? 'not-allowed' : 'pointer' }}
          >
            <RefreshCw size={12} className="mr-1" />
            <span>{message.promptType === 'random' || message.settings?.isRandomPrompt ? 'New Random' : 
                 (message.promptType === 'variation' || message.promptType === 'shortened' || message.promptType === 'extended' || message.promptType === 'nextscene' || message.promptType === 'edited') ? 'Try Again' : 'Rerun'}</span>
          </button>
        </div>
      </div>
    );
  }

      if (message.isImageAnalysis) {
        const prompts = Array.isArray(message.content) 
          ? message.content 
          : message.content.split('\n').filter(p => p.trim());

        // Create merged settings to ensure imageUrl is included for rerun
        const mergedSettings = {
          ...message.settings,
          isImageAnalysis: true,
          fileName: message.fileName,
          imageUrl: message.imageUrl
        };

        return (
          <div key={index} className="message-group message-group-assistant">
            <div className="flex items-start gap-3">
              <Bot size={20} className="text-[var(--textSecondary)] mt-2" />
              <div className="max-w-[80%] w-full">
                <div className="modern-card gradient-card">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="h-5 w-5 text-[var(--primary)]" />
                        <h3 className="font-medium text-[var(--text)]">
                          Analysis Results {message.fileName ? `for: ${message.fileName}` : ''}
                        </h3>
                      </div>
                    <div className="space-y-4">
                      {prompts.map((prompt, i) => (
                        <div key={i} className="bg-[var(--background)]/50 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-[var(--text)] mb-3 leading-relaxed">{prompt}</p>
                          <div className="message-actions">
                           <MessageActions
  prompt={prompt}
  onVariations={() => handleVariations(prompt)}
  onExtend={(additionalDetails) => handleExtend(prompt, additionalDetails)}
  onShorten={() => handleShorten(prompt)}
  onEdit={onEdit}
  onTogglePreview={() => togglePreview(prompt)}
  onUseInGenerate={() => onUseInGenerate(prompt)}
  isGenerating={isGenerating} // Pass isGenerating flag to disable command buttons
  showingPreview={previewStates[prompt]}
  hasMidjourneyParams={message.settings?.model === 'midjourney' && message.midjourneyParams?.length > 0}
/>
                          </div>
                          {previewStates[prompt] && (
  <div className="mt-4">
    <PreviewImage 
      prompt={prompt}
      shouldGenerate={true}
      onPreviewGenerated={onPreviewGenerated}
      onPremiumClick={onPremiumClick}
      onLoginModalOpen={onLoginModalOpen}
      globalGenerationInProgress={isGenerating} // Pass the global generation state
    />
  </div>
)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="message-metadata ml-9 flex items-center space-x-3">
            <span>{time}</span>
            {/* Rerun button with regular styling */}
            <button
              onClick={() => {
                if (!isGenerating) {
                  handleRerun(message.inputText, mergedSettings, message);
                }
              }}
              className="flex items-center text-xs text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors"
              title={isGenerating ? 'Cannot analyze this image while generating' : 'Try this image analysis again'}
              style={{ cursor: isGenerating ? 'not-allowed' : 'pointer' }}
            >
            <RefreshCw size={12} className="mr-1" />
            <span>Try Again</span>
            </button>
            </div>
          </div>
        );
      }

      // Regular assistant messages
     const prompts = Array.isArray(message.content) 
  ? message.content 
  : (typeof message.content === 'string' 
      ? message.content.split('\n').filter(p => p.trim())
      : [message.content?.toString() || '']);

return (
  <div key={index} className="message-group message-group-assistant">
    <div className="flex items-start gap-3">
      <Bot size={20} className="text-[var(--textSecondary)] mt-2" />
      <div className="flex flex-col space-y-4 max-w-[80%] w-full">
        {prompts.map((prompt, promptIndex) => (
          prompt?.trim() && (
            <div key={`${index}-${promptIndex}-${prompt.substring(0, 20)}`}>
              {renderPrompt(prompt.trim(), message)}
            </div>
          )
        ))}
      </div>
    </div>
      <div className="message-metadata ml-9 flex items-center space-x-3">
        <span>{time}</span>
        {/* Rerun button with regular styling */}
        <button
        onClick={() => {
          if (!isGenerating) {
            handleRerun(message.inputText, message.settings, message);
          }
        }}
        className="flex items-center text-xs text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors"
        title={isGenerating ? 'Cannot rerun while generating' : (message.promptType === 'random' || message.settings?.isRandomPrompt ? 'Generate new random prompts' : 
               (message.promptType === 'variation' || message.promptType === 'shortened' || message.promptType === 'extended' || message.promptType === 'nextscene' || message.promptType === 'edited') ? 'Try again' : 'Rerun')}
        style={{ cursor: isGenerating ? 'not-allowed' : 'pointer' }}
        >
          <RefreshCw size={12} className="mr-1" />
          <span>{message.promptType === 'random' || message.settings?.isRandomPrompt ? 'New Random' : 
                 (message.promptType === 'variation' || message.promptType === 'shortened' || message.promptType === 'extended' || message.promptType === 'nextscene' || message.promptType === 'edited') ? 'Try Again' : 'Rerun'}</span>
        </button>
      </div>
  </div>
);
    }

    return null;
  };

  return (
    <div className={`messages-container h-full ${!isSidebarOpen ? 'messages-container-centered' : ''}`}>
      {messages.length === 0 ? (
        <EmptyChat />
      ) : (
        <>
          <AnimatePresence mode="wait">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.timestamp}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  y: -20,
                  transition: {
                    duration: 0.3,
                    ease: "easeInOut"
                  }
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut"
                }}
                className={`message-wrapper ${!isSidebarOpen ? 'message-wrapper-centered' : ''}`}
              >
                {renderMessage(message, index)}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isGenerating && (
            <LoadingMessage 
              settings={settings} 
              extraInfo={settings?.promptAmount > 1 ? `Generating ${settings.promptAmount} prompts` : undefined} 
            />
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
      
    </div>
  );
};

export default ChatMessages;