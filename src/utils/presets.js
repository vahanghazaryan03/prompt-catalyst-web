import { 
  Camera, 
  GamepadIcon, 
  Palette, 
  Camera as VintageCamera, 
  Mountain, 
  Package, 
  Minimize, 
  Smile, 
  Film, 
  UtensilsCrossed, 
  PenTool, 
  BookOpen, 
  Building, 
  Microscope, 
  Baby, 
  Flower,
  CloudLightning,
  Wand2,
  Church,
  Cog,
  Tv,
  Sword,
  Paintbrush,
  Skull,
  Bot,
  Album,
  Gamepad2,
  Radio,
  Trophy,
  SwordIcon
} from 'lucide-react';

// Enhancement function to add multi-select arrays to preset settings
const enhancePresetSettings = (settings) => {
  if (!settings) return settings;
  
  // Add the multi-select arrays if they don't exist
  const enhanced = { ...settings };
  
  // Add style to styles array if style exists and is not 'not_specified'
  if (!enhanced.styles && enhanced.style && enhanced.style !== 'not_specified') {
    enhanced.styles = [enhanced.style];
  }
  
  // Add lighting to lightingEffects array if lighting exists and is not 'not_specified'
  if (!enhanced.lightingEffects && enhanced.lighting && enhanced.lighting !== 'not_specified') {
    enhanced.lightingEffects = [enhanced.lighting];
  }
  
  // Add cameraAngle to cameraAngles array if cameraAngle exists and is not 'not_specified'
  if (!enhanced.cameraAngles && enhanced.cameraAngle && enhanced.cameraAngle !== 'not_specified') {
    enhanced.cameraAngles = [enhanced.cameraAngle];
  }
  
  return enhanced;
};

// Free user presets - using only non-premium settings
// Video-specific presets for free users
export const freeVideoPresets = [
  {
    name: "Cinematic Sequence",
    displayName: "Cinematic",
    icon: Film,
    settings: {
      videoStyle: "cinematic",
      style: "cinematic",
      cameraMovement: "static-shot",
      cameraAngle: "eye_level",
      lighting: "dramatic",
      specialEffects: "not_specified",
      pacing: "medium",
      promptLength: 2
    },
    samplePrompt: "A character walking through a moody urban landscape"
  },
  {
    name: "Nature Documentary",
    displayName: "Nature Doc",
    icon: Mountain,
    settings: {
      videoStyle: "documentary",
      style: "documentary",
      cameraMovement: "pan-shot",
      cameraAngle: "wide_angle",
      lighting: "natural",
      specialEffects: "not_specified",
      pacing: "slow",
      promptLength: 2
    },
    samplePrompt: "Aerial view of a lush rainforest"
  },
  {
    name: "Action Sequence",
    displayName: "Action",
    icon: Sword,
    settings: {
      videoStyle: "cinematic",
      style: "cinematic",
      cameraMovement: "steadicam-shot",
      cameraAngle: "dutch_angle",
      lighting: "dramatic",
      specialEffects: "blur",
      pacing: "fast",
      promptLength: 2
    },
    samplePrompt: "Intense chase scene through narrow streets"
  },
  {
    name: "Urban Timelapse",
    displayName: "Timelapse",
    icon: Building,
    settings: {
      videoStyle: "time-lapse",
      style: "time-lapse",
      cameraMovement: "static-shot",
      cameraAngle: "wide_angle",
      lighting: "natural",
      specialEffects: "not_specified",
      pacing: "fast",
      promptLength: 2
    },
    samplePrompt: "Bustling city center from day to night"
  },
  {
    name: "Vlog Style",
    displayName: "Vlog",
    icon: Camera,
    settings: {
      videoStyle: "vlog",
      style: "vlog",
      cameraMovement: "handheld-shot",
      cameraAngle: "eye_level",
      lighting: "natural",
      specialEffects: "not_specified",
      pacing: "medium",
      promptLength: 2
    },
    samplePrompt: "Person exploring an interesting location"
  },
  {
    name: "Drone Flyover",
    displayName: "Drone View",
    icon: CloudLightning,
    settings: {
      videoStyle: "aerial",
      style: "aerial",
      cameraMovement: "crane-shot",
      cameraAngle: "high_angle",
      lighting: "natural",
      specialEffects: "not_specified",
      pacing: "medium",
      promptLength: 2
    },
    samplePrompt: "Flying over coastal cliffs and ocean waves"
  },
  {
    name: "Slow Motion",
    displayName: "Slow-Mo",
    icon: Package,
    settings: {
      videoStyle: "slow-motion",
      style: "slow-motion",
      cameraMovement: "dolly-shot",
      cameraAngle: "close_up",
      lighting: "dramatic",
      specialEffects: "blur",
      pacing: "slow",
      promptLength: 2
    },
    samplePrompt: "Water droplets falling into a pool"
  }
];

// Premium video presets
export const premiumVideoPresets = [
  {
    name: "Sci-Fi Scene",
    displayName: "Sci-Fi",
    icon: Bot,
    settings: {
      videoStyle: "cyberpunk",
      style: "cyberpunk",
      cameraMovement: "dolly-shot",
      cameraAngle: "low_angle",
      lighting: "neon",
      specialEffects: "particles",
      pacing: "medium",
      promptLength: 3
    },
    samplePrompt: "Futuristic cityscape with flying vehicles"
  },
  {
    name: "Fantasy World",
    displayName: "Fantasy",
    icon: Wand2,
    settings: {
      videoStyle: "experimental",
      style: "experimental",
      cameraMovement: "crane-shot",
      cameraAngle: "wide_angle",
      lighting: "volumetric",
      specialEffects: "particles",
      pacing: "medium",
      promptLength: 3
    },
    samplePrompt: "Magical forest with glowing elements"
  },
  {
    name: "Horror Sequence",
    displayName: "Horror",
    icon: Skull,
    settings: {
      videoStyle: "noir",
      style: "noir",
      cameraMovement: "handheld-shot",
      cameraAngle: "dutch_angle",
      lighting: "low_key",
      specialEffects: "vignette",
      pacing: "slow",
      promptLength: 3
    },
    samplePrompt: "Abandoned hallway with flickering lights"
  },
  {
    name: "Sports Highlight",
    displayName: "Sports",
    icon: Trophy,
    settings: {
      videoStyle: "documentary",
      style: "documentary",
      cameraMovement: "steadicam-shot",
      cameraAngle: "eye_level",
      lighting: "high_key",
      specialEffects: "not_specified",
      pacing: "fast",
      promptLength: 3
    },
    samplePrompt: "Athlete performing impressive move in slow motion"
  },
  {
    name: "Music Video",
    displayName: "Music Video",
    icon: Radio,
    settings: {
      videoStyle: "music-video",
      style: "music-video",
      cameraMovement: "zoom-shot",
      cameraAngle: "low_angle",
      lighting: "neon",
      specialEffects: "color-shift",
      pacing: "variable",
      promptLength: 3
    },
    samplePrompt: "Artist performing in an artistic setting with vibrant colors"
  }
];

// Image presets for free users
export const freePresets = [
  {
    name: "Portrait Studio",
    displayName: "Portrait",
    icon: Camera,
    settings: {
      style: "realism",
      lighting: "studio",
      cameraAngle: "close_up",
      // Add multi-select arrays that match the single properties
      styles: ["realism"],
      lightingEffects: ["studio"],
      cameraAngles: ["close_up"],
      model: "not_specified",
      purpose: "portrait",
      promptLength: 2,
      creativity: 5,
      promptAmount: 3
    },
    samplePrompt: "Professional, clean background"
  },
  {
    name: "Pixel Game",
    displayName: "Pixel Art",
    icon: GamepadIcon,
    settings: {
      style: "pixel_art",
      lighting: "not_specified",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "character_illustration",
      promptLength: 2,
      creativity: 6,
      promptAmount: 3
    },
    samplePrompt: "Brave Knight"
  },
  {
    name: "Pop Art",
    displayName: "Pop Art",
    icon: Palette,
    settings: {
      style: "pop_art",
      lighting: "high_key",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "poster",
      promptLength: 2,
      creativity: 7,
      promptAmount: 3
    },
    samplePrompt: "Vibrant"
  },
  {
    name: "Vintage Photo",
    displayName: "Vintage",
    icon: VintageCamera,
    settings: {
      style: "vintage",
      lighting: "natural",
      cameraAngle: "eye_level",
      model: "not_specified",
      purpose: "portrait",
      promptLength: 2,
      creativity: 5,
      promptAmount: 3
    },
    samplePrompt: "Nostalgic mood, old photo"
  },
  {
    name: "Nature Scene",
    displayName: "Landscape",
    icon: Mountain,
    settings: {
      style: "impressionism",
      lighting: "natural",
      cameraAngle: "wide_angle",
      model: "dalle",
      purpose: "landscape",
      promptLength: 2,
      creativity: 6,
      promptAmount: 3
    },
    samplePrompt: "Serene nature scene"
  },
  {
    name: "Product Shot",
    displayName: "Product",
    icon: Package,
    settings: {
      style: "realism",
      lighting: "studio",
      cameraAngle: "close_up",
      model: "dalle",
      purpose: "product_photo",
      promptLength: 2,
      creativity: 5,
      promptAmount: 3
    },
    samplePrompt: "Headphones"
  },
  {
    name: "Minimalist",
    displayName: "Minimal",
    icon: Minimize,
    settings: {
      style: "minimalism",
      lighting: "not_specified",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "poster",
      promptLength: 2,
      creativity: 5,
      promptAmount: 3
    },
    samplePrompt: "Design with simple shapes"
  },
  {
    name: "Cartoon Style",
    displayName: "Cartoon",
    icon: Smile,
    settings: {
      style: "cartoon",
      lighting: "natural",
      cameraAngle: "eye_level",
      model: "dalle",
      purpose: "character_illustration",
      promptLength: 2,
      creativity: 6,
      promptAmount: 3
    },
    samplePrompt: "Fun character"
  },
  {
    name: "Noir Portrait",
    displayName: "Film Noir",
    icon: Film,
    settings: {
      style: "realism",
      lighting: "low_key",
      cameraAngle: "dutch_angle",
      model: "not_specified",
      purpose: "portrait",
      promptLength: 2,
      creativity: 7,
      promptAmount: 3
    },
    samplePrompt: "Detective mood"
  },
  {
    name: "Food Blog",
    displayName: "Food Shot",
    icon: UtensilsCrossed,
    settings: {
      style: "realism",
      lighting: "soft",
      cameraAngle: "close_up",
      model: "not_specified",
      purpose: "food_photo",
      promptLength: 2,
      creativity: 5,
      promptAmount: 3
    },
    samplePrompt: "Nostalgic"
  },
  {
    name: "Brand Identity",
    displayName: "Logo Design",
    icon: PenTool,
    settings: {
      style: "minimalism",
      lighting: "not_specified",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "logo",
      promptLength: 2,
      creativity: 10,
      promptAmount: 3
    },
    samplePrompt: "Modern company"
  },
  {
    name: "Story Cover",
    displayName: "Book Cover",
    icon: BookOpen,
    settings: {
      style: "surrealism",
      lighting: "dramatic",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "book_cover",
      promptLength: 2,
      creativity: 8,
      promptAmount: 3
    },
    samplePrompt: "Mystery novel"
  },
  {
    name: "Street Life",
    displayName: "Urban Scene",
    icon: Building,
    settings: {
      style: "impressionism",
      lighting: "natural",
      cameraAngle: "wide_angle",
      model: "not_specified",
      purpose: "street_photo",
      promptLength: 2,
      creativity: 7,
      promptAmount: 3
    },
    samplePrompt: "City bustle"
  },
  {
    name: "Kids Style",
    displayName: "Children's Art",
    icon: Baby,
    settings: {
      style: "cartoon",
      lighting: "high_key",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "coloring_page",
      promptLength: 2,
      creativity: 10,
      promptAmount: 3
    },
    samplePrompt: "Fun animal"
  },
  {
    name: "Nature Close",
    displayName: "Macro Nature",
    icon: Flower,
    settings: {
      style: "realism",
      lighting: "natural",
      cameraAngle: "close_up",
      model: "not_specified",
      purpose: "nature_macro",
      promptLength: 2,
      creativity: 6,
      promptAmount: 3
    },
    samplePrompt: "Flower detail"
  },
  {
    name: "Humans and Animals Miniature",
    displayName: "Humans & Animals Mini",
    icon: Flower,
    settings: {
      style: "realism",
      lighting: "not_specified",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "miniature_design",
      promptLength: 2,
      creativity: 7,
      promptAmount: 3
    },
    samplePrompt: "Humans & Animals"
  }
];

// Premium user presets - including premium settings
export const premiumPresets = [
  {
    name: "Cyberpunk Scene",
    displayName: "Cyberpunk",
    icon: CloudLightning,
    settings: {
      style: "cyberpunk",
      lighting: "neon",
      cameraAngle: "dutch_angle",
      model: "midjourney",
      purpose: "concept_art",
      promptLength: 3,
      creativity: 8,
      promptAmount: 5
    },
    samplePrompt: "Street scene, rain"
  },
  {
    name: "Fantasy Character",
    displayName: "Fantasy",
    icon: Wand2,
    settings: {
      style: "fantasy",
      lighting: "not_specified",
      cameraAngle: "not_specified",
      model: "midjourney",
      purpose: "character_sheet",
      promptLength: 3,
      creativity: 9,
      promptAmount: 5
    },
    samplePrompt: "Character, magical effects"
  },
  {
    name: "Dark Gothic",
    displayName: "Gothic",
    icon: Church,
    settings: {
      style: "gothic",
      lighting: "dramatic",
      cameraAngle: "low_angle",
      model: "midjourney",
      purpose: "concept_art",
      promptLength: 3,
      creativity: 8,
      promptAmount: 5
    },
    samplePrompt: "Architectural scene"
  },
  {
    name: "Steampunk Design",
    displayName: "Steampunk",
    icon: Cog,
    settings: {
      style: "steampunk",
      lighting: "chiaroscuro",
      cameraAngle: "dutch_angle",
      model: "midjourney",
      purpose: "mechanism_design",
      promptLength: 3,
      creativity: 8,
      promptAmount: 5
    },
    samplePrompt: "A detailed steampunk mechanical device"
  },
  {
    name: "Anime Style",
    displayName: "Anime",
    icon: Tv,
    settings: {
      style: "anime",
      lighting: "dramatic",
      cameraAngle: "eye_level",
      model: "midjourney",
      purpose: "character_illustration",
      promptLength: 3,
      creativity: 7,
      promptAmount: 5
    },
    samplePrompt: "Anime character"
  },
  {
    name: "Game Asset",
    displayName: "Game Art",
    icon: Sword,
    settings: {
      style: "fantasy",
      lighting: "dramatic",
      cameraAngle: "isometric",
      model: "midjourney",
      purpose: "game_asset",
      promptLength: 3,
      creativity: 8,
      promptAmount: 5
    },
    samplePrompt: "A fantasy game asset"
  },
  {
    name: "Art Nouveau",
    displayName: "Art Nouveau",
    icon: Paintbrush,
    settings: {
      style: "art_nouveau",
      lighting: "soft",
      cameraAngle: "eye_level",
      model: "midjourney",
      purpose: "illustration",
      promptLength: 3,
      creativity: 7,
      promptAmount: 5
    },
    samplePrompt: "Decorative illustration"
  },
  {
    name: "Creature Design",
    displayName: "Creature",
    icon: Skull,
    settings: {
      style: "dark_fantasy",
      lighting: "dramatic",
      cameraAngle: "low_angle",
      model: "midjourney",
      purpose: "creature_design",
      promptLength: 3,
      creativity: 9,
      promptAmount: 5
    },
    samplePrompt: " "
  },
  {
    name: "Retro Future",
    displayName: "Retro-Future",
    icon: Bot,
    settings: {
      style: "retro_futurism",
      lighting: "dramatic",
      cameraAngle: "dutch_angle",
      model: "midjourney",
      purpose: "concept_art",
      promptLength: 3,
      creativity: 8,
      promptAmount: 5
    },
    samplePrompt: "Sci-fi scene"
  },
  {
    name: "Watercolor Art",
    displayName: "Watercolor",
    icon: Album,
    settings: {
      style: "watercolor",
      lighting: "soft",
      cameraAngle: "eye_level",
      model: "midjourney",
      purpose: "illustration",
      promptLength: 3,
      creativity: 7,
      promptAmount: 5
    },
    samplePrompt: "Fruits"
  },
  {
    name: "Game Character",
    displayName: "RPG Hero",
    icon: Gamepad2,
    settings: {
      style: "dark_fantasy",
      lighting: "volumetric",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "character_sheet",
      promptLength: 2,
      creativity: 8,
      promptAmount: 5
    },
    samplePrompt: "Warrior pose"
  },
  {
    name: "Streaming Pack",
    displayName: "Stream Kit",
    icon: Radio,
    settings: {
      style: "cyberpunk",
      lighting: "neon",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "twitch_overlay",
      promptLength: 2,
      creativity: 7,
      promptAmount: 5
    },
    samplePrompt: "Gaming overlay"
  },
  {
    name: "Card Game",
    displayName: "TCG Art",
    icon: Trophy,
    settings: {
      style: "fantasy",
      lighting: "volumetric",
      cameraAngle: "not_specified",
      model: "not_specified",
      purpose: "card_art",
      promptLength: 2,
      creativity: 8,
      promptAmount: 5
    },
    samplePrompt: "Spell card"
  },
  {
    name: "Tabletop Mini",
    displayName: "Miniature",
    icon: SwordIcon,
    settings: {
      style: "hyperrealism",
      lighting: "dramatic",
      cameraAngle: "isometric",
      model: "not_specified",
      purpose: "miniature_design",
      promptLength: 2,
      creativity: 7,
      promptAmount: 5
    },
    samplePrompt: "Battle Scene"
  },
 
];

// Apply multi-select enhancements to all preset settings
freePresets.forEach(preset => {
  preset.settings = enhancePresetSettings(preset.settings);
});

premiumPresets.forEach(preset => {
  preset.settings = enhancePresetSettings(preset.settings);
});

freeVideoPresets.forEach(preset => {
  preset.settings = enhancePresetSettings(preset.settings);
});

premiumVideoPresets.forEach(preset => {
  preset.settings = enhancePresetSettings(preset.settings);
});

// Function to get random presets based on user type and mode
export const getRandomPresets = (isPremium, count = 3, isVideoMode = false) => {
  let availablePresets;
  
  if (isVideoMode) {
    // For video mode, use video presets
    availablePresets = isPremium 
      ? [...premiumVideoPresets, ...freeVideoPresets]
      : [...freeVideoPresets];
  } else {
    // For image mode, use image presets
    availablePresets = isPremium 
      ? [...premiumPresets, ...freePresets]
      : [...freePresets];
  }
  
  const randomPresets = [];
  const totalPresets = availablePresets.length;
  
  while (randomPresets.length < count && availablePresets.length > 0) {
    const randomIndex = Math.floor(Math.random() * availablePresets.length);
    randomPresets.push(availablePresets.splice(randomIndex, 1)[0]);
  }
  
  return randomPresets;
};

// Function to get all available presets based on user type and mode
export const getAllPresets = (isPremium, isVideoMode = false) => {
  if (isVideoMode) {
    // For video mode
    if (isPremium) {
      return [...premiumVideoPresets, ...freeVideoPresets];
    }
    return [...freeVideoPresets];
  } else {
    // For image mode
    if (isPremium) {
      return [...premiumPresets, ...freePresets];
    }
    return [...freePresets];
  }
};