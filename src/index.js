import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRouter from './AppRouter';

// Initialize the thumbnail regenerator tool for fixing animation thumbnails
import { setupThumbnailRegenerator } from './utils/regenerateThumbnails';

// Set up the utility function that can be called from the browser console
setupThumbnailRegenerator();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);