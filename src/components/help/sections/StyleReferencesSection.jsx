import React from 'react';
import { Palette, Copy, Maximize2, Star } from 'lucide-react';
import { SectionTitle, Divider, TipBox } from '../HelpComponents';

export const StyleReferencesSection = () => (
  <div className="space-y-8">
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <SectionTitle>Explore and Utilize Midjourney Style Codes</SectionTitle>
      
      <p className="text-[var(--text)] opacity-80 mb-6">
        The Style Codes tab provides a comprehensive library of style reference codes specifically for 
        use with Midjourney. These codes allow you to quickly apply a wide range of artistic styles 
        to your generated images.
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">Features</h4>
          <ul className="space-y-4 text-[var(--text)] opacity-80">
            <li className="flex items-start gap-3">
              <Palette className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Visual Style Gallery</strong>
                <p className="text-[var(--text)] opacity-80">Browse through a curated collection of visual styles, each represented by a sample image and its corresponding style code</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Copy className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Copy Code</strong>
                <p className="text-[var(--text)] opacity-80">Easily copy the style code to your clipboard with a single click</p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <Star className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Premium Styles</strong>
                <p className="text-[var(--text)] opacity-80">Premium users get access to an expanded library of style codes</p>
              </div>
            </li>
          </ul>
        </div>

        <Divider />

        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">How to Use Style Codes</h4>
          <ol className="space-y-4 text-[var(--text)] opacity-80">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                1
              </span>
              <span>Go to the "Style Codes" tab</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                2
              </span>
              <span>Browse the available styles and find one you like</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                3
              </span>
              <span>Click the "Copy" button next to the style code</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                4
              </span>
              <span>Paste the copied code into your prompt in Midjourney, usually at the end of the prompt, to apply the style to your generated image</span>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <TipBox title="Tips for Using Style Codes">
      <ul className="space-y-2 text-[var(--text)] opacity-80">
        <li>• Experiment with combining multiple style codes to create unique effects</li>
        <li>• Pay attention to the sample images to understand how each style will affect your output</li>
        <li>• Test different style codes with the same base prompt to compare results</li>
        <li>• Refer to the Midjourney documentation for more advanced usage of style references</li>
      </ul>
    </TipBox>
  </div>
);

export default StyleReferencesSection;