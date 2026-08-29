import React, { useState } from 'react';
import { useCollections } from '../contexts/CollectionsContext';
import { Folder, Plus, Trash2, X, BookMarked } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useMediaQuery } from '../hooks/useMediaQuery';

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

const ColorPicker = ({ onSelect, currentColor }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={`p-4 ${isMobile ? 'w-screen max-w-xs' : 'min-w-[200px]'}`}>
      <h3 className="text-sm font-medium text-[var(--text)] mb-3">Collection Color</h3>
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(colors).map(([name, color]) => (
          <div key={name} className="flex items-center justify-center">
            <button
              className={`w-8 h-8 rounded-xl transition-all duration-200 hover:scale-110 relative
                ${currentColor === name ? 'ring-2 ring-[var(--primary)]' : ''}
                before:absolute before:inset-0 before:rounded-xl before:transition-opacity
                hover:before:opacity-20 before:opacity-0 before:bg-white
              `}
              style={{ backgroundColor: color }}
              onClick={() => onSelect(name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const CollectionsSidebar = ({ onClose }) => {
  const { 
    collections, 
    activeCollectionId, 
    setActiveCollectionId,
    createCollection,
    deleteCollection,
    setCollectionColor 
  } = useCollections();
  const { addToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showColorPickerForId, setShowColorPickerForId] = useState(null);

  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      createCollection(newCollectionName);
      addToast('Collection created successfully', 'success');
      setNewCollectionName('');
      setIsCreatingNew(false);
    }
  };

  const handleDeleteCollection = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      deleteCollection(id);
      addToast('Collection deleted successfully', 'success');
    }
  };

  const handleCollectionClick = (id) => {
    setActiveCollectionId(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleColorPickerClick = (id, e) => {
    e.stopPropagation();
    setShowColorPickerForId(showColorPickerForId === id ? null : id);
  };

  const handleColorSelect = (id, color) => {
    setCollectionColor(id, color);
    setShowColorPickerForId(null);
    addToast('Collection color updated', 'success');
  };

  return (
    <div className="w-72 h-full bg-[var(--cardBackground)]/80 backdrop-blur-md border-r border-[var(--border)] flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">Collections</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(true)}
              className="flex items-center gap-1 px-2 py-1 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
              title="Create new collection"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">New</span>
            </button>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-1 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* New Collection Form */}
        {isCreatingNew && (
          <form onSubmit={handleCreateCollection} className="mb-4">
            <div className="p-4 bg-[var(--background)]/50 rounded-xl backdrop-blur-sm border border-[var(--border)]">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="w-full px-3 py-2 bg-[var(--cardBackground)] text-[var(--text)] rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] mb-3"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewCollectionName('');
                  }}
                  className="px-3 py-1.5 text-[var(--textSecondary)] hover:text-[var(--text)] hover:bg-[var(--dropdownHover)] rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[var(--primary)] text-black rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-1">
        {Object.entries(collections).map(([id, collection]) => (
          <div
            key={id}
            onClick={() => handleCollectionClick(id)}
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              activeCollectionId === id 
                ? 'bg-[var(--primary)]/10 text-[var(--text)]'
                : 'hover:bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:text-[var(--text)]'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors[collection.color] || colors.blue }}
              >
                <Folder className="h-4 w-4 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{collection.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background)]/50 text-[var(--textSecondary)] flex-shrink-0">
                    {collection.prompts?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-1 ${
              activeCollectionId === id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              {/* Color picker button */}
              <div className="relative">
                <button
                  onClick={(e) => handleColorPickerClick(id, e)}
                  className="p-1.5 hover:bg-[var(--background)]/50 rounded-lg transition-colors"
                  title="Change color"
                >
                  <div
                    className="w-4 h-4 rounded-lg border-2 border-[var(--border)]"
                    style={{ 
                      backgroundColor: collection.color ? colors[collection.color] : colors.blue
                    }}
                  />
                </button>
                {showColorPickerForId === id && (
                  <div className={`absolute ${isMobile ? 'right-0 sm:left-0' : 'right-0'} mt-1 bg-[var(--cardBackground)] rounded-xl shadow-lg border border-[var(--border)] z-50`}>
                    <ColorPicker
                      currentColor={collection.color}
                      onSelect={(color) => handleColorSelect(id, color)}
                    />
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteCollection(id, e)}
                className="p-1.5 hover:bg-[var(--background)]/50 hover:text-red-400 rounded-lg transition-colors"
                title="Delete collection"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionsSidebar;