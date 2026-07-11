export const SETTINGS_STORAGE_KEY = 'prompt_catalyst_settings';
export const VIDEO_SETTINGS_STORAGE_KEY = 'prompt_catalyst_video_settings';
export const IMAGE_SETTINGS_STORAGE_KEY = 'prompt_catalyst_image_settings';

// Check if it's first time use and store initial settings
export const initializeFirstTimeSettings = () => {
  try {
    // Check if unified settings exist in localStorage
    if (!localStorage.getItem(SETTINGS_STORAGE_KEY)) {
      // Removed logging
      // Store default settings for both modes
      saveSettings(defaultSettings, false); // Save image settings
      saveSettings(defaultVideoSettings, true); // Save video settings
      return true;
    }
    
    // If we have unified settings but no mode-specific settings, create them
    if (!localStorage.getItem(IMAGE_SETTINGS_STORAGE_KEY)) {
      // Removed logging
      const unifiedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (unifiedSettings) {
        const parsedSettings = JSON.parse(unifiedSettings);
        // Create image-specific settings by merging with defaults
        const imageSettings = { ...defaultImageSettings, ...parsedSettings };
        saveSettings(imageSettings, false);
      } else {
        saveSettings(defaultImageSettings, false);
      }
    }
    
    if (!localStorage.getItem(VIDEO_SETTINGS_STORAGE_KEY)) {
      // Removed logging
      const unifiedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (unifiedSettings) {
        const parsedSettings = JSON.parse(unifiedSettings);
        // Create video-specific settings by merging with defaults
        const videoSettings = { ...defaultVideoSettings };
        // Only copy over common prompt-related settings from unified settings
        const promptParamKeys = ['promptLength', 'creativity', 'videoStyle', 'cameraMovement', 
                             'cameraDirection', 'cameraAngle', 'lighting', 'specialEffects', 'pacing'];
        
        for (const key of promptParamKeys) {
          if (key in parsedSettings && parsedSettings[key] !== undefined) {
            videoSettings[key] = parsedSettings[key];
          }
        }
        saveSettings(videoSettings, true);
      } else {
        saveSettings(defaultVideoSettings, true);
      }
    }
    
    return false;
  } catch (error) {
    // Removed logging
    return false;
  }
};

// Initial default settings used when the app is first loaded
export const defaultSettings = {
  // Common settings used by both modes
  promptLength: 2,
  creativity: 5,
  
  // Legacy settings (keeping for backward compatibility)
  style: 'realism',
  lighting: 'not_specified',
  cameraAngle: 'not_specified',
  model: 'not_specified',
  purpose: 'not_specified',
  promptAmount: 3,
  midjourneyParams: [],
  styles: ['realism'],
  lightingEffects: [],
  cameraAngles: [],
  videoStyle: 'not_specified',
  cameraMovement: 'not_specified',
};

// Separate default settings for image mode
export const defaultImageSettings = {
  // Image settings
  style: 'realism', // Default to photorealism for new users
  lighting: 'not_specified',
  cameraAngle: 'not_specified',
  model: 'not_specified',
  purpose: 'not_specified',
  promptLength: 2,
  creativity: 5,
  promptAmount: 3, // Default to 3 prompts for free users
  midjourneyParams: [],
  
  // Multi-select settings
  styles: ['realism'], // Initialize with Photorealism selected
  lightingEffects: [], // Array of selected lighting effects
  cameraAngles: [], // Array of selected camera angles
  
  // Explicitly set video-specific properties to null to prevent carryover
  videoStyle: null,
  cameraMovement: null,
  specialEffects: null,
  pacing: null
};

// Separate default settings for video mode - includes parameters that are shown in the VideoSettings sidebar
export const defaultVideoSettings = {
  // Video prompt settings
  videoStyle: 'cinematic',
  style: 'cinematic', // Ensure style is also set to match videoStyle
  cameraMovement: 'not_specified',
  cameraAngle: 'not_specified',
  lighting: 'not_specified',
  specialEffects: 'not_specified',
  pacing: 'not_specified',
  promptLength: 2,
  creativity: 5,
  promptAmount: 3, // Default to 3 prompts for free users
  userSetPromptAmount: false
};

// These parameters should NOT be included in video prompt generation requests:
// - videoModel (belongs to VideoGenerate.js)
// - resolution (belongs to VideoGenerate.js)
// - duration (belongs to VideoGenerate.js)
// - aspectRatio (belongs to VideoGenerate.js)

// Rest of the file remains the same...
export const getPromptLengthLabel = (value) => {
  const numericValue = parseInt(value);
  switch(numericValue) {
    case 1: return 'Short';
    case 2: return 'Medium';
    case 3: return 'Long';
    default: return 'Medium';
  }
};

export const loadSettings = (isVideoMode = false) => {
  try {
    // For backward compatibility, first try to load from the unified storage key
    const unifiedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    
    // Then try to load mode-specific settings
    const modeKey = isVideoMode ? VIDEO_SETTINGS_STORAGE_KEY : IMAGE_SETTINGS_STORAGE_KEY;
    const modeSettings = localStorage.getItem(modeKey);
    
    // Default settings based on mode
    const defaultModeSettings = isVideoMode ? defaultVideoSettings : defaultImageSettings;
    
    // If mode-specific settings exist, use those
    if (modeSettings) {
      const parsedSettings = JSON.parse(modeSettings);
      
      // For image mode, ensure we're not inheriting video-specific styles
      if (!isVideoMode && parsedSettings.style === 'cinematic') {
        // If style is set to 'cinematic' in image mode, reset it to the default
        parsedSettings.style = defaultImageSettings.style;
      }
      
      return { ...defaultModeSettings, ...parsedSettings };
    }
    
    // Otherwise, try to use the unified settings
    if (unifiedSettings) {
      const parsedSettings = JSON.parse(unifiedSettings);
      
      // Filter settings based on the current mode
      if (isVideoMode) {
        // Extract only video-relevant settings
        const videoRelevantSettings = {};
        
        // Define the keys that are relevant for video prompt generation
        const videoPromptKeys = [
          'videoStyle', 'cameraMovement', 'cameraDirection',
          'cameraAngle', 'lighting', 'specialEffects', 'pacing',
          'promptLength', 'creativity'
        ];
        
        // Only copy keys that are in the relevant set
        for (const key of videoPromptKeys) {
          if (key in parsedSettings) {
            videoRelevantSettings[key] = parsedSettings[key];
          }
        }
        
        return { ...defaultVideoSettings, ...videoRelevantSettings };
      } else {
        // Extract only image-relevant settings
        const imageRelevantSettings = {};
        for (const key in parsedSettings) {
          // Include common settings and image-specific settings
          if (key in defaultImageSettings) {
            imageRelevantSettings[key] = parsedSettings[key];
          }
        }
        return { ...defaultImageSettings, ...imageRelevantSettings };
      }
    }
  } catch (error) {
    // Removed logging
  }
  
  // Return default settings based on mode if all else fails
  return isVideoMode ? defaultVideoSettings : defaultImageSettings;
};

export const saveSettings = (settings, isVideoMode = false) => {
  try {
    // For backward compatibility, still save to the unified storage key
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    
    // Also save to the mode-specific storage key
    const modeKey = isVideoMode ? VIDEO_SETTINGS_STORAGE_KEY : IMAGE_SETTINGS_STORAGE_KEY;
    localStorage.setItem(modeKey, JSON.stringify(settings));
  } catch (error) {
    // Removed logging
  }
};

// Create two separate functions for preparing prompt settings by mode
export const prepareImagePromptSettings = (settings) => {
  const prepared = {};
  
  // Image mode settings - NEVER use 'cinematic' style for image prompts
  if (settings.style && settings.style !== 'not_specified' && settings.style !== 'cinematic') {
    prepared.style = settings.style;
  }
  
  // Always include styles - prioritize multi-select array over single value
  if (settings.styles && settings.styles.length > 0) {
    // Filter out any 'cinematic' value from styles array
    prepared.styles = settings.styles.filter(style => style !== 'cinematic');
  } else if (settings.style && settings.style !== 'not_specified' && settings.style !== 'cinematic') {
    // If no styles array but a style is specified, create a styles array with that value
    // Only if the style is not 'cinematic'
    prepared.styles = [settings.style];
  }
  
  if (settings.model && settings.model !== 'not_specified') prepared.model = settings.model;
  if (settings.purpose && settings.purpose !== 'not_specified') prepared.purpose = settings.purpose;
  
  // Add Midjourney parameters if they exist (image mode only)
  if (settings.model === 'midjourney' && settings.midjourneyParams?.length > 0) {
    prepared.midjourneyParams = settings.midjourneyParams;
  }

  // Handle lighting
  if (settings.lighting && settings.lighting !== 'not_specified') prepared.lighting = settings.lighting;
  
  // Always include lighting effects - prioritize multi-select array over single value
  if (settings.lightingEffects && settings.lightingEffects.length > 0) {
    prepared.lightingEffects = settings.lightingEffects;
  } else if (settings.lighting && settings.lighting !== 'not_specified') {
    // If no lightingEffects array but lighting is specified, create an array with that value
    prepared.lightingEffects = [settings.lighting];
  }
  
  // Handle camera angles
  if (settings.cameraAngle && settings.cameraAngle !== 'not_specified') prepared.cameraAngle = settings.cameraAngle;
  
  // Always include camera angles - prioritize multi-select array over single value
  if (settings.cameraAngles && settings.cameraAngles.length > 0) {
    prepared.cameraAngles = settings.cameraAngles;
  } else if (settings.cameraAngle && settings.cameraAngle !== 'not_specified') {
    // If no cameraAngles array but cameraAngle is specified, create an array with that value
    prepared.cameraAngles = [settings.cameraAngle];
  }
  
  // Always include prompt length and creativity
  prepared.promptLength = getPromptLengthLabel(settings.promptLength);
  prepared.creativity = settings.creativity;

  // Include prompt amount if defined
  if (settings.promptAmount) {
    prepared.promptAmount = settings.promptAmount || 1;
  }

  return prepared;
};

export const prepareVideoPromptSettings = (settings) => {
  const prepared = {};

  // Video mode settings - map to what the server expects
  // The server expects 'style' not 'videoStyle' - fix the parameter name
  if (settings.videoStyle && settings.videoStyle !== 'not_specified') {
    prepared.style = settings.videoStyle;
  } else if (settings.style && settings.style !== 'not_specified') {
    prepared.style = settings.style;
  }
  
  // The server expects both 'movement' and 'cameraMovement' parameters
  if (settings.cameraMovement && settings.cameraMovement !== 'not_specified') {
    prepared.cameraMovement = settings.cameraMovement;
  }
  if (settings.cameraAngle && settings.cameraAngle !== 'not_specified') prepared.cameraAngle = settings.cameraAngle;
  if (settings.lighting && settings.lighting !== 'not_specified') prepared.lighting = settings.lighting;
  if (settings.specialEffects && settings.specialEffects !== 'not_specified') prepared.specialEffects = settings.specialEffects;
  if (settings.pacing && settings.pacing !== 'not_specified') prepared.pacing = settings.pacing;
  
  // Convert numeric promptLength (1,2,3) to lowercase string values (short,medium,long)
  // This is what the server expects
  const lengthValue = getPromptLengthLabel(settings.promptLength);
  prepared.promptLength = lengthValue.toLowerCase();
  
  // Always include creativity
  prepared.creativity = settings.creativity || 5;

  // Include prompt amount if defined
  if (settings.promptAmount) {
    prepared.promptAmount = settings.promptAmount || 3;
  }

  return prepared;
};

// Maintain the old function for backward compatibility, but have it call the appropriate new function
export const preparePromptSettings = (settings) => {
  if (settings.isVideoMode) {
    return prepareVideoPromptSettings(settings);
  } else {
    return prepareImagePromptSettings(settings);
  }
};