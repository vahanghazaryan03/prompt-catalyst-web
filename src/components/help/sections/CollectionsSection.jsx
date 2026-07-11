import React from 'react';
import { Filter, Star, FolderPlus, Move, Palette, Download } from 'lucide-react';
import { SectionTitle, Divider, TipBox } from '../HelpComponents';

export const CollectionsSection = () => (
  <div className="space-y-8">
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <SectionTitle>Organize and Manage Your Prompts</SectionTitle>
      
      <p className="text-[var(--text)] opacity-80 mb-6">
        The Collections feature allows you to create, organize, and manage collections of your prompts. 
        This is a useful tool for keeping your prompts organized by project, theme, style, or any other 
        criteria you choose.
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">Key Features</h4>
          <ul className="space-y-4 text-[var(--text)] opacity-80">
            <li className="flex items-start gap-3">
              <FolderPlus className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Create Collections</strong>
                <p className="text-[var(--text)] opacity-80">Easily create new collections with custom names</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Star className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Quick Add</strong>
                <p className="text-[var(--text)] opacity-80">Add prompts to collections using the "Quick Add" button or from within the Collections tab</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Move className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Manage Collections</strong>
                <p className="text-[var(--text)] opacity-80">Move prompts between collections, rename, delete, and reorder as needed</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Palette className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Color Coding</strong>
                <p className="text-[var(--text)] opacity-80">Assign colors to your collections for visual organization</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Download className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Export Collections</strong>
                <p className="text-[var(--text)] opacity-80">Export your collections as text files for backup or sharing</p>
              </div>
            </li>
          </ul>
        </div>

        <Divider />

        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">How to Use Collections</h4>
          <ol className="space-y-4 text-[var(--text)] opacity-80">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                1
              </span>
              <span>Go to the "Collections" tab</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                2
              </span>
              <span>Click the "New Collection" button to create a new collection</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                3
              </span>
              <span>Give your collection a name and optionally assign a color</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                4
              </span>
              <span>Add prompts using the "Quick Add" button or by dragging and dropping from other tabs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                5
              </span>
              <span>Manage your collections using the actions menu next to each collection's name</span>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <TipBox title="Tips for Using Collections">
      <ul className="space-y-2 text-[var(--text)] opacity-80">
        <li>• Create collections for different projects, themes, or styles</li>
        <li>• Use descriptive collection names to easily identify their contents</li>
        <li>• Regularly review and clean up your collections to keep them organized</li>
        <li>• Use color coding to visually group related collections</li>
        <li>• Export important collections regularly for backup</li>
      </ul>
    </TipBox>
  </div>
);

export default CollectionsSection;