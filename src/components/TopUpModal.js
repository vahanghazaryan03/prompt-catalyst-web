import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  CreditCard,
  Sparkles,
  Loader2,
  ChevronRight,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const CreditPackage = ({ credits, price, isPopular, isBestValue, onSelect, loading, disabled }) => {
  const formattedPrice = (price / 100).toFixed(2);
  const creditsPerDollar = Math.round(credits / (price / 100));

  return (
    <div className={`topup-credit-package relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${
      isPopular ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10' : 
      isBestValue ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' :
      'border-gray-200 dark:border-gray-700'
    }`}>
      {isPopular && (
        <span className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium flex items-center whitespace-nowrap">
          <Sparkles className="w-3 h-3 mr-1" />
          Most Popular
        </span>
      )}
      {isBestValue && (
        <span className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium flex items-center whitespace-nowrap">
          <Star className="w-3 h-3 mr-1" />
          Best Value
        </span>
      )}
      <div className="text-center">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
          {credits.toLocaleString()} Credits
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-violet-600 dark:text-violet-400 mb-1 sm:mb-2">
          ${formattedPrice}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
            
        </div>
        <button
          onClick={() => onSelect(credits, price)}
          disabled={loading || disabled}
          className={`w-full py-2 px-3 sm:px-4 rounded-lg font-medium transition duration-200 ${
            isPopular 
              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white transform hover:scale-[1.02]' 
              : isBestValue
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transform hover:scale-[1.02]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          } ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-center space-x-2">
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                <span className="text-sm sm:text-base">Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">Purchase</span>
              </>
            )}
          </div>
        </button>
      </div>
      
      {/* Feature list - New addition */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <ul className="space-y-2">
          <li className="flex items-start space-x-2">
            <ChevronRight className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Credits never expire</span>
          </li>
          <li className="flex items-start space-x-2">
            <ChevronRight className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Use for any prompt type</span>
          </li>

        </ul>
      </div>
    </div>
  );
};

const TopUpModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  // Track loading state by credit package
  const [loadingPackage, setLoadingPackage] = useState(null);

  const handlePurchase = async (credits, price) => {
    if (!user) {
      addToast('Please log in to purchase credits', 'error');
      return;
    }

    try {
      // Set loading for only the selected package
      setLoadingPackage(credits);
      const packageId = getPackageId(credits);
      const response = await apiService.initiateCreditPurchase(packageId);
      
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      addToast(error.message || 'Failed to initiate purchase', 'error');
      setLoadingPackage(null); // Clear loading state on error
    }
  };

  const getPackageId = (credits) => {
    switch (credits) {
      case 3000: return 'basic';
      case 8000: return 'standard';
      case 16000: return 'premium';
      case 40000: return 'pro';
      default: throw new Error('Invalid package');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          as={motion.div}
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="initial"
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          
          <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
            <Dialog.Panel className="topup-modal-container relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute right-2 sm:right-4 top-2 sm:top-4 p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col">
                <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-6 sm:pb-8 text-center bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-violet-500/5">
                  <motion.div variants={fadeInUp} initial="initial" animate="animate">
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-500 mb-3 sm:mb-4">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" /> Top Up Credits
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                      Purchase Additional Credits
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Add more credits to your account instantly
                    </p>
                  </motion.div>
                </div>

                <div className="px-4 sm:px-8 py-4 sm:py-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <CreditPackage
                      credits={3000}
                      price={499}
                      loading={loadingPackage === 3000}
                      disabled={loadingPackage !== null && loadingPackage !== 3000}
                      onSelect={handlePurchase}
                    />
                    <CreditPackage
                      credits={8000}
                      price={999}
                      isPopular={true}
                      loading={loadingPackage === 8000}
                      disabled={loadingPackage !== null && loadingPackage !== 8000}
                      onSelect={handlePurchase}
                    />
                    <CreditPackage
                      credits={16000}
                      price={1799}
                      loading={loadingPackage === 16000}
                      disabled={loadingPackage !== null && loadingPackage !== 16000}
                      onSelect={handlePurchase}
                    />
                    <CreditPackage
                      credits={40000}
                      price={3999}
                      isBestValue={true}
                      loading={loadingPackage === 40000}
                      disabled={loadingPackage !== null && loadingPackage !== 40000}
                      onSelect={handlePurchase}
                    />
                  </div>
                </div>

                <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-2 text-center">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Secure payment processed by Stripe
                  </p>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default TopUpModal;