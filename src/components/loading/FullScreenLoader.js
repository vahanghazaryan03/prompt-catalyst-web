import React, { useState, useEffect } from 'react';
import { Cat } from 'lucide-react';

const FullScreenLoader = () => {
  const loadingMessages = [
    "Gathering creative particles...",
    "Warming up the imagination engine...",
    "Calibrating creative frequencies...",
    "Summoning artistic inspiration...",
    "Loading purrfect ideas...",
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
      {/* Cat container with glow effect */}
      <div className="relative mb-8">
        {/* Animated glow background */}
        <div 
          className="absolute -inset-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-full blur-lg opacity-75"
          style={{
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        />
        
        {/* Cat icon */}
        <div 
          className="relative bg-[var(--background)] p-6 rounded-full"
          style={{
            animation: 'floatAnimation 3s ease-in-out infinite',
          }}
        >
          <Cat 
            size={48}
            className="text-[var(--primary)]"
            style={{
              animation: 'rotateAnimation 4s infinite ease-in-out',
              transformOrigin: 'center',
            }}
          />
        </div>
      </div>

      {/* Loading message */}
      <div className="text-center space-y-4">
        <div 
          className="text-lg font-medium text-[var(--text)] transition-all duration-500"
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
              className="w-2 h-2 bg-[var(--primary)] rounded-full"
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
          50% { transform: translateY(-20px); }
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
          50% { transform: translateY(-5px); }
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

export default FullScreenLoader;