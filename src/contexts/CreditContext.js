// src/contexts/CreditContext.js
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const CreditContext = createContext();

const REFRESH_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const THROTTLE_DELAY = 10000; // 10 seconds

export function CreditProvider({ children }) {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creditType, setCreditType] = useState('ip');
  const { user } = useAuth();
  
  const lastRefreshTimestamp = useRef(0);
  const lastCreditsUpdate = useRef(null);
  const refreshTimeout = useRef(null);

  const shouldRefresh = useCallback(() => {
    const now = Date.now();
    return now - lastRefreshTimestamp.current >= THROTTLE_DELAY;
  }, []);

  const fetchCredits = useCallback(async (force = false) => {
    try {
      // Check if we should skip the refresh
      if (!force && !shouldRefresh()) {
        console.log('Credit refresh throttled');
        return lastCreditsUpdate.current;
      }

      setLoading(true);
      const response = await apiService.getCredits();
      
      let type = 'ip';
      if (response.userId) {
        // Check if user is Premium, Pro, or Ultimate
        if (response.isPremium || response.roles?.includes('um_ultimate-member') || 
            response.roles?.includes('um_ultimate-member-yearly')) {
          type = 'premium';
        } else {
          type = 'free';
        }
      }
      
      const creditData = {
        amount: response.credits,
        resetType: response.resetType,
        lastReset: response.lastReset,
        type: type
      };

      setCredits(creditData);
      setCreditType(type);
      setError(null);
      
      // Update timestamps and cache
      lastRefreshTimestamp.current = Date.now();
      lastCreditsUpdate.current = creditData;

      return creditData;
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [shouldRefresh]);

  // Function to be called after credit-consuming operations
  const refreshCredits = useCallback(async () => {
   
    return fetchCredits(true); // Force refresh after operations
  }, [fetchCredits]);

  // Set up automatic refresh interval
  useEffect(() => {
    const setupRefreshInterval = () => {
      if (refreshTimeout.current) {
        clearInterval(refreshTimeout.current);
      }
      
      refreshTimeout.current = setInterval(() => {
        console.log('Automatic credit refresh');
        fetchCredits(true);
      }, REFRESH_INTERVAL);
    };

    // Initial fetch
    fetchCredits(true);
    setupRefreshInterval();

    return () => {
      if (refreshTimeout.current) {
        clearInterval(refreshTimeout.current);
      }
    };
  }, [fetchCredits, user]);

  const value = {
    credits: credits?.amount,
    creditType,
    resetType: credits?.resetType,
    lastReset: credits?.lastReset,
    loading,
    error,
    refreshCredits
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredit() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredit must be used within a CreditProvider');
  }
  return context;
}