import React from 'react';
import { Calendar, Copy, RefreshCcw, Star, Sparkles } from 'lucide-react';
import { SectionTitle, Divider, TipBox } from '../HelpComponents';

export const WeeklyPromptsSection = () => (
  <div className="space-y-8">
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <SectionTitle>Get Inspired with Fresh Prompts Every Week</SectionTitle>
      
      <p className="text-[var(--text)] opacity-80 mb-6">
        The "Prompts of the Week" tab provides a curated selection of unique and inspiring prompts. 
        These prompts are hand-picked by our team and updated weekly, ensuring a constant flow of 
        fresh ideas.
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">Features</h4>
          <ul className="space-y-4 text-[var(--text)] opacity-80">
            <li className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Curated Selection</strong>
                <p className="text-[var(--text)] opacity-80">Discover high-quality prompts chosen for their creative potential</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Weekly Updates</strong>
                <p className="text-[var(--text)] opacity-80">New prompts are added every week</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Copy className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Copy & Use</strong>
                <p className="text-[var(--text)] opacity-80">Easily copy the prompts and use them in your favorite AI image generator</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <RefreshCcw className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Variations & Customization</strong>
                <p className="text-[var(--text)] opacity-80">Generate variations, extend, or shorten the weekly prompts to make them your own</p>
              </div>
            </li>
          </ul>
        </div>

        <Divider />

        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">How to Use Weekly Prompts</h4>
          <ol className="space-y-4 text-[var(--text)] opacity-80">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                1
              </span>
              <span>Click on the "Prompts of the Week" tab (calendar icon)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                2
              </span>
              <span>Browse through the available prompts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                3
              </span>
              <span>Click the "Copy" button to copy a prompt to your clipboard</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                4
              </span>
              <span>Use the "Variations," "Extend," and "Shorten" buttons to modify the prompts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                5
              </span>
              <span>Click the "Add to Collection" button to save a prompt to one of your collections</span>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <TipBox title="Tips for Using Weekly Prompts">
      <ul className="space-y-2 text-[var(--text)] opacity-80">
        <li>• Check the tab regularly for new inspiration</li>
        <li>• Use the weekly prompts as a starting point and customize them to fit your specific needs</li>
        <li>• Combine elements from different weekly prompts to create unique combinations</li>
        <li>• Save your favorite weekly prompts to collections for future reference</li>
        <li>• Experiment with different variations of the weekly prompts</li>
      </ul>
    </TipBox>
  </div>
);

export default WeeklyPromptsSection;