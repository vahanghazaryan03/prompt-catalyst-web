import React from 'react';
import { Link } from 'react-router-dom';

const SearchResults = ({ results, onClose, isVisible, onResultClick, searchQuery }) => {
  if (!isVisible) {
    return null;
  }

  if (!results?.length) {
    return (
      <div className="absolute top-full left-0 right-0 z-[100] mt-2 overflow-hidden">
        <div className="p-4 text-[var(--text)] opacity-80 text-center bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg">
          No results found
        </div>
      </div>
    );
  }

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 text-black px-1 rounded">{part}</span> : 
        part
    );
  };

  const getCompactPreview = (content, query, maxLength = 150) => {
    const lowercaseContent = content.toLowerCase();
    const lowercaseQuery = query.toLowerCase();
    const matchIndex = lowercaseContent.indexOf(lowercaseQuery);
    
    if (matchIndex === -1) return content.slice(0, maxLength);
    
    const startIndex = Math.max(0, matchIndex - 60);
    const endIndex = Math.min(content.length, matchIndex + query.length + 60);
    
    let preview = content.slice(startIndex, endIndex);
    
    if (startIndex > 0) preview = '...' + preview;
    if (endIndex < content.length) preview = preview + '...';
    
    return preview;
  };

  return (
    <div className="fixed lg:absolute top-16 lg:top-full left-0 right-0 z-[100] mt-2 mx-4 lg:mx-0">
      <div className="max-h-[70vh] overflow-y-auto bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg">
        <div className="sticky top-0 bg-[var(--background)] p-3 border-b border-[var(--border)] text-sm text-[var(--text)] opacity-80">
          Found {results.length} {results.length === 1 ? 'result' : 'results'}
        </div>
        
        {results.map((result, index) => (
          <Link
            key={index}
            to={`/help/${result.section}`}
            onClick={() => {
              if (onResultClick) {
                onResultClick(result);
              }
              if (onClose) {
                onClose();
              }
            }}
            className="block hover:bg-[var(--hover)] border-b border-[var(--border)] last:border-b-0"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-[var(--hover)] rounded text-[var(--text)] opacity-80">
                  {result.sectionTitle}
                </span>
              </div>
              
              <div className="text-[var(--text)] text-sm leading-relaxed">
                {highlightMatch(getCompactPreview(result.content, searchQuery || ''), searchQuery || '')}
              </div>
              
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1" />
                <div className="text-xs text-[var(--text)] opacity-70">
                  Relevance: {result.relevance}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;