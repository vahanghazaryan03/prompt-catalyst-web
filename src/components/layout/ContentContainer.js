import React, { useEffect, useState } from 'react';

/**
 * A container component to provide consistent width and centering for main content views
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - The content to display
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.maxWidth - Maximum width of the container (default: "max-w-7xl")
 * @param {boolean} props.fullHeight - Whether the container should take up full height
 */
const ContentContainer = ({ 
  children, 
  className = "", 
  maxWidth = "max-w-6xl", 
  fullHeight = true 
}) => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  // Listen for resize events to update mobile status
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className={`w-full overflow-hidden ${fullHeight ? 'flex-1 flex flex-col' : ''} ${isMobile ? 'max-h-[calc(100vh-64px)]' : ''}`}>
      <div className={`mx-auto w-full ${maxWidth} ${fullHeight ? 'flex-1 flex flex-col overflow-auto' : ''} ${isMobile ? 'overflow-auto' : ''} ${className}`}>
        {children}
      </div>
    </div>
  );
}; // <- Missing closing brace added here

export default ContentContainer;
