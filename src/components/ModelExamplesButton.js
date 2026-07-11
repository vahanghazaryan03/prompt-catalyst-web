import React, { useState, useRef } from 'react';
import { Eye } from 'lucide-react';
import { hasModelExamples, getModelExamples } from '../utils/modelExamples';
import ModelTooltip from './tooltips/ModelTooltip';

// Main component that shows eye icon & manages tooltip state
const ModelExamplesButton = ({ modelOption, isMobile, position = 'right' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconRef = useRef(null);
  const [iconRect, setIconRect] = useState(null);
  
  const hasExamples = hasModelExamples(modelOption.value);
  
  // Only show the eye icon if the model has examples
  if (!hasExamples) return null;
  
  const handleOpenExamples = () => {
    if (iconRef.current) {
      setIconRect(iconRef.current.getBoundingClientRect());
    }
    setShowTooltip(true);
  };
  
  const handleCloseExamples = () => {
    setShowTooltip(false);
  };

  // Determine position based on props and whether the model is premium
  const positionClass = position === 'right' 
    ? `absolute right-2 ${modelOption.premium || modelOption.proOnly ? 'top-[65%]' : 'top-1/2'} -translate-y-1/2` 
    : `absolute right-3 top-[75%] -translate-y-1/2`;
  
  return (
    <>
      <button 
        ref={iconRef}
        className={`${positionClass} p-1.5 rounded-full hover:bg-[var(--text)]/10 transition-all ${showTooltip ? 'text-[var(--primary)]' : 'text-[var(--text)]/70 hover:text-[var(--text)]'}`}
        title="View examples"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenExamples();
        }}
        onMouseEnter={isMobile ? undefined : handleOpenExamples}
        onMouseLeave={isMobile ? undefined : handleCloseExamples}
      >
        <Eye size={14} />
      </button>
      
      <ModelTooltip
        modelId={modelOption.value}
        modelName={modelOption.label}
        images={getModelExamples(modelOption.value)}
        isVisible={showTooltip}
        referenceRect={iconRect}
        onClose={handleCloseExamples}
        isMobile={isMobile}
      />
    </>
  );
};

export default ModelExamplesButton;