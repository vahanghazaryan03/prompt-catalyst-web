import React from 'react';
import { hasModelExamples } from '../utils/modelExamples';
import ModelExamplesButton from './ModelExamplesButton';

/**
 * Mobile optimized model option component
 */
const MobileModel = ({ modelOption, handleModelChange, model, user, isMobile }) => {
  const Icon = modelOption.icon;
  const isPremiumModel = modelOption.premium;
  const isProOnlyModel = modelOption.proOnly || modelOption.requiresPro;
  // We'll keep Premium model restriction but remove Pro model restriction
  const isDisabled = (modelOption.premium && !user?.isPremium);
  const isNewModel = modelOption.isNew;
  
  return (
    <div
      key={modelOption.value}
      onClick={() => !isDisabled && handleModelChange(modelOption)}
      className={`flex flex-col items-start p-2 rounded-lg border transition-all duration-200 max-w-full overflow-hidden ${
        model === modelOption.value ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} relative h-full ${!isDisabled ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center w-full">
        <Icon size={14} className="mr-1.5 flex-shrink-0" />
        <div className="font-medium text-xs truncate">{modelOption.label}</div>
      </div>
      <div className="text-[10px] opacity-70 mt-1 line-clamp-1 w-full">
        {modelOption.creditCost} credits
      </div>
      
      {isPremiumModel && (
        <span className="absolute top-1 right-1 text-[9px] bg-[var(--primary)] text-black px-1 py-0.5 rounded-sm">
          Premium
        </span>
      )}
      
      {isProOnlyModel && !isPremiumModel && (
        <span className="absolute top-1 right-1 text-[9px] bg-green-500 text-black px-1 py-0.5 rounded-sm">
          Pro
        </span>
      )}
      
      {isNewModel && (
        <span className="absolute top-1 right-10 text-[9px] bg-green-500/20 text-green-400 border border-green-500/30 px-1 py-0.5 rounded-sm font-medium">
          NEW
        </span>
      )}
      
      {/* Use the new ModelExamplesButton component */}
      {hasModelExamples(modelOption.value) && (
        <ModelExamplesButton 
          modelOption={modelOption}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

/**
 * Desktop optimized model option component
 */
const DesktopModel = ({ modelOption, handleModelChange, model, user, isMobile }) => {
  const Icon = modelOption.icon;
  const isPremiumModel = modelOption.premium;
  const isProOnlyModel = modelOption.proOnly || modelOption.requiresPro;
  // We'll keep Premium model restriction but remove Pro model restriction
  const isDisabled = (isPremiumModel && !user?.isPremium);
  const isNewModel = modelOption.isNew;
  
  return (
    <div
      key={modelOption.value}
      onClick={() => !isDisabled && handleModelChange(modelOption)}
      className={`flex items-start gap-3 px-3 py-2 rounded-lg border transition-all duration-200 ${
        model === modelOption.value ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} relative ${!isDisabled ? 'cursor-pointer' : ''}`}
    >
      <Icon size={16} className="mt-0.5" />
      <div className="flex-1 text-left">
        <div className="font-medium text-sm flex items-center">
          {modelOption.label}
          {isNewModel && (
            <span className="ml-2 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-sm text-[10px] font-medium">
              NEW
            </span>
          )}
        </div>
        <div className="text-xs opacity-70 mt-0.5">
          {modelOption.description}
        </div>
      </div>
      
      {isPremiumModel && (
        <span className="absolute top-2 right-2 text-xs bg-[var(--primary)] text-black px-2 py-0.5 rounded">
          Premium
        </span>
      )}
      
      {isProOnlyModel && (
        <span className="absolute top-2 right-2 text-xs bg-green-500 text-black px-2 py-0.5 rounded">
          Pro
        </span>
      )}
      
      {/* Use the new ModelExamplesButton component */}
      {hasModelExamples(modelOption.value) && (
        <ModelExamplesButton 
          modelOption={modelOption}
          isMobile={isMobile}
          position={isProOnlyModel ? "bottom" : "right"}
        />
      )}
    </div>
  );
};

/**
 * ModelOption component that uses different implementations for mobile/desktop
 */
const ModelOption = ({ modelOption, handleModelChange, model, user, isMobile }) => {
  return isMobile ? (
    <MobileModel
      modelOption={modelOption}
      handleModelChange={handleModelChange}
      model={model}
      user={user}
      isMobile={isMobile}
    />
  ) : (
    <DesktopModel
      modelOption={modelOption}
      handleModelChange={handleModelChange}
      model={model}
      user={user}
      isMobile={isMobile}
    />
  );
};

export default ModelOption;