import React from 'react';
import { useGenerate } from '../contexts/GenerateContext';
import GenerateHistory from './GenerateHistory';
import { useEditSettings } from '../hooks/useEditSettings';

// This container component isolates the context usage
// to prevent unnecessary re-renders of the GenerateHistory component
const GenerateHistoryContainer = ({ onRegeneratePrompt }) => {
  // This component will re-render when generateHistory changes
  // but will shield the GenerateHistory component from other context changes
  const { generateHistory, removeFromHistory, clearHistory, updateSettings } = useGenerate();
  
  // Get the setUploadedImage function from EditSettings hook
  const { setUploadedImage } = useEditSettings();
  
  // Create a handler to send images to edit tab
  const handleSendToEdit = (image) => {
    // First, fetch the image as a blob to prepare it for upload
    fetch(image.url)
      .then(response => response.blob())
      .then(blob => {
        // Create a File object from the blob
        const imageFile = new File([blob], `edit-image-${Date.now()}.png`, { type: 'image/png' });
        
        // Create a FileReader to get the image data as base64 for storage
        const reader = new FileReader();
        reader.onload = () => {
          // Set the uploaded image in the EditSettings
          const imageData = { 
            file: imageFile, 
            url: image.url,
            dataUrl: reader.result,
            name: imageFile.name,
            type: imageFile.type,
            lastModified: imageFile.lastModified
          };
          
          setUploadedImage(imageData);
          
          // Navigate to Edit tab
          if (typeof window !== 'undefined') {
            // Try to use window.onViewChange if available
            if (window.onViewChange) {
              window.onViewChange('edit');
            }
          }
        };
        
        // Start reading the file as DataURL
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('Error preparing image for editing:', error);
      });
  };
  
  return (
    <GenerateHistory 
      generateHistory={generateHistory}
      removeFromHistory={removeFromHistory}
      clearHistory={clearHistory}
      updateSettings={updateSettings}
      onRegeneratePrompt={onRegeneratePrompt}
      onSendToEdit={handleSendToEdit}
    />
  );
};

export default GenerateHistoryContainer;