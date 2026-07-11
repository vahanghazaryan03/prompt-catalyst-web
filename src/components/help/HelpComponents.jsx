import React from 'react';
import { Image } from 'lucide-react';

export const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="mb-6">
    {icon && title ? (
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[var(--primary)]">{icon}</div>
        <h3 className="text-xl lg:text-2xl font-semibold text-[var(--text)]">{title}</h3>
      </div>
    ) : (
      <h3 className="text-lg lg:text-xl font-semibold text-[var(--text)]">{subtitle || title}</h3>
    )}
    {icon && subtitle && (
      <p className="text-base lg:text-lg text-[var(--text)] opacity-80">{subtitle}</p>
    )}
  </div>
);

export const Divider = () => (
  <hr className="my-6 lg:my-8 border-[var(--border)]" />
);

export const TipBox = ({ title, children }) => (
  <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg p-4 mt-6">
    <h4 className="font-medium text-[var(--primary)] mb-2 text-sm lg:text-base">{title}</h4>
    <div className="text-sm lg:text-base">{children}</div>
  </div>
);

export const Card = ({ icon, title, description, color = "from-blue-500/20 to-purple-500/20" }) => (
  <div className="group relative p-4 lg:p-6 rounded-xl bg-gradient-to-br border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all duration-300">
    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
    <div className="relative">
      <div className="text-[var(--primary)] mb-3 lg:mb-4">{icon}</div>
      <h3 className="text-base lg:text-lg font-semibold mb-2 text-[var(--text)]">{title}</h3>
      <p className="text-sm lg:text-base text-[var(--text)] opacity-80 group-hover:text-[var(--text)] group-hover:opacity-100 transition-colors">{description}</p>
    </div>
  </div>
);

export const ImagePlaceholder = ({ className = "", width = "100%", height = "300px", text = "Image Placeholder" }) => (
  <div 
    className={`relative flex items-center justify-center bg-[var(--background)] border-2 border-dashed border-[var(--border)] rounded-lg overflow-hidden ${className}`}
    style={{ 
      width,
      height,
      maxWidth: '100%'
    }}
  >
    <div className="absolute inset-0 bg-grid-gray-500/10" />
    <div className="relative flex flex-col items-center justify-center text-[var(--text)] opacity-80">
      <Image className="w-6 h-6 lg:w-8 lg:h-8 mb-2 opacity-50" />
      <span className="text-xs lg:text-sm">{text}</span>
    </div>
  </div>
);

export const CodeBlock = ({ children }) => (
  <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 lg:p-4 overflow-x-auto text-xs lg:text-sm">
    <code className="text-[var(--text)]">{children}</code>
  </pre>
);