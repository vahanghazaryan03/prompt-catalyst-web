import React from 'react';
import { 
  Play, Settings, Filter, Upload, RefreshCcw, UploadCloud,
  Image, Zap, Clock, Sparkles, Palette, Download, History,
  FileVideo, Maximize2
} from 'lucide-react';

// Common styled components
const SectionTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-[var(--text)] mb-4">{children}</h3>
);

const SubSectionTitle = ({ children }) => (
  <h4 className="text-lg font-medium text-[var(--text)] mt-6 mb-4">{children}</h4>
);

const TipBox = ({ title, children }) => (
  <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg p-4 mt-6">
    <h4 className="font-medium text-[var(--primary)] mb-2">{title}</h4>
    {children}
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-[var(--card)]/50 border border-[var(--border)] rounded-lg p-4 flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h4 className="font-medium text-[var(--text)] mb-1">{title}</h4>
      <p className="text-[var(--text)] opacity-80">{description}</p>
    </div>
  </div>
);

export const AnimateSection = () => {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Animate Tab</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          The Animate tab allows you to bring static images to life with AI-powered animation technology. 
          Transform your generated images or uploaded photos into dynamic animations with a variety of movement styles.
        </p>
        
        <div className="bg-[var(--background)]/30 rounded-lg p-4 border border-[var(--border)] mb-6">
          <p className="text-[var(--text)] opacity-80 flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--primary)]" />
            <span>Animation features require a Pro membership to access.</span>
          </p>
        </div>
        
        <img 
          src="/screenshots/animate-interface.png" 
          alt="Animate Interface" 
          className="w-full rounded-lg border border-[var(--border)]"
        />
      </div>

      {/* Key Features */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SubSectionTitle>Key Animation Features</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <FeatureCard 
            icon={<UploadCloud size={20} className="text-[var(--primary)]" />}
            title="Image Upload"
            description="Upload any static image or use images directly from the Generate tab."
          />
          <FeatureCard 
            icon={<Filter size={20} className="text-[var(--primary)]" />}
            title="Movement Presets"
            description="Choose from categorized animation styles like zoom, pan, shake, and more."
          />
          <FeatureCard 
            icon={<Settings size={20} className="text-[var(--primary)]" />}
            title="Customization"
            description="Adjust duration, resolution, and add custom prompt details."
          />
          <FeatureCard 
            icon={<Download size={20} className="text-[var(--primary)]" />}
            title="Export Options"
            description="Download your animations as MP4 files."
          />
          
          <FeatureCard 
            icon={<History size={20} className="text-[var(--primary)]" />}
            title="Animation History"
            description="Access and reuse your previously generated animations."
          />
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SubSectionTitle>How to Use</SubSectionTitle>
        <ol className="space-y-5 text-[var(--text)] opacity-80 mb-6">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
              1
            </span>
            <div>
              <strong>Upload an Image</strong>
              <p>Click the upload button or drag and drop an image into the designated area. You can also use images directly from the Generate tab.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
              2
            </span>
            <div>
              <strong>Select a Movement Preset</strong>
              <p>Browse through the categories and choose a movement style that works best for your image.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
              3
            </span>
            <div>
              <strong>Customize Parameters</strong>
              <p>Adjust the animation duration and resolution. Add a custom prompt if needed to enhance the animation quality.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
              4
            </span>
            <div>
              <strong>Generate Animation</strong>
              <p>Click the "Animate" button to start processing. The animation will be added to your queue and processed in the background.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
              5
            </span>
            <div>
              <strong>View and Download</strong>
              <p>Once processing is complete, preview your animation and download it as an MP4 file.</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Tips */}
      <TipBox title="Tips for Better Animations">
        <ul className="space-y-2 text-[var(--text)] opacity-80">
          <li>• Choose images with clear subjects and uncluttered backgrounds for best results</li>
          <li>• Portrait photos work best with facial animation presets</li>
          <li>• Landscapes and scenery work well with panning and zooming movements</li>
         
          <li>• Add custom prompts to emphasize specific movement details</li>
          <li>• Try different movement presets on the same image to find the best effect</li>
        </ul>
      </TipBox>

      {/* Movement Categories */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SubSectionTitle>Movement Categories</SubSectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-4">
          Animation presets are organized into categories to help you find the perfect movement for your image:
        </p>

        <div className="space-y-4 text-[var(--text)] opacity-80">
          <div className="flex items-start gap-3">
            <FileVideo size={18} className="mt-1 text-[var(--primary)]" />
            <div>
              <strong className="text-[var(--text)]">Camera Movements</strong>
              <p>Includes zooming, panning, and tracking shots that mimic professional camera work.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Maximize2 size={18} className="mt-1 text-[var(--primary)]" />
            <div>
              <strong className="text-[var(--text)]">3D Effects</strong>
              <p>Creates the illusion of depth and dimension in flat images through parallax and perspective shifts.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Image size={18} className="mt-1 text-[var(--primary)]" />
            <div>
              <strong className="text-[var(--text)]">Portrait Animation</strong>
              <p>Specialized movements for faces and portraits, including subtle expressions and head movements.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Zap size={18} className="mt-1 text-[var(--primary)]" />
            <div>
              <strong className="text-[var(--text)]">Dynamic Effects</strong>
              <p>More dramatic movements including waves, ripples, and other eye-catching animations.</p>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default AnimateSection;