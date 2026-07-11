import React, { useState } from 'react';
import { RefreshCw, Copy, ChevronDown, ChevronUp, Play, Pause, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useWeeklyPrompts } from '../contexts/WeeklyPromptsContext';
import { format } from 'date-fns';

// Helper component to handle video playback in each card
const VideoThumbnail = ({ videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = React.useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error("Failed to play video:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative h-[60%] group">
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        className={`w-full h-full object-cover rounded-t-lg ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
        onLoadedData={() => setIsLoaded(true)}
        onError={(e) => {
          console.error("Error loading video:", e);
          e.target.src = '/placeholder-video.mp4';
          e.target.onerror = null;
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] rounded-t-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isPlaying ? (
          <Pause size={40} className="text-white opacity-80 hover:opacity-100" />
        ) : (
          <Play size={40} className="text-white opacity-80 hover:opacity-100" />
        )}
      </button>
    </div>
  );
};

// Weekly section component - renders all prompts for a specific week
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {weekData.prompts.map((prompt, index) => (
            <div 
              key={`${weekData.dateRange.start}-${index}`}
              className="bg-[var(--cardBackground)] rounded-lg border border-[var(--border)] flex flex-col hover:shadow-lg transition-shadow duration-200"
            >
              {/* Video thumbnail */}
              <VideoThumbnail videoUrl={prompt.video} />

              <div className="p-6 flex-1 flex flex-col">
                {/* Prompt content */}
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

                {/* Use button */}
                <button
                  onClick={() => onPromptOperation(prompt.prompt, 'use')}
                  className="w-full py-2 px-4 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primaryHover)] transition-colors"
                >
                  Use This Prompt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SimplifiedVideoWeeklyPrompts = ({ onPromptOperation }) => {
  const { videoPrompts, videoLoading, refreshVideoPrompts, videoLastUpdated } = useWeeklyPrompts();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Handle prompt operations (simplified to just 'use')
  const handlePromptOperation = (prompt, operation) => {
    onPromptOperation(prompt, operation, { isVideoMode: true });
  };

  if (videoLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-[var(--textSecondary)]">Loading weekly video prompts...</p>
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
                  Video Prompts of the Week
                </h2>
                {videoLastUpdated && (
                  <span className="text-sm text-[var(--textSecondary)] bg-[var(--background)]/50 px-3 py-1 rounded-full">
                    Last updated: {new Date(videoLastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[var(--textSecondary)] text-sm">
                Curated collection of inspiring video prompts updated weekly. Simplified to just video and prompt.
              </p>
            </div>
            
            <button
              onClick={refreshVideoPrompts}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] 
                       bg-[var(--cardBackground)] hover:bg-[var(--dropdownHover)] 
                       text-[var(--textSecondary)] hover:text-[var(--text)]
                       transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <RefreshCw size={16} className={`transition-transform duration-300 ${videoLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {videoPrompts.map((weekData) => (
          <WeekSection
            key={`${weekData.dateRange.start}-${weekData.dateRange.end}`}
            weekData={weekData}
            onPromptOperation={handlePromptOperation}
            addToast={addToast}
          />
        ))}

        {videoPrompts.length === 0 && !videoLoading && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Video size={48} className="text-[var(--textSecondary)]" />
              <p className="text-[var(--textSecondary)]">No video prompts available at the moment. Check back soon!</p>
              <button
                onClick={refreshVideoPrompts}
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

export default SimplifiedVideoWeeklyPrompts;