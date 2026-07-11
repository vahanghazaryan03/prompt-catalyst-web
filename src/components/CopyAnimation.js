import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CopyAnimation = ({ isVisible, onAnimationComplete }) => {
  // Animation timing
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
      }, 1200); // Longer duration for the pop animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  // Define confetti colors - using the CSS variable --primary
  const confettiColors = [
    'var(--primary)', // Use the theme's primary color
  ];
  
  // Generate random confetti particles
  const generateConfetti = () => {
    return Array.from({ length: 35 }, (_, i) => { // More particles to compensate for smaller size
      // Generate random properties for each confetti piece - smaller size range
      const size = Math.random() * 2 + 2; // Size between 2-6px (smaller)
      
      // Initial position - tightly clustered in center for the 'pop' effect
      const initialX = (Math.random() - 0.5) * 12; // Very tight cluster
      const initialY = (Math.random() - 0.5) * 12; // Very tight cluster
      
      // Calculate angle for confetti pop direction (full 360 degrees)
      const angle = Math.random() * Math.PI * 2;
      // Distance to travel - varies by particle
      const distance = 40 + Math.random() * 70;
      
      // Final positions - explode outward in all directions
      const finalX = Math.cos(angle) * distance;
      const finalY = Math.sin(angle) * distance - 20; // Slight upward bias
      
      // Random rotation (between -360 and 360 degrees)
      const rotation = (Math.random() - 0.5) * 720;
      
      // Random confetti shape (heavily biased toward circles now)
      const shapeType = Math.random();
      const shape = shapeType > 0.2 ? 'circle' : shapeType > 0.1 ? 'square' : 'rectangle'; // 80% circles
      
      // Random color from our palette
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      
      // No delay for pop effect - everything bursts at once
      const delay = Math.random() * 0.02; // Minimal delay for simultaneous pop
      
      // Longer, varied durations for floating/falling effect after pop
      const duration = 0.7 + Math.random() * 0.5; // Slower (0.7-1.2s)
      
      return {
        id: i,
        size,
        shape,
        color,
        initialX,
        initialY,
        finalX,
        finalY,
        rotation,
        delay,
        duration,
        // Add some particles that are slightly larger
        scale: Math.random() > 0.8 ? 1.5 : 1,
      };
    });
  };

  const confetti = generateConfetti();

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <div 
          className="absolute pointer-events-none select-none" 
          style={{ 
            zIndex: 9999,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          {/* Container positioned relative to the button */}
          <div 
            className="relative w-full h-full"
          >
            {/* Confetti particles */}
            {confetti.map((particle) => {
              // For rectangles, calculate dimensions
              const width = particle.shape === 'rectangle' ? particle.size * 2 : particle.size;
              const height = particle.shape === 'rectangle' ? particle.size : particle.size;
              
              return (
                <motion.div
                  key={particle.id}
                  initial={{ 
                    scale: 0,
                    x: particle.initialX,
                    y: particle.initialY,
                    opacity: 0,
                    rotate: 0,
                  }}
                  animate={{ 
                    scale: [0, particle.scale, particle.scale * 0.95, particle.scale * 0.5, 0],
                    x: [particle.initialX, particle.finalX * 0.6, particle.finalX * 0.8, particle.finalX],
                    y: [particle.initialY, particle.finalY * 0.3, particle.finalY * 0.6, particle.finalY],
                    opacity: [0, 0.95, 0.9, 0.7, 0],
                    rotate: [0, particle.rotation * 0.3, particle.rotation * 0.6, particle.rotation],
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: "easeOut", // Simple ease out for natural motion
                    times: [0, 0.1, 0.4, 0.8, 1], // Pop quickly, then float slowly
                  }}
                  style={{
                    position: 'absolute',
                    width: width,
                    height: height,
                    borderRadius: particle.shape === 'circle' ? '50%' : '40%', // Rounded corners even for squares and rectangles
                    backgroundColor: particle.color,
                    left: '50%',
                    top: '50%',
                    marginLeft: -width/2,
                    marginTop: -height/2,
                    willChange: 'transform, opacity',
                    boxShadow: particle.shape === 'circle' ? `0 0 ${particle.size/3}px rgba(255,255,255,0.2)` : 'none',
                  }}
                />
              );
            })}
            
            {/* Flash effect at start - with faster animation */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 2.2, opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.25, ease: "backOut" }}
              style={{
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CopyAnimation;
