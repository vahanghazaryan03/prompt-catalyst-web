import React from 'react';
import { SectionTitle, TipBox, Divider } from '../HelpComponents';

export const GenerateSection = () => {
  

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>AI Image Generation</SectionTitle>
        <img 
          src="/screenshots/generate-tab.png" 
          alt="Generate Tab Interface" 
          className="w-auto max-h-96 mb-5 rounded-lg border border-[var(--border)]"
        />
        <p className="text-[var(--text)] opacity-80 mb-6">
          The Generate tab transforms your text prompts into AI-generated images. Select from multiple
          AI models, customize aspect ratios, and produce multiple image variations with a single click.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Key Features:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Multiple AI models with different specializations</li>
              <li>• Customizable aspect ratios and image dimensions</li>
              <li>• Batch generation of multiple images</li>
              <li>• Direct integration with Animation tab</li>
              <li>• Generation history for reusing successful prompts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Available Models:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Flux Pro Ultra - Highest quality professional results</li>
              <li>• Flux Pro - Enhanced quality and consistency</li>
              <li>• Juggernaut Flux Pro - Sharp details and better realism</li>
              <li>• Flux Dev - Best for artistic and creative images</li>
              <li>• Juggernaut Lightning - Fast generation with fewer artifacts</li>
              <li>• Flux Schnell - Rapid generation with good quality</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interface Elements */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Interface Elements</SectionTitle>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">1. Prompt Input</h4>
            <div className="pl-4 space-y-2 text-[var(--text)] opacity-80">
              <p>• Text input for describing what image you want to generate</p>
              <p>• Character counter to help optimize prompt length</p>
              <p>• Options to create variations, extend, or shorten your prompt</p>
            </div>
          </div>

          <Divider />

          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">2. Model Selection</h4>
            <div className="pl-4 space-y-2 text-[var(--text)] opacity-80">
              <p>• Choose from various AI models with different strengths</p>
          
              <p>• Model descriptions, credit costs and example images are displayed</p>
            </div>
          </div>

          <Divider />

          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">3. Aspect Ratio & Image Count</h4>
            <div className="pl-4 space-y-2 text-[var(--text)] opacity-80">
              <p>• Select aspect ratios using the scroller</p>
              <p>• Choose to generate 1-4 images simultaneously</p>
              <p>• Special ultra-wide/tall options for Flux Pro Ultra model</p>
            </div>
          </div>

          <Divider />

          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">4. Generated Images Panel</h4>
            <div className="pl-4 space-y-2 text-[var(--text)] opacity-80">
              <p>• Browse and interact with generated images</p>
              <p>• Fullscreen view and lightbox options</p>
              <p>• Action buttons for downloading, copying prompts, and animating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Guide */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Workflow Guide</SectionTitle>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Step-by-Step Image Generation:</h4>
            <ol className="space-y-4 text-[var(--text)] opacity-80">
              <li>
                <span className="font-medium text-[var(--primary)]">1. Enter Your Prompt</span>
                <p className="mt-1 pl-4">Start with a descriptive prompt for the image you want to create. Be specific about subject, style, lighting, and composition.</p>
              </li>
              <li>
                <span className="font-medium text-[var(--primary)]">2. Select AI Model</span>
                <p className="mt-1 pl-4">Choose a model based on your needs: Flux Pro models for highest quality, Juggernaut models for details, or Schnell for speed.</p>
              </li>
              <li>
                <span className="font-medium text-[var(--primary)]">3. Choose Aspect Ratio</span>
                <p className="mt-1 pl-4">Select the appropriate aspect ratio for your intended use.</p>
              </li>
              <li>
                <span className="font-medium text-[var(--primary)]">4. Set Image Count</span>
                <p className="mt-1 pl-4">Decide how many variations (1-4) you want to generate in a single batch.</p>
              </li>
              <li>
                <span className="font-medium text-[var(--primary)]">5. Generate Images</span>
                <p className="mt-1 pl-4">Click Generate and wait for your images to appear in the right panel. Credit cost depends on model and image count.</p>
              </li>
              <li>
                <span className="font-medium text-[var(--primary)]">6. Work With Results</span>
                <p className="mt-1 pl-4">Download images, animate them, or use them as references for new generations. View previous generations in History.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Tips and Best Practices</SectionTitle>

        <TipBox title="Writing Effective Image Prompts">
          <ul className="space-y-2 text-[var(--text)] opacity-80">
            <li>• Describe the subject in detail (person, object, scene, etc.)</li>
            <li>• Specify style, lighting, camera angle, and composition</li>
            <li>• Include references to specific art styles or artists for distinctive looks</li>
           
          </ul>
        </TipBox>

        <Divider />

        <TipBox title="Model Selection Tips">
          <ul className="space-y-2 text-[var(--text)] opacity-80">
            <li>• Flux Pro Ultra: Best for professional, detailed imagery and specialized aspect ratios</li>
            <li>• Juggernaut models: Excellent for realistic details and textures</li>
            <li>• Flux Schnell: Use when you need quick and cheap results with good quality</li>
            <li>• Match model strengths to your specific image needs</li>
          </ul>
        </TipBox>

        <Divider />

        <TipBox title="Working with Generated Images">
          <ul className="space-y-2 text-[var(--text)] opacity-80">
            <li>• Download images in full resolution for best quality</li>
            <li>• Send selected images to the Animate tab for converting to videos</li>
            <li>• Generate multiple batches to find the perfect result</li>
            <li>• Use History to regenerate successful prompts or iterate on promising results</li>
          </ul>
        </TipBox>
      </div>

     
    </div>
  );
};

export default GenerateSection;