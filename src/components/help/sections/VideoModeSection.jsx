import React from 'react';
import { Clapperboard, Camera, Film, Sparkles, Clock, Layout, Download, Zap, ArrowRight, Crown, DollarSign } from 'lucide-react';
import { SectionTitle, Divider, TipBox, Card, CodeBlock } from '../HelpComponents';

export const VideoModeSection = () => (
  <div className="space-y-8">
    {/* Overview Section */}
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <SectionTitle 
        icon={<Clapperboard className="w-6 h-6" />}
        title="Video Mode" 
        subtitle="Generate and create dynamic AI videos from text descriptions"
      />
      
      <p className="text-[var(--text)] opacity-90 mb-6">
        Video Mode transforms Prompt Catalyst into a powerful text-to-video generation platform. 
        Unlike Image Mode, Video Mode allows you to not only create specialized video prompts but also 
        generate actual videos directly within the application. The blue-themed interface signals that 
        you're in Video Mode, with specialized settings tailored for video creation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card 
          icon={<ArrowRight className="w-5 h-5" />}
          title="Switching to Video Mode" 
          description="Use the Image/Video toggle in the top-right corner of the interface to switch between modes. Your settings and history are maintained separately for each mode."
          color="from-blue-500/20 to-blue-600/20"
        />
        
        <Card 
          icon={<Crown className="w-5 h-5" />}
          title="Pro Feature" 
          description="Video generation requires a Pro membership due to the processing resources required. Free users can access video prompt generation but not actual video creation."
          color="from-purple-500/20 to-indigo-500/20"
        />
      </div>

      <Divider />

      
    </div>

    {/* Video Parameters Section */}
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <SectionTitle subtitle="Video Parameters" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">Core Settings</h4>
          <ul className="space-y-4 text-[var(--text)] opacity-85">
            <li className="flex items-start gap-3">
              <Film className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Video Style</strong>
                <p>Controls the overall aesthetic and production style of your video</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Options: Cinematic, Documentary, Vlog, Time-Lapse, Music Video, Experimental, Aerial, Slow Motion</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80"><strong>Premium Options:</strong> Animation, Commercial, Hyperreal, Film Noir, Retro, Cyberpunk</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Camera className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Camera Movement</strong>
                <p>Defines how the camera moves throughout the scene</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Options: Static, Pan, Tilt, Dolly, Zoom, Crane, Handheld, Steadicam</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80"><strong>Premium Options:</strong> Orbit, Drone, Vertigo Effect, Whip Pan, Gimbal</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Layout className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Aspect Ratio</strong>
                <p>The proportional relationship between width and height</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Options: 16:9 (Landscape), 9:16 (Portrait), 1:1 (Square)</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-[var(--text)] mb-4">Advanced Settings</h4>
          <ul className="space-y-4 text-[var(--text)] opacity-85">
            <li className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Duration & Resolution</strong>
                <p>Length and quality of the generated video</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Duration: 5 seconds (standard) or 10 seconds (extended)</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Resolution: 720p (standard) or 1080p (high quality)</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Special Effects & Pacing</strong>
                <p>Visual effects and rhythm of scene transitions</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Effects: Fade, Blur, Vignette, etc.</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Pacing: Slow, Medium, Fast, Variable</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 mt-1 text-[var(--primary)]" />
              <div>
                <strong className="text-[var(--text)]">Negative Prompt</strong>
                <p>Elements to exclude from the video</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Use for avoiding unwanted elements or visual issues</p>
                <p className="text-xs mt-1 text-[var(--text)] opacity-80">Example: "distortion, blurry, low quality"</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* Video Generation Workflow */}
    <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
      <SectionTitle subtitle="Video Generation Workflow" />
      
      <ol className="space-y-6 mb-6">
        <li className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
            1
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-1">Write a Detailed Scene Description</h4>
            <p className="text-[var(--text)] opacity-85">Provide a clear description of what you want in your video. Be specific about action, setting, subjects, lighting, and mood. Videos generally need more descriptive details than static images.</p>
           
          </div>
        </li>
        
        <li className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
            2
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-1">Configure Video Parameters</h4>
            <p className="text-[var(--text)] opacity-85">Select your video style, camera movement, aspect ratio, duration, and resolution. Each parameter will significantly affect the outcome and credit cost.</p>
           
          </div>
        </li>
        
        <li className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
            3
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-1">Generate Video</h4>
            <p className="text-[var(--text)] opacity-85">Click the "Generate Video" button to start the process. Video generation takes longer than image generation, typically 30-90 seconds depending on settings. </p>
    
          </div>
        </li>
        
        <li className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
            4
          </div>
          <div>
            <h4 className="font-medium text-[var(--text)] mb-1">Download and Share</h4>
            <p className="text-[var(--text)] opacity-85">Once generated, you can preview your video and download it as an MP4 file. Videos are automatically saved to your history for later access.</p>
            <div className="flex items-center gap-3 mt-3">
              <Download className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-sm text-[var(--text)] opacity-90">Use the download button to save videos to your device</span>
            </div>
          </div>
        </li>
      </ol>
    </div>

   
     

    {/* Tips and Best Practices */}
    <TipBox title="Pro Tips for Video Generation">
      <ul className="space-y-2 text-[var(--text)] opacity-90">
        <li>• <strong className="text-[var(--text)]">Time Progression:</strong> Describe how the scene should evolve over time for more dynamic results</li>
        <li>• <strong className="text-[var(--text)]">Action Details:</strong> Include specific movements and actions that should occur during the video</li>
        <li>• <strong className="text-[var(--text)]">Match Parameters:</strong> Select camera movements and pacing that complement your scene description</li>
        <li>• <strong className="text-[var(--text)]">Lighting Importance:</strong> Lighting details have a major impact on video mood and quality</li>
        <li>• <strong className="text-[var(--text)]">For Better Results:</strong> Use negative prompts to exclude unwanted elements or artifacts</li>
        <li>• <strong className="text-[var(--text)]">Save Credits:</strong> Test concepts with 720p/5sec before creating higher-quality versions</li>
        <li>• <strong className="text-[var(--text)]">Use Commands:</strong> Try the /nextscene command to create follow-up videos that continue your story</li>
      </ul>
    </TipBox>
  </div>
);

export default VideoModeSection;