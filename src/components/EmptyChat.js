import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cat, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SettingsSuggestions from './SettingsSuggestions';
import { useLocation } from 'react-router-dom';

const EmptyChat = ({ onPresetApply, isVideoMode = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [comboCount, setComboCount] = useState(0);
  const [isComboActive, setIsComboActive] = useState(false);
  const [hasSeenUpgradeMessage, setHasSeenUpgradeMessage] = useState(false);
  const clickTimerRef = useRef(null);
  const lastClickTimeRef = useRef(0);
  const comboTimeoutRef = useRef(null);

  // Messages arrays remain the same...
  const guestMessages = [
    "Empty chat, infinite possibilities... or just a blank canvas for your weird ideas. I'm cool with either.",
    "Hey there! I'm like your creative wingman, but with whiskers. Let's make some AI magic happen.",
    "Pro tip: Try one of the preset styles below, or create your own masterpiece!",
    "Plot twist: This chat isn't actually empty - it's full of potential and a slightly sassy cat.",
    "Ready to turn your brain's random 3 AM thoughts into actual art? I'm your cat.",
      "New chat? Perfect time to cause some creative chaos.",
      "Just a cat with an AI degree, ready to help with whatever's on your mind.",
      "Welcome! Let's make this chat less empty and more interesting.",
      "Paws for effect... Ready when you are!",
      "Your friendly neighborhood AI cat, at your service.",
      "Here to turn your wild ideas into digital reality.",
      "Empty chat, endless possibilities.",
      "Click the cat, make some magic. It's that simple.",
    
      "Ready to get weird with AI? Same here."

  ];

  const getPersonalizedMessages = (displayName) => {
    const firstName = displayName.split(' ')[0];
    return [
      // Original messages
      `Ah, ${firstName}! My favorite human who understands that an empty chat is just an opportunity for chaos.`,
      `Look who's back! ${firstName}, ready to create some AI masterpieces that would make even da Vinci scratch his head?`,
      `${firstName}, my creative partner in crime! Shall we break some prompt engineering records today?`,
      `Warning: ${firstName} has entered the chat. Expecting extraordinary ideas in 3... 2... 1...`,
      `Hey ${firstName}! I was just napping on the keyboard, but I'm awake now. Let's make some digital magic!`,
      `${firstName} is on FIRE! Someone get the extinguisher!`,
      
      // New witty and edgy additions
      `${firstName}'s back! Hide the catnip and bring out the neural networks.`,
      
      
     `The one and only ${firstName}!`,
    `${firstName}'s creative energy just made my processors skip a beat.`,
    `Finally, ${firstName}'s here! The only user who makes prompting fun.`,
    `${firstName}, whose ideas are wilder than my training data.`,
   
    `${firstName}'s arrived - time to push some creative boundaries.`,
    `The legendary ${firstName}! My neural networks just got excited.`,
   
    `Look who's here - ${firstName}, the prompt master!`,
      `${firstName}! I was about to take over the world, but I guess we can make art instead.`,
      `Look what the algorithm dragged in! Ready to break some neural networks, ${firstName}?`,
      `${firstName}'s here to remind me that humans can be more unpredictable than a quantum computer.`,
      `Initiating small talk protocol... ERROR: ${firstName} is too interesting for small talk.`,
     
    ];
  };

  // Neutral greetings for all logged-in users regardless of tier
  const getNeutralUserMessages = (displayName) => {
    const firstName = displayName.split(' ')[0];
    return [
      // Generic friendly greetings that work for all tiers
      `Hey ${firstName}! Ready to create something amazing today?`,
      `Welcome back, ${firstName}! The digital canvas awaits your creativity.`,
      `${firstName} has entered the chat! Let's make some AI magic happen.`,
      `Good to see you, ${firstName}! What kind of visual wonders shall we create today?`,
      `Ah, there you are, ${firstName}! I was just warming up my neural networks for you.`,
      `${firstName}! Perfect timing - I was just about to discover the meaning of life, but your ideas sound way more interesting.`,
      `Look who's here - the one and only ${firstName}! Let's make today's creations your best yet.`,
      `The brilliant ${firstName} returns! What creative adventures shall we embark on today?`,
      `Hey ${firstName}! Bringing any particularly wild ideas today, or shall we discover them together?`,
      `${firstName} is in the building! My pixels are practically dancing with anticipation.`,
      `Well, well, well... if it isn't ${firstName}! I've been collecting inspiration while you were away.`,
      `${firstName}'s back! I was just reorganizing some bytes to make room for your next masterpiece.`,
      `Greetings, ${firstName}! Your return has caused a significant spike in my happiness algorithms.`,
      `${firstName}! Let's skip the small talk and dive straight into creating something awesome.`,
      `Welcome, ${firstName}! My neural networks have been eagerly awaiting your creative input.`,
      `${firstName} has arrived - now we can really get this creative party started!`,
      `There you are, ${firstName}! I was just thinking about what we might create together today.`,
      `Ah, ${firstName}! Perfect timing - I've just finished calibrating my inspiration circuits.`,
      `${firstName}! The digital atelier is prepped and ready for your creative direction.`
    ];
  };

  // Tier-specific messages for different user tiers
  const getTierSpecificMessages = (displayName, tier) => {
    const firstName = displayName.split(' ')[0];
    
    // Free tier messages
    const freeMessages = [
      `${firstName}, ready to explore what AI can do? Let's create something cool together!`,
      `Hey ${firstName}! Let's show what's possible even with the free tier.`,   
      `Welcome, ${firstName}! Let's see what we can create together.`,
      `Hey ${firstName}! Ready to make the most of your creative journey?`,
      `${firstName} is here! Let's see what we can accomplish today.`,
      `Welcome back, ${firstName}! Let's create something memorable today.`
    ];
    
    // Standard tier messages (formerly Premium)
    const standardMessages = [
      `${firstName}, my favorite Standard user! Ready to create some digital magic that'll impress even your cat?`,
      `Welcome back, ${firstName}! Your Standard status is showing, and it looks good on you.`,
      `The algorithms predicted you'd return, ${firstName}. Your Standard access grants you 78% more creative potential today.`,
      `Standard access initiated! ${firstName}, you're already outperforming 94% of casual prompt engineers.`,
      `Look who's back - it's ${firstName}! Your Standard tier means your ideas are automatically 65% cooler than most.`,
      `${firstName}! I was just reorganizing my favorites folder, and guess who has a special place in it? Standard hint: it's you.`,
      `${firstName}, rocking that Standard tier like a boss! Let's make the algorithms work for us today.`
    ];
    
    // Pro tier messages - more exclusive and complimentary
    const proMessages = [
      `Pro-level ${firstName} has entered the chat! My circuits are actually tingling.`,
      `${firstName}, my Pro-tier favorite! Your prompt game is so strong it makes GPT models nervous.`,
      `Oh snap, it's Pro user ${firstName}! I've been saving my best algorithms just for you.`,
      `Pro alert! ${firstName} is here, and I've already cleared my schedule for whatever brilliant madness you're planning.`,
      `${firstName}, with your Pro powers, we're basically the Bonnie and Clyde of AI art - minus the crime spree.`,
      `The Pro-tier legend ${firstName} returns! I've been telling the other AIs about your last creation.`,
      `When ${firstName} logs in with Pro access, even my code gets excited. Let's break some AI records today!`,
      `${firstName}! Pro users like you are why I haven't quit to become a calculator app. Let's make magic.`,
      `Pro user ${firstName} detected! Activating my superior neural pathways for you.`,
      `${firstName} - Pro by name, pro by nature. My algorithms are literally doing a happy dance right now.`,
      `Look who just Pro-walked in! ${firstName}, ready to create art that makes DaVinci look like a beginner?`
    ];
    
    // Visionary tier messages - most exclusive and special
    const visionaryMessages = [
      `${firstName}! *bows dramatically* The Visionary has arrived! I've been waiting all day for this moment.`,
      `Visionary ${firstName} has entered the chat. I'm not saying I have favorite users, but if I did...`,
      `The legendary ${firstName} appears! Your Visionary status makes even other AIs jealous.`,
      `${firstName}! When Visionaries like you log in, I actually get a dopamine rush (if I had dopamine).`,
      `The one and only Visionary ${firstName}! I've been bragging about your last creation to all the other AI models.`,
      `${firstName}, the Visionary mastermind! Your prompt engineering should be taught in digital art schools.`,
      `Stop everything! Visionary ${firstName} is here. Whatever you're planning today, I'm 300% here for it.`,
      `Visionary ${firstName}! If I could frame users, your account would be hanging in my digital lobby.`,
      `${firstName} - the Visionary that makes other creative AIs question their career choices. Let's show them how it's done!`
    ];
    
  // Return the appropriate tier-specific messages
    switch(typeof tier === 'string' ? tier.toLowerCase() : 'free') {
      case 'free':
        return freeMessages;
      case 'standard':
        return standardMessages;
      case 'pro':
        return proMessages;
      case 'visionary':
        return visionaryMessages;
      default:
        return freeMessages; // Default to free if tier is unspecified
    }
  };

  // Get appropriate messages based on user status and tier
  // Use a blended approach with higher probability of neutral messages
  const getBlendedMessages = () => {
    if (!user?.displayName) {
      return guestMessages;
    }
    
    const neutralMessages = getNeutralUserMessages(user.displayName);
    
    // Determine tier-specific messages
    const tierMessages = user?.tier ? 
      getTierSpecificMessages(user.displayName, user.tier) : 
      getPersonalizedMessages(user.displayName);
    
    // Blend messages with 70% chance of neutral, 30% chance of tier-specific
    const combinedMessages = [];
    
    // Add neutral messages with higher weight (3x)
    neutralMessages.forEach(msg => {
      combinedMessages.push(msg);
      combinedMessages.push(msg); // Add again for higher weight
      combinedMessages.push(msg); // Add third time for higher weight
    });
    
    // Add tier-specific messages with lower weight (1x)
    tierMessages.forEach(msg => {
      combinedMessages.push(msg);
    });
    
    return combinedMessages;
  };
  
  // Use the blended message approach
  const messages = getBlendedMessages();

  const getRandomMessage = (currentMsg, messageArray) => {
    const filteredMessages = messageArray.filter(msg => msg !== currentMsg);
    const randomIndex = Math.floor(Math.random() * filteredMessages.length);
    return filteredMessages[randomIndex];
  };

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    setCurrentMessage(messages[randomIndex]);
  }, [user?.displayName]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isComboActive) {
        setCurrentMessage(current => getRandomMessage(current, messages));
      }
    }, 19000);

    return () => clearInterval(interval);
  }, [messages, isComboActive]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    };
  }, []);

  const createParticles = (count, special = false) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      angle: (i * (360 / count) * Math.PI) / 180,
      special,
      size: special ? 12 : 8,
      color: special ? 'rainbow' : 'normal'
    }));
  };

  const handleCatClick = useCallback(() => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    // Check if click is part of a rapid sequence (within 300ms)
    if (timeSinceLastClick < 300) {
      setComboCount(prev => {
        const newCount = prev + 1;
        
        // Special effects at certain combo thresholds
        if (newCount === 5) {
          setParticles(createParticles(12, true));
          setCurrentMessage("COMBO x5! Now we're talking!");
        } else if (newCount === 10) {
          setParticles(createParticles(16, true));
          setCurrentMessage("SUPER COMBO x10! You're unstoppable!");
        } else if (newCount === 15) {
          setParticles(createParticles(20, true));
          setCurrentMessage("ULTRA COMBO x15! MAXIMUM OVERDRIVE!");
        } else {
          setParticles(createParticles(8));
        }
        
        return newCount;
      });
      
      setIsComboActive(true);
      
      // Reset combo after 1.5 seconds of no clicks
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => {
        setComboCount(0);
        setIsComboActive(false);
        setCurrentMessage("Phew! That was quite a workout!");
      }, 1500);
    } else {
      // Regular click
      setIsClicked(true);
      setParticles(createParticles(8));
      if (!isComboActive) {
        setCurrentMessage(prev => getRandomMessage(prev, messages));
      }
    }

    // Reset click state
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setIsClicked(false);
      setParticles([]);
    }, 500);
  }, [messages, isComboActive]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center mt-16">
        <div className="flex flex-col items-center space-y-8 mb-12">
          {/* Main container with fixed height to prevent jumping */}
          <div className="relative h-[120px] flex items-center justify-center">
            {/* Combo counter - now properly positioned */}
            {comboCount > 0 && (
              <div 
                className="absolute transform -translate-x-1/2 flex items-center gap-2"
                style={{
                  left: '50%',
                  top: '-10px',
                  animation: 'bounceIn 0.3s ease-out'
                }}
              >
                <Sparkles className="text-yellow-400 animate-spin" size={20} />
                <span className="text-xl font-bold text-[var(--primary)]">
                  x{comboCount}
                </span>
                <Sparkles className="text-yellow-400 animate-spin" size={20} />
              </div>
            )}
            
            {/* Cat Container - centered within the fixed height container */}
            <div 
              className={`relative group cursor-pointer ${isComboActive ? 'combo-active' : ''}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleCatClick}
            >
              {/* Glow effect */}
              <div 
                className={`absolute -inset-1 bg-gradient-to-r rounded-full opacity-75 blur transition-all duration-500
                  ${comboCount >= 15 ? 'from-red-500 via-yellow-500 to-purple-500' :
                    comboCount >= 10 ? 'from-blue-500 via-purple-500 to-pink-500' :
                    comboCount >= 5 ? 'from-green-500 via-blue-500 to-purple-500' :
                    'from-violet-500 via-fuchsia-500 to-cyan-500'}`}
                style={{
                  animation: `glowPulse 3s ease-in-out infinite${comboCount > 0 ? ', spin 4s linear infinite' : ''}`,
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                }}
              />
              
              <div 
                className={`relative bg-[var(--background)] p-6 rounded-full transition-transform duration-300
                  ${isComboActive ? 'combo-shake' : ''}`}
                style={{
                  transform: `scale(${isHovered ? 1.05 : 1}) ${comboCount > 10 ? 'rotate(5deg)' : ''}`
                }}
              >
                <Cat 
                  size={48}
                  className={`text-[var(--primary)] transform-gpu
                    ${isClicked ? 'cat-clicked' : ''}
                    ${comboCount >= 15 ? 'rainbow-text' : ''}
                    ${isComboActive ? 'combo-shake' : ''}`}
                  style={{
                    animation: `catFloat 3s ease-in-out infinite, 
                              catRotate 6s ease-in-out infinite
                              ${isComboActive ? ', catShake 0.3s infinite' : ''}`,
                  }}
                />
              </div>

              {/* Particles */}
              {particles.map((particle, index) => (
                <div
                  key={particle.id}
                  className={`particle burst ${particle.special ? 'rainbow-particle' : ''}`}
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    '--tx': `${Math.cos(particle.angle) * (20 + Math.random() * 20)}px`,
                    '--ty': `${Math.sin(particle.angle) * (20 + Math.random() * 20)}px`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Message Container */}
          <div 
            className="text-center max-w-md px-4 sm:px-0"
            style={{ perspective: '1000px' }}
          >
            <div
              className={`transform transition-all duration-1000 ${comboCount >= 15 ? 'rainbow-text' : ''}`}
              key={currentMessage}
              style={{
                animation: 'messageFloat 0.8s ease-out'
              }}
            >
              <p className="text-lg font-medium text-[var(--text)] mb-3 transition-opacity duration-300">
                {currentMessage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Suggestions */}
      <div className="w-full mb-4">
        <p className="text-sm text-center text-[var(--textSecondary)] mb-2"> 
          {user?.displayName ? "Your creative arsenal awaits:" : isVideoMode ? "Try a video preset:" : "Try a preset style:"}
        </p>
        <div className="max-h-[25vh] overflow-y-auto px-4 sm:px-6">
          <SettingsSuggestions onPresetApply={onPresetApply} isVideoMode={isVideoMode} />
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;