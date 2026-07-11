import React, { useRef, useState, useEffect } from 'react';
import { User, LogOut, Crown, RefreshCcw, Zap, Sparkles, HelpCircle, FileText, Edit2, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import TopUpModal from './TopUpModal';
import { openHelpPage } from '../utils/navigation';
import { useNavigate } from 'react-router-dom';
import EditDisplayNameForm from './EditDisplayNameForm';

export const UserDropdown = ({ onLogout, onPremiumClick, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const { credits, creditType, resetType, lastReset, loading, refreshCredits } = useCredit();
  const { currentTheme, setTheme, isFollowingSystemTheme, setFollowSystemTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();
  
  // Handle touch gestures for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipeDown = distance < -50;
    
    if (isSwipeDown) {
      setIsOpen(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsEditingDisplayName(false);
      }
    };

    // Only add listener if dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handlePremiumClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    
    // For Premium users, ensure Pro is pre-selected when clicking Upgrade
    if (user?.isPremium && !user?.isProMember) {
      sessionStorage.setItem('selectedPremiumPlan', 'pro');
    }
    
    onPremiumClick();
  };

  const handleManualRefresh = async (e) => {
    e.stopPropagation();
    if (isRefreshing || loading) return;

    setIsRefreshing(true);
    try {
      await refreshCredits();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatResetTime = (lastReset, resetType) => {
    if (!lastReset) return '';
    const resetDate = new Date(lastReset);
    return resetType === 'monthly' 
      ? `Reset on ${format(resetDate, 'MMM d')}`
      : `Reset at ${format(resetDate, 'h:mm a')}`;
  };

  const getCreditsMessage = () => {
    if (!user) return 'Guest Credits';
    if (user.isUltimateMember) return 'Credits';
    if (user.isProMember) return 'Credits';
    return user.isPremium ? 'Credits' : 'Free User Credits';
  };

  const getResetMessage = () => {
    if (!lastReset) return '';
    if (user?.isUltimateMember) return 'Visionary tier - Resets monthly';
    if (user?.isProMember) return 'Pro tier - Resets monthly';
    return user?.isPremium 
      ? 'Standard tier - Resets monthly'
      : 'Free tier - Resets daily';
  };

  // Dropdown positioning classes based on mobile/desktop
  const dropdownPositionClasses = isMobile
    ? 'fixed inset-x-0 bottom-0 w-full rounded-t-2xl'
    : 'absolute right-0 top-full mt-2 w-64 rounded-lg shadow-2xl';

  // Touch event handlers for mobile modal
  const mobileModalProps = isMobile ? {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  } : {};

  // Determine user tier
  const isPremiumUser = user?.isPremium && !user?.isProMember && !user?.isUltimateMember;
  const isProUser = user?.isProMember && !user?.isUltimateMember || false;
  const isUltimateUser = user?.isUltimateMember || false;

  // Handle account management click
  const handleAccountManagementClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    
    // If user is Premium but not Pro/Ultimate, open the Premium modal with Pro upgrade pre-selected
    if (isPremiumUser) {
      // Store 'pro' as the selected plan - though we've also enforced this in the PremiumModal itself
      sessionStorage.setItem('selectedPremiumPlan', 'pro');
      onPremiumClick();
    } else if (isProUser || isUltimateUser) {
      // For Pro and Ultimate users, open the Stripe portal directly
      window.open('https://billing.stripe.com/p/login/00g6srfOR1Af6xWbII', '_blank');
    }
  };

  return (
    <div className={`${isMobile ? 'w-full' : 'relative user-dropdown-container'} z-[9999]`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center p-2 rounded transition-colors ${
          isMobile
            ? 'w-full gap-3 px-4 py-2.5 text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)]'
            : 'text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)]'
        }`}
      >
        <User size={isMobile ? 18 : 16} />
        {isMobile && <span className="text-sm font-medium">Account</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[9998]"
                onClick={() => setIsOpen(false)}
              />
            )}

            <motion.div
              {...mobileModalProps}
              initial={isMobile ? { y: '100%' } : { opacity: 0, y: 10 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, y: 10 }}
              transition={{ 
                type: 'spring',
                damping: 25,
                stiffness: 200,
                duration: 0.2 
              }}
              className={`${dropdownPositionClasses} user-dropdown-menu ${isMobile ? '' : 'user-dropdown-desktop'} bg-[var(--cardBackground)] border border-[var(--border)] shadow-lg overflow-hidden z-[9999]`}
            >
              {/* Handle for mobile modal */}
              {isMobile && (
                <div className="flex justify-center p-2">
                  <div className="w-12 h-1.5 rounded-full bg-[var(--border)]" />
                </div>
              )}

              <div className="p-4 border-b border-[var(--border)]">
                {isEditingDisplayName ? (
                  <EditDisplayNameForm onClose={() => setIsEditingDisplayName(false)} />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text)]">
                          {user ? user.displayName : 'Guest User'}
                        </h3>
                        {user && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditingDisplayName(true);
                            }}
                            className="p-1 rounded hover:bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors"
                            title="Edit display name"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                      </div>
                      {user?.isUltimateMember ? (
                        <div className="flex items-center text-teal-500">
                          <Crown size={14} className="mr-1" />
                          <span className="text-xs font-medium">Visionary Member</span>
                        </div>
                      ) : user?.isProMember ? (
                        <div className="flex items-center text-blue-500">
                          <Crown size={14} className="mr-1" />
                          <span className="text-xs font-medium">Pro Member</span>
                        </div>
                      ) : user?.isPremium ? (
                        <div className="flex items-center text-yellow-500">
                          <Crown size={14} className="mr-1" />
                          <span className="text-xs font-medium">Standard Member</span>
                        </div>
                      ) : null}
                      {(user?.isPremium || user?.isProMember) && (
                        <button
                          onClick={handleAccountManagementClick}
                          className="flex items-center gap-1.5 text-xs text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors mt-1"
                        >
                          <User size={12} />
                          <span>Manage account settings</span>
                        </button>
                      )}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <User size={20} className="text-[var(--primary)]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-b border-[var(--border)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--textSecondary)]">
                      {getCreditsMessage()}
                    </span>
                    <button
                      onClick={handleManualRefresh}
                      className={`p-1.5 rounded hover:bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)] ${
                        (loading || isRefreshing) ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      disabled={loading || isRefreshing}
                    >
                      <RefreshCcw 
                        size={14} 
                        className={(loading || isRefreshing) ? 'animate-spin' : ''} 
                      />
                    </button>
                  </div>
                  {loading ? (
                    <div className="h-6 bg-[var(--border)] animate-pulse rounded" />
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <div className="text-xl font-semibold text-[var(--text)]">
                        {credits || 0}
                      </div>
                      <div className="text-xs text-[var(--textSecondary)]">
                        {getResetMessage()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Selection */}
              <div className="p-4 border-b border-[var(--border)]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text)]">Theme</span>
                    </div>
                    <button
                      onClick={() => {
                        const newFollowState = !isFollowingSystemTheme();
                        setFollowSystemTheme(newFollowState);
                      }}
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-all duration-200 focus:outline-none ${
                        isFollowingSystemTheme() 
                          ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]' 
                          : 'bg-[var(--border)]'
                      }`}
                      title={isFollowingSystemTheme() ? "Disable system theme" : "Follow system theme"}
                    >
                      <motion.span
                        animate={{
                          x: isFollowingSystemTheme() ? 14 : 2
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="inline-block h-3 w-3 transform rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>
                  
                  {isFollowingSystemTheme() ? (
                    <div className="bg-[var(--inputBackground)] rounded-lg p-3 border border-[var(--border)]">
                      <div className="flex items-center gap-2 text-xs text-[var(--textSecondary)]">
                        <Monitor size={12} className="text-[var(--textSecondary)]" />
                        <span>Following system preference</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={() => setTheme('light')}
                        className={`w-full flex items-center gap-3 px-2 py-1.5 rounded text-sm transition-all duration-200 ${
                          currentTheme === 'light'
                            ? 'text-[var(--text)] bg-[var(--dropdownHover)]'
                            : 'text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]'
                        }`}
                      >
                        <Sun size={14} className="flex-shrink-0" />
                        <span className="font-medium">Light</span>
                        {currentTheme === 'light' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1 h-1 rounded-full bg-[var(--primary)] ml-auto"
                          />
                        )}
                      </button>
                      
                      <button
                        onClick={() => setTheme('default')}
                        className={`w-full flex items-center gap-3 px-2 py-1.5 rounded text-sm transition-all duration-200 ${
                          currentTheme === 'default'
                            ? 'text-[var(--text)] bg-[var(--dropdownHover)]'
                            : 'text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]'
                        }`}
                      >
                        <Moon size={14} className="flex-shrink-0" />
                        <span className="font-medium">Dark</span>
                        {currentTheme === 'default' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1 h-1 rounded-full bg-[var(--primary)] ml-auto"
                          />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {user?.isPremium || user?.isProMember ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsTopUpModalOpen(true);
                  }}
                  className={`w-full flex items-center gap-2 transition-colors border-b border-[var(--border)] ${
                    isMobile 
                      ? 'p-4 text-base'
                      : 'p-3 text-sm'
                  } text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)]`}
                >
                  <Zap size={isMobile ? 18 : 16} />
                  <span>Top Up Credits</span>
                </button>
              ) : user && (
                <button
                  onClick={handlePremiumClick}
                  className={`w-full flex items-center gap-2 transition-colors border-b border-[var(--border)] ${
                    isMobile 
                      ? 'p-4 text-base'
                      : 'p-3 text-sm'
                  } text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)]`}
                >
                  <Sparkles size={isMobile ? 18 : 16} />
                  <span>Upgrade</span>
                </button>
              )}
              
              {/* Get Browser Extension button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.open('https://chromewebstore.google.com/detail/prompt-catalyst/hehieakgdbakdajfpekgmfckplcjmgcf', '_blank');
                }}
                className={`w-full flex items-center gap-2 transition-colors border-b border-[var(--border)] ${
                  isMobile 
                    ? 'p-4 text-base'
                    : 'p-3 text-sm'
                } text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)]`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex-shrink-0">
                    <img 
                      src="/logo.png" 
                      alt="Extension" 
                      className="w-full h-full object-contain filter grayscale opacity-75"
                    />
                  </div>
                  <span>Get Browser Extension</span>
                </div>
              </button>
              
              {/* Help button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  openHelpPage();
                }}
                className={`w-full flex items-center gap-2 transition-colors border-b border-[var(--border)] ${
                  isMobile 
                    ? 'p-4 text-base'
                    : 'p-3 text-sm'
                } text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)]`}
              >
                <HelpCircle size={isMobile ? 18 : 16} />
                <span>Help</span>
              </button>

              {/* Legal Documents button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/legal');
                }}
                className={`w-full flex items-center gap-2 transition-colors border-b border-[var(--border)] ${
                  isMobile 
                    ? 'p-4 text-base'
                    : 'p-3 text-sm'
                } text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)]`}
              >
                <FileText size={isMobile ? 18 : 16} />
                <span>Terms & Privacy</span>
              </button>

              {/* Logout button */}
              {user && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center gap-2 transition-colors ${
                    isMobile 
                      ? 'p-4 text-base'
                      : 'p-3 text-sm'
                  } text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)]`}
                >
                  <LogOut size={isMobile ? 18 : 16} />
                  <span>Logout</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
      />
    </div>
  );
};

export default UserDropdown;