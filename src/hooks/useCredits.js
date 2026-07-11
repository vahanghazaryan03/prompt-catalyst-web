// src/hooks/useCredits.js
import { useCredit } from '../contexts/CreditContext';

export const useCredits = () => {
  const { credits, loading, error, refreshCredits } = useCredit();
  
  return {
    credits,
    loading,
    error,
    refresh: refreshCredits
  };
};