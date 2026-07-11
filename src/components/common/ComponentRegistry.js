// ComponentRegistry.js - A registry for components that can be used in markdown content
import ImageGalleryTabs from './ImageGalleryTabs';

// Map component names to actual components
const componentMap = {
  'ImageGalleryTabs': ImageGalleryTabs,
};

/**
 * Get a component by name
 * @param {string} name - The component name
 * @returns {React.Component|null} - The component or null if not found
 */
export const getComponent = (name) => {
  return componentMap[name] || null;
};

/**
 * Check if a string represents a component reference
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is a component reference
 */
export const isComponentReference = (str) => {
  // Component references are in the format {{ComponentName:data}}
  // We need a more precise regex to handle multi-line JSON
  return str && typeof str === 'string' && /^\{\{([A-Za-z0-9_]+):(\{[\s\S]*\})\}\}$/m.test(str.trim());
};

/**
 * Parse a component reference string
 * @param {string} str - The component reference string
 * @returns {Object|null} - An object with componentName and data properties, or null if invalid
 */
export const parseComponentReference = (str) => {
  if (!isComponentReference(str.trim())) return null;
  
  // Using a more robust approach to extract component name and data
  const trimmedStr = str.trim();
  const componentName = trimmedStr.match(/^\{\{([A-Za-z0-9_]+):/)[1];
  
  // Extract the JSON part - everything between the first : and the last }}
  const jsonPart = trimmedStr.substring(trimmedStr.indexOf(':') + 1, trimmedStr.lastIndexOf('}}'));
  
  try {
    // Parse the data as JSON
    const data = JSON.parse(jsonPart);
    return { componentName, data };
  } catch (error) {
    console.error(`Error parsing component data for ${componentName}:`, error);
    return null;
  }
};
