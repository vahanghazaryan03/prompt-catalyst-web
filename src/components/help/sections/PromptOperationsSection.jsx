import React from 'react';
import { SectionTitle, TipBox, Divider, ImagePlaceholder } from '../HelpComponents';

export const PromptOperationsSection = () => {
  const operationExamples = [
    {
      operation: "Variations",
      description: "Generate alternative versions of your prompt while maintaining the core concept.",
      example: {
        original: "A mystical forest at twilight with glowing mushrooms",
        variation1: "An enchanted woodland bathed in dusk light, featuring luminescent fungi",
        variation2: "A magical grove at sunset, illuminated by phosphorescent toadstools"
      },
      image: "/screenshots/variations-example.webp"
    },
    {
      operation: "Extend",
      description: "Enhance your prompt with additional details about style, lighting, objects, and mood.",
      example: {
        original: "A cozy coffee shop interior",
        extended: "A cozy coffee shop interior with warm ambient lighting, vintage wooden furniture, and the soft glow of pendant lamps creating intimate spaces. Steam rises from ceramic mugs while customers work on laptops, creating a peaceful atmosphere"
      },
      image: "/screenshots/extend-example.webp"
    },
    {
      operation: "Shorten",
      description: "Create a more concise version of your prompt while maintaining key elements.",
      example: {
        original: "A serene Japanese garden during cherry blossom season, with a traditional wooden bridge arching over a koi pond, while pink petals drift gently in the spring breeze, creating ripples on the water's surface",
        shortened: "A Japanese garden with cherry blossoms, featuring a wooden bridge over a koi pond"
      },
      image: "/screenshots/shorten-example.webp"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Core Operations Overview */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Prompt Operations</SectionTitle>
        <img 
          src="/screenshots/prompt-operations.png" 
          alt="Prompt Operations Interface" 
          className="w-auto max-h-96 mb-5 rounded-lg border border-[var(--border)]"
        />
        <p className="text-[var(--text)] opacity-80 mb-6">
          Prompt Operations provide powerful tools to modify, enhance, and manage your prompts. Each operation is designed
          to help you achieve specific goals in prompt crafting and management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Basic Operations:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Copy: Quickly copy prompts to clipboard</li>
              <li>• Preview: Visualize how your prompt might be interpreted</li>
              <li>• Use in Generate: Move prompts to the Generate tab</li>
              <li>• Add to Collection: Save prompts for later use</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Advanced Operations:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• Variations: Generate alternative versions</li>
              <li>• Extend: Add more detail and context</li>
              <li>• Shorten: Create concise versions</li>
             
            </ul>
          </div>
        </div>

        <TipBox title="Using Prompt Operations Effectively">
          <ul className="space-y-2 text-[var(--text)] opacity-80">
            <li>• Start with basic operations to familiarize yourself with the system</li>
            <li>• Use variations to explore different interpretations of your idea</li>
            <li>• Extend prompts when you need more specific or detailed results</li>
            <li>• Shorten prompts that might be too verbose or unfocused</li>
          </ul>
        </TipBox>
      </div>

      {/* Operation Details */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Operation Details</SectionTitle>
        
        {operationExamples.map((example, index) => (
          <React.Fragment key={example.operation}>
            <div className="mb-8">
              <h3 className="text-lg font-medium text-[var(--text)] mb-3">{example.operation}</h3>
              <p className="text-[var(--text)] opacity-80 mb-4">{example.description}</p>
              
              <div className="bg-[var(--background)] rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-[var(--text)] mb-2">Example:</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-[var(--primary)]">Original:</span>
                    <p className="text-[var(--text)] ml-4">{example.example.original}</p>
                  </div>
                  {example.example.variation1 && (
                    <div>
                      <span className="text-[var(--primary)]">Variation 1:</span>
                      <p className="text-[var(--text)] ml-4">{example.example.variation1}</p>
                    </div>
                  )}
                  {example.example.variation2 && (
                    <div>
                      <span className="text-[var(--primary)]">Variation 2:</span>
                      <p className="text-[var(--text)] ml-4">{example.example.variation2}</p>
                    </div>
                  )}
                  {example.example.extended && (
                    <div>
                      <span className="text-[var(--primary)]">Extended:</span>
                      <p className="text-[var(--text)] ml-4">{example.example.extended}</p>
                    </div>
                  )}
                  {example.example.shortened && (
                    <div>
                      <span className="text-[var(--primary)]">Shortened:</span>
                      <p className="text-[var(--text)] ml-4">{example.example.shortened}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {index < operationExamples.length - 1 && <Divider />}
          </React.Fragment>
        ))}

        <TipBox title="Advanced Operation Tips">
          <ul className="space-y-2 text-[var(--text)] opacity-80">
            <li>• Use the Extend operation when you need to:
              <ul className="ml-4 mt-1">
                <li>- Add specific style details</li>
                <li>- Enhance lighting descriptions</li>
                <li>- Include additional objects or elements</li>
                <li>- Define the mood or atmosphere</li>
              </ul>
            </li>
            <li>• Generate variations when:
              <ul className="ml-4 mt-1">
                <li>- Exploring different approaches</li>
                <li>- Looking for alternative interpretations</li>
                <li>- Fine-tuning your concept</li>
              </ul>
            </li>
            <li>• Shorten your prompts if:
              <ul className="ml-4 mt-1">
                <li>- They exceed 170 characters</li>
                <li>- They contain redundant information</li>
                <li>- You need a more focused description</li>
              </ul>
            </li>
          </ul>
        </TipBox>
      </div>

      {/* Midjourney Parameters */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Midjourney Parameters</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          When working with Midjourney model, you have access to additional parameters that can be
          added to your prompts for more precise control over the output.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Common Parameters:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• --ar [ratio]: Aspect ratio control</li>
              <li>• --q [0-2]: Quality level</li>
              <li>• --s [0-1000]: Stylization level</li>
              <li>• --c [0-100]: Chaos/randomness</li>
              <li>• --seed [number]: Consistency control</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-4">Advanced Parameters:</h4>
            <ul className="space-y-2 text-[var(--text)] opacity-80">
              <li>• --style [raw]</li>
              <li>• --repeat [1-40]</li>
              <li>• --tile: Create tileable patterns</li>
              <li>• --version [1-6.1]</li>
            </ul>
          </div>
        </div>

        <TipBox title="Parameter Usage Tips">
          <ul className="space-y-2 text-[var(--text)] opacity-80">
            <li>• Parameters can be combined for more specific results</li>
            <li>• Use --seed for consistent results across variations</li>
            <li>• Adjust --s and --c for different levels of creativity</li>
            <li>• Consider aspect ratio early in your prompt design</li>
          </ul>
        </TipBox>
      </div>
    </div>
  );
};

export default PromptOperationsSection;