import { logger } from './logger';
// aspectRatioUtils.js
// Special ratios for specific models
export const SPECIAL_MODEL_RATIOS = {
  'flux-pro-1.1-ultra': {
    portrait: [
      { id: '9:21-ultra', label: '9:21', width: 9, height: 21, pixelWidth: 1536, pixelHeight: 2752, fixedSize: true }
    ],
    landscape: [
      { id: '21:9-ultra', label: '21:9', width: 21, height: 9, pixelWidth: 2752, pixelHeight: 1536, fixedSize: true }
    ]
  },
  'gpt-image-1': {
    square: [
      { id: 'gpt-1:1', label: '1:1', width: 1, height: 1, pixelWidth: 1024, pixelHeight: 1024, fixedSize: true }
    ],
    portrait: [
      { id: 'gpt-2:3', label: '2:3', width: 2, height: 3, pixelWidth: 1024, pixelHeight: 1536, fixedSize: true }
    ],
    landscape: [
      { id: 'gpt-3:2', label: '3:2', width: 3, height: 2, pixelWidth: 1536, pixelHeight: 1024, fixedSize: true }
    ]
  },
  'seedream-4.0': {
    square: [
      { id: 'seedream-1:1', label: '1:1', width: 1, height: 1, pixelWidth: 1024, pixelHeight: 1024, fixedSize: true }
    ],
    portrait: [
      { id: 'seedream-9:16', label: '9:16', width: 9, height: 16, pixelWidth: 1440, pixelHeight: 2560, fixedSize: true },
      { id: 'seedream-2:3', label: '2:3', width: 2, height: 3, pixelWidth: 1664, pixelHeight: 2496, fixedSize: true },
      { id: 'seedream-3:4', label: '3:4', width: 3, height: 4, pixelWidth: 1728, pixelHeight: 2304, fixedSize: true }
    ],
    landscape: [
      { id: 'seedream-16:9', label: '16:9', width: 16, height: 9, pixelWidth: 2560, pixelHeight: 1440, fixedSize: true },
      { id: 'seedream-21:9', label: '21:9', width: 21, height: 9, pixelWidth: 3024, pixelHeight: 1296, fixedSize: true },
      { id: 'seedream-3:2', label: '3:2', width: 3, height: 2, pixelWidth: 2496, pixelHeight: 1664, fixedSize: true },
      { id: 'seedream-4:3', label: '4:3', width: 4, height: 3, pixelWidth: 2304, pixelHeight: 1728, fixedSize: true }
    ]
  }
};

// Standard aspect ratios available for most models
export const ASPECT_RATIOS = {
  portrait: [
    { id: '1:2', label: '1:2', width: 1, height: 2 },
    { id: '9:16', label: '9:16', width: 9, height: 16 },
    { id: '2:3', label: '2:3', width: 2, height: 3 },
    { id: '3:4', label: '3:4', width: 3, height: 4 },
    { id: '5:6', label: '5:6', width: 5, height: 6 }
  ],
  square: [
    { id: '1:1', label: '1:1', width: 1, height: 1 }
  ],
  landscape: [
    { id: '6:5', label: '6:5', width: 6, height: 5 },
    { id: '4:3', label: '4:3', width: 4, height: 3 },
    { id: '3:2', label: '3:2', width: 3, height: 2 },
    { id: '16:9', label: '16:9', width: 16, height: 9 },
    { id: '2:1', label: '2:1', width: 2, height: 1 }
  ]
};

// Helper function to check if a ratio is valid for a specific model
export const isValidRatioForModel = (ratioId, modelType) => {
  if (modelType === 'flux-pro-1.1-ultra') {
    return ['21:9-ultra', '9:21-ultra'].includes(ratioId);
  } else if (modelType === 'gpt-image-1') {
    return ['gpt-1:1', 'gpt-2:3', 'gpt-3:2'].includes(ratioId);
  } else if (modelType === 'seedream-4.0') {
    return ['seedream-1:1', 'seedream-9:16', 'seedream-2:3', 'seedream-3:4', 
            'seedream-16:9', 'seedream-21:9', 'seedream-3:2', 'seedream-4:3'].includes(ratioId);
  }
  return true; // Any ratio is valid for standard models
};

// Get default ratio for a specific model
export const getDefaultRatioForModel = (modelType) => {
  if (modelType === 'flux-pro-1.1-ultra') {
    return '21:9-ultra';
  } else if (modelType === 'gpt-image-1') {
    return 'gpt-1:1';
  } else if (modelType === 'seedream-4.0') {
    return 'seedream-1:1';
  }
  
  // For standard models, return square as default to avoid bias
  // Square is more neutral than landscape and works well for most use cases
  return '1:1'; // Default for standard models 
};

// Check if a ratio ID is specific to a special model and incompatible with standard models
export const isSpecialModelOnlyRatio = (ratioId) => {
  // List of ratio IDs that only work with special models
  const specialModelOnlyRatios = [
    // Flux Ultra specific ratios
    '21:9-ultra', '9:21-ultra',
    // GPT Image 1 specific ratios
    'gpt-1:1', 'gpt-2:3', 'gpt-3:2',
    // Seedream 4.0 specific ratios
    'seedream-1:1', 'seedream-9:16', 'seedream-2:3', 'seedream-3:4',
    'seedream-16:9', 'seedream-21:9', 'seedream-3:2', 'seedream-4:3'
  ];
  
  return specialModelOnlyRatios.includes(ratioId);
};

// Get all ratios as a flat array
export const getAllRatios = (modelType = null) => {
  // Start with standard ratios
  const standardRatios = [
    ...ASPECT_RATIOS.portrait,
    ...ASPECT_RATIOS.square, 
    ...ASPECT_RATIOS.landscape
  ];
  
  // If a specific model type is provided and it has special ratios, include them
  if (modelType && SPECIAL_MODEL_RATIOS[modelType]) {
    let specialRatios = [];
    
    // Include all categories
    for (const category in SPECIAL_MODEL_RATIOS[modelType]) {
      specialRatios = [...specialRatios, ...SPECIAL_MODEL_RATIOS[modelType][category]];
    }
    
    return [...standardRatios, ...specialRatios];
  }
  
  return standardRatios;
};

// Convert aspect ratio (like "16:9") to dimensions object with width and height
export const getRatioDimensions = (ratioId) => {
  // Check normal ratios first
  const allRatios = getAllRatios();
  const standardRatio = allRatios.find(r => r.id === ratioId);
  if (standardRatio) return standardRatio;
  
  // Check special model ratios
  for (const modelType in SPECIAL_MODEL_RATIOS) {
    for (const category in SPECIAL_MODEL_RATIOS[modelType]) {
      const specialRatio = SPECIAL_MODEL_RATIOS[modelType][category].find(r => r.id === ratioId);
      if (specialRatio) return specialRatio;
    }
  }
  
  // Default to first ratio if not found
  return allRatios[0];
};

// Helper function to round to nearest multiple of 64
const roundToMultipleOf64 = (num) => {
  return Math.round(num / 64) * 64;
};

// Convert aspect ratio ID to pixel dimensions that work with API
export const getPixelDimensionsFromRatio = (ratioId, maxDimension = 1024, modelType = null) => {
  const { width, height, pixelWidth, pixelHeight, fixedSize } = getRatioDimensions(ratioId);
  
  // If this is a special ratio with fixed pixel dimensions, always use those
  if (fixedSize && pixelWidth && pixelHeight) {
    return {
      width: pixelWidth,
      height: pixelHeight
    };
  }
  
  // Calculate dimensions maintaining aspect ratio
  let calculatedWidth, calculatedHeight;
  
  if (width > height) {
    calculatedWidth = maxDimension;
    calculatedHeight = Math.round(maxDimension * (height / width));
  } else {
    calculatedWidth = Math.round(maxDimension * (width / height));
    calculatedHeight = maxDimension;
  }
  
  // Make sure both dimensions are multiples of 64 for API compatibility
  // Also ensure dimensions are at least 512px and no greater than 2048px
  calculatedWidth = Math.min(2048, Math.max(512, roundToMultipleOf64(calculatedWidth)));
  calculatedHeight = Math.min(2048, Math.max(512, roundToMultipleOf64(calculatedHeight)));
  
  return { 
    width: calculatedWidth,
    height: calculatedHeight 
  };
};

// Find category for a given ratio
export const getCategoryForRatio = (ratioId) => {
  // Check standard ratios
  if (ASPECT_RATIOS.portrait.some(r => r.id === ratioId)) return 'portrait';
  if (ASPECT_RATIOS.square.some(r => r.id === ratioId)) return 'square';
  if (ASPECT_RATIOS.landscape.some(r => r.id === ratioId)) return 'landscape';
  
  // Check special model ratios
  for (const modelType in SPECIAL_MODEL_RATIOS) {
    if (SPECIAL_MODEL_RATIOS[modelType].square &&
        SPECIAL_MODEL_RATIOS[modelType].square.some(r => r.id === ratioId)) {
      return 'square';
    }
    if (SPECIAL_MODEL_RATIOS[modelType].portrait && 
        SPECIAL_MODEL_RATIOS[modelType].portrait.some(r => r.id === ratioId)) {
      return 'portrait';
    }
    if (SPECIAL_MODEL_RATIOS[modelType].landscape && 
        SPECIAL_MODEL_RATIOS[modelType].landscape.some(r => r.id === ratioId)) {
      return 'landscape';
    }
  }
  
  return 'square'; // Default to square
};

// Convert pixel dimensions (like "1024x576") to the closest aspect ratio
export const getRatioFromPixelDimensions = (sizeString, modelType = null) => {
  try {
    // Parse the dimensions string (format: "widthxheight")
    const [widthStr, heightStr] = sizeString.split('x');
    const width = parseInt(widthStr, 10);
    const height = parseInt(heightStr, 10);
    
    if (isNaN(width) || isNaN(height)) {
      return '1:1'; // Default to square if parsing fails
    }
    
    // Handle special cases for GPT Image 1 model ONLY when modelType is specified
    if (modelType === 'gpt-image-1') {
      if ((width === 1024 && height === 1024) || 
          (width === 1536 && height === 1536)) {
        return 'gpt-1:1';
      }
      if (width === 1024 && height === 1536) {
        return 'gpt-2:3';
      }
      if (width === 1536 && height === 1024) {
        return 'gpt-3:2';
      }
    }
    
    // Handle Flux Ultra special cases ONLY when modelType is specified
    if (modelType === 'flux-pro-1.1-ultra') {
      if (width === 2752 && height === 1536) {
        return '21:9-ultra';
      }
      if (width === 1536 && height === 2752) {
        return '9:21-ultra';
      }
    }
    
    // Handle Seedream 4.0 special cases ONLY when modelType is specified
    if (modelType === 'seedream-4.0') {
      // Check each specific resolution
      if (width === 1024 && height === 1024) return 'seedream-1:1';
      if (width === 1440 && height === 2560) return 'seedream-9:16';
      if (width === 1664 && height === 2496) return 'seedream-2:3';
      if (width === 1728 && height === 2304) return 'seedream-3:4';
      if (width === 2304 && height === 1728) return 'seedream-4:3';
      if (width === 2496 && height === 1664) return 'seedream-3:2';
      if (width === 2560 && height === 1440) return 'seedream-16:9';
      if (width === 3024 && height === 1296) return 'seedream-21:9';
    }
    
    // Handle common presets directly (prioritize standard ratios)
    if (width === height) return '1:1';
    if (width === 1024 && height === 576) return '16:9';
    if (width === 576 && height === 1024) return '9:16';
    
    // Calculate the ratio and find the closest match from standard ratios
    const ratio = width / height;
    
    // Get only standard ratios (not special model ratios) for matching
    const standardRatios = [
      ...ASPECT_RATIOS.portrait,
      ...ASPECT_RATIOS.square, 
      ...ASPECT_RATIOS.landscape
    ];
    
    let closestRatio = standardRatios[0];
    let smallestDiff = Infinity;
    
    standardRatios.forEach(r => {
      const rRatio = r.width / r.height;
      const diff = Math.abs(ratio - rRatio);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestRatio = r;
      }
    });
    
    return closestRatio.id;
  } catch (error) {
    logger.error('Error parsing dimensions:', error);
    return '1:1'; // Default to square on error
  }
};

// Format dimensions for display
export const formatDimensions = ({ width, height }) => `${width}x${height}`;
