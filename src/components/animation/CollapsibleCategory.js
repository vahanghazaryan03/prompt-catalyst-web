// src/components/animation/CollapsibleCategory.js

import React from 'react';
import { ChevronDown, ChevronUp, Camera, User, Sparkles, Move, Cloud, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimationPresetCard from './AnimationPresetCard';

// Icon mapping for categories
const CATEGORY_ICONS = {
  camera: Camera,
  character: User,
  effects: Sparkles,
  transitions: Move,
  environmental: Cloud,
  stylistic: Palette
};

const CollapsibleCategory = ({ 
  category, 
  isExpanded, 
  onToggle, 
  selectedPreset, 
  onSelectPreset,
  isPremiumUser 
}) => {
  // Get the appropriate icon component
  const IconComponent = CATEGORY_ICONS[category.id] || Move;
  
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-3 rounded-lg border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all"
      >
        <div className="flex items-center gap-2">
          <IconComponent size={18} className="text-[var(--primary)]" />
          <span className="font-medium text-sm">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--textSecondary)]">{category.description}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
          >
            <div className="grid grid-cols-1 gap-2">
              {category.presets.map(preset => (
                <AnimationPresetCard
                  key={preset.id}
                  preset={preset}
                  categoryId={category.id}
                  isSelected={
                    selectedPreset && 
                    selectedPreset.id === preset.id && 
                    selectedPreset.categoryId === category.id
                  }
                  onSelect={onSelectPreset}
                  isPremiumUser={isPremiumUser}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleCategory;