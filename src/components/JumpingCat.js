import React from 'react';
import { motion } from 'framer-motion';

const JumpingCat = () => {
  return (
    <motion.div
      className="w-24 h-24 relative"
      initial={{ 
        rotate: 15,
        scale: 0.6,
        opacity: 0,
        x: -40
      }}
      animate={{
        scale: 1,
        opacity: 1,
        x: 0
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        opacity: { duration: 0.3 }
      }}
      style={{ transformOrigin: 'center center' }}
    >
      <motion.div
        animate={{
          y: [-15, 5],
          rotate: -20,
        }}
        transition={{
          y: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            // Delay the bouncing animation until the entrance is complete
            delay: 0.3
          },
          rotate: {
            duration: 0
          }
        }}
      >
        <motion.img 
          src="/mascot.png"
          alt="Cute mascot"
          className="w-full h-full object-contain"
        />
      </motion.div>
    </motion.div>
  );
};

export default JumpingCat;