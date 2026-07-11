import React, { useState, useEffect, useRef } from 'react';

const TypingAnimation = ({ html, typingSpeed = 50, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const contentRef = useRef('');
  const htmlWithoutTags = useRef('');
  const tagsMap = useRef([]);
  
  // Parse HTML and extract text content and tag positions
  useEffect(() => {
    if (!html) return;
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get text content
    const textContent = tempDiv.textContent || '';
    htmlWithoutTags.current = textContent;
    
    // Extract tag positions and build a map
    const tagRegex = /<[^>]+>/g;
    let match;
    tagsMap.current = [];
    
    while ((match = tagRegex.exec(html)) !== null) {
      tagsMap.current.push({
        index: getTextIndex(html, match.index),
        tag: match[0]
      });
    }
    
    // Start with empty content
    contentRef.current = '';
    setDisplayedContent('');
    setIsTyping(true);
  }, [html]);
  
  // Helper function to get the text index corresponding to an HTML index
  const getTextIndex = (htmlString, htmlIndex) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString.substring(0, htmlIndex);
    return tempDiv.textContent.length;
  };
  
  // Typing effect
  useEffect(() => {
    if (!isTyping || !htmlWithoutTags.current) return;
    
    const textToType = htmlWithoutTags.current;
    const textLength = textToType.length;
    let currentCharIndex = contentRef.current.length;
    
    if (currentCharIndex >= textLength) {
      setIsTyping(false);
      if (onComplete) onComplete();
      return;
    }
    
    // For faster typing speeds, we'll type multiple characters per interval
    const charsPerInterval = Math.max(1, Math.floor(typingSpeed / 20));
    
    const typingInterval = setInterval(() => {
      // Add multiple characters at once for faster speeds
      for (let i = 0; i < charsPerInterval; i++) {
        if (currentCharIndex >= textLength) {
          clearInterval(typingInterval);
          setIsTyping(false);
          if (onComplete) onComplete();
          return;
        }
        
        // Add next character
        const nextChar = textToType[currentCharIndex];
        contentRef.current += nextChar;
        currentCharIndex++;
      }
      
      // Reconstruct HTML with tags
      let htmlContent = '';
      let lastIndex = 0;
      
      for (let i = 0; i < contentRef.current.length; i++) {
        // Check if there are tags to insert at this position
        const tagsAtPosition = tagsMap.current.filter(t => t.index === i);
        
        if (tagsAtPosition.length > 0) {
          tagsAtPosition.forEach(tagInfo => {
            htmlContent += tagInfo.tag;
          });
        }
        
        // Add the character
        htmlContent += contentRef.current[i];
        lastIndex = i + 1;
      }
      
      // Add any remaining closing tags
      const remainingTags = tagsMap.current.filter(t => t.index >= contentRef.current.length);
      remainingTags.forEach(tagInfo => {
        if (tagInfo.tag.startsWith('</')) {
          htmlContent += tagInfo.tag;
        }
      });
      
      setDisplayedContent(htmlContent);
    }, 1000 / (typingSpeed * 2)); // Adjust timing based on speed
    
    return () => clearInterval(typingInterval);
  }, [isTyping, typingSpeed, onComplete]);
  
  return <div dangerouslySetInnerHTML={{ __html: displayedContent }} />;
};

export default TypingAnimation;