import React, { useState, useEffect } from 'react';
import './Tutorials.css';
import { ChevronLeft, Book, Calendar, User, Clock, Shield, FileText, Home, ArrowUp } from 'lucide-react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ContentContainer from '../layout/ContentContainer';

// Import tutorial data from separate files
import tutorialData from './content';
const Tutorials = () => {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const navigate = useNavigate();
  const { tutorialSlug } = useParams();
  const location = useLocation();
  
  // Load the tutorial based on the URL parameter
  useEffect(() => {
    if (tutorialSlug) {
      // First try to find by slug
      let tutorial = tutorialData.find(t => t.slug === tutorialSlug);
      
      // Backward compatibility for numeric IDs
      if (!tutorial && !isNaN(tutorialSlug)) {
        tutorial = tutorialData.find(t => t.id.toString() === tutorialSlug);
      }
      
      if (tutorial) {
        setSelectedTutorial(tutorial);
      } else {
        // Tutorial not found, navigate back to the list
        navigate('/tutorials');
      }
    } else {
      // No tutorial slug in URL, show the list
      setSelectedTutorial(null);
    }
  }, [tutorialSlug, navigate]);
  
  // Update document title and meta tags for SEO
  useEffect(() => {
    // Save original title and description
    const originalTitle = document.title;
    let originalDescription = '';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      originalDescription = metaDescription.getAttribute('content');
    }
    
    if (selectedTutorial) {
      // Set title and description for specific tutorial
      document.title = `${selectedTutorial.title} - Prompt Catalyst Tutorials`;
      
      // Update meta description
      if (metaDescription) {
        metaDescription.setAttribute('content', selectedTutorial.excerpt);
      } else {
        // Create meta description if it doesn't exist
        const newMetaDescription = document.createElement('meta');
        newMetaDescription.setAttribute('name', 'description');
        newMetaDescription.setAttribute('content', selectedTutorial.excerpt);
        document.head.appendChild(newMetaDescription);
      }
      
      // Create canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      const url = window.location.origin + location.pathname;
      canonicalLink.setAttribute('href', url);
    } else {
      // Set title for tutorials list
      document.title = 'Tutorials - Prompt Catalyst';
      
      // Update meta description for tutorials list
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Learn how to use Prompt Catalyst to create amazing content with our detailed tutorials and guides.');
      }
      
      // Update canonical URL for tutorials list
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', window.location.origin + '/tutorials');
    }
    
    // Clean up when component unmounts
    return () => {
      document.title = originalTitle;
      if (metaDescription && originalDescription) {
        metaDescription.setAttribute('content', originalDescription);
      }
      // Remove canonical link
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        document.head.removeChild(canonicalLink);
      }
    };
  }, [selectedTutorial, location.pathname]);
  
  // Prevent white flash by setting the background color on the document body
  useEffect(() => {
    // Save the original background color
    const originalBgColor = document.body.style.backgroundColor;
    const originalTransition = document.body.style.transition;
    
    // Apply background color immediately to prevent flash
    document.body.style.backgroundColor = 'var(--background)';
    document.body.style.transition = 'background-color 0s';
    
    // Clean up when unmounting
    return () => {
      document.body.style.backgroundColor = originalBgColor;
      document.body.style.transition = originalTransition;
    };
  }, []);
  
  const handleBack = () => {
    if (selectedTutorial) {
      // Navigate back to the tutorials list
      navigate('/tutorials');
      // Scroll back to top
      window.scrollTo(0, 0);
    } else {
      // Navigate back to main app if we're at the tutorial list
      navigate('/');
    }
  };
  
  const handleSelectTutorial = (tutorial) => {
    // Navigate to the tutorial-specific URL using the slug if available, otherwise fall back to ID
    const urlPath = tutorial.slug ? tutorial.slug : tutorial.id;
    navigate(`/tutorials/${urlPath}`);
    // Scroll back to top when opening a tutorial
    window.scrollTo(0, 0);
  };
  
  const renderTutorialsList = () => (
    <div className="space-y-8">
      <motion.h1 
        className="text-3xl font-bold text-[var(--text)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Tutorials
      </motion.h1>
      <motion.p 
        className="text-[var(--textSecondary)] max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Learn how to use Prompt Catalyst to create amazing content. These guides will help you master different features and techniques.
      </motion.p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {tutorialData.map((tutorial, index) => (
          <motion.article 
            key={tutorial.id}
            className="group bg-[var(--cardBackground)] rounded-xl overflow-hidden border border-[var(--border)] transition-all duration-300 hover:border-[var(--primary)] hover:shadow-lg cursor-pointer"
            onClick={() => handleSelectTutorial(tutorial)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ y: -5 }}
          >
            <div className="relative aspect-video overflow-hidden">
              <motion.img 
                src={tutorial.coverImage} 
                alt={tutorial.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70"></div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
              {tutorial.tags.map((tag, tagIndex) => (
              <motion.span 
              key={tag} 
                className="text-xs font-medium py-1 px-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1 + tagIndex * 0.05,
                    ease: "easeOut"
                  }}
                >
                  {tag}
                </motion.span>
                ))}
              </div>
            <motion.h2 
                className="text-xl font-bold text-[var(--text)] mb-2 group-hover:text-[var(--primary)] transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
              >
                {tutorial.title}
              </motion.h2>
              <motion.p 
                className="text-[var(--textSecondary)] mb-4 line-clamp-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
              >
                {tutorial.excerpt}
              </motion.p>
              <motion.div 
                className="flex items-center text-sm text-[var(--textSecondary)] gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
              >
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{tutorial.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{tutorial.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{tutorial.readTime}</span>
                </div>
              </motion.div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
  
  // Handle preset button clicks
  useEffect(() => {
    const handlePresetButtonClick = (e) => {
      if (e.target.closest('.use-preset-button')) {
        e.preventDefault();
        
        const button = e.target.closest('.use-preset-button');
        const presetName = button.getAttribute('data-preset');
        
        // Store the preset name in localStorage to be applied on app load
        if (presetName) {
          localStorage.setItem('tutorial_preset_to_apply', presetName);
          // Navigate to the main app
          navigate('/');
        }
      }
    };
    
    document.addEventListener('click', handlePresetButtonClick);
    
    return () => {
      document.removeEventListener('click', handlePresetButtonClick);
    };
  }, [navigate]);
  
  // Back to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const backToTopButton = document.querySelector('.back-to-top');
      if (backToTopButton) {
        if (window.scrollY > 500) {
          backToTopButton.classList.add('visible');
        } else {
          backToTopButton.classList.remove('visible');
        }
      }
    };

    const handleBackToTopClick = (e) => {
      if (e.target.closest('.back-to-top')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleBackToTopClick);
    
    // Initial check in case page loads already scrolled
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleBackToTopClick);
    };
  }, [selectedTutorial]);

  const renderTutorialContent = () => {
    if (!selectedTutorial) return null;
    
    // Parse markdown content (simple version)
    const parseMarkdown = (content) => {
      // Split content into lines
      const lines = content.split('\n');
      
      // Process each line
      const processedLines = lines.map(line => {
        // Handle headers
        if (line.startsWith('# ')) {
          return `<h1 class="text-3xl font-bold text-[var(--text)] mt-6 mb-4">${line.substring(2)}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold text-[var(--text)] mt-6 mb-3">${line.substring(3)}</h2>`;
        } else if (line.startsWith('### ')) {
          return `<h3 class="text-xl font-bold text-[var(--text)] mt-5 mb-2">${line.substring(4)}</h3>`;
        }
        
        // Handle bold text
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Handle lists
        if (line.startsWith('- ')) {
          return `<li class="ml-4 list-disc text-[var(--text)] mb-2">${processedLine.substring(2)}</li>`;
        }
        
        // Handle numbered lists
        if (/^\d+\.\s/.test(line)) {
          return `<li class="ml-4 list-decimal text-[var(--text)] mb-2">${processedLine.replace(/^\d+\.\s/, '')}</li>`;
        }
        
        // Handle paragraphs (non-empty lines that aren't headers or list items)
        if (line.trim() && !line.startsWith('<')) {
          return `<p class="text-[var(--text)] mb-4">${processedLine}</p>`;
        }
        
        return line; // Return unchanged if no rules match
      });
      
      // Join lines back together
      let html = processedLines.join('\n');
      
      // Wrap adjacent list items in ul or ol tags
      html = html.replace(/<li class="ml-4 list-disc[^>]*>[^<]*<\/li>\n(?=<li class="ml-4 list-disc)/g, match => {
        return match + '<ul class="mb-4">\n';
      });
      html = html.replace(/<li class="ml-4 list-decimal[^>]*>[^<]*<\/li>\n(?=<li class="ml-4 list-decimal)/g, match => {
        return match + '<ol class="mb-4">\n';
      });
      
      // Add closing ul/ol tags
      html = html.replace(/<li class="ml-4 list-disc[^>]*>[^<]*<\/li>\n(?!<li class="ml-4 list-disc)/g, match => {
        return match + '</ul>\n';
      });
      html = html.replace(/<li class="ml-4 list-decimal[^>]*>[^<]*<\/li>\n(?!<li class="ml-4 list-decimal)/g, match => {
        return match + '</ol>\n';
      });
      
      return html;
    };
    
    return (
      <div className="space-y-6 text-[var(--text)]">
        
        <motion.div 
          className="relative aspect-video rounded-xl overflow-hidden mb-6 shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <img 
            src={selectedTutorial.heroImage?.url || selectedTutorial.coverImage} 
            alt={selectedTutorial.heroImage?.alt || selectedTutorial.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTutorial.heroImage?.attribution && (
                <span className="text-xs bg-black/50 text-white/70 py-1 px-2 rounded-full">
                  {selectedTutorial.heroImage.attribution}
                </span>
              )}
              {selectedTutorial.tags.map((tag, tagIndex) => (
                <motion.span 
                  key={tag} 
                  className="text-xs font-medium py-1 px-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.2 + tagIndex * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {selectedTutorial.title}
            </motion.h1>
            <motion.div 
              className="flex items-center text-sm text-white/80 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{selectedTutorial.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{selectedTutorial.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{selectedTutorial.readTime}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          className="prose prose-lg max-w-none tutorial-content bg-[var(--background)] text-[var(--text)]"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedTutorial.content) }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        />
      </div>
    );
  };
  
  return (
    <motion.div 
      className="min-h-screen bg-[var(--background)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="sticky top-0 z-10 bg-[var(--cardBackground)]/80 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 text-[var(--textSecondary)] hover:text-[var(--primary)] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>{selectedTutorial ? 'Back to Tutorials' : 'Back to App'}</span>
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Prompt Catalyst"
              className="h-8 w-8 object-contain"
            />
            <h1 className="ml-2 text-lg font-semibold text-[var(--text)] truncate">
              Tutorials
            </h1>
          </div>
          <div className="w-24">{/* Empty space to balance the header */}</div>
        </div>
      </header>
      <ContentContainer maxWidth="max-w-6xl">
        <div className="py-8 px-4 sm:px-6 bg-[var(--background)]">
          <AnimatePresence mode="wait">
            {selectedTutorial ? (
              <motion.div
                key="tutorial-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {renderTutorialContent()}
              </motion.div>
            ) : (
              <motion.div
                key="tutorial-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {renderTutorialsList()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ContentContainer>

      {/* Main footer */}
      <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-12">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              Back to App
            </Link>
           
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

      {/* Back to top button */}
      <a href="#" className="back-to-top" aria-label="Back to top">
        <ArrowUp size={18} strokeWidth={2.5} color="#000000" />
        <span className="sr-only">Back to top</span>
      </a>
    </motion.div>
  );
};

export default Tutorials;