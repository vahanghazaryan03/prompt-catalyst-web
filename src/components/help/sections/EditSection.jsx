import React from 'react';
import { 
  PencilRuler, 
  Upload, 
  Settings, 
  Wand2, 
  Sparkles, 
  Layers, 
  History, 
  Image as ImageIcon,
  AlertTriangle,
  Info,
  Crown
} from 'lucide-react';

// Common styled components
const SectionTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-[var(--text)] mb-4">{children}</h3>
);

const Divider = () => (
  <hr className="my-8 border-[var(--border)]" />
);

const TipBox = ({ title, children }) => (
  <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg p-4 mt-6">
    <h4 className="font-medium text-[var(--primary)] mb-2">{title}</h4>
    {children}
  </div>
);

const FeatureCard = ({ title, description, icon: Icon }) => (
  <div className="bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--primary)]/30 transition-colors">
    <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-5 h-5 text-[var(--primary)]" />
    </div>
    <h4 className="text-[var(--text)] font-medium mb-2">{title}</h4>
    <p className="text-sm text-[var(--text)] opacity-80">{description}</p>
  </div>
);

const EditSection = () => {
  return (
    <div className="space-y-8">
      {/* Edit Overview */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>AI Image Editing</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          The Edit tab allows you to transform your images using text instructions. Simply upload an image, 
          describe the edits you want to make, and let AI interpret your instructions to create the desired changes.
        </p>

        {/* Banner/Image */}
        <div className="bg-[var(--cardBackground)] border border-[var(--border)] rounded-lg p-2 mb-6">
          <div className="aspect-video w-full rounded bg-[var(--cardBackground)] flex items-center justify-center">
            <img 
              src="/screenshots/edit-tab-overview.png" 
              alt="Edit Tab Interface" 
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>

        <h4 className="font-medium text-lg text-[var(--text)] mb-4">Key Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard 
            icon={PencilRuler}
            title="Text-Guided Editing" 
            description="Transform your images by describing the changes you want to make in natural language."
          />
          <FeatureCard 
            icon={Wand2}
            title="AI-Powered Models" 
            description="Choose between different AI models optimized for various editing tasks and quality levels."
          />
          <FeatureCard 
            icon={Layers}
            title="Multiple Variations" 
            description="Generate up to 4 different interpretations of your editing instructions simultaneously."
          />
          <FeatureCard 
            icon={History}
            title="Edit History" 
            description="Keep track of your previous edits with a comprehensive history system."
          />
        </div>
      </div>

      {/* Edit Workflow */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>How to Edit Images</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          Follow these steps to edit your images using Prompt Catalyst's AI editing capabilities:
        </p>

        <ol className="space-y-6 mb-6">
          <li>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                1
              </span>
              <div>
                <h4 className="font-medium text-[var(--text)] mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[var(--primary)]" />
                  Upload Your Image
                </h4>
                <p className="text-[var(--text)] opacity-80">
                  Click the upload area or drag and drop an image to start. Supported formats include JPG, PNG, and WebP.
                  Maximum file size is 15MB.
                </p>
              </div>
            </div>
          </li>
          
          <li>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                2
              </span>
              <div>
                <h4 className="font-medium text-[var(--text)] mb-1 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[var(--primary)]" />
                  Write Editing Instructions
                </h4>
                <p className="text-[var(--text)] opacity-80">
                  Describe what changes you want to make to your image. Be specific and detailed about the edits
                  you're looking for. For example: "Change hair color to blonde", "Make this image look like pixel art",
                  or "Transform the background into a tropical beach".
                </p>
                <div className="mt-3 bg-[var(--cardBackground)] rounded-lg p-3 text-sm text-[var(--text)] opacity-90">
                  <p className="font-medium mb-1">Example instructions:</p>
                  <ul className="space-y-1.5 list-disc pl-5 text-[var(--text)] opacity-80">
                    <li>"Change the sky to sunset colors"</li>
                    <li>"Make this photo look like an oil painting"</li>
                    <li>"Add a crown of flowers to the person's head"</li>
                    <li>"Transform this room into a minimalist style"</li>
                  </ul>
                </div>
              </div>
            </div>
          </li>
          
          <li>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                3
              </span>
              <div>
                <h4 className="font-medium text-[var(--text)] mb-1 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[var(--primary)]" />
                  Select Model & Settings
                </h4>
                <p className="text-[var(--text)] opacity-80">
                  Choose an AI model for your edit:
                </p>
                <div className="mt-3 space-y-3">
                  <div className="bg-[var(--cardBackground)] rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Wand2 className="w-4 h-4 text-[var(--primary)] mt-1" />
                      <div>
                        <h5 className="font-medium text-[var(--text)]">Flux Kontext Pro</h5>
                        <p className="text-xs text-[var(--text)] opacity-80">Balanced quality and performance. Good for most editing tasks.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[var(--cardBackground)] rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-[var(--primary)] mt-1" />
                      <div>
                        <h5 className="font-medium text-[var(--text)]">Flux Kontext Max</h5>
                        <p className="text-xs text-[var(--text)] opacity-80">Highest quality editing results. Best for complex edits and detailed changes.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[var(--text)] opacity-80">
                  Select how many variations you want to generate (1-4). More variations give you more options but use more credits.
                </p>
              </div>
            </div>
          </li>
          
          <li>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                4
              </span>
              <div>
                <h4 className="font-medium text-[var(--text)] mb-1 flex items-center gap-2">
                  <PencilRuler className="w-4 h-4 text-[var(--primary)]" />
                  Edit Image
                </h4>
                <p className="text-[var(--text)] opacity-80">
                  Click the "Edit Image" button to process your image according to your instructions. The AI will
                  interpret your text and apply the requested changes to your image.
                </p>
              </div>
            </div>
          </li>
          
          <li>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                5
              </span>
              <div>
                <h4 className="font-medium text-[var(--text)] mb-1 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--primary)]" />
                  Review Results
                </h4>
                <p className="text-[var(--text)] opacity-80">
                  After processing completes, you'll see your edited images. You can:
                </p>
                <ul className="mt-2 space-y-1 list-disc pl-5 text-[var(--text)] opacity-80">
                  <li>Download any of the edited images</li>
                  <li>View images in fullscreen</li>
                  <li>Re-edit an image to further refine it</li>
                  <li>Send an edited image to the Animate tab to bring it to life</li>
                </ul>
              </div>
            </div>
          </li>
        </ol>

        <div className="bg-[var(--cardBackground)]/50 border border-[var(--border)] rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-[var(--primary)]" />
            <h4 className="font-medium text-[var(--text)]">Credit Usage</h4>
          </div>
          <p className="text-sm text-[var(--text)] opacity-80">
            Each edit operation consumes credits based on the selected model and number of variations:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text)] opacity-80">
            <li>• Flux Kontext Pro: 80 credits per variation</li>
            <li>• Flux Kontext Max: 160 credits per variation</li>
          </ul>
          <p className="text-sm text-[var(--text)] opacity-80 mt-2">
            For example, generating 4 variations with Flux Kontext Max would use 640 credits.
          </p>
        </div>
      </div>

      {/* Edit History */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Edit History</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          The Edit History feature lets you view, organize, and reuse your previous edits. This helps you keep track 
          of successful editing techniques and quickly apply them to new images.
        </p>

        <h4 className="font-medium text-lg text-[var(--text)] mb-4">History Features</h4>
        <ul className="space-y-3 text-[var(--text)] opacity-80 mb-6">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
              <History className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <span><strong>Browse past edits</strong> - View all your previous edit sessions with thumbnails and descriptions</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <span><strong>Reuse settings</strong> - Apply previous edit instructions and settings to new images</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <span><strong>Download past edits</strong> - Download previously edited images directly from your history</span>
          </li>
        </ul>

        <div className="bg-[var(--cardBackground)]/50 border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-[var(--primary)]" />
            <h4 className="font-medium text-[var(--text)]">Privacy Note</h4>
          </div>
          <p className="text-sm text-[var(--text)] opacity-80">
            Edit history is stored locally in your browser. Your images and edits are not stored on our servers 
            after processing is complete. Clearing your browser data will remove your edit history.
          </p>
        </div>
      </div>

      {/* Tips for Better Edits */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Tips for Better Edits</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          Follow these best practices to get the most out of the AI image editing feature:
        </p>

        <div className="space-y-5">
          <div className="bg-[var(--cardBackground)] rounded-lg p-4 border border-[var(--border)]">
            <h4 className="font-medium text-[var(--text)] mb-2">Be Specific and Detailed</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              The more specific your instructions, the better the results. Include details about colors, styles, and 
              specific elements you want to change.
            </p>
            <div className="mt-3 flex gap-3">
              <div className="flex-1 bg-[var(--background)]/50 rounded p-2 border border-red-500/20">
                <p className="text-xs text-red-400 mb-1">❌ Too vague:</p>
                <p className="text-xs text-[var(--text)]">"Make it better"</p>
              </div>
              <div className="flex-1 bg-[var(--background)]/50 rounded p-2 border border-green-500/20">
                <p className="text-xs text-green-400 mb-1">✅ Specific:</p>
                <p className="text-xs text-[var(--text)]">"Change the blue sky to a dramatic sunset with purple and orange clouds"</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--cardBackground)] rounded-lg p-4 border border-[var(--border)]">
            <h4 className="font-medium text-[var(--text)] mb-2">One Edit at a Time</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              For complex changes, consider making one edit at a time. Edit in stages by re-editing the output from each step.
            </p>
          </div>

          <div className="bg-[var(--cardBackground)] rounded-lg p-4 border border-[var(--border)]">
            <h4 className="font-medium text-[var(--text)] mb-2">Choose the Right Model</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              Use Flux Kontext Pro for simpler edits and Flux Kontext Max for more complex or detailed changes.
            </p>
          </div>

          <div className="bg-[var(--cardBackground)] rounded-lg p-4 border border-[var(--border)]">
            <h4 className="font-medium text-[var(--text)] mb-2">Consider Image Quality</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              Higher quality source images typically produce better results. Well-lit, clear images with good resolution 
              work best with the AI editing system.
            </p>
          </div>

          <div className="bg-[var(--cardBackground)] rounded-lg p-4 border border-[var(--border)]">
            <h4 className="font-medium text-[var(--text)] mb-2">Use Style Instructions</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              Include style information in your instructions for more consistent results: "Transform this photo 
              into watercolor style" or "Apply a cyberpunk aesthetic to this image".
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Troubleshooting</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          If you encounter issues while using the Edit feature, try these common solutions:
        </p>

        <div className="space-y-4">
          <div className="border-l-2 border-[var(--primary)] pl-4">
            <h4 className="font-medium text-[var(--text)] mb-1">The edit doesn't match my instructions</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              Try being more specific with your instructions. Break complex edits into simpler parts and consider 
              using the Flux Kontext Max model for more precise control.
            </p>
          </div>
          
          <div className="border-l-2 border-[var(--primary)] pl-4">
            <h4 className="font-medium text-[var(--text)] mb-1">I get an "Image file is too large" error</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              Resize your image to be under 15MB. You can use an online image compressor or resize the dimensions 
              before uploading.
            </p>
          </div>
          
          <div className="border-l-2 border-[var(--primary)] pl-4">
            <h4 className="font-medium text-[var(--text)] mb-1">Edited images look distorted or have artifacts</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              This is more common with complex edits. Try using a higher quality source image, making smaller changes, 
              or using the Flux Kontext Max model.
            </p>
          </div>
          
          <div className="border-l-2 border-[var(--primary)] pl-4">
            <h4 className="font-medium text-[var(--text)] mb-1">Not enough credits for the operation</h4>
            <p className="text-sm text-[var(--text)] opacity-80">
              Reduce the number of variations or use the Flux Kontext Pro model which requires fewer credits. 
              Alternatively, you can purchase more credits or upgrade your subscription.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-[var(--text)]">
            If you continue to experience issues with the Edit feature, please contact support for assistance.
          </p>
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-[var(--primary)]" />
          <h3 className="text-xl font-semibold text-[var(--text)]">Premium Features</h3>
        </div>
        
        <p className="text-[var(--text)] opacity-80 mb-6">
          Pro and Visionary members get additional benefits when using the Edit feature:
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] flex-shrink-0">
              ✓
            </div>
            <span className="text-[var(--text)] opacity-80">
              <strong className="text-[var(--text)] opacity-100">Higher Credit Limits</strong> - More daily credits to use for editing operations
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] flex-shrink-0">
              ✓
            </div>
            <span className="text-[var(--text)] opacity-80">
              <strong className="text-[var(--text)] opacity-100">Animate Integration</strong> - Ability to send edited images directly to the Animate tab
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] flex-shrink-0">
              ✓
            </div>
            <span className="text-[var(--text)] opacity-80">
              <strong className="text-[var(--text)] opacity-100">Priority Processing</strong> - Faster processing of edit requests during peak times
            </span>
          </li>
        </ul>

        <a 
          href="/premium" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-all"
        >
          <Crown className="w-4 h-4" />
          Upgrade to Pro
        </a>
      </div>

      <TipBox title="Edit + Animate Workflow">
        <p className="text-[var(--text)] opacity-80 mb-3">
          Pro and Visionary members can combine the Edit and Animate features for powerful results:
        </p>
        <ol className="space-y-2 text-[var(--text)] opacity-80 list-decimal pl-5">
          <li>Upload an image to the Edit tab</li>
          <li>Make desired modifications using text instructions</li>
          <li>After generating the edited image, click the "Send to Animate" button</li>
          <li>Apply animation effects to bring your edited image to life</li>
        </ol>
        <p className="text-[var(--text)] opacity-80 mt-3">
          This workflow lets you completely transform static images - edit their content, style, and context, 
          then add dynamic movement for truly unique creations.
        </p>
      </TipBox>
    </div>
  );
};

export default EditSection;