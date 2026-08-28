import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socialAuthService from '../services/socialAuthService';
import { logger } from '../utils/logger';
import './GoogleButtonStyles.css'; // Import the CSS for styling

const MaskedGoogleButton = ({ onLoginStart, onLoginComplete, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleSocialLogin } = useAuth();
  const googleButtonRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    let mounted = true;
    
    // Load Google Sign-In SDK
    socialAuthService.loadGoogleSignInSDK()
      .then(() => {
        if (!mounted) return;
        
        // Initialize Google Sign-In with our callback
        try {
          socialAuthService.initializeGoogleSignIn(handleGoogleCallback);
          
          // Render the official Google button into our hidden container
          if (googleButtonRef.current) {
            // Use 'filled_black' theme for better masking
            socialAuthService.renderGoogleButton(googleButtonRef.current, 'filled_black');
          }
        } catch (error) {
          logger.error("Failed to initialize Google Sign-In:", error);
          setError(`Sign-in initialization failed`);
        }
      })
      .catch(error => {
        if (!mounted) return;
        logger.error("Failed to load Google SDK:", error);
        setError(`Sign-in service unavailable`);
      });

    return () => {
      mounted = false;
      if (window.handleGoogleCallback) {
        delete window.handleGoogleCallback;
      }
    };
  }, []);

  // Google Sign-In callback function
  const handleGoogleCallback = async (response) => {
    setError(null);
    
    if (!response || !response.credential) {
      setError('Authentication failed');
      return;
    }
    
    setIsLoading(true);
    if (onLoginStart) onLoginStart();
    
    try {
      // Get the ID token from the response
      const idToken = response.credential;
      
      // Handle the authentication process
      const wordpressJwt = await socialAuthService.handleNewUserCreation(idToken);
      const isNewUser = await socialAuthService.checkIfNewUser(idToken);
      
      // Complete the login
      await handleSocialLogin(wordpressJwt, isNewUser);
      
      if (onLoginComplete) onLoginComplete();
      setError(null);
    } catch (error) {
      logger.error("Google login processing error:", error);
      setError('Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div 
        ref={containerRef} 
        className="relative w-full h-10" // Container with relative positioning and fixed height
      >
        {/* Our custom-styled button (visual only) - with lighter background */}
        <button
          type="button"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-[var(--inputBackground)]  border border-[var(--border)] text-[var(--text)] rounded-lg font-medium transition-colors hover:bg-[var(--inputBackground)] flex items-center justify-center gap-3 relative pointer-events-none"
          aria-label="Sign in with Google"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-[var(--primary)] rounded-full animate-spin absolute left-4"></div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
          )}
          <span className="text-[var(--text)]">{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>
        
        {/* The actual Google button (invisible but functional) */}
        <div 
          ref={googleButtonRef} 
          className="google-btn-container"
        />
      </div>
      
      {/* Display error message if any */}
      {error && (
        <div className="mt-2 text-sm text-red-500 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default MaskedGoogleButton;