// PageTransition.js
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

// AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import App from './App';
import HelpPage from './components/HelpPage';
import { PageTransition } from './components/PageTransition';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <PageTransition>
              <App />
            </PageTransition>
          } 
        />
        <Route 
          path="/help" 
          element={
            <PageTransition>
              <HelpPage />
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

const AppRouter = () => {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
};

export default AppRouter;