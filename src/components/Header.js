import React, { useState } from 'react';
import useAnimationStore from '../contexts/AnimationStore';
import {
  Menu,
  X,
  LogOut,
  LogIn,
  Video,
  Image,
  MessageSquare,
  Sparkles,
  FolderOpen,
  Wand2,
  History as HistoryIcon,
  Calendar,
  Palette,
  HelpCircle,
  Crown,
  Film,
  Users,
  Settings,
  FileText,
  Chrome,
  FileText as BlogIcon,
  BookOpen,
  Sun,
  Moon,
  Monitor,
  PencilRuler
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { UserDropdown } from './UserDropdown';
import { useNavigate, Link } from 'react-router-dom';
import { openHelpPage } from '../utils/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import VideoToggle from './VideoToggle';
import { ThemeSwitcher } from './ThemeSwitcher';

const Header = ({
  isLoggedIn,
  isPremiumUser,
  currentView,
  onViewChange,
  onSettingsClick,
  onLoginClick,
  onLogoutClick,
  isVideoMode,
  onVideoModeToggle,
  isSettingsOpen
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  const { currentTheme, setTheme, isLightMode, isFollowingSystemTheme, getSystemTheme, setFollowSystemTheme } = useTheme();
  const navigate = useNavigate();
  
  // TEMPORARY FIX: Get animation state
  const isAnimationGenerating = useAnimationStore(state => state.isGenerating);
  const activeTab = useAnimationStore(state => state.activeTab);

  // Navigation items
  const navigationItems = [
    { id: 'chat', label: 'Prompt Lab', icon: MessageSquare },
    { id: 'generate', label: 'Generate', icon: Sparkles },
    { id: 'edit', label: 'Edit', icon: PencilRuler },
    { id: 'animate', label: 'Animate', icon: Film },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'weekly', label: 'Weekly Prompts', icon: Calendar },
    { id: 'tutorials', label: 'Tutorials', icon: BookOpen, external: true },
   
  ];
  
  // Get filtered navigation items based on video mode
  const filteredNavigationItems = navigationItems.filter(item => {
    // In video mode, hide Animate, Edit, StyleRefs, and Weekly Prompts tabs
    if (isVideoMode && (item.id === 'animate' || item.id === 'edit' || item.id === 'weekly')) {
      return false;
    }
    return true;
  });

  // Function to handle video mode toggle
  function handleVideoModeToggle() {
    // Toggle video mode
    onVideoModeToggle();
    setIsGuestDropdownOpen(false);
  }

  // Function to handle theme toggle
  const handleThemeToggle = () => {
    // If currently following system theme, disable it and set opposite of current system preference
    if (isFollowingSystemTheme()) {
      setFollowSystemTheme(false);
      const currentSystemTheme = getSystemTheme();
      const oppositeTheme = currentSystemTheme === 'default' ? 'light' : 'default';
      setTheme(oppositeTheme);
    } else {
      // Quick toggle between light and dark themes
      if (isLightMode()) {
        setTheme('default'); // Switch to dark
      } else {
        setTheme('light'); // Switch to light
      }
    }
    setIsGuestDropdownOpen(false);
  };

  // Guest dropdown menu items
  const guestMenuItems = [
    { id: 'videoMode', label: isVideoMode ? 'Switch to Image Mode' : 'Switch to Video Mode', icon: isVideoMode ? Image : Video, action: handleVideoModeToggle },
    { id: 'help', label: 'Help', icon: HelpCircle, action: openHelpPage },
    { id: 'terms', label: 'Terms & Privacy', icon: FileText, action: () => window.open('https://promptcatalyst.ai/legal', '_blank') },
    { id: 'extension', label: 'Get Browser Extension', icon: Chrome, action: () => window.open('https://chromewebstore.google.com/detail/prompt-catalyst/hehieakgdbakdajfpekgmfckplcjmgcf', '_blank') }
  ];

  // Premium badge component
  const PremiumBadge = () => {
    return (
      <div
        className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white 
          ${user?.isUltimateMember
            ? 'bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500'
            : user?.isProMember
              ? 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500'
              : 'bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500'} ml-0.5 translate-y-0.5`}
      >
        <span>{user?.isUltimateMember ? 'Visionary' : user?.isProMember ? 'Pro' : 'Standard'}</span>
      </div>
    );
  };

  // Handle mobile nav item selection
  const handleMobileNavigation = (viewId, isExternal) => {
    if (isExternal) {
      navigate('/tutorials');
    } else {
      onViewChange(viewId);
    }
    setIsMobileMenuOpen(false);
  };

  // Guest settings dropdown - closes when clicking outside
  const closeGuestDropdown = () => {
    setIsGuestDropdownOpen(false);
  };

  // Toggle guest settings dropdown
  const toggleGuestDropdown = (e) => {
    e.stopPropagation();
    setIsGuestDropdownOpen(!isGuestDropdownOpen);
  };

  // Add click outside listener for guest dropdown
  React.useEffect(() => {
    if (isGuestDropdownOpen) {
      const handleClickOutside = (e) => {
        if (e.target.closest('.guest-dropdown-container') === null) {
          closeGuestDropdown();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isGuestDropdownOpen]);

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center px-4 md:px-6 bg-gradient-to-r from-[var(--cardBackground)]/95 via-[var(--cardBackground)]/90 to-[var(--cardBackground)]/80 border-b border-[var(--border)] backdrop-blur-md shadow-md transition-colors duration-300 w-full max-w-[100vw]">
        {/* LOGO SECTION */}
        <div className="flex items-center min-w-[180px] md:w-1/4 lg:min-w-[220px] xl:min-w-[240px] shrink-0">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10">
            <img
              src="/logo.png"
              alt="Prompt Catalyst"
              className="h-full w-full object-contain mt-[1px]"
            />
          </div>
          <div className="flex items-center ml-[5.5px] overflow-hidden">
            <h1 className="text-lg md:text-xl font-semibold text-[var(--text)] truncate">
              Prompt Catalyst
            </h1>
            <AnimatePresence>
              {isPremiumUser && (
                <motion.div
                  key="premium-badge"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2 flex-shrink-0 hidden md:hidden lg:flex"
                >
                  <PremiumBadge />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* DESKTOP NAVIGATION - TRUE CENTERING */}
        <nav className="hidden lg:flex items-center justify-center absolute inset-0 pointer-events-none">
          <div className="flex items-center justify-center rounded-lg bg-[var(--dropdownHover)]/40 backdrop-blur-sm w-[600px] pointer-events-auto">
            <div className="flex items-center justify-center w-full px-3">
              {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
              <motion.button
              key={item.id}
              onClick={() => item.external ? navigate('/tutorials') : onViewChange(item.id)}
              className={`
              relative
              flex items-center justify-center
              mx-2
              px-3 py-1.5
              text-sm font-medium
              transition-all duration-200
              ${isActive
              ? 'text-black'
              : 'text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]/60'}
              `}
              style={{ minWidth: isActive ? '36px' : '32px' }}
              >
                    <div className="flex items-center justify-center">
                        <motion.div
                          animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                        <Icon
                          size={18}
                          className={isActive ? 'text-black' : ''}
                        />
                      </motion.div>
                      {isActive && (
                      <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                      className="ml-2 font-medium"
                      >
                      {item.label}
                      </motion.span>
                      )}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 ${isVideoMode 
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500' 
                          : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]'} rounded-full -z-10 shadow-md`}
                        transition={{
                          type: 'spring',
                          bounce: 0.15,
                          duration: 0.5
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* TABLET NAVIGATION - Icons only, fixed grid */}
        <nav className="hidden md:flex lg:hidden items-center justify-center w-2/4">
          <div className="flex items-center justify-center rounded-lg bg-[var(--dropdownHover)]/40 max-w-[450px] w-full backdrop-blur-sm">
            <div className="flex items-center justify-center w-full px-2">
              {filteredNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => item.external ? navigate('/tutorials') : onViewChange(item.id)}
                    className={`
                      relative
                      flex items-center justify-center
                      mx-1.5
                      px-2 py-1.5
                      text-sm font-medium
                      transition-all duration-200
                      ${isActive
                        ? 'text-black'
                        : 'text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]/60'}
                    `}
                    style={{ minWidth: isActive ? '36px' : '36px' }}
                    title={item.label}
                  >
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon
                          size={18}
                          strokeWidth={isActive ? 2.2 : 2}
                          className={isActive ? 'text-black' : ''}
                        />
                      </motion.div>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabTablet"
                        className={`absolute inset-0 ${isVideoMode 
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500' 
                          : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]'} rounded-full -z-10 shadow-md`}
                        transition={{
                          type: 'spring',
                          bounce: 0.15,
                          duration: 0.5
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 ml-auto md:w-1/4 lg:w-auto justify-end lg:mr-4">
          {/* Video/Image Mode Toggle */}
          <div className="hidden md:flex">
            <VideoToggle 
              isVideoMode={isVideoMode} 
              onToggle={onVideoModeToggle} 
            />
          </div>

          {/* MOBILE SETTINGS & MENU */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Settings Button - only show in chat view */}
            <AnimatePresence>
              {!isSettingsOpen && currentView === 'chat' && onSettingsClick && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSettingsClick}
                  className="flex p-2 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-all duration-200"
                  title="Settings"
                >
                  <Wand2 size={20} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Help Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openHelpPage}
              className="flex p-2 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-all duration-200"
              title="Help"
            >
              <HelpCircle size={20} />
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              className="p-2 text-[var(--textSecondary)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--dropdownHover)] transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.div>
            </button>
          </div>

          {/* Premium badge for tablet only - separate from title */}
          <AnimatePresence>
            {isPremiumUser && (
              <motion.div
                key="premium-badge-tablet"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="ml-1 hidden md:flex lg:hidden"
              >
                <PremiumBadge />
              </motion.div>
            )}
          </AnimatePresence>

          {/* DESKTOP SETTINGS BUTTON - only show in chat view */}
          <AnimatePresence>
            {!isSettingsOpen && currentView === 'chat' && onSettingsClick && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSettingsClick}
                className="hidden md:flex items-center justify-center p-2 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-all duration-200"
                title="Settings"
              >
                <Wand2 size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* DESKTOP AUTH SECTION */}
          {!isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              {/* Settings Gear Dropdown for Guest Users */}
              <div className="guest-dropdown-container relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleGuestDropdown}
                  className="flex items-center justify-center p-2 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-all duration-200"
                  title="Options"
                >
                  <Settings size={18} />
                </motion.button>

                {/* Guest Dropdown Menu */}
                <AnimatePresence>
                  {isGuestDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)] shadow-lg overflow-hidden z-50"
                    >
                      <div className="py-1">
                        {/* Theme Selection */}
                        <div className="px-4 py-3 border-b border-[var(--border)]">
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
                              <div className="bg-[var(--inputBackground)] rounded-md p-2 border border-[var(--border)]">
                                <div className="flex items-center gap-2 text-xs text-[var(--textSecondary)]">
                                  <Monitor size={12} className="text-[var(--textSecondary)]" />
                                  <span>Following system</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <button
                                  onClick={() => {
                                    setTheme('light');
                                    setIsGuestDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                                    currentTheme === 'light'
                                      ? 'text-[var(--text)] bg-[var(--dropdownHover)]'
                                      : 'text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]'
                                  }`}
                                >
                                  <Sun size={12} className="flex-shrink-0" />
                                  <span>Light</span>
                                  {currentTheme === 'light' && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-1 h-1 rounded-full bg-[var(--primary)] ml-auto"
                                    />
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setTheme('default');
                                    setIsGuestDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                                    currentTheme === 'default'
                                      ? 'text-[var(--text)] bg-[var(--dropdownHover)]'
                                      : 'text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]'
                                  }`}
                                >
                                  <Moon size={12} className="flex-shrink-0" />
                                  <span>Dark</span>
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
                        {guestMenuItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={item.action}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-colors duration-200"
                          >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-md shadow-[var(--primary)]/20"
              >
                <LogIn size={16} />
                <span className="hidden xl:inline">Log In</span>
              </motion.button>
            </div>
          ) : (
            <div className="hidden md:block">
              <UserDropdown
                onLogout={onLogoutClick}
                onPremiumClick={onLoginClick}
              />
            </div>
          )}
        </div>
      </header>

      {/* MOBILE NAVIGATION MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-16 z-20 md:hidden bg-[var(--cardBackground)] border-b border-[var(--border)] overflow-y-auto max-h-[min(85vh,600px)] shadow-md"
            >
              <nav className="px-4 py-2">
                {/* Mobile Navigation Groups */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {filteredNavigationItems.slice(0, 4).map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleMobileNavigation(item.id, item.external)}
                        className={`
                          relative
                          flex flex-col items-center justify-center
                          px-3 py-4
                          rounded-2xl
                          text-xs font-medium
                          transition-all duration-300
                          group
                          border
                          ${isActive
                          ? 'text-[var(--text)] bg-[var(--cardBackground)]/60 border-[var(--border)] shadow-sm backdrop-blur-sm'
                          : 'text-[var(--textBrighter)] bg-[var(--cardBackground)]/20 hover:bg-[var(--dropdownHover)]/30 hover:text-[var(--text)] border-transparent hover:border-[var(--border)]/30 backdrop-blur-sm'}
                        `}
                      >
                        {/* Active indicator dot */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                              isVideoMode ? 'bg-blue-500' : 'bg-[var(--primary)]'
                            }`}
                          />
                        )}
                        
                        <motion.div
                          animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="mb-2"
                        >
                          <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? 'bg-[var(--dropdownHover)]/40' 
                              : 'bg-[var(--dropdownHover)]/10 group-hover:bg-[var(--dropdownHover)]/20'
                          }`}>
                            <Icon
                              size={18}
                              className={isActive 
                                ? 'text-[var(--text)]'
                                : 'text-[var(--textBrighter)] group-hover:text-[var(--text)]'
                              }
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                          </div>
                        </motion.div>
                        <span className={`text-[10px] font-medium tracking-wide leading-tight text-center ${
                          isActive ? 'font-semibold' : ''
                        }`}>{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Second Row of Navigation */}
                {filteredNavigationItems.length > 4 && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {filteredNavigationItems.slice(4).map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleMobileNavigation(item.id, item.external)}
                          className={`
                            relative
                            flex flex-col items-center justify-center
                            px-3 py-4
                            rounded-2xl
                            text-xs font-medium
                            transition-all duration-300
                            group
                            border
                            ${isActive
                              ? 'text-[var(--text)] bg-[var(--cardBackground)]/60 border-[var(--border)] shadow-sm backdrop-blur-sm'
                              : 'text-[var(--textBrighter)] bg-[var(--cardBackground)]/20 hover:bg-[var(--dropdownHover)]/30 hover:text-[var(--text)] border-transparent hover:border-[var(--border)]/30 backdrop-blur-sm'}
                          `}
                        >
                          {/* Active indicator dot */}
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                                isVideoMode ? 'bg-blue-500' : 'bg-[var(--primary)]'
                              }`}
                            />
                          )}
                          
                          <motion.div
                            animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="mb-2"
                          >
                            <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                              isActive 
                                ? 'bg-[var(--dropdownHover)]/40' 
                                : 'bg-[var(--dropdownHover)]/10 group-hover:bg-[var(--dropdownHover)]/20'
                            }`}>
                              <Icon
                                size={18}
                                className={isActive 
                                  ? 'text-[var(--text)]'
                                  : 'text-[var(--textBrighter)] group-hover:text-[var(--text)]'
                                }
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                            </div>
                          </motion.div>
                          <span className={`text-[10px] font-medium tracking-wide leading-tight text-center ${
                            isActive ? 'font-semibold' : ''
                          }`}>{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                <div className="border-t border-[var(--border)] my-2" />
                
                {/* Quick Actions Row */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  {/* Video Mode Toggle */}
                  <button
                    onClick={handleVideoModeToggle}
                    className="flex flex-col items-center justify-center px-4 py-3 rounded-2xl text-xs font-medium text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]/30 active:bg-[var(--dropdownHover)]/50 transition-all duration-300 group border border-transparent hover:border-[var(--border)]/50 backdrop-blur-sm"
                  >
                    <div className="mb-1.5 p-1.5 rounded-lg bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors duration-300">
                      {isVideoMode ? <Image size={16} className="text-[var(--primary)]" /> : <Video size={16} className="text-[var(--primary)]" />}
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">{isVideoMode ? 'Image Mode' : 'Video Mode'}</span>
                  </button>
                  
                  {/* Theme Toggle */}
                  <button
                    onClick={handleThemeToggle}
                    className="flex flex-col items-center justify-center px-4 py-3 rounded-2xl text-xs font-medium text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]/30 active:bg-[var(--dropdownHover)]/50 transition-all duration-300 group border border-transparent hover:border-[var(--border)]/50 backdrop-blur-sm"
                  >
                    <div className="mb-1.5 p-1.5 rounded-lg bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors duration-300">
                      {isLightMode() ? <Moon size={16} className="text-[var(--primary)]" /> : <Sun size={16} className="text-[var(--primary)]" />}
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">{isLightMode() ? 'Dark Theme' : 'Light Theme'}</span>
                  </button>
                  
                  {/* Help Button */}
                  <button
                    onClick={openHelpPage}
                    className="flex flex-col items-center justify-center px-4 py-3 rounded-2xl text-xs font-medium text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)]/30 active:bg-[var(--dropdownHover)]/50 transition-all duration-300 group border border-transparent hover:border-[var(--border)]/50 backdrop-blur-sm"
                  >
                    <div className="mb-1.5 p-1.5 rounded-lg bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors duration-300">
                      <HelpCircle size={16} className="text-[var(--primary)]" />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">Help</span>
                  </button>
                </div>

                {/* Auth Section - Mobile */}
                {!isLoggedIn ? (
                  <button
                    onClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black text-sm font-medium shadow-md"
                  >
                    <LogIn size={18} />
                    <span className="font-semibold">Login</span>
                  </button>
                ) : (
                  <UserDropdown
                    onLogout={() => {
                      onLogoutClick();
                      setIsMobileMenuOpen(false);
                    }}
                    onPremiumClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    isMobile={true}
                  />
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;