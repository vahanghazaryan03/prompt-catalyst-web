import { logger } from './logger';
// editImageUtils.js
// Utility functions for image editing operations

// Available output sizes for image editing
export const EDIT_OUTPUT_SIZES = [
  { width: 1024, height: 1024, ratio: 1.0, label: '1:1 Square' },
  { width: 1568, height: 672, ratio: 2.33, label: '2.33:1 Wide' },
  { width: 1392, height: 752, ratio: 1.85, label: '1.85:1 Wide' },
  { width: 1184, height: 880, ratio: 1.35, label: '1.35:1 Wide' },
  { width: 1248, height: 832, ratio: 1.5, label: '1.5:1 Wide' },
  { width: 832, height: 1248, ratio: 0.67, label: '2:3 Portrait' },
  { width: 880, height: 1184, ratio: 0.74, label: '4:5 Portrait' },
  { width: 752, height: 1392, ratio: 0.54, label: '1:1.85 Portrait' },
  { width: 672, height: 1568, ratio: 0.43, label: '1:2.33 Portrait' }
];

/**
 * Analyzes an image file and returns its dimensions
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<{width: number, height: number, ratio: number}>}
 */
export const getImageDimensions = (imageFile) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = width / height;
      
      // Clean up the object URL
      URL.revokeObjectURL(img.src);
      
      resolve({
        width,
        height,
        ratio
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for dimension analysis'));
    };
    
    // Create object URL and load the image
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Finds the nearest available output size that matches the input image's aspect ratio
 * @param {number} inputWidth - Width of the input image
 * @param {number} inputHeight - Height of the input image
 * @returns {{width: number, height: number, ratio: number, label: string, matchScore: number}}
 */
export const findNearestOutputSize = (inputWidth, inputHeight) => {
  const inputRatio = inputWidth / inputHeight;
  
  let bestMatch = EDIT_OUTPUT_SIZES[0]; // Default to square
  let smallestDifference = Infinity;
  
  // Find the size with the closest aspect ratio
  EDIT_OUTPUT_SIZES.forEach(size => {
    const ratioDifference = Math.abs(size.ratio - inputRatio);
    
    // Also consider the total pixel count difference to prefer sizes closer to the original
    const inputPixels = inputWidth * inputHeight;
    const outputPixels = size.width * size.height;
    const pixelDifference = Math.abs(outputPixels - inputPixels) / inputPixels; // Normalize by input size
    
    // Combine ratio and pixel differences (ratio is more important)
    const combinedScore = ratioDifference + (pixelDifference * 0.1);
    
    if (combinedScore < smallestDifference) {
      smallestDifference = combinedScore;
      bestMatch = size;
    }
  });
  
  return {
    ...bestMatch,
    matchScore: smallestDifference
  };
};

/**
 * Analyzes an uploaded image and returns the recommended output dimensions
 * @param {File} imageFile - The uploaded image file
 * @returns {Promise<{inputDimensions: object, outputDimensions: object, matchInfo: object}>}
 */
export const analyzeImageForEditing = async (imageFile) => {
  try {
    // Get the actual dimensions of the uploaded image
    const inputDimensions = await getImageDimensions(imageFile);
    
    // Find the best matching output size
    const outputDimensions = findNearestOutputSize(
      inputDimensions.width, 
      inputDimensions.height
    );
    
    // Calculate how well the ratios match (for display/logging)
    const ratioMatchPercentage = Math.max(0, 100 - (outputDimensions.matchScore * 100));
    
    return {
      inputDimensions,
      outputDimensions,
      matchInfo: {
        ratioMatchPercentage: Math.round(ratioMatchPercentage),
        willStretch: outputDimensions.matchScore > 0.1, // Threshold for noticeable stretching
        recommendedLabel: outputDimensions.label
      }
    };
  } catch (error) {
    logger.error('Error analyzing image for editing:', error);
    
    // Return default square size if analysis fails
    return {
      inputDimensions: { width: 1024, height: 1024, ratio: 1.0 },
      outputDimensions: EDIT_OUTPUT_SIZES[0], // Square 1024x1024
      matchInfo: {
        ratioMatchPercentage: 100,
        willStretch: false,
        recommendedLabel: 'Default Square'
      }
    };
  }
};

/**
 * Formats dimensions for display
 * @param {number} width 
 * @param {number} height 
 * @returns {string}
 */
export const formatDimensions = (width, height) => `${width}×${height}`;

/**
 * Gets a human-readable aspect ratio string
 * @param {number} width 
 * @param {number} height 
 * @returns {string}
 */
export const getAspectRatioString = (width, height) => {
  const ratio = width / height;
  
  // Common ratios
  if (Math.abs(ratio - 1.0) < 0.01) return '1:1';
  if (Math.abs(ratio - 1.33) < 0.05) return '4:3';
  if (Math.abs(ratio - 1.5) < 0.05) return '3:2';
  if (Math.abs(ratio - 1.78) < 0.05) return '16:9';
  if (Math.abs(ratio - 0.75) < 0.05) return '3:4';
  if (Math.abs(ratio - 0.67) < 0.05) return '2:3';
  
  // Return calculated ratio rounded to 2 decimal places
  if (ratio > 1) {
    return `${ratio.toFixed(2)}:1`;
  } else {
    return `1:${(1/ratio).toFixed(2)}`;
  }
};
