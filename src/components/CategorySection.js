import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { PreviewCard } from './PreviewCard';
import { Check } from 'lucide-react';

export const CategorySection = ({
  title,
  options,
  selectedValue,
  selectedValues = [],
  onSelect,
  isPremiumUser,
  isUltimateUser,
  showFullPreview,
  delay = 0,
  activeOptionRef,
  type,
  multiSelect = false
}) => {
  // Ultimate users should have access to premium features
  const hasAccessToPremium = isPremiumUser || isUltimateUser;
  const isSelected = (value) => {
    if (multiSelect) {
      return selectedValues.includes(value);
    }
    return value === selectedValue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-4"
    >
      <h4 className="text-base font-medium text-[var(--textSecondary)] pl-1">
        {title}
      </h4>
      
      <div className={classNames(
        'grid gap-3',
        {
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': showFullPreview && !multiSelect,
          'grid-cols-1': showFullPreview && multiSelect,
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4': !showFullPreview
        }
      )}>
        {options.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + (index * 0.05) }}
            ref={multiSelect 
              ? (selectedValues.includes(option.value) ? activeOptionRef : null)
              : (option.value === selectedValue ? activeOptionRef : null)
            }
          >
            {showFullPreview ? (
              <div className="relative">
                <PreviewCard
                  label={option.label}
                  value={option.value}
                  type={type}
                  isSelected={isSelected(option.value)}
                  isPremium={option.isPremium}
                  isDisabled={option.isPremium && !hasAccessToPremium}
                  onClick={() => onSelect(option)}
                  inSidebar={false}
                />
                {multiSelect && isSelected(option.value) && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            ) : (
              <motion.button
                className={classNames(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2',
                  'transition-all duration-200',
                  {
                    'border-emerald-500 bg-emerald-500/10': isSelected(option.value),
                    'border-[var(--border)] hover:border-emerald-500/50': 
                      !isSelected(option.value) && (!option.isPremium || hasAccessToPremium),
                    'opacity-75 cursor-not-allowed': option.isPremium && !hasAccessToPremium,
                    'cursor-pointer': !option.isPremium || hasAccessToPremium
                  }
                )}
                onClick={() => (!option.isPremium || hasAccessToPremium) && onSelect(option)}
              >
                <span className="text-sm font-medium text-[var(--text)]">
                  {option.label.replace(' (Premium)', '')}
                </span>
                {isSelected(option.value) ? (
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                    <span>Selected</span>
                    {!multiSelect && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                    {multiSelect && <Check className="h-3 w-3" />}
                  </div>
                ) : (
                  option.isPremium && !hasAccessToPremium && (
                    <span className="text-xs font-medium text-emerald-500">
                      Premium
                    </span>
                  )
                )}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};