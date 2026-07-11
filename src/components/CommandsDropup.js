import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Minimize2, LayoutPanelLeft, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CommandsDropup.css';

const CommandsDropup = ({ isOpen, onClose, onInsertCommand, buttonRef, isVideoMode = false }) => {
  const dropupRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [portalContainer, setPortalContainer] = useState(null);

  // Commands configuration
  const standardCommands = [
    {
      command: '/variations',
      description: 'Generate variations of a prompt',
      icon: <Copy className="h-4 w-4 text-blue-500" />,
    },
    {
      command: '/shorten',
      description: 'Create a shorter version of a prompt',
      icon: <Minimize2 className="h-4 w-4 text-green-500" />,
    },
    {
      command: '/extend',
      description: 'Add more details to a prompt',
      icon: <LayoutPanelLeft className="h-4 w-4 text-purple-500" />,
    }
  ];
  
  const videoCommands = [
    {
      command: '/variations',
      description: 'Generate variations of a video prompt',
      icon: <Copy className="h-4 w-4 text-blue-500" />,
    },
    {
      command: '/shorten',
      description: 'Create a shorter version of a video prompt',
      icon: <Minimize2 className="h-4 w-4 text-green-500" />,
    },
    {
      command: '/nextscene',
      description: 'Continue this scene with what happens next',
      icon: <Film className="h-4 w-4 text-purple-500" />,
    }
  ];
  
  const commands = isVideoMode ? videoCommands : standardCommands;

  // Create portal container once
  useEffect(() => {
    let div = document.getElementById('commands-dropup-portal');
    
    if (!div) {
      div = document.createElement('div');
      div.setAttribute('id', 'commands-dropup-portal');
      div.style.position = 'fixed';
      div.style.top = '0';
      div.style.left = '0';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.zIndex = window.innerWidth < 640 ? '10000' : '9999'; // Higher z-index on mobile
      div.style.pointerEvents = 'none';
      div.style.overflow = 'hidden'; // Prevent scrolling issues on mobile
      div.setAttribute('data-mobile', window.innerWidth < 640 ? 'true' : 'false');
      document.body.appendChild(div);
     
    }
    
    setPortalContainer(div);

    return () => {
      const existingDiv = document.getElementById('commands-dropup-portal');
      if (existingDiv && existingDiv === div) {
        try {
          document.body.removeChild(div);
         
        } catch (e) {
        
        }
      }
    };
  }, []);

  // Calculate position immediately when opened
  const calculatePosition = () => {
    const buttonEl = document.getElementById('command-button') || 
                    document.getElementById('command-button-mobile') || 
                    buttonRef?.current;
    
    if (!buttonEl) {
     
      return null;
    }
    
    const buttonRect = buttonEl.getBoundingClientRect();
    if (buttonRect.width === 0 || buttonRect.height === 0) {
     
      return null;
    }
    
    const isMobile = window.innerWidth < 640;
    const menuHeight = commands.length * 60 + 20; // 60px per command + padding
    const menuWidth = isMobile ? Math.min(280, window.innerWidth - 20) : 256;
    
    let top, left;
    
    if (isMobile) {
      // Mobile positioning - relative to button with safe boundaries
      const spacing = 15;
      
      // Try to position above the button first
      top = buttonRect.top - menuHeight - spacing;
      
      // If there's not enough space above, position below
      if (top < 20) {
        top = buttonRect.bottom + spacing;
        // Make sure it doesn't go off the bottom of the screen
        if (top + menuHeight > window.innerHeight - 20) {
          top = window.innerHeight - menuHeight - 20;
        }
      }
      
      // Center horizontally relative to button, with screen boundaries
      left = buttonRect.left + (buttonRect.width / 2) - (menuWidth / 2);
      left = Math.max(10, Math.min(left, window.innerWidth - menuWidth - 10));
      
    } else {
      // Desktop: position above button, centered
      // Add extra spacing in video mode to account for layout differences
      const extraSpacing = isVideoMode ? 20 : 10;
      top = buttonRect.top - menuHeight - extraSpacing;
      left = buttonRect.left + (buttonRect.width / 2) - (menuWidth / 2);
      
      // Boundary checks - ensure minimum distance from top
      top = Math.max(15, top);
      left = Math.max(10, Math.min(left, window.innerWidth - menuWidth - 10));
    }
    
   
    
    return {
      top,
      left,
      isMobile,
      menuWidth,
      buttonCenterX: isMobile ? 0 : buttonRect.width / 2
    };
  };

  // Calculate position only when opening - keep position during closing for smooth exit
  useEffect(() => {
   
    if (isOpen && !position) {
      const pos = calculatePosition();
    
      
      // If position calculation failed, provide a fallback for mobile
      if (!pos && window.innerWidth < 640) {
       
        const fallbackPosition = {
          top: 100,
          left: Math.max(10, (window.innerWidth - 280) / 2),
          isMobile: true,
          menuWidth: Math.min(280, window.innerWidth - 20),
          buttonCenterX: 0
        };
        setPosition(fallbackPosition);
      } else {
        setPosition(pos);
      }
    }
  }, [isOpen, commands.length]);

  // Update position on resize (only if open)
  useEffect(() => {
    if (!isOpen) return;
    
    const handleResize = () => {
      const pos = calculatePosition();
      setPosition(pos);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, commands.length]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      // Check if we clicked on the command button itself
      const commandButton = document.getElementById('command-button') || 
                          document.getElementById('command-button-mobile');
      
      if (commandButton && commandButton.contains(event.target)) {
        return; // Don't close if clicking the button
      }
      
      if (
        dropupRef.current && 
        !dropupRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    // Small delay to prevent immediate closing
    const timer = setTimeout(() => {
      // Use both mouse and touch events for better mobile support
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }, 100); // Slightly longer delay for mobile

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Don't render until we have portal container and initial position
  if (!portalContainer) {
   
    return null;
  }

  

  return createPortal(
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        // Clear position after exit animation completes
        setPosition(null);
      }}
    >
      {isOpen && position && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/10" 
            style={{ pointerEvents: 'auto' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          
          {/* Dropup menu */}
          <motion.div
            ref={dropupRef}
            className="fixed bg-[var(--cardBackground)] rounded-lg shadow-lg border border-[var(--border)]"
            style={{
              top: position.top,
              left: position.left,
              width: position.menuWidth,
              zIndex: 9999,
              pointerEvents: 'auto'
            }}
            initial={{ 
              opacity: 0, 
              y: 15,
              scale: 0.9
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              y: 8,
              scale: 0.95
            }}
            transition={{ 
              duration: 0.2,
              ease: "easeOut"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              {commands.map((command, index) => (
                <motion.div 
                  key={command.command} 
                  className="flex items-center gap-3 p-2 hover:bg-[var(--dropdownHover)] rounded-md cursor-pointer transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ 
                    delay: isOpen ? index * 0.05 : 0,
                    duration: 0.15
                  }}
                  onClick={() => {
                    onInsertCommand(command.command);
                    onClose();
                  }}
                >
                  <div className="flex-shrink-0">
                    {command.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-sm font-medium text-[var(--text)]">
                      {command.command}
                    </div>
                    <div className="text-xs text-[var(--textSecondary)]">
                      {command.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalContainer
  );
};

export default CommandsDropup;