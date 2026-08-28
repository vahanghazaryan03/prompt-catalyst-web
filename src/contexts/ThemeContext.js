import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getInitialThemeWithReason, 
  logThemeDetection, 
  getSystemThemeId, 
  setupSystemThemeListener,
  supportsSystemThemeDetection 
} from '../utils/systemTheme';
import { logger } from '../utils/logger';

const ThemeContext = createContext();

export const themes = {
  default: {
    name: 'Dark',
    colors: {
      background: '#171717',
      cardBackground: '#1e1e1e',
      primary: '#42f56f',
      secondary: '#31db8a',
      text: '#f5f5f5',
      textSecondary: '#888',
      border: '#333',
      inputBackground: '#1e1e1e',
      inputBorder: '#555',
      dropdownBackground: '#1e1e1e',
      dropdownHover: '#2a2a2a',
      tooltipBackground: '#333',
      success: '#42f56f',
      error: '#ff4444',
      warning: '#ffb700',
      info: '#42a5f5',
      previewButtonBackground: '#fcb023',
      previewButtonHover: '#FF8C00',
      previewButtonDisabled: '#cc7a00',
      previewButtonDisabledText: 'rgba(0, 0, 0, 0.7)',
      scrollbarTrack: 'rgba(255, 255, 255, 0.1)',
      scrollbarThumb: 'rgba(255, 255, 255, 0.2)',
      scrollbarThumbHover: 'rgba(255, 255, 255, 0.3)'
    },
    backgroundType: 'color',
    mode: 'dark'
  },
  light: {
    name: 'Light',
    colors: {
      background: '#ffffff',
      cardBackground: '#f8fafc',
      primary: '#22c55e',
      secondary: '#4ade80',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      inputBackground: '#ffffff',
      inputBorder: '#cbd5e1',
      dropdownBackground: '#ffffff',
      dropdownHover: '#f1f5f9',
      tooltipBackground: '#334155',
      success: '#22c55e',
      error: '#dc2626',
      warning: '#ea580c',
      info: '#0284c7',
      previewButtonBackground: '#f59e0b',
      previewButtonHover: '#d97706',
      previewButtonDisabled: '#9ca3af',
      previewButtonDisabledText: 'rgba(0, 0, 0, 0.5)',
      scrollbarTrack: 'rgba(0, 0, 0, 0.05)',
      scrollbarThumb: 'rgba(0, 0, 0, 0.15)',
      scrollbarThumbHover: 'rgba(0, 0, 0, 0.25)'
    },
    backgroundType: 'color',
    mode: 'light'
  },
};

// Get initial theme using the new utility
const getInitialTheme = () => {
  const themeInfo = getInitialThemeWithReason();
  logThemeDetection(themeInfo);
  
  // Validate theme exists in our themes object
  if (themes[themeInfo.themeId]) {
    return themeInfo.themeId;
  }
  
  // Fallback to light if somehow invalid
  logger.warn('🎨 Invalid theme detected, falling back to light theme');
  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => getInitialTheme());
  const [isSystemThemeListener, setIsSystemThemeListener] = useState(false);
  const [followSystemTheme, setFollowSystemThemeState] = useState(() => {
    return localStorage.getItem('followSystemTheme') === 'true';
  });

  const [customBackground, setCustomBackground] = useState(() => {
    return localStorage.getItem('customBackgroundImage') || null;
  });

  // Set up system theme change listener (optional feature)
  useEffect(() => {
    if (!supportsSystemThemeDetection()) return;

    const savedTheme = localStorage.getItem('selectedTheme');
    
    // Only set up listener if user hasn't manually selected a theme AND has enabled following system theme
    if (!savedTheme || followSystemTheme) {
      const handleSystemThemeChange = (newTheme, isDark) => {
        if (followSystemTheme || !savedTheme) {
          logger.debug('🎨 System theme changed, switching to:', newTheme, isDark ? '(Dark)' : '(Light)');
          applyTheme(newTheme);
        }
      };

      const cleanup = setupSystemThemeListener(handleSystemThemeChange);
      setIsSystemThemeListener(true);
      
      return () => {
        cleanup();
        setIsSystemThemeListener(false);
      };
    }
  }, [followSystemTheme]); // Add followSystemTheme as dependency

  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem('selectedTheme', currentTheme);
    if (currentTheme === 'customBackground' && customBackground) {
      localStorage.setItem('customBackgroundImage', customBackground);
    }
  }, [currentTheme, customBackground]);

  // Apply theme on component mount
  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  const applyTheme = (themeId) => {
    if (!themes[themeId]) return;
    
    const theme = themes[themeId];
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });

    // Apply theme mode class to body
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme.mode}`);

    // Handle background
    if (theme.backgroundType === 'color') {
      root.style.setProperty('--background', theme.colors.background);
      root.style.removeProperty('--background-image');
      document.body.style.backgroundImage = 'none';
    } else if (theme.backgroundType === 'image' && customBackground) {
      document.body.style.cssText = `
        background-image: url(${customBackground});
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        transition: all 0.3s ease;
      `;
    }

    setCurrentTheme(themeId);
  };

  const getCurrentThemeMode = () => {
    return themes[currentTheme]?.mode || 'dark';
  };

  const isLightMode = () => {
    return getCurrentThemeMode() === 'light';
  };

  const handleCustomBackground = (imageUrl) => {
    setCustomBackground(imageUrl);
    themes.customBackground.backgroundImage = imageUrl;
    applyTheme('customBackground');
  };

  // Function to enable/disable following system theme changes
  const setFollowSystemTheme = (follow) => {
    localStorage.setItem('followSystemTheme', follow.toString());
    setFollowSystemThemeState(follow); // Update state for immediate UI feedback
    if (follow) {
      // Immediately switch to system preference
      const systemTheme = getSystemTheme();
      logger.debug('🎨 Enabling system theme following, switching to:', systemTheme);
      applyTheme(systemTheme);
    } else {
      logger.debug('🎨 Disabling system theme following');
    }
  };

  // Function to check if currently following system theme
  const isFollowingSystemTheme = () => {
    return followSystemTheme; // Return state value for immediate updates
  };

  // Function to get current system theme preference
  const getSystemTheme = () => {
    return getSystemThemeId();
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme: applyTheme,
      setCustomBackground: handleCustomBackground,
      themes,
      getCurrentThemeMode,
      isLightMode,
      setFollowSystemTheme,
      isFollowingSystemTheme,
      getSystemTheme,
      isSystemThemeListener
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
