import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CopyAnimation from './CopyAnimation';
import { useAuth } from '../contexts/AuthContext';
import { useCollections } from '../contexts/CollectionsContext';
import { useVideoCollections } from '../contexts/VideoCollectionsContext';
import { useToast } from '../contexts/ToastContext';
import { ExtendPromptModal } from './ExtendPromptModal';
import NextSceneModal from './NextSceneModal';
import DropdownPortal from './DropdownPortal';
import { Send, Film, Reply } from 'lucide-react';
const MessageActions = ({
  prompt,
  onVariations,
  onExtend,
  onShorten,
  onTogglePreview,
  onUseInGenerate,
  onShare, // Add this prop
  onNextScene, // Add new prop for next scene functionality
  onEdit, // Add new prop for editing functionality
  showingPreview,
  showPreview = true,
  showCollectionButton = true,
  showUseButton = true,
  showShareButton = true, // Add this prop
  className = '',
  isLoading = false,
  isGenerating = false, // Add this prop to handle ongoing generation state
  hasMidjourneyParams = false,
  previewImage = null, // Add this prop
  isCompact = false,
  isUltraCompact = false, // Add ultra compact mode for very constrained spaces
  isVideoMode = false // Add this prop for video mode detection
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { collections, addPromptToCollection, isPromptInAnyCollection, createCollection } = useCollections();
  const { collections: videoCollections, addPromptToCollection: addVideoPromptToCollection, isPromptInAnyCollection: isPromptInAnyVideoCollection, createCollection: createVideoCollection } = useVideoCollections();
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isNextSceneModalOpen, setIsNextSceneModalOpen] = useState(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCopyAnimation, setShowCopyAnimation] = useState(false);
  const [copyButtonRect, setCopyButtonRect] = useState(null);

  // Update button position when animation starts
  useEffect(() => {
    if (showCopyAnimation && copyButtonRef.current) {
      const rect = copyButtonRef.current.getBoundingClientRect();
      setCopyButtonRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    }
  }, [showCopyAnimation]);
  const copyButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsCollectionMenuOpen(false);
        setIsCreatingCollection(false);
        setNewCollectionName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopy = async () => {
    try {
      // Always allow copying, even during loading/generation states
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      // Show the animation instead of a toast
      setShowCopyAnimation(true);
      // Don't need to set a timeout for copied state, the animation handles this
    } catch (error) {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleAnimationComplete = () => {
    setShowCopyAnimation(false);
    setCopied(false); // Reset copied state when animation completes
  };

const handleExtend = (additionalDetails) => {
 
  onExtend && onExtend(additionalDetails);
};

const handleNextScene = (nextSceneDetails) => {
  // Extract the input text string directly from the modal's response
  let inputText = '';
  if (typeof nextSceneDetails === 'string') {
    inputText = nextSceneDetails;
  } else if (nextSceneDetails && typeof nextSceneDetails === 'object') {
    // If it's an object, try to extract the text from the nextSceneDetails property
    inputText = nextSceneDetails.nextSceneDetails || '';
  }
  
  // Pass the extracted input text directly to onNextScene
  // IMPORTANT: Pass it as a simple string, not as an object with a property
  onNextScene && onNextScene(inputText);
};

  const handleAddToCollection = (collectionId) => {
    if (isVideoMode) {
      addVideoPromptToCollection(collectionId, prompt);
      setIsCollectionMenuOpen(false);
      addToast('Added to video collection', 'success');
    } else {
      addPromptToCollection(collectionId, prompt);
      setIsCollectionMenuOpen(false);
      addToast('Added to collection', 'success');
    }
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      addToast('Please enter a collection name', 'error');
      return;
    }
  
    // Create collection based on mode
    const collectionId = isVideoMode
      ? createVideoCollection(newCollectionName, prompt)
      : createCollection(newCollectionName, prompt); // Pass the prompt as the second argument
    
    if (collectionId) {
      setIsCreatingCollection(false);
      setNewCollectionName('');
      setIsCollectionMenuOpen(false);
      addToast(`${isVideoMode ? 'Video collection' : 'Collection'} created and prompt added`, 'success');
    } else {
      addToast(`Failed to create ${isVideoMode ? 'video collection' : 'collection'}`, 'error');
    }
  };
  

  const handlePreviewClick = () => {
    onTogglePreview();
  };

  const isPromptInCollection = isVideoMode 
    ? isPromptInAnyVideoCollection(prompt) 
    : isPromptInAnyCollection(prompt);

    // Responsive button classes with conditional sizing based on isCompact prop
  const buttonBaseClasses = isCompact 
    ? `flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md font-medium transition-all duration-200 shrink-0 min-w-0 text-xs`
    : `flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md font-medium transition-all duration-200 shrink-0 min-w-0`;
  
  // Always keep the Copy button enabled
  const primaryButtonClasses = `${buttonBaseClasses} bg-[var(--primary)] text-black hover:opacity-90`;
  
  const secondaryButtonClasses = `${buttonBaseClasses} hover:bg-[var(--dropdownHover)] text-[var(--text)]`;

// Add special styling for buttons when Midjourney parameters are present
const midjourneyButtonClasses = hasMidjourneyParams ? 'border-blue-500/30' : '';

// Choose the appropriate collections based on mode
const collectionsToUse = isVideoMode ? videoCollections : collections;

// Convert collections object to array format
const collectionsArray = Object.entries(collectionsToUse || {}).map(([id, collection]) => ({
  id,
  ...collection
}));

 return (
    <div className="relative w-full">
      {/* Mobile-first responsive layout - always wrap on small screens */}
      <div className={`flex flex-wrap gap-1.5 w-full ${className}`}>
        {/* Primary Actions Row - Most used buttons */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {/* Copy Button - Always enabled, even during generation */}
          <div className="relative">
            <button
              ref={copyButtonRef}
              onClick={handleCopy}
              className={`${primaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0`}
              aria-label="Copy prompt"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}
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
              <span className={isCompact ? "" : "text-xs sm:text-sm"}>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Use Button */}
          {showUseButton && (
            <button
              onClick={() => onUseInGenerate?.(prompt)}
              className={`${secondaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0`}
              aria-label="Use prompt in Generate"
              disabled={isLoading}
            >
              <Send className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} />
              <span className={isCompact ? "" : "text-xs sm:text-sm"}>Use</span>
            </button>
          )}
          
          {/* Variations Button */}
          <button
            onClick={() => {
              if (!isLoading && !isGenerating) {
                onVariations();
              }
            }}
            className={`${secondaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0`}
            aria-label="Generate variations"
            title={isGenerating ? "Cannot generate variations while another operation is in progress" : "Generate variations of this prompt"}
            style={{ cursor: (isLoading || isGenerating) ? 'not-allowed' : 'pointer' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className={isCompact ? "" : "text-xs sm:text-sm"}>Variations</span>
          </button>
        </div>

        {/* Secondary Actions Row */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">

          {/* Conditional rendering: Show Extend button in regular mode, Next Scene in video mode */}
          {!isVideoMode ? (
            <button
              onClick={() => {
                if (!isLoading && !isGenerating && prompt.length < 800) {
                  setIsExtendModalOpen(true);
                }
              }}
              className={`${secondaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0`}
              aria-label="Extend prompt"
              title={isGenerating ? "Cannot extend prompt while another operation is in progress" : prompt.length >= 800 ? "Prompt is too long to extend" : "Extend this prompt with additional details"}
              style={{ cursor: (isLoading || isGenerating || prompt.length >= 800) ? 'not-allowed' : 'pointer' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {hasMidjourneyParams ? (
                  // Settings icon for Midjourney prompts
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                ) : (
                  // Default expand icon
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                )}
              </svg>
              <span className={isCompact ? "" : "text-xs sm:text-sm"}>Extend</span>
            </button>
          ) : (
            <button
            onClick={() => {
            if (!isLoading && !isGenerating) {
            
              setIsNextSceneModalOpen(true);
              }
            }}
            className={`${secondaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0`}
            aria-label="Next scene"
            title={isGenerating ? "Cannot create next scene while another operation is in progress" : "Continue this video scene with the next 5-10 seconds"}
              style={{ cursor: (isLoading || isGenerating) ? 'not-allowed' : 'pointer' }}
              >
              <Film className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} />
              <span className={isCompact ? "" : "text-xs sm:text-sm"}>Next Scene</span>
            </button>
          )}

          {/* Shorten Button */}
          <button
            onClick={() => {
              if (!isLoading && !isGenerating && prompt.length >= 170) {
                onShorten();
              }
            }}
            className={`${secondaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0`}
            aria-label="Shorten prompt"
            title={isGenerating ? "Cannot shorten prompt while another operation is in progress" : prompt.length < 170 ? "Prompt is too short to shorten" : "Create a shorter version of this prompt"}
            style={{ cursor: (isLoading || isGenerating || prompt.length < 170) ? 'not-allowed' : 'pointer' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 8h-4m4 0v-4m0 4l-5-5m11 5h4m-4 0v-4m0 4l5-5M8 16h-4m4 0v4m0-4l-5 5m11-5h4m-4 0v4m0-4l5 5"
              />
            </svg>
            <span className={isCompact ? "" : "text-xs sm:text-sm"}>Shorten</span>
          </button>

          {/* Preview Button */}
          {showPreview && (
            <button
              onClick={handlePreviewClick}
              className={`${secondaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0 ${
                showingPreview ? 'bg-[var(--dropdownHover)]' : ''
              }`}
              aria-label="Toggle preview"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className={isCompact ? "" : "text-xs sm:text-sm"}>{showingPreview ? 'Hide' : 'Preview'}</span>
            </button>
          )}

          {/* Edit Button */}
         
        </div>

        {/* Tertiary Actions Row - Collection and Edit buttons */}
        <div className="flex gap-1.5 w-full sm:w-auto">
          {showCollectionButton && (
            <div className="relative inline-block">
              <button
                ref={buttonRef}
                onClick={() => setIsCollectionMenuOpen(!isCollectionMenuOpen)}
                className={`${secondaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0 ${
                  isPromptInCollection ? 'text-[var(--primary)]' : ''
                } flex items-center justify-center`}
                aria-label="Add to collection"
                aria-expanded={isCollectionMenuOpen}
                aria-haspopup="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"}
                  fill={isPromptInCollection ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <span className={isCompact ? "" : "text-xs sm:text-sm"}>Add to Collection</span>
              </button>

              <DropdownPortal
                isOpen={isCollectionMenuOpen}
                buttonRef={buttonRef}
                onClose={() => setIsCollectionMenuOpen(false)}
              >
                <div
                  className="w-56 rounded-md shadow-lg bg-[var(--cardBackground)] border border-[var(--border)] overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="collections-menu"
                >
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {collectionsArray.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-[var(--textSecondary)]">
                        No collections yet
                      </div>
                    ) : (
                      collectionsArray.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => handleAddToCollection(collection.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--dropdownHover)] focus:outline-none focus:bg-[var(--dropdownHover)]"
                          role="menuitem"
                        >
                          {collection.name}
                        </button>
                      ))
                    )}
                  </div>
                  {user && (
                    <div className="border-t border-[var(--border)]">
                      {isCreatingCollection ? (
                        <div className="p-2">
                          <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="Collection name"
                            className="w-full px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateCollection();
                              }
                            }}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleCreateCollection}
                              className="flex-1 px-2 py-1 text-sm bg-[var(--primary)] text-black rounded hover:opacity-90"
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setIsCreatingCollection(false);
                                setNewCollectionName('');
                              }}
                              className="flex-1 px-2 py-1 text-sm text-[var(--text)] border border-[var(--border)] rounded hover:bg-[var(--dropdownHover)]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsCreatingCollection(true)}
                          className="block w-full text-left px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--dropdownHover)] focus:outline-none focus:bg-[var(--dropdownHover)]"
                          role="menuitem"
                        >
                          + Create New Collection
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </DropdownPortal>
            </div>
          )}
          
          {/* Edit Button - positioned alongside collection button in mobile */}
          <button
            onClick={() => {
              if (!isLoading && !isGenerating) {
                onEdit?.(prompt);
              }
            }}
            className={`${secondaryButtonClasses} ${midjourneyButtonClasses} flex-shrink-0`}
            aria-label="Edit prompt with natural language"
            title={isGenerating ? "Cannot edit while another operation is in progress" : "Edit this prompt using natural language instructions"}
            style={{ cursor: (isLoading || isGenerating) ? 'not-allowed' : 'pointer' }}
          >
            <Reply className={isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} />
            {/* No text label for edit button to save space */}
            <span className={isCompact ? "" : "text-xs sm:text-sm hidden sm:inline"}></span>
          </button>
        </div>
      </div>

      <ExtendPromptModal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        onConfirm={handleExtend}
        hasMidjourneyParams={hasMidjourneyParams}
      />
      
      <NextSceneModal
        isOpen={isNextSceneModalOpen}
        onClose={() => setIsNextSceneModalOpen(false)}
        onConfirm={handleNextScene}
        originalPrompt={prompt}
      />

      {/* Copy Animation Portal - renders outside component hierarchy to avoid clipping */}
      {showCopyAnimation && copyButtonRect && createPortal(
        <div 
          style={{
            position: 'absolute',
            top: copyButtonRect.top,
            left: copyButtonRect.left,
            width: copyButtonRect.width,
            height: copyButtonRect.height,
            pointerEvents: 'none',
            zIndex: 9999
          }}
        >
          <CopyAnimation 
            isVisible={showCopyAnimation} 
            onAnimationComplete={handleAnimationComplete} 
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default MessageActions;