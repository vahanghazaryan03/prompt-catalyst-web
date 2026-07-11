import { useState, useRef, useCallback } from 'react';
import { searchContent } from '../utils/search';

export const useDocSearch = (sections) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        try {
          console.log('Executing search for:', query.trim());
          console.log('Available sections:', sections.map(s => s.id).join(', '));
          
          const results = searchContent(query.trim(), sections);
          console.log('Search completed with results:', results.length);
          
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setShowResults(true);
        }
      }, 300);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  }, [sections]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  const closeResults = useCallback(() => {
    setShowResults(false);
  }, []);

  return {
    searchQuery,
    searchResults,
    showResults,
    handleSearchChange,
    clearSearch,
    closeResults,
    setShowResults
  };
};

export default useDocSearch;