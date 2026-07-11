import React, { useEffect, useRef, useState } from 'react';
import { preloadManager } from '../utils/assetCache';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, ChevronUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreviewCard } from './PreviewCard';
import { ModelPreview } from './ModelPreview';
import { CategorySection } from './CategorySection';
import classNames from 'classnames';
import { getOptionsForType } from './Select'; // Import the options function

export const SelectDialog = ({
  isOpen,
  onClose,
  label,
  type,
  value,
  onChange,
  isPremiumUser,
  isUltimateUser,
  options,
  tooltip,
  PreviewComponent = PreviewCard,
  multiSelect = false,
  selectedValues = [],
  maxSelections = 3,
  closeOnSelect = true,
  customTooltip = null
}) => {
  // Define hasAccessToPremium at the very top of the component
  const hasAccessToPremium = isPremiumUser || isUltimateUser;
  
  const dialogContentRef = useRef(null);
  const activeOptionRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [localSelectedValues, setLocalSelectedValues] = useState([]);

  // Get options if not provided - memoize this to prevent recalculations on every render
  const effectiveOptions = React.useMemo(() => {
    return options || getOptionsForType(type);
  }, [options, type]);
  
  // Initialize local state when dialog opens - with a stability check
  const prevOpenRef = useRef(isOpen);
  const prevSelectedValuesRef = useRef(selectedValues);
  const prevValueRef = useRef(value);
  
  useEffect(() => {
    // Only update state if relevant props have changed
    const selectedValuesChanged = !arraysEqual(prevSelectedValuesRef.current, selectedValues);
    const valueChanged = prevValueRef.current !== value;
    const openChanged = prevOpenRef.current !== isOpen;
    
    if (isOpen && (openChanged || selectedValuesChanged || valueChanged)) {
      if (multiSelect) {
        // Handle special case: if not_specified is in the selection,
        // it should be the only item
        const values = [...selectedValues];
        if (values.includes('not_specified')) {
          setLocalSelectedValues(['not_specified']);
        } else {
          setLocalSelectedValues(values);
        }
      } else {
        setLocalSelectedValues([value]);
      }
      
      // Update refs with current values
      prevOpenRef.current = isOpen;
      prevSelectedValuesRef.current = selectedValues;
      prevValueRef.current = value;
    } else if (openChanged) {
      // Just update the open state ref if only that changed
      prevOpenRef.current = isOpen;
    }
  }, [isOpen, multiSelect, selectedValues, value]);
  
  // Helper function to compare arrays
  function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    
    // Create sorted copies to compare
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    
    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) return false;
    }
    return true;
  }
  
  // Handle scroll events
  const handleScroll = () => {
    if (dialogContentRef.current) {
      setShowScrollTop(dialogContentRef.current.scrollTop > 300);
    }
  };

  useEffect(() => {
    const content = dialogContentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    dialogContentRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Auto-scroll to active option
  useEffect(() => {
    if (isOpen && activeOptionRef.current && dialogContentRef.current) {
      const timeoutId = setTimeout(() => {
        const dialogContent = dialogContentRef.current;
        const activeOption = activeOptionRef.current;
        if (dialogContent && activeOption) { // Add null checks
          const dialogRect = dialogContent.getBoundingClientRect();
          const optionRect = activeOption.getBoundingClientRect();
          const scrollPosition = optionRect.top - dialogRect.top - (dialogRect.height / 2) + (optionRect.height / 2);
          dialogContent.scrollTo({
            top: dialogContent.scrollTop + scrollPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Trigger preloading when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Trigger preloading for this dialog type
      preloadManager.preloadForDialog(type);
    }
  }, [isOpen, type]);

  const handleSelect = (option) => {
    if (option.isPremium && !hasAccessToPremium) return;
    
    if (multiSelect) {
      const optionValue = option.value;
      const isSelected = localSelectedValues.includes(optionValue);
      
      let newValues;
      
      // Special handling for 'not_specified' option
      if (optionValue === 'not_specified') {
        // If not_specified is being selected, clear all other selections
        // If it's already selected and being clicked again, clear it too
        newValues = isSelected ? [] : ['not_specified'];
        setLocalSelectedValues(newValues);
      } else {
        // For other options, remove 'not_specified' if it's in the selection
        // and handle normal toggle behavior
        if (isSelected) {
          // Remove this option
          newValues = localSelectedValues.filter(val => val !== optionValue);
        } else {
          // Add this option, first checking if we've hit the max
          if (localSelectedValues.length >= maxSelections && !localSelectedValues.includes('not_specified')) {
            return; // Don't add more if max reached and not replacing not_specified
          }
          
          // Remove not_specified if it exists and add the new value
          newValues = localSelectedValues.filter(val => val !== 'not_specified');
          newValues.push(optionValue);
        }
        setLocalSelectedValues(newValues);
      }
      
      // Apply the selection immediately and close if closeOnSelect is true
      if (closeOnSelect) {
        onChange(newValues);
        onClose();
      }
    } else {
      // Single select mode
      onChange(option.value);
      onClose();
    }
  };

  const handleApplySelections = () => {
    if (multiSelect) {
      // If not_specified is in the selections, it should be the only item
      // or if empty selections, pass empty array
      if (localSelectedValues.includes('not_specified')) {
        onChange(localSelectedValues.length === 1 ? [] : ['not_specified']);
      } else {
        onChange(localSelectedValues);
      }
    }
    onClose();
  };

  const showFullPreview = ['style', 'cameraAngle', 'lighting', 'purpose', 'videoStyle', 'cameraMovement', 'specialEffects'].includes(type);
  const isModelType = type === 'model';
  const isPurposeType = type === 'purpose';

  // Memoize this function to prevent recreating it on every render
  const getActiveOptionRef = React.useCallback((optionValue) => {
    // Only return the ref for the first selected value to avoid multiple refs
    if (multiSelect) {
      return localSelectedValues[0] === optionValue ? activeOptionRef : null;
    }
    return optionValue === value ? activeOptionRef : null;
  }, [multiSelect, localSelectedValues, value]);

  const renderOption = (option, isPremiumOption = false) => {
    const isSelected = multiSelect 
      ? localSelectedValues.includes(option.value)
      : option.value === value;
    const isDisabled = isPremiumOption && !hasAccessToPremium;
    // This is NOT in the sidebar - it's in a dialog, so inSidebar should be false
    const inSidebar = false;

    if (showFullPreview) {
      return (
        <div className="relative">
          <PreviewComponent
            label={option.label}
            value={option.value}
            type={type}
            isSelected={isSelected}
            isPremium={isPremiumOption}
            isDisabled={isDisabled}
            onClick={() => handleSelect(option)}
            inSidebar={inSidebar}
          />
          {multiSelect && isSelected && (
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
      );
    }

    if (isModelType) {
      return (
        <ModelPreview
          label={option.label}
          value={option.value}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onClick={() => handleSelect(option)}
        />
      );
    }

    return (
      <motion.button
        className={classNames(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200',
          {
            'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20': isSelected,
            'border-[var(--border)] hover:border-emerald-500/50 hover:bg-emerald-500/5': !isSelected && !isDisabled,
            'opacity-75 cursor-not-allowed border-[var(--border)]': isDisabled,
            'text-[var(--textSecondary)]': option.value === 'not_specified',
            'text-[var(--text)]': option.value !== 'not_specified'
          }
        )}
        onClick={() => !isDisabled && handleSelect(option)}
        whileHover={!isDisabled && !isSelected ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
      >
        <span className="text-sm font-medium">
          {option.label.replace(' (Premium)', '')}
        </span>
        {isSelected && (
          <span className="text-xs font-medium text-emerald-500">
            Selected
          </span>
        )}
        {!isSelected && isPremiumOption && !isPremiumUser && (
          <span className="text-xs font-medium text-emerald-500">
            Premium
          </span>
        )}
      </motion.button>
    );
  };

  const renderOptionsGrid = (optionsList, isPremiumSection = false) => (
    <div className={classNames(
      'grid gap-4',
      {
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': showFullPreview,
        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4': !showFullPreview
      }
    )}>
      {optionsList.map((option, index) => (
        <motion.div
          key={option.value}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + (isPremiumSection ? 0.3 : 0) }}
          ref={option.value === (multiSelect ? localSelectedValues[0] : value) ? activeOptionRef : null}
        >
          {renderOption(option, isPremiumSection)}
        </motion.div>
      ))}
    </div>
  );

  const renderContent = () => {
    // Make sure we have options with the expected structure
    const free = effectiveOptions?.free || [];
    const premium = effectiveOptions?.premium || [];
    
    if (!isPurposeType) {
      return (
        <div className="space-y-10">
          <div className="space-y-6">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold text-[var(--text)] pb-2 border-b border-[var(--border)]"
            >
              Standard Options
            </motion.h3>
            {renderOptionsGrid(Array.isArray(free) ? free : [])}
          </div>

          {premium?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 space-y-6"
            >
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-semibold text-[var(--text)] pb-2 border-b border-[var(--border)]"
              >
                Premium Options
              </motion.h3>
              {renderOptionsGrid(Array.isArray(premium) ? premium : [], true)}
            </motion.div>
          )}
        </div>
      );
    }

    // For purpose type (which has a different structure)
    return (
      <div className="space-y-10">
        {Object.entries(free || {}).map(([category, categoryOptions], index) => (
          <CategorySection
            key={category}
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            options={categoryOptions || []}
            selectedValue={value}
            selectedValues={multiSelect ? localSelectedValues : []}
            onSelect={handleSelect}
            isPremiumUser={isPremiumUser}
            isUltimateUser={isUltimateUser}
                showFullPreview={showFullPreview}
            delay={index * 0.1}
            activeOptionRef={getActiveOptionRef}
            type={type}
            multiSelect={multiSelect}
          />
        ))}

        {Object.keys(premium || {}).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 space-y-10"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold text-[var(--text)] pb-2 border-b border-[var(--border)]"
            >
              Premium Options
            </motion.h3>
            {Object.entries(premium || {}).map(([category, categoryOptions], index) => (
              <CategorySection
                key={category}
                title={category.charAt(0).toUpperCase() + category.slice(1)}
                options={categoryOptions || []}
                selectedValue={value}
                selectedValues={multiSelect ? localSelectedValues : []}
                onSelect={handleSelect}
                isPremiumUser={isPremiumUser}
                isUltimateUser={isUltimateUser}
                showFullPreview={showFullPreview}
                delay={index * 0.1 + 0.3}
                activeOptionRef={getActiveOptionRef}
                type={type}
                multiSelect={multiSelect}
              />
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-[var(--cardBackground)] rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-[var(--border)]">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Dialog.Title className="text-xl font-semibold text-[var(--text)]">
                    {label}
                  </Dialog.Title>
                  {multiSelect && (
                    <span className="px-2 py-1 bg-[var(--background)]/50 text-sm text-[var(--textBrighter)] rounded-md border border-[var(--border)]">
                      {localSelectedValues.length}/{maxSelections}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--dropdownHover)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--textSecondary)]" />
                </motion.button>
              </div>

              <div 
                ref={dialogContentRef} 
                className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-80px-60px)] scroll-smooth"
                onScroll={handleScroll}
              >
                {renderContent()}
              </div>

              {multiSelect && !closeOnSelect && (
                <div className="flex items-center justify-between p-4 sm:p-6 border-t border-[var(--border)]">
                  <div className="text-sm text-[var(--textSecondary)]">
                    {localSelectedValues.length} of {maxSelections} selected
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg bg-[var(--background)]/30 text-[var(--text)] hover:bg-[var(--background)]/50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplySelections}
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      disabled={localSelectedValues.length === 0}
                    >
                      Apply Selections
                    </motion.button>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {showScrollTop && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 p-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};