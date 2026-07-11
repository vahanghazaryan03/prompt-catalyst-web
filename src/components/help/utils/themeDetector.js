// Help page theme detector utility
export const detectAndApplyHelpPageTheme = () => {
  // Check if we're in the help page
  if (!window.location.pathname.startsWith('/help')) return;

  // Get theme from localStorage (same as main app)
  const savedTheme = localStorage.getItem('selectedTheme');
  
  // Default theme detection
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveTheme = savedTheme || (prefersDark ? 'default' : 'light');
  
  // Apply theme classes to body
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add(effectiveTheme === 'light' ? 'theme-light' : 'theme-dark');
  
  // Apply CSS variables directly to help page container
  const helpContainer = document.querySelector('.help-page-container');
  if (helpContainer) {
    if (effectiveTheme === 'light') {
      helpContainer.style.setProperty('--background', '#ffffff');
      helpContainer.style.setProperty('--cardBackground', '#f8fafc');
      helpContainer.style.setProperty('--text', '#0f172a');
      helpContainer.style.setProperty('--textSecondary', '#64748b');
      helpContainer.style.setProperty('--border', '#e2e8f0');
      helpContainer.style.setProperty('--primary', '#22c55e');
      helpContainer.style.setProperty('--primary-rgb', '34, 197, 94');
      helpContainer.style.setProperty('--dropdownHover', '#f1f5f9');
      helpContainer.style.setProperty('--inputBackground', '#ffffff');
      helpContainer.style.setProperty('--inputBorder', '#cbd5e1');
      helpContainer.style.setProperty('--card', '#f8fafc');
    } else {
      helpContainer.style.setProperty('--background', '#171717');
      helpContainer.style.setProperty('--cardBackground', '#1e1e1e');
      helpContainer.style.setProperty('--text', '#f5f5f5');
      helpContainer.style.setProperty('--textSecondary', '#888');
      helpContainer.style.setProperty('--border', '#333');
      helpContainer.style.setProperty('--primary', '#42f56f');
      helpContainer.style.setProperty('--primary-rgb', '66, 245, 111');
      helpContainer.style.setProperty('--dropdownHover', '#2a2a2a');
      helpContainer.style.setProperty('--inputBackground', '#1e1e1e');
      helpContainer.style.setProperty('--inputBorder', '#555');
      helpContainer.style.setProperty('--card', '#1e1e1e');
    }
  }
};

// Listen for theme changes
export const setupHelpPageThemeListener = () => {
  // Watch for localStorage changes (theme changes from main app)
  window.addEventListener('storage', (e) => {
    if (e.key === 'selectedTheme') {
      detectAndApplyHelpPageTheme();
    }
  });
  
  // Watch for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Only apply system theme if no manual theme is set
      if (!localStorage.getItem('selectedTheme')) {
        detectAndApplyHelpPageTheme();
      }
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
  }
};