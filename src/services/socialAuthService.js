/**
 * Service for handling social authentication flows
 */

// The Google Client ID 
const GOOGLE_CLIENT_ID = '380542979532-uh47rmug3b18c6sarifv51232tb2loja.apps.googleusercontent.com';

// Helper function to create full endpoint URL
const getEndpointUrl = (provider, paramType, paramValue) => {
  const baseUrl = process.env.REACT_APP_WORDPRESS_URL || 'https://catalystmedia.ai';
  return `${baseUrl}/?rest_route=/simple-jwt-login/v1/oauth/token&provider=${provider}&${paramType}=${encodeURIComponent(paramValue)}`;
};

// Helper function to check if user exists without full login
const getUserExistsEndpoint = (provider, email) => {
  const baseUrl = process.env.REACT_APP_WORDPRESS_URL || 'https://catalystmedia.ai';
  return `${baseUrl}/?rest_route=/simple-jwt-login/v1/user-exists&email=${encodeURIComponent(email)}`;
};

const socialAuthService = {
  /**
   * Exchange Google ID token for WordPress JWT
   */
  exchangeGoogleTokenForJWT: async (idToken) => {
    try {
      const endpoint = getEndpointUrl('google', 'id_token', idToken);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      // Get response as text first to safely handle different response formats
      const responseText = await response.text();
      
      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        throw new Error(data.message || `Authentication error (${response.status})`);
      }
      
      // Check for token in various possible formats
      const token = data.jwt || data.token || data.data?.jwt || data.data?.token;
      
      if (!token) {
        throw new Error('No authentication token returned from server');
      }
      
      return token;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Check if this appears to be a new user
   */
  checkIfNewUser: async (idToken) => {
    try {
      // Parse the ID token to get the email
      const tokenParts = idToken.split('.');
      if (tokenParts.length !== 3) {
        return false; // Invalid token format
      }
      
      // Decode the payload (second part of token)
      const payload = JSON.parse(atob(tokenParts[1]));
      const email = payload.email;
      
      if (!email) {
        return false; // No email in token
      }
      
      // Check if the user exists in WordPress
      const endpoint = getUserExistsEndpoint('google', email);
      
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        // If the response indicates the user doesn't exist, it's a new user
        return !data.exists;
      } catch (error) {
        // If there's an error checking, assume it might be a new user
        return true;
      }
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Handle the new user creation and login flow
   * This is a new function to handle the scenario when a new account is created
   */
  handleNewUserCreation: async (idToken) => {
    try {
      // Step 1: Check if this is a new user
      const isNewUser = await socialAuthService.checkIfNewUser(idToken);
      
      if (isNewUser) {
        // First try to exchange the token - this creates the user
        try {
          await socialAuthService.exchangeGoogleTokenForJWT(idToken);
        } catch (error) {
          // If it's a user already exists error, we can continue
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
        
        // Wait a brief moment for WordPress to process the creation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Now try again with the same token - this should log in the newly created user
        return await socialAuthService.exchangeGoogleTokenForJWT(idToken);
      }
      
      // If not a new user, proceed with normal token exchange
      return await socialAuthService.exchangeGoogleTokenForJWT(idToken);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Exchange Google authorization code for ID token
   */
  exchangeCodeForIdToken: async (code) => {
    try {
      const endpoint = getEndpointUrl('google', 'code', code);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to exchange authorization code');
      }
      
      const idToken = data.id_token || data.data?.id_token;
      
      if (!idToken) {
        throw new Error('No ID token in response');
      }
      
      return idToken;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Load the Google Sign-In SDK
   */
  loadGoogleSignInSDK: () => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector('script#google-oauth-script')) {
        if (window.google && window.google.accounts) {
       
          resolve();
          return;
        }
      }
      
 
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-oauth-script';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
       
        // Give a moment for the Google API to initialize
        setTimeout(() => {
          if (window.google && window.google.accounts) {
           
            resolve();
          } else {
          
            reject(new Error('Google API failed to initialize properly'));
          }
        }, 1000); // Increased timeout for initialization
      };
      
      script.onerror = () => {
      
        reject(new Error('Failed to load Google Sign-In SDK'));
      };
      
      document.body.appendChild(script);
    });
  },
  
  /**
   * Initialize Google Sign-In with FedCM support
   */
  initializeGoogleSignIn: (callback) => {
    if (!window.google || !window.google.accounts) {
   
      throw new Error('Google Sign-In SDK not loaded');
    }
    
    // Use hardcoded client ID if environment variable is not available
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;
    
    if (!clientId) {
     
      throw new Error('Google Client ID not available');
    }
    
  
    
    // Store callback in window object so it's accessible
    window.handleGoogleCallback = callback;
    
    // Initialize with FedCM opt-in
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: window.handleGoogleCallback,
      use_fedcm_for_prompt: true, // Enable FedCM
      auto_select: false,
      itp_support: true, // Enable for better support in browsers with tracking prevention
      // Add origins for higher security
      allowed_parent_origin: [
        window.location.origin,
        'https://promptcatalyst.ai',
        'https://www.promptcatalyst.ai',
        'http://localhost:3000'
      ]
    });
    
  
  },
  
  /**
   * Render the Google Sign In button into a container element
   */
  renderGoogleButton: (containerElement, theme = 'outline', size = 'large', text = 'signin_with', shape = 'rectangular') => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    
      return;
    }

    window.google.accounts.id.renderButton(
      containerElement,
      {
        type: 'standard',
        theme,
        size,
        text,
        shape
      }
    );
   
  },
  
  /**
   * Prompt the user to sign in with Google using FedCM
   */
  promptGoogleSignIn: () => {
    if (!window.google || !window.google.accounts) {
     
      throw new Error('Google Sign-In SDK not loaded');
    }
    
   
    try {
      // Check if the prompt method exists
      if (typeof window.google.accounts.id.prompt !== 'function') {
      
        throw new Error('Google prompt method is not available');
      }
      
      // This will use FedCM when available
      window.google.accounts.id.prompt((notification) => {
        if (notification) {
        
          
          // Log specific messages for different prompt outcomes
          if (notification.isNotDisplayed()) {
           
          }
          
          if (notification.isSkippedMoment()) {
           
          }
          
          if (notification.isDismissedMoment()) {
            
          }
        }
      });
      
     
    } catch (error) {
      
      throw error;
    }
  },
  
  /**
   * Handle redirect from OAuth flow
   */
  handleRedirect: async () => {
    // Check for authorization code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }
    
    if (code) {
      // Exchange code for ID token
      const idToken = await socialAuthService.exchangeCodeForIdToken(code);
      
      // Use the new function to handle new user creation
      const jwtToken = await socialAuthService.handleNewUserCreation(idToken);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return jwtToken;
    }
    
    return null;
  }
};

export default socialAuthService;