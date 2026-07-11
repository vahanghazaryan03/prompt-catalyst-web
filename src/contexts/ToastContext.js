import React, { createContext, useContext } from 'react';
import { useToast as useToastComponent } from '../components/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const { addToast, ToastContainer } = useToastComponent();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};