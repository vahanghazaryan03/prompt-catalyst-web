// MidjourneyParams.jsx
import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  X, 
  LayoutTemplate, 
  Wand2, 
  Sliders, 
  Image, 
  Video, 
  Grid2X2, 
  Layout 
} from 'lucide-react';

export const MidjourneyParams = React.memo(function MidjourneyParams({
  onChange,
  parameters = [],
  className = ''
}) {
  const { user } = useAuth();

  // Keep local state for active params
  const [localActiveParams, setLocalActiveParams] = useState(new Set(parameters));
  const [aspectRatio, setAspectRatio] = useState({ width: '', height: '' });

  const handleParameterClick = useCallback((param) => {
    setLocalActiveParams(prev => {
      const newParams = new Set(prev);
      if (newParams.has(param)) {
        newParams.delete(param);
      } else {
        // Remove any conflicting parameters
        if (param.startsWith('--v ') || param === '--niji 6') {
          [...newParams].forEach(p => {
            if (p.startsWith('--v ') || p === '--niji 6') newParams.delete(p);
            if (param !== '--v 6.1' && p === '--q 2') newParams.delete(p);
          });
        } else if (param.startsWith('--q ')) {
          [...newParams].forEach(p => {
            if (p.startsWith('--q ')) newParams.delete(p);
          });
        } else if (param.startsWith('--ar ')) {
          [...newParams].forEach(p => {
            if (p.startsWith('--ar ')) newParams.delete(p);
          });
        } else if (param.startsWith('--s ')) {
          [...newParams].forEach(p => {
            if (p.startsWith('--s ')) newParams.delete(p);
          });
        }
        newParams.add(param);
      }
      onChange(Array.from(newParams));
      return newParams;
    });
  }, [onChange]);

  const isV61Active = [...localActiveParams].some(p => p === '--v 6.1');

  const ParamButton = ({ param, label, icon: Icon }) => (
    <button
      onClick={() => handleParameterClick(param)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${localActiveParams.has(param)
          ? 'bg-[var(--primary)] text-[var(--background)] dark:text-[var(--background)]'
          : 'bg-[var(--background)]/30 text-[var(--text)] hover:bg-[var(--background)]/50'
        }
      `}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </button>
  );

  const ParamGroup = ({ title, icon: Icon, children }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[var(--text)]">
        {Icon && <Icon className="h-4 w-4" />}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <ParamGroup title="Model Version" icon={Wand2}>
       <ParamButton param="--v 7.0" label="V7.0" />
        <ParamButton param="--v 6.1" label="V6.1" />
       
        <ParamButton param="--v 5.2" label="V5.2" />
        <ParamButton param="--v 4" label="V4" />
        <ParamButton param="--niji 6" label="Niji 6" />
      </ParamGroup>

      <ParamGroup title="Quality & Style" icon={Image}>
        {isV61Active && <ParamButton param="--q 2" label="Quality 2" />}
        <ParamButton param="--q 1" label="Quality 1" />
        <ParamButton param="--q 0.5" label="Quality 0.5" />
        <ParamButton param="--q 0.25" label="Quality 0.25" />
        <ParamButton param="--style raw" label="Raw Style" />
        <ParamButton param="--s 100" label="Stylize 100" />
        <ParamButton param="--s 750" label="Stylize 750" />
        <ParamButton param="--s 1000" label="Stylize 1000" />
      </ParamGroup>

      <ParamGroup title="Output Mode" icon={Layout}>
        <ParamButton param="--tile" label="Tile Mode" icon={Grid2X2} />
        <ParamButton param="--video" label="Video" icon={Video} />
      </ParamGroup>

      <ParamGroup title="Creative Controls" icon={Sliders}>
        <ParamButton param="--c 20" label="Chaos 20" />
        <ParamButton param="--c 50" label="Chaos 50" />
        <ParamButton param="--weird 1000" label="Weird 1000" />
        <ParamButton param="--stop 90" label="Stop 90%" />
      </ParamGroup>

      <ParamGroup title="Aspect Ratio" icon={LayoutTemplate}>
        <div className="w-full flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="16"
            placeholder="W"
            value={aspectRatio.width}
            onChange={(e) => setAspectRatio(prev => ({ ...prev, width: e.target.value }))}
            className="w-16 px-2 py-1.5 rounded-lg bg-[var(--cardBackground)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <span className="text-[var(--textSecondary)]">:</span>
          <input
            type="number"
            min="1"
            max="16"
            placeholder="H"
            value={aspectRatio.height}
            onChange={(e) => setAspectRatio(prev => ({ ...prev, height: e.target.value }))}
            className="w-16 px-2 py-1.5 rounded-lg bg-[var(--cardBackground)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <button
            onClick={() => {
              if (aspectRatio.width && aspectRatio.height) {
                handleParameterClick(`--ar ${aspectRatio.width}:${aspectRatio.height}`);
                setAspectRatio({ width: '', height: '' });
              }
            }}
            disabled={!aspectRatio.width || !aspectRatio.height}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${(!aspectRatio.width || !aspectRatio.height)
                ? 'bg-[var(--background)]/20 text-[var(--textSecondary)] cursor-not-allowed'
                : 'bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary)]/90 dark:text-[var(--background)]'
              }`}
          >
            Set Ratio
          </button>
        </div>
      </ParamGroup>

      {localActiveParams.size > 0 && (
        <div className="pt-4 border-t border-[var(--border)]">
          <div className="text-sm text-[var(--textSecondary)]">
            Active Parameters:
            <div className="mt-2 font-mono bg-[var(--background)]/30 p-2 rounded-lg break-all">
              <div className="flex flex-wrap items-center gap-2">
                {[...localActiveParams].map((param) => (
                  <div
                    key={param}
                    className="flex items-center gap-2 bg-[var(--background)]/40 px-2 py-1 rounded-md"
                  >
                    <span>{param}</span>
                    <button
                      onClick={() => handleParameterClick(param)}
                      className="text-[var(--textSecondary)] hover:text-[var(--text)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});