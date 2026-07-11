/**
 * System Theme Detection Utilities
 * 
 * Provides utilities for detecting and managing system theme preferences
 * including first-time user detection and system theme change monitoring.
 */

/**
 * Detects if the user prefers dark mode based on system settings
 * @returns {boolean} True if user prefers dark mode
 */
export const getSystemPrefersDark = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false; // Default to light mode if no matchMedia support
  }
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Gets the appropriate theme ID based on system preference
 * @returns {string} Theme ID ('default' for dark, 'light' for light)
 */
export const getSystemThemeId = () => {
  return getSystemPrefersDark() ? 'default' : 'light';
};

/**
 * Checks if this is the user's first visit (no saved theme preference)
 * @returns {boolean} True if this is the first visit
 */
export const isFirstTimeUser = () => {
  return !localStorage.getItem('selectedTheme');
};

/**
 * Gets the user's system theme preference as a human-readable string
 * @returns {string} 'Dark' or 'Light'
 */
export const getSystemThemeName = () => {
  return getSystemPrefersDark() ? 'Dark' : 'Light';
};

/**
 * Sets up a listener for system theme changes
 * @param {function} callback - Function to call when system theme changes
 * @returns {function} Cleanup function to remove the listener
 */
export const setupSystemThemeListener = (callback) => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // Return empty cleanup function
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    const isDark = e.matches;
    const themeId = isDark ? 'default' : 'light';
    callback(themeId, isDark);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
  // Legacy browsers
  else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }
  
  return () => {}; // Fallback cleanup function
};

/**
 * Checks if the browser supports system theme detection
 * @returns {boolean} True if matchMedia is supported
 */
export const supportsSystemThemeDetection = () => {
  return typeof window !== 'undefined' && 
         window.matchMedia && 
         typeof window.matchMedia === 'function';
};

/**
 * Gets initial theme based on user preference and system settings
 * Respects saved preferences but uses system theme for first-time users
 * @returns {object} Object containing themeId and reasoning
 */
export const getInitialThemeWithReason = () => {
  const savedTheme = localStorage.getItem('selectedTheme');
  
  // If user has a saved preference, use it
  if (savedTheme) {
    return {
      themeId: savedTheme,
      reason: 'saved_preference',
      isFirstTime: false
    };
  }
  
  // For first-time users, check system preference
  if (supportsSystemThemeDetection()) {
    const systemTheme = getSystemThemeId();
    return {
      themeId: systemTheme,
      reason: 'system_preference',
      isFirstTime: true,
      systemPreference: getSystemThemeName()
    };
  }
  
  // Fallback to light theme if no system detection available
  return {
    themeId: 'light',
    reason: 'fallback',
    isFirstTime: true
  };
};

/**
 * Logs theme detection information for debugging
 * @param {object} themeInfo - Theme information from getInitialThemeWithReason
 */
export const logThemeDetection = (themeInfo) => {
  const messages = {
    saved_preference: `🎨 Using saved theme preference: ${themeInfo.themeId}`,
    system_preference: `🎨 First-time user detected! Using system theme: ${themeInfo.systemPreference} (${themeInfo.themeId})`,
    fallback: `🎨 First-time user, no system detection available. Using default: ${themeInfo.themeId}`
  };
  
  
  
  if (themeInfo.isFirstTime) {
   
  }
};
