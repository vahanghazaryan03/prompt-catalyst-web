import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  X, 
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  PencilRuler,
  Filter,
  Calendar,
  Info,
  Shield
} from 'lucide-react';
import EditHistory from './EditHistory';
import { useEditHistory } from '../contexts/EditContext';
import { useToast } from '../contexts/ToastContext';

const EditHistoryContainer = ({ 
  onReuseEdit,
  onImageClick 
}) => {
  const { editHistory, removeFromEditHistory, clearEditHistory } = useEditHistory();
  const { addToast } = useToast();
  
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem('edit_history_expanded') !== 'false';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedModel]);

  // Get unique models from history
  const availableModels = useMemo(() => {
    const models = [...new Set(editHistory.map(item => item.model))];
    return models.sort();
  }, [editHistory]);

  // Filter and paginate history
  const { paginatedHistory, totalPages, totalItems } = useMemo(() => {
    const filtered = editHistory.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.instructions.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.originalImage.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesModel = selectedModel === 'all' || item.model === selectedModel;
      
      return matchesSearch && matchesModel;
    });

    const total = filtered.length;
    const pages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      paginatedHistory: paginated,
      totalPages: pages,
      totalItems: total
    };
  }, [editHistory, searchTerm, selectedModel, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => {
      const newState = !prev;
      localStorage.setItem('edit_history_expanded', newState.toString());
      return newState;
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all edit history? This action cannot be undone.')) {
      clearEditHistory();
      addToast('Edit history cleared', 'success');
    }
  }, [clearEditHistory, addToast]);

  const handleRemoveItem = useCallback((id) => {
    removeFromEditHistory(id);
    addToast('Item removed from history', 'success');
  }, [removeFromEditHistory, addToast]);

  const handleCopyInstructions = useCallback((instructions) => {
    navigator.clipboard.writeText(instructions);
    addToast('Instructions copied to clipboard!', 'success');
  }, [addToast]);

  const handleReuseEdit = useCallback((editItem) => {
    if (onReuseEdit) {
      onReuseEdit(editItem);
    }
  }, [onReuseEdit]);

  if (editHistory.length === 0) {
    return (
      <div className="bg-[var(--cardBackground)] rounded-xl border border-[var(--border)] p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
          <PencilRuler size={24} className="text-[var(--primary)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--text)] mb-2">No Edit History</h3>
        <p className="text-[var(--textSecondary)] text-sm">
          Your edited images will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--cardBackground)] rounded-xl border border-[var(--border)] shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-3 hover:bg-[var(--dropdownHover)] -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <History size={16} className="text-[var(--primary)]" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-[var(--text)]">
                Edit History
              </h3>
              <span className="text-sm text-[var(--textSecondary)] bg-[var(--dropdownHover)] px-2 py-1 rounded-full">
                {totalItems}
              </span>
              
              {/* Privacy Info Icon with Tooltip */}
              <div className="relative group">
                <div className="flex items-center ml-1.5 cursor-help hover:text-[var(--primary)]">
                  <Info size={14} className="text-[var(--text)] opacity-60" />
                </div>
                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg shadow-lg 
                  z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200
                  text-xs text-[var(--text)]">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)]" />
                    <div>
                      <p className="font-medium mb-1 text-[var(--text)]">Secure Storage</p>
                      <p>
                      Edited images are stored in your browser's local storage only.
                      </p>
                    </div>
                  </div>
                  <div className="h-2 w-2 bg-[var(--cardBackground)] border-r border-b border-[var(--border)] absolute -bottom-1 left-2 transform rotate-45"></div>
                </div>
              </div>
            </div>
            <div className="ml-auto">
              {isExpanded ? <ChevronUp size={16} className="text-[var(--text)]" /> : <ChevronDown size={16} className="text-[var(--text)]" />}
            </div>
          </button>

          {isExpanded && editHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 text-[var(--textSecondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Clear all history"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Filters - Only show when expanded */}
        <AnimatePresence>
          {isExpanded && editHistory.length > 3 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-3"
            >
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--textSecondary)]" />
                <input
                  type="text"
                  placeholder="Search instructions or image names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--inputBackground)] text-[var(--text)] placeholder-[var(--textSecondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-[var(--textSecondary)] hover:text-[var(--text)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Model Filter */}
              {availableModels.length > 1 && (
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-[var(--textSecondary)]" />
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-sm border border-[var(--border)] bg-[var(--inputBackground)] text-[var(--text)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  >
                    <option value="all">All Models</option>
                    {availableModels.map(model => (
                      <option key={model} value={model}>
                        {model.replace('flux-kontext-', '').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {/* Items per page and status info */}
              {totalItems > 5 && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--textSecondary)]">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="text-xs border border-[var(--border)] bg-[var(--inputBackground)] text-[var(--text)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/50"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={15}>15 per page</option>
                      <option value={25}>25 per page</option>
                    </select>
                  </div>
                  <span className="text-xs text-[var(--textSecondary)]">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                  </span>
                </div>
              )}
              
              {totalItems === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--textSecondary)]/10 flex items-center justify-center">
                    <Search size={24} className="text-[var(--textSecondary)]" />
                  </div>
                  <p className="text-[var(--textSecondary)] text-sm">
                    {searchTerm || selectedModel !== 'all' 
                      ? 'No edits match your search criteria' 
                      : 'No edit history available'
                    }
                  </p>
                  {(searchTerm || selectedModel !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedModel('all');
                      }}
                      className="mt-2 text-sm text-[var(--primary)] hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {paginatedHistory.map((editItem) => (
                      <EditHistory
                        key={editItem.id}
                        editItem={editItem}
                        onReuseEdit={handleReuseEdit}
                        onRemove={handleRemoveItem}
                        onImageClick={onImageClick}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--dropdownHover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="rotate-90" size={14} />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and 1 page on each side of current
                        return page === 1 || 
                               page === totalPages || 
                               Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {/* Show ellipsis if there's a gap */}
                          {index > 0 && array[index - 1] < page - 1 && (
                            <span className="text-[var(--textSecondary)] px-2">…</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              page === currentPage
                                ? 'bg-[var(--primary)] text-black font-medium'
                                : 'text-[var(--text)] hover:bg-[var(--dropdownHover)]'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))
                    }
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--dropdownHover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronDown className="-rotate-90" size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditHistoryContainer;
