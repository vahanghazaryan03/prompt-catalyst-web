import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Copy, 
  Download, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  Settings,
  Image as ImageIcon,
  Layers,
  PencilRuler
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { logger } from '../utils/logger';

const EditHistory = ({ 
  editItem,
  onReuseEdit,
  onRemove,
  onImageClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  }, []);

  const handleCopyInstructions = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(editItem.instructions);
  }, [editItem.instructions]);

  const handleDownloadImage = useCallback(async (e, imageUrl, index) => {
    e.stopPropagation();
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `edited-image-${editItem.id}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      logger.error('Download failed:', error);
    }
  }, [editItem.id]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onRemove(editItem.id);
  }, [editItem.id, onRemove]);

  const handleReuseEdit = useCallback((e) => {
    e.stopPropagation();
    onReuseEdit(editItem);
  }, [editItem, onReuseEdit]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const truncateInstructions = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[var(--cardBackground)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-[var(--dropdownHover)] transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Original Image Thumbnail */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--inputBackground)] flex-shrink-0">
              {editItem.originalImage.thumbnail ? (
                <img 
                  src={editItem.originalImage.thumbnail}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={20} className="text-[var(--textSecondary)]" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Original</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <PencilRuler size={14} className="text-[var(--primary)] flex-shrink-0" />
                <span className="text-sm font-medium text-[var(--text)] truncate">
                  {editItem.originalImage.name}
                </span>
              </div>
              
              <p className="text-sm text-[var(--textSecondary)]" style={{
                display: '-webkit-box',
                WebkitLineClamp: isExpanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {isExpanded ? editItem.instructions : truncateInstructions(editItem.instructions)}
              </p>
              
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--textSecondary)]">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatTimestamp(editItem.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings size={12} />
                  <span>{editItem.model.replace('flux-kontext-', '').toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Layers size={12} />
                  <span>{editItem.editedImages.length} result{editItem.editedImages.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-3">
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1"
                >
                  <button
                    onClick={handleCopyInstructions}
                    className="p-1.5 rounded-md hover:bg-[var(--border)] text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors"
                    title="Copy instructions"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={handleReuseEdit}
                    className="p-1.5 rounded-md hover:bg-[var(--primary)]/10 text-[var(--primary)] transition-colors"
                    title="Reuse this edit"
                  >
                    <PencilRuler size={14} />
                  </button>
                  <button
                    onClick={handleRemove}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button className="p-1 text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[var(--border)]">
              {/* Full Instructions */}
              <div className="mt-3 mb-4">
                <h4 className="text-sm font-medium text-[var(--text)] mb-2">Edit Instructions</h4>
                <p className="text-sm text-[var(--textSecondary)] bg-[var(--inputBackground)] rounded-lg p-3 leading-relaxed">
                  {editItem.instructions}
                </p>
              </div>

              {/* Edited Images Grid */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-[var(--text)] mb-3">
                  Edited Results ({editItem.editedImages.length})
                </h4>
                <div className={`grid gap-3 ${
                  editItem.editedImages.length === 1 ? 'grid-cols-1 max-w-xs' :
                  editItem.editedImages.length === 2 ? 'grid-cols-2' :
                  'grid-cols-2 lg:grid-cols-3'
                }`}>
                  {editItem.editedImages.map((image, index) => {
                    const hasValidUrl = image.url && image.url.trim() !== '';
                    
                    return (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-lg overflow-hidden bg-[var(--inputBackground)] group transition-all ${
                          hasValidUrl 
                            ? 'cursor-pointer hover:ring-2 hover:ring-[var(--primary)]/50' 
                            : 'cursor-not-allowed border-2 border-dashed border-[var(--border)]'
                        }`}
                        onClick={() => hasValidUrl && onImageClick && onImageClick(image, editItem)}
                      >
                        {hasValidUrl ? (
                          <>
                            <img
                              src={image.url}
                              alt={`Edited result ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                // Hide broken images gracefully
                                e.target.style.display = 'none';
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-full h-full flex flex-col items-center justify-center p-3 border-2 border-dashed border-[var(--border)]';
                                placeholder.innerHTML = `
                                  <svg class="w-6 h-6 text-[var(--textSecondary)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <span class="text-xs text-[var(--textSecondary)] text-center">Image no longer available</span>
                                  <span class="text-xs text-[var(--textSecondary)]/60 text-center mt-1">${image.width}×${image.height}</span>
                                `;
                                e.target.parentElement.appendChild(placeholder);
                              }}
                            />
                            
                            {/* Download button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ opacity: 1, scale: 1 }}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-800 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                                onClick={(e) => handleDownloadImage(e, image.url, index)}
                                title="Download image"
                              >
                                <Download size={16} />
                              </motion.button>
                            </div>

                            {/* Image number badge */}
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1}
                            </div>
                          </>
                        ) : (
                          /* Placeholder for missing images */
                          <div className="w-full h-full flex flex-col items-center justify-center p-3">
                            <ImageIcon size={24} className="text-[var(--textSecondary)] mb-2" />
                            <span className="text-xs text-[var(--textSecondary)] text-center">
                              Result #{image.index || index + 1}
                            </span>
                            <span className="text-xs text-[var(--textSecondary)]/60 text-center mt-1">
                              {image.width}×{image.height}
                            </span>
                            <span className="text-xs text-[var(--textSecondary)]/60 text-center mt-1">
                              No image data
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Info about image availability - only show if there are missing images */}
                {editItem.editedImages.some(img => !img.url || img.url.trim() === '') && (
                  <div className="mt-3 p-3 bg-[var(--dropdownHover)] rounded-lg">
                    <p className="text-xs text-[var(--textSecondary)]">
                      💡 <strong>Note:</strong> Some images from this edit session may not be available. 
                      Images from new edits are stored and remain viewable.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={handleReuseEdit}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] text-black rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors text-sm"
                >
                  <PencilRuler size={14} />
                  Use These Settings
                </button>
                <button
                  onClick={handleCopyInstructions}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--cardBackground)] border border-[var(--border)] text-[var(--text)] rounded-lg hover:bg-[var(--dropdownHover)] transition-colors text-sm"
                >
                  <Copy size={14} />
                  Copy Instructions
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EditHistory;
