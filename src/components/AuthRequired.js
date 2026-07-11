import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import LoginModal from './LoginModal';
import MaskedGoogleButton from './MaskedGoogleButton';

const AuthRequired = ({ children }) => {
  const { user, loading, checkAuthStatus } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalView, setLoginModalView] = useState('login');
  const [isSocialLoginInProgress, setSocialLoginInProgress] = useState(false);
  const [socialLoginError, setSocialLoginError] = useState('');
  
  // Handle modal actions
  const handleModalOpen = (view) => {
    setLoginModalView(view);
    setShowLoginModal(true);
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
    setLoginModalView('login');
  };

  // Handle social login
  const handleSocialLoginStart = () => {
    setSocialLoginError('');
    setSocialLoginInProgress(true);
  };

  const handleSocialLoginComplete = () => {
    setSocialLoginInProgress(false);
  };
  
  // Check for successful social login
  useEffect(() => {
    if (isSocialLoginInProgress) {
      const checkToken = () => {
        const token = localStorage.getItem('authToken');
        if (token) {
          checkAuthStatus()
            .then(() => {
              setSocialLoginInProgress(false);
            })
            .catch(() => {
              setSocialLoginError('Login failed');
              setSocialLoginInProgress(false);
            });
        }
      };
      
      const tokenCheckInterval = setInterval(checkToken, 1000);
      const timeoutId = setTimeout(() => {
        clearInterval(tokenCheckInterval);
        setSocialLoginInProgress(false);
        setSocialLoginError('Login timed out');
      }, 30000);
      
      return () => {
        clearInterval(tokenCheckInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [isSocialLoginInProgress, checkAuthStatus]);
  
  if (loading) {
    return <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
    </div>;
  }

  if (user) {
    return children;
  }

  return (
    <div className="relative w-full h-full">
      {/* Blur effect */}
      <div className="absolute inset-0 filter blur-sm opacity-50 pointer-events-none">
        {children}
      </div>

      {/* Login overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.1, 0.6, 0.3, 1],
            opacity: { duration: 0.3 }
          }}
          className="max-w-sm w-full mx-4 p-6 rounded-xl bg-[var(--cardBackground)] border border-[var(--border)] shadow-lg"
        >
          <div className="flex flex-col items-center gap-7">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[var(--text)]">Sign in</h2>
            </div>
            
            {/* Buttons */}
            <div className="w-full space-y-3">
              <button 
                onClick={() => handleModalOpen('login')}
                className="w-full py-2.5 bg-[var(--primary)] text-black rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              
              <button 
                onClick={() => handleModalOpen('signup')}
                className="w-full py-2.5 border border-[var(--border)] text-[var(--text)] rounded-lg font-medium hover:bg-[var(--cardSecondaryBackground)] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
              
              {/* Divider */}
              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-[var(--border)] flex-1"></div>
                <span className="text-xs text-[var(--textSecondary)]">or</span>
                <div className="h-px bg-[var(--border)] flex-1"></div>
              </div>
              
              {/* Google Sign-in */}
              {isSocialLoginInProgress ? (
                <div className="w-full py-2.5 px-4 bg-[var(--inputBackground)] border border-[var(--border)] text-[var(--text)] rounded-lg font-medium flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-t-transparent border-[var(--primary)] rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <MaskedGoogleButton
                  onLoginStart={handleSocialLoginStart}
                  onLoginComplete={handleSocialLoginComplete}
                />
              )}
              
              <AnimatePresence>
                {socialLoginError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-xs text-red-500 text-center"
                  >
                    {socialLoginError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleModalClose}
        defaultView={loginModalView}
      />
    </div>
  );
};

export default AuthRequired;