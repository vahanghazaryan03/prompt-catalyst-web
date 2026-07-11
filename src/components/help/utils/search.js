import React from 'react';
import ReactDOMServer from 'react-dom/server';

const normalizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.toLowerCase().trim();
};

const extractTextContent = (element) => {
  // Render the component to static markup
  const htmlString = ReactDOMServer.renderToStaticMarkup(element);
  
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  
  // Extract text content, replacing multiple spaces and newlines with single spaces
  return tempDiv.textContent.replace(/\s+/g, ' ').trim();
};

const getSentences = (text) => {
  // Split text into sentences, handling multiple punctuation marks and preserving them
  return text.match(/[^.!?]+[.!?]+/g) || [];
};

const findRelevantContext = (sentences, matchedSentenceIndex, contextSize = 1) => {
  const start = Math.max(0, matchedSentenceIndex - contextSize);
  const end = Math.min(sentences.length, matchedSentenceIndex + contextSize + 1);
  
  return sentences.slice(start, end).join(' ');
};

const searchContent = (searchQuery, sections) => {
  console.log('Starting search for:', searchQuery);
  if (!searchQuery?.trim()) return [];
  
  const normalizedQuery = normalizeText(searchQuery);
  const results = [];
  
  sections.forEach(section => {
    try {
      // Create and render the component
      const Component = section.component;
      const element = React.createElement(Component);
      
      // Extract all text content
      const fullContent = extractTextContent(element);
      
      // Split into sentences for better context
      const sentences = getSentences(fullContent);
      
      sentences.forEach((sentence, index) => {
        const normalizedSentence = normalizeText(sentence);
        
        if (normalizedSentence.includes(normalizedQuery)) {
          // Calculate relevance score based on multiple factors
          let score = 0;
          
          // Factor 1: Number of matches in the sentence
          score += (normalizedSentence.split(normalizedQuery).length - 1) * 2;
          
          // Factor 2: Position of match in sentence (earlier is better)
          const matchPosition = normalizedSentence.indexOf(normalizedQuery);
          score += (1 - matchPosition / normalizedSentence.length);
          
          // Factor 3: Length of matching content relative to sentence length
          score += normalizedQuery.length / normalizedSentence.length;
          
          // Get surrounding context
          const contextContent = findRelevantContext(sentences, index);
          
          results.push({
            content: contextContent.trim(),
            section: section.id,
            sectionTitle: section.title,
            relevance: Math.round(score * 10) / 10,
            matchedQuery: searchQuery,
            originalContent: sentence.trim()
          });
        }
      });
    } catch (error) {
      console.error('Error processing section:', section.id, error);
    }
  });
  
  // Sort results by relevance score
  const sortedResults = results.sort((a, b) => b.relevance - a.relevance);
  
  // Remove duplicate matches from the same section that are too similar
  const uniqueResults = sortedResults.filter((result, index, self) => 
    index === self.findIndex((r) => (
      r.section === result.section && 
      normalizeText(r.content).includes(normalizeText(result.content))
    ))
  );
  
  console.log('Found results:', uniqueResults.length);
  return uniqueResults;
};

export { searchContent, normalizeText };