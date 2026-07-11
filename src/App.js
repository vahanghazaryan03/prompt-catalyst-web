import React, { useState, useEffect, useRef, useCallback } from 'react';
import { preloadManager } from './utils/assetCache';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CollectionsProvider } from './contexts/CollectionsContext';
import { VideoCollectionsProvider } from './contexts/VideoCollectionsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { preparePromptSettings, initializeFirstTimeSettings } from './utils/settings';
import apiService from './services/api';
// Import our new components
import VideoWeeklyPrompts from './components/VideoWeeklyPrompts';
import Edit from './components/Edit';
// Import for the API service modifications we'll need
import { usePremiumModal } from './hooks/usePremiumModal';
import ResetPassword from './components/ResetPassword';
import SettingsSuggestions from './components/SettingsSuggestions';
import FullScreenLoader from './components/loading/FullScreenLoader';
import { Settings } from './components/Settings';
import { SettingsDrawer } from './components/SettingsDrawer';
import { VideoSettingsDrawer } from './components/VideoSettingsDrawer';
import { ChatMessages } from './components/ChatMessages';
import { InputArea } from './components/InputArea';
import Header from './components/Header';
import { GenerateProvider } from './contexts/GenerateContext';
import { EditProvider } from './contexts/EditContext';
import { useCredits } from './hooks/useCredits';
import WelcomeMessage from './components/WelcomeMessage';
import { CreditProvider, useCredit } from './contexts/CreditContext';
import LimitReachedMessage from './components/LimitReachedMessage';
import { LoginModal } from './components/LoginModal';
import PremiumModal from './components/PremiumModal';
import TopUpModal from './components/TopUpModal';
import CollectionsSidebar from './components/CollectionsSidebar';
import CollectionsView from './components/CollectionsView';
import VideoCollectionsView from './components/VideoCollectionsView';
import { HistoryView } from './components/HistoryView';
import { VideoHistoryView } from './components/VideoHistoryView';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { WeeklyPrompts } from './components/WeeklyPrompts';
import { StyleReferences } from './components/StyleReferences';
import AuthRequired from './components/AuthRequired';
import { ImageAnalysis } from './components/ImageAnalysis';
import { useLocation, useNavigate } from 'react-router-dom';
import { WeeklyPromptsProvider } from './contexts/WeeklyPromptsContext';
import { VideoHistoryProvider } from './contexts/VideoHistoryContext';
import useAnimationStore from './contexts/AnimationStore';
import { loadSettings, saveSettings } from './utils/settings';
import Generate from './components/Generate';
import VideoGenerate from './components/VideoGenerate';
import MaintenanceAnnouncement from './components/MaintenanceAnnouncement';

import EmptyChat from './components/EmptyChat';
import Animate from './components/Animate';
import AnimationErrorBoundary from './components/AnimationErrorBoundary';

const getStoredView = () => {
  const storedView = localStorage.getItem('currentView');
  return storedView || 'chat'; // Default to 'chat' if no stored view
};



// Define saveToHistory function outside of the component to avoid temporal dead zone issues
const saveToHistory = (prompts, options = {}) => {
  const {
    isRandom = false,
    isVariation = false,
    originalPrompt = '',
    isImageAnalysis = false,
    fileName = '',
    isShortened = false,
    isExtended = false,
    isEdited = false,
    editInstructions = '',
    inputText = '',
    promptLength = 2, // Default to medium
    imageUrl = '',
    isVideoMode = false // Video mode flag
  } = options;

  let history = JSON.parse(localStorage.getItem('promptHistory') || '[]');

  let description = '';
  if (isRandom) {
    description = `🎲 Random Generated: ${originalPrompt}`;
  } else if (isVariation) {
    description = `${originalPrompt}`;
  } else if (isImageAnalysis) {
    description = `📷 Image to Prompt: ${fileName}`; // Add emoji for image analysis
  } else if (isShortened) {
    description = `${originalPrompt}`;
  } else if (isExtended) {
    description = `${originalPrompt}`;
  } else if (isEdited) {
    description = `${originalPrompt}`;
  } else if (options.isNextScene || options.promptType === 'nextscene') {
    description = `${originalPrompt}`;
  } else {
    description = options.settings?.description || 'Standard Prompt';
  }

  // For consistency, let's also update the originalPrompt in historyEntry to include nextscene
  const historyEntry = {
    description,
    type: options.isVideoMode ? 'video' : 'standard',
    promptType: isRandom ? 'random' : 
                isVariation ? 'variation' :
                isImageAnalysis ? 'imageAnalysis' :
                isShortened ? 'shortened' :
                isExtended ? 'extended' : 
                isEdited ? 'edited' :
                options.isNextScene ? 'nextscene' : // Add support for nextscene
                options.promptType === 'nextscene' ? 'nextscene' : // Also check promptType
                options.promptType || 'standard', // Use options.promptType if provided
    
    previewUrls: {},
    originalPrompt: (isVariation || isShortened || isExtended || isRandom || isEdited || options.isNextScene || options.promptType === 'nextscene') ? originalPrompt : undefined,
    inputText: inputText,
    promptLength: promptLength,
    ...(isEdited && {
      editInstructions: editInstructions
    }),
    ...(isImageAnalysis && {
      fileName: fileName,
      imageUrl: imageUrl, // Save the image URL for later display
      isImageAnalysis: true
    }),
    ...((!isVariation && !isImageAnalysis && !isEdited) && {
      ...(options.isVideoMode ? {
        // Video settings - properly save all sidebar settings
        videoStyle: options.settings?.videoStyle || 'not_specified',
        style: options.settings?.style || options.settings?.videoStyle || 'not_specified',
        cameraMovement: options.settings?.cameraMovement || 'not_specified',
        cameraAngle: options.settings?.cameraAngle || 'not_specified',
        lighting: options.settings?.lighting || 'not_specified',
        specialEffects: options.settings?.specialEffects || 'not_specified',
        pacing: options.settings?.pacing || 'medium',
        promptLength: options.settings?.promptLength || 2,
        aiModel: options.settings?.aiModel || options.aiModel || 'seedance-1.0' // Add AI model for video mode
      } : {
        model: isRandom ? 'Random' : options.settings?.model,
        style: isRandom ? 'Random' : options.settings?.style,
        lighting: isRandom ? 'Random' : options.settings?.lighting,
        cameraAngle: isRandom ? 'Random' : options.settings?.cameraAngle,
        purpose: isRandom ? 'Random' : options.settings?.purpose,
        // Always include multi-selected values
        styles: options.settings?.styles || (options.settings?.style !== 'not_specified' ? [options.settings?.style] : []),
        lightingEffects: options.settings?.lightingEffects || (options.settings?.lighting !== 'not_specified' ? [options.settings?.lighting] : []),
        cameraAngles: options.settings?.cameraAngles || (options.settings?.cameraAngle !== 'not_specified' ? [options.settings?.cameraAngle] : []),
      }),
      creativity: isRandom ? 'Random' : options.settings?.creativity,
    }),
    prompts,
    timestamp: Date.now()
  };

  // Limit history for non-premium users
  if (!options.isPremium && history.length >= 5) {
    history = history.slice(0, 4);
  }

  history.unshift(historyEntry);
  localStorage.setItem('promptHistory', JSON.stringify(history));
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the setActiveTab function from AnimationStore
  const setAnimationActiveTab = useAnimationStore(state => state.setActiveTab);
  
  // Initialize first-time settings, asset cache, and check for tutorial presets
  useEffect(() => {
    // Initialize app settings
    initializeFirstTimeSettings();
    
    // Initialize intelligent preloading system
    preloadManager.init();
    
    // Load development debugging tools in development mode
    if (process.env.NODE_ENV === 'development') {
      import('./utils/assetCache/debugUtils').catch(err => {
        console.warn('Failed to load cache debugging tools:', err);
      });
    }

    // Check if we have a preset to apply from a tutorial
    const tutorialPreset = localStorage.getItem('tutorial_preset_to_apply');
    if (tutorialPreset) {
      // Clear the stored preset immediately to prevent reapplying on next load
      localStorage.removeItem('tutorial_preset_to_apply');
      
      // Import the preset data
      import('./utils/presets').then(presetsModule => {
        const { freePresets, premiumPresets } = presetsModule;
        const allPresets = [...freePresets, ...premiumPresets];
        
        // Find the preset by name
        let presetToApply;
        if (tutorialPreset === 'humans-and-animals-miniature') {
          presetToApply = allPresets.find(p => p.name === 'Humans and Animals Miniature');
        }
        
        // Apply the preset if found
        if (presetToApply) {
          // Get the current fast mode setting from localStorage
          const useFastMode = localStorage.getItem('useFastMode') === 'true';
          
          // Update settings with the enhanced object that includes multi-select arrays
          handleSettingChange(presetToApply.settings).then(updatedSettings => {
            setPendingSettings(updatedSettings);
            
            // Set the pending prompt with useFastMode flag
            setPendingPrompt({
              text: presetToApply.samplePrompt,
              useFastMode: useFastMode
            });
          });
        }
      });
    }
  }, []);
  
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('welcomeShown');
  });
  
  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomeShown', 'true');
  };

  const debouncedSaveRef = useRef();
  const { user, loading, logout } = useAuth();
  const { credits, loading: creditsLoading, error: creditsError, refreshCredits } = useCredit();  // State declarations (consolidated)
  const { addToast } = useToast(); // Add toast functionality
  
  // Determine if the user is a Pro member (for UI changes)
  const isProMember = user?.roles?.includes('um_pro-member') || user?.roles?.includes('um_pro-member-yearly');
  const { 
    isOpen: isPremiumModalOpen, 
    openPremiumModal: handleOpenPremiumModal, 
    closePremiumModal: handleClosePremiumModal,
    isPremium
  } = usePremiumModal();
  
  // TopUp modal state
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  
  const handleOpenTopUpModal = useCallback(() => {
    setIsTopUpModalOpen(true);
  }, []);
  
  const handleCloseTopUpModal = useCallback(() => {
    setIsTopUpModalOpen(false);
  }, []);
  
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [pendingSettings, setPendingSettings] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isVideoMode, setIsVideoMode] = useState(() => {
    return localStorage.getItem('isVideoMode') === 'true';
  });
  
  // Settings state definition moved higher
  const [settings, setSettings] = useState(() => loadSettings(isVideoMode));
  
  const [imageMessages, setImageMessages] = useState([]);
  const [videoMessages, setVideoMessages] = useState([]);
  // Use a derived state to get the correct messages based on current mode
  const messages = isVideoMode ? videoMessages : imageMessages;
  const setMessages = isVideoMode ? setVideoMessages : setImageMessages;
  
  const [currentView, setCurrentView] = useState(getStoredView());
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => {
    // Get from localStorage or default to true
    return localStorage.getItem('isSettingsOpen') !== 'false';
  });
  const [isCommandActive, setIsCommandActive] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [resetPasswordParams, setResetPasswordParams] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  
  // Settings change handler using the debounced save - moved before video mode effect
  const handleSettingChange = useCallback((setting, value) => {
    return new Promise((resolve) => {
      setSettings((prev) => {
        let newSettings;
        if (typeof setting === 'object') {
          newSettings = { ...setting };
        } else {
          newSettings = { ...prev, [setting]: value };
        }
        // Save settings to the correct storage based on current mode
        saveSettings(newSettings, isVideoMode);
        resolve(newSettings);
        return newSettings;
      });
    });
  }, [isVideoMode]);
  
  // Apply video mode class to body and update settings when mode changes
  useEffect(() => {
    // Update visual mode
    if (isVideoMode) {
      document.body.classList.add('video-mode');
    } else {
      document.body.classList.remove('video-mode');
    }
    
    // When mode changes, reload the appropriate settings
    const modeSettings = loadSettings(isVideoMode);
    setSettings(modeSettings);
    
    // Ensure video mode has all required settings
    if (isVideoMode) {
      // Set default video settings if they don't exist
      const hasVideoSettings = modeSettings.videoStyle && modeSettings.cameraMovement;
      if (!hasVideoSettings) {
        handleSettingChange({
          ...modeSettings,
          videoStyle: modeSettings.videoStyle || 'cinematic',
          style: modeSettings.videoStyle || 'cinematic', // Also set style parameter
          cameraMovement: modeSettings.cameraMovement || 'not_specified',
          pacing: modeSettings.pacing || 'medium',
          specialEffects: modeSettings.specialEffects || 'not_specified'
        });
      }
    }
  }, [isVideoMode, handleSettingChange]);
  
  // Handler for video mode toggle with improved transition
  const handleVideoModeToggle = useCallback(() => {
    setIsVideoMode(prev => {
      const newMode = !prev;
      localStorage.setItem('isVideoMode', newMode.toString());
      
      // Notify preload manager about mode change
      preloadManager.onModeChange(newMode);
      
      // Reset generatePrompt when switching modes to avoid confusion
      setGeneratePrompt('');
      
      // Add transition animation
      document.body.classList.add('mode-transition');
      setTimeout(() => document.body.classList.remove('mode-transition'), 500);
      
      // When switching modes, make sure we're in chat view for the best experience
      if (currentView !== 'chat' && currentView !== 'collections' && currentView !== 'history') {
        setCurrentView('chat');
        localStorage.setItem('currentView', 'chat');
      }
      
      // If in history view, switch to the appropriate history type
      if (currentView === 'history') {
        // No action needed as history view already adapts based on isVideoMode
      }
      
      return newMode;
    });
  }, [currentView]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);
 
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(() => window.location.pathname === '/password-reset');
  const [isSignUpMode, setIsSignUpMode] = useState(() => window.location.pathname === '/sign-up');
  
  useEffect(() => {
    // Wait until auth is loaded before handling routes
    if (loading) return;
  
    const pathname = location.pathname;
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
  
    const handleInitialRoute = () => {
      // Handle login with email parameter
      if (pathname === '/login' && emailParam) {
        setLoginEmail(emailParam);
        setIsLoginModalOpen(true);
        navigate('/', { replace: true }); // Clean up URL after handling
        return;
      }
    
      switch (pathname) {
        case '/premium':
          // Only proceed if we have user state
          if (!loading) {
            handleOpenPremiumModal();
            navigate('/', { replace: true });
          }
          break;
        case '/weekly':
          handleViewChange('weekly');
          break;
        case '/style-codes':
          handleViewChange('styleRefs');
          break;
        case '/tutorials':
          // Don't do anything, let the tutorials route handle it
          break;
        case '/sign-up':
          setIsSignUpMode(true);
          setIsLoginModalOpen(true);
          break;
        case '/password-reset':
          setIsPasswordResetMode(true);
          setIsLoginModalOpen(true);
          break;
        default:
          if (pathname !== '/') {
            navigate('/', { replace: true });
          }
      }
        
      if (pathname !== '/premium' && 
          pathname !== '/' && 
          pathname !== '/reset-password' && 
          pathname !== '/tutorials' && 
          !pathname.startsWith('/help') &&
          !pathname.startsWith('/legal')) {
        navigate('/', { replace: true });
      }
    };

    handleInitialRoute();
  }, [location.pathname, location.search, navigate, loading]);
  
  useEffect(() => {
    const handlePopState = () => {
      if (isPremiumModalOpen) {
        handleClosePremiumModal();
      }
      if (isLoginModalOpen) {
        setIsLoginModalOpen(false);
        setIsSignUpMode(false);
        setIsPasswordResetMode(false);
      }
    };
  
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isPremiumModalOpen, isLoginModalOpen]);
  
  // Effect for handling email verification redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const resetKey = params.get('reset_key');
    
    if (emailParam && resetKey) {
      // Store reset parameters in state
      setResetPasswordParams({
        email: decodeURIComponent(emailParam),
        resetKey: resetKey
      });
      setCurrentView('reset-password');
      // Don't navigate away - we want to keep the URL parameters
    } else if (emailParam) {
      setLoginEmail(emailParam);
      setIsLoginModalOpen(true);
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);
  
  // Listen for mode changes in localStorage from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isVideoMode') {
        // If the video mode was changed in localStorage from somewhere else
        const newMode = e.newValue === 'true';
        if (isVideoMode !== newMode) {
          setIsVideoMode(newMode);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isVideoMode]);
  
  // Callback for handling login requirement for premium features
  const handleLoginRequired = useCallback(() => {
    handleClosePremiumModal();
    setIsLoginModalOpen(true);
  }, [handleClosePremiumModal]);

  // Helper function to process prompt content
  const processPromptContent = (promptContent, effectiveSettings) => {
    if (typeof promptContent !== 'string') return promptContent;

    const prompts = promptContent.split('\n').filter(p => p.trim());
    
    if (effectiveSettings.model === 'midjourney' && effectiveSettings.midjourneyParams?.length > 0) {
      const params = effectiveSettings.midjourneyParams.join(' ');
      return prompts.map(prompt => `${prompt.trim()} ${params}`).join('\n');
    }
    
    return prompts.join('\n');
  };

  // Helper function to create message objects
  const createMessageObject = (type, content, additionalProps = {}) => ({
  type,
  content,
  timestamp: new Date().toISOString(),
  ...additionalProps
  });

  // Helper function to handle API errors
  const handleApiError = (error) => {
    const isLimitError = error.response?.status === 429;
    const isPremiumError = error.response?.data?.error?.includes('premium') || error.response?.status === 403;
    
    let messageContent;
    let messageType;
  
    if (isLimitError) {
      const creditInfo = {
        remaining: error.response?.data?.credits?.remaining,
        total: error.response?.data?.credits?.total,
        resetTime: error.response?.data?.credits?.resetTime,
        type: error.response?.data?.credits?.type
      };
    
      messageContent = (
        <LimitReachedMessage 
          type="prompt"
          creditInfo={creditInfo}
          limitType={error.response?.data?.limitType || 'daily'} 
          onPremiumClick={handleOpenPremiumModal}
          onTopUpClick={handleOpenTopUpModal}
          isProMember={isProMember}
          onLoginModalOpen={(view) => {
            if (view === 'register') {
              setIsSignUpMode(true);
            } else {
              setIsSignUpMode(false);
            }
            setIsLoginModalOpen(true);
          }}
        />
      );
      messageType = 'limit';
    } else if (isPremiumError) {
      messageContent = (
        <LimitReachedMessage 
          type="premium"
          limitType="premium"
          onPremiumClick={handleOpenPremiumModal}
          onTopUpClick={handleOpenTopUpModal}
          isProMember={isProMember}
          onLoginModalOpen={(view) => {
            if (view === 'register') {
              setIsSignUpMode(true);
            } else {
              setIsSignUpMode(false);
            }
            setIsLoginModalOpen(true);
          }}
        />
      );
      messageType = 'limit';
    } else {
      messageContent = error.message || 'An error occurred while generating the prompt.';
      messageType = 'error';
    }
    
    setMessages(prev => [...prev, createMessageObject(messageType, messageContent)]);
  
    if (isLimitError || isPremiumError) {
      refreshCredits();
    }
  };

  useEffect(() => {
    if (pendingPrompt && pendingSettings) {
      // Check if pendingPrompt is an object with useFastMode
      const promptText = typeof pendingPrompt === 'object' ? pendingPrompt.text : pendingPrompt;
      const useFastMode = typeof pendingPrompt === 'object' ? pendingPrompt.useFastMode : false;
  
      // Submit the pending prompt with the updated settings and fast mode flag
      handleSubmit(promptText, {
        settings: pendingSettings,
        skipUserMessage: false,
        useFastMode: useFastMode
      });
  
      // Clear the pending states
      setPendingPrompt(null);
      setPendingSettings(null);
    }
  }, [pendingPrompt, pendingSettings]);

  // In AppContent component, add this new useEffect:
  useEffect(() => {
    // When auth state changes (user logs in/out/switches), remove limit messages
    if (user) {
      setMessages(prevMessages => prevMessages.filter(message => message.type !== 'limit'));
    }
  }, [user]); // Watch for changes in user object
  
  // Main submit handler
  const handleSubmit = async (message, options = {}) => {
    const {
      isRandom = false,
      isVariation = false,
      isExtended = false,
      isShortened = false,
      isImageAnalysis = false,
      isUserMessage = false,
      fileName = '',
      originalPrompt = '',
      skipUserMessage = false,
      settings: presetSettings = null,
      imageUrl = '',
      limitMessage = null,
      isLoading = false,
      useFastMode = false, // Add this new parameter
      newMessages = null, // Add this new parameter for direct message insertion
      forceScroll = false, // Add flag to force scrolling
      isEdited = false, // Add flag for edited prompts
      editInstructions = '' // Add instructions for edit
    } = options;

    // If we received new messages to add directly (for conversational detection), add them
    if (newMessages && Array.isArray(newMessages)) {
      setMessages(prev => [...prev, ...newMessages]);
      
      // Check if this includes a random prompt that needs to be saved to history
      const assistantMessage = newMessages.find(msg => msg.type === 'assistant' && msg.promptType === 'random');
      if (assistantMessage) {
        // Save random prompt to history
        saveToHistoryWrapper(assistantMessage.content, {
          isRandom: true,
          isVideoMode: isVideoMode,
          settings: assistantMessage.settings,
          promptType: 'random'
        });
      }
      
      // If isLoading is also true, set generating state (for bundled random prompts)
      if (isLoading) {
        setIsGenerating(true);
      }
      
      return;
    }

    // If we received a limit message, add it directly to messages
    if (limitMessage) {
      setMessages(prev => prev.filter(msg => msg.type !== 'loading').concat(limitMessage));
      // Clear the generating state when showing limit message
      setIsGenerating(false);
      return;
    }

    // Handle loading state message for random prompts or empty inputs
    if (isLoading) {
      setIsGenerating(true);
      setMessages(prev => [...prev, createMessageObject('loading', '')]);
      return;
    }

    // Handle image analysis messages
    if (isImageAnalysis) {
    const messageProps = isUserMessage 
    ? { isImage: true }
    : { isImageAnalysis: true };
    
    const messageObj = createMessageObject(isUserMessage ? 'user' : 'assistant', message, {
    ...messageProps,
    fileName,
    imageUrl, // Include imageUrl in the message object for both user and assistant messages
    settings: { 
    isImageAnalysis: true,
    fileName,
    imageUrl // Also include in settings for the rerun functionality
    }
    });
    
    setMessages(prev => [...prev, messageObj]);
    
    if (!isUserMessage) {
    await refreshCredits();
    saveToHistory(message, {
    isImageAnalysis: true,
    fileName,
    imageUrl
    });
    }
    return;
    }
      
      // Special handling for nextSceneDetails when coming from Next Scene Modal
      let nextSceneDetailsFormatted = options.nextSceneDetails;
      
      // Ensure we extract the text content when it comes as a string or an object
      if (options.isNextScene || options.promptType === 'nextscene') {
        // If it's a string, use it directly
        if (typeof options.nextSceneDetails === 'string') {
          nextSceneDetailsFormatted = options.nextSceneDetails;
        } 
        // If it's an object with a nextSceneDetails property, extract it
        else if (options.nextSceneDetails && typeof options.nextSceneDetails === 'object') {
          if ('nextSceneDetails' in options.nextSceneDetails) {
            nextSceneDetailsFormatted = options.nextSceneDetails.nextSceneDetails;
          }
        }
        // If empty or undefined, use default
        if (!nextSceneDetailsFormatted || nextSceneDetailsFormatted.trim() === '') {
          nextSceneDetailsFormatted = 'Continue the scene';
        }
      }
      
      // For consistency, always store nextSceneDetailsFormatted in options as a string
      if (typeof nextSceneDetailsFormatted === 'string' && nextSceneDetailsFormatted) {
        options.nextSceneDetails = nextSceneDetailsFormatted;
      }
  
    // Add user message to chat if needed
    if (!skipUserMessage && !isRandom) {
      // For empty messages, create a special empty message that doesn't show a bubble
      const hasContent = message && message.trim();
      setMessages(prev => [...prev, createMessageObject('user', message, {
        isRerun: options.isRerun, // Pass the isRerun flag to user messages too
        isEmpty: !hasContent // Add flag to identify empty messages
      })]);
    }
  
    // Set generating state for all prompt types except image analysis
    if (!isImageAnalysis && !isLoading) {
      setIsGenerating(true);
    }
  
    try {
      const effectiveSettings = options.settings || settings;
      const preparedSettings = preparePromptSettings(effectiveSettings);
      
      let promptContent;
      
      // Handle different types of prompt generation
      if (isEdited) {
        const response = await apiService.editPrompt(message, options.editInstructions);
        promptContent = response.editedPrompt;
        await refreshCredits();
      } else if (isVariation) {
        const response = await apiService.generateVariations(message);
        promptContent = response.variations;
      } else if (isRandom) {
        promptContent = message;
      } else if (isVideoMode) {
        // Video mode command handling
        // Check if this is a command operation that should override normal video generation
        if (options.isCommand && (options.isVariation || options.isShortened || options.isNextScene)) {
          // This is a command operation in video mode - handle specially
         
          
          // Use the appropriate API based on the command type
          if (options.isVariation) {
            const response = await apiService.generateVariations(message);
            promptContent = response.variations;
          } else if (options.isShortened) {
            const response = await apiService.generateShortened(message);
            promptContent = response.shortened;
          } else if (options.isNextScene) {
            // For next scene operations, include the nextSceneDetails
            // Ensure we pass the details in the correct format for the API
            let nextSceneText;
            
            // First, try to extract the text string from various possible formats
            if (typeof nextSceneDetailsFormatted === 'string') {
              // Direct string - use as is
              nextSceneText = nextSceneDetailsFormatted.trim();
            } else if (nextSceneDetailsFormatted && typeof nextSceneDetailsFormatted === 'object') {
            // Object format - try to extract the text
            if ('nextSceneDetails' in nextSceneDetailsFormatted) {
                nextSceneText = nextSceneDetailsFormatted.nextSceneDetails;
            } else {
              // Try the first string property we find
            const values = Object.values(nextSceneDetailsFormatted);
              nextSceneText = values.find(v => typeof v === 'string');
            }
            }
            
            // Ensure we have something to use - fallback to default if needed
            if (!nextSceneText || nextSceneText.trim() === '') {
              nextSceneText = 'Continue the scene';
            }
            
            // Don't use the original prompt as next scene details
            if (nextSceneText === message) {
              nextSceneText = 'Continue the scene';
            }
            
            // Call the API with the extracted text
            const response = await apiService.generateNextScene(message, nextSceneText);
            promptContent = response.prompt;
          }
        } else {
          // For regular video prompts, use the video-specific endpoint

        const videoParams = {
          description: message,
          style: effectiveSettings.videoStyle !== 'not_specified' ? effectiveSettings.videoStyle : undefined,
          cameraMovement: effectiveSettings.cameraMovement !== 'not_specified' ? effectiveSettings.cameraMovement : undefined,
          cameraAngle: effectiveSettings.cameraAngle !== 'not_specified' ? effectiveSettings.cameraAngle : undefined,
          lighting: effectiveSettings.lighting !== 'not_specified' ? effectiveSettings.lighting : undefined,
          specialEffects: effectiveSettings.specialEffects !== 'not_specified' ? effectiveSettings.specialEffects : undefined,
          pacing: effectiveSettings.pacing !== 'not_specified' ? effectiveSettings.pacing : undefined,
          // Convert promptLength from number (1-3) to string (short/medium/long)
          promptLength: ['short', 'medium', 'long'][effectiveSettings.promptLength - 1] || 'medium',
          creativity: effectiveSettings.creativity,
          promptAmount: effectiveSettings.promptAmount // Add this missing parameter
        };
        
       
        const response = await apiService.generateVideoPrompt(videoParams);
        promptContent = response.prompt;
        }
      } else if (isExtended) {
        const response = await apiService.generateExtended(message, effectiveSettings);
        promptContent = response.extended;
      } else if (isShortened) {
        const response = await apiService.generateShortened(message);
        promptContent = response.shortened;
      } else {
        // For image mode, use either fast or deepseek endpoint based on setting
        const response = useFastMode 
          ? await apiService.generatePrompt({
              description: message,
              ...preparedSettings,
              isRandom
            })
          : await apiService.generatePromptDeepseek({
              description: message,
              ...preparedSettings,
              isRandom
            });
        
        promptContent = response.prompt;
      }
  
      // Refresh credits after successful generation
      await refreshCredits();
      
      const processedContent = processPromptContent(promptContent, effectiveSettings);

      // Create assistant message (don't log the actual content)
      const assistantMessage = createMessageObject('assistant', processedContent, {
        settings: isRandom ? { ...effectiveSettings, isRandomPrompt: true, forceScroll } : { ...effectiveSettings, forceScroll },
        promptType: isRandom ? 'random' : 
                  isVariation ? 'variation' :
                  isExtended ? 'extended' :
                  isShortened ? 'shortened' :
                  isImageAnalysis ? 'imageAnalysis' :
                  isEdited ? 'edited' :
                  options.isNextScene ? 'nextscene' : // Explicit support for nextscene commands
                  options.promptType === 'nextscene' ? 'nextscene' : // Also check for promptType property
                  'standard',
        originalPrompt: (isRandom || isVariation || isExtended || isShortened || isEdited || options.isNextScene) ? 
                        originalPrompt : undefined,
        inputText: message, // Add the original input text
        usedFastMode: useFastMode, // Add this to track which mode was used
        isRerun: options.isRerun, // Track if this is a rerun
        // For edited prompts, save the edit instructions
        ...(isEdited && {
          editInstructions,
          isEdited: true
        }),
        // For image analysis, save the image URL to make rerun work
        ...(isImageAnalysis && {
          fileName,
          imageUrl,
          isImageAnalysis
        }),
        ...(effectiveSettings.model === 'midjourney' && {
          midjourneyParams: effectiveSettings.midjourneyParams
        })
      });
  
      // Replace loading message with assistant message while preserving other messages
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.type !== 'loading');
        return [...filtered, assistantMessage];
      });
      
      // Save to history
      saveToHistoryWrapper(processedContent, {
      isRandom,
      isVariation,
      isExtended,
      isShortened,
      isEdited,
      editInstructions,
      isNextScene: options.isNextScene,
      promptType: isEdited ? 'edited' : options.promptType, // Force 'edited' for edit operations
      originalPrompt: (isRandom || isVariation || isExtended || isShortened || isEdited || options.isNextScene || options.promptType === 'nextscene') ? 
      originalPrompt : undefined,
      inputText: message,
      promptLength: effectiveSettings.promptLength,
      settings: effectiveSettings, // Make sure we're passing all settings
      isVideoMode: isVideoMode, // Explicitly pass video mode flag
      usedFastMode: useFastMode // Add this to track which mode was used
      });
  
    } catch (error) {
      // Remove loading message on error while preserving other messages
      setMessages(prev => prev.filter(msg => msg.type !== 'loading'));
      handleApiError(error);
    } finally {
      // Clear generating state for all prompt types except image analysis
      if (!isImageAnalysis) {
        setIsGenerating(false);
      }
    }
  };

  const handleUseInGenerate = (prompt) => {
    // When in video mode, send to VideoGenerate component
    // When in image mode, send to regular Generate component
    setGeneratePrompt(prompt);
    handleViewChange('generate');
  };

  const handleEdit = (prompt) => {
    // Set the prompt to be edited
    setEditingPrompt(prompt);
    // Make sure we're in chat view
    if (currentView !== 'chat') {
      handleViewChange('chat');
    }
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
  };

  // Initialize the debounced save function once
  const [messagesToRemove, setMessagesToRemove] = useState(new Set());

  // Update the useEffect that watches for auth changes
  useEffect(() => {
    if (user) {
      // Mark limit messages for removal
      const limitMessages = messages
        .map((msg, index) => msg.type === 'limit' ? index : -1)
        .filter(index => index !== -1);
      
      if (limitMessages.length > 0) {
        // Mark messages for removal
        setMessagesToRemove(new Set(limitMessages));
        
        // Remove messages after animation completes
        setTimeout(() => {
          setMessages(prevMessages => 
            prevMessages.filter(msg => msg.type !== 'limit')
          );
          setMessagesToRemove(new Set());
        }, 300); // Match this with animation duration
      }
    }
  }, [user]);
  
  // Add a helper function to check if a message is being removed
  const isMessageBeingRemoved = (index) => messagesToRemove.has(index);

  // This function is now defined at the beginning of the component to avoid temporal dead zone issues
  // Use it as a wrapper around the globally defined version to include component state
  const saveToHistoryWrapper = (prompts, options = {}) => {
    // Add component state to the options
    const enhancedOptions = {
      ...options,
      isVideoMode, // Explicitly pass the current mode
      settings: {
        ...(options.settings || {}),
        isVideoMode // Make sure isVideoMode is also in the settings object
      },
      // Explicitly pass AI model for video mode to ensure it's preserved
      aiModel: isVideoMode ? (options.settings?.aiModel || useAnimationStore.getState().aiModel) : undefined,
      isPremium: user?.isPremium
    };
    
    // Call the globally defined function with the enhanced options
    saveToHistory(prompts, enhancedOptions);
  };

  // Settings change handler was moved up before the video mode effect that uses it

  // Get animation state to track animation processing
  const isAnimationGenerating = useAnimationStore(state => state.isGenerating);

  // Handle view changes while allowing animation to continue in the background
  const handleViewChange = (view) => {
    // Check if we need to adjust view based on video mode
    let targetView = view;
    
    // If in video mode and trying to navigate to Animate, Edit, or StyleRefs, redirect to Generate
    if (isVideoMode && (targetView === 'animate' || targetView === 'edit' || targetView === 'styleRefs')) {
      targetView = 'generate';
      addToast('This feature is not available in Video mode', 'info');
    }
    
    // Only clear generatePrompt if we're navigating away from generate view AND it wasn't
    // a result of the "Use" button (which sets generatePrompt right before the view change)
    if (currentView === 'generate' && targetView !== 'generate' && generatePrompt) {
      setGeneratePrompt('');
    }
    
    // If we're switching to the chat view, ensure settings are open
    if (targetView === 'chat') {
      setIsSettingsOpen(true);
      localStorage.setItem('isSettingsOpen', 'true');
    }
    // If we're navigating away from the chat view, close the settings drawer
    else if (currentView === 'chat' && targetView !== 'chat' && isSettingsOpen) {
      setIsSettingsOpen(false);
      localStorage.setItem('isSettingsOpen', 'false');
    }
    
    // Update the animation store's active tab state
    setAnimationActiveTab(targetView);
    
    setCurrentView(targetView);
    localStorage.setItem('currentView', targetView);
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  // We moved this function to the beginning of the component

  const handleRandomPrompt = (prompt) => {
    handleSubmit(prompt, {
      isRandom: true,
      originalPrompt: prompt // Adding this to maintain consistency with other special types
    });
  };

  const onPresetApply = async (preset) => {
    if (!preset.settings || !preset.samplePrompt) {
      return;
    }

    // Get the current fast mode setting from localStorage
    const useFastMode = localStorage.getItem('useFastMode') === 'true';

    // Create a modified settings object that includes both single-value and multi-select properties
    const enhancedSettings = {
      ...preset.settings,
      // Add style to styles array if it exists and is not 'not_specified'
      styles: preset.settings.style && preset.settings.style !== 'not_specified' 
        ? [preset.settings.style] 
        : [],
      // Add lighting to lightingEffects array if it exists and is not 'not_specified'
      lightingEffects: preset.settings.lighting && preset.settings.lighting !== 'not_specified' 
        ? [preset.settings.lighting] 
        : [],
      // Add cameraAngle to cameraAngles array if it exists and is not 'not_specified'
      cameraAngles: preset.settings.cameraAngle && preset.settings.cameraAngle !== 'not_specified' 
        ? [preset.settings.cameraAngle] 
        : []
    };

    // Update settings with the enhanced object that includes multi-select arrays
    const updatedSettings = await handleSettingChange(enhancedSettings);
    setPendingSettings(updatedSettings);
    
    // Set the pending prompt with useFastMode flag
    setPendingPrompt({
      text: preset.samplePrompt,
      useFastMode: useFastMode
    });
  };

  // Detect if on mobile for responsive rendering
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <MaintenanceAnnouncement />
      {showWelcome && <WelcomeMessage onClose={handleCloseWelcome} />}
      <div className="flex-1 flex flex-col min-h-0 pt-16">
        <Header
          isLoggedIn={!!user}
          isPremiumUser={isPremium}
          currentView={currentView}
          onViewChange={handleViewChange}
          onSettingsClick={currentView === 'chat' ? () => {
            setIsSettingsOpen(!isSettingsOpen);
            localStorage.setItem('isSettingsOpen', (!isSettingsOpen).toString());
          } : null}
          onLoginClick={() => {
            if (user) {
              handleOpenPremiumModal();
            } else {
              setIsLoginModalOpen(true);
            }
          }}
          onLogoutClick={logout}
          isVideoMode={isVideoMode}
          onVideoModeToggle={handleVideoModeToggle}
          isSettingsOpen={isSettingsOpen}
        />
  
        <div className="flex-1 flex flex-col min-h-0">
          {currentView === 'chat' && (
            <div className="flex-1 flex h-full">
              <div className="flex-1 flex flex-col min-h-0 min-w-0">
                <div className="flex-1 overflow-y-auto">
                  {messages.length === 0 ? (
                    <EmptyChat onPresetApply={onPresetApply} isVideoMode={isVideoMode} />
                  ) : (
                    <ChatMessages
                      messages={messages}
                      settings={settings}
                      isVideoMode={isVideoMode}
                      isGenerating={isGenerating}
                      setIsGenerating={setIsGenerating} /* Add this new prop */
                      onUseInGenerate={handleUseInGenerate}
                      onEdit={handleEdit}
                      onPremiumClick={handleOpenPremiumModal}
                      currentView={currentView}
                      onSubmit={handleSubmit} /* Add this for the arrow up button */
                      onRerunPrompt={(inputText, originalSettings, isRandomPrompt, isImageAnalysis) => {
                        
                        if (!originalSettings) {
                          addToast('Cannot rerun with missing settings', 'error');
                          return;
                        }
                        
                        // For image analysis, we need to reprocess the same image
                        if (isImageAnalysis) {
                          // Debug log the settings
                          
                          
                          const imageUrl = originalSettings.imageUrl || inputText;
                          const fileName = originalSettings.fileName || 'Reanalyzed image';
                          

                          // Fetch the image from the blob URL and analyze it
                          if (imageUrl && imageUrl.startsWith('blob:')) {
                            // First add the user image message to the chat
                            handleSubmit(imageUrl, {
                              isImageAnalysis: true,
                              isUserMessage: true,
                              fileName: fileName,
                              skipUserMessage: false,
                              isRerun: true
                            });
                            
                            // Set generating state to show loading animation
                            setIsGenerating(true);

                            // Fetch the image and reanalyze
                            fetch(imageUrl)
                              .then(response => response.blob())
                              .then(imageBlob => {
                               
                                
                                // Create a File object from the Blob
                                const imageFile = new File([imageBlob], fileName, {
                                  type: imageBlob.type
                                });
                                
                                // Create form data for the API
                                const formData = new FormData();
                                formData.append('image', imageFile);
                                
                                // Call the API directly
                                return apiService.analyzeImage(formData);
                              })
                              .then(response => {
                                // Turn off loading state
                                setIsGenerating(false);
                                
                                // Add the assistant message with the results
                                const assistantMessage = createMessageObject('assistant', 
                                  typeof response.prompts === 'string' ? response.prompts : JSON.stringify(response.prompts), 
                                  {
                                    isImageAnalysis: true,
                                    fileName: fileName,
                                    imageUrl: imageUrl,
                                    settings: { 
                                      isImageAnalysis: true,
                                      fileName: fileName,
                                      imageUrl: imageUrl
                                    }
                                  });
                                
                                setMessages(prev => [...prev, assistantMessage]);
                                
                                // Refresh credits
                                refreshCredits();
                                
                                // Save to history
                                saveToHistoryWrapper(response.prompts, {
                                isImageAnalysis: true,
                                fileName: fileName,
                                imageUrl: imageUrl
                                });
                              })
                              .catch(error => {
                                console.error('Error reanalyzing image:', error);
                                setIsGenerating(false); // Turn off loading state on error
                                handleApiError(error);
                              });
                          } else {
                            // If we don't have a valid image URL, show an error
                            // Make sure the loading state is off
                            setIsGenerating(false);
                            addToast('Cannot reanalyze image: Missing image data', 'error');
                          }
                          
                          return;
                        }

                        if (isRandomPrompt) {
                          setIsGeneratingRandom(true);
                          
                          // Show user message immediately
                          const userMessage = {
                            type: 'user',
                            content: isVideoMode ? 'Generate random video scene description' : 'Generate random prompts',
                            diceRequest: true,
                            timestamp: new Date().toISOString(),
                            isRerun: true
                          };
                          
                          // Add user message and set loading state immediately
                          setMessages((prev) => [...prev, userMessage]);
                          setIsGenerating(true);

                          // Check if we're in video mode to use the correct API
                          if (isVideoMode) {
                            apiService
                              .generateVideoPrompt({
                                description: '',
                                style: 'cinematic', // Default style
                                cameraMovement: 'not_specified',
                                promptLength: 'medium',
                              })
                              .then((response) => {
                                if (response.prompt) {
                                  // Create assistant message
                                  const assistantMessage = {
                                    type: 'assistant',
                                    content: response.prompt,
                                    timestamp: new Date().toISOString(),
                                    promptType: 'random',
                                    settings: { isRandomPrompt: true }
                                  };
                                  
                                  // Add assistant message and clear loading
                                  setMessages((prev) => prev.filter(msg => msg.type !== 'loading').concat(assistantMessage));
                                  setIsGenerating(false); // Clear loading state immediately
                                  
                                  // Save to history
                                  saveToHistoryWrapper(response.prompt, {
                                    isRandom: true,
                                    isVideoMode: true,
                                    promptType: 'random'
                                  });
                                }
                              })
                              .catch((error) => {
                                setMessages((prev) => prev.filter(msg => msg.type !== 'loading'));
                                handleApiError(error);
                              })
                              .finally(() => {
                                setIsGeneratingRandom(false);
                                setIsGenerating(false);
                              });
                          } else {
                            apiService
                              .generateRandomPrompts()
                              .then((response) => {
                                if (response.prompts) {
                                  // Create assistant message
                                  const assistantMessage = {
                                    type: 'assistant',
                                    content: response.prompts,
                                    timestamp: new Date().toISOString(),
                                    promptType: 'random',
                                    settings: { isRandomPrompt: true },
                                    isRandomPrompts: true
                                  };
                                  
                                  // Add assistant message and clear loading
                                  setMessages((prev) => prev.filter(msg => msg.type !== 'loading').concat(assistantMessage));
                                  
                                  // Save to history
                                  saveToHistoryWrapper(response.prompts, {
                                    isRandom: true,
                                    isVideoMode: false,
                                    promptType: 'random'
                                  });
                                }
                              })
                              .catch((error) => {
                                setMessages((prev) => prev.filter(msg => msg.type !== 'loading'));
                                handleApiError(error);
                              })
                              .finally(() => {
                                setIsGeneratingRandom(false);
                                setIsGenerating(false);
                              });
                          }
                          return;
                        }

                        // Handle prompt operations (Variations, Shorten, Extend, NextScene)
                        if (originalSettings.promptType === 'variation' || 
                            originalSettings.promptType === 'shortened' || 
                            originalSettings.promptType === 'extended' ||
                            originalSettings.promptType === 'nextScene') {
                            
                          // Get the original prompt (before variations/shorten/extend was applied)
                          // The inputText should now be the original prompt passed from the message
                          const originalPrompt = inputText || originalSettings.originalPrompt;
                          
                          if (!originalPrompt) {
                            addToast('Error: Missing original prompt for rerun', 'error');
                            return;
                          }
                          
                          // Create user message to show command
                          const commandType = originalSettings.promptType === 'variation' ? 'variations' : 
                                             originalSettings.promptType === 'shortened' ? 'shorten' : 
                                             originalSettings.promptType === 'nextScene' ? 'nextscene' : 'extend';
                          
                          // Add user message with command
                          setMessages(prev => [...prev, createMessageObject('user', 
                            `/${commandType} ${originalPrompt}`, 
                            {
                              isCommand: true,
                              commandType: commandType,
                              isRerun: true
                            }
                          )]);
                          
                          // Now call handleSubmit with the appropriate options
                          handleSubmit(originalPrompt, {
                          isVariation: originalSettings.promptType === 'variation',
                          isShortened: originalSettings.promptType === 'shortened',
                          isExtended: originalSettings.promptType === 'extended',
                          isNextScene: originalSettings.promptType === 'nextscene',
                          // Always include both originalPrompt and nextSceneDetails
                          originalPrompt: originalPrompt,
                            nextSceneDetails: inputText === originalPrompt ? 'Continue the scene' : inputText,
                          skipUserMessage: true,
                          settings: originalSettings,
                            isRerun: true
              });
                          
                          return;
                        }
                        
                          // Check for command operation types
                          const isVariation = originalSettings.promptType === 'variation' || originalSettings.isVariation === true;
                          const isShortened = originalSettings.promptType === 'shortened' || originalSettings.isShortened === true;
                          const isExtended = originalSettings.promptType === 'extended' || originalSettings.isExtended === true;
                          const isNextScene = originalSettings.promptType === 'nextscene' || originalSettings.isNextScene === true;
                        
                        if (isVariation || isShortened || isExtended || isNextScene) {
                          // Get the original prompt (before variations/shorten/extend was applied)
                          // The inputText should now be the original prompt passed from the message
                          const originalPrompt = inputText || originalSettings.originalPrompt;
                          
                          if (!originalPrompt) {
                            addToast('Error: Missing original prompt for rerun', 'error');
                            return;
                          }
                          
                          // Create user message to show command
                          const commandType = isVariation ? 'variations' : 
                                             isShortened ? 'shorten' : 
                                             isNextScene ? 'nextscene' : 'extend';
                          
                          // Log the operation for debugging
                         
                          
                          // Add user message with command
                          setMessages(prev => [...prev, createMessageObject('user', 
                            `/${commandType} ${originalPrompt}`, 
                            {
                              isCommand: true,
                              commandType: commandType,
                              isRerun: true
                            }
                          )]);
                          
                          // Pass the explicit command flags with detailed logging
                        
                          
                          // Extract nextSceneDetails if they exist in the original settings
                          let nextSceneDetails = originalSettings.nextSceneDetails || 
                          originalSettings.settings?.nextSceneDetails || 
                          inputText || // Include inputText as a possible source
                               '';
                          
                          // If we don't have explicit nextSceneDetails but it's a nextscene operation,
                          // include the original prompt as fallback content
                          if (!nextSceneDetails && isNextScene) {
                            nextSceneDetails = originalPrompt;
                          }
                          
                          // Make sure we're not using the original prompt as nextSceneDetails
                          if (nextSceneDetails === originalPrompt) {
                            nextSceneDetails = 'Continue the scene';
                          }
                          
                         
                          
                          handleSubmit(originalPrompt, {
                            isCommand: true,  // Explicitly mark as command
                            commandType: commandType,  // Add specific command type
                            isVariation: isVariation,
                            isShortened: isShortened,
                            isExtended: isExtended,
                            isNextScene: isNextScene,
                            originalPrompt: originalPrompt,
                            skipUserMessage: true,
                            settings: originalSettings,
                            nextSceneDetails: nextSceneDetails, // Use extracted details
                            promptType: isVariation ? 'variation' : 
                                        isShortened ? 'shortened' : 
                                        isExtended ? 'extended' : 
                                        isNextScene ? 'nextscene' : commandType, // Ensure promptType is set
                            isVideoMode: true, // Explicitly set video mode
                            isRerun: true
                          });
                          
                          return;
                        }

                        // Default case - standard rerun
                        const textToRerun = inputText || '';
                        const useFastMode = localStorage.getItem('useFastMode') === 'true';
                        const cleanSettings = { ...originalSettings };
                        delete cleanSettings.inputText;

                        const cleanInputText = textToRerun.trim().replace(/^🔄\s+/, '');

                        // Log the standard rerun operation
                       

                        handleSubmit(cleanInputText, {
                          settings: cleanSettings,
                          useFastMode,
                          isRerun: true,
                        });
                      }}
                      onNewMessages={(newMessages) => {
                        setMessages((prev) => [...prev, ...newMessages]);
                        newMessages.forEach((message) => {
                          if (message.type === 'assistant') {
                            saveToHistoryWrapper(message.content, {
                              isVariation: message.promptType === 'variation',
                              isExtended: message.promptType === 'extended',
                              isShortened: message.promptType === 'shortened',
                              isRandom: message.promptType === 'random',
                              isNextScene: message.promptType === 'nextscene',
                              originalPrompt: message.originalPrompt,
                              promptType: message.promptType // Pass the promptType directly
                            });
                          }
                        });
                      }}
                      onLoginModalOpen={(view) => {
                        setIsSignUpMode(view === 'register');
                        setIsLoginModalOpen(true);
                      }}
                    />
                  )}
                </div>
                <InputArea
                  onSubmit={handleSubmit}
                  isSettingsOpen={isSettingsOpen}
                  isVideoMode={isVideoMode}
                  disabled={isGenerating}
                  onCommandStateChange={setIsCommandActive}
                  editingPrompt={editingPrompt}
                  onCancelEdit={handleCancelEdit}
                  onPremiumClick={handleOpenPremiumModal}
                  onTopUpClick={handleOpenTopUpModal}
                  onLoginModalOpen={(view) => {
                    if (view === 'register') {
                      setIsSignUpMode(true);
                    } else {
                      setIsSignUpMode(false);
                    }
                    setIsLoginModalOpen(true);
                  }}
                />
              </div>
  
              {isVideoMode ? (
                <VideoSettingsDrawer
                  isOpen={isSettingsOpen}
                  onClose={() => {
                    setIsSettingsOpen(false);
                    localStorage.setItem('isSettingsOpen', 'false');
                  }}
                  settings={settings}
                  onSettingChange={handleSettingChange}
                  isPremiumUser={user?.isPremium}
                  onLoginRequired={handleLoginRequired}
                  isCommandActive={isCommandActive}
                  isEditMode={!!editingPrompt}
                />
              ) : (
                <SettingsDrawer
                  isOpen={isSettingsOpen}
                  onClose={() => {
                    setIsSettingsOpen(false);
                    localStorage.setItem('isSettingsOpen', 'false');
                  }}
                  settings={settings}
                  onSettingChange={handleSettingChange}
                  isPremiumUser={user?.isPremium}
                  isVideoMode={isVideoMode}
                  onLoginRequired={handleLoginRequired}
                  isCommandActive={isCommandActive}
                  isEditMode={!!editingPrompt}
                />
              )}
            </div>
          )}
  
          {currentView === 'collections' && (
            <AuthRequired>
              {isVideoMode ? (
                <VideoCollectionsView
                  onViewChange={handleViewChange}
                  handleSubmit={handleSubmit}
                  setMessages={setMessages}
                  setGeneratePrompt={setGeneratePrompt}
                  onEdit={handleEdit}
                  onPremiumClick={(planType) => {
                    // If a specific plan type is provided, we'll select it in the modal
                    if (planType) {
                      // Store the selected plan in sessionStorage to be used by PremiumModal
                      sessionStorage.setItem('selectedPremiumPlan', planType);
                    }
                    handleOpenPremiumModal();
                  }}
                />
              ) : (
                <CollectionsView
                  onViewChange={handleViewChange}
                  handleSubmit={handleSubmit}
                  setMessages={setMessages}
                  setGeneratePrompt={setGeneratePrompt}
                  onEdit={handleEdit}
                  onPremiumClick={(planType) => {
                    // If a specific plan type is provided, we'll select it in the modal
                    if (planType) {
                      // Store the selected plan in sessionStorage to be used by PremiumModal
                      sessionStorage.setItem('selectedPremiumPlan', planType);
                    }
                    handleOpenPremiumModal();
                  }}
                />
              )}
            </AuthRequired>
          )}
  
  {currentView === 'history' ? (
    <AuthRequired>
  {isVideoMode ? (
    <VideoHistoryView 
      onViewChange={handleViewChange}
      handleSubmit={handleSubmit}
      setMessages={setMessages}
      setGeneratePrompt={setGeneratePrompt}
      onEdit={handleEdit}
      onPremiumClick={(planType) => {
        // If a specific plan type is provided, we'll select it in the modal
        if (planType) {
          // Store the selected plan in sessionStorage to be used by PremiumModal
          sessionStorage.setItem('selectedPremiumPlan', planType);
        }
        handleOpenPremiumModal();
      }}
    />
  ) : (
    <HistoryView 
      onViewChange={handleViewChange}
      handleSubmit={handleSubmit}
      setMessages={setMessages}
      setGeneratePrompt={setGeneratePrompt}
      onEdit={handleEdit}
      onPremiumClick={(planType) => {
        // If a specific plan type is provided, we'll select it in the modal
        if (planType) {
          // Store the selected plan in sessionStorage to be used by PremiumModal
          sessionStorage.setItem('selectedPremiumPlan', planType);
        }
        handleOpenPremiumModal();
      }}
    />
  )}
  </AuthRequired>
) : currentView === 'weekly' ? (
  <AuthRequired>
    {isVideoMode ? (
      <VideoWeeklyPrompts 
        onPromptOperation={(prompt, operation, details) => {
          if (operation === 'edit') {
            // Handle edit operation - switch to chat and enter edit mode
            handleEdit(prompt);
            return;
          }
          
          if (operation !== 'use') {
            // Prepare user message with command format
            const userMessage = {
              type: 'user',
              content: `/${operation} ${details.originalPrompt}`,
              isCommand: true,
              commandType: operation,
              timestamp: new Date().toISOString(),
              isVideoMode: true // Mark as video mode command
            };
            
            setMessages(prevMessages => [...prevMessages, userMessage]);
            handleViewChange('chat');
          }

          switch (operation) {
            case 'variations':
              handleSubmit(prompt, {
                isVariation: true,
                originalPrompt: prompt,
                skipUserMessage: true,
                isVideoMode: true // Mark as video mode command
              });
              break;
            case 'nextscene':
              // Ensure nextSceneDetails is properly included
              handleSubmit(prompt, {
                isNextScene: true,
                originalPrompt: prompt,
                skipUserMessage: true,
                // Pass user input as a simple string to avoid losing it
                nextSceneDetails: details.nextSceneDetails || 'Continue the scene',
                isVideoMode: true // Mark as video mode command
              });
              break;
            case 'extend':
              handleSubmit(prompt, {
                isExtended: true,
                originalPrompt: prompt,
                skipUserMessage: true,
                settings: details.settings,
                isVideoMode: true // Mark as video mode command
              });
              break;
            case 'shorten':
              handleSubmit(prompt, {
                isShortened: true,
                originalPrompt: prompt,
                skipUserMessage: true,
                isVideoMode: true // Mark as video mode command
              });
              break;
            case 'use':
              setGeneratePrompt(prompt);
              handleViewChange('generate');
              break;
            default:
              handleSubmit(prompt, {
                skipUserMessage: true,
                isVideoMode: true // Mark as video mode command
              });
              break;
          }
        }}
      />
    ) : (
      <WeeklyPrompts 
        onPromptOperation={(prompt, operation, details) => {
          if (operation === 'edit') {
            // Handle edit operation - switch to chat and enter edit mode
            handleEdit(prompt);
            return;
          }
          
          if (operation !== 'use') {
            // Prepare user message with command format
            const userMessage = {
              type: 'user',
              content: `/${operation} ${details.originalPrompt}`,
              isCommand: true,
              commandType: operation,
              timestamp: new Date().toISOString()
            };
            
            setMessages(prevMessages => [...prevMessages, userMessage]);
            handleViewChange('chat');
          }

          switch (operation) {
            case 'variations':
              handleSubmit(prompt, {
                isVariation: true,
                originalPrompt: prompt,
                skipUserMessage: true
              });
              break;
            case 'extend':
              handleSubmit(prompt, {
                isExtended: true,
                originalPrompt: prompt,
                skipUserMessage: true,
                settings: details.settings
              });
              break;
            case 'shorten':
              handleSubmit(prompt, {
                isShortened: true,
                originalPrompt: prompt,
                skipUserMessage: true
              });
              break;
            case 'use':
              setGeneratePrompt(prompt);
              handleViewChange('generate');
              break;
            default:
              handleSubmit(prompt, {
                skipUserMessage: true
              });
              break;
          }
        }}
      />
    )}
  </AuthRequired>
) : currentView === 'animate' ? (
  <AuthRequired>
    <AnimationErrorBoundary>
      <Animate 
      onViewChange={handleViewChange}
      handleSubmit={handleSubmit}
      setMessages={setMessages}
      onEdit={handleEdit}
      onPremiumClick={(planType) => {
      // If a specific plan type is provided, we'll select it in the modal
      if (planType) {
      // Store the selected plan in sessionStorage to be used by PremiumModal
      sessionStorage.setItem('selectedPremiumPlan', planType);
      }
      handleOpenPremiumModal();
      }}
        onTopUpClick={handleOpenTopUpModal}
    />
    </AnimationErrorBoundary>
  </AuthRequired>
) : currentView === 'styleRefs' ? (
  <AuthRequired>
    <StyleReferences 
      onEdit={handleEdit}
      onPremiumClick={(planType) => {
        // If a specific plan type is provided, we'll select it in the modal
        if (planType) {
          // Store the selected plan in sessionStorage to be used by PremiumModal
          sessionStorage.setItem('selectedPremiumPlan', planType);
        }
        handleOpenPremiumModal();
      }} />
  </AuthRequired>
) : currentView === 'generate' ? (
  <AuthRequired>
    {isVideoMode ? (
      <VideoGenerate 
        onViewChange={handleViewChange}
        onEdit={handleEdit}
        onPremiumClick={(planType) => {
          // If a specific plan type is provided, we'll select it in the modal
          if (planType) {
            // Store the selected plan in sessionStorage to be used by PremiumModal
            sessionStorage.setItem('selectedPremiumPlan', planType);
          }
          handleOpenPremiumModal();
        }}
        onTopUpClick={handleOpenTopUpModal}
        setMessages={setMessages}
        handleSubmit={handleSubmit}
        generatePrompt={generatePrompt}
      />
    ) : (
      <Generate 
        generatePrompt={generatePrompt}
        onViewChange={handleViewChange}
        handleSubmit={handleSubmit}
        setMessages={setMessages}
        onEdit={handleEdit}
        onPremiumClick={(planType) => {
          // If a specific plan type is provided, we'll select it in the modal
          if (planType) {
            // Store the selected plan in sessionStorage to be used by PremiumModal
            sessionStorage.setItem('selectedPremiumPlan', planType);
          }
          handleOpenPremiumModal();
        }}
        onTopUpClick={handleOpenTopUpModal}
      />
    )}
  </AuthRequired>
) : currentView === 'edit' ? (
  <AuthRequired>
    <Edit 
      onViewChange={handleViewChange}
      handleSubmit={handleSubmit}
      setMessages={setMessages}
      onEdit={handleEdit}
      onPremiumClick={(planType) => {
        // If a specific plan type is provided, we'll select it in the modal
        if (planType) {
          // Store the selected plan in sessionStorage to be used by PremiumModal
          sessionStorage.setItem('selectedPremiumPlan', planType);
        }
        handleOpenPremiumModal();
      }}
      onTopUpClick={handleOpenTopUpModal}
    />
  </AuthRequired>
) : currentView === 'reset-password' ? (
  <ResetPassword 
    resetParams={resetPasswordParams}
    onSuccess={() => {
      handleViewChange('chat');
      setIsLoginModalOpen(true);
    }} 
  />
) : null}
        </div>
      </div>
  
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={handleClosePremiumModal}
        onLoginRequired={handleLoginRequired}
      />
  
      <TopUpModal isOpen={isTopUpModalOpen} onClose={handleCloseTopUpModal} />
  
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginEmail('');
          setIsSignUpMode(false);
          setIsPasswordResetMode(false);
        }}
        defaultEmail={loginEmail}
        defaultView={isPasswordResetMode ? 'reset' : isSignUpMode ? 'signup' : 'login'}
      />
    </div>
  );
};  

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <CollectionsProvider>
            <VideoCollectionsProvider>
              <CreditProvider>
                <WeeklyPromptsProvider>
                  <VideoHistoryProvider>
                    <GenerateProvider>
                      <EditProvider>
                        <AppContent />
                      </EditProvider>
                    </GenerateProvider>
                  </VideoHistoryProvider>
                </WeeklyPromptsProvider>
              </CreditProvider>
            </VideoCollectionsProvider>
          </CollectionsProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;