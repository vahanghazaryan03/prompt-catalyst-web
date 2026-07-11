// src/utils/animationPresets.js

// Organized animation presets by category
export const ANIMATION_PRESETS = [
    {
      id: "camera",
      name: "Camera",
      description: "Basic camera animation effects",
      icon: "Camera",
      presets: [
        { id: 'zoom', name: 'Zoom', description: 'Smooth zoom in/out effect' },
        { id: 'pan', name: 'Pan', description: 'Smooth horizontal movement' },
        { id: 'orbit', name: 'Orbit', description: 'Camera circles around the subject' },
        { id: 'dolly', name: 'Dolly', description: 'Camera moves forward/backward' },
        { id: 'tilt', name: 'Tilt', description: 'Camera tilts up/down' },
        { id: 'track', name: 'Track', description: 'Camera follows subject along path' }
      ]
    },
    {
      id: "character",
      name: "Character Animation",
      description: "Bring characters to life",
      icon: "User",
      presets: [
        { id: 'walk', name: 'Walk', description: 'Character walking animation' },
        { id: 'talk', name: 'Talk', description: 'Character talking with lip movement' },
        { id: 'dance', name: 'Dance', description: 'Character dancing animation' },
        { id: 'jump', name: 'Jump', description: 'Character jumping animation' },
        { id: 'wave', name: 'Wave', description: 'Character waving animation' },
        { id: 'blink', name: 'Blink', description: 'Character blinking eyes animation' },
        { id: 'smile', name: 'Smile', description: 'Character smiling animation' },
        { id: 'nod', name: 'Nod', description: 'Character nodding head animation' }
      ]
    },
    /* Temporarily removed Special Effects
    {
      id: "effects",
      name: "Special Effects",
      description: "Add dramatic visual effects",
      icon: "Sparkles",
      presets: [
        { id: 'explode', name: 'Explode', description: 'Explosion effect' },
        { id: 'squeeze', name: 'Squeeze', description: 'Compression effect' },
        { id: 'fade', name: 'Fade', description: 'Fade in/out effect' },
        { id: 'blur', name: 'Blur', description: 'Gradual blur effect' },
        { id: 'glitch', name: 'Glitch', description: 'Digital glitch effect' },
        { id: 'ripple', name: 'Ripple', description: 'Water ripple effect' },
        { id: 'shatter', name: 'Shatter', description: 'Breaking glass effect' },
        { id: 'glow', name: 'Glow', description: 'Pulsing glow effect' }
      ]
    },
    */
   /*
    {
      id: "transitions",
      name: "Transitions",
      description: "Smooth scene transitions",
      icon: "Move",
      presets: [
        { id: 'dissolve', name: 'Dissolve', description: 'Smooth dissolve transition' },
        { id: 'wipe', name: 'Wipe', description: 'Wipe transition effect' },
        { id: 'morph', name: 'Morph', description: 'Morphing transition' },
        { id: 'flip', name: 'Flip', description: 'Page flip transition' },
        { id: 'pixel', name: 'Pixelate', description: 'Pixelation transition' }
      ]
    },
    */
    {
      id: "environmental",
      name: "Environmental",
      description: "Add movement to surroundings",
      icon: "Cloud",
      presets: [
        { id: 'rain', name: 'Rain', description: 'Rainfall effect' },
        { id: 'snow', name: 'Snow', description: 'Snowfall effect' },
        { id: 'wind', name: 'Wind', description: 'Wind blowing effect' },
        { id: 'fog', name: 'Fog', description: 'Moving fog/mist effect' },
        { id: 'clouds', name: 'Clouds', description: 'Moving clouds effect' },
        { id: 'leaves', name: 'Leaves', description: 'Falling leaves effect' }
      ]
    },
    /* Temporarily removed Stylistic Animations
    {
      id: "stylistic",
      name: "Stylistic Animations",
      description: "Artistic style animations",
      icon: "Palette",
      presets: [
        { id: 'watercolor', name: 'Watercolor', description: 'Flowing watercolor animation' },
        { id: 'sketch', name: 'Sketch', description: 'Hand-drawn sketch animation' },
        { id: 'cartoon', name: 'Cartoon', description: 'Cartoon animation style' },
        { id: 'pixel', name: 'Pixel Art', description: 'Retro pixel animation' },
        { id: 'oil', name: 'Oil Paint', description: 'Moving oil painting effect' }
      ]
    }
    */
  ];
  
  // Helper function to get all presets as a flat array
  export const getAllPresets = () => {
    return ANIMATION_PRESETS.flatMap(category => 
      category.presets.map(preset => ({
        ...preset,
        categoryId: category.id,
        categoryName: category.name
      }))
    );
  };
  
  // Find a preset by ID across all categories
  export const findPresetById = (presetId, categoryId = null) => {
    if (categoryId) {
      // If we know the category, look only there
      const category = ANIMATION_PRESETS.find(c => c.id === categoryId);
      if (category) {
        const preset = category.presets.find(p => p.id === presetId);
        if (preset) {
          return {
            ...preset,
            categoryId,
            categoryName: category.name
          };
        }
      }
    } 
    
    // Otherwise search all categories
    for (const category of ANIMATION_PRESETS) {
      const preset = category.presets.find(p => p.id === presetId);
      if (preset) {
        return {
          ...preset,
          categoryId: category.id,
          categoryName: category.name
        };
      }
    }
    
    return null;
  };