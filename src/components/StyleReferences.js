import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import { logger } from '../utils/logger';

const CACHE_KEY = 'styleReferencesCache';
const CACHE_EXPIRY_KEY = 'styleReferencesCacheExpiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const StyleReferences = ({ onPremiumClick }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [styleRefs, setStyleRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(styleRefs.map(style => style.category))];
    return ['all', ...uniqueCategories.sort()];
  }, [styleRefs]);

  // Cache management functions
  const isCacheValid = useCallback(() => {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    return expiry && Date.now() < parseInt(expiry);
  }, []);

  const setCache = useCallback((data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      logger.error('Error setting cache:', error);
    }
  }, []);

  const getCache = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch (error) {
      logger.error('Error getting cache:', error);
      return null;
    }
  }, []);

  // Fetch style references
  const fetchStyleReferences = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);

      if (!forceRefresh && isCacheValid()) {
        const cachedData = getCache();
        if (cachedData) {
          setStyleRefs(cachedData);
          setLoading(false);
          return;
        }
      }

      const { styleReferenceCodes } = await apiService.getStyleReferences();
      setStyleRefs(styleReferenceCodes);
      setCache(styleReferenceCodes);
      setError(null);
    } catch (err) {
      logger.error('Error fetching style references:', err);
      setError('Failed to load style references');
      
      const cachedData = getCache();
      if (cachedData) {
        setStyleRefs(cachedData);
        addToast('Using cached data. Pull to refresh for latest updates.', 'info');
      }
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, getCache, setCache, addToast]);

  // Initial load
  useEffect(() => {
    fetchStyleReferences();
  }, [fetchStyleReferences]);

  // Copy to clipboard handler
  const copyToClipboard = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      addToast('Code copied to clipboard!', 'success');
    } catch (err) {
      logger.error('Failed to copy code:', err);
      addToast('Failed to copy code', 'error');
    }
  }, [addToast]);

  // Filter and sort references
 // Modified code to maintain server order
const filteredRefs = useMemo(() => {
  return styleRefs
    .filter(style => {
      const matchesSearch = 
        style.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        style.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        style.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
    // Removed the sort method to preserve original order
}, [styleRefs, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent"></div>
      </div>
    );
  }

  if (error && !styleRefs.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-[var(--error)] mb-4">{error}</div>
        <button
          onClick={() => fetchStyleReferences(true)}
          className="px-4 py-2 bg-[var(--primary)] text-black rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Fixed header */}
      <div className="bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Title and description */}
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">Style Reference Codes Library</h2>
              <p className="text-[var(--textSecondary)]">
                Add these codes to your Midjourney prompts to influence their visual style.
              </p>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--inputBackground)] border border-[var(--inputBorder)] rounded-md text-[var(--text)] placeholder-[var(--textSecondary)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--textSecondary)]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => fetchStyleReferences(true)}
                className="p-2 bg-[var(--inputBackground)] rounded-md"
                title="Refresh"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[var(--textSecondary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedCategory === category
                      ? 'bg-[var(--primary)] text-[var(--background)]'
                      : 'bg-[var(--inputBackground)] text-[var(--textSecondary)]'
                    }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="text-sm text-[var(--textSecondary)]">
              Showing {filteredRefs.length} {filteredRefs.length === 1 ? 'style' : 'styles'}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>
        </div>
      </div>

      {/* Grid content */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRefs.length === 0 ? (
              <div className="col-span-full text-center text-[var(--textSecondary)] py-8">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'No matching styles found.' 
                  : 'No styles available.'}
              </div>
            ) : (
              [...filteredRefs, 'premium-teaser'].map((style, index) => {
                if (style === 'premium-teaser' && !user?.isPremium) {
                  return (
                    <div key="premium-teaser" className="bg-[var(--cardBackground)] rounded-lg overflow-hidden border border-[var(--border)] relative">
                      <div className="aspect-video bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 relative overflow-hidden">
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                            <svg 
                              className="w-8 h-8 text-[var(--primary)]" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            >
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                            Unlock More Styles
                          </h3>
                          <p className="text-[var(--textSecondary)] text-sm">
                            Get access to exclusive style codes and advanced customization options
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        
                        <button 
                          className="w-full py-2 px-4 bg-[var(--primary)] text-[var(--background)] rounded-md font-medium"
                          onClick={onPremiumClick}
                        >
                          Upgrade
                        </button>
                      </div>
                    </div>
                  );
                }
                if (style === 'premium-teaser') return null;
                
                return (
                  <div
                    key={index}
                    className={`bg-[var(--cardBackground)] rounded-lg overflow-hidden border border-[var(--border)] ${
                      style.isPremium && !user?.isPremium ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={style.image}
                        alt={style.description}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {style.isPremium && !user?.isPremium && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="px-3 py-1.5 bg-[var(--primary)] text-black rounded-full text-sm font-medium">
                              Premium Only
                            </span>
                            <p className="text-white text-sm text-center px-4">
                              Upgrade to access this style
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[var(--text)]">{style.description}</p>
                        <span className="text-xs px-2 py-1 bg-[var(--background)] text-[var(--textSecondary)] rounded-md">
                          {style.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-[var(--background)] rounded-md">
                        <code className="text-[var(--text)] font-mono text-sm">
                          {style.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(style.code)}
                          className={`p-1 rounded-md ${
                            style.isPremium && !user?.isPremium ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          disabled={style.isPremium && !user?.isPremium}
                          title={
                            style.isPremium && !user?.isPremium 
                              ? 'Upgrade to copy this code' 
                              : 'Copy code'
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-[var(--textSecondary)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};