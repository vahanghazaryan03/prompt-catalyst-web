import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Zap, Camera, Wand2, Palette, BadgePlus, CircleGauge, CircleFadingArrowUpIcon } from 'lucide-react';
import { Tooltip } from './Tooltip';

// Define credit costs for all models
const MODEL_COSTS = {
  'imagen': 40,    
  'flux-pro-1.1-ultra': 80,
  'flux-pro-1.1': 60,
  'hidream-full': 25,
  'seedream-4.0': 80,
  'hidream-fast': 15,
  'juggernaut-flux-pro': 15,
  'juggernaut-flux-lightning': 5,
  'flux': 10,
  'flux-schnell': 5
};

// Define model icons
const MODEL_ICONS = {
  'imagen': Palette,  
  'flux-pro-1.1-ultra': Sparkles,
  'flux-pro-1.1': Camera,
  'hidream-full': Palette,
  'seedream-4.0': Camera,
  'hidream-fast': Zap,
  'juggernaut-flux-pro': BadgePlus,
  'juggernaut-flux-lightning': Zap,
  'flux': Wand2,
  'flux-schnell': CircleGauge
};

const GenerateButton = ({ onClick, isGenerating, disabled, model, imageCount, showUpgradeButton = false, onPremiumClick }) => {
  // Get credit cost for selected model
  const creditCost = MODEL_COSTS[model] || 5; // Default to 5 if model not found
  const totalCost = creditCost * imageCount;

  // Get icon component for selected model
  const IconComponent = MODEL_ICONS[model] || Sparkles;

  

  // Render upgrade button if showUpgradeButton is true
  if (showUpgradeButton) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPremiumClick || onClick} // Use onPremiumClick if provided, otherwise fallback to onClick
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-green-500 text-black font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
          <IconComponent size={20} className="shrink-0" />
          <span className="flex-1">Generate Images</span>
       
            <span className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-md flex items-center gap-1">
              {totalCost} Credits
            </span>
          
        </>
      )}
    </motion.button>
  );
};

export default GenerateButton;