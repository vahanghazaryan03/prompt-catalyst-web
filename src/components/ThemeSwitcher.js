import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';

export const ThemeSwitcher = () => {
  const { 
    themes, 
    currentTheme, 
    setTheme, 
    setCustomBackground, 
    isLightMode,
    setFollowSystemTheme,
    isFollowingSystemTheme,
    getSystemTheme,
    isSystemThemeListener
  } = useTheme();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [followingSystem, setFollowingSystem] = useState(isFollowingSystemTheme());
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync local state with theme context
  useEffect(() => {
    setFollowingSystem(isFollowingSystemTheme());
  }, [isFollowingSystemTheme]);

  const handleFollowSystemToggle = () => {
    const newFollowState = !followingSystem;
    setFollowingSystem(newFollowState);
    setFollowSystemTheme(newFollowState);
    if (newFollowState) {
      setIsPanelOpen(false);
    }
  };

  const handleThemeSelect = (themeId) => {
    setFollowingSystem(false);
    setFollowSystemTheme(false);
    setTheme(themeId);
    setIsPanelOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="p-2 hover:bg-[var(--dropdownHover)] rounded-lg transition-colors duration-200 relative overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        title="Change Theme"
        aria-label="Change Theme"
      >
        <motion.div
          animate={{ rotate: isPanelOpen ? 15 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Palette 
            size={18} 
            className="text-[var(--textSecondary)] group-hover:text-[var(--text)] transition-colors duration-200"
            strokeWidth={2}
          />
        </motion.div>
      </motion.button>

        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ 
                type: "spring",
                duration: 0.2,
                bounce: 0.1
              }}
              className="absolute right-0 mt-2 w-64 bg-[var(--cardBackground)] rounded-lg shadow-xl overflow-hidden z-50 border border-[var(--border)] backdrop-blur-xl"
            >
              {/* Compact Header */}
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-[var(--text)] uppercase tracking-wide">Theme</h3>
                </div>
              </div>

              <div className="p-3">
                {/* System Theme Toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-[var(--textSecondary)]" />
                    <span className="text-xs font-medium text-[var(--text)]">Auto</span>
                  </div>
                  <button
                    onClick={handleFollowSystemToggle}
                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-all duration-200 focus:outline-none ${
                      followingSystem
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]' 
                        : 'bg-[var(--border)]'
                    }`}
                  >
                    <motion.span
                      animate={{
                        x: followingSystem ? 14 : 2
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="inline-block h-3 w-3 transform rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>

                {/* Compact Theme Options */}
                <div className="space-y-2">
                  {Object.entries(themes).map(([themeId, theme]) => {
                    const isActive = currentTheme === themeId && !followingSystem;
                    const isSystemActive = followingSystem && getSystemTheme() === themeId;
                    
                    return (
                      <motion.button
                        key={themeId}
                        onClick={() => handleThemeSelect(themeId)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                          isActive || isSystemActive
                            ? 'bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/30'
                            : 'hover:bg-[var(--dropdownHover)] border border-transparent'
                        } ${followingSystem && !isSystemActive ? 'opacity-50' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={followingSystem && !isSystemActive}
                      >
                        {/* Theme Icon & Color */}
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div 
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: theme.colors.primary }}
                            />
                            {theme.mode === 'light' ? (
                              <Sun size={8} className="absolute -top-0.5 -right-0.5 text-yellow-500" />
                            ) : (
                              <Moon size={8} className="absolute -top-0.5 -right-0.5 text-blue-400" />
                            )}
                          </div>
                          
                          <div className="text-left">
                            <div className="text-sm font-medium text-[var(--text)]">
                              {theme.name}
                            </div>
                          </div>
                        </div>

                        {/* Active Indicator */}
                        <div className="ml-auto">
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-[var(--primary)]"
                            />
                          )}
                          {isSystemActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center"
                            >
                              <Monitor size={12} className="text-[var(--primary)]" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};
