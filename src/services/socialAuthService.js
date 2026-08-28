import authService from './authService';
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

/** The user from the most recent Google sign-in, for checkIfNewUser. */
let lastSignIn = null;

const socialAuthService = {
  /**
   * Exchange Google ID token for WordPress JWT
   */
  /**
   * Exchanges the Google id token for a Supabase session.
   *
   * Supabase is configured with the same Google client id the site has always
   * used, and the id token flow needs no redirect URI, so the button, the popup
   * and the consent screen are unchanged from the user's point of view. Google
   * accounts never had a password, so unlike email sign-in nothing about this
   * migration is visible to them.
   *
   * The signed-in user is remembered so checkIfNewUser can answer without a
   * second round trip.
   */
  exchangeGoogleTokenForJWT: async (idToken) => {
    const session = await authService.signInWithGoogle(idToken);
    lastSignIn = session?.user ?? null;
    return session.access_token;
  },

  /**
   * Whether the account was created by the sign-in that just happened.
   *
   * Only drives the welcome message. An account carrying wp_user_id came from
   * the WordPress import and is by definition not new — which matters, because
   * every imported account was created on the migration date and would
   * otherwise look brand new.
   */
  checkIfNewUser: async () => {
    if (!lastSignIn) return false;
    if (lastSignIn.app_metadata?.wp_user_id) return false;
    const createdAt = Date.parse(lastSignIn.created_at ?? '');
    if (Number.isNaN(createdAt)) return false;
    return Date.now() - createdAt < 60_000;
  },

  /**
   * Kept for the existing call site. Supabase creates the account on first
   * sign-in, so there is no separate creation step any more.
   */
  handleNewUserCreation: async (idToken) => {
    return socialAuthService.exchangeGoogleTokenForJWT(idToken);
  },

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