import React, { useState } from 'react';
import { RefreshCw, Copy, InboxIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useWeeklyPrompts } from '../contexts/WeeklyPromptsContext';
import MessageActions from './MessageActions';
import { stripMidjourneyParams } from '../utils/promptUtils';
import { format } from 'date-fns';

const WeekSection = ({ weekData, onPromptOperation, addToast }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const startDate = new Date(weekData.dateRange.start);
  const endDate = new Date(weekData.dateRange.end);
  const dateString = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;

  return (
    <div className="mb-8">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-[var(--cardBackground)] rounded-lg mb-4 hover:bg-[var(--dropdownHover)] transition-colors"
      >
        <h3 className="text-xl font-semibold text-[var(--text)]">{dateString}</h3>
        {isExpanded ? (
          <ChevronUp className="text-[var(--textSecondary)]" />
        ) : (
          <ChevronDown className="text-[var(--textSecondary)]" />
        )}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {weekData.prompts.map((prompt, index) => (
            <div 
              key={`${weekData.dateRange.start}-${index}`}
              className="bg-[var(--cardBackground)] rounded-lg border border-[var(--border)] flex flex-col hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative h-[60%]">
                <img
                  src={prompt.image}
                  alt={prompt.description || "Weekly prompt image"}
                  className="w-full h-full object-cover rounded-t-lg"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                    e.target.onerror = null;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg"></div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {prompt.description && (
                  <p className="text-[var(--textSecondary)] text-sm mb-4 line-clamp-2">
                    {prompt.description}
                  </p>
                )}

                <div className="bg-[var(--background)] rounded-lg p-4 mb-4 flex-1 relative group">
                  <p className="text-[var(--text)] text-sm whitespace-pre-wrap font-mono">
                    {prompt.prompt}
                  </p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(prompt.prompt);
                      addToast('Prompt copied to clipboard!', 'success');
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-[var(--cardBackground)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--dropdownHover)]"
                  >
                    <Copy size={16} className="text-[var(--textSecondary)]" />
                  </button>
                </div>

                {prompt.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prompt.tags.map((tag, tagIndex) => (
                      <span 
                        key={`${weekData.dateRange.start}-${index}-${tagIndex}`}
                        className="px-2 py-1 text-xs rounded-full bg-[var(--dropdownHover)] text-[var(--textSecondary)] hover:bg-[var(--primary)] hover:text-white transition-colors cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <MessageActions
                    prompt={prompt.prompt}
                    onUseInGenerate={(promptText) => onPromptOperation(promptText, 'use')}
                    onVariations={() => onPromptOperation(prompt.prompt, 'variations')}
                    onExtend={(details) => onPromptOperation(prompt.prompt, 'extend', details)}
                    onShorten={() => onPromptOperation(prompt.prompt, 'shorten')}
                    onEdit={() => onPromptOperation(prompt.prompt, 'edit')}
                    showPreview={false}
                    showCollectionButton={false}
                    className="pt-4 border-t border-[var(--border)] [&_button]:!px-3 [&_button]:!py-1.5 [&_button]:!text-sm"
                    isCompact={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const WeeklyPrompts = ({ onPromptOperation }) => {
  const { prompts, loading, refreshPrompts, lastUpdated } = useWeeklyPrompts();
  const { addToast } = useToast();
  const { user } = useAuth();

  const handlePromptOperation = (prompt, operation, additionalDetails = {}) => {
    const processedPrompt = operation === 'use' ? stripMidjourneyParams(prompt) : prompt;

    // Use consistent command styling across the app
    const operationDetails = {
      originalPrompt: prompt,
      operationName: operation,
      isCommand: operation !== 'use', // Only mark as command if not using in generate tab
      commandType: operation
    };

    switch (operation) {
      case 'variations':
        operationDetails.isVariation = true;
        break;
      case 'extend':
        operationDetails.isExtended = true;
        operationDetails.settings = additionalDetails;
        break;
      case 'shorten':
        operationDetails.isShortened = true;
        break;
    }

    onPromptOperation(processedPrompt, operation, operationDetails);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-[var(--textSecondary)]">Loading weekly prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 pb-8">
        <div className="modern-card mb-8 group hover:shadow-lg transition-all duration-300 bg-[var(--cardBackground)]">
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                  Prompts of the Week
                </h2>
                {lastUpdated && (
                  <span className="text-sm text-[var(--textSecondary)] bg-[var(--background)]/50 px-3 py-1 rounded-full">
                    Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[var(--textSecondary)] text-sm">
                Curated collection of inspiring prompts updated weekly.
              </p>
            </div>
            
            <button
              onClick={refreshPrompts}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] 
                       bg-[var(--cardBackground)] hover:bg-[var(--dropdownHover)] 
                       text-[var(--textSecondary)] hover:text-[var(--text)]
                       transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <RefreshCw size={16} className={`transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {prompts.map((weekData) => (
          <WeekSection
            key={`${weekData.dateRange.start}-${weekData.dateRange.end}`}
            weekData={weekData}
            onPromptOperation={handlePromptOperation}
            addToast={addToast}
          />
        ))}

        {prompts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <InboxIcon size={48} className="text-[var(--textSecondary)]" />
              <p className="text-[var(--textSecondary)]">No prompts available at the moment. Check back soon!</p>
              <button
                onClick={refreshPrompts}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primaryHover)] transition-colors"
              >
                Try refreshing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyPrompts;