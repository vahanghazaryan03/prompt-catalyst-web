// src/contexts/CommunityContext.js

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import communityApi from '../services/communityApi';
import { useToast } from './ToastContext';

const CommunityContext = createContext();

export const CommunityProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPrompts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityApi.getPrompts({
        ...params,
        page: params.page || currentPage
      });
      
      if (params.page === 1) {
        setPrompts(response.prompts);
      } else {
        setPrompts(prev => [...prev, ...response.prompts]);
      }
      
      setHasMore(response.hasMore);
      setCurrentPage(params.page || currentPage);
    } catch (err) {
      setError(err.message);
      showToast({
        title: 'Error',
        message: 'Failed to load community prompts',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, showToast]);

  const submitPrompt = async (promptData) => {
    try {
      setLoading(true);
      const response = await communityApi.submitPrompt(promptData);
      showToast({
        title: 'Success',
        message: 'Your prompt has been submitted for review',
        type: 'success'
      });
      return response;
    } catch (err) {
      showToast({
        title: 'Error',
        message: err.message || 'Failed to submit prompt',
        type: 'error'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const likePrompt = async (promptId) => {
    if (!user) {
      showToast({
        title: 'Login Required',
        message: 'Please login to like prompts',
        type: 'info'
      });
      return;
    }

    try {
      await communityApi.likePrompt(promptId);
      setPrompts(prev =>
        prev.map(prompt =>
          prompt.id === promptId
            ? { ...prompt, likesCount: prompt.likesCount + 1, isLiked: true }
            : prompt
        )
      );
    } catch (err) {
      showToast({
        title: 'Error',
        message: 'Failed to like prompt',
        type: 'error'
      });
    }
  };

  const unlikePrompt = async (promptId) => {
    try {
      await communityApi.unlikePrompt(promptId);
      setPrompts(prev =>
        prev.map(prompt =>
          prompt.id === promptId
            ? { ...prompt, likesCount: prompt.likesCount - 1, isLiked: false }
            : prompt
        )
      );
    } catch (err) {
      showToast({
        title: 'Error',
        message: 'Failed to unlike prompt',
        type: 'error'
      });
    }
  };

  const recordUse = async (promptId, useType) => {
    try {
      await communityApi.recordUse(promptId, useType);
      setPrompts(prev =>
        prev.map(prompt =>
          prompt.id === promptId
            ? { ...prompt, usesCount: prompt.usesCount + 1 }
            : prompt
        )
      );
    } catch (err) {
      console.error('Failed to record prompt use:', err);
    }
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPrompts({ page: currentPage + 1 });
    }
  }, [loading, hasMore, currentPage, fetchPrompts]);

  const value = {
    prompts,
    loading,
    error,
    hasMore,
    fetchPrompts,
    submitPrompt,
    likePrompt,
    unlikePrompt,
    recordUse,
    loadMore
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};