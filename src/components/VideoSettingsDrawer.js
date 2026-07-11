import React, { useCallback, useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import VideoSettings from './VideoSettings';
import PremiumModal from './PremiumModal';
import { useAuth } from '../contexts/AuthContext';

export const VideoSettingsDrawer = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingChange,
  isPremiumUser,
  onLoginRequired,
  isCommandActive,
  isEditMode
}) => {
  const { user } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const location = useLocation();
  const drawerRef = useRef(null);
  
  // Get user tier flags
  const isProMember = user?.isProMember || false;
  const isUltimateMember = user?.isUltimateMember || false;

  // Update window width on resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle escape key press
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle login required with premium modal close
  const handleLoginRequiredInternal = useCallback(() => {
    setIsPremiumModalOpen(false);  // First close the premium modal
    onLoginRequired();  // Then trigger the login modal
  }, [onLoginRequired]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen && windowWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, windowWidth]);

  // Add CSS to the document for the drawer transitions
  useEffect(() => {
    // Only add if it's not already present
    if (!document.getElementById('video-drawer-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'video-drawer-styles';
      styleElement.textContent = `
        .video-settings-drawer {
          transition: width 0.25s ease-out, opacity 0.25s ease-out;
          overflow: hidden;
          border-left: 1px solid var(--border);
          z-index: 10;
          flex-shrink: 0;
        }
        
        .video-settings-drawer--closed {
          width: 0 !important;
          min-width: 0 !important;
          opacity: 0;
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      // Clean up the styles when component unmounts
      const styleElement = document.getElementById('video-drawer-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  // If we're on the reset password page, don't render the drawer
  if (location.pathname === '/reset-password') {
    return null;
  }

  // Calculate optimal drawer width based on screen size
  const getDrawerWidth = () => {
    // For mobile: always use overlay
    if (windowWidth < 1024) {
      return null; // Width handled by CSS
    }
    
    // For larger screens, use responsive width
    if (windowWidth > 2560) {
      // Ultra-wide screens: percentage-based with maximum
      return Math.min(windowWidth * 0.25, 800); // Cap at 800px
    } else if (windowWidth > 1920) {
      // Very large screens: 600px
      return 600;
    } else if (windowWidth > 1440) {
      // Large screens: 520px
      return 520;
    } else if (windowWidth > 1280) {
      // Medium-large screens: 480px
      return 480;
    } else {
      // Standard desktop: 420px 
      return 420;
    }
  };

  // Use different implementations for mobile vs. desktop
  const isMobile = windowWidth < 1024;

  if (isMobile) {
    // Mobile implementation (overlay)
    return (
      <>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Mobile Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />
              
              {/* Mobile Drawer - overlay style */}
              <motion.div
                ref={drawerRef}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 w-[85%] max-w-[400px] h-full z-50 overflow-hidden"
              >
                <div className={`h-full relative ${(isCommandActive || isEditMode) ? 'after:absolute after:inset-0 after:bg-black/20 after:pointer-events-none after:z-10' : ''}`}>
                  {(isCommandActive || isEditMode) && (
                    <div className="absolute top-0 left-0 right-0 z-20 bg-emerald-500/90 text-black text-center py-1 text-xs font-medium px-2">
                      {isEditMode ? 'Edit mode active - settings not applied' : 'Command mode active - settings not applied'}
                    </div>
                  )}
                  <VideoSettings
                    settings={settings}
                    onSettingChange={onSettingChange}
                    isPremiumUser={isPremiumUser}
                    isUltimateMember={isUltimateMember}
                    onClose={onClose}
                    onPremiumClick={() => setIsPremiumModalOpen(true)}
                    className={`h-full ${(isCommandActive || isEditMode) ? 'opacity-60' : ''}`}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <PremiumModal 
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          onLoginRequired={handleLoginRequiredInternal}
        />
      </>
    );
  } else {
    // Desktop implementation (part of layout)
    const optimalWidth = getDrawerWidth();
    
    return (
      <>
        {/* Always render the drawer but control visibility with CSS */}
        <div
          ref={drawerRef}
          className={`video-settings-drawer ${isOpen ? '' : 'video-settings-drawer--closed'}`}
          style={{ 
            width: optimalWidth,
            minWidth: optimalWidth,
            maxWidth: windowWidth * 0.4 // Prevent it from taking too much space
          }}
        >
          <div className={`h-full relative ${(isCommandActive || isEditMode) ? 'after:absolute after:inset-0 after:bg-black/20 after:pointer-events-none after:z-10' : ''}`}>
            {(isCommandActive || isEditMode) && (
              <div className="absolute top-0 left-0 right-0 z-20 bg-emerald-500/90 text-black text-center py-1 text-xs font-medium px-2">
                {isEditMode ? 'Edit mode active - settings not applied' : 'Command mode active - settings not applied'}
              </div>
            )}
            <VideoSettings
              settings={settings}
              onSettingChange={onSettingChange}
              isPremiumUser={isPremiumUser}
              isUltimateMember={isUltimateMember}
              onClose={onClose}
              onPremiumClick={() => setIsPremiumModalOpen(true)}
              className={`h-full ${(isCommandActive || isEditMode) ? 'opacity-60' : ''}`}
            />
          </div>
        </div>

        <PremiumModal 
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          onLoginRequired={handleLoginRequiredInternal}
        />
      </>
    );
  }
};

VideoSettingsDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  onSettingChange: PropTypes.func.isRequired,
  isPremiumUser: PropTypes.bool,
  onLoginRequired: PropTypes.func.isRequired,
  isCommandActive: PropTypes.bool,
  isEditMode: PropTypes.bool
};

export default VideoSettingsDrawer;