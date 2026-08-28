import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { logger } from '../utils/logger';

const CollectionsContext = createContext();

export function useCollections() {
  return useContext(CollectionsContext);
}
const STORAGE_KEY = 'promptCollections';
export function CollectionsProvider({ children }) {
  const { user } = useAuth();
     const { addToast } = useToast();
  const [collections, setCollections] = useState(() => {
  try {
    const savedCollections = localStorage.getItem(STORAGE_KEY);
    return savedCollections ? JSON.parse(savedCollections) : {};
  } catch (error) {
    logger.error('Error loading collections from localStorage:', error);
    return {};
  }
});
  const [activeCollectionId, setActiveCollectionId] = useState(() => {
  try {
    return localStorage.getItem('activeCollectionId');
  } catch (error) {
    logger.error('Error loading activeCollectionId from localStorage:', error);
    return null;
  }
});

// Save collections to localStorage whenever they change
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  } catch (error) {
    logger.error('Error saving collections to localStorage:', error);
    addToast('Failed to save collections', 'error');
  }
}, [collections]);

// Save activeCollectionId to localStorage whenever it changes
useEffect(() => {
  try {
    if (activeCollectionId) {
      localStorage.setItem('activeCollectionId', activeCollectionId);
    } else {
      localStorage.removeItem('activeCollectionId');
    }
  } catch (error) {
    logger.error('Error saving activeCollectionId to localStorage:', error);
  }
}, [activeCollectionId]);
    
    useEffect(() => {
  const validateAndCleanCollections = () => {
    const cleanedCollections = {};
    let hasChanges = false;

    Object.entries(collections).forEach(([id, collection]) => {
      if (
        collection &&
        typeof collection === 'object' &&
        collection.name &&
        Array.isArray(collection.prompts)
      ) {
        cleanedCollections[id] = {
          ...collection,
          prompts: collection.prompts.filter(prompt => 
            prompt && typeof prompt === 'object' && prompt.id && prompt.text
          ),
          created: collection.created || Date.now(),
          color: collection.color || 'green'
        };
        hasChanges = hasChanges || cleanedCollections[id].prompts.length !== collection.prompts.length;
      } else {
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setCollections(cleanedCollections);
    }
  };

  validateAndCleanCollections();
}, []);

const createCollection = (name, initialPrompt = null) => {
  if (!name?.trim()) return false;
  
  const id = `collection_${Date.now()}`;
  
  setCollections(prev => {
    const newCollection = {
      name: name.trim(),
      prompts: [],
      created: Date.now(),
      color: 'green' // Default color
    };

    // If initialPrompt is provided, add it to the collection
    if (initialPrompt) {
      // Get any existing preview URL from cache
      let previewUrls = {};
      try {
        const cacheKey = `preview_${initialPrompt}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { url } = JSON.parse(cached);
          previewUrls[initialPrompt] = url;
        }
      } catch (error) {
        logger.error('Error reading preview from cache:', error);
      }

      newCollection.prompts = [{
        id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: initialPrompt,
        added: Date.now(),
        previewUrls
      }];
    }

    return {
      ...prev,
      [id]: newCollection
    };
  });

  return id;
};

  const deleteCollection = (id) => {
    if (!collections[id]) return false;
    
    setCollections(prev => {
      const newCollections = { ...prev };
      delete newCollections[id];
      return newCollections;
    });

    if (activeCollectionId === id) {
      setActiveCollectionId(null);
    }
    return true;
  };

const addPromptToCollection = (collectionId, prompt) => {
  if (!collections[collectionId]) return false;

  // Get any existing preview URL from cache
  let previewUrls = {};
  try {
    const cacheKey = `preview_${prompt}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { url } = JSON.parse(cached);
      previewUrls[prompt] = url;
    }
  } catch (error) {
    logger.error('Error reading preview from cache:', error);
  }

  const promptObj = {
    id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text: prompt,
    added: Date.now(),
    previewUrls
  };

  setCollections(prev => ({
    ...prev,
    [collectionId]: {
      ...prev[collectionId],
      prompts: [promptObj, ...prev[collectionId].prompts]
    }
  }));
  return true;
};

  const removePromptFromCollection = (collectionId, promptId) => {
    if (!collections[collectionId]) return false;

    setCollections(prev => ({
      ...prev,
      [collectionId]: {
        ...prev[collectionId],
        prompts: prev[collectionId].prompts.filter(p => p.id !== promptId)
      }
    }));
    return true;
  };

const movePromptBetweenCollections = (promptId, fromCollectionId, toCollectionId) => {
  if (!collections[fromCollectionId] || !collections[toCollectionId]) return false;

  const prompt = collections[fromCollectionId].prompts.find(p => p.id === promptId);
  if (!prompt) return false;

  // Remove from source collection
  removePromptFromCollection(fromCollectionId, promptId);

  // Add to target collection with the same ID to maintain references
  setCollections(prev => ({
    ...prev,
    [toCollectionId]: {
      ...prev[toCollectionId],
      prompts: [{ ...prompt }, ...prev[toCollectionId].prompts]
    }
  }));
  return true;
};

  const setCollectionColor = (collectionId, color) => {
    if (!collections[collectionId]) return false;

    setCollections(prev => ({
      ...prev,
      [collectionId]: {
        ...prev[collectionId],
        color
      }
    }));
    return true;
  };

  const isPromptInAnyCollection = (promptText) => {
    return Object.values(collections).some(collection => 
      collection.prompts.some(prompt => prompt.text === promptText)
    );
  };

  const value = {
    collections,
    activeCollectionId,
    setActiveCollectionId,
    createCollection,
    deleteCollection,
    addPromptToCollection,
    removePromptFromCollection,
    movePromptBetweenCollections,
    setCollectionColor,
    isPromptInAnyCollection
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}
