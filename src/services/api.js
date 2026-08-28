// src/services/api.js
import axios from 'axios';
import tokenService from './tokenService';
import { logger } from '../utils/logger';

const API_BASE_URL = 'https://catalystmedia.ai/promptcatalystfreedemo';

/**
 * The reworked API. Routes are moved here one group at a time; everything not
 * listed below still goes to the legacy server above.
 *
 * Reverting a group is a one-line change: point its calls back at `api`.
 *
 * Migrated so far: weekly prompts (read-only, static JSON, verified
 * byte-identical to the legacy responses).
 */
const NEW_API_BASE_URL = 'https://catalystmedia.ai/pctest';

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

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Request interceptor to add token and handle refresh
api.interceptors.request.use(
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
api.interceptors.response.use(
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
          return api(originalRequest);
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

const apiService = {
  // Authentication
  // In api.js login function
  loginPROD: async (email, password) => {
    try {
      const loginResponse = await axios.post(
        'https://catalystmedia.ai/wp-json/simple-jwt-login/v1/auth/',
        {
            email,
            password
        },
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
        
        const token = loginResponse.data.data.jwt;
        tokenService.setToken(token);
        
        const premiumResponse = await api.get('/test-premium');
        
        return {
            token,
            isPremium: premiumResponse.data.is_premium,
            displayName: premiumResponse.data.display_name,
            userId: premiumResponse.data.user_id
        };
    } catch (error) {
        // Removed logging
        
        // Handle email verification error
        if (error.response?.status === 403 && 
            error.response.data?.error === 'Email verification required') {
            throw new Error('email_verification_required');
        }

        if (error.response?.status === 400) {
            // Extract error message from nested structure
            let errorMessage = '';
            
            // Check different possible locations of the error message
            if (error.response.data?.data?.message) {
                errorMessage = error.response.data.data.message;
            } else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data?.data?.error) {
                errorMessage = error.response.data.data.error;
            } else if (typeof error.response.data?.data === 'string') {
                errorMessage = error.response.data.data;
            }
            
            // Removed logging

            // Map specific error messages to error codes
            if (errorMessage.includes('Wrong user credentials') || 
                errorMessage.includes('invalid credentials')) {
                throw new Error('invalid_credentials');
            }
            
            if (errorMessage.includes('user not found') || 
                errorMessage.includes('invalid username')) {
                throw new Error('user_not_found');
            }
            
            // If we have an error message but no specific mapping, use it directly
            if (errorMessage) {
                throw new Error(errorMessage);
            }
            
            // Fallback for unknown 400 errors
            throw new Error('invalid_credentials');
        }

        if (error.request) {
            throw new Error('network_error');
        }

        throw new Error('unknown_error');
    }
},
login: async (email, password) => {
  try {
      const loginResponse = await api.post('/auth', {
          email,
          password
      });
      
      const token = loginResponse.data.data.jwt;
      tokenService.setToken(token);
      
      const premiumResponse = await api.get('/test-premium');
      
      return {
          token,
          isPremium: premiumResponse.data.is_premium,
          displayName: premiumResponse.data.display_name,
          userId: premiumResponse.data.user_id,
          roles: premiumResponse.data.roles || [] // Add this line
      };
  } catch (error) {
      // Removed logging
      
      // Handle email verification error
      if (error.response?.status === 403 && 
          error.response.data?.error === 'Email verification required') {
          throw new Error('email_verification_required');
      }

      if (error.response?.status === 400) {
          // Extract error message from nested structure
          let errorMessage = '';
          
          // Check different possible locations of the error message
          if (error.response.data?.data?.message) {
              errorMessage = error.response.data.data.message;
          } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
          } else if (error.response.data?.data?.error) {
              errorMessage = error.response.data.data.error;
          } else if (typeof error.response.data?.data === 'string') {
              errorMessage = error.response.data.data;
          }
          
        // Removed logging

          // Map specific error messages to error codes
          if (errorMessage.includes('Wrong user credentials') || 
              errorMessage.includes('invalid credentials')) {
              throw new Error('invalid_credentials');
          }
          
          if (errorMessage.includes('user not found') || 
              errorMessage.includes('invalid username')) {
              throw new Error('user_not_found');
          }
          
          // If we have an error message but no specific mapping, use it directly
          if (errorMessage) {
              throw new Error(errorMessage);
          }
          
          // Fallback for unknown 400 errors
          throw new Error('invalid_credentials');
      }

      if (error.request) {
          throw new Error('network_error');
      }

      throw new Error('unknown_error');
  }
},
// Add to apiService object
submitCommunityPrompt: async (formData) => {
  try {
    const response = await api.post('/submit-community-prompt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: [function () {
        return formData;
      }]
    });
    return response.data;
  } catch (error) {
    logger.error('Failed to submit community prompt:', error);
    throw error;
  }
},
register: async (email, password, username) => {
  try {
    const response = await api.post('/register', {
      email,
      password,
      username
    });
    return response.data;
  } catch (error) {
    logger.debug('Registration error details:', {
      error: error.response?.data?.error,
      field: error.response?.data?.field
    });
    
    // Propagate the error with field information
    throw {
      message: error.response?.data?.error || 'Registration failed',
      field: error.response?.data?.field,
      status: error.response?.status
    };
  }
},
initiateCreditPurchase: async (packageId) => {
  try {
    const response = await api.post('/initiate-credit-purchase', { packageId });
    return response.data;
  } catch (error) {
    logger.error('Failed to initiate credit purchase:', error);
    throw error;
  }
},
initiateStripeCheckout: async () => {
  try {
    const response = await api.post('/admin-post.php?action=stripe_checkout');
    return response.data;
  } catch (error) {
    logger.error('Failed to initiate Stripe checkout:', error);
    throw error;
  }
},


// Method to handle subscription success
handleSubscriptionSuccess: async (sessionId) => {
  try {
    const response = await api.post('/verify-subscription', { 
      session_id: sessionId 
    });
    return response.data;
  } catch (error) {
    logger.error('Failed to verify successful subscription:', error);
    throw error;
  }
},

// Method to check subscription status - this uses the existing checkPremium method
checkSubscriptionStatus: async () => {
  try {
    const response = await api.get('/test-premium');
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
  logout: () => {
    tokenService.clearToken();
  },

  // Modified to handle 403 errors for new users
  checkPremium: async (isNewUser = false) => {
    try {
      const response = await api.get('/test-premium');
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
      const response = await api.get('/credits');
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
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      logger.error('Failed to process forgot password request:', error);
      // Map specific error responses
      if (error.response?.status === 404) {
        throw new Error('invalid_email');
      }
      throw error;
    }
  },
  
  resetPassword: async (email, resetKey, newPassword) => {
    try {
        // Removed logging

        const response = await api.post('/reset-password', {
            email,
            reset_key: resetKey,
            new_password: newPassword
        });

        // Removed logging

        return response.data;
    } catch (error) {
        logger.error('Password reset error');

        // Enhanced error handling
        if (error.response?.status === 400) {
            throw new Error('invalid_reset_key');
        } else if (error.response?.status === 404) {
            throw new Error('user_not_found');
        } else if (error.response?.status === 401) {
            throw new Error('expired_reset_key');
        }
        
        throw error;
    }
},
  // Prompt Generation
  generatePromptDeepseek: async (settings) => {
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
      
      const response = await api.post('/generate-prompt-deepseek', modifiedSettings);
      
      return response.data;
    } catch (error) {
      logger.error('Failed to generate prompt with DeepSeek:', error);
      throw error;
    }
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
      
      const response = await api.post('/generate-prompt', modifiedSettings);
      
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
      
      const response = await api.post('/generate-next-scene', request);
      
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
      
      const response = await api.post('/generate-video-prompt', apiParams);
      return response.data;
    } catch (error) {
      logger.error('Failed to generate video prompt:', error);
      throw error;
    }
  },

  generateVariations: async (prompt) => {
    try {
      // Make sure we're only sending the prompt
      const response = await api.post('/generate-variations', {
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
      const response = await api.post('/generate-extended', {
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
      const response = await api.post('/generate-shortened', { prompt });
      return response.data;
    } catch (error) {
      logger.error('Failed to generate shortened prompt:', error);
      throw error;
    }
  },

  editPrompt: async (originalPrompt, editInstructions) => {
    try {
      const response = await api.post('/edit-prompt', {
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
      const response = await api.post('/generate-random-prompts');
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
      const response = await api.post('/generate-text-to-video', payload);
      
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
            response = await api.get(`/text-to-video-status/${requestId}?${cacheBuster}`);
            // Removed logging
            break; // Success, exit the retry loop
          } 
          else if (attempts === 2) {
            // Second try: Attempt with minimal headers as fallback
            response = await axios.get(`${API_BASE_URL}/text-to-video-status/${requestId}?${cacheBuster}`, {
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
            const fetchResponse = await fetch(`${API_BASE_URL}/text-to-video-status/${requestId}?${cacheBuster}`, {
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
      const response = await api.get(`/user-text-to-videos?_=${timestamp}`, {
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
      } else if (model === 'gpt-image-1') {
          endpoint = '/generate-gpt-image'; // New endpoint for GPT Image 1
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
      
      const response = await api.post(endpoint, payload);
      
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
    
    // Try using a direct axios call with minimal headers to avoid CORS issues
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-animation`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });
      
      return response.data;
    } catch (directError) {
      // Fall back to the api instance if direct request fails
      const response = await api.post('/generate-animation', formData, {
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
    // Try first with direct axios to avoid potential CORS issues
    try {
      response = await axios.get(`${API_BASE_URL}/animation-status/${requestId}?${cacheBuster}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });
    } catch (directError) {
      logger.warn('Direct animation status check failed, trying with API instance:', directError);
      // Fall back to the api instance
      response = await api.get(`/animation-status/${requestId}?${cacheBuster}`);
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
    const response = await api.post('/generate-preview', { prompt: String(prompt).trim() });
    
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
      const response = await api.post('/analyze-image', formData, {
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
      const response = await api.post('/suggest-animation-prompt', formData, {
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
      
      const response = await api.post('/edit-image', formData, {
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

  // Subscription
  verifySubscription: async (receipt) => {
    try {
      const response = await api.post('/verify-subscription', { receipt });
      return response.data;
    } catch (error) {
      logger.error('Failed to verify subscription:', error);
      throw error;
    }
  },


  // File Upload
  uploadImage: async (formData) => {
    try {
      const response = await api.post('/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [function () {
          return formData;
        }]
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to upload image:', error);
      throw error;
    }
  },

  // Animation History API Methods
  getUserAnimations: async () => {
    try {
      // Add a cache-busting parameter to prevent browser caching
      const timestamp = Date.now();
      const url = `/user-animations?_=${timestamp}`;
      
      const response = await api.get(url, {
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
      const response = await api.get(`/user-animation/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAnimation: async (requestId) => {
    try {
      const response = await api.delete(`/user-animation/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default apiService;