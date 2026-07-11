import React, { useState } from 'react';
import { ChevronRight, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { PreviewCard } from './PreviewCard';
import { ModelPreview } from './ModelPreview';
import { SelectDialog } from './SelectDialog';
import { Tooltip } from './Tooltip';
import { motion, AnimatePresence } from 'framer-motion';
const STYLES = {
  free: [
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'realism', label: 'Photorealism' },
    { value: 'pixel_art', label: 'Pixel Art' },
    { value: 'impressionism', label: 'Impressionism' },
    { value: 'pop_art', label: 'Pop Art' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'hand_drawn', label: 'Hand-Drawn' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'minimalism', label: 'Minimalism' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'surrealism', label: 'Surrealism' },
    { value: 'weirdcore', label: 'Weirdcore'},
  ],
  premium: [
    { value: 'cyberpunk', label: 'Cyberpunk (Premium)', isPremium: true },
    { value: 'baroque', label: 'Baroque (Premium)', isPremium: true },
    { value: 'steampunk', label: 'Steampunk (Premium)', isPremium: true },
    { value: 'futurism', label: 'Futurism (Premium)', isPremium: true },
    { value: 'neo_noir', label: 'Neo-noir (Premium)', isPremium: true },
    
    { value: 'vaporwave', label: 'Vaporwave (Premium)', isPremium: true },
    { value: 'anime', label: 'Anime (Premium)', isPremium: true },
    { value: 'gothic', label: 'Gothic (Premium)', isPremium: true },
    { value: 'fantasy', label: 'Fantasy (Premium)', isPremium: true },
    { value: 'lego', label: 'Lego (Premium)', isPremium: true },
    { value: 'art_nouveau', label: 'Art Nouveau (Premium)', isPremium: true },
    { value: 'synthwave', label: 'Synthwave (Premium)', isPremium: true },
    { value: 'renaissance', label: 'Renaissance (Premium)', isPremium: true },
    { value: 'voxel_art', label: 'Voxel Art (Premium)', isPremium: true },
    { value: 'ukiyo_e', label: 'Ukiyo-e (Premium)', isPremium: true },
    { value: 'bauhaus', label: 'Bauhaus (Premium)', isPremium: true },
    { value: 'art_deco', label: 'Art Deco (Premium)', isPremium: true },
    { value: 'hyperrealism', label: 'Hyperrealism (Premium)', isPremium: true },
    { value: 'dieselpunk', label: 'Dieselpunk (Premium)', isPremium: true },
    { value: 'dark_fantasy', label: 'Dark Fantasy (Premium)', isPremium: true },
    { value: 'retro_futurism', label: 'Retro-Futurism (Premium)', isPremium: true },
    { value: 'rococo', label: 'Rococo (Premium)', isPremium: true },
    { value: 'pre_raphaelite', label: 'Pre-Raphaelite (Premium)', isPremium: true },
    { value: 'post_impressionism', label: 'Post-Impressionism (Premium)', isPremium: true },
    { value: 'constructivism', label: 'Constructivism (Premium)', isPremium: true },
    { value: 'medieval_manuscript', label: 'Medieval Manuscript (Premium)', isPremium: true },
    { value: 'dadaism', label: 'Dadaism (Premium)', isPremium: true },
    { value: 'neoclassicism', label: 'Neoclassicism (Premium)', isPremium: true },
    { value: 'romanticism', label: 'Romanticism (Premium)', isPremium: true },
    { value: 'kinetic_art', label: 'Kinetic Art (Premium)', isPremium: true },
    { value: 'op_art', label: 'Op Art (Premium)', isPremium: true },
    { value: 'biopunk', label: 'Biopunk (Premium)', isPremium: true },
    { value: 'solarpunk', label: 'Solarpunk (Premium)', isPremium: true },
    { value: 'cubism', label: 'Cubism (Premium)', isPremium: true },
    { value: 'expressionism', label: 'Expressionism (Premium)', isPremium: true },
    { value: 'fauvism', label: 'Fauvism (Premium)', isPremium: true },
    { value: 'graffiti', label: 'Graffiti (Premium)', isPremium: true },
    { value: 'pointillism', label: 'Pointillism (Premium)', isPremium: true },
    { value: 'watercolor', label: 'Watercolor (Premium)', isPremium: true },
    { value: 'sketch', label: 'Sketch (Premium)', isPremium: true },
    { value: 'charcoal', label: 'Charcoal (Premium)', isPremium: true },
    { value: 'pastel', label: 'Pastel (Premium)', isPremium: true },
    { value: 'collage', label: 'Collage (Premium)', isPremium: true },
    { value: 'manga', label: 'Manga (Premium)', isPremium: true },
    { value: 'comic_book', label: 'Comic Book (Premium)', isPremium: true },
    { value: 'doodle', label: 'Doodle (Premium)', isPremium: true },
    { value: 'geometric', label: 'Geometric (Premium)', isPremium: true },
    { value: 'psychedelic', label: 'Psychedelic (Premium)', isPremium: true },
    { value: 'low_poly', label: 'Low Poly (Premium)', isPremium: true },
    { value: 'etching', label: 'Etching (Premium)', isPremium: true },
    { value: 'trompe_loeil', label: 'Trompe-l\'œil (Premium)', isPremium: true },
    { value: 'fractals', label: 'Fractals (Premium)', isPremium: true },
    { value: 'hyperpop', label: 'Hyperpop (Premium)', isPremium: true },
    { value: 'suprematism', label: 'Suprematism (Premium)', isPremium: true },
    { value: 'ascii_art', label: 'ASCII art (Premium)', isPremium: true },
    
    { value: 'dreamcore', label: 'Dreamcore (Premium)', isPremium: true },
    { value: 'papercut', label: 'Papercut (Premium)', isPremium: true },
    { value: 'engraving', label: 'Engraving (Premium)', isPremium: true },
    { value: 'ink_wash', label: 'Ink Wash (Premium)', isPremium: true },
    { value: 'chalk', label: 'Chalk (Premium)', isPremium: true }
  
  ]
};

const CAMERA_ANGLES = {
  free: [
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'wide_angle', label: 'Wide Angle' },
    { value: 'close_up', label: 'Close Up' },
    { value: 'eye_level', label: 'Eye Level' },
    { value: 'low_angle', label: 'Low Angle' },
    { value: 'high_angle', label: 'High Angle' },
    { value: 'dutch_angle', label: 'Dutch Angle' },
    { value: 'over_the_shoulder', label: 'Over the Shoulder' },
    { value: 'birds_eye_view', label: "Bird's Eye View" },
    { value: 'worm_eye_view', label: "Worm's Eye View" }
  ],
  premium: [
    { value: 'fisheye', label: 'Fisheye (Premium)', isPremium: true },
    { value: 'tilt_shift', label: 'Tilt-shift (Premium)', isPremium: true },
    { value: 'macro', label: 'Macro (Premium)', isPremium: true },
    { value: 'panoramic', label: 'Panoramic View (Premium)', isPremium: true },
    { value: 'extreme_close_up', label: 'Extreme Close-Up (Premium)', isPremium: true },
    { value: 'drone', label: 'Drone View (Premium)', isPremium: true },
    { value: 'split_view', label: 'Split View (Premium)', isPremium: true },
    { value: 'orbital', label: 'Orbital Shot (Premium)', isPremium: true },
    { value: 'dolly_zoom', label: 'Dolly Zoom (Premium)', isPremium: true },
    { value: 'underwater', label: 'Underwater (Premium)', isPremium: true },
    { value: 'isometric', label: 'Isometric (Premium)', isPremium: true },
    { value: 'first_person', label: 'First Person POV (Premium)', isPremium: true },
    { value: 'symmetrical', label: 'Symmetrical (Premium)', isPremium: true },
    { value: 'spiral', label: 'Spiral Shot (Premium)', isPremium: true },
    { value: 'vertigo', label: 'Vertigo Effect (Premium)', isPremium: true }
  ]
};

const LIGHTING = {
  free: [
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'natural', label: 'Natural' },
    { value: 'studio', label: 'Studio' },
    { value: 'dramatic', label: 'Dramatic' },
    { value: 'backlight', label: 'Backlight' },
    { value: 'soft', label: 'Soft' },
    { value: 'hard', label: 'Hard' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'low_key', label: 'Low Key' },
    { value: 'high_key', label: 'High Key' }
  ],
  premium: [
    { value: 'golden_hour', label: 'Golden Hour (Premium)', isPremium: true },
    { value: 'neon', label: 'Neon Lighting (Premium)', isPremium: true },
    { value: 'volumetric', label: 'Volumetric Light (Premium)', isPremium: true },
    { value: 'silhouette', label: 'Silhouette Lighting (Premium)', isPremium: true },
    { value: 'moonlight', label: 'Moonlight (Premium)', isPremium: true },
    { value: 'bioluminescent', label: 'Bioluminescent (Premium)', isPremium: true },
    { value: 'chiaroscuro', label: 'Chiaroscuro (Premium)', isPremium: true },
    { value: 'rainbow', label: 'Rainbow Lighting (Premium)', isPremium: true },
    { value: 'northern_lights', label: 'Northern Lights (Premium)', isPremium: true },
    { value: 'laser', label: 'Laser Lighting (Premium)', isPremium: true },
    { value: 'underwater_caustics', label: 'Underwater Caustics (Premium)', isPremium: true },
    { value: 'fire_light', label: 'Fire Light (Premium)', isPremium: true },
    { value: 'crystal_refraction', label: 'Crystal Refraction (Premium)', isPremium: true },
    { value: 'star_field', label: 'Star Field (Premium)', isPremium: true },
    { value: 'lightning', label: 'Lightning Flash (Premium)', isPremium: true }
  ]
};

const PURPOSES = {
  free: {
    general: [
      { value: 'not_specified', label: 'Not Specified' },
      { value: 'illustration', label: 'Illustration' },
      { value: 'concept_art', label: 'Concept Art' },
      { value: 'character_illustration', label: 'Character Illustration' },
      { value: 'npc_portrait', label: 'NPC Portrait'},
      { value: 'miniature_design', label: 'Miniature Design'},
      
     
    ],
    commercial: [
      { value: 'stock_photo', label: 'Stock Photo' },
      { value: 'product_photo', label: 'Product Photo' },
      { value: 'packaging', label: 'Packaging Design'},
      { value: 'advertisement', label: 'Advertisement' },
      { value: 'logo', label: 'Logo' }
      
     
    ],
    photography: [
      { value: 'portrait', label: 'Portrait' },
      { value: 'food_photo', label: 'Food Photography' },
      { value: 'fashion_photo', label: 'Fashion Photography' },
      { value: 'street_photo', label: 'Street Photography' },
      { value: 'event_photo', label: 'Event Photography' },
      { value: 'nature_macro', label: 'Nature Macro' },
      { value: 'pet_portrait', label: 'Pet Portrait' },
    ],
    print: [
      { value: 'poster', label: 'Poster' },
      { value: 'book_cover', label: 'Book Cover' },
      { value: 'sticker_design', label: 'Sicker Design' },
      { value: 'holiday_card', label: 'Holiday Card' },
      { value: 'coloring_page', label: 'Coloring Page' },
     
    ],
    environment: [
      { value: 'landscape', label: 'Landscape' },
      { value: 'interior_design', label: 'Interior Design' },
      { value: 'cityscape', label: 'Cityscape' },
    ],
    technical: [
      { value: 'scientific_illustration', label: 'Scientific Illustration' },
      { value: 'wallpaper', label: 'Wallpaper' },
      { value: 'tutorial_illustration', label: 'Tutorial Illustration' }
    ]
  },

  
    premium: {
      gaming: [
        { value: 'game_asset', label: 'Game Asset (Premium)', isPremium: true },
        { value: 'game_asset_2d', label: 'Game Asset 2D (Premium)', isPremium: true },
        { value: 'game_icon', label: 'Game Icon (Premium)', isPremium: true },
        { value: 'game_ui', label: 'Game UI (Premium)', isPremium: true },
        { value: 'sprite_sheet', label: 'Sprite Sheet (Premium)', isPremium: true },
        { value: 'video_game_location', label: 'Video Game Location (Premium)', isPremium: true },
       


        { value: 'pixel_tile', label: 'Pixel Tiles (Premium)', isPremium: true },
          { value: 'isometric_map', label: 'Isometric Map (Premium)', isPremium: true },
        
        
        { value: 'dnd_top_down_map', label: 'D&D Top Down Map (Premium)', isPremium: true },
      
    
        { value: 'biome_design', label: 'Biome Design (Premium)', isPremium: true },
        { value: 'artifact_design', label: 'Artifact Design (Premium)', isPremium: true },
        { value: 'faction_banner', label: 'Faction Banner (Premium)', isPremium: true },
        { value: 'monster_evolution', label: 'Monster Evolution (Premium)', isPremium: true },
        { value: 'battle_scene', label: 'Battle Scene (Premium)', isPremium: true },
        { value: 'achievement_badge', label: 'Achievement Badge (Premium)', isPremium: true },
        { value: 'splash_screen', label: 'Splash Screen (Premium)', isPremium: true },
        { value: 'video_game_screenshot', label: 'Video Game Screenshot (Premium)', isPremium: true }
      ],
      tabletop: [
        { value: 'board_game_art', label: 'Board Game Art (Premium)', isPremium: true },
        { value: 'token_design', label: 'Game Token (Premium)', isPremium: true },
      
        { value: 'card_art', label: 'Trading Card Art (Premium)', isPremium: true },
        { value: 'tarot_card', label: 'Tarot Card (Premium)', isPremium: true },
        // Added missing values:
        { value: 'diorama', label: 'Diorama (Premium)', isPremium: true }
      ],
      design: [
        { value: '3d_render', label: '3D Model (Premium)', isPremium: true },
        { value: 'character_sheet', label: 'Character Sheet (Premium)', isPremium: true },
        { value: 'character_expression_sheet', label: 'Character Expression Sheet (Premium)', isPremium: true },
        { value: 'fashion_technical_flat', label: 'Fashion Technical Flat (Premium)', isPremium: true },
        { value: 'toy_design', label: 'Toy Design (Premium)', isPremium: true },
        { value: 'figurine_design', label: 'Figurine Design (Premium)', isPremium: true },
        { value: 'jewelry_design', label: 'Jewelry Design (Premium)', isPremium: true },
        { value: 'prop_design', label: 'Prop Design (Premium)', isPremium: true },
        { value: 'weapon_design', label: 'Weapon Design (Premium)', isPremium: true },
        { value: 'creature_design', label: 'Creature Design (Premium)', isPremium: true },
        { value: 'patch_design', label: 'Patch Design (Premium)', isPremium: true  },
        { value: 'robot_design', label: 'Robot Design (Premium)', isPremium: true },
        { value: 'vehicle_design', label: 'Vehicle Design (Premium)', isPremium: true },
        { value: 'vehicle_interior', label: 'Vehicle Interior (Premium)', isPremium: true },
        { value: 'mechanism_design', label: 'Mechanism Design (Premium)', isPremium: true },
        { value: 'trophy_design', label: 'Trophy Design (Premium)', isPremium: true },
        { value: 'tattoo_design', label: 'Tattoo Design (Premium)', isPremium: true },
        { value: 'costume_design', label: 'Costume Design (Premium)', isPremium: true },
        { value: 'event_invitation', label: 'Event Invitation (Premium)', isPremium: true  },
        { value: 'sculpture_concept', label: 'Sculpture Concept (Premium)', isPremium: true },
        { value: 'furniture_design', label: 'Furniture Design (Premium)', isPremium: true },
        { value: 'personal_avatar', label: 'Personal Avatar (Premium)', isPremium: true },
        { value: 'mascot_character', label: 'Mascot Character (Premium)', isPremium: true },
        { value: 'cake_design', label: 'Cake Design (Premium)', isPremium: true},
        { value: 'vehicle_turnaround', label: 'Vehicle Turnaround (Premium)', isPremium: true }
      ],
      visualization: [
        { value: 'architectural', label: 'Architectural Visualization (Premium)', isPremium: true },
        { value: 'matte_painting', label: 'Matte Painting (Premium)', isPremium: true },
        { value: 'architecture_blueprint', label: 'Architecture Blueprint (Premium)', isPremium: true },
      
        { value: 'fantasy_map', label: 'Fantasy Map (Premium)', isPremium: true },
        { value: 'vfx_concept', label: 'VFX Concept (Premium)', isPremium: true }
      ],
      publishing: [
        { value: 'book_illustration', label: 'Book Illustration (Premium)', isPremium: true },
        { value: 'childrens_illustration', label: "Children's Illustration (Premium)", isPremium: true },
        { value: 'comic_panel', label: 'Comic Panel (Premium)', isPremium: true },
        { value: 'storyboard', label: 'Storyboard (Premium)', isPremium: true },
        { value: 'movie_poster', label: 'Movie Poster (Premium)', isPremium: true },
        { value: 'magazine_cover', label: 'Magazine Cover (Premium)', isPremium: true },
        { value: 'album_cover', label: 'Album Cover (Premium)', isPremium: true },
        { value: 'sports_card', label: 'Sports Card (Premium)', isPremium: true }
      ],
      patterns: [
        { value: 'textile', label: 'Textile Pattern (Premium)', isPremium: true },
        { value: 'knitted_design', label: 'Knitted Design (Premium)', isPremium: true }
      ],
      marketing: [
       
        { value: 'brochure_design', label: 'Brochure Design (Premium)', isPremium: true },
        { value: 'icon_set', label: 'Icon Set (Premium)', isPremium: true },
        { value: 'ui_element', label: 'UI Element (Premium)', isPremium: true },
        { value: 'infographic', label: 'Infographic (Premium)', isPremium: true },
        { value: 'social_media', label: 'Social Media (Premium)', isPremium: true },
        { value: 'billboard_ad', label: 'Billboard Ad (Premium)', isPremium: true },
        { value: 'website_design', label: 'Website Design (Premium)', isPremium: true },
        { value: 'visit_card', label: 'Visit Card (Premium)', isPremium: true },
        { value: 'flyer_design', label: 'Flyer Design (Premium)', isPremium: true },
        { value: 'youtube_thumbnail', label: 'YouTube Thumbnail (Premium)', isPremium: true },
        { value: 'podcast_cover', label: 'Podcast Cover (Premium)', isPremium: true },
        { value: 'vector_icon_single', label: 'Vector Icon (Premium)', isPremium: true },
        { value: 'tshirt_design', label: 'T-shirt Design (Premium)', isPremium: true }
        
      ],
      artistic: [
        { value: 'urban_sketch', label: 'Urban Sketch (Premium)', isPremium: true },
        { value: 'botanical_study', label: 'Botanical Study (Premium)', isPremium: true },
        { value: 'graffiti_art', label: 'Graffiti Art (Premium)', isPremium: true },
        
        { value: 'fine_art_painting', label: 'Fine Art Painting (Premium)', isPremium: true }
      ],
      streaming: [
        { value: 'discord_banner', label: 'Discord Banner (Premium)', isPremium: true },
        { value: 'twitch_overlay', label: 'Twitch Overlay (Premium)', isPremium: true },
        { value: 'emote', label: 'Emote (Premium)', isPremium: true },
        { value: 'emoji', label: 'Emoji (Premium)', isPremium: true }
      ],
      educational: [
        { value: 'language_flashcard', label: 'Language Flashcard (Premium)', isPremium: true },
        { value: 'microscopy', label: 'Microscopy (Premium)', isPremium: true },
        { value: 'astronomical_illustration', label: 'Astronomical Illustration (Premium)', isPremium: true },
        { value: 'micro_world', label: 'Micro World (Premium)', isPremium: true }
      ]
     
    }
  };


const MODELS = {
  free: [
    { value: 'not_specified', label: 'Not Specified' },
    { value: 'midjourney', label: 'Midjourney' },
    { value: 'flux', label: 'Flux' },
    
    { value: 'dalle', label: 'DALL·E' },
  
    { value: 'stable_diffusion', label: 'Stable Diffusion' }
  ],
  premium: []
};

const TOOLTIPS = {
  style: 'Choose an artistic style to influence the visual appearance of your image. Each style will give your image a distinct look and feel.',
  cameraAngle: 'Select the perspective from which your image will be viewed. Different angles can create various emotional impacts and visual interests.',
  lighting: 'Choose how your image should be lit. Different lighting options can dramatically change the mood and atmosphere of your image.',
  purpose: 'Select the intended use of your image. This will optimize the prompt for specific formats and requirements.',
  model: 'Choose which AI image generation model to optimize your prompt for. Different models have different strengths and capabilities.'
};

// Export this function so it can be used in other components
export const getOptionsForType = (type) => {
  const optionsMap = {
    style: STYLES,
    cameraAngle: CAMERA_ANGLES,
    lighting: LIGHTING,
    purpose: PURPOSES,
    model: MODELS
  };

  const options = optionsMap[type] || { free: [], premium: [] };

  // Special handling for purposes which are categorized
  if (type === 'purpose') {
    return options; // Return the categorized structure directly
  }

  // For other types that use the flat array structure
  return {
    free: Array.isArray(options.free) ? options.free : [],
    premium: Array.isArray(options.premium) ? options.premium : []
  };
};




export const Select = ({
  label,
  type = 'style',
  value,
  onChange,
  isPremiumUser = false,
  isUltimateUser = false,
  className = '',
  inSidebar = false,  // Add this prop with default value false
  customTooltip = null
}) => {
  // Ultimate users should have access to all premium features
  const hasAccessToPremium = isPremiumUser || isUltimateUser;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const options = getOptionsForType(type);
  
  // Find selected option based on whether it's a purpose or other type
  const selectedOption = type === 'purpose'
    ? Object.values(options.free)
        .flat()
        .concat(Object.values(options.premium).flat())
        .find(opt => opt.value === value) || options.free.general[0]
    : [...(Array.isArray(options.free) ? options.free : []), 
        ...(hasAccessToPremium && Array.isArray(options.premium) ? options.premium : [])]
        .find(opt => opt.value === value) || (Array.isArray(options.free) ? options.free[0] : options.free.general[0]);

  // Use custom tooltip if provided, otherwise use the default tooltip for the type
  const tooltip = customTooltip || TOOLTIPS[type];
  const showFullPreview = ['style', 'cameraAngle', 'lighting', 'purpose'].includes(type);
  const isModelType = type === 'model';
  const isNotSpecified = value === 'not_specified';

  const handleClick = () => {
    setIsDialogOpen(true);
  };
  


  return (
    <div className={className}>
      <motion.div
        className="w-full group cursor-pointer"
        whileHover="hover"
        variants={{
          hover: { y: 0 }
        }}
        data-preload-type={`${type}-dialog`}
      >
        <div className="flex items-center justify-between mb-2">
<div className="flex items-center gap-1.5"> 
  <span className="text-sm font-medium text-[var(--textBrighter)]">
    {label}
  </span>
  {tooltip && (
    <Tooltip content={tooltip}>
      <div className="w-3 h-3 flex items-center justify-center translate-y-[0.5px] cursor-help text-[var(--textSecondary)] hover:text-[var(--text)] transition-colors">
        <HelpCircle className="w-3.5 h-3.5" />
      </div>
    </Tooltip>
  )}
</div>
  <motion.div
    variants={{
      hover: { x: 5, opacity: 1 },
      initial: { x: 0, opacity: 0 }
    }}
    initial="initial"
    className="flex items-center gap-1 text-sm text-emerald-400"
  >
    <span>Change</span>
    <motion.div
      variants={{
        hover: { x: [0, 5, 0], transition: { repeat: Infinity, duration: 1 } }
      }}
    >
      <ChevronRight className="w-4 h-4" />
    </motion.div>
  </motion.div>
</div>

        {isNotSpecified ? (
          // Not Specified compact view
          <div 
            className="w-full px-3 py-2 text-left bg-[var(--dropdownBackground)]/60 rounded-lg border border-zinc-600 cursor-pointer"
            onClick={handleClick}
          >
            <span className="text-xs text-[var(--textSecondary)]">
              Not Specified
            </span>
          </div>
        ) : showFullPreview ? (
          <motion.div
            variants={{
              hover: { opacity: 1 }
            }}
            className="w-full h-full"
          >
            <PreviewCard
              label={selectedOption.label}
              value={selectedOption.value}
              type={type}
              isSelected={true}
              isPremium={selectedOption.isPremium}
              inSidebar={inSidebar}  // Pass the inSidebar prop
              onClick={handleClick} // Add onClick handler to open dialog
            />
          </motion.div>
        ) : isModelType ? (
          <motion.div
            variants={{
              hover: { opacity: 1 }
            }}
          >
            <ModelPreview
              label={selectedOption.label}
              value={selectedOption.value}
              isSelected={true}
              onClick={handleClick} // Add onClick handler to open dialog
            />
          </motion.div>
        ) : (
          <motion.div
            variants={{
              hover: { scale: 1.02 },
              tap: { scale: 0.98 }
            }}
            className="w-full px-4 py-3 text-left bg-[var(--dropdownBackground)] border border-[var(--border)] rounded-lg"
          >
            <span className="text-sm text-[var--text]">
              {selectedOption.value === 'realism' ? 'Photorealism' : selectedOption.label.replace(' (Premium)', '').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </motion.div>
        )}
      </motion.div>

      <SelectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        label={`Select ${label}`}
        type={type}
        value={value}
        onChange={onChange}
        isPremiumUser={isPremiumUser}
        isUltimateUser={isUltimateUser}
        options={options}
        tooltip={tooltip}
        customTooltip={customTooltip}
      />
    </div>
  );
};