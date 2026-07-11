export const LoadingAnimation = ({ 
  message = 'Generating prompts', 
  variant = 'default',  
  className = '' 
}) => {
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-3 text-[var(--textSecondary)] py-2 ${className}`}>
        <div className="relative w-4 h-4">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-[spin_0.6s_linear_infinite]" />
          <div className="absolute inset-0 rounded-full border border-[var(--primary)] opacity-20" />
        </div>
        <span className="text-sm font-medium tracking-wide">{message}</span>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-[spin_0.6s_linear_infinite]" />
          <div className="absolute inset-0 rounded-full border border-[var(--primary)] opacity-20" />
        </div>
      </div>
    );
  }

  // Default variant with more refined animation
  return (
    <div className={`w-full max-w-[80%] py-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative w-5 h-5">
          {/* Main spinning border */}
          <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-[spin_0.6s_linear_infinite]" />
          {/* Static background ring for depth */}
          <div className="absolute inset-0 rounded-full border border-[var(--primary)] opacity-20" />
          {/* Optional subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-5 blur-sm" />
        </div>
        <div className="flex items-center gap-[2px]">
          <span className="text-[var(--text)] font-medium tracking-wide">{message}</span>
          <span className="inline-flex items-center">
            <span className="animate-[fadeInOut_1.4s_infinite] opacity-0">.</span>
            <span className="animate-[fadeInOut_1.4s_0.2s_infinite] opacity-0">.</span>
            <span className="animate-[fadeInOut_1.4s_0.4s_infinite] opacity-0">.</span>
          </span>
        </div>
      </div>
    </div>
  );
};