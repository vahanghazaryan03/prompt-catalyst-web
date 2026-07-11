import React, { useState, useEffect } from 'react';
import { AspectRatio } from 'lucide-react';

// Video aspect ratios - simpler than image mode
const VIDEO_ASPECT_RATIOS = [
  {
    id: '9:16',
    label: 'Portrait',
    description: 'Ideal for mobile/social media',
    width: 9,
    height: 16
  },
  {
    id: '1:1',
    label: 'Square',
    description: 'Equal width and height',
    width: 1,
    height: 1
  },
  {
    id: '16:9',
    label: 'Landscape',
    description: 'Standard widescreen format',
    width: 16,
    height: 9
  }
];

// Helper functions to calculate preview dimensions
const calculatePreviewWidth = (ratio) => {
  const previewWidths = {
    '16:9': '95%',  // Wide
    '1:1': '80%',   // Square
    '9:16': '45%'   // Vertical
  };
  
  return previewWidths[ratio.id] || '80%';
};

const calculatePreviewHeight = (ratio) => {
  const previewHeights = {
    '16:9': '45%',  // Wide
    '1:1': '80%',   // Square
    '9:16': '95%'   // Vertical
  };
  
  return previewHeights[ratio.id] || '80%';
};

const VideoAspectRatioSelector = ({ 
  selectedRatio, 
  onRatioChange, 
  isPremium = false, 
  isMobile = false 
}) => {
  // Ensure we have a valid aspect ratio selected
  useEffect(() => {
    // If the current ratio is not one of the valid options, select 16:9 by default
    if (!VIDEO_ASPECT_RATIOS.some(option => option.id === selectedRatio)) {
      onRatioChange('16:9');
    }
  }, [selectedRatio, onRatioChange]);

  // Get selected ratio object
  const selectedRatioObj = VIDEO_ASPECT_RATIOS.find(ratio => ratio.id === selectedRatio) || VIDEO_ASPECT_RATIOS[0];

  const handleSelect = (ratioId) => {
    onRatioChange(ratioId);
  };

  // Styles from GenerateButton and AspectRatioScroller
  const buttonBaseClass = "relative w-full rounded-lg border transition-all duration-200";
  const buttonActiveClass = "border-blue-500 text-blue-500"; 
  const buttonInactiveClass = "border-[#333] text-[var(--text)] hover:border-blue-500/30 hover:bg-blue-500/5";

  return (
    <div className="w-full bg-[#1e1e1e] rounded-lg p-3 border border-[#333] shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-white`}>Aspect Ratio</h3>
      </div>
      
      {/* Preview area with gradient background */}
      <div className="flex justify-center mb-4">
        <div className={`relative ${isMobile ? 'w-28 h-28' : 'w-36 h-36'} flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-md shadow-inner`}>
          <div className="absolute inset-0 border border-dashed border-[#555] rounded-md"></div>
          <div 
            className="bg-[#2a2a2c]/30 backdrop-blur-sm border-2 border-blue-500 rounded-md flex items-center justify-center shadow-lg transition-all duration-300"
            style={{
              width: calculatePreviewWidth(selectedRatioObj),
              height: calculatePreviewHeight(selectedRatioObj),
              maxWidth: '120px',
              maxHeight: '120px'
            }}
          >
            <span className={`text-white font-medium drop-shadow-md ${isMobile ? 'text-xs' : ''}`}>
              {selectedRatioObj.id}
            </span>
          </div>
        </div>
      </div>
      
      {/* Option buttons in a grid */}
      <div className="grid grid-cols-3 gap-2">
        {VIDEO_ASPECT_RATIOS.map(ratio => {
          return (
            <button
              key={ratio.id}
              onClick={() => handleSelect(ratio.id)}
              className={`${buttonBaseClass} p-3 flex flex-col items-center justify-center ${
                selectedRatio === ratio.id 
                  ? buttonActiveClass 
                  : buttonInactiveClass
              }`}
            >
              <div className="text-lg font-bold mb-1">{ratio.id}</div>
              <div className="text-xs text-center opacity-70">
                {ratio.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VideoAspectRatioSelector;