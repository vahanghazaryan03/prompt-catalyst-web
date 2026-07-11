import React, { useState, useEffect } from 'react';
import { Cat } from 'lucide-react';

const ModalLoader = () => {
  const loadingMessages = [
    "Brewing your login potion...",
    "Warming up the creativity engine...",
    "Almost there...",
    "Setting up your playground..."
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Cat container with glow effect */}
      <div className="relative mb-6">
        {/* Animated glow background */}
        <div 
          className="absolute -inset-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-full blur-lg opacity-75"
          style={{
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        />
        
        {/* Cat icon */}
        <div 
          className="relative bg-[var(--cardBackground)] p-6 rounded-full"
          style={{
            animation: 'floatAnimation 3s ease-in-out infinite',
          }}
        >
          <Cat 
            size={40}
            className="text-[var(--primary)]"
            style={{
              animation: 'rotateAnimation 4s infinite ease-in-out',
              transformOrigin: 'center',
            }}
          />
        </div>
      </div>

      {/* Loading message */}
      <div className="text-center space-y-3">
        <div 
          className="text-base font-medium text-[var(--text)] transition-all duration-500"
          style={{
            opacity: 0.9,
            transform: 'translateY(0)',
            animation: 'messageFloat 0.5s ease-out',
          }}
        >
          {loadingMessages[currentMessage]}
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full"
              style={{
                animation: 'loadingDots 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes rotateAnimation {
          0% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
          100% { transform: rotate(-5deg); }
        }

        @keyframes loadingDots {
          0%, 20% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
          80%, 100% { transform: translateY(0); }
        }

        @keyframes messageFloat {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ModalLoader;