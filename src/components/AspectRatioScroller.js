import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  ASPECT_RATIOS,
  SPECIAL_MODEL_RATIOS, 
  getPixelDimensionsFromRatio, 
  getRatioDimensions,
  getCategoryForRatio,
  getAllRatios
} from '../utils/aspectRatioUtils';

// Helper functions to calculate exaggerated preview dimensions - moved outside components for reusability
const calculatePreviewWidth = (ratioObj) => {
  // Use a lookup table for specific ratios with clearly distinct preview sizes
  const previewWidths = {
    // Portrait ratios (from narrowest to widest)
    '1:2': '38%',  // Very narrow
    '9:16': '45%', // Narrow
    '2:3': '55%',  // Somewhat narrow
    '3:4': '65%',  // Slightly narrow
    '5:6': '75%',  // Almost square but a bit narrower
    
    // Square
    '1:1': '80%',  // Perfect square
    
    // Landscape ratios (from less wide to widest)
    '6:5': '85%',  // Almost square but slightly wider
    '4:3': '90%',  // Slightly wide
    '3:2': '92%',  // Moderately wide
    '16:9': '95%', // Wide
    '2:1': '98%',   // Very wide
    '21:9': '98%'   // Ultra wide
  };
  
  // Check for exact label match first
  const label = ratioObj.label || ratioObj.id;
  // Remove prefixes like 'seedream-' to check against the base ratio
  const baseLabel = label.replace(/^[a-z-]+-/, '');
  
  if (previewWidths[baseLabel]) {
    return previewWidths[baseLabel];
  }
  
  // Fallback to percentage calculation for any ratio not in our lookup
  const width = ratioObj.width || 1;
  const height = ratioObj.height || 1;
  const baseWidth = (width / Math.max(width, height)) * 100;
  return `${baseWidth}%`;
};

const calculatePreviewHeight = (ratioObj) => {
  // Use a lookup table for specific ratios with clearly distinct preview sizes
  const previewHeights = {
    // Landscape ratios (from shortest to tallest)
    '2:1': '38%',  // Very short
    '21:9': '38%', // Ultra wide is also very short
    '16:9': '45%', // Short
    '3:2': '55%',  // Somewhat short
    '4:3': '65%',  // Slightly short
    '6:5': '75%',  // Almost square but a bit shorter
    
    // Square
    '1:1': '80%',  // Perfect square
    
    // Portrait ratios (from less tall to tallest)
    '5:6': '85%',  // Almost square but slightly taller
    '3:4': '90%',  // Slightly tall
    '2:3': '92%',  // Moderately tall
    '9:16': '95%', // Tall
    '1:2': '98%'   // Very tall
  };
  
  // Check for exact label match first
  const label = ratioObj.label || ratioObj.id;
  // Remove prefixes like 'seedream-' to check against the base ratio
  const baseLabel = label.replace(/^[a-z-]+-/, '');
  
  if (previewHeights[baseLabel]) {
    return previewHeights[baseLabel];
  }
  
  // Fallback to percentage calculation for any ratio not in our lookup
  const width = ratioObj.width || 1;
  const height = ratioObj.height || 1;
  const baseHeight = (height / Math.max(width, height)) * 100;
  return `${baseHeight}%`;
};

// Special component for Flux Ultra model
const FluxUltraAspectRatioSelector = ({ selectedRatio, onRatioChange, isMobile }) => {
  // The only two options for Flux Ultra
  const options = [
    { id: '21:9-ultra', label: '21:9', pixelWidth: 2752, pixelHeight: 1536 },
    { id: '9:21-ultra', label: '9:21', pixelWidth: 1536, pixelHeight: 2752 }
  ];

  // Ensure we always have a valid ratio selected
  useEffect(() => {
    // If the current ratio is not one of the valid options, select 21:9 by default
    if (!options.some(option => option.id === selectedRatio)) {
      onRatioChange('21:9-ultra');
    }
  }, [selectedRatio, onRatioChange]);

  // Get ratio object based on selected ID
  const selectedRatioObj = options.find(option => option.id === selectedRatio) || options[0];

  const handleSelect = (ratioId) => {
    onRatioChange(ratioId);
  };

  return (
    <div className="w-full bg-[var(--cardBackground)] rounded-lg p-3 border border-[var(--border)] shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-medium text-[var(--text)]">Image Size</h3>
        </div>
      </div>
      
      {/* Preview area with gradient background - smaller for mobile */}
      <div className="flex justify-center mb-4">
        <div className={`relative ${isMobile ? 'w-20 h-20' : 'w-28 h-28'} flex items-center justify-center bg-gradient-to-br from-[var(--dropdownHover)] to-[var(--inputBackground)] rounded-md shadow-inner`}>
          <div className="absolute inset-0 border border-dashed border-[var(--border)] rounded-md"></div>
          <div 
            className="bg-[var(--inputBackground)]/30 backdrop-blur-sm border-2 border-[var(--primary)] rounded-md flex items-center justify-center shadow-lg transition-all duration-300"
            style={{
              width: `${selectedRatioObj.id === '21:9-ultra' ? 90 : 40}%`,
              height: `${selectedRatioObj.id === '21:9-ultra' ? 40 : 90}%`,
              maxWidth: '120px',
              maxHeight: '120px'
            }}
          >
            <span className={`text-[var(--text)] font-medium drop-shadow-md ${isMobile ? 'text-xs' : ''}`}>
              {selectedRatioObj.label}
            </span>
          </div>
        </div>
      </div>
      
      {/* Large option buttons - adjusted for mobile */}
      <div className="grid grid-cols-2 gap-3">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`flex flex-col items-center justify-center ${isMobile ? 'p-3' : 'p-4'} rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 ${
              selectedRatio === option.id
                ? 'bg-gradient-to-b from-[var(--primary)]/20 to-[var(--primary)]/10 text-[var(--text)] border border-[var(--primary)]/50 shadow-md transform scale-105'
                : 'bg-[var(--inputBackground)] text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] border border-[var(--border)]/50'
            }`}
          >
            <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-1`}>{option.label}</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
              {option.pixelWidth}×{option.pixelHeight}
            </div>
            <div className={`mt-2 ${isMobile ? 'h-12 w-12' : 'h-16 w-16'} flex items-center justify-center`}>
              <div className="bg-[var(--border)]/60 rounded-sm border border-[var(--text)]/20"
                style={{
                  width: option.id === '21:9-ultra' ? '100%' : '40%',
                  height: option.id === '21:9-ultra' ? '40%' : '100%'
                }}
              ></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Standard AspectRatioScroller for all other models
const StandardAspectRatioScroller = ({ selectedRatio, onRatioChange, isPremium = true, isMobile = false }) => {
  const [activeCategory, setActiveCategory] = useState(
    getCategoryForRatio(selectedRatio)
  );
  const scrollerRef = useRef(null);
  
  // Get ratio object based on selected ID
  const selectedRatioObj = getRatioDimensions(selectedRatio);
  
  // Reference for the selected button
  const selectedButtonRef = useRef(null);

  // Create a simple fixed order array with square ratio in the EXACT middle
  const allRatios = useMemo(() => {
    // Guaranteed to have square in exact middle position
    return [
      // Portrait ratios from extreme to moderate - EXACTLY 5 items
      ASPECT_RATIOS.portrait.find(r => r.id === '1:2'),
      ASPECT_RATIOS.portrait.find(r => r.id === '9:16'),
      ASPECT_RATIOS.portrait.find(r => r.id === '2:3'),
      ASPECT_RATIOS.portrait.find(r => r.id === '3:4'),
      ASPECT_RATIOS.portrait.find(r => r.id === '5:6'),
      // Square in the middle (position 5 of 11 total items)
      ASPECT_RATIOS.square[0],
      // Landscape ratios from moderate to extreme - EXACTLY 5 items
      ASPECT_RATIOS.landscape.find(r => r.id === '6:5'),
      ASPECT_RATIOS.landscape.find(r => r.id === '4:3'),
      ASPECT_RATIOS.landscape.find(r => r.id === '3:2'),
      ASPECT_RATIOS.landscape.find(r => r.id === '16:9'),
      ASPECT_RATIOS.landscape.find(r => r.id === '2:1')
    ];
  }, []);

  // Get the index of the current ratio in the combined array
  const currentRatioIndex = useMemo(() => {
    const index = allRatios.findIndex(ratio => ratio?.id === selectedRatio);
    return index >= 0 ? index : 0; // Default to 0 if not found
  }, [allRatios, selectedRatio]);
  
  // Map slider value to ratio index - simplified for fixed array
  const sliderValueToIndex = useCallback((sliderValue) => {
    if (allRatios.length <= 1) return 0; // If only one ratio, return 0
    // Map 0-100 slider value to 0-(allRatios.length-1) index
    const index = Math.round((sliderValue / 100) * (allRatios.length - 1));
    return Math.max(0, Math.min(allRatios.length - 1, index));
  }, [allRatios]);
  
  // Map ratio index to slider value - simplified for fixed array
  const indexToSliderValue = useCallback((index) => {
    if (allRatios.length <= 1) return 50; // If only one ratio, center it at 50
    // Map 0-(allRatios.length-1) index to 0-100 slider value
    return Math.round((index / (allRatios.length - 1)) * 100);
  }, [allRatios]);
  
  // Force slider position update when component mounts or selectedRatio changes
  const [sliderValue, setSliderValue] = useState(50); // Default to center
  
  // Update slider value when selectedRatio changes or on initial mount
  useEffect(() => {
    // Calculate the proper slider position for the current ratio
    const index = allRatios.findIndex(ratio => ratio?.id === selectedRatio);
    if (index >= 0) {
      // Ensure exact step values by using the fixed steps
      const stepSize = 100 / (allRatios.length - 1);
      const exactStepValue = Math.round(index * stepSize);
      setSliderValue(exactStepValue);
    } else if (selectedRatio === '1:1') {
      // Explicitly handle square ratio - should be in the middle (50)
      setSliderValue(50);
    }
  }, [selectedRatio, allRatios]);

  // Scroll the selected button into view when it changes
  useEffect(() => {
    if (selectedButtonRef.current) {
      const container = scrollerRef.current;
      const button = selectedButtonRef.current;
      
      if (container && button) {
        // Calculate scroll position to center the button
        const containerWidth = container.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedRatio]);

  const handleResetClick = () => {
    // Reset to default 1:1 square ratio
    onRatioChange('1:1');
    setActiveCategory('square');
  };

  // Removed scroll function as we no longer have arrow buttons

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Select the first ratio in the category when category is clicked
    onRatioChange(ASPECT_RATIOS[category][0].id);
  };

  const handleRatioClick = useCallback((ratioId) => {
    onRatioChange(ratioId);
    setActiveCategory(getCategoryForRatio(ratioId));
  }, [onRatioChange]);

  // Get pixel dimensions for display
  const pixelDimensions = getPixelDimensionsFromRatio(selectedRatio, 1024);

  return (
    <div className="aspect-ratio-scroller w-full max-w-full bg-[var(--cardBackground)] rounded-lg p-3 border border-[var(--border)] shadow-lg overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-[var(--text)]`}>Image Size</h3>
        <button 
          onClick={handleResetClick}
          className="text-sm text-[var(--text)] hover:text-[var(--primary)] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 rounded-md px-2 py-1"
        >
          Reset
        </button>
      </div>
      
      {/* Preview area with gradient background - smaller for mobile */}
      <div className="flex justify-center mb-4">
        <div className={`relative ${isMobile ? 'w-28 h-28' : 'w-36 h-36'} flex items-center justify-center bg-gradient-to-br from-[var(--dropdownHover)] to-[var(--inputBackground)] rounded-md shadow-inner`}>
          <div className="absolute inset-0 border border-dashed border-[var(--border)] rounded-md"></div>
          <div 
            className="bg-[var(--inputBackground)]/30 backdrop-blur-sm border-2 border-[var(--primary)] rounded-md flex items-center justify-center shadow-lg transition-all duration-300"
            style={{
              // Exaggerate aspect ratio differences for near-square ratios
              width: calculatePreviewWidth(selectedRatioObj),
              height: calculatePreviewHeight(selectedRatioObj),
              maxWidth: '120px',
              maxHeight: '120px'
            }}
          >
            <span className={`text-[var(--text)] font-medium drop-shadow-md ${isMobile ? 'text-xs' : ''}`}>
              {selectedRatioObj.label}
            </span>
          </div>
        </div>
      </div>
      
      {/* Category tabs - kept same size for better touch targets */}
      <div className="flex bg-gradient-to-r from-[var(--inputBackground)] to-[var(--cardBackground)] rounded-lg mb-3 p-1 shadow-md">
        {Object.keys(ASPECT_RATIOS).map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex-1 py-2 text-center rounded-md text-sm font-medium transition-all duration-200 ${
              activeCategory === category 
                ? 'bg-[var(--primary)] text-black shadow-md transform scale-105' 
                : 'text-[var(--text)] hover:text-[var(--primary)] hover:bg-[var(--dropdownHover)]/50'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Scrollable ratio selection - MOBILE OPTIMIZED CONTAINER */}
      <div className="relative">
        
        {/* ADJUSTED FOR MOBILE: Max height and scrollers */}
        <div 
          ref={scrollerRef} 
          className={`flex overflow-x-auto hide-scrollbar py-2 ${isMobile ? 'px-2' : 'px-4'} space-x-3 relative scroll-smooth whitespace-nowrap bg-[var(--inputBackground)]/30 rounded-lg border border-[var(--border)] shadow-inner ${isMobile ? 'max-h-24' : ''}`}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none' 
          }}
        >
          {ASPECT_RATIOS[activeCategory].map(ratio => (
            <button
              key={ratio.id}
              ref={selectedRatio === ratio.id ? selectedButtonRef : null}
              onClick={() => handleRatioClick(ratio.id)}
              className={`flex-shrink-0 ${isMobile ? 'px-2 py-1.5' : 'px-3 py-2'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 overflow-hidden ${isMobile ? 'max-w-[100px]' : ''}
 ${
                selectedRatio === ratio.id
                  ? 'bg-gradient-to-b from-[var(--primary)]/20 to-[var(--primary)]/10 text-[var(--text)] border border-[var(--primary)]/50 shadow-md transform scale-105'
                  : 'bg-[var(--inputBackground)] text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] border border-[var(--border)]/50'
              }`}
            >
              <div className="font-medium">{ratio.label}</div>
              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} mt-1 ${selectedRatio === ratio.id ? 'text-[var(--text)]/90' : 'text-[var(--text)]/80'}`}>
                {getPixelDimensionsFromRatio(ratio.id, 1024).width}×{getPixelDimensionsFromRatio(ratio.id, 1024).height}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Continuous aspect ratio slider - ADJUSTED HEIGHT/SPACING FOR MOBILE */}
      <div className={`${isMobile ? 'mt-3' : 'mt-6'} px-2`}>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          className="w-full appearance-none h-2 bg-[var(--border)] rounded-lg outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              ${sliderValue < 33 ? 'var(--primary)' : 'var(--border)'} 0%, 
              ${sliderValue >= 33 && sliderValue < 67 ? 'var(--primary)' : 'var(--dropdownHover)'} 50%, 
              ${sliderValue >= 67 ? 'var(--primary)' : 'var(--border)'} 100%)`
          }}
          onChange={(e) => {
            try {
              const value = parseInt(e.target.value);
              if (isNaN(value)) return;
              
              // Calculate what "step" we're closest to, ensuring we snap to exact ratios
              // For 11 items (0-10 indices), we want to snap to: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
              const stepSize = 100 / (allRatios.length - 1);
              const nearestStep = Math.round(value / stepSize) * stepSize;
              
              // Update our controlled slider value to the exact step
              setSliderValue(nearestStep);
              
              // Convert the step value to the index
              const newIndex = sliderValueToIndex(nearestStep);
              const newRatio = allRatios[newIndex];
              
              if (newRatio && newRatio.id) {
                handleRatioClick(newRatio.id);
              }
            } catch (err) {
              console.error('Error handling slider change:', err);
            }
          }}
          // Add step property to enforce discrete values
          step={100 / (allRatios.length - 1)}
        />
        
        {/* Remove the tick marks section completely */}
      </div>
    </div>
  );
};

// GPT Image 1 selector with the 3 specific sizes
const GPTImage1AspectRatioSelector = ({ selectedRatio, onRatioChange, isMobile }) => {
  // The only three options for GPT Image 1 - reordered with 1:1 in the middle
  const options = [
    { id: 'gpt-2:3', label: '2:3', pixelWidth: 1024, pixelHeight: 1536 },
    { id: 'gpt-1:1', label: '1:1', pixelWidth: 1024, pixelHeight: 1024 },
    { id: 'gpt-3:2', label: '3:2', pixelWidth: 1536, pixelHeight: 1024 }
  ];

  // Ensure we always have a valid ratio selected
  useEffect(() => {
    // If the current ratio is not one of the valid options, select 1:1 by default
    if (!options.some(option => option.id === selectedRatio)) {
      onRatioChange('gpt-1:1');
    }
  }, [selectedRatio, onRatioChange]);

  // Get ratio object based on selected ID
  const selectedRatioObj = options.find(option => option.id === selectedRatio) || options[0];

  const handleSelect = (ratioId) => {
    onRatioChange(ratioId);
  };

  return (
    <div className="w-full bg-[var(--cardBackground)] rounded-lg p-3 border border-[var(--border)] shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-medium text-[var(--text)]">Image Sizes</h3>
          <p className="text-xs text-[var(--textSecondary)] mt-1">GPT Image model only supports these specific sizes</p>
        </div>
      </div>
      
      {/* Preview area with gradient background - smaller for mobile */}
      <div className="flex justify-center mb-4">
        <div className={`relative ${isMobile ? 'w-20 h-20' : 'w-28 h-28'} flex items-center justify-center bg-gradient-to-br from-[var(--dropdownHover)] to-[var(--inputBackground)] rounded-md shadow-inner`}>
          <div className="absolute inset-0 border border-dashed border-[var(--border)] rounded-md"></div>
          <div 
            className="bg-[var(--inputBackground)]/30 backdrop-blur-sm border-2 border-[var(--primary)] rounded-md flex items-center justify-center shadow-lg transition-all duration-300"
            style={{
              width: `${selectedRatioObj.id === 'gpt-1:1' ? 80 : (selectedRatioObj.id === 'gpt-3:2' ? 90 : 60)}%`,
              height: `${selectedRatioObj.id === 'gpt-1:1' ? 80 : (selectedRatioObj.id === 'gpt-2:3' ? 90 : 60)}%`,
              maxWidth: '120px',
              maxHeight: '120px'
            }}
          >
            <span className={`text-[var(--text)] font-medium drop-shadow-md ${isMobile ? 'text-xs' : ''}`}>
              {selectedRatioObj.label}
            </span>
          </div>
        </div>
      </div>
      
      {/* Option buttons in a grid */}
      <div className="grid grid-cols-3 gap-3">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`flex flex-col items-center justify-center ${isMobile ? 'p-2' : 'p-3'} rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 ${
              selectedRatio === option.id
                ? 'bg-gradient-to-b from-[var(--primary)]/20 to-[var(--primary)]/10 text-[var(--text)] border border-[var(--primary)]/50 shadow-md transform scale-105'
                : 'bg-[var(--inputBackground)] text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] border border-[var(--border)]/50'
            }`}
          >
            <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-1`}>{option.label}</div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
              {option.pixelWidth}×{option.pixelHeight}
            </div>
            <div className={`mt-2 ${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center`}>
              <div className="bg-[var(--border)]/60 rounded-sm border border-[var(--text)]/20"
                style={{
                  width: option.id === 'gpt-1:1' ? '80%' : (option.id === 'gpt-3:2' ? '90%' : '60%'),
                  height: option.id === 'gpt-1:1' ? '80%' : (option.id === 'gpt-2:3' ? '90%' : '60%')
                }}
              ></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Seedream 4.0 selector with scroller interface
const Seedream4AspectRatioSelector = ({ selectedRatio, onRatioChange, isMobile }) => {
  // Seedream 4.0 specific aspect ratios organized by category
  const SEEDREAM_RATIOS = {
    portrait: [
      { id: 'seedream-9:16', label: '9:16', width: 9, height: 16, pixelWidth: 1440, pixelHeight: 2560 },
      { id: 'seedream-2:3', label: '2:3', width: 2, height: 3, pixelWidth: 1664, pixelHeight: 2496 },
      { id: 'seedream-3:4', label: '3:4', width: 3, height: 4, pixelWidth: 1728, pixelHeight: 2304 }
    ],
    square: [
      { id: 'seedream-1:1', label: '1:1', width: 1, height: 1, pixelWidth: 1024, pixelHeight: 1024 }
    ],
    landscape: [
      { id: 'seedream-4:3', label: '4:3', width: 4, height: 3, pixelWidth: 2304, pixelHeight: 1728 },
      { id: 'seedream-3:2', label: '3:2', width: 3, height: 2, pixelWidth: 2496, pixelHeight: 1664 },
      { id: 'seedream-16:9', label: '16:9', width: 16, height: 9, pixelWidth: 2560, pixelHeight: 1440 },
      { id: 'seedream-21:9', label: '21:9', width: 21, height: 9, pixelWidth: 3024, pixelHeight: 1296 }
    ]
  };

  // Get category for a given ratio
  const getCategoryForSeedreamRatio = (ratioId) => {
    if (SEEDREAM_RATIOS.portrait.some(r => r.id === ratioId)) return 'portrait';
    if (SEEDREAM_RATIOS.square.some(r => r.id === ratioId)) return 'square';
    if (SEEDREAM_RATIOS.landscape.some(r => r.id === ratioId)) return 'landscape';
    return 'square'; // Default
  };

  const [activeCategory, setActiveCategory] = useState(() => {
    // Initialize with the correct category, defaulting to 'square' if ratio is invalid
    const initialCategory = getCategoryForSeedreamRatio(selectedRatio);
    return initialCategory;
  });
  const scrollerRef = useRef(null);
  const selectedButtonRef = useRef(null);

  // Create a flat array of all ratios for slider functionality
  const allSeedreamRatios = useMemo(() => {
    return [
      ...SEEDREAM_RATIOS.portrait,
      ...SEEDREAM_RATIOS.square,
      ...SEEDREAM_RATIOS.landscape
    ];
  }, []);

  // Get the current ratio object
  const selectedRatioObj = useMemo(() => {
    const found = allSeedreamRatios.find(r => r.id === selectedRatio);
    return found || SEEDREAM_RATIOS.square[0];
  }, [selectedRatio, allSeedreamRatios]);

  // Get the index of the current ratio in the combined array
  const currentRatioIndex = useMemo(() => {
    const index = allSeedreamRatios.findIndex(ratio => ratio?.id === selectedRatio);
    return index >= 0 ? index : 3; // Default to square (index 3)
  }, [allSeedreamRatios, selectedRatio]);

  // Slider value state - initialized to 50 for centered 1:1 (will be adjusted in useEffect if needed)
  const [sliderValue, setSliderValue] = useState(50);

  // Map slider value to ratio index with special handling for centered 1:1
  const sliderValueToIndex = useCallback((sliderValue) => {
    if (allSeedreamRatios.length <= 1) return 0;
    
    // Special mapping to ensure 1:1 (index 3) is at 50%
    let index;
    if (sliderValue <= 42.5) {
      // Map 0-42.5% to indices 0-2 (portrait ratios)
      index = Math.round((sliderValue / 42.5) * 2);
    } else if (sliderValue >= 42.5 && sliderValue <= 57.5) {
      // Map 42.5-57.5% to index 3 (square ratio)
      index = 3;
    } else {
      // Map 57.5-100% to indices 4-7 (landscape ratios)
      index = 4 + Math.round(((sliderValue - 57.5) / 42.5) * 3);
    }
    
    return Math.max(0, Math.min(allSeedreamRatios.length - 1, index));
  }, [allSeedreamRatios]);

  // Map ratio index to slider value
  const indexToSliderValue = useCallback((index) => {
    if (allSeedreamRatios.length <= 1) return 50;
    return Math.round((index / (allSeedreamRatios.length - 1)) * 100);
  }, [allSeedreamRatios]);

  // Ensure we always have a valid ratio selected
  useEffect(() => {
    if (!allSeedreamRatios.some(option => option.id === selectedRatio)) {
      onRatioChange('seedream-1:1');
      setSliderValue(50); // Make sure slider is centered when defaulting to 1:1
    }
  }, [selectedRatio, onRatioChange, allSeedreamRatios]);

  // Update slider value when selectedRatio changes
  useEffect(() => {
    // Special handling to ensure 1:1 is exactly at 50% (middle)
    if (selectedRatio === 'seedream-1:1') {
      setSliderValue(50);
    } else {
      const index = allSeedreamRatios.findIndex(ratio => ratio?.id === selectedRatio);
      if (index >= 0) {
        // Adjust the mapping so that index 3 (1:1) maps to 50
        // We have 8 ratios (0-7), and we want index 3 to be at 50%
        let mappedValue;
        if (index < 3) {
          // Portrait ratios: map indices 0-2 to 0-42.5%
          mappedValue = (index / 3) * 42.5;
        } else if (index === 3) {
          // Square ratio: exactly at 50%
          mappedValue = 50;
        } else {
          // Landscape ratios: map indices 4-7 to 57.5-100%
          mappedValue = 57.5 + ((index - 4) / 3) * 42.5;
        }
        setSliderValue(Math.round(mappedValue));
      }
    }
  }, [selectedRatio, allSeedreamRatios]);

  // Scroll the selected button into view when it changes
  useEffect(() => {
    if (selectedButtonRef.current) {
      const container = scrollerRef.current;
      const button = selectedButtonRef.current;
      
      if (container && button) {
        const containerWidth = container.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedRatio]);

  const handleResetClick = () => {
    onRatioChange('seedream-1:1');
    setActiveCategory('square');
    setSliderValue(50); // Ensure slider goes to exact middle
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    // Select the first ratio in the category when category is clicked
    onRatioChange(SEEDREAM_RATIOS[category][0].id);
  };

  const handleRatioClick = useCallback((ratioId) => {
    onRatioChange(ratioId);
    setActiveCategory(getCategoryForSeedreamRatio(ratioId));
  }, [onRatioChange]);

  return (
    <div className="aspect-ratio-scroller w-full max-w-full bg-[var(--cardBackground)] rounded-lg p-3 border border-[var(--border)] shadow-lg overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-[var(--text)]`}>Image Size</h3>
          <p className="text-xs text-[var(--textSecondary)] mt-0.5">Seedream 4.0 optimized resolutions</p>
        </div>
        <button 
          onClick={handleResetClick}
          className="text-sm text-[var(--text)] hover:text-[var(--primary)] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 rounded-md px-2 py-1"
        >
          Reset
        </button>
      </div>
      
      {/* Preview area with gradient background */}
      <div className="flex justify-center mb-4">
        <div className={`relative ${isMobile ? 'w-28 h-28' : 'w-36 h-36'} flex items-center justify-center bg-gradient-to-br from-[var(--dropdownHover)] to-[var(--inputBackground)] rounded-md shadow-inner`}>
          <div className="absolute inset-0 border border-dashed border-[var(--border)] rounded-md"></div>
          <div 
            className="bg-[var(--inputBackground)]/30 backdrop-blur-sm border-2 border-[var(--primary)] rounded-md flex items-center justify-center shadow-lg transition-all duration-300"
            style={{
              width: calculatePreviewWidth(selectedRatioObj),
              height: calculatePreviewHeight(selectedRatioObj),
              maxWidth: '120px',
              maxHeight: '120px'
            }}
          >
            <span className={`text-[var(--text)] font-medium drop-shadow-md ${isMobile ? 'text-xs' : ''}`}>
              {selectedRatioObj.label}
            </span>
          </div>
        </div>
      </div>
      
      {/* Category tabs */}
      <div className="flex bg-gradient-to-r from-[var(--inputBackground)] to-[var(--cardBackground)] rounded-lg mb-3 p-1 shadow-md">
        {Object.keys(SEEDREAM_RATIOS).map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex-1 py-2 text-center rounded-md text-sm font-medium transition-all duration-200 ${
              activeCategory === category 
                ? 'bg-[var(--primary)] text-black shadow-md transform scale-105' 
                : 'text-[var(--text)] hover:text-[var(--primary)] hover:bg-[var(--dropdownHover)]/50'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Scrollable ratio selection */}
      <div className="relative">
        <div 
          ref={scrollerRef} 
          className={`flex overflow-x-auto hide-scrollbar py-2 ${isMobile ? 'px-2' : 'px-4'} space-x-3 relative scroll-smooth whitespace-nowrap bg-[var(--inputBackground)]/30 rounded-lg border border-[var(--border)] shadow-inner ${isMobile ? 'max-h-24' : ''}`}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none' 
          }}
        >
          {SEEDREAM_RATIOS[activeCategory].map(ratio => (
            <button
              key={ratio.id}
              ref={selectedRatio === ratio.id ? selectedButtonRef : null}
              onClick={() => handleRatioClick(ratio.id)}
              className={`flex-shrink-0 ${isMobile ? 'px-2 py-1.5' : 'px-3 py-2'} rounded-md ${isMobile ? 'text-xs' : 'text-sm'} font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 overflow-hidden ${isMobile ? 'max-w-[100px]' : ''}
 ${
                selectedRatio === ratio.id
                  ? 'bg-gradient-to-b from-[var(--primary)]/20 to-[var(--primary)]/10 text-[var(--text)] border border-[var(--primary)]/50 shadow-md transform scale-105'
                  : 'bg-[var(--inputBackground)] text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] border border-[var(--border)]/50'
              }`}
            >
              <div className="font-medium">{ratio.label}</div>
              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} mt-1 ${selectedRatio === ratio.id ? 'text-[var(--text)]/90' : 'text-[var(--text)]/80'}`}>
                {ratio.pixelWidth}×{ratio.pixelHeight}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Continuous aspect ratio slider */}
      <div className={`${isMobile ? 'mt-3' : 'mt-6'} px-2`}>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          className="w-full appearance-none h-2 bg-[var(--border)] rounded-lg outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              ${sliderValue < 42.5 ? 'var(--primary)' : 'var(--border)'} 0%, 
              ${sliderValue >= 42.5 && sliderValue <= 57.5 ? 'var(--primary)' : 'var(--dropdownHover)'} 50%, 
              ${sliderValue > 57.5 ? 'var(--primary)' : 'var(--border)'} 100%)`
          }}
          onChange={(e) => {
            try {
              const value = parseInt(e.target.value);
              if (isNaN(value)) return;
              
              setSliderValue(value);
              
              const newIndex = sliderValueToIndex(value);
              const newRatio = allSeedreamRatios[newIndex];
              
              if (newRatio && newRatio.id) {
                handleRatioClick(newRatio.id);
              }
            } catch (err) {
              console.error('Error handling slider change:', err);
            }
          }}
          step={1}
        />
      </div>
    </div>
  );
};

// Main AspectRatioScroller component that decides which version to render
const AspectRatioScroller = (props) => {
  const { modelType, isMobile } = props;
  
  // Check if we should use one of the specialized selectors
  if (modelType === 'flux-pro-1.1-ultra') {
    return <FluxUltraAspectRatioSelector {...props} isMobile={isMobile} />;
  } else if (modelType === 'gpt-image-1') {
    return <GPTImage1AspectRatioSelector {...props} isMobile={isMobile} />;
  } else if (modelType === 'seedream-4.0') {
    return <Seedream4AspectRatioSelector {...props} isMobile={isMobile} />;
  }
  
  // Otherwise use the standard scroller
  return <StandardAspectRatioScroller {...props} isMobile={isMobile} />;
};

export default AspectRatioScroller;