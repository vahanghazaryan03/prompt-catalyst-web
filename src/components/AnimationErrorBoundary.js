// src/components/AnimationErrorBoundary.js
import React, { Component } from 'react';
import { cleanupStorage } from '../utils/animationStorage';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../utils/logger';

/**
 * Error boundary component specifically for handling storage-related errors
 * in the Animation component.
 */
class AnimationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      errorMessage: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorMessage: error.message || 'An error occurred in the animation component'
    };
  }

  componentDidCatch(error, info) {
    // Log the error to console
    logger.error('Animation component error:', error);
    logger.error('Error info:', info);
    
    // Clean up storage if the error is storage-related
    if (error.message && (
        error.message.includes('quota') || 
        error.message.includes('storage') ||
        error.message.includes('localStorage') ||
        error.message.includes('sessionStorage'))) {
      logger.debug('Storage error detected, attempting cleanup');
      cleanupStorage();
    }
  }

  handleReset = () => {
    // Clear any problematic storage
    try {
      cleanupStorage();
      
      // Also try to clear animation history storage entries
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('animation_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      logger.warn('Error during storage cleanup:', e);
    }
    
    // Reset error state
    this.setState({ hasError: false, errorMessage: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-6 max-w-md text-center">
            <AlertTriangle size={40} className="mx-auto mb-4 text-amber-500" />
            <h3 className="text-xl font-semibold text-white mb-2">Animation Error</h3>
            <p className="text-white/70 mb-4">
              {this.state.errorMessage?.includes('quota') 
                ? 'The browser storage limit was reached when loading animations. This can happen when storing many animations with large thumbnails.'
                : 'There was a problem with the animation component.'}
            </p>
            <p className="text-white/70 mb-6">
              We've attempted to clean up storage. Please try again.
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg mx-auto"
            >
              <RefreshCw size={16} />
              Reset & Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AnimationErrorBoundary;