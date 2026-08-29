import React, { useState, useEffect } from 'react';
import { Select } from './Select';
import { MultiSelect } from './MultiSelect';
import { Slider } from './Slider';
import { MidjourneyParams } from './MidjourneyParams';
import VideoSettings from './VideoSettings';
import { Tooltip } from './Tooltip';
import { motion } from 'framer-motion';
import { 
  Wand2, 
  Settings2, 
  Crown,
  Palette,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  Lock
} from 'lucide-react';
import { defaultSettings } from '../utils/settings';
import { openHelpPage } from '../utils/navigation';
import { useTheme } from '../contexts/ThemeContext';


const SettingSection = motion.section;

export const Settings = ({ 
  settings, 
  onSettingChange,
  isPremiumUser,
  isVideoMode,
  className = '',
  onClose,
  onPremiumClick
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const { isLightMode } = useTheme();
  
  // Set different default for prompt amount based on premium status
  useEffect(() => {
    if (isPremiumUser && !settings.userSetPromptAmount) {
      // For premium users, set default to 5 if user hasn't manually changed it
      onSettingChange('promptAmount', 5);
      // Mark as user set to prevent changing on subsequent renders
      onSettingChange('userSetPromptAmount', true);
    }
  }, [isPremiumUser, settings.userSetPromptAmount, onSettingChange, settings.promptAmount]);
  
  const stableMidjourneyParams = React.useMemo(
    () => settings.midjourneyParams || [],
    [settings.midjourneyParams]
  );

  const handleMidjourneyParamsChange = React.useCallback((params) => {
    onSettingChange('midjourneyParams', params);
  }, [onSettingChange]);

  const handleMultiSettingChange = (settingName, values) => {
    onSettingChange(settingName, values);
  };

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 pb-2 mb-3 border-b border-[var(--border)]">
      <motion.div 
        className="p-1 rounded-lg bg-[var(--primary)]/10 sm:p-1.5"
        animate={isResetting ? {
          scale: [1, 0.9, 1],
          rotate: [0, -180, 0],
        } : {}}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Icon className={`h-4 w-4 ${isLightMode() ? 'text-black' : 'text-[var(--primary)]'}`} />
      </motion.div>
      <h3 className="text-sm sm:text-base font-semibold text-[var(--text)]">{title}</h3>
    </div>
  );

  const handleResetSettings = () => {
    setIsResetting(true);
    
    // Animate the reset button
    const resetButton = document.querySelector('[aria-label="Reset settings to defaults"]');
    if (resetButton) {
      resetButton.classList.add('animate-spin');
    }

    // Reset settings with faster animation delay
    setTimeout(() => {
      const resetSettings = {
        ...defaultSettings,
        // Override the default style to be not_specified
        style: 'not_specified',
        purpose: 'not_specified',
        // Initialize the multi-select arrays as empty to match the not_specified style setting
        styles: [],
        // Initialize lighting effects based on default settings
        lightingEffects: defaultSettings.lighting !== 'not_specified' ? [defaultSettings.lighting] : [],
        // Initialize camera angles based on default settings
        cameraAngles: defaultSettings.cameraAngle !== 'not_specified' ? [defaultSettings.cameraAngle] : [],
        // If premium user, use 5 prompts, otherwise 3
        promptAmount: isPremiumUser ? 5 : 3,
        // Reset user set flag
        userSetPromptAmount: false
      };
      onSettingChange(resetSettings);
      
      // Remove animation classes
      if (resetButton) {
        resetButton.classList.remove('animate-spin');
      }
      
      // Reset state after animation completes
      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }, 150);
  };

  const sectionVariants = {
    reset: {
      opacity: 0,
      scale: 0.97,
      transition: {
        duration: 0.15,
      }
    },
    normal: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.15,
      }
    }
  };

  const controlVariants = {
    reset: {
      x: -10,
      opacity: 0,
    },
    normal: {
      x: 0,
      opacity: 1,
    }
  };

  const renderContent = () => {
    if (isVideoMode) {
      return (
        <div className="space-y-5 sm:space-y-6">
          <SettingSection
            animate={isResetting ? "reset" : "normal"}
            variants={sectionVariants}
          >
            <SectionHeader icon={Settings2} title="Video Settings" />
            <VideoSettings
              settings={settings}
              onSettingChange={onSettingChange}
              isPremiumUser={isPremiumUser}
            />
          </SettingSection>
        </div>
      );
    }

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Generation Controls */}
        <SettingSection
          animate={isResetting ? "reset" : "normal"}
          variants={sectionVariants}
          transition={{ delay: 0 }}
        >
          <SectionHeader icon={SlidersHorizontal} title="Generation Controls" />
          
          <div className="space-y-4 sm:space-y-4">
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.1 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <Slider
                label="Prompt Length"
                value={settings.promptLength}
                onChange={(value) => onSettingChange('promptLength', value)}
                min={1}
                max={3}
                step={1}
                labels={['Short', 'Medium', 'Long']}
              />
            </motion.div>

            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.2 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <Slider
                label="Creativity Value"
                value={settings.creativity}
                onChange={(value) => onSettingChange('creativity', value)}
                min={1}
                max={10}
                step={1}
              />
            </motion.div>
            
            {/* Number of Prompts - Always visible, locked for free users */}
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.3 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <Slider
                label={
                  <div className="flex items-center gap-1.5">
                    <span className="mb-1">Number of Prompts</span>
                    {!isPremiumUser && (
                      <Tooltip content="Unlocks with Membership" compact>
                        <Lock className="h-3 w-3 text-[var(--textSecondary)] ml-1 cursor-help" />
                      </Tooltip>
                    )}
                  </div>
                }
                value={settings.promptAmount || 3}
                onChange={isPremiumUser ? (value) => {
                  onSettingChange('promptAmount', value);
                  onSettingChange('userSetPromptAmount', true);
                } : undefined}
                min={1}
                max={10}
                step={1}
                disabled={!isPremiumUser}
              />
            </motion.div>
          </div>
        </SettingSection>

        {/* Core Settings */}
        <SettingSection
          animate={isResetting ? "reset" : "normal"}
          variants={sectionVariants}
          transition={{ delay: 0.1 }}
        >
          <SectionHeader icon={Settings2} title="Core Settings" />

          <div className="space-y-3 sm:space-y-4">
            {/* Purpose select */}
            <motion.div
              key="purpose"
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.1 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <Select
                label="Purpose"
                type="purpose"
                value={settings.purpose}
                onChange={(value) => onSettingChange('purpose', value)}
                isPremiumUser={isPremiumUser}
                inSidebar={true}
              />
            </motion.div>

            {/* MultiSelect for styles */}
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.15 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <MultiSelect
                label="Styles"
                type="style"
                values={settings.styles || []}
                onChange={(values) => handleMultiSettingChange('styles', values)}
                isPremiumUser={isPremiumUser}
                inSidebar={true}
                maxSelections={3}
              />
            </motion.div>
            
            {/* Model select */}
            <motion.div
              key="model"
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.2 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <Select
                label="Model"
                type="model"
                value={settings.model}
                onChange={(value) => onSettingChange('model', value)}
                isPremiumUser={isPremiumUser}
                inSidebar={true}
              />
            </motion.div>

            {settings.model === 'midjourney' && (
              <motion.div
                variants={controlVariants}
                animate={isResetting ? "reset" : "normal"}
                transition={{ delay: 0.5 }}
                className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
              >
                <MidjourneyParams
                  parameters={stableMidjourneyParams}
                  onChange={handleMidjourneyParamsChange}
                />
              </motion.div>
            )}
          </div>
        </SettingSection>

        {/* Visual Settings */}
        <SettingSection
          animate={isResetting ? "reset" : "normal"}
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader icon={Palette} title="Visual Settings" />
          
          <div className="space-y-3 sm:space-y-4">
            {/* MultiSelect for lighting */}
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.25 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <MultiSelect
                label="Lighting"
                type="lighting"
                values={settings.lightingEffects || []}
                onChange={(values) => handleMultiSettingChange('lightingEffects', values)}
                isPremiumUser={isPremiumUser}
                inSidebar={true}
                maxSelections={3}
              />
            </motion.div>

            {/* MultiSelect for camera angles */}
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.3 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <MultiSelect
                label="Camera Angles"
                type="cameraAngle"
                values={settings.cameraAngles || []}
                onChange={(values) => handleMultiSettingChange('cameraAngles', values)}
                isPremiumUser={isPremiumUser}
                inSidebar={true}
                maxSelections={2}
              />
            </motion.div>
          </div>
        </SettingSection>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col bg-zinc-910/95 backdrop-blur-md ${className}`} data-component="settings">

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 bg-zinc-930/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-colors"
            aria-label="Back"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <motion.div
            className="p-1.5 sm:p-2 rounded-lg bg-[var(--primary)]/10"
            animate={{
              scale: isResetting ? [1, 0.9, 1] : 1,
              rotate: isResetting ? [0, 360, 0] : 0
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Wand2 className={`h-4 w-4 sm:h-5 sm:w-5 ${isLightMode() ? 'text-black' : 'text-[var(--primary)]'}`} />
          </motion.div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text)]">Image Prompt Settings</h2>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => openHelpPage()}
            className="p-2 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-colors"
            aria-label="Help"
            title="Help"
            whileTap={{ scale: 0.95 }}
          >
            <HelpCircle className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={handleResetSettings}
            className="p-2 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-colors"
            aria-label="Reset settings to defaults"
            title="Reset to defaults"
            whileTap={{ scale: 0.95 }}
            disabled={isResetting}
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
          <button
            onClick={onClose}
            className="hidden lg:block p-2 rounded-lg text-[var(--textSecondary)] hover:bg-[var(--dropdownHover)] hover:text-[var(--text)] transition-colors"
            aria-label="Close settings"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        {renderContent()}
      </div>
      
      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md">
        {isPremiumUser ? (
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--textSecondary)]">
            <Crown className={`h-4 w-4 sm:h-5 sm:w-5 ${isLightMode() ? 'text-black' : 'text-[var(--primary)]'}`} />
            <span className="font-medium">Premium features enabled</span>
          </div>
        ) : (
          <div className="px-0.5">
            <motion.button 
              onClick={onPremiumClick}
              className="group w-full flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-4 py-2.5 sm:py-2.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 hover:from-violet-400 hover:via-indigo-400 hover:to-fuchsia-400 animate-gradient-x bg-[length:200%_100%] rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ color: 'white' }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <div className="flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-md">
                  <Crown 
                    className="h-3 w-3 sm:h-4 sm:w-4" 
                    style={{ color: 'white !important', stroke: 'white', fill: 'none' }} 
                  />
                </div>
                <span 
                  className="font-medium text-xs sm:text-sm" 
                  style={{ color: 'white !important' }}
                >
                  Upgrade
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
                <span 
                  className="hidden xs:inline" 
                  style={{ color: 'white !important' }}
                >
                  Unlock all features
                </span>
                <span 
                  className="xs:hidden" 
                  style={{ color: 'white !important' }}
                >
                  Unlock all features
                </span>
                <ChevronLeft 
                  className="h-3 w-3 rotate-180" 
                  style={{ color: 'white !important', stroke: 'white', fill: 'none' }} 
                />
              </div>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};