import React from 'react';
import { History, Search, Star, Filter, RefreshCcw, Upload, Download, AlertTriangle } from 'lucide-react';
import { SectionTitle, Divider, TipBox } from '../HelpComponents';

export const HistorySection = () => (
  <div className="space-y-8">
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <SectionTitle>Your Prompting Journey at a Glance</SectionTitle>
      
      <p className="text-[var(--text)] opacity-80 mb-6">
        The History tab is your personal archive of generated prompts. It automatically saves your prompting 
        activity, allowing you to revisit, reuse, and refine your past creations.
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">What's Saved in History</h4>
          <ul className="space-y-3 text-[var(--text)] opacity-80">
            <li>• Type (standard prompt, variation, video prompt, or image analysis)</li>
            <li>• Description (your base input)</li>
            <li>• Prompt Length (Short, Medium, Long, or Random)</li>
            <li>• Style and Purpose settings</li>
            <li>• Creativity value</li>
            <li>• Lighting and Camera Angle selections</li>
            <li>• AI Model used</li>
            <li>• Generated prompt(s)</li>
          </ul>
        </div>

        <Divider />

        <div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-1 text-amber-500" />
              <div>
                <h4 className="font-medium text-[var(--text)] mb-2">Local Storage Notice</h4>
                <p className="text-[var(--text)] opacity-80">
                  Your prompt history is stored in your browser's local storage only. It is not synchronized across devices 
                  or browsers. If you clear your browser cache, switch browsers, or use a different device, your history 
                  will not be available. Use the Export feature regularly to create backups of your valuable prompts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">Import/Export Features</h4>
          <div className="bg-[var(--background)] p-5 rounded-lg border border-[var(--border)] space-y-4 mb-5">
            <div>
              <h5 className="font-medium text-[var(--text)] mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-[var(--primary)]" />
                Exporting Your History
              </h5>
              <ol className="list-decimal list-inside text-[var(--text)] opacity-80 space-y-1 ml-1">
                <li>Go to the History tab</li>
                <li>Click the "Export History" button in the top-right corner</li>
                <li>Choose where to save the JSON file</li>
                <li>Your history is now safely backed up</li>
              </ol>
            </div>
            
            <div>
              <h5 className="font-medium text-[var(--text)] mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[var(--primary)]" />
                Importing History
              </h5>
              <ol className="list-decimal list-inside text-[var(--text)] opacity-80 space-y-1 ml-1">
                <li>Go to the History tab</li>
                <li>Click the "Import History" button</li>
                <li>Select your previously exported JSON file</li>
                <li>Choose whether to replace or merge with existing history</li>
                <li>Your history will be restored from the backup</li>
              </ol>
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">Key Features</h4>
          <ul className="space-y-4 text-[var(--text)] opacity-80">
            <li className="flex items-start gap-3">
              <History className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Automatic Saving</strong>
                <p className="text-[var(--text)] opacity-80">Your prompts are automatically saved to the history - no manual action required</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Search className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Searchable History</strong>
                <p className="text-[var(--text)] opacity-80">Quickly find specific prompts based on keywords, descriptions, or settings</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Filter className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Organized View</strong>
                <p className="text-[var(--text)] opacity-80">Clear, chronological list with all relevant prompt details</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <RefreshCcw className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Prompt Actions</strong>
                <p className="text-[var(--text)] opacity-80">Copy, generate variations, extend, shorten, or add prompts to collections</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Download className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Export History</strong>
                <p className="text-[var(--text)] opacity-80">Save your entire prompt history as a JSON file for backup or transfer between devices</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Upload className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Import History</strong>
                <p className="text-[var(--text)] opacity-80">Restore your prompt history from a previously exported JSON file</p>
              </div>
            </li>
          </ul>
        </div>

        <Divider />

        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">History Limits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)]">
              <h5 className="font-medium text-[var(--text)] mb-2">Free Users</h5>
              <p className="text-[var(--text)] opacity-80">
                The history tab stores the last 5 generated prompts
              </p>
            </div>
            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)]">
              <h5 className="font-medium text-[var(--text)] mb-2">Premium Users</h5>
              <p className="text-[var(--text)] opacity-80">
                The history tab stores all generated prompts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

   
    <TipBox title="Tips for Using History">
      <ul className="space-y-2 text-[var(--text)] opacity-80">
        <li>• Use the search bar to quickly find prompts based on keywords or settings</li>
        <li>• Revisit your history to get inspiration or to refine previous ideas</li>
        <li>• Add successful prompts from your history to collections for long-term storage</li>
        <li>• Export your history regularly to prevent loss when clearing browser data</li>
        <li>• Import history on new devices or browsers to maintain access to your prompts</li>
        <li>• Use specific keywords when searching to narrow down results</li>
      </ul>
    </TipBox>
  </div>
);

export default HistorySection;