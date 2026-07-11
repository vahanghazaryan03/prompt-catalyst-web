import React from 'react';
import { 
  Coins, 
  Wand2, 
  Eye, 
  Image as ImageIcon, 
  Code,
  CircleDollarSign,
  Gem,
  Star,
  Film,
  Zap,
  Crown
} from 'lucide-react';
import { SectionTitle, Card, TipBox, Divider } from '../HelpComponents';

const CreditUsageSection = () => {
  return (
    <div className="space-y-8">
      <SectionTitle
        icon={<Coins className="w-6 h-6" />}
        title="Credit Usage"
        subtitle="Understanding credits and usage limits"
      />

      <div className="space-y-6">
        <h4 className="text-lg font-medium text-[var(--text)] flex items-center gap-2">
          <CircleDollarSign className="w-5 h-5 text-[var(--primary)]" />
          Credit Costs
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            icon={<Wand2 className="w-5 h-5" />}
            title="Prompt Generation"
            description="1 credit per prompt generation (0 credits for Visionary Plan members)"
          />
          <Card
            icon={<Eye className="w-5 h-5" />}
            title="Preview Generation"
            description="2 credits per preview image generation (0 credits for Visionary Plan members)"
          />
          <Card
            icon={<Zap className="w-5 h-5" />}
            title="Flux Schnell"
            description="5 credits per image generation"
          />
          <Card
            icon={<ImageIcon className="w-5 h-5" />}
            title="Flux Dev"
            description="10 credits per image generation"
          />
          <Card
            icon={<Film className="w-5 h-5" />}
            title="Animation Generation"
            description="350 credits per 5-second, 720p video generation"
          />
          <Card
            icon={<Film className="w-5 h-5" />}
            title="Animation Generation"
            description="1100 credits per 5-second, 1080p video generation"
          />
        </div>

        <Divider />

        <h4 className="text-lg font-medium text-[var(--text)] flex items-center gap-2">
          <Crown className="w-5 h-5 text-[var(--primary)]" />
          Credit Allocation
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <Card
            icon={<Coins className="w-5 h-5" />}
            title="Free Users"
            description="10 free credits daily."
            color="from-green-500/20 to-emerald-500/20"
          />
          <Card
            icon={<Star className="w-5 h-5" />}
            title="Standard Plan Members"
            description="5000 credits monthly."
            color="from-purple-500/20 to-indigo-500/20"
          />
          <Card
            icon={<Crown className="w-5 h-5" />}
            title="Pro Plan Members"
            description="11000 credits monthly."
            color="from-purple-500/20 to-indigo-500/20"
          />
          <Card
            icon={<Gem className="w-5 h-5" />}
            title="Visionary Plan Members"
            description="34000 credits monthly."
            color="from-purple-500/20 to-indigo-500/20"
          />
        </div>

        <TipBox title="Credit Top-Up">
          <p className="text-[var(--text)] opacity-80">Standard and Pro users can purchase additional credits through our top-up system. Top-up credits never expire, while subscription credits reset monthly.</p>
        </TipBox>
      </div>
    </div>
  );
};

export default CreditUsageSection;