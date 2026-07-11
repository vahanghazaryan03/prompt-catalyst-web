import React from 'react';

export const PremiumBadge = ({ isPro, isUltimate }) => {
  return (
    <div
      className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white 
        ${isUltimate
          ? 'bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500'
          : isPro
            ? 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500'
            : 'bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500'}`}
    >
      <span>{isUltimate ? 'Visionary' : isPro ? 'Pro' : 'Standard'}</span>
    </div>
  );
};
