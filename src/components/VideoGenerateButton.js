import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Film, CircleFadingArrowUpIcon } from 'lucide-react';

// Define credit costs for video models, resolutions and durations
const MODEL_COSTS = {
  'kling-1.6': 400,  // Base cost for 720p, 5 sec
  'wan-2.1': 300     // Base cost for 720p, 5 sec (when available)
};

// Resolution multipliers
const RESOLUTION_MULTIPLIERS = {
  '720p': 1,    // Base multiplier
  '1080p': 2.75 // 1100/400 = 2.75x more expensive
};

// Duration multipliers
const DURATION_MULTIPLIERS = {
  5: 1,    // Base multiplier
  10: 2    // Twice as expensive for 10 seconds
};

const VideoGenerateButton = ({ 
  onClick, 
  isGenerating, 
  disabled, 
  videoModel, 
  resolution, 
  duration,
  showUpgradeButton = false, 
  onPremiumClick 
}) => {
  // Calculate total credit cost
  const baseCost = MODEL_COSTS[videoModel] || 400; // Default to 400 if model not found
  const resolutionMultiplier = RESOLUTION_MULTIPLIERS[resolution] || 1;
  const durationMultiplier = DURATION_MULTIPLIERS[duration] || 1;
  
  const totalCost = Math.round(baseCost * resolutionMultiplier * durationMultiplier);

  // Render upgrade button if showUpgradeButton is true
  if (showUpgradeButton) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPremiumClick ? onPremiumClick('pro') : onClick()}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-blue-500 text-black font-medium shadow-sm hover:shadow-md transition-all duration-200"
      >
        <CircleFadingArrowUpIcon size={20} className="shrink-0" />
        <span className="flex-1">Upgrade to Pro</span>
      </motion.button>
    );
  }

  // Regular generate button
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isGenerating || disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[var(--primary)] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
    >
      {isGenerating ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Film size={20} className="shrink-0" />
          <span className="flex-1">Generate Video</span>
          <span className="text-sm font-semibold bg-white/15 px-3 py-1 rounded-md flex items-center gap-1">
            {totalCost} Credits
          </span>
        </>
      )}
    </motion.button>
  );
};

export default VideoGenerateButton;