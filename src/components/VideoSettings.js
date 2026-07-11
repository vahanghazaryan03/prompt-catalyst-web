import React, { useState, useEffect } from 'react';
import { preloadCommonVideos } from '../utils/videoCache';
import { prepareVideoPromptSettings } from '../utils/settings';
import { SelectDialog } from './SelectDialog';
import { Select } from './Select';
import { Slider } from './Slider';
import { Tooltip } from './Tooltip';
import { ChevronRight, X, Wand2, Settings2, Crown, SlidersHorizontal, ChevronLeft, HelpCircle, RotateCcw, Lock, Compass, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GifPreviewCard } from './GifPreviewCard';
import { openHelpPage } from '../utils/navigation';

const VIDEO_STYLES = {
  free: [
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'vlog', label: 'Vlog' },
   { value: 'time-lapse', label: 'Time Lapse' },
    { value: 'music-video', label: 'Music Video' },
    { value: 'experimental', label: 'Experimental' },
    { value: 'aerial', label: 'Aerial' },
    { value: 'slow-motion', label: 'Slow Motion' },
    
   
  ],
  premium: [
    { value: 'animation', label: 'Animation (Premium)', isPremium: true },
     { value: 'commercial', label: 'Commercial (Premium)', isPremium: true  },
    { value: 'hyperreal', label: 'Hyperreal (Premium)', isPremium: true },
    { value: 'noir', label: 'Film Noir (Premium)', isPremium: true },
    { value: 'retro', label: 'Retro (Premium)', isPremium: true },
    { value: 'cyberpunk', label: 'Cyberpunk (Premium)', isPremium: true }
  ]
};

const CAMERA_MOVEMENTS = {
  free: [
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'static-shot', label: 'Static' },
    { value: 'pan-shot', label: 'Pan' },
    { value: 'tilt-shot', label: 'Tilt' },
    { value: 'dolly-shot', label: 'Dolly' },
    { value: 'zoom-shot', label: 'Zoom' },
    { value: 'crane-shot', label: 'Crane' },
    { value: 'handheld-shot', label: 'Handheld' },
    { value: 'steadicam-shot', label: 'Steadicam' },
    
  ],
  premium: [
    { value: 'orbit', label: 'Orbit (Premium)', isPremium: true },
  { value: 'drone-shot', label: 'Drone (Premium)', isPremium: true },
    { value: 'vertigo', label: 'Vertigo Effect (Premium)', isPremium: true },
    { value: 'whip_pan', label: 'Whip Pan (Premium)', isPremium: true },
    { value: 'gimbal', label: 'Gimbal (Premium)', isPremium: true }
  ]
};


const PACING_OPTIONS = {
  free: [
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'slow', label: 'Slow' },
    { value: 'medium', label: 'Medium' },
    { value: 'fast', label: 'Fast' },
    { value: 'variable', label: 'Variable' },
  ],
  premium: [
    { value: 'gradual-buildup', label: 'Gradual Buildup (Premium)', isPremium: true },
    { value: 'rhythm-based', label: 'Rhythm-based (Premium)', isPremium: true },
    { value: 'dramatic-shifts', label: 'Dramatic Shifts (Premium)', isPremium: true },
  ]
};

const SPECIAL_EFFECTS = {
  free: [
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'fade', label: 'Fade Effect' },
    { value: 'blur', label: 'Blur Effect' },
    { value: 'vignette', label: 'Vignette' },
  ],
  premium: [
    { value: 'particles', label: 'Particle Effects (Premium)', isPremium: true },
    { value: 'glitch', label: 'Glitch Effect (Premium)', isPremium: true },
    { value: 'split-screen', label: 'Split Screen (Premium)', isPremium: true },
    { value: 'color-shift', label: 'Color Shift (Premium)', isPremium: true },
  ]
};

const TOOLTIPS = {
  videoStyle: 'Choose the overall visual style and mood for your video content',
  cameraMovement: 'Select how the camera will move to capture your scene',
  pacing: 'Select the rhythm and speed of scene transitions and content flow',
  specialEffects: 'Add visual effects to enhance your video',
 
  cameraAngle: {
    standard: 'Select the perspective from which your image will be viewed. Different angles can create various emotional impacts and visual interests.',
    video: 'Select the perspective from which your video will be filmed. Different angles can create various emotional impacts and visual interests.'
  },
  lighting: {
    standard: 'Choose how your image should be lit. Different lighting options can dramatically change the mood and atmosphere of your image.',
    video: 'Choose how your video should be lit. Different lighting options can dramatically change the mood and atmosphere of your video footage.'
  }
};

const VideoStyleSelect = ({ value, onChange, isPremiumUser, isUltimateUser }) => {
  // Ultimate users should have access to premium features
  const hasAccessToPremium = isPremiumUser || isUltimateUser;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const selectedOption = [...VIDEO_STYLES.free, ...(hasAccessToPremium ? VIDEO_STYLES.premium : [])]
    .find(opt => opt.value === value) || VIDEO_STYLES.free[0];

  const isNotSpecified = value === 'not_specified';

  return (
    <div>
      <motion.div
        className="w-full group cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
        whileHover="hover"
        variants={{
          hover: { y: 0 }
        }}
        data-preload-type="videoStyle-dialog"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-[var(--textBrighter)]">
              Video Style
            </span>
            <Tooltip content={TOOLTIPS.videoStyle}>
              <div className="w-3 h-3 flex items-center justify-center translate-y-[0.5px] cursor-help text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </Tooltip>
          </div>
          <motion.div
            variants={{
              hover: { x: 5, opacity: 1 },
              initial: { x: 0, opacity: 0 }
            }}
            initial="initial"
            className="flex items-center gap-1 text-sm text-emerald-400"
          >
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {isNotSpecified ? (
          <div 
            className="w-full px-3 py-2 text-left bg-[var(--dropdownBackground)]/60 rounded-lg border border-zinc-600 cursor-pointer"
          >
            <span className="text-xs text-[var(--textSecondary)]">
              Not Specified
            </span>
          </div>
        ) : (
          <GifPreviewCard
            label={selectedOption.label}
            value={selectedOption.value}
            type="videoStyle"
            isSelected={true}
            isPremium={selectedOption.isPremium}
            inSidebar={true}
          />
        )}
      </motion.div>

      <SelectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        label="Video Style"
        type="videoStyle"
        value={value}
        onChange={onChange}
        isPremiumUser={hasAccessToPremium}
        options={VIDEO_STYLES}
        tooltip={TOOLTIPS.videoStyle}
        PreviewComponent={GifPreviewCard}
      />
    </div>
  );
};

const CameraMovementSelect = ({ value, onChange, isPremiumUser, isUltimateUser }) => {
  // Ultimate users should have access to premium features
  const hasAccessToPremium = isPremiumUser || isUltimateUser;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const selectedOption = [...CAMERA_MOVEMENTS.free, ...(hasAccessToPremium ? CAMERA_MOVEMENTS.premium : [])]
    .find(opt => opt.value === value) || CAMERA_MOVEMENTS.free[0];

  const isNotSpecified = value === 'not_specified';

  return (
    <div>
      <motion.div
        className="w-full group cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
        whileHover="hover"
        variants={{
          hover: { y: 0 }
        }}
        data-preload-type="cameraMovement-dialog"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-[var(--textBrighter)]">
              Camera Movement
            </span>
            <Tooltip content={TOOLTIPS.cameraMovement}>
              <div className="w-3 h-3 flex items-center justify-center translate-y-[0.5px] cursor-help text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </Tooltip>
          </div>
          <motion.div
            variants={{
              hover: { x: 5, opacity: 1 },
              initial: { x: 0, opacity: 0 }
            }}
            initial="initial"
            className="flex items-center gap-1 text-sm text-emerald-400"
          >
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {isNotSpecified ? (
          <div 
            className="w-full px-3 py-2 text-left bg-[var(--dropdownBackground)]/60 rounded-lg border border-zinc-600 cursor-pointer"
          >
            <span className="text-xs text-[var(--textSecondary)]">
              Not Specified
            </span>
          </div>
        ) : (
          <GifPreviewCard
            label={selectedOption.label}
            value={selectedOption.value}
            type="cameraMovement"
            isSelected={true}
            isPremium={selectedOption.isPremium}
            inSidebar={true}
          />
        )}
      </motion.div>

      <SelectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        label="Camera Movement"
        type="cameraMovement"
        value={value}
        onChange={onChange}
        isPremiumUser={hasAccessToPremium}
        options={CAMERA_MOVEMENTS}
        tooltip={TOOLTIPS.cameraMovement}
        PreviewComponent={GifPreviewCard}
      />
    </div>
  );
};



const PacingSelect = ({ value, onChange, isPremiumUser, isUltimateUser }) => {
  // Ultimate users should have access to premium features
  const hasAccessToPremium = isPremiumUser || isUltimateUser;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const selectedOption = [...PACING_OPTIONS.free, ...(hasAccessToPremium ? PACING_OPTIONS.premium : [])]
    .find(opt => opt.value === value) || PACING_OPTIONS.free[0];

  const isNotSpecified = value === 'not_specified';

  return (
    <div>
      <motion.div
        className="w-full group cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
        whileHover="hover"
        variants={{
          hover: { y: 0 }
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-[var(--textBrighter)]">
              Pacing
            </span>
            <Tooltip content={TOOLTIPS.pacing}>
              <div className="w-3 h-3 flex items-center justify-center translate-y-[0.5px] cursor-help text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </Tooltip>
          </div>
          <motion.div
            variants={{
              hover: { x: 5, opacity: 1 },
              initial: { x: 0, opacity: 0 }
            }}
            initial="initial"
            className="flex items-center gap-1 text-sm text-emerald-400"
          >
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {isNotSpecified ? (
          <div 
            className="w-full px-3 py-2 text-left bg-[var(--dropdownBackground)]/60 rounded-lg border border-zinc-600 cursor-pointer"
          >
            <span className="text-xs text-[var(--textSecondary)]">
              Not Specified
            </span>
          </div>
        ) : (
          <div className="w-full px-4 py-3 text-left bg-[var(--dropdownBackground)] border border-[var(--border)] rounded-lg">
            <span className="text-sm text-white">
              {selectedOption.label.replace(' (Premium)', '')}
            </span>
          </div>
        )}
      </motion.div>

      <SelectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        label="Pacing"
        type="pacing"
        value={value}
        onChange={onChange}
        isPremiumUser={hasAccessToPremium}
        options={PACING_OPTIONS}
        tooltip={TOOLTIPS.pacing}
      />
    </div>
  );
};

const SpecialEffectsSelect = ({ value, onChange, isPremiumUser, isUltimateUser }) => {
  // Ultimate users should have access to premium features
  const hasAccessToPremium = isPremiumUser || isUltimateUser;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const selectedOption = [...SPECIAL_EFFECTS.free, ...(hasAccessToPremium ? SPECIAL_EFFECTS.premium : [])]
    .find(opt => opt.value === value) || SPECIAL_EFFECTS.free[0];

  const isNotSpecified = value === 'not_specified';

  return (
    <div>
      <motion.div
        className="w-full group cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
        whileHover="hover"
        variants={{
          hover: { y: 0 }
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-[var(--textBrighter)]">
              Special Effects
            </span>
            <Tooltip content={TOOLTIPS.specialEffects}>
              <div className="w-3 h-3 flex items-center justify-center translate-y-[0.5px] cursor-help text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </Tooltip>
          </div>
          <motion.div
            variants={{
              hover: { x: 5, opacity: 1 },
              initial: { x: 0, opacity: 0 }
            }}
            initial="initial"
            className="flex items-center gap-1 text-sm text-emerald-400"
          >
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {isNotSpecified ? (
          <div 
            className="w-full px-3 py-2 text-left bg-[var(--dropdownBackground)]/60 rounded-lg border border-zinc-600 cursor-pointer"
          >
            <span className="text-xs text-[var(--textSecondary)]">
              Not Specified
            </span>
          </div>
        ) : (
          <GifPreviewCard
            label={selectedOption.label}
            value={selectedOption.value}
            type="specialEffects"
            isSelected={true}
            isPremium={selectedOption.isPremium}
            inSidebar={true}
          />
        )}
      </motion.div>

      <SelectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        label="Special Effects"
        type="specialEffects"
        value={value}
        onChange={onChange}
        isPremiumUser={hasAccessToPremium}
        options={SPECIAL_EFFECTS}
        tooltip={TOOLTIPS.specialEffects}
        PreviewComponent={GifPreviewCard}
      />
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 pb-2 mb-3 border-b border-[var(--border)]">
    <motion.div 
      className="p-1 rounded-lg bg-[var(--primary)]/10 sm:p-1.5"
    >
      <Icon className="h-4 w-4 text-[var(--primary)]" />
    </motion.div>
    <h3 className="text-sm sm:text-base font-semibold text-[var(--text)]">{ title }</h3>
  </div>
);

const SettingSection = motion.section;

const VideoSettings = ({ settings, onSettingChange, isPremiumUser, isUltimateUser, onClose, onPremiumClick, className = '' }) => {
  // Ultimate users have access to all premium features
  const hasAccessToPremium = isPremiumUser || isUltimateUser;
  const [isResetting, setIsResetting] = useState(false);
  
  // Set different default for prompt amount based on premium status
  useEffect(() => {
    if (hasAccessToPremium && !settings.userSetPromptAmount) {
      // For premium users, set default to 5 if user hasn't manually changed it
      onSettingChange('promptAmount', 5);
      // Mark as user set to prevent changing on subsequent renders
      onSettingChange('userSetPromptAmount', true);
    }
  }, [hasAccessToPremium, settings.userSetPromptAmount, onSettingChange, settings.promptAmount]);
  
  // Preload common videos when component mounts
  useEffect(() => {
    // Only preload once the component is fully mounted
    const timer = setTimeout(() => {
      preloadCommonVideos();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleResetSettings = () => {
    setIsResetting(true);
    
    // Reset animation
    setTimeout(() => {
      // Reset to default video settings - includes parameters that are shown in the sidebar
      const resetSettings = {
        videoStyle: 'cinematic',
        style: 'cinematic', // Ensure style parameter is also set
        cameraMovement: 'not_specified',
        movement: 'not_specified', // Ensure movement parameter is also set
        cameraAngle: 'not_specified',
        lighting: 'not_specified',
        specialEffects: 'not_specified',
        pacing: 'medium',
        promptLength: 2,
        creativity: 5,
        promptAmount: hasAccessToPremium ? 5 : 3, // Default to 5 for premium users, 3 for free users
        userSetPromptAmount: false // Reset the user set flag
      };
      
      // Only update the specific properties we care about
      Object.keys(resetSettings).forEach(key => {
        onSettingChange(key, resetSettings[key]);
      });
      
      // Ensure style parameter is set
      onSettingChange('style', resetSettings.videoStyle);
      
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
            <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--primary)]" />
          </motion.div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text)]">Video Prompt Settings</h2>
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Generation Controls */}
        <SettingSection
          animate={isResetting ? "reset" : "normal"}
          variants={sectionVariants}
          transition={{ delay: 0 }}
        >
          <SectionHeader icon={SlidersHorizontal} title="Generation Controls" />
          
          <div className="space-y-4 sm:space-y-4">
            {/* Prompt Length */}
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

            {/* Creativity Value */}
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.2 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <Slider
                label="Creativity Value"
                value={settings.creativity || 5}
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
                    {!hasAccessToPremium && (
                      <Tooltip content="Unlocks with Membership" compact>
                        <Lock className="h-3 w-3 text-[var(--textSecondary)] ml-1 cursor-help" />
                      </Tooltip>
                    )}
                  </div>
                }
                value={settings.promptAmount || 3}
                onChange={hasAccessToPremium ? (value) => {
                  onSettingChange('promptAmount', value);
                  onSettingChange('userSetPromptAmount', true);
                } : undefined}
                min={1}
                max={10}
                step={1}
                disabled={!hasAccessToPremium}
              />
            </motion.div>
          </div>
        </SettingSection>
        
        {/* Video Settings Section */}
        <SettingSection
          animate={isResetting ? "reset" : "normal"}
          variants={sectionVariants}
          transition={{ delay: 0.1 }}
        >
          <SectionHeader icon={Settings2} title="Core Settings" />
          
          <div className="space-y-3 sm:space-y-4">
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.4 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <VideoStyleSelect
                value={settings.videoStyle}
                onChange={(value) => {
                  // Update videoStyle parameter
                  onSettingChange('videoStyle', value);
                  
                  // Also update the style parameter for the API, but only in video mode
                  // This ensures we're not setting 'style' to 'cinematic' in image mode
                  onSettingChange('video_style', value); // Use a separate property that won't conflict with image styles
                  
                  // Set the regular style parameter for backward compatibility
                  // This might leak into image settings, but our filter will prevent usage
                  onSettingChange('style', value);
                }}
                isPremiumUser={isPremiumUser}
                isUltimateUser={isUltimateUser}
              />
            </motion.div>

            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.5 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <CameraMovementSelect
                value={settings.cameraMovement}
                onChange={(value) => {
                  onSettingChange('cameraMovement', value);
                }}
                isPremiumUser={isPremiumUser}
                isUltimateUser={isUltimateUser}
              />
            </motion.div>
            
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.6 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <Select
                label="Camera Angle"
                type="cameraAngle"
                value={settings.cameraAngle}
                onChange={(value) => onSettingChange('cameraAngle', value)}
                isPremiumUser={hasAccessToPremium}
                inSidebar={true}
                customTooltip={TOOLTIPS.cameraAngle.video}
              />
            </motion.div>

            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.7 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <Select
                label="Lighting"
                type="lighting"
                value={settings.lighting}
                onChange={(value) => onSettingChange('lighting', value)}
                isPremiumUser={hasAccessToPremium}
                inSidebar={true}
                customTooltip={TOOLTIPS.lighting.video}
              />
            </motion.div>
          </div>
        </SettingSection>
        
        {/* Special Effects Section */}
        <SettingSection
          animate={isResetting ? "reset" : "normal"}
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader icon={Sparkles} title="Effects & Timing" />
          
          <div className="space-y-3 sm:space-y-4">
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.8 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <PacingSelect
                value={settings.pacing || 'not_specified'}
                onChange={(value) => onSettingChange('pacing', value)}
                isPremiumUser={isPremiumUser}
                isUltimateUser={isUltimateUser}
              />
            </motion.div>
            
            <motion.div
              variants={controlVariants}
              animate={isResetting ? "reset" : "normal"}
              transition={{ delay: 0.9 }}
              className="bg-[var(--background)]/30 p-2 sm:p-3 rounded-xl backdrop-blur-sm"
            >
              <SpecialEffectsSelect
                value={settings.specialEffects || 'not_specified'}
                onChange={(value) => onSettingChange('specialEffects', value)}
                isPremiumUser={isPremiumUser}
                isUltimateUser={isUltimateUser}
              />
            </motion.div>
          </div>
        </SettingSection>


      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md">
        {isPremiumUser ? (
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--textSecondary)]">
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--primary)]" />
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

export default VideoSettings;