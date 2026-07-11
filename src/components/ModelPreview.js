import React from 'react';
import classNames from 'classnames';

export const ModelPreview = ({
  label,
  value,
  isSelected,
  onClick,
  className
}) => {
  // Get logo image path
  const getLogoPath = () => {
    if (value === 'not_specified') {
      return null;
    }
    return `/previews/models/${value}-preview.png`;
  };

  const logoPath = getLogoPath();

  // Handle click explicitly
  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={classNames(
        'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer',
        'hover:bg-[var(--dropdownHover)]',
        {
          'bg-[var(--background)]': isSelected,
        },
        className
      )}
    >
      {logoPath ? (
        <img
          src={logoPath}
          alt={`${label} logo`}
          className="w-6 h-6 object-contain flex-shrink-0"
          onError={(e) => {
            e.target.src = '/previews/models/placeholder-preview.png';
          }}
        />
      ) : (
        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
          <span className="text-xs text-[var(--textSecondary)]">N/A</span>
        </div>
      )}
      
      <span className={`text-sm ${value === 'not_specified' ? 'text-[var(--textSecondary)]' : 'text-[var(--text)]'}`}>
        {label}
      </span>
    </div>
  );
};