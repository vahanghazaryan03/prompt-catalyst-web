import React, { useState, useEffect, useRef } from 'react';
import { Image, Dices, X, Send, ArrowUp, ImageUp, Zap, HelpCircle, Terminal, Copy, Minimize2, LayoutPanelLeft, ChevronUp, ChevronDown, Reply } from 'lucide-react';
import { ImageAnalysis } from './ImageAnalysis';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import LimitReachedMessage from './LimitReachedMessage';
import { isConversationalInput, generateConversationalResponse } from '../utils/promptUtils';
import SimpleInputHintTooltip from './SimpleInputHintTooltip';
import InputLengthWarning from './InputLengthWarning';
import CommandsDropup from './CommandsDropup';
import './InputArea.css';



export const InputArea = ({ onSubmit, isSettingsOpen, isVideoMode, disabled, onCommandStateChange, onLoginModalOpen, onPremiumClick, onTopUpClick, editingPrompt, onCancelEdit }) => {
  const [isCommandsDropdownOpen, setIsCommandsDropdownOpen] = useState(false);
  const commandButtonRef = useRef(null);
  
  // Debug state changes
  useEffect(() => {
    console.log('InputArea: isCommandsDropdownOpen changed to:', isCommandsDropdownOpen);
  }, [isCommandsDropdownOpen]);
  const [input, setInput] = useState('');
  const [isCommandActive, setIsCommandActive] = useState(false);
  const [isImageAnalysisOpen, setIsImageAnalysisOpen] = useState(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);
  const { user } = useAuth();
  
  // New states for input guidance
  const [showInputHint, setShowInputHint] = useState(() => {
    // Show by default if it hasn't been dismissed before
    return localStorage.getItem('inputHintSeen') !== 'true';
  });
  
  // Input length warning
  const RECOMMENDED_LENGTH = 500; // Recommended character length
  const MAX_INPUT_LENGTH = 1500; // Maximum allowed characters
  const WARNING_THRESHOLD = 350; // Show warning at this length
  const [showLengthWarning, setShowLengthWarning] = useState(false);
  
  // Reference to textarea elements
  const textareaRef = useRef(null);
  const mobileTextareaRef = useRef(null);
  
  // Function to adjust textarea height
  const adjustTextareaHeight = (textareaElement) => {
    if (textareaElement) {
      // Store the current scroll position
      const scrollTop = textareaElement.scrollTop;
      
      // Reset height to auto first to get the proper scrollHeight
      textareaElement.style.height = 'auto';
      
      // Set the height based on content, with min/max constraints
      const newHeight = Math.min(150, Math.max(46, textareaElement.scrollHeight));
      textareaElement.style.height = `${newHeight}px`;
      
      // Handle scrollbar visibility
      if (textareaElement.scrollHeight > newHeight) {
        // Content exceeds visible area, make sure scrollbar is visible
        textareaElement.classList.add('show-scrollbar');
      } else {
        // Content fits in visible area, no need for scrollbar
        textareaElement.classList.remove('show-scrollbar');
      }
      
      // Restore the scroll position
      textareaElement.scrollTop = scrollTop;
    }
  };
  
  // Function to scroll to top of textarea
  const scrollToTop = (textareaElement) => {
    if (textareaElement) {
      textareaElement.scrollTop = 0;
    }
  };
  
  // Function to scroll to bottom of textarea
  const scrollToBottom = (textareaElement) => {
    if (textareaElement) {
      textareaElement.scrollTop = textareaElement.scrollHeight;
    }
  };
  
  // Adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight(textareaRef.current);
    adjustTextareaHeight(mobileTextareaRef.current);
  }, [input]);
  
  // Initial height adjustment when component mounts
  useEffect(() => {
    adjustTextareaHeight(textareaRef.current);
    adjustTextareaHeight(mobileTextareaRef.current);
  }, []);
  
  // Check input length and show warning if needed
  useEffect(() => {
    // Check if input is a command operation
    const isCommand = input.startsWith('/') && 
      ["/variations", "/shorten", "/extend", "/nextscene"].some(cmd => input.toLowerCase().startsWith(cmd));
    
    // Only show warning for regular inputs or if over the absolute max limit
    if (!isCommand && input.length >= WARNING_THRESHOLD) {
      setShowLengthWarning(true);
    } else if (input.length >= MAX_INPUT_LENGTH) {
      // Always show warning when approaching absolute max limit
      setShowLengthWarning(true);
    } else {
      setShowLengthWarning(false);
    }
  }, [input]);
  
  // Placeholder examples for cycling
  const placeholderExamples = [
    "Describe what you'd like to generate (optional)",
    "e.g. sunset over mountains with a cabin",
    "e.g. rugged warrior, fur-lined cloak",
    "e.g. fantasy castle on a floating island"
  ];
  
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // Cycle through example placeholders
  useEffect(() => {
    // Only cycle if the input is empty
    if (input === '') {
      const interval = setInterval(() => {
        setPlaceholderIndex((prevIndex) => 
          prevIndex === placeholderExamples.length - 1 ? 0 : prevIndex + 1
        );
      }, 3500); // Change every 3.5 seconds
      
      return () => clearInterval(interval);
    }
  }, [input, placeholderExamples.length]);
  
  const [useFastMode, setUseFastMode] = useState(() => {
    // Only use the saved preference if it exists
    const savedMode = localStorage.getItem('useFastMode');
    if (savedMode === null) {
      // For first time users, default to true and save it
      localStorage.setItem('useFastMode', 'true');
      return true;
    }
    // Return the user's saved preference
    return savedMode === 'true';
  });
  const { addToast } = useToast();

  // Handle edit submission
  const handleEditSubmit = async (editInstructions) => {
    if (!editingPrompt || !editInstructions.trim()) {
      addToast('Please provide editing instructions.', 'error');
      return;
    }

    // Create user message showing the edit request - format as command like other operations
    const userMessage = {
      type: 'user',
      content: `/edit ${editingPrompt} → ${editInstructions}`,
      isCommand: true,
      commandType: 'edit',
      timestamp: new Date().toISOString()
    };
    
    // Add user message first
    onSubmit(null, {
      skipUserMessage: true,
      newMessages: [userMessage]
    });
    
    // Now call the main submit handler with edit parameters - this will follow the same flow as variations/shorten/etc
    onSubmit(editingPrompt, {
      isEdited: true,
      originalPrompt: editingPrompt,
      editInstructions: editInstructions,
      skipUserMessage: true
    });
    
    // Clear the input and exit edit mode
    setInput('');
    onCancelEdit?.();
  };

  // Handle image analysis button click - check auth first
  const handleImageAnalysisClick = () => {
    if (!user) {
      // User not logged in, open login modal
      if (onLoginModalOpen) {
        onLoginModalOpen('login');
      }
      return;
    }
    // User is logged in, proceed with image analysis
    setIsImageAnalysisOpen(true);
  };

  // Check for command whenever input changes
  useEffect(() => {
    // More comprehensive command detection
    const firstWord = input.trim().split(' ')[0].toLowerCase();
    const isCommand = input.trim().startsWith('/') && 
      ["/variations", "/shorten", "/extend", "/nextscene"].includes(firstWord);
    
    setIsCommandActive(isCommand);
    
    // Notify parent component about command state change
    if (onCommandStateChange) {
      onCommandStateChange(isCommand);
    }
  }, [input, onCommandStateChange, isVideoMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only block submission if disabled or generating random prompts
    if (disabled || isGeneratingRandom) return;
    
    // Prevent submission if over absolute maximum length
    if (input.length > MAX_INPUT_LENGTH) {
      setShowLengthWarning(true); // Force show the warning
      return;
    }
    
    const trimmedInput = input.trim();
    
    // Handle edit mode
    if (editingPrompt && trimmedInput) {
      handleEditSubmit(trimmedInput);
      return;
    }
    
    // Check for commands
    if (trimmedInput.startsWith('/')) {
      // Removed logging
      handleCommand(trimmedInput);
      return;
    }
    
    // Check if the input is conversational (only when there's input)
    if (trimmedInput && isConversationalInput(trimmedInput)) {
      // Create a user message
      const userMessage = {
        type: 'user',
        content: input.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Create a helper message explaining the purpose of the tool
      const helperMessage = {
        type: 'info',
        content: generateConversationalResponse(input.trim()),
        timestamp: new Date().toISOString()
      };
      
      // Submit both messages
      onSubmit(null, {
        skipUserMessage: true,
        newMessages: [userMessage, helperMessage]
      });
    } else {
      // For empty inputs, still submit but with the empty input
      // The user icon will show but no message bubble thanks to the isEmpty flag
      if (isVideoMode) {
      // Double-check for commands that might have slipped through
      if (trimmedInput.startsWith('/')) {
        // Removed logging
        // Let the handleCommand function handle commands correctly
        handleCommand(trimmedInput);
      } else {
          // This is a regular input in video mode
          const videoParams = {
            isVideoMode: true, // Explicitly mark as video mode
            isCommand: false   // Explicitly mark as not a command
          };
          // Removed logging
          onSubmit(trimmedInput, videoParams);
        }
      } else {
        // Include useFastMode for regular mode
        const imageParams = { 
          useFastMode,
        isVideoMode: false, // Explicitly mark as image mode
        isCommand: false    // Explicitly mark as not a command
        };
        // Removed logging
      onSubmit(trimmedInput, imageParams);
      }
    }
    
    setInput('');
  };

  const toggleFastMode = () => {
    const newMode = !useFastMode;
    setUseFastMode(newMode);
    // Save to localStorage
    localStorage.setItem('useFastMode', newMode.toString());
  };

  const handleRandomPrompts = async () => {
    if (disabled || isGeneratingRandom) return;
    
    setIsGeneratingRandom(true);
    
    // Show user message immediately
    const userMessage = {
      type: 'user',
      content: isVideoMode ? 'Generate random video scene description' : 'Generate random prompts',
      diceRequest: true,
      timestamp: new Date().toISOString()
    };
    
    // Add user message immediately and set loading state (bundled to prevent flashing)
    onSubmit(null, {
      skipUserMessage: true,
      newMessages: [userMessage],
      isLoading: true // Set loading state with the user message
    });
    
    try {
      // Use video-specific endpoint if in video mode, otherwise use regular endpoint
      const response = isVideoMode
        ? await apiService.generateVideoPrompt({
            description: '',
            style: 'cinematic',
            cameraMovement: 'not_specified',
            promptLength: 'medium',
          })
        : await apiService.generateRandomPrompts();
        
      // Handle response based on which API was called
      const prompts = isVideoMode ? response.prompt : response.prompts;
      
      if (prompts) {
        // Create assistant message with the results
        const assistantMessage = {
          type: 'assistant',
          content: prompts,
          timestamp: new Date().toISOString(),
          promptType: 'random',
          settings: { isRandomPrompt: true },
          isRandomPrompts: !isVideoMode
        };
        
        // Add assistant message through main flow to clear loading state
        onSubmit(assistantMessage.content, {
          isRandom: true,
          skipUserMessage: true,
          settings: assistantMessage.settings
        });
        
        // Track random prompts
        try {
          const randomPromptCount = parseInt(localStorage.getItem('randomPromptCount') || '0');
          localStorage.setItem('randomPromptCount', (randomPromptCount + 1).toString());
        } catch (e) {
          // Ignore errors
        }
      }
    } catch (error) {
      if (
        error.response?.status === 429 ||
        error.response?.status === 403 ||
        error.response?.data?.error?.includes('premium')
      ) {
        const isPremiumError = error.response?.status === 403 || error.response?.data?.error?.includes('premium');
        
        const limitMessage = {
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
              onTopUpClick={onTopUpClick}
              onLoginModalOpen={onLoginModalOpen}
            />
          ),
          timestamp: new Date().toISOString()
        };
        
        // Use limitMessage parameter to properly clear loading state
        onSubmit(null, {
          skipUserMessage: true,
          limitMessage: limitMessage
        });
      } else {
        const errorMessage = {
          type: 'error',
          content: error.message || 'Failed to generate random prompts',
          timestamp: new Date().toISOString()
        };
        
        onSubmit(null, {
          skipUserMessage: true,
          newMessages: [errorMessage]
        });
      }
    } finally {
      setIsGeneratingRandom(false);
    }
  };

  const handleImageAnalysisComplete = (userMessage, assistantMessage, error) => {
    setIsImageAnalysisOpen(false);
    
    if (error) {
      // Handle special error cases from credit pre-check
      if (error.isInsufficientCredits) {
        // Handle insufficient credits - show in chat
        const limitMessage = {
          type: 'limit',
          content: (
            <LimitReachedMessage 
              type="prompt"
              limitType="credits"
              onPremiumClick={onPremiumClick}
              onTopUpClick={onTopUpClick}
              onLoginModalOpen={onLoginModalOpen}
            />
          ),
          timestamp: new Date().toISOString()
        };
        
        onSubmit(null, { 
          skipUserMessage: true,
          limitMessage: limitMessage 
        });
        return;
      }
      
      if (error.isPremiumRequired) {
        // Trigger premium modal
        if (onPremiumClick) {
          onPremiumClick();
        }
        return;
      }
      
      if (error.isTopUpRequired) {
        // Trigger top-up modal
        if (onTopUpClick) {
          onTopUpClick();
        }
        return;
      }
      
      if (error.isLoginRequired) {
        // Trigger login modal
        if (onLoginModalOpen) {
          onLoginModalOpen(error.view || 'login');
        }
        return;
      }
      
      // Handle API error responses (existing logic)
      if (
        error.response?.status === 429 ||
        error.response?.status === 403 ||
        error.response?.data?.error?.includes('premium')
      ) {
        const isPremiumError = error.response?.status === 403 || error.response?.data?.error?.includes('premium');
        
        const limitMessage = {
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
            />
          ),
          timestamp: new Date().toISOString()
        };
        
        onSubmit(null, { 
          skipUserMessage: true,
          limitMessage: limitMessage 
        });
        return;
      }
    }
    
    if (onSubmit && userMessage && assistantMessage) {
      onSubmit(userMessage.content, {
        isImageAnalysis: true,
        isUserMessage: true,
        fileName: userMessage.fileName,
        skipUserMessage: true,
        timestamp: new Date().toISOString()
      });

      onSubmit(assistantMessage.content, {
        isImageAnalysis: true,
        fileName: assistantMessage.fileName,
        skipUserMessage: true,
        timestamp: new Date().toISOString(),
        imageUrl: userMessage.content
      });
    }
  };

  // Command handling
  const handleCommand = (commandInput) => {
    const [command, ...args] = commandInput.split(' ');
    const prompt = args.join(' ');
    
    // Format the user message to show it was a command
    const userMessage = {
      type: 'user',
      content: commandInput,
      isCommand: true,
      commandType: command.substring(1), // Remove the / prefix
      timestamp: new Date().toISOString()
    };
    
    // Removed logging
    
    // Handle different commands
    switch (command.toLowerCase()) {
      case '/variations':
        if (!prompt) {
          addToast('Please provide a prompt after /variations', 'error');
          return;
        }
        
        onSubmit(null, {
          skipUserMessage: true,
          newMessages: [userMessage]
        });
        
        // Create operation parameters - set operation flag as highest priority
        const variationParams = { 
          // Command operation flags - these should take precedence
          isCommand: true,
          commandType: 'variations',
          isVariation: true,
          // Supporting parameters
          originalPrompt: prompt,
          skipUserMessage: true,
          // Make video mode the lowest priority parameter
          isVideoMode: isVideoMode
        };
        
        // Removed logging
        onSubmit(prompt, variationParams);
        break;
        
      case '/shorten':
        if (!prompt) {
          addToast('Please provide a prompt after /shorten', 'error');
          return;
        }
        
        onSubmit(null, {
          skipUserMessage: true,
          newMessages: [userMessage]
        });
        
        // Create operation parameters - set operation flag as highest priority
        const shortenParams = { 
          // Command operation flags - these should take precedence
          isCommand: true,
          commandType: 'shorten',
          isShortened: true,
          // Supporting parameters
          originalPrompt: prompt,
          skipUserMessage: true,
          // Make video mode the lowest priority parameter
          isVideoMode: isVideoMode
        };
        
        // Removed logging
        onSubmit(prompt, shortenParams);
        break;
        
      case '/extend':
        if (!isVideoMode) { // Only process extend command if not in video mode
          if (!prompt) {
            addToast('Please provide a prompt after /extend', 'error');
            return;
          }
          
          onSubmit(null, {
            skipUserMessage: true,
            newMessages: [userMessage]
          });
          
          // Create operation parameters - set operation flag as highest priority
          const extendParams = { 
            // Command operation flags - these should take precedence
            isCommand: true,
            commandType: 'extend',
            isExtended: true,
            // Supporting parameters
            originalPrompt: prompt,
            skipUserMessage: true,
            // Explicitly set video mode to false for extend
            isVideoMode: false
          };
          
          // Removed logging
          onSubmit(prompt, extendParams);
        } else {
          addToast('The /extend command is not available in video mode. Try /nextscene instead.', 'error');
        }
        break;
        
      case '/nextscene':
        if (isVideoMode) { // Only process nextscene command in video mode
          if (!prompt) {
            addToast('Please provide a prompt after /nextscene', 'error');
            return;
          }
          
          onSubmit(null, {
            skipUserMessage: true,
            newMessages: [userMessage]
          });
          
          // Create operation parameters - set operation flag as highest priority
          const nextSceneParams = { 
            // Command operation flags - these should take precedence
            isCommand: true,
            commandType: 'nextscene',
            isNextScene: true,
            // Supporting parameters
            originalPrompt: prompt,
            skipUserMessage: true,
            nextSceneDetails: prompt,
            // Video mode must be true for next scene
            isVideoMode: true,
            // Set promptType for consistent "Try Again" button display
            promptType: 'nextscene'
          };
          
          // Removed logging
          onSubmit(prompt, nextSceneParams);
        } else {
          addToast('The /nextscene command is only available in video mode.', 'error');
        }
        break;
        
      default:
        addToast(`Unknown command: ${command}`, 'error');
        return;
    }
    
    setInput('');
  };
  
  const insertCommand = (command) => {
    const newInput = command + ' ';
    setInput(newInput);
    
    // Immediately update command state
    setIsCommandActive(true);
    if (onCommandStateChange) {
      onCommandStateChange(true);
    }
    
    // Focus the textarea after inserting a command
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      } else if (mobileTextareaRef.current) {
        mobileTextareaRef.current.focus();
      }
    }, 10);
  };
  




  // Tooltip component for explaining the lightning button
  const Tooltip = ({ children, text }) => {
    return (
      <div className="group relative">
        {children}
        <div className="absolute bottom-full mb-2 w-48 input-area-tooltip text-xs rounded p-2 opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 ease-out pointer-events-none shadow-lg z-50">
          {text}
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isImageAnalysisOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="modern-card glass w-full max-w-3xl overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--border)]">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[var(--text)]">Image to Prompt</h3>
                  <button 
                    onClick={() => setIsImageAnalysisOpen(false)}
                    className="p-1 hover:bg-[var(--dropdownHover)] rounded-full transition-colors"
                  >
                    <X className="h-6 w-6 text-[var(--textSecondary)]" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <ImageAnalysis onAnalysisComplete={handleImageAnalysisComplete} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input length warning that appears when input is too long */}
      <InputLengthWarning
        isVisible={showLengthWarning && ((input.startsWith('/') && input.length >= MAX_INPUT_LENGTH * 0.9) || !input.startsWith('/'))}
        onDismiss={() => setShowLengthWarning(false)}
        currentLength={input.length}
        recommendedLength={RECOMMENDED_LENGTH}
        maxLength={MAX_INPUT_LENGTH}
      />
      
      {/* New simplified tooltip that appears directly, without complex positioning */}
      <SimpleInputHintTooltip
        isVisible={showInputHint && !showLengthWarning} // Don't show both tooltips at once
        onDismiss={() => {
          setShowInputHint(false);
          localStorage.setItem('inputHintSeen', 'true');
        }}
      />
      
      {/* Edit Mode Indicator */}
      <AnimatePresence>
        {editingPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ 
              opacity: 1, 
              height: "auto",
              marginBottom: 12,
              transition: {
                duration: 0.25,
                ease: "easeOut"
              }
            }}
            exit={{ 
              opacity: 0, 
              height: 0,
              marginBottom: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn"
              }
            }}
            className="mx-4 overflow-hidden"
          >
            <div className="bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg p-4 shadow-sm animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Reply className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text)]">Edit Prompt</span>
                </div>
                
                <button
                  onClick={onCancelEdit}
                  className="w-6 h-6 rounded-md hover:bg-[var(--dropdownHover)] flex items-center justify-center text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors duration-150"
                  title="Cancel editing"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              
              {/* Prompt display */}
              <div className="bg-[var(--inputBackground)] border border-[var(--border)] rounded-md p-3 mb-3">
                <p className="text-sm text-[var(--text)] leading-relaxed">
                  {editingPrompt}
                </p>
              </div>
              
              {/* Instruction */}
              <p className="text-xs text-[var(--textSecondary)]">
                Describe what you'd like to change about this prompt...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CommandsDropup 
        isOpen={isCommandsDropdownOpen}
        onClose={() => setIsCommandsDropdownOpen(false)}
        onInsertCommand={insertCommand}
        buttonRef={commandButtonRef}
        isVideoMode={isVideoMode}
      />
      
      <form
        onSubmit={handleSubmit}
       className="relative p-4 border-t border-[var(--border)] glass shadow-md rounded-t-xl transition-shadow duration-300"
      >
        <div className="max-w-3xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden sm:flex flex-row items-center gap-3">
            <div className="flex gap-3">
              {!isVideoMode && (
                <button
                  type="button"
                  onClick={handleImageAnalysisClick}
                  className="modern-button p-2 bg-transparent hover:bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)] rounded-full transition-colors duration-200"
                  disabled={disabled || isGeneratingRandom}
                  title="Image to Prompt"
                >
                  <ImageUp className="h-5 w-5" />
                </button>
              )}
              
              <button
                type="button"
                onClick={handleRandomPrompts}
                className={`p-2 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-full transition-colors duration-200 ${
                  isGeneratingRandom ? 'animate-spin' : ''
                }`}
                disabled={disabled || isGeneratingRandom}
                title={isVideoMode ? "Generate Random Video Scene" : "Generate Random Prompts"}
              >
                <Dices className="h-5 w-5" />
              </button>
              
              <button
                type="button"
                ref={commandButtonRef}
                id="command-button" /* Add ID for direct DOM access */
                onClick={() => setIsCommandsDropdownOpen(!isCommandsDropdownOpen)}
                className="p-2 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-full transition-colors duration-200"
                disabled={disabled || isGeneratingRandom}
                title="Command Menu"
              >
                <Terminal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative group">
                {/* Scroll buttons for desktop */}
                <div className="scroll-buttons absolute right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-1 pointer-events-none z-10">
                  <button 
                    type="button"
                    className="p-1 bg-[var(--inputBackground)] rounded-full shadow-sm text-[var(--textSecondary)] hover:text-[var(--text)] pointer-events-auto"
                    onClick={() => scrollToTop(textareaRef.current)}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button 
                    type="button"
                    className="p-1 bg-[var(--inputBackground)] rounded-full shadow-sm text-[var(--textSecondary)] hover:text-[var(--text)] pointer-events-auto"
                    onClick={() => scrollToBottom(textareaRef.current)}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                
                <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={editingPrompt ? "Describe what you'd like to change..." : (isVideoMode ? "Describe your video scene..." : placeholderExamples[placeholderIndex])}
                disabled={disabled || isGeneratingRandom}
                onFocus={() => {
                if (localStorage.getItem('inputHintSeen') !== 'true') {
                setShowInputHint(true);
                }
                }}
                maxLength={MAX_INPUT_LENGTH}
                rows={Math.min(6, Math.max(1, (input.split('\n').length || 1)))}
                style={(() => {
                const baseStyle = {
                minHeight: '46px',
                maxHeight: isVideoMode ? '100px' : '150px', // Allow growth in video mode but with lower max height
                height: 'auto', // Allow auto height for both modes
                };
                
                if (!input.startsWith('/')) return baseStyle;
                
                // Add special style only when command is present
                return {
                ...baseStyle,
                fontWeight: 600,
                letterSpacing: '0.01em'
                };
                })()}
                className={(() => {
                let baseClasses = "adaptive-textarea w-full px-4 py-3 pl-10 bg-[var(--inputBackground)] rounded-full border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors duration-200 shadow-inner";
                
                // No more fixed height constraints for video mode
                
                if (!input.startsWith('/')) return `${baseClasses} text-[var(--text)]`;
                
                const spaceIndex = input.indexOf(' ');
                const command = spaceIndex > 0 ? input.substring(0, spaceIndex) : input;
                
                switch(command.toLowerCase()) {
                    case '/variations': return `${baseClasses} text-blue-500`;
                    case '/shorten': return `${baseClasses} text-green-500`;
                    case '/extend': return `${baseClasses} text-purple-500`;
                    case '/nextscene': return `${baseClasses} text-purple-500`;
                    default: return `${baseClasses} text-[var(--text)]`;
                  }
                    })()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  onInput={(e) => {
                    adjustTextareaHeight(e.target);
                  }}
                />
                {!editingPrompt && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowInputHint(!showInputHint);
                    }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-transparent hover:bg-[var(--primary)]/10 transition-colors"
                    title="Input field tips"
                  >
                    <HelpCircle className="h-3.5 w-3.5 mb-0.5 text-[var(--textSecondary)]" />
                  </button>
                )}
                
                {/* Character count indicator - only shows when approaching recommendation or limit */}
                {(() => {
                // Check if input is a command operation
                const isCommand = input.startsWith('/') && 
                ["/variations", "/shorten", "/extend", "/nextscene"].some(cmd => input.toLowerCase().startsWith(cmd));
                
                // Only show counter for regular inputs or when approaching max limit
                if ((!isCommand && input.length > WARNING_THRESHOLD) || input.length > MAX_INPUT_LENGTH * 0.8) {
                return (
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium ${input.length >= MAX_INPUT_LENGTH * 0.9 ? 'text-red-500' : input.length > RECOMMENDED_LENGTH ? 'text-amber-500' : 'text-blue-500'}`}>
                {input.length}{input.length > RECOMMENDED_LENGTH ? `/${MAX_INPUT_LENGTH}` : `/${RECOMMENDED_LENGTH}`}
                </div>
                );
                }
                return null;
                })()} 
                
                {/* Remove command highlighter overlay completely */}
              </div>
            </div>

            {!isVideoMode && (
              <Tooltip text={useFastMode ? "Switch to quality mode (slower but better results)" : "Switch to fast mode (quicker but simpler results)"}>
                <button
                  type="button"
                  onClick={toggleFastMode}
                  className="p-2 mx-1 rounded-full transition-colors duration-200 bg-transparent hover:bg-[var(--dropdownHover)]"
                  disabled={disabled || isGeneratingRandom}
                >
                  <Zap className={`h-5 w-5 ${useFastMode ? 'text-green-500 fill-green-500' : 'text-[var(--textSecondary)]'}`} />
                </button>
              </Tooltip>
            )}

            <button
              type="submit"
              disabled={disabled || isGeneratingRandom}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
                !(disabled || isGeneratingRandom)
                  ? 'bg-[var(--primary)] text-black hover:opacity-90 shadow-md'
                  : 'bg-[var(--secondary)] text-[var(--textSecondary)] cursor-not-allowed'
              }`}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Layout */}
          <div className="flex sm:hidden flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <div className="relative w-full group">
                  {/* Scroll buttons for mobile */}
                  <div className="scroll-buttons absolute right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-1 pointer-events-none z-10">
                    <button 
                      type="button"
                      className="p-1 bg-[var(--inputBackground)] rounded-full shadow-sm text-[var(--textSecondary)] hover:text-[var(--text)] pointer-events-auto"
                      onClick={() => scrollToTop(mobileTextareaRef.current)}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button 
                      type="button"
                      className="p-1 bg-[var(--inputBackground)] rounded-full shadow-sm text-[var(--textSecondary)] hover:text-[var(--text)] pointer-events-auto"
                      onClick={() => scrollToBottom(mobileTextareaRef.current)}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <textarea
                    ref={mobileTextareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={editingPrompt ? "Describe what you'd like to change..." : (isVideoMode ? "Describe your video scene..." : placeholderExamples[placeholderIndex])}
                    disabled={disabled || isGeneratingRandom}
                    onFocus={() => {
                      if (localStorage.getItem('inputHintSeen') !== 'true') {
                        setShowInputHint(true);
                      }
                    }}
                    maxLength={MAX_INPUT_LENGTH}
                    rows={Math.min(6, Math.max(1, (input.split('\n').length || 1)))}
                    style={(() => {
                      const baseStyle = {
                        minHeight: '46px',
                        maxHeight: isVideoMode ? '100px' : '150px', // Allow growth in video mode but with lower max height
                        height: 'auto', // Allow auto height for both modes
                      };
                      
                      if (!input.startsWith('/')) return baseStyle;
                      
                      // Add special style only when command is present
                      return {
                        ...baseStyle,
                        fontWeight: 600,
                        letterSpacing: '0.01em'
                      };
                    })()} 
                    className={(() => {
                      let baseClasses = "adaptive-textarea w-full px-4 pl-10 py-3 bg-[var(--inputBackground)] rounded-full border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors duration-200 shadow-inner";
                      
                      // No more fixed height constraints for video mode
                      
                      if (!input.startsWith('/')) return `${baseClasses} text-[var(--text)]`;
                      
                      const spaceIndex = input.indexOf(' ');
                      const command = spaceIndex > 0 ? input.substring(0, spaceIndex) : input;
                      
                      switch(command.toLowerCase()) {
                        case '/variations': return `${baseClasses} text-blue-500`;
                        case '/shorten': return `${baseClasses} text-green-500`;
                        case '/extend': return `${baseClasses} text-purple-500`;
                        case '/nextscene': return `${baseClasses} text-purple-500`;
                        default: return `${baseClasses} text-[var(--text)]`;
                      }
                    })()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    onInput={(e) => {
                      adjustTextareaHeight(e.target);
                    }}
                  />
                  
                  {/* Moved scroll buttons above the textarea */}
                  
                  {!editingPrompt && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowInputHint(!showInputHint);
                      }}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-transparent hover:bg-[var(--primary)]/10 transition-colors"
                      title="Input field tips"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-[var(--textSecondary)]" />
                    </button>
                  )}
                  
                  {/* Character count indicator - only shows when approaching recommendation or limit */}
                  {(() => {
                    // Check if input is a command operation
                    const isCommand = input.startsWith('/') && 
                      ["/variations", "/shorten", "/extend", "/nextscene"].some(cmd => input.toLowerCase().startsWith(cmd));
                    
                    // Only show counter for regular inputs or when approaching max limit
                    if ((!isCommand && input.length > WARNING_THRESHOLD) || input.length > MAX_INPUT_LENGTH * 0.8) {
                      return (
                        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium ${input.length >= MAX_INPUT_LENGTH * 0.9 ? 'text-red-500' : input.length > RECOMMENDED_LENGTH ? 'text-amber-500' : 'text-blue-500'}`}>
                          {input.length}{input.length > RECOMMENDED_LENGTH ? `/${MAX_INPUT_LENGTH}` : `/${RECOMMENDED_LENGTH}`}
                        </div>
                      );
                    }
                    return null;
                  })()} 
                  {/* Remove command highlighter overlay completely */}
                </div>
              </div>

              {!isVideoMode && (
                <Tooltip text={useFastMode ? "Quality mode" : "Fast mode"}>
                  <button
                    type="button"
                    onClick={toggleFastMode}
                    className="h-12 w-12 flex items-center justify-center rounded-full transition-colors duration-200 bg-transparent hover:bg-[var(--dropdownHover)]"
                    disabled={disabled || isGeneratingRandom}
                  >
                    <Zap className={`h-5 w-5 ${useFastMode ? 'text-green-500 fill-green-500' : 'text-[var(--textSecondary)]'}`} />
                  </button>
                </Tooltip>
              )}

              <button
                type="submit"
                disabled={disabled || isGeneratingRandom}
                className={`h-12 w-12 flex items-center justify-center rounded-full transition-all duration-200 ${
                  !(disabled || isGeneratingRandom)
                    ? 'bg-[var(--primary)] text-black hover:opacity-90 shadow-md'
                    : 'bg-[var(--secondary)] text-[var(--textSecondary)] cursor-not-allowed'
                }`}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-3 justify-start">
              {!isVideoMode && (
                <button
                  type="button"
                  onClick={handleImageAnalysisClick}
                  className="h-10 w-10 flex items-center justify-center modern-button bg-transparent hover:bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)] rounded-full transition-colors duration-200"
                  disabled={disabled || isGeneratingRandom}
                  title="Image to Prompt"
                >
                  <ImageUp className="h-5 w-5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleRandomPrompts}
                className={`h-10 w-10 flex items-center justify-center text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-full transition-colors duration-200 ${
                  isGeneratingRandom ? 'animate-spin' : ''
                }`}
                disabled={disabled || isGeneratingRandom}
                title={isVideoMode ? "Generate Random Video Scene" : "Generate Random Prompts"}
              >
                <Dices className="h-5 w-5" />
              </button>
              
              <button
                type="button"
                ref={commandButtonRef}
                id="command-button-mobile" /* Add ID for direct DOM access */
                onClick={() => {
                  console.log('Mobile command button clicked!');
                  setIsCommandsDropdownOpen(!isCommandsDropdownOpen);
                }}
                className="h-10 w-10 flex items-center justify-center text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-full transition-colors duration-200"
                disabled={disabled || isGeneratingRandom}
                title="Command Menu"
              >
                <Terminal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};