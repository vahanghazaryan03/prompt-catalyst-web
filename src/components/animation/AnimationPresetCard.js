// src/components/animation/AnimationPresetCard.js

import React from 'react';
import { XCircle } from 'lucide-react';

const AnimationPresetCard = ({ 
  preset, 
  categoryId, 
  isSelected, 
  onSelect, 
  isPremiumUser 
}) => {
  // Check if this preset requires premium (can be set at the preset level)
  const isPremium = preset.premium && !isPremiumUser;
  
  const handleClick = () => {
    if (isPremium) return; // Don't allow selection of premium presets for non-premium users
    
    // Include both preset and categoryId in selection
    onSelect(isSelected ? null : { ...preset, categoryId });
  };
  
  return (
    <button
      onClick={handleClick}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
        isSelected 
          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' 
          : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5'
      } ${isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isPremium}
    >
      <div className="flex-1 text-left">
        <div className="font-medium text-sm text-[var(--text)]">{preset.name}</div>
        <div className="text-xs text-[var(--textSecondary)] mt-0.5">{preset.description}</div>
      </div>
      
      {isSelected && (
        <div className="flex items-center justify-center">
          <XCircle size={16} className="text-[var(--primary)]" />
        </div>
      )}
      
      {isPremium && (
        <div className="flex items-center justify-center ml-auto">
          <span className="text-xs px-1.5 py-0.5 bg-yellow-600/30 text-yellow-400 rounded">Premium</span>
        </div>
      )}
    </button>
  );
};

export default AnimationPresetCard;