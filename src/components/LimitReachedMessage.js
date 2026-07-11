import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import { ArrowRight, Sparkles, Gift, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LimitReachedMessage = ({ 
  type = 'prompt',
  creditInfo = {},
  limitType = 'daily',
  onRemove,
  onPremiumClick,
  onTopUpClick, // New prop for handling TopUp modal
  onLoginModalOpen, // New prop for handling login modal state
  isProMember = false // Whether the user is a Pro member
}) => {
  const { isAuthenticated, user } = useAuth();
  const { creditType, lastReset, resetType, refreshCredits } = useCredit();

  const getRemainingCreditsMessage = () => {
    if (creditInfo && creditInfo.remaining !== undefined && creditInfo.total !== undefined) {
      return `${creditInfo.remaining}/${creditInfo.total}`;
    }
    return null; // Return null instead of empty string to conditionally hide
  };

  const messageVariants = {
    initial: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={messageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="mx-4 my-6"
      >
        {!isAuthenticated ? (
          <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 rounded-xl p-6 border border-purple-200/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-400" />
                Not Enough Credits
              </h3>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Create an account to get free daily credits
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onLoginModalOpen('register')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
              >
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button 
                onClick={() => onLoginModalOpen('login')}
                className="inline-flex items-center px-4 py-2 bg-white/10 text-gray-200 rounded-lg font-medium hover:bg-white/20 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : user?.isPremium ? (
          <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 rounded-xl p-6 border border-purple-200/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Credit Limit Reached
              </h3>
            </div>
            {getRemainingCreditsMessage() && (
              <div className="mt-4 text-gray-600 dark:text-gray-300">
                Credits remaining: {getRemainingCreditsMessage()}
              </div>
            )}
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              You've used all your available credits. Purchase additional credits to continue.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onTopUpClick}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
              >
                Top Up Credits
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              
              {/* Only show Upgrade button for Premium (Standard) users, not Pro users */}
              {user?.isPremium && !isProMember && (
                <button 
                  onClick={onPremiumClick}
                  className="inline-flex items-center px-4 py-2 bg-white/10 text-gray-200 rounded-lg font-medium hover:bg-white/20 transition-all"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 rounded-xl p-6 border border-purple-200/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Not Enough Credits
              </h3>
            </div>
            {getRemainingCreditsMessage() && (
              <div className="mt-4 text-gray-600 dark:text-gray-300">
                Credits remaining: {getRemainingCreditsMessage()}
              </div>
            )}
            <div className="mt-4 bg-purple-500/10 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Upgrade to Unlock:
              </h4>
              <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Advanced Prompt Customization
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Video Generation
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Unlimited History & More
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all"
                onClick={onPremiumClick}
              >
                Upgrade
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LimitReachedMessage;