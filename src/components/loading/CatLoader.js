import React from 'react';
import { motion } from 'framer-motion';

const CatLoader = ({ size = 120 }) => {
  // Calculate sizes based on proportion
  const bodyWidth = size * 0.7;
  const bodyHeight = size * 0.6;
  const headSize = size * 0.4;
  const earSize = size * 0.2;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Container with centered content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Cat body */}
        <motion.div
          className="bg-[var(--primary)] rounded-full relative z-10"
          style={{ width: bodyWidth, height: bodyHeight }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {/* Cat head */}
          <motion.div
            className="absolute bg-[var(--primary)] rounded-full"
            style={{ 
              width: headSize, 
              height: headSize, 
              top: -headSize * 0.4, 
              left: '50%',
              marginLeft: -headSize / 2
            }}
            animate={{
              rotate: [0, -5, 0, 5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {/* Left ear */}
            <motion.div
              className="absolute bg-[var(--primary)] rounded-sm"
              style={{
                width: earSize,
                height: earSize,
                top: -earSize * 0.7,
                left: earSize * 0.3,
                transformOrigin: 'bottom center',
                transform: 'rotate(-30deg)',
              }}
              animate={{
                rotate: [-30, -25, -30],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            
            {/* Right ear */}
            <motion.div
              className="absolute bg-[var(--primary)] rounded-sm"
              style={{
                width: earSize,
                height: earSize,
                top: -earSize * 0.7,
                right: earSize * 0.3,
                transformOrigin: 'bottom center',
                transform: 'rotate(30deg)',
              }}
              animate={{
                rotate: [30, 25, 30],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5,
              }}
            />
            
            {/* Cat face */}
            <div className="absolute" style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              {/* Eyes */}
              <div className="flex space-x-2 mt-1">
                <motion.div
                  className="bg-black rounded-full"
                  style={{ width: headSize * 0.15, height: headSize * 0.15 }}
                  animate={{
                    scaleY: [1, 0.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 5,
                  }}
                />
                <motion.div
                  className="bg-black rounded-full"
                  style={{ width: headSize * 0.15, height: headSize * 0.15 }}
                  animate={{
                    scaleY: [1, 0.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 5,
                  }}
                />
              </div>
              
              {/* Mouth */}
              <div className="mt-2">
                <motion.div
                  className="bg-black rounded-lg"
                  style={{ width: headSize * 0.15, height: headSize * 0.05 }}
                  animate={{
                    width: [headSize * 0.15, headSize * 0.2, headSize * 0.15],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Cat tail */}
          <motion.div
            className="absolute bg-[var(--primary)] rounded-full"
            style={{ 
              width: bodyWidth * 0.15, 
              height: bodyHeight * 0.8, 
              bottom: bodyHeight * 0.2, 
              right: -bodyWidth * 0.1,
              transformOrigin: 'bottom center',
            }}
            animate={{
              rotate: [0, 20, 0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          
          {/* Cat paws */}
          <div className="absolute" style={{ 
            bottom: -bodyHeight * 0.1, 
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
          }}>
            <motion.div
              className="bg-[var(--primary)] rounded-full"
              style={{ width: bodyWidth * 0.2, height: bodyHeight * 0.2 }}
              animate={{
                translateY: [0, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="bg-[var(--primary)] rounded-full"
              style={{ width: bodyWidth * 0.2, height: bodyHeight * 0.2 }}
              animate={{
                translateY: [0, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.7,
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Loading text below the cat */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <motion.div
          className="text-[var(--primary)] text-sm font-medium"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          working...
        </motion.div>
      </div>
    </div>
  );
};

export default CatLoader;