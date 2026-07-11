import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background)] text-[var(--textSecondary)] text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div>
          © {currentYear} Prompt Catalyst. All rights reserved.
        </div>
        <div className="mt-2 sm:mt-0 space-x-4">
          <Link to="/legal/privacy-policy" className="hover:text-[var(--text)] transition-colors">
            Privacy Policy
          </Link>
          <Link to="/legal/terms-of-service" className="hover:text-[var(--text)] transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;