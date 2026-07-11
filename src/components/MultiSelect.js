import React, { useState } from 'react';
import { HelpCircle, X, Plus } from 'lucide-react';
import { PreviewCard } from './PreviewCard';
import { SelectDialog } from './SelectDialog';
import { Tooltip } from './Tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptionsForType } from './Select'; // Import the options function from Select component

// Helper function to get the folder name for preview images
const getFolderName = (type) => {
  const folderMap = {
    style: 'styles',
    cameraAngle: 'camera-angles',
    lighting: 'lighting',
    purpose: 'purposes'
  };
  return folderMap[type] || type;
};

const TOOLTIPS = {
  style: 'Choose multiple artistic styles to blend together. Combining styles can create unique visual aesthetics.',
  cameraAngle: 'Select multiple camera perspectives to incorporate in your image prompt.',
  lighting: 'Choose multiple lighting techniques to influence the mood and atmosphere of your image.'
};

export const MultiSelect = ({
  label,
  type = 'style',
  values = [],
  onChange,
  isPremiumUser = false,
  className = '',
  inSidebar = false,
  maxSelections = 3
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const tooltip = TOOLTIPS[type] || `Select multiple ${type.toLowerCase()} options to combine in your prompt.`;
  const showFullPreview = ['style', 'cameraAngle', 'lighting'].includes(type);
  
  // Get options for the given type
  const options = getOptionsForType(type);
  
  const handleRemoveItem = (valueToRemove) => {
    onChange(values.filter(value => value !== valueToRemove));
  };
  
  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleSelectionChange = (selectedValues) => {
    // Handle case where 'not_specified' is among the selections
    if (selectedValues.includes('not_specified')) {
      // If the only selection is 'not_specified', pass an empty array to truly reset
      onChange(selectedValues.length === 1 ? [] : ['not_specified']);
    } else {
      onChange(selectedValues);
    }
    setIsDialogOpen(false);
  };

  // Check if max selections reached
  const isMaxReached = values.length >= maxSelections;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5"> 
          <span className="text-sm font-medium text-[var(--textBrighter)]">
            {label}
          </span>
          <Tooltip content={tooltip}>
            <div className="w-3 h-3 flex items-center justify-center translate-y-[0.5px] cursor-help text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
          </Tooltip>
        </div>
        <span className="text-xs text-[var(--textSecondary)]">
          {values.length}/{maxSelections} selected
        </span>
      </div>

      {/* Selected Items Container */}
      <div className="mb-2">
        <AnimatePresence>
          {values.length === 0 ? (
            <div className="text-xs text-[var(--textSecondary)] py-2">
              No {label.toLowerCase()} selected
            </div>
          ) : values.length === 1 ? (
            // Single item - full preview
            <motion.div 
              key={values[0]}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="relative group">
                <div onClick={handleAddClick} className="cursor-pointer">
                <PreviewCard
                  label={values[0] === 'realism' ? 'Photorealism' : values[0].replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  value={values[0]}
                  type={type}
                  isSelected={true}
                  isPremium={false}
                  inSidebar={inSidebar}
                  multiSelect={true}
                />
              </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(values[0]);
                  }}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-[var(--cardBackground)] hover:bg-[var(--dropdownHover)] text-[var(--text)] border border-[var(--border)] rounded-full transition-colors shadow-lg"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ) : (
            // Multiple items - grid layout with smaller previews
            <div className="grid grid-cols-2 gap-2 cursor-pointer" onClick={handleAddClick}>
              {values.map((value, index) => (
                <motion.div 
                  key={value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="relative group bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-emerald-500/50 transition-colors">
                    {/* Small preview image if available */}
                    <div className="flex items-center p-2">
                      <img 
                        src={`/previews/${getFolderName(type)}/${value}-preview.png`} 
                        alt={value}
                        onError={(e) => e.target.style.display = 'none'}
                        className="w-8 h-8 mr-2 object-cover rounded"
                      />
                      <span className="text-xs text-[var(--text)] truncate">
                        {value === 'realism' ? 'Photorealism' : value.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                    <button
                    onClick={(e) => {
                      e.stopPropagation();
                        handleRemoveItem(value);
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-[var(--cardBackground)] hover:bg-[var(--dropdownHover)] text-[var(--text)] border border-[var(--border)] rounded-full transition-colors shadow-lg"
                  >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Button */}
      {!isMaxReached && (
        <motion.button
          onClick={handleAddClick}
          className="w-full flex items-center justify-center px-3 py-2 mt-2 border-2 border-dashed border-[var(--border)] 
                     rounded-lg text-[var(--textBrighter)] hover:text-white hover:border-[var(--primary)]/50 
                     hover:bg-[var(--primary)]/5 transition-all"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Add {label.replace(/s$/, '')}</span>
        </motion.button>
      )}
      
      {/* Selection Dialog - We'll modify the existing SelectDialog later */}
      <SelectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        label={`Select ${label}`}
        type={type}
        value={values.length > 0 ? values[0] : ''}
        onChange={handleSelectionChange}
        isPremiumUser={isPremiumUser}
        multiSelect={true}
        selectedValues={values}
        maxSelections={maxSelections}
        options={options}
        closeOnSelect={true}
      />
    </div>
  );
};

export default MultiSelect;