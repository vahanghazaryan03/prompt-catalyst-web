import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { logger } from '../utils/logger';

const VideoCollectionsContext = createContext();

export function useVideoCollections() {
  return useContext(VideoCollectionsContext);
}

const STORAGE_KEY = 'videoPromptCollections';

export function VideoCollectionsProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [collections, setCollections] = useState(() => {
    try {
      const savedCollections = localStorage.getItem(STORAGE_KEY);
      return savedCollections ? JSON.parse(savedCollections) : {};
    } catch (error) {
      logger.error('Error loading video collections from localStorage:', error);
      return {};
    }
  });
  
  const [activeCollectionId, setActiveCollectionId] = useState(() => {
    try {
      return localStorage.getItem('activeVideoCollectionId');
    } catch (error) {
      logger.error('Error loading activeVideoCollectionId from localStorage:', error);
      return null;
    }
  });

  // Save collections to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch (error) {
      logger.error('Error saving video collections to localStorage:', error);
      addToast('Failed to save video collections', 'error');
    }
  }, [collections]);

  // Save activeCollectionId to localStorage whenever it changes
  useEffect(() => {
    try {
      if (activeCollectionId) {
        localStorage.setItem('activeVideoCollectionId', activeCollectionId);
      } else {
        localStorage.removeItem('activeVideoCollectionId');
      }
    } catch (error) {
      logger.error('Error saving activeVideoCollectionId to localStorage:', error);
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
    
    const id = `video_collection_${Date.now()}`;
    
    setCollections(prev => {
      const newCollection = {
        name: name.trim(),
        prompts: [],
        created: Date.now(),
        color: 'green' // Default color
      };

      // If initialPrompt is provided, add it to the collection
      if (initialPrompt) {
        newCollection.prompts = [{
          id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: initialPrompt,
          added: Date.now()
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

    const promptObj = {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: prompt,
      added: Date.now()
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
    <VideoCollectionsContext.Provider value={value}>
      {children}
    </VideoCollectionsContext.Provider>
  );
}

export default VideoCollectionsProvider;