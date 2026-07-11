import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
  ArrowLeft, Book, Search, HelpCircle, ExternalLink,
  Clapperboard, Calendar, Filter, History, Palette, Star, Command, Image,
  Wand2, Sparkles, X, Coins, FileText, Shield, Play, PencilRuler
} from 'lucide-react';

import { useDocSearch } from './hooks/useDocSearch';
import SearchResults from './SearchResults';
import { Card } from './HelpComponents';
import MobileNavigation from './MobileNavigation';
import { detectAndApplyHelpPageTheme, setupHelpPageThemeListener } from './utils/themeDetector';
import { 
  GettingStartedSection,
  CoreFeaturesSection,
  ImageAnalysisSection,
  VideoModeSection,
  AnimateSection,
  EditSection,
  CollectionsSection,
  HistorySection,
  StyleReferencesSection,
  WeeklyPromptsSection,
  PromptOperationsSection,
  GenerateSection,
  CreditUsageSection
} from './sections';

const EmailPopup = ({ isOpen, onClose }) => {
  const email = "support@catalystmedia.ai";
  const [copied, setCopied] = useState(false);
  const popupRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop with fade-in */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 animate-fadeIn"
        style={{ animationFillMode: 'forwards' }}
      />
      
      {/* Popup with slide-up and fade-in */}
      <div 
        ref={popupRef}
        className="relative bg-[var(--card)] rounded-xl shadow-2xl max-w-md w-full 
                 transform opacity-0 translate-y-4 animate-slideUp email-popup-container"
        style={{ animationFillMode: 'forwards' }}
      >
        {/* Decorative gradient border */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-transparent -z-10" />
        
        {/* Content container */}
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl lg:text-2xl font-semibold text-[var(--text)]">
                Contact Support
              </h3>
              <p className="mt-2 text-[var(--text)] opacity-80">
                Our support team is here to help
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--textSecondary)] hover:text-[var(--text)] 
                       p-1 rounded-lg transition-colors hover:bg-[var(--primary)]/5"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email display and copy section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--textSecondary)] mb-2">
                Support Email
              </label>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 bg-[var(--background)] rounded-lg p-0.5">
                  <div className="flex items-center h-full">
                    <code className="px-3 py-2 text-[var(--text)] font-mono text-sm lg:text-base w-full">
                      {email}
                    </code>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${copied 
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                      : 'bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90'
                    }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Additional info */}
            <p className="text-sm text-[var(--textSecondary)] mt-4">
              Expected response time: Within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HelpPage = () => {
  const navigate = useNavigate();  
  const [activeSection, setActiveSection] = useState('getting-started');
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const searchContainerRef = useRef(null);

  // Apply theme detection for Help page
  useEffect(() => {
    // Apply theme immediately
    detectAndApplyHelpPageTheme();
    
    // Set up theme change listeners
    setupHelpPageThemeListener();
    
    // Apply theme again after a short delay to ensure it sticks
    const timer = setTimeout(() => {
      detectAndApplyHelpPageTheme();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Add a handler for section changes that includes smooth scrolling
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Scroll the window to top with smooth behavior
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const sections = [
    { 
      id: 'getting-started', 
      title: 'Getting Started', 
      icon: <Book className="w-4 h-4" />,
      component: GettingStartedSection 
    },
    { 
      id: 'credit-usage',
      title: 'Credit Usage', 
      icon: <Coins className="w-4 h-4" />,
      component: CreditUsageSection
    },
    { 
      id: 'core-features', 
      title: 'Core Features', 
      icon: <Command className="w-4 h-4" />,
      component: CoreFeaturesSection
    },
    { 
      id: 'prompt-operations', 
      title: 'Prompt Operations', 
      icon: <Wand2 className="w-4 h-4" />,
      component: PromptOperationsSection
    },
    { 
      id: 'generate', 
      title: 'Generate', 
      icon: <Sparkles className="w-4 h-4" />,
      component: GenerateSection
    },
    { 
      id: 'edit', 
      title: 'Edit', 
      icon: <PencilRuler className="w-4 h-4" />,
      component: EditSection
    },
    { 
      id: 'animate', 
      title: 'Animate', 
      icon: <Play className="w-4 h-4" />,
      component: AnimateSection
    },
    { 
      id: 'image-analysis', 
      title: 'Image Analysis', 
      icon: <Image className="w-4 h-4" />,
      component: ImageAnalysisSection
    },
    { 
      id: 'collections', 
      title: 'Collections', 
      icon: <Star className="w-4 h-4" />,
      component: CollectionsSection
    },
    { 
      id: 'history', 
      title: 'History', 
      icon: <History className="w-4 h-4" />,
      component: HistorySection
    },
    { 
      id: 'weekly-prompts', 
      title: 'Weekly Prompts', 
      icon: <Calendar className="w-4 h-4" />,
      component: WeeklyPromptsSection
    },
    { 
      id: 'video-mode', 
      title: 'Video Mode', 
      icon: <Clapperboard className="w-4 h-4" />,
      component: VideoModeSection
    }
  ];
  
  // Additional sections that are not shown in the main navigation but can be accessed programmatically
  const hiddenSections = [
    { 
      id: 'style-references', 
      title: 'Style References', 
      icon: <Palette className="w-4 h-4" />,
      component: StyleReferencesSection
    }
  ];

  // Combined sections for search and rendering purposes
  const allSections = [...sections, ...hiddenSections];

  const {
    searchQuery,
    searchResults,
    showResults,
    handleSearchChange,
    clearSearch,
    closeResults,
    setShowResults
  } = useDocSearch(allSections);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        closeResults();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeResults]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && showResults) {
        closeResults();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showResults, closeResults]);

  const handleResultClick = (result) => {
    setActiveSection(result.section);
    closeResults();

    // For search results, we still want to scroll to the specific element
    // So we don't call handleSectionChange here

    const element = document.getElementById(result.section);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }

    if (result.elementId) {
      setTimeout(() => {
        const targetElement = document.getElementById(result.elementId);
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
          targetElement.classList.add('highlight-pulse');
          setTimeout(() => targetElement.classList.remove('highlight-pulse'), 2000);
        }
      }, 500);
    }
  };

  const renderActiveSection = () => {
    const section = allSections.find(s => s.id === activeSection);
    if (!section) return null;
    const Component = section.component;
    return <Component />;
  };

  const navigationMenu = (
    <nav className="hidden lg:block sticky top-24 w-64 h-[calc(100vh-6rem)] overflow-y-auto pr-4">
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              id={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${
                  activeSection === section.id
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-[var(--text)] opacity-80 hover:text-[var(--text)] hover:bg-[var(--primary)]/5'
                }`}
            >
              {section.icon}
              <span>{section.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  const searchInput = (
    <div ref={searchContainerRef} className="relative w-full max-w-lg">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--textSecondary)]" />
      <input
        type="text"
        placeholder="Search documentation..."
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="w-full pl-12 pr-12 py-2 bg-[var(--background)] backdrop-blur-sm rounded-lg 
          border border-[var(--border)] placeholder-[var(--textSecondary)] text-[var(--text)]
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]
          transition-all duration-200"
        onKeyPress={handleSearchKeyPress}
      />
      {searchQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--textSecondary)] 
            hover:text-[var(--text)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <SearchResults
        results={searchResults}
        searchQuery={searchQuery}
        onResultClick={handleResultClick}
        onClose={closeResults}
        isVisible={showResults}
      />
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-[var(--background)] help-page-container"
      style={{
        // Inline fallback styles in case CSS variables don't load
        '--background': 'var(--background, #171717)',
        '--cardBackground': 'var(--cardBackground, #1e1e1e)',
        '--text': 'var(--text, #f5f5f5)',
        '--textSecondary': 'var(--textSecondary, #888)',
        '--border': 'var(--border, #333)',
        '--primary': 'var(--primary, #42f56f)',
        '--card': 'var(--card, #1e1e1e)'
      }}
    >
      <EmailPopup 
        isOpen={showEmailPopup}
        onClose={() => setShowEmailPopup(false)}
      />

      {/* Header */}
      <header className="fixed lg:sticky top-0 z-[90] w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm help-page-header">
        <div className="container mx-auto px-4">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center h-16">
            <Link 
              to="/" 
              className="mr-4 text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--textSecondary)]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-9 py-1.5 bg-[var(--background)] backdrop-blur-sm rounded-lg 
                  border border-[var(--border)] placeholder-[var(--textSecondary)] text-[var(--text)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]
                  text-sm transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--textSecondary)] 
                    hover:text-[var(--text)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <SearchResults
                results={searchResults}
                searchQuery={searchQuery}
                onResultClick={handleResultClick}
                onClose={closeResults}
                isVisible={showResults}
              />
            </div>
          </div>
          
          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
            
            {searchInput}

            <button 
              onClick={() => setShowEmailPopup(true)}
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              Get Help
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-16 lg:pt-0">
        <section className="relative overflow-hidden bg-[var(--background)] text-[var(--text)] py-8 lg:py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent" />
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:16px_16px]" />
          <div className="relative container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--text)] to-[var(--textSecondary)]">
                Prompt Catalyst Documentation
              </h1>
              <p className="text-lg lg:text-xl text-[var(--text)] opacity-80">
                Your comprehensive guide to mastering AI prompt engineering
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex gap-8">
            {navigationMenu}
            <main className="flex-1 max-w-4xl mx-auto lg:mx-0">
              {renderActiveSection()}
            </main>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-12 help-footer">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[var(--text)] opacity-80">
              Last updated: June 12, 2025
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => setShowEmailPopup(true)}
                className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors text-sm"
              >
                Contact Support
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  navigate('/', { replace: true });
                  setTimeout(() => {
                    window.location.href = '/premium';
                  }, 0);
                }}
                className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors text-sm"
              >
                Get Premium
                <Star className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legal documents footer section */}
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-[var(--text)] opacity-80">
                © {new Date().getFullYear()} Prompt Catalyst. All rights reserved.
              </div>
              <div className="mt-3 sm:mt-0 flex items-center space-x-6">
                <Link to="/legal/privacy-policy" className="inline-flex items-center gap-2 text-[var(--text)] opacity-80 hover:text-[var(--text)] transition-colors text-sm">
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </Link>
                <Link to="/legal/terms-of-service" className="inline-flex items-center gap-2 text-[var(--text)] opacity-80 hover:text-[var(--text)] transition-colors text-sm">
                  <FileText className="w-4 h-4" />
                  Terms of Service
                </Link>
                <Link to="/legal" className="inline-flex items-center gap-2 text-[var(--text)] opacity-80 hover:text-[var(--text)] transition-colors text-sm">
                  <Book className="w-4 h-4" />
                  Legal Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <MobileNavigation 
        sections={sections}
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
      />
    </div>
  );
};

export default HelpPage;