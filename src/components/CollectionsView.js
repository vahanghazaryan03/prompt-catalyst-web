import React, { useState, useRef, useEffect, useCallback } from 'react'; 
import { useCollections } from '../contexts/CollectionsContext';
import { Download, Move, Trash2, Palette, Folder, PlusCircle, Menu } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { PreviewImage } from './PreviewImage';
import CollectionsSidebar from './CollectionsSidebar';
import DropdownPortal from './DropdownPortal';
import MessageActions from './MessageActions';
import AddPromptModal from './AddPromptModal';
import { useMediaQuery } from '../hooks/useMediaQuery';
import ContentContainer from './layout/ContentContainer';
import { logger } from '../utils/logger';

const colors = {
  blue: '#3b82f6',
  green: '#42f56f',
  purple: '#8b5cf6',
  orange: '#f59e0b',
  pink: '#ec4899',
  yellow: '#fbbf24',
  red: '#ef4444',
  teal: '#14b8a6'
};

const CollectionsView = ({ 
  onViewChange, 
  handleSubmit, 
  setMessages, 
  setGeneratePrompt,
  onEdit,
  onPremiumClick
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  const { 
    collections, 
    activeCollectionId,
    removePromptFromCollection,
    movePromptBetweenCollections,
    setCollectionColor,
    addPromptToCollection
  } = useCollections();
  const { addToast } = useToast();
  
  // UI state management
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showAddPromptModal, setShowAddPromptModal] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState(null);

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Initialize the preview states
  const initializePreviewStates = useCallback((collectionId) => {
    if (!collections[collectionId]) return {};
    
    return collections[collectionId].prompts.reduce((acc, prompt) => {
      // Check both collection's previewUrls and localStorage cache
      const hasCachedPreview = (() => {
        // First check collection's previewUrls
        if (prompt.previewUrls?.[prompt.text]) return true;
        
        // Then check localStorage
        try {
          const cacheKey = `preview_${prompt.text}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { url, timestamp } = JSON.parse(cached);
            // Check if cache is still valid (24 hours)
            if (Date.now() - timestamp <= 24 * 60 * 60 * 1000) {
              return true;
            }
          }
        } catch (error) {
          logger.error('Error checking preview cache:', error);
        }
        return false;
      })();
  
      // If we have a valid preview URL either in collection or cache,
      // initialize the state as true
      if (hasCachedPreview) {
        acc[prompt.id] = true;
      }
      return acc;
    }, {});
  }, [collections]);

  const [previewStates, setPreviewStates] = useState(() => 
    initializePreviewStates(activeCollectionId)
  );

  useEffect(() => {
    const newPreviewStates = initializePreviewStates(activeCollectionId);
    setPreviewStates(prevStates => ({
      ...prevStates, // Keep existing states
      ...newPreviewStates // Add new states for current collection
    }));
  }, [activeCollectionId, initializePreviewStates]);

  const colorPickerButtonRef = useRef(null);
  const activeCollection = collections[activeCollectionId];

  // Collection operations
  const handleColorChange = (color) => {
    setCollectionColor(activeCollectionId, color);
    addToast('Collection color updated', 'success');
  };

  const handleAddPrompt = (promptText) => {
    if (activeCollection) {
      const added = addPromptToCollection(activeCollectionId, promptText);
      if (added) {
        addToast('Prompt added to collection', 'success');
      }
    }
  };

  const handleMovePrompt = (targetCollectionId) => {
    if (selectedPromptId) {
      movePromptBetweenCollections(selectedPromptId, activeCollectionId, targetCollectionId);
      setShowMoveDialog(false);
      setSelectedPromptId(null);
      addToast('Prompt moved successfully', 'success');
    }
  };

  const exportCollection = () => {
    if (!activeCollection) return;

    const content = activeCollection.prompts
      .map(prompt => prompt.text)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCollection.name.toLowerCase().replace(/\s+/g, '-')}-prompts.txt`;
    
    try {
      document.body.appendChild(a);
      a.click();
      addToast('Collection exported successfully', 'success');
    } catch (error) {
      addToast('Failed to export collection', 'error');
      logger.error('Export error:', error);
    } finally {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderEmptyState = () => (
    <div className="text-center max-w-md mx-auto p-6 flex flex-col items-center mt-24 mb-24">
      <div className="w-16 h-16 rounded-full bg-[var(--cardBackground)] flex items-center justify-center mb-4">
        <Folder className="h-8 w-8 opacity-50" />
      </div>
      <h3 className="text-lg font-medium text-[var(--text)] mb-2">
        {!activeCollectionId 
          ? 'Select or Create a Collection' 
          : 'No Prompts Yet'
        }
      </h3>
      <p className="text-[var(--textSecondary)] text-sm">
        {!activeCollectionId 
          ? 'Select a collection from the sidebar or create a new one to get started.' 
          : 'Star your favorite prompts or use the "+" button to add prompts to this collection.'
        }
      </p>
    </div>
  );

  return (
    <ContentContainer maxWidth="max-w-6xl">
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Backdrop */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
        `}>
          <CollectionsSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Collection Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[var(--cardBackground)]/80 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-10">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-lg mr-2"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {!activeCollection ? (
              <div className="text-[var(--textSecondary)]">
                Select a collection
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors[activeCollection.color] || colors.blue }}
                  >
                    <Folder className="h-5 sm:h-6 w-5 sm:w-6 text-black" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--text)] truncate">
                      {activeCollection.name}
                    </h2>
                    <p className="text-sm text-[var(--textSecondary)]">
                      {activeCollection.prompts.length} {activeCollection.prompts.length === 1 ? 'prompt' : 'prompts'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    ref={colorPickerButtonRef}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-2 text-[var(--textSecondary)] hover:text-[var--text)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
                  >
                    <Palette className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={exportCollection}
                    className="p-2 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
                  >
                    <Download className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => setShowAddPromptModal(true)}
                    className="p-2 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
            
            <DropdownPortal
              isOpen={showColorPicker}
              buttonRef={colorPickerButtonRef}
              onClose={() => setShowColorPicker(false)}
            >
              <div className="bg-[var(--cardBackground)] rounded-xl shadow-lg border border-[var(--border)] z-50 p-3">
                <h3 className="text-sm font-medium text-[var(--text)] mb-2">Collection Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(colors).map(([name, color]) => (
                    <button
                      key={name}
                      className={`w-8 h-8 rounded-xl hover:scale-110 transition-transform ${
                        activeCollection?.color === name ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--cardBackground)]' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleColorChange(name);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </DropdownPortal>
          </div>

          {/* Prompts List Area */}
          {!activeCollectionId || (activeCollection && activeCollection.prompts.length === 0) ? (
            <div className="flex-1 flex items-center justify-center bg-[var(--background)] text-[var(--textSecondary)] overflow-y-auto">
              {renderEmptyState()}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeCollection.prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="group bg-[var(--cardBackground)]/80 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-[var(--border)] hover:border-[var(--primary)]/20 transition-all duration-200"
                >
                  <p className="text-[var(--text)] text-sm leading-relaxed whitespace-pre-wrap">
                    {prompt.text}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[var(--border)] gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto">
                     <MessageActions
                      prompt={prompt.text}
                      onUseInGenerate={(promptText) => {
                        setGeneratePrompt(promptText); // Add this line
                        onViewChange('generate');
                      }}
                      onVariations={() => {
                        onViewChange('chat');
                        const userMessage = {
                          type: 'user',
                          content: `/variations ${prompt.text}`,
                          isCommand: true,
                          commandType: 'variations',
                          timestamp: new Date().toISOString()
                        };
                        setMessages(prevMessages => [...prevMessages, userMessage]);
                        handleSubmit(prompt.text, {
                          isVariation: true,
                          originalPrompt: prompt.text,
                          skipUserMessage: true
                        });
                      }}
                      onExtend={(additionalDetails) => {
                        onViewChange('chat');
                        const userMessage = {
                          type: 'user',
                          content: `/extend ${prompt.text}`,
                          isCommand: true,
                          commandType: 'extend',
                          timestamp: new Date().toISOString()
                        };
                        setMessages(prevMessages => [...prevMessages, userMessage]);
                        handleSubmit(prompt.text, {
                          isExtended: true,
                          originalPrompt: prompt.text,
                          skipUserMessage: true,
                          settings: additionalDetails
                        });
                      }}
                      onShorten={() => {
                        onViewChange('chat');
                        const userMessage = {
                          type: 'user',
                          content: `/shorten ${prompt.text}`,
                          isCommand: true,
                          commandType: 'shorten',
                          timestamp: new Date().toISOString()
                        };
                        setMessages(prevMessages => [...prevMessages, userMessage]);
                        handleSubmit(prompt.text, {
                          isShortened: true,
                          originalPrompt: prompt.text,
                          skipUserMessage: true
                        });
                      }}
                      onEdit={onEdit}
                      showPreview={true}
                      showingPreview={previewStates[prompt.id]}
                      onTogglePreview={() => {
                        setPreviewStates(prev => ({
                          ...prev,
                          [prompt.id]: !prev[prompt.id]
                        }));
                      }}
                      showCollectionButton={false}
                    />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPromptId(prompt.id);
                          setShowMoveDialog(true);
                        }}
                        className="p-2 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
                        title="Move to another collection"
                      >
                        <Move className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          removePromptFromCollection(activeCollectionId, prompt.id);
                          addToast('Prompt removed from collection', 'success');
                        }}
                        className="p-2 text-[var(--textSecondary)] hover:text-red-400 hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
                        title="Remove from collection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                 {previewStates[prompt.id] && (
                  <div className="mt-4">
                    <PreviewImage
                    prompt={prompt.text}
                    initialUrl={prompt.previewUrls?.[prompt.text]}
                    shouldGenerate={!prompt.previewUrls?.[prompt.text]}
                    size="medium"
                    onPremiumClick={onPremiumClick}
                    onError={(error) => {
                      if (!error.response?.status === 429 && !error.response?.data?.error?.includes('premium')) {
                        addToast('Failed to generate preview', 'error');
                      }
                    }}
                  />
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Move Dialog */}
          {showMoveDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[var(--cardBackground)] rounded-xl p-4 sm:p-6 w-full max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Move to Collection</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(collections)
                    .filter(([id]) => id !== activeCollectionId)
                    .map(([id, collection]) => (
                      <button
                        key={id}
                        onClick={() => handleMovePrompt(id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text)] hover:bg-[var(--dropdownHover)] transition-colors"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: colors[collection.color] || colors.blue }}
                        >
                          <Folder className="h-4 w-4 text-black" />
                        </div>
                        <span>{collection.name}</span>
                      </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowMoveDialog(false);
                      setSelectedPromptId(null);
                    }}
                    className="px-4 py-2 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <AddPromptModal
          isOpen={showAddPromptModal}
          onClose={() => setShowAddPromptModal(false)}
          onSubmit={handleAddPrompt}
        />
      </div>
    </ContentContainer>
  );
};

export default CollectionsView;