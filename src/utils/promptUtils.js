// src/utils/promptUtils.js

/**
 * Formats AI model names for display
 * @param {string} modelName - The internal model name (e.g., 'seedance-1.0')
 * @returns {string} - The formatted display name (e.g., 'Seedance 1.0')
 */
export const formatAiModelName = (modelName) => {
  if (!modelName) return null;
  
  const modelMap = {
    'seedance-1.0': 'Seedance 1.0',
    'kling-1.6': 'Kling 1.6',
    'kling-2.1': 'Kling 2.1',
    'wan-2.1': 'Wan-2.1',
    'minimax-video-01': 'MiniMax Video 01'
  };
  
  return modelMap[modelName] || modelName;
};

/**
 * Strips Midjourney parameters from a prompt string
 * @param {string} prompt - The original prompt string
 * @returns {string} - The prompt without Midjourney parameters
 */
export const stripMidjourneyParams = (prompt) => {
  if (!prompt) return prompt;

  // Common Midjourney parameters to remove
  const paramPatterns = [
    /\s+--ar\s+\d+:\d+/g,           // Aspect ratio
    /\s+--style\s+\w+/g,            // Style
    /\s+--stylize\s+\d+/g,          // Stylize value
    /\s+--personalize\s+\w+/g,
    /\s+--profile\s+\w+/g,       // Personalization
    /\s+--quality\s+\d+/g,          // Quality
    /\s+--q\s+\d+/g,          // Quality
    /\s+--chaos\s+\d+(\.\d+)?/g,    // Chaos (with decimals)
    /\s+--seed\s+\d+/g,             // Seed
    /\s+--v\s*\d+(\.\d+)?/g,        // Version (with decimals)
    /\s+--no\s+\w+/g,               // No parameters
    /\s+--repeat\s+\d+/g,           // Repeat
    /\s+--tile/g,                   // Tile
    /\s+--stop\s+\d+(\.\d+)?/g,     // Stop (with decimals)
    /\s+--iw\s+\d+(\.\d+)?/g,       // Image weight (with decimals)
    /\s+--niji\s+\d+(\.\d+)?/g,     // Niji (with decimals)
    /\s+--upbeta/g,                 // Upbeta
    /\s+--s\s+\d+/g,                // Variations: --s 
    /\s+--weird\s+\d+(\.\d+)?/g,    // Weird parameter (with decimals)
    /\s+--sref\s+\w+/g,    
    /\s+--cw\s+[^/s]*\s/g,     
    /\.\d+$/g                       // Cleanup any trailing decimals
  ];

  // Remove all matching parameters
  let cleanPrompt = prompt;
  paramPatterns.forEach(pattern => {
    cleanPrompt = cleanPrompt.replace(pattern, '');
  });

  // Trim any extra whitespace and remove any trailing dots
  cleanPrompt = cleanPrompt.trim().replace(/\.$/, '');

  return cleanPrompt;
};

/**
 * Extracts Midjourney parameters from a prompt string
 * @param {string} prompt - The original prompt string
 * @returns {string[]} - Array of parameter strings
 */
export const extractMidjourneyParams = (prompt) => {
  if (!prompt) return [];

  const params = [];
  const paramPatterns = [
    /--ar\s+\d+:\d+/,               // Aspect ratio
    /--style\s+\w+/,                // Style
    /--stylize\s+\d+/,              // Stylize value
    /--personalize\s+\w+/,          // Personalization
    /--quality\s+\d+/,              // Quality
    /\s+--q\s+\d+/g,          // Quality
    /--chaos\s+\d+(\.\d+)?/,        // Chaos (with decimals)
    /--seed\s+\d+/,                 // Seed
    /--v\s*\d+(\.\d+)?/,            // Version (with decimals)
    /--no\s+\w+/,                   // No parameters
    /--repeat\s+\d+/,               // Repeat
    /--tile/,                       // Tile
    /--stop\s+\d+(\.\d+)?/,         // Stop (with decimals)
    /--iw\s+\d+(\.\d+)?/,           // Image weight (with decimals)
    /--niji\s+\d+(\.\d+)?/,         // Niji (with decimals)
    /--upbeta/,                     // Upbeta
    /--s\s+\d+/,                    // Variations: --s 
    /--weird\s+\d+(\.\d+)?/,        // Weird parameter (with decimals)
    /--sref\s+[^/s]*/               // Style reference
  ];

  paramPatterns.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) {
      params.push(match[0]);
    }
  });

  return params;
};

/**
 * Detects if an input is a thank you message
 * @param {string} input - The user input to check
 * @returns {boolean} - True if the input is a thank you message
 */
export const isThankYouMessage = (input) => {
  if (!input || typeof input !== 'string') return false;
  
  // Normalize input - trim, lowercase, remove punctuation
  const normalizedInput = input.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  
  // Common thank you phrases
  const thankYouPhrases = [
    'thanks', 'thank you', 'thankyou', 'thx', 'ty', 'thanx',
    'thanks so much', 'thank you so much', 'appreciate it',
    'appreciated', 'thank you very much', 'many thanks'
  ];
  
  // Check if the input starts with or exactly matches a thank you phrase
  return thankYouPhrases.some(phrase => 
    normalizedInput === phrase || 
    normalizedInput.startsWith(phrase + ' ')
  );
};

/**
 * Detects if an input is conversational rather than a prompt generation request
 * @param {string} input - The user input to check
 * @returns {boolean} - True if the input is likely conversational
 */
export const isConversationalInput = (input) => {
  if (!input || typeof input !== 'string') return false;
  
  // First check if it's a thank you message
  if (isThankYouMessage(input)) return true;
  
  // Normalize input - trim, lowercase, remove punctuation
  const normalizedInput = input.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  
  // Common conversational phrases and questions
  const conversationalPhrases = [
    // Greetings
    'hi', 'hello', 'hey', 'greetings',  'whats up', 'what is up', 'howdy', 'whatsup',
    
    // Questions about the tool
    'what do you do', 'what are you', 'what is this', 'how does this work', 
    'what can you do', 'who are you', 'what is your purpose', 'help', 'help me',
    
    // Chat attempts
    'how are you', 'how do you feel', 'what do you think', 'can we chat',
    'can you help me', 
    
    // Questions about capabilities
    'can you', 'are you able to', 'do you understand', 'what can i do here',
    'how do i use this', 'explain'
  ];
  
  // Check if input starts with any of the conversational phrases
  return conversationalPhrases.some(phrase => {
    // Check if input exactly matches a greeting
    if (['hi', 'hello', 'hey', 'sup', 'yo'].includes(phrase) && normalizedInput === phrase) {
      return true;
    }
    
    // Check if input starts with a longer phrase
    if (phrase.length > 2 && normalizedInput.startsWith(phrase)) {
      return true;
    }
    
    return false;
  });
};

/**
 * Generates a special thank you response
 * @returns {string} - A response to thank you messages
 */
export const generateThankYouResponse = () => {
  // Array of possible thank you responses for variety
  const thankYouResponses = [
    "You're welcome! I'm happy to help with your image prompt needs. Just let me know what you'd like to create next!",
    "My pleasure! Glad I could assist. Ready when you are for your next creative prompt.",
    "Anytime! I'm here to help make your creative vision come to life with detailed prompts.",
    "You're very welcome! It's my pleasure to help with your image generation. What would you like to create next?", 
    "No problem at all! Happy to help with your prompt needs. Feel free to generate something new whenever you're ready."
  ];
  
  // Pick a random response
  const randomResponse = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
  
  return `
<div class="text-[var(--text)] px-1 py-1">
  <div class="flex items-center gap-2 mb-2">
    <span class="text-[var(--primary)] text-xl"></span>
    <p class="text-[var(--primary)] font-medium">${randomResponse}</p>
  </div>
</div>`;
};

/**
 * Generates a helpful response for conversational inputs
 * @param {string} input - The user's conversational input
 * @returns {string} - A helpful response explaining how to use the tool
 */
export const generateConversationalResponse = (input) => {
  // First check if it's a thank you message
  if (isThankYouMessage(input)) {
    return generateThankYouResponse();
  }
  
  const normalizedInput = input.trim().toLowerCase();
  
  // Simple greeting detection for personalized responses
  const isGreeting = /^(hi|hello|hey|greetings|sup|yo)[\s\W]*$/i.test(normalizedInput);
  const isQuestion = /what|how|who|why|can you|do you/i.test(normalizedInput);
  
  let greeting = '';
  
  if (isGreeting) {
    greeting = `👋 Hello! `;
  } else if (isQuestion) {
    greeting = `Hi there! `;
  }
  
  // This is our updated conversational message with proper padding and styling
  return `
<div class="text-[var(--text)]">
  <div class="flex items-center gap-2 mb-5">
    <span class="text-[var(--primary)] text-xl"></span>
    <h3 class="font-medium text-lg text-[var(--primary)]">${greeting}</h3>
  </div>
  
  <p class="mb-2 ml-3">This is a <strong>prompt generation tool</strong> - I'll help you create detailed image prompts!</p>
  
  <div class="bg-[var(--primary)]/10 p-4 rounded-lg mb-4">
    <p class="font-medium mb-3 text-[var(--primary)]">How to use:</p>
    <ul class="list-disc pl-5 space-y-2">
      <li>Describe what you want to see (e.g., "sunset over mountains with a cabin")</li>
      <li>Adjust settings in the sidebar to refine style and details</li>
      <li>Use generated prompts with your favorite AI image generator (or press the "Use" button)</li>
    </ul>
  </div>
  
  <p class="text-sm mt-4 text-[var(--textSecondary)]">Try entering an image description to get started!</p>
</div>`;
};
