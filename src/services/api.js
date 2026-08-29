// src/services/api.js
import axios from 'axios';
import authService from './authService';
import tokenService from './tokenService';
import { logger } from '../utils/logger';

/**
 * The API, served from the same origin as the app.
 *
 * It used to live on catalystmedia.ai, so every request was cross-origin and
 * depended on Apache sending the right CORS headers. Serving it under /api
 * removes that -- and removes the reason the app needed a second domain.
 */
const NEW_API_BASE_URL = '/api';

/**
 * Client for public content. Deliberately without the token interceptors on
 * `api`: this data needs no authentication, so a request for it should never
 * trigger a token refresh or a logout.
 */
const contentApi = axios.create({
  baseURL: NEW_API_BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

/**
 * Builds an authenticated client.
 *
 * Both the legacy server and the reworked one need the same token handling, and
 * copying the interceptors would let the two drift apart. Note the retry
 * resolves through `client` rather than a fixed instance — the original code
 * retried through `api` by name, which would have sent a refreshed request to
 * the wrong server once a second client existed.
 */
const createAuthenticatedClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 60000, // 60 second timeout
    headers: {
      'Accept': 'application/json',
    },
    withCredentials: false,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
  });

  // Request interceptor to add token and handle refresh
  client.interceptors.request.use(
    async (config) => {
      // Skip token for auth endpoints
      if (config.url.includes('/auth') || config.url.includes('/register')) {
        return config;
      }

      // Ensure fresh token before request
      const token = await tokenService.ensureFreshToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Remove problematic headers that might cause CORS issues
      if (config.headers) {
        // These headers might cause preflight CORS issues
        const problematicHeaders = ['Cache-Control', 'Pragma', 'Expires'];
        problematicHeaders.forEach(header => {
          if (config.headers[header]) {
            delete config.headers[header];
          }
        });
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle authentication errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Try refreshing token
          const newToken = await tokenService.refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, proceed with logout
          tokenService.clearToken();
          window.dispatchEvent(new Event('tokenExpired'));
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

/** Authenticated client for routes already moved to the reworked service. */
const promptApi = createAuthenticatedClient(NEW_API_BASE_URL);

const apiService = {
login: async (email, password) => {
  /**
   * Signs in against Supabase, not WordPress.
   *
   * Accounts imported from WordPress have no password — phpass hashes cannot
   * be carried across — so an existing user's old password will not work and
   * they are asked to set a new one. authService turns that into a single
   * message, because Supabase reports it identically to a wrong password and
   * asking it apart would mean an endpoint that reveals who has an account.
   */
  const session = await authService.signIn(email, password);

  /**
   * The token is passed explicitly rather than relying on the interceptor.
   * The SDK writes the session to storage as part of signing in, and reading
   * it back here would depend on that having landed first.
   */
  const premiumResponse = await promptApi.get('/test-premium', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  return {
    token: session.access_token,
    isPremium: premiumResponse.data.is_premium,
    displayName: premiumResponse.data.display_name,
    userId: premiumResponse.data.user_id,
    roles: premiumResponse.data.roles || [],
  };
},
register: async (email, password, username) => {
  try {
    const { session, needsConfirmation } = await authService.signUp(email, password, username);
    return { success: true, session, needsConfirmation };
  } catch (error) {
    // The UI reads .message and .field, so that shape is kept.
    throw {
      message: error.message || 'Registration failed',
      field: error.code === 'user_already_exists' ? 'email' : undefined,
      code: error.code,
    };
  }
},
initiateCreditPurchase: async (packageId) => {
  try {
    const response = await promptApi.post('/initiate-credit-purchase', { packageId });
    return response.data;
  } catch (error) {
    logger.error('Failed to initiate credit purchase:', error);
    throw error;
  }
},


// Method to check subscription status - this uses the existing checkPremium method
checkSubscriptionStatus: async () => {
  try {
    const response = await promptApi.get('/test-premium');
    return {
      isPremium: response.data.is_premium,
      displayName: response.data.display_name,
      userId: response.data.user_id
    };
  } catch (error) {
    logger.error('Failed to check subscription status:', error);
    throw error;
  }
},
  /**
   * Ends both sessions.
   *
   * Clearing the legacy token alone would leave a live Supabase session in
   * storage, and tokenService prefers that one — so the user would still be
   * signed in after pressing log out.
   */
  logout: async () => {
    tokenService.clearToken();
    await authService.signOut();
  },

  // Modified to handle 403 errors for new users
  checkPremium: async (isNewUser = false) => {
    try {
      const response = await promptApi.get('/test-premium');
      return {
        is_premium: response.data.is_premium,
        display_name: response.data.display_name,
        user_id: response.data.user_id,
        roles: response.data.roles || [] // Add this line to include roles
      };
    } catch (error) {
      logger.error('Premium status check failed:', error);
      
      // For new users, handle 403 errors differently
      if (isNewUser && error.response?.status === 403) {
        
        // Return default values for new users
        
        // Try to extract email from the token if possible
        let email = '';
        try {
          const token = tokenService.getToken();
          if (token) {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              email = payload.data?.user_email || '';
            }
          }
        } catch (e) {
          logger.error('Error extracting email from token:', e);
        }
        
        // Return minimal user data
        return {
          is_premium: false,
          display_name: email ? email.split('@')[0] : 'New User',
          user_id: 0,
          roles: [],
          is_new_user: true
        };
      }
      
      throw error;
    }
  },

  // Credits
  getCredits: async () => {
    try {
      const response = await promptApi.get('/credits');
      return {
        credits: response.data.credits,
        resetType: response.data.resetType,
        lastReset: response.data.lastReset,
        isUnauthorized: response.data.isUnauthorized,
        user_id: response.data.user_id,
        is_premium: response.data.is_premium
      };
    } catch (error) {
      logger.error('Failed to fetch credits:', error);
      throw error;
    }
  },
  /**
   * Sends the email that lets someone set a password.
   *
   * Serves both a forgotten password and an account migrated from WordPress
   * that never had one. It resolves the same way whether or not the address
   * has an account, so it cannot be used to discover who is registered.
   */
  forgotPassword: async (email) => {
    return authService.requestPasswordReset(email);
  },

  /**
   * Sets the new password after the emailed link has been followed.
   *
   * The link carries a recovery session, which the Supabase client picks up
   * from the URL, so the email and reset key the old flow needed are no longer
   * part of it. The arguments are kept so existing callers still compile.
   */
  resetPassword: async (_email, _resetKey, newPassword) => {
    await authService.completePasswordReset(newPassword);
    return { success: true };
  },
  generatePrompt: async (settings) => {
    try {
      // Modify settings to ensure backend compatibility
      const modifiedSettings = { ...settings };
      
      // Convert array-based settings to string format for backend compatibility
      if (modifiedSettings.styles && Array.isArray(modifiedSettings.styles) && modifiedSettings.styles.length > 0) {
        // Join the styles array with commas
        modifiedSettings.combinedStyles = modifiedSettings.styles.join(',');
      }
      
      if (modifiedSettings.lightingEffects && Array.isArray(modifiedSettings.lightingEffects) && modifiedSettings.lightingEffects.length > 0) {
        // Join the lighting effects array with commas
        modifiedSettings.combinedLighting = modifiedSettings.lightingEffects.join(',');
      }
      
      if (modifiedSettings.cameraAngles && Array.isArray(modifiedSettings.cameraAngles) && modifiedSettings.cameraAngles.length > 0) {
        // Join the camera angles array with commas
        modifiedSettings.combinedCameraAngles = modifiedSettings.cameraAngles.join(',');
      }
      
      // Ensure promptAmount is set and is a number between 1 and 10
      if (modifiedSettings.promptAmount !== undefined) {
        modifiedSettings.promptAmount = Math.min(Math.max(1, parseInt(modifiedSettings.promptAmount)), 10);
      } else {
        modifiedSettings.promptAmount = 3; // Default to 3 if not specified
      }
      
      const response = await promptApi.post('/generate-prompt', modifiedSettings);
      
      return response.data;
    } catch (error) {
      logger.error('Failed to generate prompt:', error);
      throw error;
    }
  },
  // Next Scene generation
  generateNextScene: async (originalPrompt, nextSceneDetails) => {
    try {
      // Handle different possible data structures - the text could be wrapped in different ways
      let nextSceneText = '';
      
      if (typeof nextSceneDetails === 'string') {
        // Direct string case
        nextSceneText = nextSceneDetails;
      } else if (nextSceneDetails && typeof nextSceneDetails === 'object') {
        // Object case - could be { nextSceneDetails: 'text' } or some other structure
        if ('nextSceneDetails' in nextSceneDetails) {
          nextSceneText = nextSceneDetails.nextSceneDetails;
        } else {
          // Try to use the first string property we find
          const firstStringProp = Object.values(nextSceneDetails).find(val => typeof val === 'string');
          if (firstStringProp) {
            nextSceneText = firstStringProp;
          }
        }
      }
      
      // If we couldn't extract any details, use a default continuation prompt
      if (!nextSceneText) {
        nextSceneText = 'Continue the scene'; 
      }
      
      // IMPORTANT: Don't use formattedDetails = prompt as fallback
      if (nextSceneText === originalPrompt) {
        nextSceneText = 'Continue the scene';
      }
      
      // The API expects nextSceneDetails as a string property in the request body
      // Make sure we're sending a properly formatted object
      const request = {
        originalPrompt,
        nextSceneDetails: nextSceneText
      };
      
      const response = await promptApi.post('/generate-next-scene', request);
      
      return response.data;
    } catch (error) {
      logger.error('Failed to generate next scene:', error);
      throw error;
    }
  },
  
  generateVideoPrompt: async (settings) => {
    try {
      // Removed logging
      
      // Format settings according to API expectations
      const apiParams = {
        description: settings.description,
        // Priority order: video_style > videoStyle > style - to ensure we use the correct parameter
        style: settings.video_style || settings.videoStyle || settings.style,
        cameraMovement: settings.cameraMovement,
        cameraAngle: settings.cameraAngle,
        lighting: settings.lighting,
        specialEffects: settings.specialEffects,
        pacing: settings.pacing,
        promptLength: settings.promptLength,
        creativity: settings.creativity,
        promptAmount: settings.promptAmount // Add this missing parameter
      };
      
      // Log the mapping to confirm
      // Removed logging
      
      // Remove undefined or null values
      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === undefined || apiParams[key] === null) {
          delete apiParams[key];
        }
      });
      
      // Log final parameters being sent to the API
      // Removed logging
      
      const response = await promptApi.post('/generate-video-prompt', apiParams);
      return response.data;
    } catch (error) {
      logger.error('Failed to generate video prompt:', error);
      throw error;
    }
  },

  generateVariations: async (prompt) => {
    try {
      // Make sure we're only sending the prompt
      const response = await promptApi.post('/generate-variations', {
        prompt: String(prompt).trim()
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to generate variations:', error);
      throw error;
    }
  },

  generateExtended: async (prompt, additionalDetails) => {
    try {
      const response = await promptApi.post('/generate-extended', {
        prompt,
        additionalDetails
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to generate extended prompt:', error);
      throw error;
    }
  },

  generateShortened: async (prompt) => {
    try {
      const response = await promptApi.post('/generate-shortened', { prompt });
      return response.data;
    } catch (error) {
      logger.error('Failed to generate shortened prompt:', error);
      throw error;
    }
  },

  editPrompt: async (originalPrompt, editInstructions) => {
    try {
      const response = await promptApi.post('/edit-prompt', {
        originalPrompt,
        editInstructions
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to edit prompt:', error);
      throw error;
    }
  },

  generateRandomPrompts: async () => {
    try {
      const response = await promptApi.post('/generate-random-prompts');
      return response.data;
    } catch (error) {
      logger.error('Failed to generate random prompts:', error);
      throw error;
    }
  },

  // Text to Video Generation
  generateTextToVideo: async ({ prompt, duration = '5', aspectRatio = '16:9', resolution = '720p', cfgScale }) => {
    try {
      // Create the request payload
      const payload = {
        prompt: String(prompt).trim(),
        duration,
        aspectRatio,
        resolution,
        cfgScale: cfgScale || 0.5
      };
      
      // Make the API request
      const response = await promptApi.post('/generate-text-to-video', payload);
      
      // Return the response data
      return response.data;
    } catch (error) {
      logger.error('Failed to generate video from text:', error);
      
      // Handle specific error types
      if (error.response?.status === 429) {
        throw new Error('Not enough credits for this operation');
      } else if (error.response?.status === 403) {
        throw new Error('Pro or Ultimate membership required for video generation');
      }
      
      throw error;
    }
  },
  
  // Check text-to-video generation status
  checkTextToVideoStatus: async (requestId) => {
    try {
      // Add a cache-busting parameter
      const cacheBuster = `_t=${Date.now()}`;
      
      // Get auth token for the request
      const token = await tokenService.ensureFreshToken();
      
      // IMPORTANT: This is the endpoint that returns server data like model, duration, resolution
      // We need to preserve ALL fields from this response as it's the source of truth
      
      let response;
      let attempts = 0;
      const maxAttempts = 3;
      
      // Multiple attempt retry logic with different methods
      while (attempts < maxAttempts) {
        try {
          attempts++;
          
          if (attempts === 1) {
            // First try: Use the API instance that already has proper CORS handling
            response = await promptApi.get(`/text-to-video-status/${requestId}?${cacheBuster}`);
            // Removed logging
            break; // Success, exit the retry loop
          } 
          else if (attempts === 2) {
            // Second try: Attempt with minimal headers as fallback
            response = await axios.get(`${NEW_API_BASE_URL}/text-to-video-status/${requestId}?${cacheBuster}`, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : undefined,
                // Adding accept header to ensure proper response format
                'Accept': 'application/json'
              },
              timeout: 10000 // 10 second timeout
            });
            // Removed logging
            break; // Success, exit the retry loop
          }
          else {
            // Last resort: Use fetch API directly
            const fetchResponse = await fetch(`${NEW_API_BASE_URL}/text-to-video-status/${requestId}?${cacheBuster}`, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json'
              }
            });
            
            if (!fetchResponse.ok) {
              throw new Error(`Fetch failed with status ${fetchResponse.status}`);
            }
            
            const data = await fetchResponse.json();
            // Removed logging
            return data; // Return directly since we're not using axios response format
          }
        } catch (attemptError) {
          logger.warn(`Video status check attempt ${attempts}/${maxAttempts} failed:`, attemptError);
          
          if (attempts >= maxAttempts) {
            throw attemptError; // Re-throw the last error if we've exhausted all attempts
          }
          
          // Short delay before next attempt
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return response.data;
    } catch (error) {
      logger.error('Failed to check text-to-video status:', error);
      
      // Handle specific errors
      if (error.message && (error.message.includes('Network Error') || error.message.includes('CORS'))) {
        const corsError = new Error('Unable to connect to video server. This might be a temporary network issue.');
        corsError.isCorsError = true;
        throw corsError;
      }
      
      // Handle 404 errors for requests that no longer exist
      if (error.response?.status === 404) {
        const notFoundError = new Error('Video request not found or expired.');
        notFoundError.status = 'NOT_FOUND';
        throw notFoundError;
      }
      
      throw error;
    }
  },
  
  // Get user's text-to-video history
  getUserTextToVideos: async () => {
    try {
      // Add cache-busting parameter
      const timestamp = Date.now();
      const response = await promptApi.get(`/user-text-to-videos?_=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user text-to-videos:', error);
      throw error;
    }
  },

  // Image Generation
  // Update the generateImage method in the API service
generateImage: async ({ prompt, width, height, model, numberResults, rawMode }) => {
  try {
      // Determine which endpoint to use based on the model
      let endpoint;
      
      if (model.startsWith('flux-pro')) {
          endpoint = '/generate-flux-image';
      } else if (model === 'imagen') {
          endpoint = '/generate-imagen';
      } else if (model === 'seedream-4.0') {
          // Seedream 4.0 uses its own specific endpoint
          endpoint = '/generate-image'; // Or use a specific endpoint if needed: '/generate-seedream-image'
      } else if (model.startsWith('juggernaut-flux')) {
          // Use the same endpoint for Juggernaut models as for regular Flux models
          endpoint = '/generate-image';
      } else if (model.startsWith('hidream-')) {
          // Use the same endpoint for HiDream models as for regular Flux models
          endpoint = '/generate-image';
      } else {
          endpoint = '/generate-image';
      }
      
      let finalWidth, finalHeight;
      
      // For Seedream 4.0, use the exact dimensions without rounding
      if (model === 'seedream-4.0') {
          // Seedream 4.0 has specific fixed dimensions that shouldn't be modified
          finalWidth = Number(width);
          finalHeight = Number(height);
      } else {
          // Round dimensions to multiple of 64 for API compatibility
          // This is a fallback in case the frontend doesn't handle it
          const roundToMultipleOf64 = (num) => Math.round(num / 64) * 64;
          const apiWidth = roundToMultipleOf64(Number(width));
          const apiHeight = roundToMultipleOf64(Number(height));
          
          // Ensure dimensions are within API limits
          finalWidth = Math.min(2048, Math.max(512, apiWidth));
          finalHeight = Math.min(2048, Math.max(512, apiHeight));
      }
      
      // Create request payload
      const payload = {
          prompt: String(prompt).trim(),
          width: finalWidth,
          height: finalHeight,
          model: String(model),
          numberResults: Number(numberResults)
      };
      
      // Add rawMode parameter only for Flux Ultra model
      if (rawMode === true && model === 'flux-pro-1.1-ultra') {
          payload.rawMode = true;
      }
      
      const response = await promptApi.post(endpoint, payload);
      
      // Handle the response
      if (response.data.error) {
          throw new Error(response.data.error);
      }
      
      return {
          success: true,
          images: response.data.images || [],
          settings: response.data.settings,
          creditsUsed: response.data.creditsUsed
      };
  } catch (error) {
      logger.error('Failed to generate image:', error);
      // Enhance error handling for premium features
      if (error.response?.status === 403) {
          throw new Error('This model requires a premium subscription');
      }
      throw error;
  }
},
generateAnimation: async (imageFile, prompt, movementId, duration, metadata = {}, aspectRatio = '16:9') => {
  try {
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('prompt', prompt || '');
    
    // Only append movementId if it's not null or undefined
    if (movementId) {
      formData.append('movementId', movementId);
    }
    
    formData.append('duration', duration);
    
    // Extract resolution from metadata to ensure it's added only once
    let resolution = '720p'; // Default value
    if (metadata && metadata.resolution) {
      resolution = metadata.resolution;
      // Create a copy of metadata without the resolution to avoid duplication
      const { resolution: _, ...restMetadata } = metadata;
      metadata = restMetadata;
    }
    
    // Add resolution as a top-level parameter (matching server expectations)
    // Make the resolution more explicit to avoid any confusion
    formData.append('resolution', resolution);
    formData.append('video_resolution', resolution); // Try alternative parameter name
    formData.append('videoResolution', resolution);  // Try camelCase version
    
    // Log detailed information about the resolution being sent
   
    
    // Validate and set aspect ratio (only allow the three standard values)
    const validRatios = ['16:9', '9:16', '1:1'];
    const standardRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';
    formData.append('aspect_ratio', standardRatio);
    
    // Always add a unique timestamp to each request to prevent caching
    formData.append('request_timestamp', Date.now().toString());
    formData.append('client_unique_id', Math.random().toString(36).substring(2, 15));
    
    // Add metadata if provided (for preset categories, etc.)
    if (metadata && Object.keys(metadata).length > 0) {
      Object.entries(metadata).forEach(([key, value]) => {
        // Ensure all object values are properly stringified
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });
    }
    
    // Add auth token for direct request
    const token = await tokenService.ensureFreshToken();
    
    // Direct axios call, bypassing the shared client's interceptors
    try {
      const response = await axios.post(`${NEW_API_BASE_URL}/generate-animation`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });
      
      return response.data;
    } catch (directError) {
      // Fall back to the api instance if direct request fails
      const response = await promptApi.post('/generate-animation', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [function () {
          return formData;
        }]
      });
      return response.data;
    }
  } catch (error) {
    logger.error('Failed to generate animation:', error);
    
    // Handle CORS errors specifically
    if (error.message && (error.message.includes('Network Error') || error.message.includes('CORS'))) {
      // Create a more user-friendly error
      const corsError = new Error('Unable to connect to animation server. This might be a temporary network issue. Please try again in a few moments.');
      corsError.isCorsError = true;
      throw corsError;
    }
    
    // Handle other specific error cases
    if (error.response?.status === 413) {
      throw new Error('Image file is too large. Please use an image smaller than 10MB.');
    } else if (error.response?.status === 415) {
      throw new Error('Unsupported image format. Please use JPG, PNG or WebP format.');
    } else if (error.response?.status === 403) {
      throw new Error('Pro membership required for animation generation.');
    }
    
    throw error;
  }
},
// Add new method to check animation status with cache prevention
checkAnimationStatus: async (requestId) => {
  try {
    // Add a cache-busting query parameter, but use query param approach rather than headers
    const cacheBuster = `_t=${Date.now()}`;
    
    // Get auth token for direct request
    const token = await tokenService.ensureFreshToken();
    
    let response;
    // Direct axios call, bypassing the shared client's interceptors
    try {
      response = await axios.get(`${NEW_API_BASE_URL}/animation-status/${requestId}?${cacheBuster}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });
    } catch (directError) {
      logger.warn('Direct animation status check failed, trying with API instance:', directError);
      // Fall back to the api instance
      response = await promptApi.get(`/animation-status/${requestId}?${cacheBuster}`);
    }
    
    return response.data;
  } catch (error) {
    logger.error('Failed to check animation status:', error);
    
    // Handle CORS errors specifically
    if (error.message && (error.message.includes('Network Error') || error.message.includes('CORS'))) {
      // Create a more user-friendly error
      const corsError = new Error('Unable to connect to animation server. This might be a temporary network issue. Please try again in a few moments.');
      corsError.isCorsError = true;
      throw corsError;
    }
    
    // Handle 404 errors for animation requests that no longer exist
    if (error.response?.status === 404) {
      const notFoundError = new Error('Animation request not found or expired.');
      notFoundError.status = 'NOT_FOUND';
      throw notFoundError;
    }
    
    throw error;
  }
},
  generatePreview: async (prompt) => {
  try {
    const response = await promptApi.post('/generate-preview', { prompt: String(prompt).trim() });
    
    // Ensure we're returning in the expected format
    if (!response.data || (!response.data.imageUrl && typeof response.data !== 'string')) {
      throw new Error('Invalid preview response format');
    }
    
    // Handle both object response and direct string response
    return {
      imageUrl: response.data.imageUrl || response.data
    };
  } catch (error) {
    // Check specifically for rate limit or quota exceeded
    if (error.response?.status === 429 || error.response?.data?.error?.includes('premium')) {
      throw {
        ...error,
        isRateLimit: true
      };
    }
    logger.error('Failed to generate preview:', error);
    throw error;
  }
},

  // Image Analysis
  analyzeImage: async (formData) => {
    try {
      const response = await promptApi.post('/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [function () {
          return formData;
        }]
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to analyze image:', error);
      throw error;
    }
  },

  suggestAnimationPrompt: async (formData) => {
    try {
      const response = await promptApi.post('/suggest-animation-prompt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [function () {
          return formData;
        }]
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to suggest animation prompt:', error);
      throw error;
    }
  },

  // Image Editing
  editImage: async (formData) => {
    try {
      // Enhanced logging for debugging
     
      
      // Log FormData contents (for debugging)
      if (process.env.NODE_ENV === 'development') {
        for (let [key, value] of formData.entries()) {
          if (key === 'image') {
          
          } else {
          
          }
        }
      }
      
      const response = await promptApi.post('/edit-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [function () {
          return formData;
        }],
        timeout: 120000 // 2 minute timeout for image editing
      });
      
     
      
      return response.data;
    } catch (error) {
      logger.error('Failed to edit image:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Enhanced error handling
      if (error.response?.status === 500) {
        const serverError = new Error(
          error.response?.data?.details || 
          error.response?.data?.error || 
          'Server error during image editing'
        );
        serverError.status = 500;
        serverError.serverResponse = error.response?.data;
        throw serverError;
      }
      
      throw error;
    }
  },

  // Content and Resources
  getWeeklyPrompts: async () => {
    try {
      const response = await contentApi.get('/api/weekly-prompts-new');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch weekly prompts:', error);
      throw error;
    }
  },
  
  // Weekly Video Prompts
  getWeeklyVideoPrompts: async () => {
    try {
      // Try to use the video-specific endpoint if it exists
      const response = await contentApi.get('/api/weekly-video-prompts');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch weekly video prompts:', error);
      throw error;
    }
  },
  
  // NEW: Simplified Weekly Video Prompts (URL and prompt only)
  getSimplifiedVideoPrompts: async () => {
    try {
      // First try to get video-specific prompts
      const response = await contentApi.get('/api/weekly-video-prompts');
      
      // Transform to simplified format
      if (response.data && response.data.weeklyPrompts) {
        const simplified = {
          ...response.data,
          weeklyPrompts: response.data.weeklyPrompts.map(week => ({
            dateRange: week.dateRange,
            prompts: week.prompts
              .filter(prompt => prompt.video || prompt.videoUrl)
              .map(prompt => ({
                prompt: prompt.prompt,
                video: prompt.video || prompt.videoUrl
              }))
          })).filter(week => week.prompts.length > 0)
        };
        return simplified;
      }
      
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch simplified video prompts:', error);
      throw error;
    }
  },


  // Animation History API Methods
  getUserAnimations: async () => {
    try {
      // Add a cache-busting parameter to prevent browser caching
      const timestamp = Date.now();
      const url = `/user-animations?_=${timestamp}`;
      
      const response = await promptApi.get(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Debug logging for user animations response
      if (process.env.NODE_ENV === 'development' && response.data?.animations) {
       
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserAnimation: async (requestId) => {
    try {
      const response = await promptApi.get(`/user-animation/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAnimation: async (requestId) => {
    try {
      const response = await promptApi.delete(`/user-animation/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default apiService;