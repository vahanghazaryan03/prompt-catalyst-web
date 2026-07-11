import React, { useState } from 'react';
import { SectionTitle, TipBox, Divider } from '../HelpComponents';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Example Card Component for mobile view
const ExampleCard = ({ example }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-[var(--text)]">{example.description}</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[var(--text)] opacity-80 hover:text-[var(--text)] transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--text)] opacity-80">Purpose: </span>
            <span className="text-[var(--text)]">{example.purpose}</span>
          </div>
          <div>
            <span className="text-[var(--text)] opacity-80">Style: </span>
            <span className="text-[var(--text)]">{example.style}</span>
          </div>
        </div>

        {Object.keys(example.otherSettings).length > 0 && (
          <div className="mt-2 text-sm">
            <span className="text-[var(--text)] opacity-80">Settings: </span>
            {Object.entries(example.otherSettings).map(([key, value], index) => (
              <span key={key} className="text-[var(--text)]">
                {key}: {value}
                {index < Object.entries(example.otherSettings).length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}

        {isExpanded && (
          <>
            <div className="mt-4">
              <span className="text-[var(--text)] opacity-80 text-sm">Prompt:</span>
              <p className="mt-1 text-[var(--text)] text-sm">{example.prompt}</p>
            </div>
            <div className="mt-4">
              <span className="text-[var(--text)] opacity-80 text-sm">Result:</span>
              <div className="mt-2 flex justify-center">
                <img
                  src={example.image}
                  alt={`${example.purpose} example`}
                  className="w-full max-w-md rounded-lg"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const CoreFeaturesSection = () => {
  const purposeExamples = [
  {
    description: "Headphones",
    purpose: "Product Photo",
    style: "Photorealism",
    otherSettings: {
      Lighting: "Studio"
    },
    prompt: "A pair of high-fidelity headphones hanging from a minimalistic stand against a soft white background. The headphones are showcased from a three-quarter angle, highlighting the logo and earcup design. Controlled studio lighting brings out the texture of the ear pads and metallic accents, while a slight reflection on the surface beneath the stand provides context for the product's scale.",
    image: "/screenshots/example-product-photo.webp"
  },
  {
    description: "A woman smiling",
    purpose: "Portrait",
    style: "Impressionism",
    otherSettings: {
      Lighting: "Golden Hour"
    },
    image: "/screenshots/example-portrait.png",
    prompt: "Set against a backdrop of deep emerald hills, a woman radiates joy as she smiles brightly. The golden hour's warm glow highlights the contours of her face, creating a flattering depth of field that gently blurs the distant landscape. Her vibrant green outfit mirrors the scenery, while impressionistic brushwork captures the essence of her lively expression and the serene ambiance of the natural setting."
  },
  {
    description: "Mage",
    purpose: "Character Sheet",
    style: "Fantasy",
    otherSettings: {
      Creativity: 10
    },
    image: "/screenshots/example-character-sheet.png",
    prompt: "A female mage character sheet featuring two clear views: front and back. The front view displays her in a flowing robe adorned with intricate runes, with her long hair cascading down her shoulders. The back view shows the robe's elaborate embroidery and a hood. Bright, even lighting illuminates all views, emphasizing her facial features and magical aura, with consistent proportions and a neat layout for easy reproduction."
  },
  {
    description: "Bakery \"Crumb & Co.\"",
    purpose: "Logo",
    style: "Minimalism",
    otherSettings: {
      Creativity: 7
    },
    image: "/screenshots/example-logo.png",
    prompt: "A minimalist logo design featuring a stylized loaf of bread with a bite taken out, incorporating the text \"Crumb & Co.\" in a modern, sans-serif font underneath. The color palette is warm, with earthy browns and soft cream tones, ensuring clarity in both color and monochrome versions. The silhouette of the bread is sharp and simple, making it easily recognizable at any size."
  },
  {
    description: "Village",
    purpose: "Isometric Map",
    style: "Fantasy",
    otherSettings: {},
    image: "/screenshots/example-isometric.png",
    prompt: "A sprawling fantasy village, viewed from a precise 30-degree isometric angle, featuring cobblestone streets organized in a clear grid pattern. Layered elevations include a small hill with a winding path leading to a castle at a height of 5 tiles. Low-key lighting casts deep shadows, creating a mysterious atmosphere. Connection points between tiles include wooden bridges over streams, and the buildings have colorful roofs and intricate designs."
  }
];

  return (
    <div className="space-y-8">
      {/* Settings and Input Overview Section */}
      <div className="bg-[var(--card)] rounded-lg p-4 lg:p-6 border border-[var(--border)]">
      <SectionTitle title="Settings and Input Overview" />
        
        {/* Settings Sidebar Section */}
        <div className="mb-8">

  <img 
    src="/screenshots/sidebar.png" 
    alt="Interface Overview" 
    className="w-full max-w-sm  mb-5 rounded-lg border border-[var(--border)]"
  />
          <p className="text-[var(--text)] opacity-80 mb-4">
            The Settings sidebar provides comprehensive control over your prompt generation experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
            <h5 className="font-medium text-[var(--text)] mb-2">Key Components:</h5>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
            <li>• Generation Controls
            <ul className="ml-4 mt-1">
            <li>- Prompt Length (Short/Medium/Long)</li>
            <li>- Creativity Value (1-10 scale)</li>
            <li>- Number of Prompts (1-10 prompts per generation)</li>
            </ul>
            </li>
            <li>• Core Settings
            <ul className="ml-4 mt-1">
            <li>- Purpose selection</li>
            <li>- Style controls</li>
            <li>- Model selection</li>
            <li>- Midjourney parameters (when applicable)</li>
            </ul>
            </li>
            <li>• Visual Settings
            <ul className="ml-4 mt-1">
            <li>- Lighting controls</li>
            <li>- Camera angle options</li>
            </ul>
            </li>
            </ul>
            </div>
            <div>
            <h5 className="font-medium text-[var(--text)] mb-2">Special Features:</h5>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
            <li>• Reset functionality to restore defaults</li>
            <li>• Access this page by pressing the question mark icon</li>
            <li>• Press the chevron icon to collapse the sidebar</li>
            </ul>
            </div>
          </div>
        </div>

        <Divider />

        {/* Input Area Section */}
        <div className="mt-8">
          <h4 className="font-medium text-[var(--text)] mb-4">Input Area</h4>
          <img 
    src="/screenshots/input.png" 
    alt="Interface Overview" 
    className="w-full max-w-xxxl  mb-5 rounded-lg border border-[var(--border)]"
  />
          <p className="text-[var(--text)] opacity-80 mb-4">
  The Input area is designed for short, descriptive prompts that work with your sidebar settings. 
  Describe the core elements you want to see in your result - objects, people, scenes, or concepts. 
  Combine simple descriptions with your chosen settings.
</p>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div>
    <h5 className="font-medium text-[var(--text)] mb-2">Core Components:</h5>
    <ul className="space-y-2 text-[var(--text)] opacity-80">
      <li>• Text Input
        <ul className="ml-4 mt-1">
          <li>- Keep descriptions concise and clear</li>
          <li>- Focus on key elements you want to see</li>
          <li>- Separate multiple elements with commas</li>
          <li>- Example: "man in suit, rainy city"</li>
        </ul>
      </li>
      <li>• Action Buttons
        <ul className="ml-4 mt-1">
          <li>- Send Button: Creates prompt from your description</li>
          <li>- Image Analysis: Generate prompts based on an image</li>
          <li>- Random: Get inspiration with random prompts</li>
          <li>- Commands: Use Shorten, Extend, Variations prompt operations with your input</li>
          <li>- Fast Mode Toggle: Generate prompts quickly or turn off for more detailed and descriptive prompts.</li>
        </ul>
      </li>
    </ul>
  </div>
  <div>
    <h5 className="font-medium text-[var(--text)] mb-2">Examples:</h5>
    <ul className="space-y-2 text-[var(--text)] opacity-80">
      <li>• Product Photos
        <div className="ml-4 mt-1 text-sm">
          "wireless headphones, white background"
        </div>
      </li>
      <li>• Portraits
        <div className="ml-4 mt-1 text-sm">
          "woman smiling, business attire, office"
        </div>
      </li>
      <li>• Environments
        <div className="ml-4 mt-1 text-sm">
          "cyberpunk street, rain, neon signs"
        </div>
      </li>
    </ul>
  </div>
</div>

<TipBox title="Tips for Using Input Area">
  <ul className="space-y-2 text-[var(--text)] opacity-80">
    <li>• Keep descriptions simple - let the settings handle the style and details</li>
    <li>• Use commas to separate different elements in your scene</li>
    <li>• Start with the main subject, then add environment or context</li>
    <li>• Submit with Enter key or Generate button</li>
    <li>• Try the Random button when you need inspiration</li>
  </ul>
</TipBox>
        </div>
      </div>

      {/* Original Purposes Section */}
      <div className="bg-[var(--card)] rounded-lg p-4 lg:p-6 border border-[var(--border)]">
      <SectionTitle title="Purpose System" />
        <img 
          src="/screenshots/purposes.png" 
          alt="Interface Overview" 
          className="w-full max-w-4xl mb-5 rounded-lg border border-[var(--border)]"
        />
        <p className="text-[var(--text)] opacity-80 mb-6">
          The Purpose setting helps tailor your prompts for specific use cases, ensuring optimal results
          for different types of images.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Standard Purposes:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Stock Photo: Generic, commercially viable images</li>
              <li>• Product Photo: Showcase products effectively</li>
              <li>• Portrait: Human subject photography</li>
              <li>• Concept Art: Pre-production visuals</li>
              <li>• Illustration: Artistic interpretations</li>
              <li>• Poster: Eye-catching designs</li>
              <li>• Book Cover: Publishing-ready artwork</li>
              <li>• Wallpaper: Desktop or mobile backgrounds</li>
              <li>• Logo: Simple, memorable brand symbols</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Premium Purposes:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• 3D Render: Photorealistic 3D visualizations</li>
              <li>• Character Sheet: Character reference designs</li>
              <li>• Architectural: Building and space designs</li>
              <li>• Isometric Map: Game-style map layouts</li>
              <li>• Figurine Design: Collectible item designs</li>
              <li>• Technical Drawing: Detailed schematics</li>
              <li>• And more specialized purposes...</li>
            </ul>
          </div>
        </div>

        <Divider />

        <h4 className="font-medium text-[var(--text)] mb-6">Example Results:</h4>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-hidden">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm text-[var(--text)] table-fixed">
              <colgroup>
                <col className="w-[10%]" /> {/* Description */}
                <col className="w-[10%]" /> {/* Purpose */}
                <col className="w-[10%]" /> {/* Style */}
                <col className="w-[12%]" /> {/* Settings */}
                <col className="w-[33%]" /> {/* Generated Prompt */}
                <col className="w-[25%]" /> {/* Result */}
              </colgroup>
              <thead>
                <tr className="bg-[var(--background)] border-b border-[var(--border)]">
                  <th className="text-left p-4 font-medium sticky top-0 bg-[var(--background)]">Description</th>
                  <th className="text-left p-4 font-medium sticky top-0 bg-[var(--background)]">Purpose</th>
                  <th className="text-left p-4 font-medium sticky top-0 bg-[var(--background)]">Style</th>
                  <th className="text-left p-4 font-medium sticky top-0 bg-[var(--background)]">Settings</th>
                  <th className="text-left p-4 font-medium sticky top-0 bg-[var(--background)]">Generated Prompt</th>
                  <th className="text-left p-4 font-medium sticky top-0 bg-[var(--background)]">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {purposeExamples.map((example, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-[var(--background)] transition-colors"
                  >
                    <td className="p-4 align-top">
                      <span className="font-medium text-[var(--text)] text-xs">{example.description}</span>
                    </td>
                    <td className="p-4 align-top">
                      <span className="font-medium text-[var(--text)] text-xs">{example.purpose}</span>
                    </td>
                    <td className="p-4 align-top">
                      <span className="font-medium text-[var(--text)] text-xs">{example.style}</span>
                    </td>
                    <td className="p-4 align-top">
                      {Object.entries(example.otherSettings).map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="font-medium text-[var(--text)] text-xs">{key}:</span>{' '}
                          <span className="text-[var(--text)] opacity-80 text-xs">{value}</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-[var(--text)] opacity-80 line-clamp-4 hover:line-clamp-none transition-all duration-200">
                        {example.prompt}
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex justify-center">
                        <img
                          src={example.image}
                          alt={`${example.purpose} example`}
                          className="w-full object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          style={{ maxWidth: '240px', height: '160px', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {purposeExamples.map((example, index) => (
            <ExampleCard key={index} example={example} />
          ))}
        </div>

        <div className="mt-6">
          <TipBox title="Tips for Using Purposes">
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Choose the purpose that best matches your intended use</li>
              <li>• Experiment with different purposes for varied results</li>
              <li>• Consider purpose interactions with style and lighting</li>
              <li>• Premium users get access to specialized purposes</li>
            </ul>
          </TipBox>
        </div>
      </div>

      {/* Style System Section */}
      <div className="bg-[var(--card)] rounded-lg p-4 lg:p-6 border border-[var(--border)]">
      <SectionTitle title="Style System" />
        
        
        <img 
          src="/screenshots/style.png" 
          alt="Style System Interface" 
          className="w-full max-w-4xl mb-5 rounded-lg border border-[var(--border)]"
        />
        
        <p className="text-[var(--text)] opacity-80 mb-6">
          The Style System allows you to apply different artistic styles to your prompts,
          ensuring consistent and predictable results across different AI models.
        </p>

        <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-[var(--primary)] mb-2">Multi-Select Feature</h4>
          <p className="text-[var(--text)] opacity-80">
            You can now select multiple styles simultaneously! This feature allows you to combine different artistic
            styles for more nuanced and unique results. 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Free Styles:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Photorealism - Highly detailed, true-to-life imagery</li>
              <li>• Pixel Art - Retro-style digital art with visible pixels</li>
              <li>• Impressionism - Soft, light-focused artistic style</li>
              <li>• Pop Art - Bold colors and commercial art influence</li>
              <li>• Vintage - Classic, aged appearance with retro elements</li>
              <li>• Hand-Drawn - Natural, sketched artistic style</li>
              <li>• Abstract - Non-representational artistic expression</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Premium Styles:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Cyberpunk - Futuristic urban aesthetic with neon elements</li>
              <li>• Baroque - Ornate, dramatic historical style</li>
              <li>• Steampunk - Victorian sci-fi with mechanical elements</li>
              <li>• Neo-noir - Dark, moody contemporary style</li>
              <li>• Vaporwave - Retro-futuristic aesthetic with pastel colors</li>
              <li>• Anime - Japanese animation-inspired artwork</li>
              <li>• And many more premium styles...</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <TipBox title="Tips for Using Multiple Styles">
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Combine complementary styles for harmonious results (e.g., "Impressionism" with "Watercolor")</li>
              <li>• Use contrasting styles for unique effects (e.g., "Cyberpunk" with "Vintage")</li>
              <li>• Start with 2-3 styles to avoid overcomplicating the prompt</li>
              <li>• Experiment with different combinations to discover your favorite blends</li>
            </ul>
          </TipBox>
        </div>
      </div>

      {/* Camera and Lighting Systems Section */}
      <div className="bg-[var(--card)] rounded-lg p-4 lg:p-6 border border-[var(--border)]">
      <SectionTitle title="Camera and Lighting Systems" />
        
        <div className="space-y-6">
          {/* Camera Section */}
          <div>
        
            <img 
              src="/screenshots/camera.png" 
              alt="Camera System Interface" 
              className="w-full max-w-4xl mb-5 rounded-lg border border-[var(--border)]"
            />
            
            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-[var(--primary)] mb-2">Multiple Camera Angles</h4>
              <p className="text-[var(--text)] opacity-80">
                You can now select multiple camera angles for more dynamic and complex imagery! This allows you to blend different
                perspectives in a single prompt, creating more sophisticated visual compositions. For instance, combining "Eye Level" 
                with "Dutch Angle" creates a natural but slightly disorienting perspective.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h5 className="text-[var(--text)] mb-2">Basic Angles (Free):</h5>
                <ul className="space-y-2 text-[var(--text)] opacity-80">
                  <li>• Wide - Capture entire scenes with context</li>
                  <li>• Close-up - Detailed view of specific subjects</li>
                  <li>• Eye Level - Natural, neutral perspective</li>
                  <li>• Low Angle - Dramatic, imposing view from below</li>
                  <li>• High Angle - Overview perspective from above</li>
                </ul>
              </div>
              <div>
                <h5 className="text-[var(--text)] mb-2">Advanced Angles (Premium):</h5>
                <ul className="space-y-2 text-[var(--text)] opacity-80">
                  <li>• Drone View - Aerial perspective shots</li>
                  <li>• Orbital - Dynamic circular movement</li>
                  <li>• Vertigo - Vertigo effect shots</li>
                 
                  <li>• And more cinematic angles...</li>
                </ul>
              </div>
            </div>
          </div>

          <Divider />

          {/* Lighting Section */}
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Lighting Options:</h4>
            <img 
              src="/screenshots/lighting.png" 
              alt="Lighting System Interface" 
              className="w-full max-w-4xl mb-5 rounded-lg border border-[var(--border)]"
            />
            
            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-[var(--primary)] mb-2">Combine Multiple Lighting Effects</h4>
              <p className="text-[var(--text)] opacity-80">
                The multi-select feature for lighting lets you create sophisticated lighting setups by combining different effects.
                Mix "Studio" with "Dramatic" for professional high-contrast imagery, or blend "Natural" with "Golden Hour" 
                for a realistic outdoor scene with warm tones. 
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h5 className="text-[var(--text)] mb-2">Basic Lighting (Free):</h5>
                <ul className="space-y-2 text-[var(--text)] opacity-80">
                  <li>• Natural - Ambient daylight illumination</li>
                  <li>• Studio - Professional controlled lighting</li>
                  <li>• Dramatic - High contrast theatrical lighting</li>
                  <li>• Backlight - Subject illuminated from behind</li>
                  <li>• Soft - Diffused, gentle illumination</li>
                </ul>
              </div>
              <div>
                <h5 className="text-[var(--text)] mb-2">Advanced Lighting (Premium):</h5>
                <ul className="space-y-2 text-[var(--text)] opacity-80">
                  <li>• Golden Hour - Warm sunset lighting</li>
                  <li>• Volumetric - Visible light beams and atmosphere</li>
                  <li>• Bioluminescent - Natural glowing effects</li>
                  <li>• Noir - Dramatic shadows and highlights</li>
                  <li>• Neon - Vibrant artificial lighting</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <TipBox title="Tips for Camera and Lighting Combinations">
                <ul className="space-y-2 text-[var(--text)] opacity-80">
                  <li>• Combine complementary angles and lighting for cohesive scenes</li>
                  <li>• Try unexpected combinations for creative effects (e.g., "Low Angle" with "Backlight")</li>
                  <li>• Use multi-select for all three categories (Styles, Camera Angles, Lighting) for complete control</li>
                  <li>• Start with simpler combinations and gradually experiment with more complex setups</li>
                  <li>• For professional product shots, try "Studio" + "Backlight" + "Close-up" angle</li>
                </ul>
              </TipBox>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreFeaturesSection;