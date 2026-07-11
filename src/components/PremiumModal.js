import React, { useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Loader2, DollarSign,
  Star, Crown, Zap, List, Film, Settings,
  History, Rocket, MessageCircle, CreditCard, Clock, Info, PencilRuler,
  Asterisk, Sparkles, Diamond, Infinity, Video
} from 'lucide-react';
import subscriptionService from '../services/subscriptionService';
import tokenService from '../services/tokenService';
import JumpingCat from './JumpingCat';
import { useAuth } from '../contexts/AuthContext';

// Energy field animation removed

const FeatureIcon = ({ feature }) => {
  const icons = {
    'credits': Zap,
    'batch': List,
    'video': Film,
    'textvideo': Film,
    'premium': Star,
    'history': History,
    'advanced': Star,
    'pro': Crown,
    'support': MessageCircle,
    'unlimited': Infinity,
    'prompt': Asterisk,
    'editing': PencilRuler,
    'preview': Sparkles,
    'quality': Diamond,
  };

  const getIconByFeature = (feature) => {
    // Check specific full matches first
    if (feature === 'Unlimited Prompt Generation') return icons.unlimited;
    if (feature === 'Unlimited Preview Generation') return icons.unlimited;
    if (feature === 'Text to Video Generation') return icons.textvideo;
    if (feature === 'Prompt Based Image Editing') return icons.editing;
    if (feature === 'Highest Quality Image & Video Generation') return icons.preview;
    if (feature === 'All Features From Previous Tiers') return Check;
    if (feature === 'All Features From Standard') return Check;
    
    // Then check partial matches
    if (feature.includes('Credit')) return icons.credits;
    if (feature.includes('Batch')) return icons.batch;
    if (feature.includes('Premium')) return icons.premium;
    if (feature.includes('History')) return icons.history;
    if (feature.includes('Video')) return icons.video;
    if (feature.includes('Advanced')) return icons.advanced;
    if (feature.includes('Pro')) return icons.pro;
    if (feature.includes('Support')) return icons.support;
    if (feature.includes('Prompt')) return icons.prompt;
    if (feature.includes('Preview')) return icons.preview;
    if (feature.includes('Quality')) return icons.quality;
    return Check;
  };

  const Icon = getIconByFeature(feature);
  
  return (
    <div className="mr-3 p-1.5">
      <Icon className="w-4 h-4 text-green-500" />
    </div>
  );
};

const ComparisonCard = ({ selectedTier, isAnnual }) => {
  // Pricing calculations based on plan
  const pricingData = {
    premium: {
      monthlyPrice: 5.99,
      annualPrice: 5.33,
      credits: 5000
    },
    pro: {
      monthlyPrice: 9.99,
      annualPrice: 8.33,
      credits: 11000
    },
    ultimate: {
      monthlyPrice: 29.99,
      annualPrice: 24.33,
      credits: 32000
    }
  };

  // Get the current tier data
  const tierData = pricingData[selectedTier];
  
  // Calculate the price per image (assuming 10 credits = 1 image)
  const creditsPerImage = 10;
  const price = isAnnual ? tierData.annualPrice : tierData.monthlyPrice;
  const pricePerImage = (price / tierData.credits * creditsPerImage).toFixed(4);
  
  // Format to show 3 decimal places for readability
  const formattedPrice = parseFloat(pricePerImage).toFixed(3);

  // Calculate savings percentage compared to industry average
  const industryAverage = 0.025; // $0.025/image
  const savingsPercent = Math.round((1 - (parseFloat(pricePerImage) / industryAverage)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="comparison-card p-4 rounded-xl bg-[var(--cardBackground)] border border-[var(--border)] shadow-sm"
    >
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 p-2 mr-2">
          <DollarSign className="w-5 h-5 text-[var(--text)]" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-[var(--text)] font-medium">
                <span>Image Generation on Prompt Catalyst</span>
                <div className="relative ml-1 group">
                  <Info className="w-3 h-3 text-[var(--textSecondary)] mt-0.5 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-xs text-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                    <p className="mb-1">Price per image calculation:</p>
                    <p className="mb-1">${price} / {tierData.credits} credits × 10 credits = ${formattedPrice}/image</p>
                    <p>Each Flux Dev image costs 10 credits to generate.</p>
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-green-500">
                ${formattedPrice}/image
              </span>
            </div>
            <div className="flex items-center justify-between text-[var(--textSecondary)]">
              <span className="text-sm">
                Industry Average 
              </span>
              <span className="text-sm">$0.025/image</span>
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--border)] space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center text-sm text-[var(--text)]"
            >
              <Zap className="w-4 h-4 mr-2 text-[var(--text)]" />
              <span>Generate {selectedTier === 'premium' ? '2x' : '2.5x'} more images</span>
            </motion.div>
            {/* Standard message for all tiers on savings */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center text-sm text-[var(--text)]"
            >
              
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PricingCard = ({ tier, isAnnual, selected, onSelect, showFeatures = true }) => {
  const tiers = {
    premium: {
      name: "Standard",
      subtitle: "Start Your Creative Journey",
      monthlyPrice: 5.99,
      annualPrice: 4.79,
      annualTotal: 51.99,
      originalPrice: 7.99,
      credits: "5,000",
      features: [
        "5,000 Monthly Credits",
        "Batch Generation",
        "Advanced Settings",
        "Unlimited History"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    pro: {
      name: "Pro",
      subtitle: "Level Up Your Projects",
      monthlyPrice: 9.99,
      annualPrice: 7.99,
      annualTotal: 99.99,
      originalPrice: 12.99,
      credits: "11,000",
      features: [
        "11,000 Monthly Credits",
      
        "Video Generation",
        "Prompt Based Image Editing", 
        "Flux Pro & Ultra Models",
        "All Features From Standard",
      ],
      gradient: "from-emerald-500 to-teal-500"
    },
    ultimate: {
      name: "Visionary",
      subtitle: "For Your Most Ambitious Ideas",
      monthlyPrice: 29.99,
      annualPrice: 23.99,
      annualTotal: 299.99,
      // No originalPrice to indicate it's not discounted
      credits: "34,000",
      features: [
        "34,000 Monthly Credits",
        "Unlimited Prompt Generation",
        "Unlimited Preview Generation",
       
        "All Features From Previous Tiers"
      ],
      gradient: "from-teal-500 to-blue-500"
    }
  };

  const tierData = tiers[tier];

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`pricing-card relative p-4 rounded-2xl border transition-all cursor-pointer ${  
          selected 
              ? 'border-green-500 bg-[var(--background)] shadow-lg shadow-green-500/10' 
              : 'border-[var(--border)] hover:border-[var(--primary)]/50'
      }`}
      style={{}}
      onClick={onSelect}
    >
      {/* Show discount badge for annual plans */}
      {isAnnual && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute -top-3 left-6 px-4 py-1 rounded-full bg-gradient-to-r ${tierData.gradient}`}
        >
          <span className="text-xs font-medium text-white">
            Save 20%
          </span>
        </motion.div>
      )}
      
      <div className={`mb-2 ${isAnnual ? 'mt-2' : ''} transition-all duration-300`}>
        <h3 className="text-xl font-bold text-[var(--text)]">
          {tierData.name}
        </h3>
        <p className="text-xs text-[var(--textSecondary)] mt-1">{tierData.subtitle}</p>
      </div>
      
      <div className="mb-5">
        
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-[var(--text)]">
            ${isAnnual ? tierData.annualPrice : tierData.monthlyPrice}
          </span>
          <span className="text-sm text-[var(--textSecondary)] ml-2">
            /month
          </span>
        </div>
        {isAnnual && (
          <div className="text-sm text-[var(--textSecondary)] mt-2">
            Billed annually 
          </div>
        )}
      </div>

      {showFeatures && (
        <div className="space-y-3">
          {tierData.features.map((feature, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index} 
              className="flex items-center text-sm text-[var(--text)]"
            >
              <FeatureIcon feature={feature} />
              <span className="flex items-center">
                {feature}
                {(feature === 'Unlimited Prompt Generation' || feature === 'Unlimited Preview Generation') && (
                  <div className="inline-flex items-center ml-0.5 group cursor-help">
                    <Info className="w-3 h-3 text-[var(--textSecondary)]" />
                    <div className="absolute left-0 bottom-full mb-1 p-2 bg-gray-800 text-xs text-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10 w-56">
                      <p>{feature.includes('Prompt') ? 'Generating prompts' : 'Generating preview images'} will not consume your credits</p>
                    </div>
                  </div>
                )}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r ${tierData.gradient} rounded-full flex items-center justify-center`}
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

const CurrentPlanCard = ({ plan, isAnnual, expiryDate, onManage }) => {
  const planDetails = {
    premium: {
      name: "Standard",
      subtitle: "Start Your Creative Journey",
      features: [
        "5,000 Monthly Credits",
        "Batch Generation",
        "Advanced Settings",
        "Unlimited History"
      ],
      gradient: "from-green-500 to-emerald-500",
      icon: Star
    },
    pro: {
      name: "Pro",
      subtitle: "Level Up Your Projects",
      features: [
        "11,000 Monthly Credits",
        "Image to Video Generation",
        "Flux Pro & Ultra Models",
        "All Standard Features"
      ],
      gradient: "from-emerald-500 to-teal-500",
      icon: Crown
    },
    ultimate: {
      name: "Visionary",
      subtitle: "The Complete Creative Suite",
      features: [
        "32,000 Monthly Credits",
        "Unlimited Prompt Generation",
        "Unlimited Preview Generation",
        //"Highest Quality Image & Video Generation",
        "All Features From Previous Tiers"
      ],
      gradient: "from-teal-500 to-blue-500",
      icon: Rocket
    }
  };

  const details = planDetails[plan.toLowerCase()];
  const PlanIcon = details.icon;

  return (
    <div className="current-plan-card p-4 rounded-xl border border-green-500 bg-[var(--background)] shadow-lg shadow-green-500/20">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-2 bg-gradient-to-r ${details.gradient}`}>
            <PlanIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text)]">
              {details.name} {isAnnual ? "Annual" : "Monthly"}
            </h3>
            <p className="text-xs text-[var(--textSecondary)]">
              {isAnnual ? "Yearly billing" : "Monthly billing"} · {details.subtitle}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onManage}
          className="flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-[var(--cardBackground)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--dropdownHover)] transition-colors"
        >
          <CreditCard className="w-4 h-4 mr-1" />
          <span>Manage</span>
        </motion.button>
      </div>
      
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3">
        {details.features.map((feature, index) => (
          <div key={index} className="flex items-center text-xs text-[var(--text)]">
            <div className="flex items-center">
              <div className="mr-1.5 p-0.5">
                <Check className="w-3 h-3 text-green-500" />
              </div>
              <span className="truncate">{feature}</span>
              
              {(feature === 'Unlimited Prompt Generation' || feature === 'Unlimited Preview Generation') && (
                <div className="inline-flex items-center ml-0.5 group cursor-help">
                  <Info className="w-2.5 h-2.5 text-[var(--textSecondary)]" />
                  <div className="absolute left-0 bottom-full mb-1 p-2 bg-gray-800 text-xs text-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10 w-56">
                    <p>{feature.includes('Prompt') ? 'Generating prompts' : 'Generating preview images'} will not consume your credits</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BillingToggle = ({ isAnnual, onChange, isPremiumView = false }) => (
  <div className={`flex ${isPremiumView ? 'justify-end' : 'justify-center'} items-center space-x-2`}>
    <span className={`${isPremiumView ? 'text-xs' : 'text-sm'} font-medium text-[var(--textSecondary)]`}>
      Monthly
    </span>
    <motion.button
      onClick={() => onChange(!isAnnual)}
      className={`relative ${isPremiumView ? 'w-12 h-6' : 'w-16 h-8'} flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner`}
      style={{
        background: isAnnual 
          ? 'rgb(21, 128, 61)' // green-700
          : 'rgb(156, 163, 175)' // gray-400
      }}
    >
      <motion.div
        initial={false}
        animate={{ 
          x: isAnnual ? (isPremiumView ? '24px' : '32px') : '0px',
          backgroundColor: '#fff'
        }}
        className={`${isPremiumView ? 'w-4 h-4' : 'w-6 h-6'} rounded-full shadow-md`}
      />
    </motion.button>
    <span className={`${isPremiumView ? 'text-xs' : 'text-sm'} font-medium text-[var(--textSecondary)]`}>
      Annual
      <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--cardBackground)] text-[var(--textSecondary)] ${isPremiumView ? 'text-[10px]' : ''}`}>
        -20%
      </span>
    </span>
  </div>
);

const PremiumModal = ({ isOpen, onClose, onLoginRequired }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState('premium');
  const [error, setError] = useState(null);
  const [preloadedCheckoutUrls, setPreloadedCheckoutUrls] = useState({});
  const [debouncedSelectedTier, setDebouncedSelectedTier] = useState('premium');
  const [debouncedIsAnnual, setDebouncedIsAnnual] = useState(false);
  const preloadTimeoutRef = useRef(null);
  const { user } = useAuth();
  
  // Energy field animation effect removed
  
  // Determine user tiers
  const isPremiumUser = user?.isPremium && !user?.isProMember && !user?.isUltimateMember;
  const isProUser = user?.isProMember && !user?.isUltimateMember;
  const isUltimateUser = user?.isUltimateMember;
  
  // Define subscription plan details
  let currentPlan = null;
  if (isPremiumUser) currentPlan = 'premium';
  if (isProUser) currentPlan = 'pro';
  if (isUltimateUser) currentPlan = 'ultimate';
  
  const isCurrentPlanAnnual = user?.roles?.some(role => 
    role === 'um_pro-member-yearly' || 
    role === 'um_premium-member-yearly' || 
    role === 'um_ultimate-member-yearly'
  ) || false;

  // Placeholder for expiry date - this would come from your API in a real app
  const [expiryDate, setExpiryDate] = useState(null);

  // Function to open stripe portal for subscription management
  const handleManageSubscription = useCallback(() => {
    // Use the same URL as in the UserDropdown component
    window.open('https://billing.stripe.com/p/login/00g6srfOR1Af6xWbII', '_blank');
  }, []);

  // Check for pre-selected plan when component mounts or when isOpen changes
  useEffect(() => {
    if (isOpen) {
      // Set proper upgrade tier based on current user level
      if (isPremiumUser) {
        setSelectedTier('pro');
      } else if (isProUser) {
        setSelectedTier('ultimate');
      } else {
        // For non-subscribers, check session storage
        const preSelectedPlan = sessionStorage.getItem('selectedPremiumPlan');
        if (preSelectedPlan && (preSelectedPlan === 'basic' || preSelectedPlan === 'premium' || preSelectedPlan === 'pro' || preSelectedPlan === 'ultimate')) {
          setSelectedTier(preSelectedPlan);
          
          // Clear the session storage after using it
          sessionStorage.removeItem('selectedPremiumPlan');
        }
      }
      
      // Format expiry date if available - this is a placeholder and would be 
      // replaced with actual API data in a production environment
      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
      setExpiryDate(nextMonth.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));

      // Clear any existing preloaded URLs when the modal opens
      setPreloadedCheckoutUrls({});
    }
  }, [isOpen]);

  // Debounce selected tier and annual setting
  useEffect(() => {
    // Clear any existing timeout
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
    
    // Set a new timeout to update the debounced values
    preloadTimeoutRef.current = setTimeout(() => {
      setDebouncedSelectedTier(selectedTier);
      setDebouncedIsAnnual(isAnnual);
    }, 300); // 300ms debounce
    
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [selectedTier, isAnnual]);

  // Preload checkout URLs when debounced values change
  useEffect(() => {
    if (isOpen && user && user.userId && !isUltimateUser) {
      // Only proceed with preloading if user is properly authenticated
      const token = tokenService?.getToken?.();
      if (!token) {
        // Not logged in, don't attempt preloading
        return;
      }
      // Only preload for the current selection
      let tierToPreload;
      
      if (isPremiumUser) {
        tierToPreload = 'pro';
      } else if (isProUser) {
        tierToPreload = 'ultimate';
      } else {
        tierToPreload = debouncedSelectedTier;
      }
      
      const preloadKey = `${tierToPreload}_${debouncedIsAnnual ? 'annual' : 'monthly'}`;
      
      // Only preload if we don't already have this URL and it's not currently being preloaded
      if (!preloadedCheckoutUrls[preloadKey] && preloadedCheckoutUrls[preloadKey] !== 'preloading') {
        // Set a placeholder to indicate preloading is in progress
        setPreloadedCheckoutUrls(prev => ({
          ...prev,
          [preloadKey]: 'preloading'
        }));
        
        subscriptionService.initiateStripeCheckout(tierToPreload, debouncedIsAnnual, true) // Pass true for preload
          .then(result => {
            if (result.success && result.url) {
              setPreloadedCheckoutUrls(prev => ({
                ...prev,
                [preloadKey]: result.url
              }));
            }
          })
          .catch(err => {
            // Remove the preloading placeholder on error
            setPreloadedCheckoutUrls(prev => {
              const newUrls = {...prev};
              delete newUrls[preloadKey];
              return newUrls;
            });
          });
      }
    }
  }, [isOpen, debouncedSelectedTier, debouncedIsAnnual, user, isPremiumUser, isProUser, isUltimateUser, preloadedCheckoutUrls]);

  const handleSubscribeClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the appropriate tier based on current user level
      let tierToUse;
      if (isPremiumUser) {
        tierToUse = 'pro';
      } else if (isProUser) {
        tierToUse = 'ultimate';
      } else {
        tierToUse = selectedTier;
      }
      
      // Check if we have a preloaded URL
      const preloadKey = `${tierToUse}_${isAnnual ? 'annual' : 'monthly'}`;
      const preloadedUrl = preloadedCheckoutUrls[preloadKey];
      
      if (preloadedUrl && preloadedUrl !== 'preloading') {
        window.location.href = preloadedUrl;
        return;
      }
      
      const result = await subscriptionService.initiateStripeCheckout(tierToUse, isAnnual, false);
      
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      if (error.message === 'Authentication required') {
        onLoginRequired();
      } else if (error.message === 'email_verification_required') {
        setError('Please verify your email before subscribing.');
      } else {
        setError('Failed to initiate checkout. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedTier, isAnnual, onLoginRequired, isPremiumUser, preloadedCheckoutUrls]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.935, opacity: 0 }}
            animate={{ scale: 0.99, opacity: 1, height: "auto" }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="premium-modal-container relative w-full max-w-4xl bg-[var(--background)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden mx-4 md:mx-0 max-h-[95vh] md:max-h-[95vh] overflow-y-auto"
          >
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={onClose}
                className="p-2 text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors rounded-full hover:bg-[var(--dropdownHover)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header section with JumpingCat absolutely positioned so it doesn't affect title centering */}
            <div className={`px-4 md:px-8 ${isPremiumUser ? 'pt-5 md:pt-5 pb-3' : 'pt-7 md:pt-8 pb-7'} bg-[var(--cardBackground)] relative border-b border-[var(--border)]`}>
              {!isPremiumUser && (
                <motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -20, opacity: 0 }}
  transition={{ duration: 0.3 }}
  className="hidden md:block absolute top-4 transform -translate-y-1/2"
  style={{ left: '170px' }} // halfway between 160px (left-40) and 176px (left-44)
>

                  <JumpingCat />
                </motion.div>
              )} 
            
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                {isUltimateUser ? (
                  <>                    
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
                  Ultimate Subscription
                  </h2>
                    <p className="text-sm text-[var(--textSecondary)]">
                      Manage your Ultimate plan settings
                    </p>
                  </>
                ) : isProUser ? (
                  <>
                    <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
                      Pro Subscription
                    </h2>
                    <p className="text-sm text-[var(--textSecondary)]">
                      Manage your current plan or upgrade to Ultimate
                    </p>
                  </>
                ) : isPremiumUser ? (
                  <>
                    <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
                      Standard Subscription
                    </h2>
                    <p className="text-sm text-[var(--textSecondary)]">
                      Manage your current plan or upgrade to Pro
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-[var(--text)] mb-2">
                      Choose Your Plan
                    </h2>
                    <p className="text-[var(--textSecondary)]">
                      Select the perfect plan for your creative needs
                    </p>
                  </>
                )}
              </motion.div>
            </div>

            <div className={`px-4 md:px-8 ${user?.isPremium ? 'py-2' : 'py-3'} ${user?.isPremium ? 'space-y-2.5' : 'space-y-3.5'} bg-[var(--background)]`}>
              {isUltimateUser ? (
                // Ultimate user subscription management view
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-medium text-[var(--text)]">
                      Current Subscription
                    </h3>
                  </div>
                  
                  <CurrentPlanCard 
                    plan={currentPlan}
                    isAnnual={isCurrentPlanAnnual}
                    expiryDate={expiryDate}
                    onManage={handleManageSubscription}
                  />
                  
                  <div className="flex items-center mt-3 p-3 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)]">
                    <div className="flex-shrink-0 p-1.5 mr-2">
                      <Crown className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-[var(--text)]">
                      <span className="font-medium">You're on our Ultimate tier!</span> Enjoy all premium features with higher credits and unlimited prompt generation.
                    </p>
                  </div>
                </div>
              ) : isProUser ? (
                // Pro user subscription management view with Ultimate upgrade option
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-medium text-[var(--text)]">
                      Current Subscription
                    </h3>
                  </div>
                  
                  <CurrentPlanCard 
                    plan={currentPlan}
                    isAnnual={isCurrentPlanAnnual}
                    expiryDate={expiryDate}
                    onManage={handleManageSubscription}
                  />
                  
                  <div className="pt-3 border-t border-[var(--border)]">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-base font-medium text-[var(--text)]">
                        Upgrade to Ultimate
                      </h3>
                      <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} isPremiumView={true} />
                    </div>
                    
                    <div className="mt-4">
                      <PricingCard
                        tier="ultimate"
                        isAnnual={isAnnual}
                        selected={true}
                        onSelect={() => {}}
                        showFeatures={true}
                      />
                      
                      <div className="flex items-center mt-3 mb-3 p-2 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)]">
                        <div className="flex-shrink-0 p-1 mr-2">
                          <Zap className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-xs text-[var(--text)]">
                          <span className="font-medium">Your unused credits will be transferred </span>to your new Ultimate plan when you upgrade.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isPremiumUser ? (
                // Standard subscription management view with Pro upgrade option
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-medium text-[var(--text)]">
                      Current Subscription
                    </h3>
                  </div>
                  
                  <CurrentPlanCard 
                    plan={currentPlan}
                    isAnnual={isCurrentPlanAnnual}
                    expiryDate={expiryDate}
                    onManage={handleManageSubscription}
                  />
                  
                  <div className="pt-3 border-t border-[var(--border)]">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-base font-medium text-[var(--text)]">
                        Upgrade to Pro
                      </h3>
                      <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} isPremiumView={true} />
                    </div>
                    
                    <div className="mt-4">
                      <PricingCard
                        tier="pro"
                        isAnnual={isAnnual}
                        selected={true}
                        onSelect={() => {}}
                        showFeatures={true}
                      />
                      
                      <div className="flex items-center mt-3 mb-3 p-2 rounded-lg bg-[var(--cardBackground)] border border-[var(--border)]">
                        <div className="flex-shrink-0 p-1 mr-2">
                          <Zap className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-xs text-[var(--text)]">
                          <span className="font-medium">Your unused credits will be transferred </span>to your new Pro plan when you upgrade.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Plan selection view for non-subscribers
                <>
                  <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <PricingCard
                      tier="premium"
                      isAnnual={isAnnual}
                      selected={selectedTier === 'premium'}
                      onSelect={() => setSelectedTier('premium')}
                    />
                    <PricingCard
                      tier="pro"
                      isAnnual={isAnnual}
                      selected={selectedTier === 'pro'}
                      onSelect={() => setSelectedTier('pro')}
                    />
                    <PricingCard
                      tier="ultimate"
                      isAnnual={isAnnual}
                      selected={selectedTier === 'ultimate'}
                      onSelect={() => setSelectedTier('ultimate')}
                    />
                  </div>

                  <ComparisonCard 
                    selectedTier={selectedTier} 
                    isAnnual={isAnnual} 
                  />
                </>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[var(--error)] text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              {isUltimateUser ? (
                <motion.button
                  onClick={handleManageSubscription}
                  className="w-full bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-3 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center shadow-md"
                >
                  <span className="text-base">
                    Manage Ultimate Subscription
                  </span>
                </motion.button>
              ) : isPremiumUser || isProUser ? (
                <motion.button
                  onClick={handleSubscribeClick}
                  disabled={isLoading}
                  className="w-full bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-3 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center shadow-md"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Processing...</span>
                      </div>
                      {/* Progress bar for better UX */}
                      <motion.div 
                      className="w-full bg-[var(--border)] h-1 mt-2 rounded-full overflow-hidden"
                      >
                        <motion.div
                          className="bg-green-500 h-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 4 }} // Slightly shorter than expected timeout
                        />
                      </motion.div>
                    </div>
                  ) : (
                    <>
                      <span className="text-base">
                        Upgrade to {isProUser ? 'Ultimate' : 'Pro'}
                      </span>
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubscribeClick}
                  disabled={isLoading}
                  className="w-full bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-3 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center shadow-md"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Processing...</span>
                      </div>
                      {/* Progress bar for better UX */}
                      <motion.div 
                        className="w-full bg-[var(--border)] h-1 mt-2 rounded-full overflow-hidden"
                      >
                        <motion.div
                          className="bg-green-500 h-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 4 }} // Slightly shorter than expected timeout
                        />
                      </motion.div>
                    </div>
                  ) : (
                    <>
                      <span className="text-base">
                        Upgrade to {selectedTier === 'premium' ? 'Standard' : selectedTier === 'pro' ? 'Pro' : 'Visionary'}
                      </span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumModal;