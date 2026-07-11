import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const MobileNavigation = ({ sections, activeSection, setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => setIsOpen(!isOpen);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Nav Toggle */}
      <button
        onClick={toggleNav}
        className="fixed bottom-4 right-4 z-[70] p-3 bg-[var(--primary)] text-white rounded-full shadow-lg hover:bg-[var(--primary)]/90 transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Nav Menu */}
      <div
        className={`fixed inset-0 z-[60] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleNav} />
        <div className="absolute right-0 top-16 bottom-0 w-64 bg-[var(--background)] shadow-xl">
          <div className="p-4 h-full overflow-y-auto">
            <nav>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;