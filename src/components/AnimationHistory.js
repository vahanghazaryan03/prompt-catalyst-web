// src/components/AnimationHistory.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Video, 
  Play, 
  Trash2, 
  Download, 
  Clock,
  AlertTriangle,
  Info,
  Search,
  X,
  Settings,
  SlidersHorizontal,
  List,
  Tag,
  Cloud,
  RefreshCw,
  Loader,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { createFallbackThumbnail } from '../utils/animationStorage';
import { useAnimationHistory } from '../hooks/useAnimationHistory';
import useAnimationStore from '../contexts/AnimationStore';

const AnimationHistory = ({ 
  onSelect, 
  onDelete: externalOnDelete,
  onDownload, 
  currentVideoId = null,
  onProUpgradeClick,
  isProMember,
  isGenerating = false // Add isGenerating prop with default value
}) => {
  // Pagination settings
  const ITEMS_PER_PAGE = 20; // Show 20 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {
    history,
    loading,
    error,
    refreshHistory,
    deleteAnimation
  } = useAnimationHistory();

  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('animationHistoryViewMode') || 'compact';
  });
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('animationHistorySortBy') || 'newest';
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addToast } = useToast();
  const settingsRef = useRef(null);
  
  // Get trash state from store
  const isTrashOpen = useAnimationStore(state => state.isTrashOpen);
  const toggleTrashView = useAnimationStore(state => state.toggleTrashView);
  
  // Initialize the ref for previous trash state after we have isTrashOpen value
  const prevTrashStateRef = useRef(isTrashOpen);
  
  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('animationHistoryViewMode', viewMode);
  }, [viewMode]);

  // Save sort preference
  useEffect(() => {
    localStorage.setItem('animationHistorySortBy', sortBy);
  }, [sortBy]);
  
  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Check for recently added animations and auto-refresh - with optimization
  useEffect(() => {
    // Track last refresh time to prevent too frequent refreshes
    let lastRefreshTime = Date.now();
    
    const checkForRecentAdditions = () => {
      try {
        const recentlyAdded = sessionStorage.getItem('animation_recently_added');
        if (recentlyAdded) {
          const addedTime = parseInt(recentlyAdded, 10);
          const currentTime = Date.now();
          
          // Only refresh if we added something recently AND haven't refreshed in the last 3 seconds
          if (currentTime - addedTime < 2000 && currentTime - lastRefreshTime > 3000) {
            refreshHistory();
            // Update last refresh time
            lastRefreshTime = currentTime;
            // Clear the flag after refreshing
            sessionStorage.removeItem('animation_recently_added');
          }
        }
      } catch (e) {
        // Ignore storage errors
      }
    };
    
    // Check less frequently - every 3 seconds instead of every second
    const interval = setInterval(checkForRecentAdditions, 3000);
    
    return () => clearInterval(interval);
  }, [refreshHistory]);
  
  // Watch for trash view toggle and refresh history only when returning from trash
  useEffect(() => {
    // Only refresh when transitioning FROM trash TO history
    if (prevTrashStateRef.current === true && isTrashOpen === false) {
      // When switching from trash to history view, refresh
      refreshHistory();
    }
    
    // Update previous state for next change
    prevTrashStateRef.current = isTrashOpen;
  }, [isTrashOpen, refreshHistory]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force a refresh without using the cache
      await refreshHistory();
     
    } catch (err) {
      addToast('Failed to refresh animation history', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle deleting animation
  const handleDelete = (id) => {
    if (typeof externalOnDelete === 'function') {
      externalOnDelete(id);
    }
    deleteAnimation(id);
  };

  // Extract unique categories from history
  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    history.forEach(item => {
      if (item.categoryId) {
        uniqueCategories.add(item.categoryId);
      } else if (item.categoryName) {
        uniqueCategories.add(item.categoryName);
      }
    });
    return ['all', ...Array.from(uniqueCategories)];
  }, [history]);

  // Get trashed animations to filter them out of history
  const trashedAnimations = useAnimationStore(state => state.trashedAnimations || []);
  
  // Helper function to check if an animation is in the trash
  // Enhanced to also check localStorage directly for better reliability on initial load
  const isInTrash = useCallback((animation) => {
    // First try the store state
    const trashStateCheck = trashedAnimations.some(trashItem => 
      // Check by ID
      (trashItem.id && animation.id && trashItem.id === animation.id) ||
      // Check by URL as fallback
      (trashItem.url && animation.url && trashItem.url === animation.url)
    );
    
    // If we found it in the store state, return true immediately
    if (trashStateCheck) return true;
    
    // Double-check localStorage directly as a fallback for initial page load
    try {
      const localStorageTrash = localStorage.getItem('animation_trashed_items');
      if (localStorageTrash) {
        const parsedTrash = JSON.parse(localStorageTrash);
        return parsedTrash.some(trashItem => 
          // Check by ID
          (trashItem.id && animation.id && trashItem.id === animation.id) ||
          // Check by URL as fallback
          (trashItem.url && animation.url && trashItem.url === animation.url)
        );
      }
    } catch (e) {
      // Ignore localStorage errors, rely on store state
      console.warn('Error checking localStorage for trash state:', e);
    }
    
    // If we get here, it's not in the trash
    return false;
  }, [trashedAnimations]);
  
  // Filter history based on search query, category, and exclude trashed items
  const filteredHistory = history.filter(item => {
    // First check if item is in trash - if so, exclude it
    if (isInTrash(item)) return false;
    
    // Then filter by search query
    const searchMatches = !searchQuery || 
      (item.presetName || item.movement || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.prompt || '')?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then filter by category
    const categoryMatches = categoryFilter === 'all' || 
      item.categoryId === categoryFilter || 
      item.categoryName === categoryFilter;
    
    return searchMatches && categoryMatches;
  });

  // Sort history
  const sortedHistory = useMemo(() => [...filteredHistory].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else if (sortBy === 'oldest') {
      return new Date(a.timestamp) - new Date(b.timestamp);
    } else if (sortBy === 'duration') {
      return b.duration - a.duration;
    } else if (sortBy === 'category') {
      // Sort by category then by name within category
      const catA = a.categoryName || '';
      const catB = b.categoryName || '';
      if (catA === catB) {
        return (a.presetName || a.movement || '').localeCompare(b.presetName || b.movement || '');
      }
      return catA.localeCompare(catB);
    }
    return 0;
  }), [filteredHistory, sortBy]);
  
  // Calculate paginated content
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedHistory.slice(startIndex, endIndex);
  }, [sortedHistory, currentPage, ITEMS_PER_PAGE]);
  
  // Update total pages whenever sorted history changes
  useEffect(() => {
    setTotalPages(Math.ceil(sortedHistory.length / ITEMS_PER_PAGE));
    // Reset to page 1 when filters change
    if (currentPage > 1 && sortedHistory.length <= ITEMS_PER_PAGE) {
      setCurrentPage(1);
    }
  }, [sortedHistory, ITEMS_PER_PAGE, currentPage]);

  // Show loading state if not expanded
  if (loading && !isExpanded) {
    return (
      <div className="w-full mt-6 border-t border-[var(--border)] pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-1 text-[var(--text)] hover:text-[var(--primary)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <h3 className="text-base font-medium">Animation History</h3>
              <span className="text-xs text-[var(--text)]/60 bg-[var(--border)] px-1.5 py-0.5 rounded animate-pulse">
                Loading...
              </span>
            </div>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Early return with null, but after all hooks have been called
  if (history.length === 0 && !loading && !error) {
    return null;
  }

  // Render category filter pills if we have categories
  const renderCategoryFilter = () => {
    if (categories.length <= 2) return null; // Only "all" category or empty
    
    return (
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="text-xs text-[var(--textSecondary)]">Filter:</span>
        {categories.map(category => (
          <button 
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`px-2 py-1 text-xs rounded-full flex items-center gap-1
              ${categoryFilter === category 
                ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/40' 
                : 'bg-[var(--cardBackground)] text-[var(--textSecondary)] border border-[var(--border)] hover:bg-[var(--dropdownHover)]'
              } transition-colors`}
          >
            {category === 'all' ? 'All Types' : category}
            {categoryFilter === category && category !== 'all' && (
              <X size={12} className="ml-1" onClick={(e) => {
                e.stopPropagation();
                setCategoryFilter('all');
              }} />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full mt-6 border-t border-[var(--border)] pt-4">
      {/* Section Header */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-1 text-[var(--text)] hover:text-[var(--primary)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock size={16} className="ml-3 mb-1"/>
              <h3 className="text-base font-medium mb-1">Animation History</h3>
              <span className="text-xs text-[var(--text)]/60 bg-[var(--border)] px-1.5 py-0.5 rounded">
                {history.length}
              </span>
              <div className="relative group">
                <Cloud size={14} className="text-[var(--text)] mb-1 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[var(--cardBackground)] text-xs text-[var(--text)] whitespace-nowrap rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg border border-[var(--border)]">
                  Cloud Storage
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-[45%] w-2 h-2 bg-[var(--cardBackground)] border-r border-b border-[var(--border)] rotate-45"></div>
                </div>
              </div>
            </div>
            
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isExpanded && (
            <div className="flex items-center gap-2 relative">
              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-[var(--border)] transition-colors"
                title="Refresh animation history"
                disabled={isRefreshing || loading}
              >
                {isRefreshing ? (
                  <Loader size={16} className="text-[var(--text)] animate-spin" />
                ) : (
                  <RefreshCw size={16} className="text-[var(--text)]" />
                )}
              </button>
              
              {/* Trash toggle button */}
              <button
              onClick={toggleTrashView}
              className={`hidden p-1.5 rounded-full transition-colors ${isTrashOpen ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-[var(--border)] text-white'}`}
              title={isTrashOpen ? "Return to animation history" : "View trash"}
              >
              {isTrashOpen ? 
              <RotateCcw size={16} /> : 
              <Trash2 size={16} />
              }
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'compact' ? 'grid' : 'compact')}
                className="p-1.5 rounded-full hover:bg-[var(--border)] transition-colors"
                title={viewMode === 'compact' ? "Switch to grid view" : "Switch to list view"}
              >
                {viewMode === 'compact' ? 
                  <SlidersHorizontal size={16} className="text-[var(--text)]" /> : 
                  <List size={16} className="text-[var(--text)]"/>
                }
              </button>
              
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-full hover:bg-[var(--border)] transition-colors"
                  title="History settings"
                >
                  <Settings size={16} className="text-[var(--text)]" />
                </button>
                
                {showSettings && (
                  <div className="absolute right-0 mt-1 z-10 w-48 rounded-md shadow-lg bg-[var(--dropdownBackground)] border border-[var(--border)]">
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-[var(--textSecondary)]">
                        Sort By
                      </div>
                      <button
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${sortBy === 'newest' ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}
                        onClick={() => setSortBy('newest')}
                      >
                        Newest First
                      </button>
                      <button
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${sortBy === 'oldest' ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}
                        onClick={() => setSortBy('oldest')}
                      >
                        Oldest First
                      </button>
                      <button
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${sortBy === 'duration' ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}
                        onClick={() => setSortBy('duration')}
                      >
                        By Duration
                      </button>
                      <button
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${sortBy === 'category' ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}
                        onClick={() => setSortBy('category')}
                      >
                        By Category
                      </button>
                      
                      <div className="border-t border-[var(--border)] my-1"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Display error message if there's an error */}
        {error && (
          <div className="p-4 text-center text-red-500 bg-red-500/10 rounded-lg border border-red-500/30">
            <AlertTriangle size={24} className="mx-auto mb-2" />
            <p className="text-sm">{error}</p>
            <button 
              onClick={refreshHistory}
              className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Search bar - only visible when expanded */}
        {isExpanded && !error && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search animations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-8 pr-8 text-sm text-white bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[var(--textSecondary)]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-[var(--textSecondary)] hover:text-[var(--text)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        
        {/* Category filter pills */}
        {isExpanded && renderCategoryFilter()}
      </div>
      
      {/* Enhanced Loading state */}
      {loading && isExpanded && !window.ignoreHistoryLoadingAnimation && (
        <div>
          {/* Skeleton loader for better UX */}
          <div className="flex items-center justify-center p-4">
          <Loader size={24} className="animate-spin text-[var(--primary)] mr-2" />
          <span className="text-[var(--text)]">Loading animation history...</span>
          </div>
          
          {/* Skeleton grid or list */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--cardBackground)]"
                >
                  {/* Thumbnail skeleton */}
                  <div className="w-full aspect-video bg-[var(--border)] animate-pulse"></div>
                  
                  {/* Info skeleton */}
                  <div className="p-2">
                    <div className="h-4 bg-[var(--border)] rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-[var(--border)] rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg border border-[var(--border)] bg-[var(--cardBackground)]"
                >
                  {/* Thumbnail skeleton */}
                  <div className="w-28 h-16 bg-[var(--border)] rounded animate-pulse"></div>
                  
                  {/* Info skeleton */}
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--border)] rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-[var(--border)] rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Expandable History List */}
      <AnimatePresence>
        {isExpanded && !loading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Empty state when filtered */}
            {sortedHistory.length === 0 && (searchQuery || categoryFilter !== 'all') && (
              <div className="p-4 text-center bg-[var(--cardBackground)] rounded-lg border border-[var(--border)]">
                <Info size={24} className="mx-auto mb-2 text-[var(--textSecondary)]" />
                <p className="text-sm text-[var(--textSecondary)]">No animations matching your criteria</p>
              </div>
            )}
            

            
            {/* Empty state when no history */}
            {history.length === 0 && (
              <div className="p-4 text-center bg-[var(--cardBackground)] rounded-lg border border-[var(--border)]">
                <Video size={24} className="mx-auto mb-2 text-[var(--textSecondary)]" />
                <p className="text-sm text-[var(--textSecondary)]">No animation history yet</p>
                <p className="text-xs text-[var(--textSecondary)] mt-1">
                  Upload an image and generate an animation to see it here
                </p>
              </div>
            )}
            
            {/* Grid View */}
            {viewMode === 'grid' && sortedHistory.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                {paginatedHistory.map((animation) => (
                  <AnimationGridItem
                    key={animation.id}
                    animation={animation}
                    isSelected={currentVideoId === animation.id}
                    onSelect={() => onSelect(animation)}
                    onDelete={() => handleDelete(animation.id)}
                    onDownload={() => onDownload(animation)}
                    isProMember={isProMember}
                    onProUpgradeClick={onProUpgradeClick}
                    isGenerating={isGenerating}
                  />
                ))}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'compact' && sortedHistory.length > 0 && (
              <div className="space-y-2 mt-3">
                {paginatedHistory.map((animation) => (
                  <AnimationListItem
                    key={animation.id}
                    animation={animation}
                    isSelected={currentVideoId === animation.id}
                    onSelect={() => onSelect(animation)}
                    onDelete={() => handleDelete(animation.id)}
                    onDownload={() => onDownload(animation)}
                    isProMember={isProMember}
                    onProUpgradeClick={onProUpgradeClick}
                    isGenerating={isGenerating}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination Controls - Moved to bottom */}
            {sortedHistory.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-6 mb-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--border)] transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} className="text-[var(--text)]" />
                </button>
                
                <span className="text-sm text-[var(--text)]">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--border)] transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} className="text-[var(--text)]" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Grid Item component for animations
const AnimationGridItem = ({ 
  animation, 
  isSelected, 
  onSelect, 
  onDelete, 
  onDownload,
  isProMember,
  onProUpgradeClick,
  isGenerating
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  
  // Effect to handle thumbnail loading with fal.media support
  useEffect(() => {
    if (!animation) return;
    
    // Create a cleanup function for any created object URLs
    let objectUrl = null;
    
    const loadThumbnail = async () => {
      try {
        // Check if this is a fal.media URL and we have their special handler
        if (animation.url && animation.url.includes('fal.media')) {
          try {
            // Dynamically import the fal.media thumbnail generator to avoid loading it unnecessarily
            const { generateFalMediaThumbnail } = await import('../utils/falMediaThumbnail');
            
            // Generate thumbnail from the video URL
            const thumbnail = await generateFalMediaThumbnail(animation.url, {
              width: 320,
              height: 180
            });
            
            if (thumbnail) {
              setThumbnailSrc(thumbnail);
              return; // Successfully generated thumbnail, exit early
            }
          } catch (falMediaError) {
            // Continue to fallback methods
          }
        }
        
        // Try to get the thumbnail from the animation object (standard approach)
        const source = animation.thumbnail || animation.thumbnailDataUrl;
        
        if (source) {
          // First, test if this is a data URL by checking the prefix
          if (source.startsWith('data:image/')) {
            // It's a data URL, we can use it directly
            setThumbnailSrc(source);
          } 
          // Check if it's a URL that needs to be fetched (not a data URL)
          else if (source.startsWith('http')) {
            // For network URLs, we'll create a new Image to test loading
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Create a Promise to handle the image loading
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              
              // Set timeout to avoid hanging
              const timeout = setTimeout(() => {
                reject(new Error('Thumbnail load timeout'));
              }, 5000);
              
              // Set the source to trigger loading
              img.src = source;
              
              // Cleanup timeout on success
              img.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
            });
            
            // If we get here, the image loaded successfully
            setThumbnailSrc(source);
          }
          else {
            // Neither a data URL nor a valid network URL, fallback
            throw new Error('Invalid thumbnail source format');
          }
        } else {
          // No thumbnail available at all
          throw new Error('No thumbnail source available');
        }
      } catch (error) {
        setThumbnailError(true);
        
        // Generate a fallback thumbnail
        try {
          // Use preset name if available, otherwise fall back to movement
          const text = animation?.presetName || animation?.movement || 'Animation';
          const fallbackThumbnail = createFallbackThumbnail(text, 320, 180);
          setThumbnailSrc(fallbackThumbnail);
        } catch (fallbackError) {
          // Silent error handling
        }
      }
    };
    
    // Start the thumbnail loading process
    loadThumbnail();
    
    // Cleanup function
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [animation]);
  
  // Create fallback thumbnail if there's an error or no thumbnail
  const handleThumbnailError = () => {
    setThumbnailError(true);
    
    // Generate a new fallback each time there's an error
    try {
      // Use preset name if available, otherwise fall back to movement
      const text = animation?.presetName || animation?.movement || 'Animation';
      
      // Create fallback with a unique timestamp to avoid caching issues
      const timestamp = Date.now();
      const fallbackThumbnail = createFallbackThumbnail(`${text} #${timestamp}`, 320, 180);
      
      // Short delay before setting new source to avoid potential loading loop
      setTimeout(() => {
        setThumbnailSrc(fallbackThumbnail);
      }, 100);
    } catch (error) {
      // Last resort - set a solid color placeholder with text
      setThumbnailSrc('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="%23333"/><text x="160" y="90" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Animation</text></svg>');
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get animation display name (preferring newer preset fields)
  const getAnimationName = () => {
    // Use presetName if available, but for presets display their name as is
    if (animation.presetId && animation.movement) {
      return animation.movement; // Use movement as it now correctly holds the preset name
    }
    return animation.presetName || animation.movement || 'Unknown Animation';
  };
  
  // Handle video playback restrictions for non-pro users and prevent during generation
  const handleItemClick = () => {
    // Don't allow selection during generation
    if (isGenerating) {
      return; // Just return without doing anything during generation
    }
    
    // If non-pro member trying to play a pro animation, show upgrade prompt
    if (!isProMember && animation.requiresPro) {
      if (typeof onProUpgradeClick === 'function') {
        onProUpgradeClick();
      }
    } else {
      onSelect();
    }
  };
  
  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${
        isSelected 
          ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
          : 'border-[var(--border)] bg-[var(--cardBackground)] hover:bg-[var(--dropdownHover)]'
      } transition-colors ${isGenerating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={handleItemClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div 
        className="w-full aspect-video bg-[var(--inputBackground)] relative flex items-center justify-center"
      >
        {thumbnailError || !thumbnailSrc ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--inputBackground)]">
            <Video size={24} className="text-[var(--textSecondary)] mb-1" />
            <span className="text-xs text-[var(--textSecondary)]">{getAnimationName()}</span>
          </div>
        ) : (
          <img
            src={thumbnailSrc}
            alt={getAnimationName()}
            className="w-full h-full object-contain bg-[var(--inputBackground)]" 
            onError={handleThumbnailError}
            crossOrigin="anonymous"
          />
        )}
        
        {/* Category badge */}
        {animation.categoryName && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 text-xs bg-[var(--background)]/70 text-[var(--text)] rounded-full">
            {animation.categoryName}
          </div>
        )}
        
        {/* Duration badge */}
        <div className="absolute bottom-1 right-1 flex space-x-1">
          <span className="px-1.5 py-0.5 text-xs bg-[var(--background)]/60 rounded text-[var(--text)]">
            {animation.duration}s
          </span>
        </div>
        

        
        {/* Pro badge if applicable */}
        {animation.requiresPro && !isProMember && (
          <div className="absolute top-1 right-1 px-1.5 py-0.5 text-xs bg-yellow-600/80 text-yellow-200 font-medium rounded">
            PRO
          </div>
        )}
        
        {/* Play overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/50">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/90 flex items-center justify-center">
              <Play size={18} className="text-[var(--background)] ml-0.5" />
            </div>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-2">
        <div className="flex items-center mb-1">
          <Video size={14} className="text-[var(--primary)] mr-1.5 flex-shrink-0" />
          <span className="text-sm font-medium text-[var(--text)] truncate">
            {getAnimationName()}
          </span>
        </div>
        <div className="flex items-center text-xs text-[var(--textSecondary)]">
          {formatDate(animation.timestamp)}

          {animation.prompt && (
            <span className="ml-2 truncate max-w-xs opacity-75" title={animation.prompt}>
              {animation.isPresetPrompt ? '• Using preset' : '• Custom prompt'}
            </span>
          )}
        </div>
      </div>
      
      {/* Actions - only visible on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1 right-1 flex gap-1 p-1 rounded bg-[var(--background)]/70"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onDownload === 'function') {
                  onDownload();
                }
              }}
              className="p-1.5 rounded-full text-[var(--text)] hover:text-[var(--primary)] hover:bg-[var(--text)]/10 transition-colors"
              title="Download animation"
            >
              <Download size={14} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onDelete === 'function') {
                  onDelete(animation.id);
                }
              }}
              className="p-1.5 rounded-full text-[var(--text)] hover:text-red-500 hover:bg-[var(--text)]/10 transition-colors"
              title="Move to trash"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// List Item component for animations
const AnimationListItem = ({ 
  animation, 
  isSelected, 
  onSelect, 
  onDelete, 
  onDownload,
  isProMember,
  onProUpgradeClick,
  isGenerating
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  
  // Effect to handle thumbnail loading with fal.media support
  useEffect(() => {
    if (!animation) return;
    
    // Create a cleanup function for any created object URLs
    let objectUrl = null;
    
    const loadThumbnail = async () => {
      try {
        // Check if this is a fal.media URL and handle it specially
        if (animation.url && animation.url.includes('fal.media')) {
          try {
            // Dynamically import the fal.media thumbnail generator
            const { generateFalMediaThumbnail } = await import('../utils/falMediaThumbnail');
            
            // Generate thumbnail directly from the video URL
            const thumbnail = await generateFalMediaThumbnail(animation.url, {
              width: 112,  // Smaller size for list view
              height: 63
            });
            
            if (thumbnail) {
              setThumbnailSrc(thumbnail);
              return; // Successfully generated thumbnail, exit early
            }
          } catch (falMediaError) {
            // Continue to fallback methods
          }
        }
        
        // Try to get the thumbnail from the animation object
        const source = animation.thumbnail || animation.thumbnailDataUrl;
        
        if (source) {
          // First, test if this is a data URL by checking the prefix
          if (source.startsWith('data:image/')) {
            // It's a data URL, we can use it directly
            setThumbnailSrc(source);
          } 
          // Check if it's a URL that needs to be fetched (not a data URL)
          else if (source.startsWith('http')) {
            // For network URLs, we'll create a new Image to test loading
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Create a Promise to handle the image loading
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              
              // Set timeout to avoid hanging
              const timeout = setTimeout(() => {
                reject(new Error('Thumbnail load timeout'));
              }, 5000);
              
              // Set the source to trigger loading
              img.src = source;
              
              // Cleanup timeout on success
              img.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
            });
            
            // If we get here, the image loaded successfully
            setThumbnailSrc(source);
          }
          else {
            // Neither a data URL nor a valid network URL, fallback
            throw new Error('Invalid thumbnail source format');
          }
        } else {
          // No thumbnail available at all
          throw new Error('No thumbnail source available');
        }
      } catch (error) {
        setThumbnailError(true);
        
        // Generate a fallback thumbnail
        try {
          // Use preset name if available, otherwise fall back to movement
          const text = animation?.presetName || animation?.movement || 'Animation';
          const fallbackThumbnail = createFallbackThumbnail(text, 112, 63);
          setThumbnailSrc(fallbackThumbnail);
        } catch (fallbackError) {
          // Silent error handling
        }
      }
    };
    
    // Start the thumbnail loading process
    loadThumbnail();
    
    // Cleanup function
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [animation]);
  
  // Create fallback thumbnail if there's an error or no thumbnail
  const handleThumbnailError = () => {
    setThumbnailError(true);
    
    // Generate a fallback thumbnail
    try {
      const text = animation?.presetName || animation?.movement || 'Animation';
      const fallbackThumbnail = createFallbackThumbnail(text, 112, 63);
      setThumbnailSrc(fallbackThumbnail);
    } catch (error) {
      // Silent error handling
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get animation display name (preferring newer preset fields)
  const getAnimationName = () => {
    // Use presetName if available, but for presets display their name as is
    if (animation.presetId && animation.movement) {
      return animation.movement; // Use movement as it now correctly holds the preset name
    }
    return animation.presetName || animation.movement || 'Unknown Animation';
  };
  
  // Handle video playback restrictions for non-pro users and prevent during generation
  const handleItemClick = () => {
    // Don't allow selection during generation
    if (isGenerating) {
      return; // Just return without doing anything during generation
    }
    
    // If non-pro member trying to play a pro animation, show upgrade prompt
    if (!isProMember && animation.requiresPro) {
      if (typeof onProUpgradeClick === 'function') {
        onProUpgradeClick();
      }
    } else {
      onSelect();
    }
  };
  
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg border ${
        isSelected 
          ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
          : 'border-[var(--border)] bg-[var(--cardBackground)] hover:bg-[var(--dropdownHover)]'
      } transition-colors ${isGenerating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={handleItemClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-16 rounded overflow-hidden bg-[var(--inputBackground)] flex-shrink-0">
        {thumbnailError || !thumbnailSrc ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--inputBackground)]">
            <Video size={20} className="text-[var(--textSecondary)]" />
            <span className="text-xs text-[var(--textSecondary)] mt-1">{getAnimationName()}</span>
          </div>
        ) : (
          <img
            src={thumbnailSrc}
            alt={getAnimationName()}
            className="w-full h-full object-contain bg-[var(--inputBackground)]" 
            onError={handleThumbnailError}
            crossOrigin="anonymous"
          />
        )}
        

        
        {/* Pro badge if applicable */}
        {animation.requiresPro && !isProMember && (
          <div className="absolute top-1 right-1 px-1.5 py-0.5 text-xs bg-yellow-600/80 text-yellow-200 font-medium rounded">
            PRO
          </div>
        )}
        
        {/* Duration and resolution badges */}
        <div className="absolute bottom-1 right-1 flex space-x-1">
          <span className="px-1.5 py-0.5 text-xs bg-[var(--background)]/60 rounded text-[var(--text)]">
            {animation.duration}s
          </span>
          {
            <span className="px-1.5 py-0.5 text-xs bg-[var(--background)]/60 rounded text-[var(--text)]">
              {animation.requestedResolution === '1080p' ? '1080p' : (animation.resolution || '720p')}
            </span>
          }
        </div>
        
        {/* Play overlay on hover */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/50">
            <Play size={18} className="text-[var(--primary)]" />
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
        <Video size={14} className="text-[var(--primary)] mr-1.5 flex-shrink-0" />
        <span className="text-sm font-medium text-[var(--text)] truncate">
        {getAnimationName()}
        </span>
        

        
        {/* Category tag - only if available */}
        {animation.categoryName && (
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-[var(--border)] rounded-full text-[var(--textSecondary)] flex items-center">
                <Tag size={10} className="mr-1" />
                {animation.categoryName}
              </span>
            )}
          </div>
        
        <div className="flex items-center mt-1 text-xs text-[var(--textSecondary)]">
          <span>{formatDate(animation.timestamp)}</span>
          
          {animation.prompt && (
            <span className="ml-2 truncate max-w-xs opacity-75" title={animation.prompt}>
              {animation.isPresetPrompt ? '• Using preset' : '• Custom prompt: ' + animation.prompt}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
            isHovered ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--textSecondary)]'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onDownload === 'function') {
              onDownload();
            }
          }}
          title="Download animation"
        >
          <Download size={14} />
        </button>
        
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
            isHovered ? 'text-red-500 bg-red-500/10' : 'text-[var(--textSecondary)]'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onDelete === 'function') {
              onDelete(animation.id);
            }
          }}
          title="Move to trash"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default AnimationHistory;