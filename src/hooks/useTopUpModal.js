import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useTopUpModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Determine if user is a paid user (Premium or Pro)
  const isPaidUser = user?.isPremium || false;

  const openTopUpModal = useCallback(() => {
    // Only paid users can top up credits
    if (isPaidUser) {
      setIsOpen(true);
    }
  }, [isPaidUser]);

  const closeTopUpModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openTopUpModal,
    closeTopUpModal,
    isPaidUser
  };
};