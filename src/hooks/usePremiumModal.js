import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const usePremiumModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Determine if user is on a Pro plan
  const isProUser = user?.isProMember || false;
  
  // Determine if user is on a Premium plan
  const isPremiumUser = user?.isPremium && !isProUser;

  const openPremiumModal = useCallback(() => {
    // Allow opening the modal for non-subscribers and Premium users, but not Pro users
    if (!isProUser) {
      setIsOpen(true);
    }
  }, [isProUser]);

  const closePremiumModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openPremiumModal,
    closePremiumModal,
    isPremium: user?.isPremium || false,
    isPremiumUser,
    isProUser
  };
};