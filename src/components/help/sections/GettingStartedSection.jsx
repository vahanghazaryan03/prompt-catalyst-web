import React from 'react';
import { 
  Upload, Settings, Clapperboard, Command, Palette, Image as ImageIcon,
  Star, Filter, RefreshCcw, Zap, User, LogOut, MessageSquare,
  Sparkles, FolderOpen, HistoryIcon, Calendar, Image, Wand2,
  LogIn, HelpCircle, UploadCloud, Dices, Eye, Film as Play, PencilRuler
} from 'lucide-react';
import { Card } from '../HelpComponents';

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

const WorkflowStep = ({ number, icon, title, description }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
      {number}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h4 className="font-medium text-[var(--text)]">{title}</h4>
      </div>
      <p className="text-[var(--text)] opacity-80">{description}</p>
    </div>
  </div>
);

// Getting Started Section
export const GettingStartedSection = () => {
  const mainFeatures = [
    {
      icon: <Command className="w-6 h-6" />,
      title: "AI-Powered Prompt Generation",
      description: "Create perfect prompts for any AI model with the intelligent assistant. Get detailed, customizable prompts optimized for your specific needs.",
      color: "from-blue-500/20 to-purple-500/20"
    },
    {
      icon: <ImageIcon className="w-6 h-6" />,
      title: "Image Generation",
      description: "Turn your prompts into AI-generated images with multiple models and customizable settings.",
      color: "from-green-500/20 to-teal-500/20"
    },
    {
      icon: <PencilRuler className="w-6 h-6" />,
      title: "Image Editing",
      description: "Transform your images using text instructions. Describe the changes you want, and AI will edit your images accordingly.",
      color: "from-cyan-500/20 to-blue-500/20"
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "Image Animation",
      description: "Bring static images to life with sophisticated animation effects using AI image-to-video technology.",
      color: "from-purple-500/20 to-blue-500/20"
    },
    {
      icon: <Filter className="w-6 h-6" />,
      title: "Collections",
      description: "Organize and save your prompts in custom collections. Keep your best prompts organized and easily accessible.",
      color: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: <RefreshCcw className="w-6 h-6" />,
      title: "Variations & Extensions",
      description: "Generate alternative versions of your prompts or extend them with additional details and creative elements.",
      color: "from-pink-500/20 to-red-500/20"
    },
    {
      icon: <Clapperboard className="w-6 h-6" />,
      title: "Video Mode",
      description: "Create text-to-video prompts and generate videos with customizable duration, resolution, and specialized video settings.",
      color: "from-blue-400/20 to-blue-500/20"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Key Features Overview */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Key Features</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          Prompt Catalyst offers a comprehensive suite of tools designed to enhance your AI content creation workflow:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainFeatures.map((feature, index) => (
            <Card key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <SectionTitle>Getting Started</SectionTitle>
        <p className="text-[var(--text)] opacity-80 mb-6">
          Prompt Catalyst is a powerful platform for AI content creation that offers an intuitive interface with advanced tools for prompt engineering, image generation, and animation. A <a 
                  href="https://chromewebstore.google.com/detail/prompt-catalyst/hehieakgdbakdajfpekgmfckplcjmgcf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >browser extension</a> with similar prompt generation functionality is also available for quick access while browsing.
        </p>
        
        <div className="mb-8">
          <h4 className="font-medium text-[var(--text)] mb-4">First Time Setup</h4>
          <ol className="space-y-4 text-[var(--text)] opacity-80">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                1
              </span>
              <span>
                Visit{' '}
                <a 
                  href="https://promptcatalyst.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >
                  promptcatalyst.ai
                </a>
                {' '}to access the web version
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                2
              </span>
              <span>Sign up for a free account to access basic features and free daily credits</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm">
                3
              </span>
              <span>Consider upgrading for advanced features and higher usage limits</span>
            </li>
          </ol>
        </div>

        <Divider />
        
        {/* Creative Workflow */}
        <h4 className="font-medium text-[var(--text)] text-lg mb-5">Creative Workflow</h4>
        <p className="text-[var(--text)] opacity-80 mb-6">
          Prompt Catalyst's powerful workflow lets you go from text prompts to animated images in four simple steps:
        </p>
        
        <WorkflowStep 
          number="1" 
          icon={<MessageSquare className="w-5 h-5 text-[var(--primary)]" />}
          title="Generate Prompts (Prompt Lab)" 
          description="Start in the Prompt Lab tab where you can generate detailed image prompts. Customize settings like style, lighting, and camera angle to get exactly the prompt you need." 
        />
        
        <WorkflowStep 
          number="2" 
          icon={<ImageIcon className="w-5 h-5 text-[var(--primary)]" />}
          title="Create Images (Generate Tab)" 
          description="Use your prompts in the Generate tab to create images. Choose from multiple AI models, adjust aspect ratios, and create multiple variations."
        />
        
        <WorkflowStep 
          number="3" 
          icon={<PencilRuler className="w-5 h-5 text-[var(--primary)]" />}
          title="Edit Images (Edit Tab)" 
          description="Transform your images using text-guided AI editing. Describe the changes you want to make, and the AI will apply them to your images."
        />
        
        <WorkflowStep 
          number="4" 
          icon={<Play className="w-5 h-5 text-[var(--primary)]" />}
          title="Animate Images (Animate Tab)" 
          description="Transform your static images into stunning animations. Select from various movement presets, customize parameters, and export your animated creations."
        />
        
        <TipBox title="Video Mode Workflow">
          <p className="text-[var(--text)] opacity-80 mb-2">
            Switch to Video Mode using the toggle in the header to access a completely different workflow:
          </p>
          <ol className="space-y-2 text-[var(--text)] opacity-80">
            <li>1. Enter a scene description in the Prompt Lab</li>
            <li>2. Customize video-specific parameters (style, camera movement, duration, resolution)</li>
            <li>3. Generate videos using the Generate tab</li>
            <li>4. Download, share, or save your videos to your collection</li>
          </ol>
        </TipBox>
        
        <img 
          src="/screenshots/interface-overview.png" 
          alt="Interface Overview" 
          className="w-full rounded-lg border border-[var(--border)] mt-6"
        />
      </div>

      {/* Interface Overview */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <h3 className="text-xl font-semibold text-[var(--text)] mb-6">Understanding the Interface</h3>
        
        <h4 className="font-medium text-[var(--text)] mt-6 mb-4">Main Navigation:</h4>
        <ul className="space-y-4 text-[var(--text)] opacity-80">
          <li className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
            <span>
              <strong className="text-[var(--text)]">Prompt Lab:</strong> The main interface for prompt generation
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
            <span>
              <strong className="text-[var(--text)]">Generate:</strong> Image generation with prompt customization
            </span>
          </li>
          <li className="flex items-center gap-3">
            <PencilRuler className="w-5 h-5 text-[var(--primary)]" />
            <span>
              <strong className="text-[var(--text)]">Edit:</strong> Transform images with text-guided editing
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Play className="w-5 h-5 text-[var(--primary)]" />
            <span>
              <strong className="text-[var(--text)]">Animate:</strong> Turn static images into animations
            </span>
          </li>
          <li className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-[var(--primary)]" />
            <span>
              <strong className="text-[var(--text)]">Collections:</strong> Organize and save your favorite prompts
            </span>
          </li>
          <li className="flex items-center gap-3">
            <HistoryIcon className="w-5 h-5 text-[var(--primary)]" />
            <span>
              <strong className="text-[var(--text)]">History:</strong> View and reuse your previous prompts
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
            <span>
              <strong className="text-[var(--text)]">Weekly Prompts:</strong> Discover curated weekly prompt collections
            </span>
          </li>
         
          <li className="flex items-center gap-3">
            <Clapperboard className="w-5 h-5 text-[var(--primary)]" />
            <span>
              <strong className="text-[var(--text)]">Video Mode:</strong> Toggle to Video Mode to access text-to-video generation with specialized settings for camera movement, video style, and more
            </span>
          </li>
        </ul>
      </div>



      <TipBox title="Best Practices for First-Time Users">
        <ul className="space-y-2 text-[var(--text)] opacity-80">
          <li>• Start with clear, simple descriptions and gradually add complexity</li>
          <li>• Use Generate tab to experiment with different models and settings</li>
          <li>• In the Edit tab, be specific with your editing instructions for best results</li>
          <li>• Try different animation presets to see which works best for your image</li>
          <li>• Save successful prompts to collections for future reference</li>
          <li>• Try the complete workflow: create a prompt, generate an image, edit it, then animate it</li>
        </ul>
      </TipBox>
    </div>
  );
};

export default GettingStartedSection;