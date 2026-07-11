import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socialAuthService from '../services/socialAuthService';

const GoogleLoginButton = ({ onLoginStart, onLoginComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleSocialLogin } = useAuth();
  const buttonRef = useRef(null);
  const [useFallbackButton, setUseFallbackButton] = useState(false);

  useEffect(() => {
    // Load Google Sign-In SDK
    socialAuthService.loadGoogleSignInSDK()
      .then(() => {
        // Initialize Google Sign-In with our callback
        try {
          socialAuthService.initializeGoogleSignIn(handleGoogleCallback);
          
          // Try to render the official Google button
          try {
            if (buttonRef.current) {
              socialAuthService.renderGoogleButton(buttonRef.current);
            }
          } catch (error) {
            setUseFallbackButton(true);
          }
        } catch (error) {
          setError(`Failed to initialize Google Sign-In`);
          setUseFallbackButton(true);
        }
      })
      .catch(error => {
        setError(`Failed to load Google Sign-In`);
        setUseFallbackButton(true);
      });

    // Cleanup on unmount
    return () => {
      // Remove the callback if needed
      if (window.handleGoogleCallback) {
        delete window.handleGoogleCallback;
      }
    };
  }, []);

  // Google Sign-In callback function
  const handleGoogleCallback = async (response) => {
    // Clear any previous errors
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
      
      // Use the new function to handle new user creation
      const wordpressJwt = await socialAuthService.handleNewUserCreation(idToken);
      
      // Determine if this is likely a new user (for UI feedback)
      const isNewUser = await socialAuthService.checkIfNewUser(idToken);
      
      // Proceed with social login using the WordPress JWT
      await handleSocialLogin(wordpressJwt, isNewUser);
      
      if (onLoginComplete) onLoginComplete();
      
      // Reset error state on success
      setError(null);
    } catch (error) {
      setError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackButtonClick = () => {
    if (isLoading) return;
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Prompt the user to sign in with Google
      socialAuthService.promptGoogleSignIn();
    } catch (error) {
      setError('Could not open Google Sign-In');
    }
  };

  // Custom styled button that matches the dark theme
  if (useFallbackButton) {
    return (
      <div className="w-full">
        <button
          onClick={handleFallbackButtonClick}
          disabled={isLoading}
          type="button"
          className="w-full py-2.5 px-4 bg-[var(--cardBackground)] border border-[var(--border)] text-[var(--text)] rounded-lg font-medium transition-colors hover:bg-[var(--dropdownHover)] flex items-center justify-center gap-3 relative"
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
          <span className="text-[var(--text)]">{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>
        
        {/* Display error message if any */}
        {error && (
          <div className="mt-2 text-sm text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Render a container for the Google-rendered button
  return (
    <div className="w-full flex flex-col justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--cardBackground)]/80 rounded-lg z-10">
          <div className="w-6 h-6 border-2 border-t-transparent border-[var(--primary)] rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={buttonRef} className="w-full flex justify-center"></div>
      
      {/* Display error message if any */}
      {error && (
        <div className="mt-2 text-sm text-red-500 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;