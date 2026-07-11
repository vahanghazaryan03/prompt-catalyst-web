// AuthContext.js

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/api';
import tokenService from '../services/tokenService';

const AUTH_ERROR_MESSAGES = {
    'invalid_credentials': 'Invalid email or password. Please try again.',
    'user_not_found': 'No account found with this email address.',
    'incorrect_password': 'The password you entered is incorrect.',
    'user_not_verified': 'Please verify your email before logging in.',
    'network_error': 'Unable to connect to server. Please try again.',
    'server_error': 'Something went wrong. Please try again later.',
    'unknown_error': 'An unexpected error occurred. Please try again.',
    'invalid_email': 'No account found with this email address.',
    'invalid_reset_key': 'Invalid or expired reset link. Please request a new one.',
    'password_reset_failed': 'Failed to reset password. Please try again.',
    // Social login errors
    'jwt_not_configured': 'Social login is not properly configured. Please contact support.',
    'jwt_generation_failed': 'Failed to generate authentication token. Please try again.',
    'no_user': 'No user account was found during social login.',
    'user_not_found': 'User account could not be retrieved.'
};

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);

    const checkAuthStatus = useCallback(async (silent = false, isNewUser = false) => {
        try {
          // If there's no token at all, user is definitely not logged in
          if (!tokenService.getToken()) {
            setUser(null);
            setLoading(false);
            return;
          }
      
          // Ensure our token is valid/fresh
          await tokenService.ensureFreshToken();
      
          // Fetch premium status data from the server
          const premiumData = await apiService.checkPremium();
          
          // For new users, the premium data might be minimal, but we should still create a valid user object
          if (!premiumData && !isNewUser) {
            // If server returned nothing valid, log user out
            await logout();
            return;
          }
      
          // Extract relevant data from the response
          const { 
            is_premium = false, 
            display_name = '', 
            user_id = 0, 
            roles = [] 
          } = premiumData || {};
          
          const isProMember =
            roles.includes('um_pro-member') || roles.includes('um_pro-member-yearly');
        
        const isUltimateMember =
            roles.includes('um_ultimate-member') || roles.includes('um_ultimate-member-yearly');
      
          // Check if we have a custom display name in localStorage
          const savedDisplayName = localStorage.getItem('userDisplayName');
      
          // Determine the user tier based on membership status - names don't matter
          let userTier = 'free';
          if (isUltimateMember) {
            userTier = 'visionary'; // Could be ultimate or visionary - just a label
          } else if (isProMember) {
            userTier = 'pro';
          } else if (is_premium) {
            userTier = 'standard'; // Could be premium or standard - just a label
          }
          
          // Update the user state based on the actual values
          setUser((prevUser) => ({
            ...(prevUser || {}),
            isPremium: is_premium,
            isProMember,
            isUltimateMember,
            tier: userTier, // Add the new tier property as a shorthand convenience
            displayName: savedDisplayName || display_name,
            userId: user_id,
            email: prevUser?.email,
            roles
          }));
          
          return premiumData;
        } catch (error) {
          if (!silent) {
            toast.error('Authentication check failed. Please try logging in again.');
          }
          
          // For new users, don't log out immediately on first attempt
          if (!isNewUser) {
            await logout();
          } else {
            // For new users, create a minimal user object based on token
            try {
              const token = tokenService.getToken();
              if (token) {
                // Extract basic info from token if possible (JWT tokens have 3 parts)
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                  try {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    // Check if we have a custom display name in localStorage
                    const savedDisplayName = localStorage.getItem('userDisplayName');
                    
                    // Create a minimal user object with available data
                    setUser({
                      isPremium: false,
                      isProMember: false,
                      isUltimateMember: false,
                      tier: 'free', // Default tier for minimal user object
                      displayName: savedDisplayName || payload.data?.display_name || '',
                      userId: payload.data?.user_id || 0,
                      email: payload.data?.user_email || '',
                      roles: []
                    });
                    
                    // Try to fetch complete data again after a delay
                    setTimeout(() => {
                      checkAuthStatus(true);
                    }, 3000);
                    
                    return { minimal: true };
                  } catch (e) {
                    // Silent error handling for token parsing
                  }
                }
              }
            } catch (tokenError) {
              // Silent error handling for token processing
            }
          }
        } finally {
          setLoading(false);
        }
      }, []);
      
    const login = async (email, password) => {
        try {
            setLoginLoading(true);
            const userData = await apiService.login(email, password);
            
            if (userData) {
                // Extract roles from the userData
                const roles = userData.roles || [];
                
                // Determine Pro member status from roles, same logic as in checkAuthStatus
                const isProMember = 
                    roles.includes('um_pro-member') || 
                    roles.includes('um_pro-member-yearly');
                
                const isUltimateMember = 
                    roles.includes('um_ultimate-member') || 
                    roles.includes('um_ultimate-member-yearly');
                
                // Determine the user tier based on membership status - labels only
                let userTier = 'free';
                if (isUltimateMember) {
                  userTier = 'visionary';
                } else if (isProMember) {
                  userTier = 'pro';
                } else if (userData.isPremium) {
                  userTier = 'standard';
                }
                
                // Check if we have a custom display name in localStorage
                const savedDisplayName = localStorage.getItem('userDisplayName');
                
                // Set user with all necessary properties including isProMember flag
                setUser({
                    isPremium: userData.isPremium,
                    isProMember,
                    isUltimateMember,
                    tier: userTier, // Add tier property as convenience
                    displayName: savedDisplayName || userData.displayName,
                    userId: userData.userId,
                    email: userData.email,
                    roles // Store the roles array
                });
                
                toast.success('Login successful!');
                return userData;
            } else {
                throw new Error('invalid_credentials');
            }
        } catch (error) {
            const errorMessage = error.message || 'unknown_error';
            toast.error(AUTH_ERROR_MESSAGES[errorMessage] || 'Login failed. Please try again.');
            throw new Error(errorMessage); // Preserve the error code
        } finally {
            setLoginLoading(false);
        }
    };

    // Add function to update display name (frontend only)
    const updateDisplayName = (newDisplayName) => {
        if (!user) return false;
        
        // Save to localStorage for persistence
        localStorage.setItem('userDisplayName', newDisplayName);
        
        // Update user state
        setUser(prevUser => ({
            ...prevUser,
            displayName: newDisplayName
        }));
        
        return true;
    };

    // Updated Handle social login with JWT token
    const handleSocialLogin = async (token, isNewUser = false) => {
        try {
            setLoginLoading(true);
            
            // Validate token format (simple check)
            if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
                throw new Error('Invalid token format');
            }
            
            // Store the JWT token
            tokenService.setToken(token);
            
            // Check premium status to get user data
            const userData = await checkAuthStatus(true, isNewUser); // Pass 'true' to suppress errors and flag for new user
            
            if (userData) {
                // If we got minimal data for a new user, we're still good
                if (userData.minimal) {
                    toast.success('Successfully logged in with Google!');
                    return { success: true, minimal: true };
                }
                
                // Extract roles and determine permissions
                const roles = userData.roles || [];
                const isProMember = 
                    roles.includes('um_pro-member') || 
                    roles.includes('um_pro-member-yearly');
                
                const isUltimateMember = 
                    roles.includes('um_ultimate-member') || 
                    roles.includes('um_ultimate-member-yearly');
                
                // Determine the user tier based on membership status - names don't matter
                let userTier = 'free';
                if (isUltimateMember) {
                  userTier = 'visionary'; // Just a label
                } else if (isProMember) {
                  userTier = 'pro';
                } else if (userData.is_premium) {
                  userTier = 'standard'; // Just a label
                }
                
                // Check if we have a custom display name in localStorage
                const savedDisplayName = localStorage.getItem('userDisplayName');
                
                // Update user state with complete information
                setUser({
                    isPremium: userData.is_premium,
                    isProMember,
                    isUltimateMember,
                    tier: userTier, // Add tier property as convenience
                    displayName: savedDisplayName || userData.display_name,
                    userId: userData.user_id,
                    roles
                });
                
                toast.success('Successfully logged in with Google!');
                return userData;
            } else if (isNewUser) {
                // For new users, we might not get data immediately, but we should still log them in
                toast.success('Successfully logged in with Google!');
                return { success: true, minimal: true };
            } else {
                throw new Error('Failed to get user data after social login');
            }
        } catch (error) {
            // Clear token on failure
            tokenService.clearToken();
            toast.error('Social login failed. Please try again.');
            
            // Rethrow the error for handling in the component
            throw error;
        } finally {
            setLoginLoading(false);
        }
    };

    const register = async (email, password, username) => {
        try {
            setLoginLoading(true);
            const response = await apiService.register(email, password, username);
            
            if (response.success) {
                toast.success('Registration successful! Please check your email to verify your account.');
                return response;
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
            throw error;
        } finally {
            setLoginLoading(false);
        }
    };
    const forgotPassword = async (email) => {
        try {
            setLoginLoading(true);
            const response = await apiService.forgotPassword(email);
            toast.success('Password reset instructions have been sent to your email');
            return response;
        } catch (error) {
            const errorMessage = AUTH_ERROR_MESSAGES[error.message] || 'Failed to process request. Please try again.';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoginLoading(false);
        }
    };
    
    const resetPassword = async (email, resetKey, newPassword) => {
        try {
            setLoginLoading(true);
            const response = await apiService.resetPassword(email, resetKey, newPassword);
            toast.success('Password has been reset successfully. Please log in.');
            return response;
        } catch (error) {
            const errorMessage = AUTH_ERROR_MESSAGES[error.message] || 'Failed to reset password. Please try again.';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoginLoading(false);
        }
    };
    
    const logout = async () => {
        try {
            // Clear the custom display name from localStorage
            localStorage.removeItem('userDisplayName');
            
            // Clear user state and log out from API
            setUser(null);
            apiService.logout();
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed. Please try again.');
        }
    };

    useEffect(() => {
        const handleTokenExpired = () => {
            logout();
            toast.error('Your session has expired. Please log in again.');
        };

        const handlePremiumUpdate = (event) => {
            setUser(prevUser => ({
                ...prevUser,
                isPremium: event.detail.isPremium,
                displayName: prevUser?.displayName || event.detail.displayName,
                userId: event.detail.userId
            }));
        };
        
        // Updated social login message listener
        const handleSocialLoginMessage = (event) => {
            // Check if the message is from an allowed origin
            // Accept messages from our domains or localhost during development
            const allowedOrigins = [
                window.location.origin,
                'https://promptcatalyst.ai',
                'https://www.promptcatalyst.ai',
                'https://catalystmedia.ai',
                'https://www.catalystmedia.ai'
            ];
            
            if (process.env.NODE_ENV === 'development') {
                allowedOrigins.push('http://localhost:3000');
            }
            
            const isAllowedOrigin = allowedOrigins.includes(event.origin) || process.env.NODE_ENV === 'development';
            
            if (isAllowedOrigin) {
                const { type, token, error, isNewUser } = event.data;
                
                if (type === 'social-login-success' && token) {
                    handleSocialLogin(token, isNewUser)
                        .then(() => {
                            toast.success('Successfully logged in!');
                        })
                        .catch(err => {
                            toast.error('Login failed. Please try again.');
                        });
                } else if (type === 'social-login-error' && error) {
                    // Show error message
                    const errorMessage = AUTH_ERROR_MESSAGES[error] || 'Social login failed. Please try again.';
                    toast.error(errorMessage);
                }
            }
        };

        window.addEventListener('tokenExpired', handleTokenExpired);
        window.addEventListener('premiumStatusUpdate', handlePremiumUpdate);
        window.addEventListener('message', handleSocialLoginMessage);

        return () => {
            window.removeEventListener('tokenExpired', handleTokenExpired);
            window.removeEventListener('premiumStatusUpdate', handlePremiumUpdate);
            window.removeEventListener('message', handleSocialLoginMessage);
        };
    }, []);

    // Check for pending social token (from direct navigation)
    useEffect(() => {
        const checkPendingToken = async () => {
            const pendingToken = localStorage.getItem('pendingSocialToken');
            if (pendingToken) {
                try {
                    // Remove the token immediately to prevent multiple attempts
                    localStorage.removeItem('pendingSocialToken');
                    
                    // Try to use the token
                    await handleSocialLogin(pendingToken);
                } catch (error) {
                    // Silent error handling for pending token
                }
            }
        };
        
        if (!loading) {
            checkPendingToken();
        }
    }, [loading]);

    useEffect(() => {
        // Regular auth status check
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Check for token in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('jwt_token');
        
        if (token) {
            // Attempt to login with this token
            handleSocialLogin(token)
                .then(() => {
                    // Clean the URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                })
                .catch(err => {
                    // Silent error handling for token from URL
                });
        }
    }, []);

    const contextValue = {
        user,
        loading,
        loginLoading,
        login,
        logout,
        register,
        checkAuthStatus,
        forgotPassword,
        resetPassword,
        handleSocialLogin,
        updateDisplayName, // Add the new function to the context
        isAuthenticated: !!user,
        isPremium: user?.isPremium || false,
        isProMember: user?.isProMember || false,
        isUltimateMember: user?.isUltimateMember || false,
        tier: user?.tier || 'free'
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;