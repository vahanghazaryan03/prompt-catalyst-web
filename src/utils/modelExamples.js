/**
 * Example images for each AI model to showcase in tooltips
 * 
 * Structure:
 * - modelId: Unique identifier for the model
 * - images: Array of image URLs showing examples of the model's output
 */

const MODEL_EXAMPLES = {
  // Ultra model examples
  'seedream-4.0': [
    '/examples/seedream-4.0/example-1.png',
    '/examples/seedream-4.0/example-2.png',
    '/examples/seedream-4.0/example-3.png',
    '/examples/seedream-4.0/example-4.png',
  ],
  'flux-pro-1.1-ultra': [
    '/examples/flux-ultra/example-1.png',
    '/examples/flux-ultra/example-2.png',
    '/examples/flux-ultra/example-3.png',
    '/examples/flux-ultra/example-4.png',
  ],
  
  // Pro model examples
  'flux-pro-1.1': [
    '/examples/flux-pro/example-1.png',
    '/examples/flux-pro/example-2.png',
    '/examples/flux-pro/example-3.png',
    '/examples/flux-pro/example-4.png',
  ],
  
  // Standard model examples
  'juggernaut-flux-pro': [
    '/examples/juggernaut-flux-pro/example-1.png',
    '/examples/juggernaut-flux-pro/example-2.png',
    '/examples/juggernaut-flux-pro/example-3.png',
    '/examples/juggernaut-flux-pro/example-4.png',
  ],
  
  'flux': [
    '/examples/flux-dev/example-1.png',
    '/examples/flux-dev/example-2.png',
    '/examples/flux-dev/example-3.png',
    '/examples/flux-dev/example-4.png',
  ],
  
  // HiDream model examples
  'hidream-full': [
    '/examples/hidream-full/example-1.png',
    '/examples/hidream-full/example-2.png',
    '/examples/hidream-full/example-3.png',
    '/examples/hidream-full/example-4.png',
  ],
  
  'hidream-dev': [
    '/examples/hidream-dev/example-1.png',
    '/examples/hidream-dev/example-2.png',
    '/examples/hidream-dev/example-3.png',
    '/examples/hidream-dev/example-4.png',
  ],
  
  'hidream-fast': [
    '/examples/hidream-fast/example-1.png',
    '/examples/hidream-fast/example-2.png',
    '/examples/hidream-fast/example-3.png',
    '/examples/hidream-fast/example-4.png',
  ],
  
  // GPT Image model examples
  'gpt-image-1': [
    '/examples/gpt-image/example-1.png',
    '/examples/gpt-image/example-2.png',
    '/examples/gpt-image/example-3.png',
    '/examples/gpt-image/example-4.png',
  ],
  
  'juggernaut-flux-lightning': [
    '/examples/juggernaut-lightning/example-1.png',
    '/examples/juggernaut-lightning/example-2.png',
    '/examples/juggernaut-lightning/example-3.png',
    '/examples/juggernaut-lightning/example-4.png',
  ],
  
  'flux-schnell': [
    '/examples/flux-schnell/example-1.png',
    '/examples/flux-schnell/example-2.png',
    '/examples/flux-schnell/example-3.png',
    '/examples/flux-schnell/example-4.png',
  ]
};

/**
 * Get example images for a specific model
 * @param {string} modelId - The model identifier
 * @returns {Array} - Array of image URLs
 */
export const getModelExamples = (modelId) => {
  return MODEL_EXAMPLES[modelId] || [];
};

/**
 * Check if a model has example images
 * @param {string} modelId - The model identifier
 * @returns {boolean} - True if model has example images
 */
export const hasModelExamples = (modelId) => {
  return !!MODEL_EXAMPLES[modelId] && MODEL_EXAMPLES[modelId].length > 0;
};

export default MODEL_EXAMPLES;