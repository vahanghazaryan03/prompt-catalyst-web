import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkle, 
  Palette, 
  Wand2, 
  Zap, 
  Stars, 
  Lightbulb, 
  Rocket,
  Sparkles,
  FlaskConical,
  Atom
} from 'lucide-react';

// Function to lighten or darken a color
const shadeColor = (color, percent) => {
  let R = parseInt(color.substring(1,3), 16);
  let G = parseInt(color.substring(3,5), 16);
  let B = parseInt(color.substring(5,7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;  
  G = (G < 255) ? G : 255;  
  B = (B < 255) ? B : 255;  

  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
};

// Enhanced TypewriterText with subtle effects
const TypewriterText = ({ text, onComplete, color = "#42f56f" }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50 + Math.random() * 30); // Varying typing speed for more human feel

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      // Subtle glow effect when completed typing
      setIsFading(true);
      setTimeout(() => {
        onComplete();
        setIsFading(false);
      }, 500);
    }
  }, [currentIndex, text, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsFading(false);
  }, [text]);

  return (
    <motion.span 
      style={{ color: isFading ? shadeColor(color, 30) : color }}
      className="text-sm font-medium"
      animate={isFading ? { 
        textShadow: [`0 0 0px ${color}`, `0 0 8px ${color}`, `0 0 0px ${color}`]
      } : {}}      
      transition={{ duration: 1 }}
    >
      {displayedText}
      <motion.span 
        className="inline-block w-[2px] h-[14px] ml-[2px]"
        style={{ backgroundColor: color }}
        animate={{ opacity: [1, 0], height: ['14px', '10px', '14px'] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    </motion.span>
  );
};

// Enhanced floating particle with word fragments to represent prompt engineering
const FloatingParticle = ({ color = "#42f56f" }) => {
  // Generate position that avoids the center (25%-75% range)
  const generateNonCenterPosition = () => {
    // Create positions that avoid the 40%-60% center region
    const pos = Math.random() * 100;
    if (pos > 40 && pos < 60) {
      // If in center region, push to either side
      return pos < 50 ? 30 + Math.random() * 10 : 60 + Math.random() * 10;
    }
    return pos;
  };
  
  const randomX = generateNonCenterPosition();
  const randomY = generateNonCenterPosition();
  const size = 1 + Math.random() * 2;
  const duration = 1 + Math.random() * 2;
  
  // Small chance to render a word fragment instead of a particle
  const isWord = Math.random() > 0.7;
  const wordFragments = ["vibrant", "dream", "art", "sharp", "style", "4k", "fantasy", "detail"];
  const wordFragment = wordFragments[Math.floor(Math.random() * wordFragments.length)];
  
  if (isWord) {
    return (
      <motion.div
        className="absolute text-[8px] font-mono"
        style={{ color: `${color}66` }}
        initial={{ 
          x: `${randomX}%`, 
          y: `${randomY}%`,
          opacity: 0,
          scale: 0
        }}
        animate={{ 
          opacity: [0, 0.6, 0],
          scale: [0, 1, 0],
          y: [`${randomY}%`, `${randomY - 20}%`]
        }}
        transition={{ 
          duration: duration * 1.5,
          ease: "easeInOut"
        }}
      >
        {wordFragment}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className="absolute rounded-full"
      initial={{ 
        x: `${randomX}%`, 
        y: `${randomY}%`,
        opacity: 0,
        scale: 0
      }}
      animate={{ 
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0],
        y: [`${randomY}%`, `${randomY - 15}%`]
      }}
      transition={{ 
        duration: duration,
        ease: "easeInOut"
      }}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        backgroundColor: color
      }}
    />
  );
};

// Enhanced sparkle component with image style keywords
const TinySparkle = ({ delay = 0 }) => {
  const randomX = Math.random() * 120 - 10; // -10% to 110%
  const randomY = Math.random() * 120 - 10;
  const size = 2 + Math.random() * 3;
  
  // Occasionally show mini image style keywords
  const isKeyword = Math.random() > 0.6;
  const styleKeywords = ["HDR", "film", "neon", "bokeh", "macro", "surreal"];
  const keyword = styleKeywords[Math.floor(Math.random() * styleKeywords.length)];
  
  if (isKeyword) {
    // Random color from a palette of artistic colors
    const colors = ["#f5e642", "#f59142", "#f54242", "#f542d1", "#4287f5", "#42d1f5"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <motion.div
        className="absolute"
        style={{ left: `${randomX}%`, top: `${randomY}%` }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
        }}
        transition={{ 
          duration: 1.2,
          delay: delay,
          ease: "easeOut"
        }}
      >
        <div 
          className="text-[7px] font-bold px-1 rounded-sm"
          style={{ color: color, backgroundColor: `${color}20` }}
        >
          {keyword}
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className="absolute"
      style={{ left: `${randomX}%`, top: `${randomY}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        rotate: [0, 90]
      }}
      transition={{ 
        duration: 0.8,
        delay: delay,
        ease: "easeOut"
      }}
    >
      <Sparkles 
        size={size} 
        className="text-[#42f56f]" 
        strokeWidth={1.5} 
      />
    </motion.div>
  );
};

const PromptGenerationLoading = ({ color = "#42f56f" }) => {
  const [phase, setPhase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [particles, setParticles] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [orbColor, setOrbColor] = useState(0);

  // Image prompt engineering focused phases
  const phases = [
    { icon: Brain, text: "Analyzing image context..." },
    { icon: Palette, text: "Finding the perfect words..." },
    { icon: Lightbulb, text: "Crafting visual concepts..." },
    { icon: Sparkles, text: "Enhancing descriptive details..." },
    { icon: Wand2, text: "Optimizing prompt structure..." },
    { icon: Stars, text: "Adding artistic nuance..." },
    { icon: Rocket, text: "Preparing for image creation..." }
  ];

  // Color gradient keyframes for the orb - artistic palette colors
  const orbColors = [
    `from-[${color}]/20 to-[${color === "#42f56f" ? "#31db8a" : "#2b74e0"}]/20`, // Base color
    'from-[#f5e642]/20 to-[#dbb531]/20', // Yellow gold
    'from-[#f59142]/20 to-[#db5e31]/20', // Orange
    'from-[#f54242]/20 to-[#db314e]/20', // Red
    'from-[#f542d1]/20 to-[#a831db]/20', // Purple
    `from-[${color}]/20 to-[${color === "#42f56f" ? "#31db8a" : "#2b74e0"}]/20`, // Back to base color
    'from-[#42d1f5]/20 to-[#31a8db]/20', // Cyan
  ];

  useEffect(() => {
    let interval;
    if (isTypingComplete) {
      interval = setInterval(() => {
        setIsVisible(false);
        setTimeout(() => {
          setPhase((prev) => (prev + 1) % phases.length);
          setOrbColor((prev) => (prev + 1) % orbColors.length);
          setIsVisible(true);
          setIsTypingComplete(false);
        }, 300);
      }, 2000);
    }

    const hintTimer = setTimeout(() => {
      setShowHint(true);
    }, 5000);

    return () => {
      if (interval) clearInterval(interval);
      clearTimeout(hintTimer);
    };
  }, [isTypingComplete, phases.length, orbColors.length]);

  // Randomly generate floating particles inside the orb
  useEffect(() => {
    const particleInterval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance to generate a particle
        setParticles(prev => [...prev, Date.now()]);
        setTimeout(() => {
          setParticles(prev => prev.slice(1));
        }, 2000);
      }
    }, 300);

    return () => clearInterval(particleInterval);
  }, []);

  // Generate sparkles occasionally
  useEffect(() => {
    const sparkleInterval = setInterval(() => {
      if (Math.random() > 0.7 && isTypingComplete) { // Only show sparkles during "complete" phase
        const newSparkle = {
          id: Date.now(),
          delay: Math.random() * 0.5
        };
        setSparkles(prev => [...prev, newSparkle]);
        setTimeout(() => {
          setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
        }, 1500);
      }
    }, 400);

    return () => clearInterval(sparkleInterval);
  }, [isTypingComplete]);

  const CurrentIcon = phases[phase].icon;

  return (
    <div className="relative flex items-center justify-start py-4">
      <div className="flex items-center" style={{ minWidth: '280px' }}>
        {/* Central orb with enhanced effects */}
        <div className="relative">
          {/* Ripple circles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{ borderColor: `${color}4D`, width: '60px', height: '60px' }}
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.3, 0.2, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut"
              }}
            />
          ))}

          {/* Enhanced circular progress indicator */}
          <motion.div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[62px] h-[62px]"
          >
            <svg width="62" height="62" viewBox="0 0 62 62">
              {/* Track circle */}
              <circle 
                cx="31" 
                cy="31" 
                r="29" 
                fill="none" 
                stroke="#42f56f" 
                strokeOpacity="0.1" 
                strokeWidth="2"
              />
              
              {/* Progress arc */}
              <motion.circle 
                cx="31" 
                cy="31" 
                r="29" 
                fill="none" 
                stroke="#42f56f" 
                strokeOpacity="0.5" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="182.212"
                strokeDashoffset="182.212"
                animate={{
                  strokeDashoffset: 182.212 - (182.212 * (phase + 1) / phases.length)
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut"
                }}
                transform="rotate(-90 31 31)"
              />
            </svg>
          </motion.div>

          {/* Center orb with color transitions */}
          <motion.div
            className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${orbColors[orbColor]} flex items-center justify-center`}
            animate={{
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Floating particles inside the orb */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              {particles.map(id => (
                <FloatingParticle key={id} color="#42f56f" />
              ))}
            </div>

            {/* Orbital particles that never cross the center */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              animate={{ rotate: 360 }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-[#42f56f]"
                  style={{
                    top: `${Math.sin(i * Math.PI/3) * 30 + 50}%`,
                    left: `${Math.cos(i * Math.PI/3) * 30 + 50}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>

            {/* Thinking "pulse" pattern with image canvas simulation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                background: `radial-gradient(circle, rgba(66, 245, 111, 0.05) 0%, rgba(66, 245, 111, 0.1) 70%, rgba(66, 245, 111, 0.05) 100%)`,
                boxShadow: 'inset 0 0 10px rgba(66, 245, 111, 0.1)'
              }}
              animate={{
                scale: [0.85, 1, 0.85],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }}
            >
              {/* Image canvas grid simulation - avoiding center intersection */}
              <div className="absolute inset-0 overflow-hidden rounded-full opacity-20">
                {/* Horizontal lines - avoid center intersection */}
                <div className="absolute border-[0.5px] border-[#42f56f]/10" style={{
                  left: '25%', top: '30%', width: '50%', height: '1px'
                }} />
                <div className="absolute border-[0.5px] border-[#42f56f]/10" style={{
                  left: '25%', top: '45%', width: '50%', height: '1px'
                }} />
                <div className="absolute border-[0.5px] border-[#42f56f]/10" style={{
                  left: '25%', top: '60%', width: '50%', height: '1px'
                }} />
                <div className="absolute border-[0.5px] border-[#42f56f]/10" style={{
                  left: '25%', top: '75%', width: '50%', height: '1px'
                }} />
                
                {/* Vertical lines - avoid center intersection */}
                <div className="absolute border-[0.5px] border-[#42f56f]/10" style={{
                  left: '30%', top: '25%', width: '1px', height: '50%'
                }} />
                <div className="absolute border-[0.5px] border-[#42f56f]/10" style={{
                  left: '45%', top: '25%', width: '1px', height: '50%'
                }} />
                <div className="absolute border-[0.5px] border-[#42f56f]/10" style={{
                  left: '60%', top: '25%', width: '1px', height: '50%'
                }} />
                <div className="absolute border-[0.5px] border-[#42f56f]/10" style={{
                  left: '75%', top: '25%', width: '1px', height: '50%'
                }} />
              </div>
            </motion.div>

            {/* Icon with smoother transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className="text-[#42f56f] relative z-10"
              >
                <CurrentIcon size={24} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Occasional sparkles around the orb */}
          <div className="absolute inset-[-10px]">
            {sparkles.map(sparkle => (
              <TinySparkle key={sparkle.id} delay={sparkle.delay} />
            ))}
          </div>
        </div>

        {/* Text container with fixed width */}
        <div className="ml-4 w-48">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.3 }}
              className="whitespace-nowrap"
            >
              <TypewriterText 
                text={phases[phase].text} 
                onComplete={() => setIsTypingComplete(true)}
                color={color}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced hint message */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            className="absolute -bottom-4 left-0 right-0 text-center text-xs"
            style={{ color: `${color}99` }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ 
              opacity: [0, 1, 0.8],
              y: 0,
              textShadow: ['0 0 0px transparent', `0 0 2px ${color}4D`, '0 0 0px transparent']
            }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ 
              duration: 3, 
              ease: "easeOut",
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            Crafting digital magic just for you
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptGenerationLoading;