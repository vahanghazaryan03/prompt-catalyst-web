import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, AlertCircle, Info, EyeIcon, EyeOffIcon } from 'lucide-react';
import ModalLoader from './loading/ModalLoader';
// Import our new masked Google button
import MaskedGoogleButton from './MaskedGoogleButton';

// Error message mapping object 
const ERROR_MESSAGES = {
  // Login errors
  'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
  'Wrong user credentials.': 'Invalid email or password. Please check your credentials and try again.',
  'incorrect_password': 'The password you entered is incorrect.',
  'invalid_email': 'This email address is not registered. Please check your email or sign up for a new account.',
  'email_verification_required': 'Please verify your email address before logging in. Check your inbox for the verification link.',
  'user_not_found': 'This email address is not registered. Please check your email or sign up for a new account.',
  'too_many_attempts': 'Too many login attempts. Please try again later.',
  'account_disabled': 'This account has been disabled. Please contact support.',
  
  // Registration errors
  'unsupported_email_provider': 'Registration is currently only available with major email providers (Gmail, Yahoo, Outlook, etc.). Please use a trusted email service.',
  'Username already exists': 'This username is already taken',
  'Email already exists': 'An account with this email already exists',
  'Password is too weak': 'Please choose a stronger password',
  'invalid_username': 'Username can only contain letters, numbers, and underscores.',
  'invalid_reset_key': 'Invalid or expired reset link. Please request a new one.',
  'password_reset_failed': 'Failed to reset password. Please try again.',
  
  // General errors
  'network_error': 'Unable to connect to server. Please check your internet connection.',
  'server_error': 'Something went wrong on our end. Please try again later.',
  'unknown_error': 'An unexpected error occurred. Please try again.'
};

// Helper function to get appropriate error message
const getErrorMessage = (error) => {
  if (!error) return null;
  
  // Check for field-specific errors from the backend
  if (error.response?.data?.error) {
    const backendError = error.response.data.error;
    if (backendError.field && backendError.message) {
      return backendError.message; // Use the exact message from backend
    }
  }
  
  // Check if error.message is a key in ERROR_MESSAGES
  if (error.message && ERROR_MESSAGES[error.message]) {
    return ERROR_MESSAGES[error.message];
  }
  
  if (error.response?.data?.error_code) {
    return ERROR_MESSAGES[error.response.data.error_code] || error.response.data.message;
  }
  
  if (error.code === 'ERR_NETWORK') {
    return ERROR_MESSAGES.network_error;
  }
  
  const errorMessage = error.response?.data?.message || 
                      error.message ||
                      ERROR_MESSAGES.unknown_error;

  // Map known error messages
  if (errorMessage.includes('major email providers')) {
    return ERROR_MESSAGES.unsupported_email_provider;
  }

  if (errorMessage.includes('password')) {
    return ERROR_MESSAGES.incorrect_password;
  }
  if (errorMessage.includes('email exists')) {
    return ERROR_MESSAGES.email_exists;
  }
  if (errorMessage.includes('username exists')) {
    return ERROR_MESSAGES.username_exists;
  }
  
  return errorMessage;
};

export const LoginModal = ({ 
  isOpen, 
  onClose, 
  defaultView = 'login', // Can be 'login', 'signup', or 'reset'
  defaultEmail = ''
}) => {
  const [isLoginView, setIsLoginView] = useState(defaultView === 'login');
  const [isForgotPassword, setIsForgotPassword] = useState(defaultView === 'reset');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');

  /**
   * Shown only after a password sign-in has actually failed.
   *
   * Passwords could not be carried over from WordPress, so an account that
   * predates the migration has none. Supabase reports that identically to a
   * wrong password, so the offer to set one is made at the moment it becomes
   * relevant rather than to everyone who opens the form.
   */
  const [showMigrationHint, setShowMigrationHint] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSocialLoginInProgress, setSocialLoginInProgress] = useState(false);
  const { login, register, forgotPassword, loginLoading, checkAuthStatus } = useAuth();
  const [initialFocus, setInitialFocus] = useState('email');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    username: ''
  });
  
  // Always show social login now (no need for hidden flag)
  const [showSocialLogin, setShowSocialLogin] = useState(true);

  // Password validation states
  const [validations, setValidations] = useState({
    minLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false
  });

  // Function to validate password strength
  const validatePassword = (password) => {
    setValidations({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password)
    });
  };

  // Function to check if password is valid
  const isPasswordValid = () => {
    return isLoginView || Object.values(validations).every(v => v);
  };

  useEffect(() => {
    if (isOpen) {
      if (defaultEmail) {
        setEmail(defaultEmail);
        setIsLoginView(true);
        setInitialFocus('password');
      } else {
        setInitialFocus(isLoginView ? 'email' : 'username');
      }
      setPassword('');
      setIsForgotPassword(false);
      setError('');
      setFieldErrors({
        email: '',
        password: '',
        username: ''
      });
    }
  }, [isOpen, defaultEmail, isLoginView]);

  useEffect(() => {
    setIsLoginView(defaultView === 'login');
    setInitialFocus(defaultView === 'login' ? 'email' : 'username');
  }, [defaultView]);
  
  // Listen for social login token changes
  useEffect(() => {
    if (isSocialLoginInProgress) {
      const checkToken = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Token exists, try to verify it and get user info
          checkAuthStatus()
            .then(() => {
              setSocialLoginInProgress(false);
              onClose();
            })
            .catch(err => {
              setError('Social login failed. Please try again.');
              setSocialLoginInProgress(false);
            });
        }
      };
      
      // Set up a check that runs a few times
      const tokenCheckInterval = setInterval(checkToken, 1000);
      const timeoutId = setTimeout(() => {
        clearInterval(tokenCheckInterval);
        setSocialLoginInProgress(false);
        setError('Social login timed out. Please try again.');
      }, 30000); // 30 second timeout
      
      return () => {
        clearInterval(tokenCheckInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [isSocialLoginInProgress, checkAuthStatus, onClose]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.85,
      transformOrigin: "center"
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transformOrigin: "center",
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.85,
      transition: {
        type: "tween",
        duration: 0.2
      }
    }
  };

  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      
      case 'password':
        if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        }
        break;
      
      case 'username':
        if (!isLoginView) {
          const usernameRegex = /^[a-zA-Z0-9_]+$/;
          if (!usernameRegex.test(value)) {
            error = 'Username can only contain letters, numbers, and underscores';
          }
        }
        break;
      
      default:
        break;
    }
    
    return !error;
  };

  const validateForm = () => {
    const isEmailValid = validateField('email', email);
    const isPasswordLengthValid = validateField('password', password);
    const isUsernameValid = isLoginView || validateField('username', username);
    
    // For login, only check basic validation
    if (isLoginView) {
      return isEmailValid && isPasswordLengthValid && isUsernameValid;
    }
    
    // For signup, also check password strength requirements
    return isEmailValid && isPasswordLengthValid && isUsernameValid && isPasswordValid();
  };

  // Update the handleSubmit function in LoginModal.js
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setFieldErrors({
    email: '',
    password: '',
    username: ''
  });

  if (!validateForm()) {
    return;
  }

  try {
    if (isLoginView) {
      await login(email, password);
      onClose();
      setEmail('');
      setPassword('');
    } else {
      await register(email, password, username);
      setShowVerificationMessage(true);
    }
  } catch (error) {
    // Handle field-specific errors
    if (error.response?.data?.error) {
      const backendError = error.response.data.error;
      if (backendError.field && backendError.message) {
        setFieldErrors(prev => ({
          ...prev,
          [backendError.field]: backendError.message
        }));
        // Don't set the general error when we have a field-specific error
        return;
      }
    }
    
    let errorMessage;
    
    if (error.message === 'email_verification_required') {
      errorMessage = ERROR_MESSAGES['email_verification_required'];
      setShowVerificationMessage(true);
    } else {
      errorMessage = getErrorMessage(error);
    }
    
    // Check if we can display this as a field-specific error
    let fieldSpecificErrorSet = false;
    
    // Set field-specific errors based on the error message
    if (errorMessage.includes('email providers')) {
      setFieldErrors(prev => ({
        ...prev,
        email: errorMessage
      }));
      fieldSpecificErrorSet = true;
    } else if (error.message === 'email_verification_required') {
      setFieldErrors(prev => ({
        ...prev,
        email: errorMessage
      }));
      fieldSpecificErrorSet = true;
    } else if (errorMessage.includes('credentials') || 
               error.message === 'invalid_credentials' || 
               error.code === 'invalid_credentials' ||
               errorMessage.includes('password')) {
      if (error.offerPasswordSetup || error.code === 'invalid_credentials') {
        setShowMigrationHint(true);
      }
      setFieldErrors(prev => ({
        ...prev,
        password: errorMessage
      }));
      fieldSpecificErrorSet = true;
    } else if (errorMessage.includes('user not found') || 
               error.message === 'invalid_email' ||
               errorMessage.includes('email')) {
      setFieldErrors(prev => ({
        ...prev,
        email: errorMessage
      }));
      fieldSpecificErrorSet = true;
    }
    
    // Only set the general error if we couldn't associate it with a specific field
    if (!fieldSpecificErrorSet) {
      setError(errorMessage);
    }
  }
};

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({
      email: '',
      password: '',
      username: ''
    });
  
    try {
      await forgotPassword(resetEmail);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
      setError('');
    } catch (error) {
      setSuccessMessage('');
      setError(getErrorMessage(error));
    }
  };

  const handleClose = () => {
    setShowVerificationMessage(false);
    setIsLoginView(true);
    setIsForgotPassword(false);
    // Only clear email if it's not from verification
    if (!defaultEmail) {
      setEmail('');
    }
    setPassword('');
    setUsername('');
    setResetEmail('');
    setError('');
    setSuccessMessage('');
    setFieldErrors({
      email: '',
      password: '',
      username: ''
    });
    onClose();
  };
  
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setResetEmail('');
    setError('');
    setSuccessMessage('');
    setFieldErrors({
      email: '',
      password: '',
      username: ''
    });
    setShowVerificationMessage(false);
  };

  const switchView = () => {
    setIsLoginView(!isLoginView);
    resetForm();
  };

  const renderSuccess = (message) => message && (
    <div className="flex items-center gap-2 bg-green-100/10 border border-green-400/20 text-green-500 px-4 py-3 rounded-lg text-sm">
      <Mail className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );

  const renderError = (error) => error && (
    <div className="flex items-center gap-2 bg-red-100/10 border border-red-400/20 text-red-500 px-4 py-3 rounded-lg text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );

  const renderFieldError = (fieldName) => fieldErrors[fieldName] && (
    <div className="text-red-500 text-xs mt-1">
      {fieldErrors[fieldName]}
    </div>
  );

  const renderVerificationMessage = () => (
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--text)]">Verify Your Email</h3>
        <p className="text-[var(--textSecondary)] max-w-sm space-y-2">
          <span>
            We've sent a verification email to <span className="font-medium text-[var(--text)]">{email}</span>. 
            Please check your inbox and click the verification link to activate your account.
          </span>
          <span className="block mt-2 text-sm opacity-80">
            If you don't see the email in your inbox within a few minutes, please check your spam folder.
          </span>
        </p>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => {
            setShowVerificationMessage(false);
            setIsLoginView(true);
            resetForm();
          }}
          className="w-full py-2.5 px-4 bg-[var(--primary)] text-black rounded-lg font-medium transition-opacity hover:opacity-90"
        >
          Return to Login
        </button>
      </div>
    </div>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="p-6 space-y-5">
      {error && renderError(error)}
      {successMessage && renderSuccess(successMessage)}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--text)]">
          Email
        </label>
        <input
          type="email"
          required
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          className="w-full px-4 py-2.5 bg-[var(--inputBackground)] border border-[var(--inputBorder)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-shadow"
          placeholder="Enter your email"
        />
      </div>
  
      <div className="space-y-4 pt-2">
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-[var(--primary)] text-black rounded-lg font-medium transition-opacity hover:opacity-90"
        >
          Send Reset Instructions
        </button>
  
        <button
          type="button"
          onClick={() => {
            setIsForgotPassword(false);
            setResetEmail('');
            setError('');
            setSuccessMessage('');
          }}
          className="w-full py-2.5 px-4 border border-[var(--border)] text-[var(--text)] rounded-lg font-medium transition-colors hover:bg-[var(--hover)]"
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  const handleSocialLoginStart = () => {
    setError('');
    setSocialLoginInProgress(true);
  };

  const handleSocialLoginComplete = () => {
    // This is called when the popup is closed - actual auth check is done by the effect
    setSocialLoginInProgress(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
         <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[var(--cardBackground)] w-full max-w-md mx-4 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
              <h3 className="text-xl font-semibold text-[var(--text)]">
                {showVerificationMessage 
                  ? 'Email Verification' 
                  : isForgotPassword 
                    ? 'Reset Password'
                    : isLoginView 
                      ? 'Welcome Back' 
                      : 'Create Account'}
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-[var(--dropdownHover)] rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-[var(--textSecondary)]" />
              </button>
            </div>

            {loginLoading || isSocialLoginInProgress ? (
              <ModalLoader />
            ) : showVerificationMessage ? (
              renderVerificationMessage()
            ) : isForgotPassword ? (
              renderForgotPasswordForm()
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && renderError(error)}

                {/*
                  Sign-in was moved to a new provider and passwords could not be
                  carried across, so anyone who registered before the change has
                  to set a new one. Saying so up front is kinder than letting
                  them find out as a failed login. Google sign-in is unaffected.
                */}
                {isLoginView && showMigrationHint && (
                  <div className="flex items-start gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--textSecondary)] px-4 py-3 rounded-lg text-sm">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--accent)]" />
                    <span>
                      We&apos;ve upgraded sign-in. If you had an account before today,{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setShowMigrationHint(false);
                          setIsForgotPassword(true);
                        }}
                        className="underline hover:text-[var(--text)] transition-colors"
                      >
                        set a new password
                      </button>
                      {' '}to continue. Signing in with Google works as before.
                    </span>
                  </div>
                )}

                {!isLoginView && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--text)]">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-[var(--inputBackground)] border ${
                        fieldErrors.username ? 'border-red-500' : 'border-[var(--inputBorder)]'
                      } rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-shadow`}
                      placeholder="Choose a username"
                      autoFocus={initialFocus === 'username'}
                    />
                    {renderFieldError('username')}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-[var(--inputBackground)] border ${
                      fieldErrors.email ? 'border-red-500' : 'border-[var(--inputBorder)]'
                    } rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-shadow`}
                    placeholder="Enter your email"
                    autoFocus={initialFocus === 'email'}
                  />
                  {renderFieldError('email')}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text)]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!isLoginView) {
                          validatePassword(e.target.value);
                        }
                      }}
                      className={`w-full px-4 py-2.5 bg-[var(--inputBackground)] border ${
                        fieldErrors.password ? 'border-red-500' : 'border-[var(--inputBorder)]'
                      } rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-shadow pr-12`}
                      placeholder={isLoginView ? "Enter your password" : "Choose a password"}
                      autoFocus={initialFocus === 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {renderFieldError('password')}
                  
                  {/* Password requirements */}
                  {!isLoginView && password.length > 0 && (
                    <div className="space-y-2 text-sm mt-2">
                      {Object.entries({
                        'At least 8 characters long': validations.minLength,
                        'Contains at least one number': validations.hasNumber,
                        'Contains at least one uppercase letter': validations.hasUpper,
                        'Contains at least one lowercase letter': validations.hasLower
                      }).map(([text, isValid]) => (
                        <p key={text} className={`flex items-center space-x-2 ${
                          isValid ? 'text-green-500' : 'text-[var(--textSecondary)]'
                        }`}>
                          <span>{isValid ? '✓' : '○'}</span>
                          <span>{text}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    disabled={!isLoginView && !isPasswordValid()}
                    className={`w-full py-2.5 px-4 bg-[var(--primary)] text-black rounded-lg font-medium transition-opacity hover:opacity-90 ${
                      (!isLoginView && !isPasswordValid()) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{isLoginView ? 'Log in' : 'Create Account'}</span>
                  </button>

                  {/* Social Login Buttons - Always shown now */}
                  <div className="flex items-center gap-2 my-4">
                    <div className="h-px bg-[var(--border)] flex-1"></div>
                    <span className="text-sm text-[var(--textSecondary)]">or</span>
                    <div className="h-px bg-[var(--border)] flex-1"></div>
                  </div>

                  {/* Use our new masked Google button */}
                  <MaskedGoogleButton
                    onLoginStart={handleSocialLoginStart}
                    onLoginComplete={handleSocialLoginComplete}
                  />

                  {isLoginView && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                          setFieldErrors({
                            email: '',
                            password: '',
                            username: ''
                          });
                        }}
                        className="text-sm text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--border)]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[var(--cardBackground)] text-[var(--textSecondary)]">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={switchView}
                      className="text-[var(--primary)] hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      {isLoginView ? 'Sign up for free' : 'Login to your account'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;