import React, { useState, useEffect, useRef } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PreviewImage } from './PreviewImage';
import MessageActions from './MessageActions';
import { 
  Search, 
  Trash2, 
  Calendar,  
  Video as VideoIcon, 
  Image as ImageIcon,
  Wand2,
  Dices,
  FileText,
  Copy,
  Minimize2,
  AlertCircle,
  X,
  ClipboardCopy,
  Eye,
  Download,
  Upload,
  ShieldCheck,
  Info,
  Edit
} from 'lucide-react';

// Constants for localStorage keys
const PREVIEW_STATE_KEY = 'history_preview_state';
const PROMPT_HISTORY_KEY = 'promptHistory';

const highlightText = (text, searchTerm) => {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-[var(--primary)]/20 text-[var(--text)]">$1</mark>');
};

const formatLabel = (label) => {
  if (!label || label === 'not_specified') return 'Not specified';
  return label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Helper to format arrays of settings values
const formatSettingsArray = (array) => {
  if (!array || !Array.isArray(array) || array.length === 0) return 'Not specified';
  return array.map(item => formatLabel(item)).join(', ');
};

// Load preview URL from cache (used by PreviewImage component)
const getCacheKey = (prompt) => `preview_${prompt}`;

const TYPE_CONFIGS = {
  video: {
    icon: VideoIcon,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    label: 'Video'
  },
  variation: {
    icon: Wand2,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    label: 'Variation'
  },
  random: {
    icon: Dices,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    label: 'Random'
  },
  shortened: {
    icon: Minimize2,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    label: 'Shortened'
  },
  extended: {
    icon: Copy,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    label: 'Extended'
  },
  edited: {
    icon: Edit,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    label: 'Edited'
  },
  imageAnalysis: {
    icon: FileText,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    label: 'Analysis'
  },
  standard: {
    icon: ImageIcon,
    color: 'text-[var(--primary)]',
    bg: 'bg-[var(--primary)]/10',
    label: 'Image'
  }
};

// Helper Components
const SettingItem = ({ label, value }) => (
  <div className="flex items-center gap-2 p-3 bg-[var(--background)]/50 rounded-lg border border-[var(--border)]">
    <span className="text-sm text-[var(--textSecondary)]">{label}:</span>
    <span className="text-sm text-[var(--text)] font-medium">{value}</span>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, active = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
      ${active 
        ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30'
        : 'text-[var(--textSecondary)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10'
      }`}
  >
    <Icon size={16} />
    <span>{label}</span>
  </button>
);

export const HistoryView = ({ 
  onViewChange, 
  handleSubmit, 
  setMessages, 
  setGeneratePrompt,
  onEdit,
  onPremiumClick
}) => {
  // State declarations - all at the top
  const [showingPreviews, setShowingPreviews] = useState(() => {
    try {
      const savedState = localStorage.getItem(PREVIEW_STATE_KEY);
      return savedState ? JSON.parse(savedState) : {};
    } catch (error) {
      console.error('Error loading preview state:', error);
      return {};
    }
  });
  
  // Keep track of manually hidden previews
  const [manuallyHidden, setManuallyHidden] = useState({});
  
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true);
  
  // Ref for file input (for importing history)
  const fileInputRef = useRef(null);
  
  const itemsPerPage = 10;
  const { user } = useAuth();
  const { addToast } = useToast();

  // Filter functions
  const filterByDate = (entry) => {
    const date = new Date(entry.timestamp);
    const now = new Date();
    switch (filterDateRange) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return date >= monthAgo;
      default:
        return true;
    }
  };

  const filterByType = (entry) => {
    if (selectedType === 'all') return true;
    return entry.type === selectedType || entry.promptType === selectedType;
  };
  
  const filterByMode = (entry) => {
    // Filter entries based on current UI mode (ignore if type is explicitly selected)
    if (selectedType !== 'all') return true;
    const isVideoEntry = entry.type === 'video';
    // Get video mode status from the URL or prop - we don't have direct access
    // to isVideoMode from App component, so rely on Window property set in App
    const isVideoMode = typeof window !== 'undefined' ? 
      localStorage.getItem('isVideoMode') === 'true' : false;
    return isVideoEntry === isVideoMode;
  };

  const filterBySearch = (entry) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.description?.toLowerCase().includes(searchLower) ||
      entry.prompts?.toLowerCase().includes(searchLower) ||
      entry.originalPrompt?.toLowerCase().includes(searchLower)
    );
  };

  // Apply filters
  const filteredHistory = history
    .filter(filterByDate)
    .filter(filterByType)
    .filter(filterByMode) // Added filter by mode
    .filter(filterBySearch);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Helper function to check if a preview exists in cache
  const previewExistsInCache = (prompt, historyData) => {
    // Quick check in localStorage
    try {
      const cached = localStorage.getItem(`preview_${prompt}`);
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        return Date.now() - timestamp <= 24 * 60 * 60 * 1000; // 24 hours
      }
    } catch (error) {
      console.error('Error checking local cache:', error);
    }
    
    // Check history entries
    if (!historyData || !Array.isArray(historyData)) return false;
    
    return historyData.some(entry => 
      entry.previewUrls && entry.previewUrls[prompt]
    );
  };

  // Load history and check for existing previews on mount
  useEffect(() => {
    // Check if we need to update based on current mode
    const isCurrentlyVideoMode = localStorage.getItem('isVideoMode') === 'true';
    
    const savedHistory = localStorage.getItem(PROMPT_HISTORY_KEY);
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setHistory(parsedHistory);
      
      // Initialize previews that already exist in cache
      const newPreviewState = { ...showingPreviews };
      let previewStateChanged = false;
      
      // Helper function to check if a preview exists in cache
      const doesPreviewExist = (prompt) => {
        // Check localStorage cache
        try {
          const cacheKey = `preview_${prompt}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) return true;
          
          // Check if preview exists in history previewUrls
          return parsedHistory.some(entry => 
            entry.previewUrls && entry.previewUrls[prompt]
          );
        } catch (error) {
          console.error('Error checking preview existence:', error);
          return false;
        }
      };
      
      // Initialize manually hidden set
      setManuallyHidden({});
      
      // Go through all prompts in history and check for existing previews
      parsedHistory.forEach(entry => {
        if (entry.prompts) {
          const promptLines = String(entry.prompts).split('\n').filter(p => p.trim());
          promptLines.forEach(prompt => {
            if (prompt && doesPreviewExist(prompt) && !showingPreviews[prompt]) {
              newPreviewState[prompt] = true;
              previewStateChanged = true;
            }
          });
        }
      });
      
      // Update state if we found previews
      if (previewStateChanged) {
        setShowingPreviews(newPreviewState);
      }
    }
  }, []);

  // Save showingPreviews state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_STATE_KEY, JSON.stringify(showingPreviews));
    } catch (error) {
      console.error('Error saving preview state:', error);
    }
  }, [showingPreviews]);
  
  // Effect to auto-show previews for current visible prompts if they already exist
  useEffect(() => {
    if (!history.length || !filteredHistory.length) return;
    
    // Only process current page for performance
    const currentPageItems = filteredHistory.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    // Extract all prompts from current page of history
    const promptsToCheck = [];
    currentPageItems.forEach(entry => {
      if (entry.prompts) {
        const promptLines = String(entry.prompts).split('\n')
          .map(p => p.trim())
          .filter(p => p);
        promptsToCheck.push(...promptLines);
      }
    });
    
    // Check if any prompts need to be shown
    let updateNeeded = false;
    const newPreviewState = { ...showingPreviews };
    
    promptsToCheck.forEach(prompt => {
      // Only check prompts that aren't already showing and haven't been manually hidden
      if (!showingPreviews[prompt] && !manuallyHidden[prompt] && previewExistsInCache(prompt, history)) {
        newPreviewState[prompt] = true;
        updateNeeded = true;
      }
    });
    
    if (updateNeeded) {
      setShowingPreviews(newPreviewState);
    }
  }, [history, currentPage, searchTerm, selectedType, filterDateRange, showingPreviews, manuallyHidden, itemsPerPage]);

  const handleTogglePreview = (prompt) => {
    setShowingPreviews(prev => {
      // Determine if we should show or hide the preview
      const shouldShow = !prev[prompt];
      
      // If we're toggling to hide, always allow it and mark as manually hidden
      if (!shouldShow) {
        // Mark this preview as manually hidden
        setManuallyHidden(prev => ({ ...prev, [prompt]: true }));
        return {
          ...prev,
          [prompt]: false
        };
      }
      
      // If we're toggling to show, clear manually hidden flag
      setManuallyHidden(prev => {
        const updated = { ...prev };
        delete updated[prompt];
        return updated;
      });
      
      // Check if preview exists
      const hasExistingPreviewUrl = history.some(entry => 
        entry.previewUrls && entry.previewUrls[prompt]
      ) || previewExistsInCache(prompt, history);
      
      if (hasExistingPreviewUrl) {
        console.log(`Using existing preview for ${prompt}`);
      }
      
      return {
        ...prev,
        [prompt]: true
      };
    });
  };

  // Function to update history with preview URLs
  const updateHistoryWithPreview = (prompt, previewUrl) => {
    // Make a deep copy of history
    const updatedHistory = JSON.parse(JSON.stringify(history));
    
    // Find all history entries that contain this prompt
    updatedHistory.forEach(entry => {
      // Split prompts into individual lines and check each
      const promptLines = entry.prompts ? String(entry.prompts).split('\n') : [];
      const hasPrompt = promptLines.some(line => line.trim() === prompt);
      
      if (hasPrompt) {
        // Initialize previewUrls object if it doesn't exist
        if (!entry.previewUrls) {
          entry.previewUrls = {};
        }
        // Add or update this prompt's preview URL
        entry.previewUrls[prompt] = previewUrl;
      }
    });
    
    // Update state and localStorage
    setHistory(updatedHistory);
    localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Ensure the showing state remains true for this prompt
    // This prevents the preview from being hidden immediately after generation
    setShowingPreviews(prev => ({
      ...prev,
      [prompt]: true
    }));
  };

  // New function to export history as JSON file
  const handleExportHistory = () => {
    try {
      // Get the history data
      const historyData = localStorage.getItem(PROMPT_HISTORY_KEY);
      const previewData = localStorage.getItem(PREVIEW_STATE_KEY);
      
      // Create a combined object with both history and preview states
      const exportData = {
        history: historyData ? JSON.parse(historyData) : [],
        previewStates: previewData ? JSON.parse(previewData) : {},
        exportDate: new Date().toISOString(),
        version: '1.0.0' // For future compatibility
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create blob
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-history-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast('History backup exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting history:', error);
      addToast('Failed to export history backup', 'error');
    }
  };

  // New function to import history from JSON file
  const handleImportHistory = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Parse the file content
          const importData = JSON.parse(e.target.result);
          
          // Validate the data structure
          if (!importData.history || !Array.isArray(importData.history)) {
            throw new Error('Invalid backup file format');
          }
          
          // Calculate stats for toast notification
          const importCount = importData.history.length;
          
          // Merge or replace existing history
          let updatedHistory = [];
          if (window.confirm('Do you want to merge with existing history? Click Cancel to replace all history.')) {
            // Merge: Load current history and combine with imported history
            const currentHistory = localStorage.getItem(PROMPT_HISTORY_KEY);
            const currentHistoryArray = currentHistory ? JSON.parse(currentHistory) : [];
            
            // Create a map of existing timestamps to avoid duplicates
            const existingTimestamps = new Set(currentHistoryArray.map(item => item.timestamp));
            
            // Filter out duplicates from imported history
            const uniqueImported = importData.history.filter(item => !existingTimestamps.has(item.timestamp));
            
            // Combine and sort by timestamp (newest first)
            updatedHistory = [...currentHistoryArray, ...uniqueImported]
              .sort((a, b) => b.timestamp - a.timestamp);
          } else {
            // Replace: Just use the imported history
            updatedHistory = importData.history;
          }
          
          // Save to localStorage
          localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(updatedHistory));
          
          // If preview states are included, import those too
          if (importData.previewStates) {
            // Merge with existing preview states
            const currentPreviewStates = localStorage.getItem(PREVIEW_STATE_KEY);
            const updatedPreviewStates = {
              ...(currentPreviewStates ? JSON.parse(currentPreviewStates) : {}),
              ...importData.previewStates
            };
            localStorage.setItem(PREVIEW_STATE_KEY, JSON.stringify(updatedPreviewStates));
            setShowingPreviews(updatedPreviewStates);
          }
          
          // Update the component state
          setHistory(updatedHistory);
          
          // Show success message
          addToast(`Successfully imported ${importCount} history items`, 'success');
        } catch (error) {
          console.error('Error parsing import file:', error);
          addToast('Invalid backup file format', 'error');
        }
      };
      
      reader.onerror = () => {
        addToast('Error reading the file', 'error');
      };
      
      reader.readAsText(file);
      
      // Reset the file input so the same file can be selected again
      event.target.value = '';
    } catch (error) {
      console.error('Error importing history:', error);
      addToast('Failed to import history backup', 'error');
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const TypeBadge = ({ type }) => {
    const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.standard;
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg} ${config.color} text-xs font-medium`}>
        <Icon size={12} />
        <span>{config.label}</span>
      </div>
    );
  };

  return (
   <div className="flex-1 overflow-y-auto bg-[var(--background)] max-w-[100vw] relative">
      {/* Header Section */}
      <div className="p-4 sm:p-6 bg-[var(--background)]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-[var(--text)]">Prompt History</h2>
              <p className="text-sm text-[var(--textSecondary)]">
                {filteredHistory.length} result{filteredHistory.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {!user?.isPremium && (
                <div className="text-sm px-3 py-1.5 rounded-lg bg-[var(--cardBackground)] text-[var(--textSecondary)] border border-[var(--border)]">
                  {history.length}/5 prompts
                </div>
              )}
              
              {/* Backup & Restore Buttons */}
              <button
                onClick={handleExportHistory}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                  text-[var(--primary)] hover:bg-[var(--primary)]/10"
                title="Download your prompt history as a backup file"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
              
              <button
                onClick={triggerFileInput}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                  text-[var(--primary)] hover:bg-[var(--primary)]/10"
                title="Import a previously exported backup file"
              >
                <Upload size={16} />
                <span>Import</span>
              </button>
              
              {/* Hidden file input for import */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportHistory} 
                accept=".json" 
                style={{ display: 'none' }} 
              />
              
              <button
                onClick={() => {
                  localStorage.removeItem(PROMPT_HISTORY_KEY);
                  localStorage.removeItem(PREVIEW_STATE_KEY);
                  setHistory([]);
                  setShowingPreviews({});
                  addToast('History cleared', 'success');
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                  border border-red-500/20 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Privacy Information Banner */}
          {showPrivacyBanner && (
            <div className="relative bg-[var(--cardBackground)] rounded-lg p-4 border border-[var(--border)] mb-4 overflow-hidden max-w-full">
              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div className="pr-8 max-w-full overflow-hidden">
                  <h4 className="text-sm font-medium text-[var(--text)] mb-1">Secure Storage</h4>
                  <p className="text-xs text-gray-300 break-words">
                    Your history is saved in your browser's local storage. Use the Export button to create a backup file.
                  </p>
                </div>
                <button 
                  onClick={() => setShowPrivacyBanner(false)} 
                  className="absolute right-2 top-2 p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--textSecondary)]"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                  // Reset manually hidden state when changing filters
                  setManuallyHidden({});
                  // This will trigger the useEffect that auto-checks previews
                }}
                className="w-full px-4 py-2.5 pl-10 bg-[var(--cardBackground)] border border-[var(--border)] 
                  rounded-lg text-[var(--text)] placeholder-[var(--textSecondary)]/50 
                  focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--textSecondary)]" />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full
                    hover:bg-[var(--background)] text-[var(--textSecondary)] transition-all duration-200"
                >
                  ×
                </button>
              )}
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
                // Reset manually hidden state when changing filters
                setManuallyHidden({});
              }}
              className="w-full sm:w-44 px-3 py-2.5 bg-[var(--cardBackground)] border border-[var(--border)] 
                rounded-lg text-[var(--text)] cursor-pointer hover:border-[var(--primary)] transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="standard">Images</option>
              <option value="video">Videos</option>
              <option value="variation">Variations</option>
              <option value="random">Random</option>
              <option value="shortened">Shortened</option>
              <option value="extended">Extended</option>
              <option value="edited">Edited</option>
              <option value="imageAnalysis">Image Analysis</option>
            </select>

            {/* Date Filter */}
            <select
              value={filterDateRange}
              onChange={(e) => {
                setFilterDateRange(e.target.value);
                setCurrentPage(1);
                // Reset manually hidden state when changing filters
                setManuallyHidden({});
              }}
              className="w-full sm:w-44 px-3 py-2.5 bg-[var(--cardBackground)] border border-[var(--border)] 
                rounded-lg text-[var(--text)] cursor-pointer hover:border-[var(--primary)] transition-all duration-200"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-6 text-[var(--textSecondary)]">
                <AlertCircle className="w-full h-full" />
              </div>
              <h3 className="text-xl font-medium text-[var(--text)] mb-2">
                {searchTerm ? `No results found for "${searchTerm}"` : 'No history available'}
              </h3>
              <p className="text-[var(--textSecondary)]">
                {searchTerm
                  ? 'Try adjusting your search terms or filters'
                  : 'Generate some prompts to see them here'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedHistory.map((entry, index) => (
                <div
                  key={index}
                  className="group relative bg-[var(--cardBackground)] rounded-xl border border-[var(--border)] 
                    transition-all duration-200 hover:border-[var(--primary)]/50 history-card"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <TypeBadge type={entry.type === 'standard' ? entry.promptType || 'standard' : entry.type} />
                          <span className="text-sm text-[var(--textSecondary)]">
                            {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-[var(--text)]">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlightText(entry.description, searchTerm),
                            }}
                          />
                        </h3>
                      </div>
                    </div>

                    {/* Input Text Section - for standard prompts, not operations */}
                    {entry.inputText && 
                     entry.promptType !== 'random' && 
                     entry.promptType !== 'edited' && 
                     entry.promptType !== 'variation' && 
                     entry.promptType !== 'shortened' && 
                     entry.promptType !== 'extended' && 
                     entry.promptType !== 'nextscene' && 
                     entry.promptType !== 'imageAnalysis' && (
                      <div className="bg-[var(--background)]/50 rounded-lg border border-[var(--border)] p-4">
                        <div className="text-sm font-medium text-[var(--textSecondary)] mb-2">Input Text</div>
                        <div className="text-[var(--text)] text-sm whitespace-pre-wrap break-words">
                          {entry.inputText}
                        </div>
                      </div>
                    )}

                    {/* Edit Instructions Section */}
                    {entry.promptType === 'edited' && entry.editInstructions && (
                      <div className="bg-[var(--background)]/50 rounded-lg border border-[var(--border)] p-4">
                        <div className="text-sm font-medium text-[var(--textSecondary)] mb-2">Edit Instructions</div>
                        <div className="text-[var(--text)] text-sm whitespace-pre-wrap break-words">
                          {entry.editInstructions}
                        </div>
                      </div>
                    )}

                    {/* Settings Grid */}
                    {entry.type !== 'variation' && 
                     entry.type !== 'imageAnalysis' && 
                     entry.promptType !== 'variation' && 
                     entry.promptType !== 'random' && 
                     entry.promptType !== 'extended' && 
                     entry.promptType !== 'shortened' &&
                     entry.promptType !== 'edited' &&
                     entry.promptType !== 'imageAnalysis' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {entry.type === 'video' ? (
                          <>
                            <SettingItem label="Style" value={formatLabel(entry.videoStyle)} />
                            <SettingItem label="Shot Type" value={formatLabel(entry.shotType)} />
                            <SettingItem label="Camera Angle" value={formatLabel(entry.cameraAngle)} />
                          </>
                        ) : (
                          <>
                            <SettingItem label="Model" value={formatLabel(entry.model)} />
                            <SettingItem 
                              label="Style" 
                              value={entry.styles && entry.styles.length > 0 
                                ? formatSettingsArray(entry.styles) 
                                : formatLabel(entry.style)} 
                            />
                            <SettingItem 
                              label="Lighting" 
                              value={entry.lightingEffects && entry.lightingEffects.length > 0 
                                ? formatSettingsArray(entry.lightingEffects) 
                                : formatLabel(entry.lighting)} 
                            />
                            <SettingItem 
                              label="Camera Angle" 
                              value={entry.cameraAngles && entry.cameraAngles.length > 0 
                                ? formatSettingsArray(entry.cameraAngles) 
                                : formatLabel(entry.cameraAngle)} 
                            />
                            <SettingItem label="Purpose" value={formatLabel(entry.purpose)} />
                            <SettingItem label="Creativity" value={`${entry.creativity}/10`} />
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Prompts Section */}
                  <div className="border-t border-[var(--border)] p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {(entry.prompts ? String(entry.prompts).split('\n') : []).map((prompt, promptIndex) => {
                      const cleanPrompt = prompt.trim();
                      if (!cleanPrompt) return null;

                      return (
                        <div
                          key={promptIndex}
                          className="bg-[var(--background)]/50 rounded-lg p-3 sm:p-4 border border-[var(--border)] overflow-hidden"
                        >
                          <p
                            className="text-[var(--text)] mb-4 whitespace-pre-wrap break-words overflow-hidden max-w-full"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(cleanPrompt, searchTerm),
                            }}
                          />
                          
                          {/* Message Actions */}
                          <MessageActions
                            prompt={cleanPrompt}
                            onUseInGenerate={(promptText) => {
                              setGeneratePrompt(promptText);
                              onViewChange('generate');
                            }}
                            onVariations={() => {
                              onViewChange('chat');
                              const userMessage = {
                                type: 'user',
                                content: `/variations ${cleanPrompt}`,
                                isCommand: true,
                                commandType: 'variations',
                                timestamp: new Date().toISOString()
                              };
                              setMessages(prevMessages => [...prevMessages, userMessage]);
                              handleSubmit(cleanPrompt, {
                                isVariation: true,
                                originalPrompt: cleanPrompt,
                                skipUserMessage: true
                              });
                            }}
                            onExtend={(additionalDetails) => {
                              onViewChange('chat');
                              const userMessage = {
                                type: 'user',
                                content: `/extend ${cleanPrompt}`,
                                isCommand: true,
                                commandType: 'extend',
                                timestamp: new Date().toISOString()
                              };
                              setMessages(prevMessages => [...prevMessages, userMessage]);
                              handleSubmit(cleanPrompt, {
                                isExtended: true,
                                originalPrompt: cleanPrompt,
                                skipUserMessage: true,
                                settings: additionalDetails
                              });
                            }}
                            onShorten={() => {
                              onViewChange('chat');
                              const userMessage = {
                                type: 'user',
                                content: `/shorten ${cleanPrompt}`,
                                isCommand: true,
                                commandType: 'shorten',
                                timestamp: new Date().toISOString()
                              };
                              setMessages(prevMessages => [...prevMessages, userMessage]);
                              handleSubmit(cleanPrompt, {
                                isShortened: true,
                                originalPrompt: cleanPrompt,
                                skipUserMessage: true
                              });
                            }}
                            onEdit={onEdit}
                            showPreview={true}
                            showingPreview={showingPreviews[cleanPrompt]}
                            onTogglePreview={() => handleTogglePreview(cleanPrompt)}
                          />

                          {/* Preview Section */}
                          {showingPreviews[cleanPrompt] && (
                            <div className="mt-4">
                              <PreviewImage 
                                prompt={cleanPrompt}
                                initialUrl={entry.previewUrls?.[cleanPrompt]}
                                shouldGenerate={!entry.previewUrls?.[cleanPrompt]}
                                size="medium"
                                onPreviewGenerated={(prompt, url) => {
                                  // Update the history with the preview URL
                                  updateHistoryWithPreview(prompt, url);
                                  
                                  // Clear manually hidden flag since we're generating a new preview
                                  setManuallyHidden(prev => {
                                    const updated = { ...prev };
                                    delete updated[prompt];
                                    return updated;
                                  });
                                  
                                  // Ensure the preview stays visible after generation
                                  setShowingPreviews(prev => ({
                                    ...prev,
                                    [prompt]: true
                                  }));
                                }}
                                onPremiumClick={onPremiumClick}
                                onLoginModalOpen={(view) => {
                                  // Navigate back to main view and open login modal
                                  onViewChange('chat');
                                  // This should trigger the login modal in the parent App component
                                  // with the appropriate view (login, signup, etc.)
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  // Reset manually hidden state when changing pages
                  setManuallyHidden({});
                }}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed border-[var(--border)]'
                    : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10'
                } transition-all duration-200`}
              >
                <svg className="h-5 w-5 text-[var(--text)]" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M15 18l-6-6 6-6"/>
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      // Reset manually hidden state when changing pages
                      setManuallyHidden({});
                    }}
                    className={`min-w-[2.5rem] h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-[var(--primary)] text-black border-[var(--primary)]'
                        : 'border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  // Reset manually hidden state when changing pages
                  setManuallyHidden({});
                }}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed border-[var(--border)]'
                    : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10'
                } transition-all duration-200`}
              >
                <svg className="h-5 w-5 text-[var(--text)]" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}

          {/* Premium Upgrade Banner */}
          {!user?.isPremium && filteredHistory.length >= 5 && showPremiumBanner && (
            <div className="sticky bottom-6 max-w-2xl mx-auto mt-8">
              <div className="relative bg-[var(--cardBackground)] rounded-xl p-6 border-2 border-[var(--primary)] shadow-lg backdrop-blur-sm">
                <button 
                  onClick={() => setShowPremiumBanner(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--background)]/50 text-[var(--textSecondary)] transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--primary)]" viewBox="0 0 24 24">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            d="M20 6L9 17l-5-5"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--text)] mb-1">
                        Unlock Unlimited History
                      </h3>
                      <p className="text-[var(--textSecondary)]">
                        Free users can only view their last 5 prompts. Upgrade for unlimited history access.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={onPremiumClick}
                      className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
                        text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;