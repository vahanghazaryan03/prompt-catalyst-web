import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const DropdownPortal = ({ children, buttonRef, isOpen, onClose }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const button = buttonRef.current;
      const dropdown = dropdownRef.current;
      
      if (!button || !dropdown) return;

      const buttonRect = button.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate available space in different directions
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const spaceRight = viewportWidth - buttonRect.left;
      
      // Determine if dropdown should appear above/below and left/right
      const shouldShowAbove = spaceBelow < dropdownRect.height && spaceAbove > dropdownRect.height;
      const shouldAlignRight = spaceRight < dropdownRect.width;
      
      // Position the dropdown
      dropdown.style.position = 'fixed';
      
      // Horizontal positioning
      if (shouldAlignRight) {
        dropdown.style.right = `${viewportWidth - (buttonRect.right)}px`;
        dropdown.style.left = 'auto';
      } else {
        dropdown.style.left = `${buttonRect.left}px`;
        dropdown.style.right = 'auto';
      }
      
      // Vertical positioning
      if (shouldShowAbove) {
        dropdown.style.bottom = `${viewportHeight - buttonRect.top}px`;
        dropdown.style.top = 'auto';
      } else {
        dropdown.style.top = `${buttonRect.bottom + 4}px`; // Add 4px gap
        dropdown.style.bottom = 'auto';
      }
    };

    // Handle click outside
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    // Update position initially and on scroll/resize
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, buttonRef, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      ref={dropdownRef} 
      className="fixed z-50 max-w-[90vw] shadow-lg"
      style={{ maxHeight: 'calc(100vh - 20px)' }}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;