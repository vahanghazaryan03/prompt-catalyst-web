import React from 'react';
import { Crown } from 'lucide-react';

export const Slider = ({ label, value, onChange, min, max, step, labels, disabled, premium = false, hideLabel = false }) => {
  const renderLabels = () => {
    if (!labels) return null;
    
    // If labels is an array of objects with value and label properties
    if (labels.length > 0 && typeof labels[0] === 'object') {
      return (
        <div className="flex justify-between text-xs text-[var(--textSecondary)] mt-1">
          {labels.map((item) => (
            <span key={item.value} className="whitespace-nowrap">{item.label}</span>
          ))}
        </div>
      );
    }
    
    // If labels is an array of strings
    return (
      <div className="flex justify-between text-xs text-[var(--textSecondary)] mt-1">
        {labels.map((label) => (
          <span key={label} className="whitespace-nowrap">{label}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {!hideLabel && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <label className="block text-sm font-medium text-[var(--textBrighter)]">
              {label}
            </label>
            {premium && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center gap-1">
                <Crown className="h-2.5 w-2.5" />
                Premium
              </span>
            )}
          </div>
          <span className="text-sm text-[var(--primary)] font-medium">
            {value}
          </span>
        </div>
      )}
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`
          w-full h-2 rounded-lg appearance-none cursor-pointer
          bg-[var(--cardBackground)]
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:w-4 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:bg-[var(--primary)]
          [&::-webkit-slider-thumb]:hover:opacity-90
          [&::-webkit-slider-thumb]:transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />

      {renderLabels()}
    </div>
  );
};