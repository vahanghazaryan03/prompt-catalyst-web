import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRandomPresets } from '../utils/presets';
import { logger } from '../utils/logger';

const SettingsSuggestions = ({ onPresetApply, isVideoMode = false }) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState([]);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  
  useEffect(() => {
    const randomPresets = getRandomPresets(user?.isPremium, 3, isVideoMode);
    setPresets(randomPresets);
  }, [user?.isPremium, isVideoMode]);

  const handlePresetClick = async (preset) => {
    if (isApplyingPreset) {
      return;
    }
    try {
      setIsApplyingPreset(true);
      
      if (!preset.settings || !preset.samplePrompt) {
        logger.warn('Preset missing required properties:', preset);
        return;
      }
  
      onPresetApply(preset);
  
    } catch (error) {
      logger.error('Error applying preset:', error);
    } finally {
      setIsApplyingPreset(false);
    }
  };

  // Premium badge component
 

  return (
    <div className="flex flex-wrap justify-center gap-3 px-4">
      {presets.map((preset) => {
        const IconComponent = preset.icon;
        
        return (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset)}
            disabled={isApplyingPreset}
            className={`group relative px-4 py-2 text-sm rounded-lg 
                       bg-[var(--dropdownBackground)]/30 
                       text-[var(--textSecondary)] hover:text-[var(--text)] 
                       border border-[var(--border)] hover:border-[var(--primary)]/50
                       transition-all duration-200 hover:bg-[var(--dropdownBackground)]/50
                       flex items-center gap-2
                       ${isApplyingPreset ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {IconComponent && (
              <IconComponent 
                size={16} 
                className="text-[var(--textSecondary)] group-hover:text-[var(--text)] transition-colors duration-200"
              />
            )}
            <span>{preset.displayName}</span>
         
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
                          text-xs bg-[var(--tooltipBackground)] text-[var(--tooltipText)] 
                          rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          whitespace-nowrap pointer-events-none z-50">
              {preset.samplePrompt}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SettingsSuggestions;