import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Clock, 
  Trash2,
  Settings,
  Copy,
  Download,
  Shield,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LightboxModal from './LightboxModal';
import { logger } from '../utils/logger';

// Number of items to show per page
const ITEMS_PER_PAGE = 5;

const GenerateHistory = ({ 
  generateHistory, 
  removeFromHistory, 
  clearHistory, 
  updateSettings,
  onRegeneratePrompt,
  onSendToEdit 
}) => {
  const { addToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total number of pages
  const totalPages = Math.ceil(generateHistory.length / ITEMS_PER_PAGE);
  
  // Reset page when history is cleared or changes significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  // Reset to first page when expanding
  useEffect(() => {
    if (isExpanded) {
      setCurrentPage(1);
    }
  }, [isExpanded]);
  
  // Get current page items
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return generateHistory.slice(indexOfFirstItem, indexOfLastItem);
  }, [generateHistory, currentPage]);

  // Pagination handlers
  const goToNextPage = useCallback(() => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt);
    addToast('Prompt copied to clipboard', 'success');
  };

  const handleRegenerate = (item) => {
    updateSettings({
      prompt: item.prompt,
      ...item.settings
    });
    addToast('Settings applied', 'success');
    
    if (onRegeneratePrompt) {
      onRegeneratePrompt(item.prompt);
    }
  };

  const handleImageClick = (item, image, index) => {
    setSelectedHistoryItem(item);
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const handleDownload = async (imageUrl, index) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast('Image downloaded successfully!', 'success');
    } catch (error) {
      addToast('Failed to download image', 'error');
    }
  };

  const handleNavigate = (newIndex) => {
    if (selectedHistoryItem) {
      setCurrentImageIndex(newIndex);
      setSelectedImage(selectedHistoryItem.images[newIndex]);
    }
  };

  // Function to download all images from history as a zip file
  const handleDownloadAllImages = useCallback(async () => {
    // Check if there are images to download
    if (generateHistory.length === 0) {
      addToast('No images to download', 'error');
      return;
    }

    try {
      setIsDownloading(true);

      // We need to dynamically import JSZip to create the archive
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Create a folder for each generation session
      let downloadPromises = [];
      let totalImages = 0;

      // For each history item, download all its images
      for (let i = 0; i < generateHistory.length; i++) {
        const item = generateHistory[i];
        const promptFolder = item.prompt.slice(0, 20).replace(/[^\w-]/g, '_'); // Sanitize folder name
        const folderName = `${formatDate(item.timestamp).replace(/,|\s|:/g, '_')}_${promptFolder}`;
        const folder = zip.folder(folderName);
        
        // Add a text file with the prompt
        folder.file("prompt.txt", item.prompt);
        
        // Download each image in this history item
        for (let j = 0; j < item.images.length; j++) {
          const image = item.images[j];
          totalImages++;
          
          // Create a promise for each image download
          const downloadPromise = fetch(image.url)
            .then(response => response.blob())
            .then(blob => {
              folder.file(`image_${j + 1}.png`, blob);
              return true;
            })
            .catch(error => {
              logger.error(`Failed to download image ${j + 1} from session ${i + 1}:`, error);
              return false;
            });
            
          downloadPromises.push(downloadPromise);
        }
      }
      
      // Wait for all downloads to complete
      await Promise.all(downloadPromises);
      
      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `generated-images-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(zipUrl);
      document.body.removeChild(a);
      
      addToast(`Successfully downloaded ${totalImages} images!`, 'success');
    } catch (error) {
      logger.error('Failed to download images:', error);
      addToast('Failed to download images. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  }, [generateHistory, addToast]);

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center gap-2 py-4 border-t border-[var(--border)] bg-[var(--inputBackground)]">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="p-1.5 rounded-full hover:bg-[var(--dropdownHover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text)]"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="text-sm text-[var(--text)]">
          <span className="font-medium text-[var(--primary)]">{currentPage}</span>
          <span className="mx-1 text-[var(--text)]/60">of</span>
          <span className="font-medium">{totalPages}</span>
        </div>
        
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-full hover:bg-[var(--dropdownHover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text)]"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };
  
  // Lazy loading image component
  const LazyImage = ({ image, index, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    
    return (
      <div
        className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors cursor-pointer"
        onClick={onClick}
      >
        {!isLoaded && !isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--inputBackground)]">
            <div className="h-5 w-5 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin"></div>
          </div>
        )}
        
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--inputBackground)]">
            <div className="text-red-400 text-xs">Failed to load</div>
          </div>
        )}
        
        <img
          src={image.url}
          alt={`Generated ${index + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <div className="border-t border-[var(--border)]">
      <div className="flex items-center justify-between border-b border-[var(--border)]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-between px-4 py-3 text-[var(--text)] hover:bg-[var(--inputBackground)] transition-colors"
        >
          <div className="flex items-center gap-2 text-[var(--text)]">
            <Clock size={18} />
            <span className="font-medium">Generation History</span>
            <span className="text-sm text-[var(--text)]/60">
              ({generateHistory.length})
            </span>
            
            {/* Privacy Info Icon with Tooltip */}
            <div className="relative group">
              <div className="flex items-center ml-1.5 cursor-help text-[var(--text)]/60 hover:text-[var(--primary)]">
                <Info size={14} />
              </div>
              <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg shadow-lg 
                z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200
                text-xs text-[var(--text)]">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)]" />
                  <div>
                    <p className="font-medium mb-1 text-[var(--text)]">Secure Storage</p>
                    <p>
                    Generated images are stored in your browser's local storage only.
                    </p>
                  </div>
                </div>
                <div className="h-2 w-2 bg-[var(--cardBackground)] border-r border-b border-[var(--border)] absolute -bottom-1 left-2 transform rotate-45"></div>
              </div>
            </div>
          </div>
          <motion.div
            initial={false}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </button>
        
        {/* Download All Button */}
        {generateHistory.length > 0 && (
          <button
            onClick={handleDownloadAllImages}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-2 mr-3 text-sm rounded hover:bg-[var(--dropdownHover)] transition-all text-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download all generated images as a zip file"
          >
            {isDownloading ? (
              <div className="animate-spin w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full"></div>
            ) : (
              <Download size={16} />
            )}
            <span>{isDownloading ? 'Downloading...' : 'Download All'}</span>
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ 
              height: 'auto',
              transition: {
                height: {
                  duration: 0.3,
                  ease: [0.33, 1, 0.68, 1]
                }
              }
            }}
            exit={{ 
              height: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: [0.33, 1, 0.68, 1]
                }
              }
            }}
            className="overflow-hidden"
          >
            {generateHistory.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: {
                    duration: 0.2,
                    delay: 0.1
                  }
                }}
                exit={{ opacity: 0 }}
                className="max-h-96 overflow-y-auto"
              >
                {/* Only render the items for the current page */}
                {currentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: [0.33, 1, 0.68, 1]
                      }
                    }}
                    className="p-4 border-b border-[var(--border)] hover:bg-[var(--inputBackground)] transition-colors text-[var(--text)]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm text-[var(--text)]/60">
                        {formatDate(item.timestamp)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyPrompt(item.prompt)}
                          className="p-1.5 rounded hover:bg-[var(--dropdownHover)] transition-colors text-[var(--text)]"
                          title="Copy prompt"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => removeFromHistory(item.id)}
                          className="p-1.5 rounded hover:bg-[var(--dropdownHover)] transition-colors text-red-400"
                          title="Remove from history"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {item.images.map((image, imgIndex) => (
                        <LazyImage
                          key={imgIndex}
                          image={image}
                          index={imgIndex}
                          onClick={() => handleImageClick(item, image, imgIndex)}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1.5 text-[var(--text)]">
                        <span className="truncate max-w-full font-medium">
                          {item.prompt}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text)]/60">
                        <Settings size={14} className="text-[var(--text)]/40" />
                        <span className="bg-[var(--dropdownBackground)] text-[var(--text)]/80 px-2 py-0.5 rounded-full text-xs">
                          {item.settings.model}
                        </span>
                        <span className="bg-[var(--dropdownBackground)] text-[var(--text)]/80 px-2 py-0.5 rounded-full text-xs">
                          {item.settings.size}
                        </span>
                        {item.images && item.images.length > 0 && (
                          <span className="bg-[var(--dropdownBackground)] text-[var(--text)]/80 px-2 py-0.5 rounded-full text-xs">
                            {item.images.length} {item.images.length === 1 ? 'image' : 'images'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add pagination controls */}
                <PaginationControls />

                {generateHistory.length > 0 && (
                  <div className="p-4 border-t border-[var(--border)] bg-[var(--inputBackground)]">
                    <button
                      onClick={clearHistory}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors text-sm mx-auto"
                    >
                      <Trash2 size={16} />
                      Clear History
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="p-8 text-center text-[var(--text)]">
                <p>No generation history yet.</p>
                <p className="text-sm mt-1 text-[var(--text)]/60">
                  Generated images will appear here.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence mode="wait">
        {selectedImage && selectedHistoryItem && (
          <LightboxModal
            images={selectedHistoryItem.images}
            currentIndex={currentImageIndex}
            onClose={() => {
              setSelectedImage(null);
              setSelectedHistoryItem(null);
              setCurrentImageIndex(0);
            }}
            onDownload={handleDownload}
            onCopyPrompt={() => handleCopyPrompt(selectedHistoryItem.prompt)}
            onNavigate={handleNavigate}
            prompt={selectedHistoryItem.prompt}
            onSendToEdit={onSendToEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(GenerateHistory);