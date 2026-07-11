import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Add CSS keyframes for animations
const toastCSS = `
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast-enter {
  animation: slideInRight 0.3s forwards;
}

.toast-exit {
  animation: slideOutRight 0.3s forwards;
}
`;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef(new Map());
  const [exitingToasts, setExitingToasts] = useState(new Set());

  // Add the CSS to the document head when the component is first used
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = toastCSS;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
      toastTimers.current.forEach(timerId => clearTimeout(timerId));
      toastTimers.current.clear();
    };
  }, []);
  
  const removeToast = useCallback((id) => {
    // Mark toast as exiting
    setExitingToasts(prev => new Set(prev).add(id));
    
    // Remove after animation duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
      setExitingToasts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // Match animation duration
    
    // Clear the auto-dismiss timeout if it exists
    if (toastTimers.current.has(id)) {
      clearTimeout(toastTimers.current.get(id));
      toastTimers.current.delete(id);
    }
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    // Add the new toast
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Set the timer to remove it
    if (duration !== Infinity) {
      const timerId = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      // Store the timer ID so we can clean it up if needed
      toastTimers.current.set(id, timerId);
    }
    
    return id;
  }, [removeToast]);

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`pointer-events-auto ${exitingToasts.has(toast.id) ? 'toast-exit' : 'toast-enter'}`}
        >
          <div
            className={`shadow-lg rounded-md px-4 py-3 flex items-center gap-2 max-w-sm backdrop-blur-sm border
              ${toast.type === 'success' ? 'bg-green-600 border-green-700 text-white' : 
                'bg-gray-800 border-gray-700 text-gray-100'}`}
          >
            <span className="flex-shrink-0">
              {toast.type === 'success' && (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
            </span>
            <span className="text-sm font-medium flex-1">
              {toast.message}
            </span>
            <button 
              onClick={() => removeToast(toast.id)} 
              className={`transition-colors flex-shrink-0 ml-1 ${toast.type === 'success' ? 'text-white hover:text-green-200' : 'text-gray-400 hover:text-gray-300'}`}
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return { addToast, removeToast, ToastContainer };
};