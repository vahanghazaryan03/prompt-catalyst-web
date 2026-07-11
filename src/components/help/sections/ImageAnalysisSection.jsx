import React from 'react';
import { Upload, Image as ImageIcon, Wand2, RefreshCw } from 'lucide-react';
import { SectionTitle, Divider, TipBox, CodeBlock, ImagePlaceholder } from '../HelpComponents';

export const ImageAnalysisSection = () => (
  <div className="space-y-8">
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <SectionTitle 
        icon={<ImageIcon className="w-5 h-5" />}
        title="Image Analysis"
        subtitle="Turn Images into Text Prompts"
      />
      
      <p className="text-[var(--text)] opacity-80 mb-6">
        Image Analysis feature leverages advanced AI to analyze images and generate detailed, 
        accurate text prompts. This powerful tool helps bridge the gap between visual inspiration and textual 
        descriptions, making it easier to recreate or iterate on existing images.
      </p>

      {/* Key Features Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-[var(--text)] mb-4">Key Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[var(--background)] rounded-lg p-4 border border-[var(--border)]">
            <div className="flex items-start gap-3 mb-2">
              <Wand2 className="w-5 h-5 text-[var(--primary)] mt-1" />
              <div>
                <h4 className="font-medium text-[var(--text)]">Smart Analysis</h4>
                <p className="text-[var(--text)] opacity-80">
                  Advanced AI recognition of styles, subjects, lighting, and composition
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4 border border-[var(--border)]">
            <div className="flex items-start gap-3 mb-2">
              <RefreshCw className="w-5 h-5 text-[var(--primary)] mt-1" />
              <div>
                <h4 className="font-medium text-[var(--text)]">Multiple Variations</h4>
                <p className="text-[var(--text)] opacity-80">
                  Generate multiple prompt variations from a single image
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-[var(--background)] rounded-lg p-6 border border-[var(--border)] mb-8">
        <h4 className="font-medium text-[var(--text)] mb-4">How It Works</h4>
        
        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
              1
            </span>
            <div>
              <h5 className="font-medium text-[var(--text)] mb-2">Upload Your Image</h5>
              <p className="text-[var(--text)] opacity-80 mb-4">
                Click the upload button or drag and drop an image into the input area. Supported formats: JPEG, PNG, WebP
              </p>
              <img 
  src="/screenshots/ImageA.png" 
  alt="Interface Overview" 
  className="w-auto max-h-96 mb-5 rounded-lg border border-[var(--border)]"
/>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
              2
            </span>
            <div>
              <h5 className="font-medium text-[var(--text)] mb-2">AI Analysis</h5>
              <p className="text-[var(--text)] opacity-80 mb-4">
                AI analyzes various aspects of your image:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text)] opacity-80 mb-4">
                <li>Subject matter and composition</li>
                <li>Artistic style and techniques</li>
                <li>Lighting and color schemes</li>
                <li>Camera angles and perspectives</li>
                <li>Mood and atmosphere</li>
              </ul>
              
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div>
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
              3
            </span>
            <div>
              <h5 className="font-medium text-[var(--text)] mb-2">Generated Results</h5>
              <p className="text-[var(--text)] opacity-80 mb-4">
                Receive multiple detailed prompt variations that can be:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text)] opacity-80 mb-4">
                <li>Copied directly for immediate use</li>
                <li>Modified with the Extend/Shorten tools</li>
                <li>Saved to your collections</li>
                <li>Used as a base for generating variations</li>
              </ul>
              <img 
  src="/screenshots/Results.png" 
  alt="Interface Overview" 
  className="w-auto max-h-96 mb-5 rounded-lg border border-[var(--border)]"
/>
            </div>
          </div>
        </div>
      </div>

     
    </div>

    {/* Premium Features Callout */}
    

    {/* Tips Section */}
    <TipBox title="Tips for Best Results">
      <ul className="space-y-2 text-[var(--text)] opacity-80">
        <li className="flex items-start gap-2">
          <span className="font-bold text-[var(--primary)]">•</span>
          <span>Use high-resolution images (minimum 1024x1024 pixels) for more accurate analysis</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold text-[var(--primary)]">•</span>
          <span>Choose images with clear subjects and well-defined styles</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold text-[var(--primary)]">•</span>
          <span>Ensure good lighting and contrast in your reference images</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold text-[var(--primary)]">•</span>
          <span>Avoid images with heavy filters or text overlays</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold text-[var(--primary)]">•</span>
          <span>Test different angles and compositions of the same subject</span>
        </li>
      </ul>
    </TipBox>

    {/* Troubleshooting Section */}
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <h4 className="font-semibold text-[var(--text)] mb-4">Common Issues & Solutions</h4>
      <div className="space-y-4">
        <div className="bg-[var(--background)] rounded-lg p-4 border border-[var(--border)]">
          <h5 className="font-medium text-[var(--text)] mb-2">Image Upload Fails</h5>
          <p className="text-[var(--text)] opacity-80">
            Ensure your image is in a supported format (JPEG, PNG, WebP) and under the size limit (10MB)
          </p>
        </div>
        
      </div>
    </div>
  </div>
);

export default ImageAnalysisSection;