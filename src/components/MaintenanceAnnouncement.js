import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Cat } from 'lucide-react';

const MaintenanceAnnouncement = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setIsVisible(false);
      return;
    }

    // Check if the announcement has been dismissed
    const dismissedKey = 'maintenance_announcement_dismissed_2025_04_21';
    const isDismissedStored = localStorage.getItem(dismissedKey);
    
    if (isDismissedStored) {
      setIsDismissed(true);
      setIsVisible(false);
      return;
    }

    // Check if the current date is before the maintenance date
    const maintenanceStartDate = new Date('2025-04-21T04:00:00+02:00'); // Monday, April 21, 4:00 AM CEST
    const currentDate = new Date();
    
    if (currentDate < maintenanceStartDate) {
      setIsVisible(true);
    }
  }, [user]);

  const handleDismiss = () => {
    const dismissedKey = 'maintenance_announcement_dismissed_2025_04_21';
    localStorage.setItem(dismissedKey, 'true');
    setIsDismissed(true);
    setIsVisible(false);
  };

  // No early return here to allow the smooth animation

  return (
    <AnimatePresence mode="wait">
      {isVisible && !isDismissed && (
        <motion.div
          key="maintenance-announcement"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ 
            opacity: 0, 
            y: -10,
            transition: { duration: 0.3, ease: "easeInOut" }
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-3 left-auto right-4 z-50"
        >
          <div className="max-w-xl w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Cat className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-sm text-white">
                <span className="font-medium">Scheduled Maintenance:</span> Service will be unavailable on <span className="font-medium text-yellow-500">Monday, April 21</span>, 4:00-8:00 AM CEST
                <span className="text-gray-400 ml-1">(Sun, Apr 20, 10:00 PM – 2:00 AM EDT)</span>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-4 p-1 text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Dismiss announcement"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MaintenanceAnnouncement;