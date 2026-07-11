// dungeons-and-dragons.js - Tutorial for creating D&D assets

const dungeonsAndDragonsTutorial = {
  id: 5, // Incrementing from the highest existing ID
  title: "Creating Epic D&D Assets with Prompt Catalyst",
  slug: "creating-dnd-assets-with-prompt-catalyst",
  excerpt: "Master the art of creating stunning D&D campaign assets including character sheets, battle maps, monster portraits, magical items, and immersive environments using AI-powered tools.",
  author: "Prompt Catalyst Team",
  date: "July 2, 2025",
  readTime: "10 min read",
  coverImage: "/images/tutorials/dnd-assets-cover.png",
  heroImage: {
    url: "/images/tutorials/dnd-assets-hero.png",
    alt: "A collection of D&D assets including character portraits, dungeon maps, and magical items",
    attribution: "Created with Prompt Catalyst"
  },
  content: `
# Creating Epic D&D Assets with Prompt Catalyst

Every Dungeon Master dreams of bringing their campaign world to life with stunning visuals. Whether you're running a homebrew campaign or breathing new life into classic modules, <a href="https://promptcatalyst.ai" style="color: lime;">Prompt Catalyst</a> helps you create professional-quality D&D assets in minutes instead of hours. This comprehensive guide will show you how to generate everything from detailed character portraits to sprawling dungeon maps, all tailored to your unique campaign needs.

<div id="why-ai-for-dnd"></div>

## Why Use AI for D&D Campaign Assets?

Traditional D&D asset creation often involves:
- Expensive commission fees for custom artwork
- Hours searching for "close enough" images online
- Limited options for specific campaign themes
- Inconsistent art styles across different assets

<a href="https://promptcatalyst.ai" style="color: lime;">Prompt Catalyst</a> transforms this process by offering:

- **Instant Visualization**: Create assets on-demand during prep or even mid-session
- **Perfect Customization**: Generate exactly what you envision, not what's available
- **Consistent Art Style**: Maintain visual cohesion across your entire campaign
- **Unlimited Iterations**: Experiment with different versions until it's perfect
- **Budget-Friendly**: Create professional assets without breaking the bank

<div class="tutorial-video-container" style="max-width: 600px; margin: 1.5rem 0;">
  <iframe src="https://www.redditmedia.com/r/dndai/comments/1ljlx6b/retro_dd_game_concepts_prompts_included/?ref_source=embed&amp;ref=share&amp;embed=true&amp;theme=dark" 
    sandbox="allow-scripts allow-same-origin allow-popups" 
    style="border: none;" 
    scrolling="no" 
    width="100%" 
    height="900px">
  </iframe>
</div>

<div id="essential-dnd-assets"></div>

## Essential D&D Asset Types

<div class="asset-type-list">
  <div class="asset-type-item">
    <div class="asset-content">
      <h3>Character Assets</h3>
      <ul class="asset-list">
        <li>Player character portraits</li>
        <li>Multi-view character sheets</li>
        <li>NPC portraits and tokens</li>
        <li>Class-specific illustrations</li>
        <li>Character evolution visuals</li>
      </ul>
    </div>
  </div>
  
  <div class="asset-type-item">
    <div class="asset-content">
      <h3>Battle & Exploration Maps</h3>
      <ul class="asset-list">
        <li>Grid-based battle maps</li>
        <li>Isometric dungeon layouts</li>
        <li>World and regional maps</li>
        <li>City and town layouts</li>
        <li>Wilderness encounters</li>
      </ul>
    </div>
  </div>
  
  <div class="asset-type-item">
    <div class="asset-content">
      <h3>Monsters & Creatures</h3>
      <ul class="asset-list">
        <li>Custom monster designs</li>
        <li>Beast companions</li>
        <li>Legendary creature portraits</li>
        <li>Monster variant illustrations</li>
        <li>Swarm and group shots</li>
      </ul>
    </div>
  </div>
  
  <div class="asset-type-item">
    <div class="asset-content">
      <h3>Items & Artifacts</h3>
      <ul class="asset-list">
        <li>Magical weapons</li>
        <li>Legendary artifacts</li>
        <li>Potion collections</li>
        <li>Spell components</li>
        <li>Treasure hoards</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .asset-type-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .asset-type-item {
    display: flex;
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s;
  }
  
  .asset-type-item:hover {
    transform: translateY(-3px);
  }
  
  .asset-content {
    flex: 1;
    padding: 1.5rem;
  }
  
  .asset-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--primary);
  }
  
  .asset-list {
    list-style-type: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
  }
  
  .asset-list li {
    padding-left: 1.5rem;
    position: relative;
    margin-bottom: 0.5rem;
    color: var(--text);
    flex: 0 0 45%;
  }
  
  .asset-list li:before {
    content: '🎲';
    position: absolute;
    left: 0;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    .asset-type-item {
      flex-direction: column;
    }
    
    .asset-list li {
      flex: 0 0 100%;
    }
  }
</style>

<div id="workflow-overview"></div>

## The D&D Asset Creation Workflow

Creating D&D assets with Prompt Catalyst follows a three-phase approach:

1. **Craft Your Vision** - Use the Prompt Lab to engineer detailed, D&D-specific prompts
2. **Generate Your Assets** - Create high-quality images tailored to your campaign
3. **Enhance with Animation** - Bring key scenes and moments to life (optional)

Let's explore each phase in detail.

<div id="phase-1-crafting"></div>

## Phase 1: Crafting D&D-Specific Prompts

<div class="tutorial-image-container" style="width: 100% !important;">
  <img src="/images/tutorials/dnd-prompt-lab.png" alt="Prompt Lab configured for D&D character creation" />
</div>

## Essential Prompt Settings for D&D

Start in the **Prompt Lab** tab and configure these key settings:

## Purpose Selection
Choose from D&D-optimized purposes:
- **Character Sheet** - Multi-view character references
- **NPC Portrait** - Detailed face portraits for important NPCs
- **DnD Top-Down Map** - Grid-based battle maps
- **Isometric Map** - 3D-style dungeon layouts
- **Concept Art** - Locations and environments
- **Figurine Design** - Miniature-style character art

## Style Considerations
Match your campaign's tone:
- **Fantasy** - Classic D&D aesthetic
- **Dark Fantasy** - For grimdark campaigns
- **Hand-Drawn** - Vintage module feel
- **Photorealism** - Immersive, cinematic campaigns
- **Cartoon** - Light-hearted, family-friendly games

### D&D Prompt Engineering Principles

<div class="tip-box" style="background: var(--card); border: 2px solid var(--primary); padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
  <h4 style="color: var(--primary); margin-bottom: 0.5rem;">🎯 Pro Tip</h4>
  <p>Include these elements in your D&D prompts:</p>
  <ul style="margin-top: 0.5rem;">
    <li>• <strong>Race and Class</strong> - Core identity markers</li>
    <li>• <strong>Equipment Details</strong> - Weapons, armor, magical items</li>
    <li>• <strong>Distinctive Features</strong> - Scars, tattoos, unique traits</li>
    <li>• <strong>Campaign Tone</strong> - Dark, heroic, whimsical, etc.</li>
    <li>• <strong>Cultural Elements</strong> - Regional clothing, symbols</li>
  </ul>
</div>

### Character Creation Prompts

For compelling character assets, structure your prompts like this:

**Player Characters:**
- Start with: "[Race] [Class], [age descriptor], [key personality trait]"
- Add: Physical details, equipment, pose/expression
- Include: Campaign-specific elements (guild symbols, regional styles)

**Example Input:** "Half-elf ranger, weathered, protective of nature, leather armor"
<div class="tutorial-image-container" style="width: 100% !important;">
  <img src="/images/tutorials/elf-example.png" alt="D&D dungeon map with grid overlay" />
</div>

**NPCs:**
- Focus on: Role in story, emotional state, social status
- Emphasize: Memorable features that players will recognize
- Consider: How they'll appear in different contexts

**Example Input:** "Dwarf blacksmith, soot-covered, proud craftsman, massive forge hammer"

<div class="tutorial-image-container" style="width: 100% !important;">
  <img src="/images/tutorials/dwarf-example.png" alt="D&D dungeon map with grid overlay" />
</div>

### Map and Environment Prompts

<div class="tutorial-image-container" style="width: 100% !important;">
  <img src="/images/tutorials/dnd-map-example.png" alt="D&D dungeon map with grid overlay" />
</div>

For battle maps and environments:

**Dungeon Maps:**
- Specify: Room purposes, trap locations, architectural style
- Include: Scale references, lighting sources, environmental hazards
- Add: "clear grid overlay" for Virtual Table Top (VTT) compatibility

**Example Input:** "Ancient dwarven fortress, trapped hallways, throne room, treasure vault, underground river"

**Overworld Locations:**
- Describe: Terrain features, weather conditions, time of day
- Include: Narrative elements (ancient ruins, magical phenomena)
- Consider: Multiple encounter areas within one map

**Example Input:** "Misty forest clearing, ancient stone circle, moonlight, fey crossing"

<div id="phase-2-generating"></div>

## Phase 2: Generating Your D&D Assets

<div class="tutorial-image-container" style="width: 100% !important;">
  <img src="/images/tutorials/dnd-generate-interface.png" alt="Generate tab showing D&D asset creation" />
</div>

### Model Selection for D&D Content

Different models excel at different D&D asset types:

**For Character Art:**
- **Flux Dev** - Excellent for stylized fantasy characters
- **Juggernaut Flux Pro** - Best for detailed, realistic portraits
- **HiDream** - Great for anime-inspired campaign aesthetics

**For Maps:**
- **Flux Schnell** - Quick iterations for dungeon layouts
- **Flux Dev** - Detailed architectural elements
- **External tools** like Midjourney with parameters "--style raw --v 7"

### Optimal Settings by Asset Type

<div class="settings-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
  <div class="setting-card" style="background: var(--card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border);">
    <h4 style="color: var(--primary); margin-bottom: 1rem;">Character Portraits</h4>
    <ul style="list-style: none; padding: 0;">
      <li>📐 Aspect Ratio: 3:4 (Portrait)</li>
      <li>🎨 Models: Juggernaut, Flux Dev</li>
      <li>🔢 Batch: 2-4 variations</li>
      <li>💡 Tip: Generate multiple expressions</li>
    </ul>
  </div>
  
  <div class="setting-card" style="background: var(--card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border);">
    <h4 style="color: var(--primary); margin-bottom: 1rem;">Battle Maps</h4>
    <ul style="list-style: none; padding: 0;">
      <li>📐 Aspect Ratio: 1:1 (Square)</li>
      <li>🎨 Models: Flux Dev, Flux Schnell</li>
    </ul>
  </div>
  
  <div class="setting-card" style="background: var(--card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border);">
    <h4 style="color: var(--primary); margin-bottom: 1rem;">Item Illustrations</h4>
    <ul style="list-style: none; padding: 0;">
      <li>📐 Aspect Ratio: 1:1 (Square)</li>
      <li>🎨 Models: Any (all work well)</li>
      <li>🔢 Style: Artifact Design purpose</li>
      <li>💡 Tip: White background for handouts</li>
    </ul>
  </div>
</div>

### Batch Generation Strategy for Campaigns

1. **Create Campaign Style Guide**
   - Generate a hero NPC first to establish visual style
   - Use their prompt as a template for consistency
   - Save successful prompts to collections

2. **Build Asset Libraries**
   - Generate batches of similar assets (e.g., all tavern patrons)
   - Create variations of key items (different enchantment states)
   - Develop modular map sections for flexible encounters

3. **Version Control**
   - Generate progression images (character at different levels)
   - Create seasonal variants of locations
   - Develop "before and after" versions for story events

<div id="phase-3-animation"></div>

## Phase 3: Bringing Your Campaign to Life with Animation

<div class="tutorial-image-container" style="width: 100% !important;">
  <img src="/images/tutorials/dnd-animate-example.png" alt="D&D scene being animated" />
</div>

While static images serve most D&D needs, animation can create memorable campaign moments:

### When to Animate D&D Assets

**Epic Moments:**
- Boss introductions
- Magical transformations
- Environmental changes (castle crumbling, portal opening)
- Divine interventions

**Atmospheric Elements:**
- Tavern scenes with flickering firelight
- Dungeon corridors with moving shadows
- Mystical forests with swaying trees
- Dragon lairs with smoke effects

### Animation Techniques for D&D

1. **Character Reveals**
   - Use "Zoom" to focus from full body to intense expression
   - Apply "Orbit" to show all angles of a detailed miniature

2. **Environmental Storytelling**
   - "Pan" across battle maps to reveal the full scene
   - Use atmospheric presets for mood enhancement
   - Apply subtle movements to bring locations to life

3. **Magic and Effects**
   - Animate spell casting with energy effects
   - Show magical items activating
   - Demonstrate trap mechanisms in action

<div class="tutorial-video-container" style="max-width: 600px; margin: 1.5rem 0;">
  <iframe src="https://v3.fal.media/files/monkey/gBxDa9v3Y6-lstvEEQzLY_video.mp4" 
    sandbox="allow-scripts allow-same-origin allow-popups" 
    style="border: none;" 
    scrolling="no" 
    width="100%" 
    height="338px">
  </iframe>
</div>
<!--
 <div id="practical-examples"></div> 

 ## Practical Campaign Examples

### Example 1: The Tavern Encounter Kit

<div class="tutorial-image-container">
  <img src="/images/tutorials/dnd-tavern-kit.jpg" alt="Collection of tavern-themed D&D assets" />
  <div class="image-caption">
    <h4>Complete Tavern Asset Set</h4>
    <p>Created with prompts focusing on "warm tavern interior," "diverse fantasy patrons," and "medieval inn atmosphere"</p>
  </div>
</div>


### Example 2: Dungeon Delve Package

<div class="tutorial-image-container">
  <img src="/images/tutorials/dnd-dungeon-package.png" alt="Comprehensive dungeon asset collection" />
  <div class="image-caption">
    <h4>Multi-Level Dungeon Complex</h4>
    <p>Complete with traps, treasures, and terrible monsters</p>
  </div>
</div>

**Asset List:**
1. Three-level dungeon map set
2. Trap mechanism illustrations
3. Monster portraits (custom variants)
4. Treasure hoard visualization
5. Ancient artifact with lore implications

**Prompt Example for Trap Illustration:**
"Elaborate pressure plate trap mechanism, side cutaway view, showing spears emerging from walls, ancient dwarven engineering, detailed mechanical components, weathered stone and metal, fantasy dungeon trap design, technical illustration style"

### Example 3: Epic Boss Battle Setup

<div class="tutorial-image-container">
  <img src="/images/tutorials/dnd-boss-battle.png" alt="Dragon boss battle scene" />
  <div class="image-caption">
    <h4>Ancient Red Dragon Encounter</h4>
    <p>Complete environmental setup for a climactic battle</p>
  </div>
</div>

**Creation Process:**
1. Generate dragon portrait focusing on intimidating features
2. Create lair map with environmental hazards
3. Design treasure hoard elements
4. Animate dramatic entrance sequence
5. Prepare multiple dragon poses for different combat phases
-->
<div id="advanced-techniques"></div>

## Advanced DM Techniques

### Creating Consistent NPCs

<div class="tip-box" style="background: var(--card); border: 2px solid var(--primary); padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
  <h4 style="color: var(--primary); margin-bottom: 0.5rem;">🎭 Consistency Secret</h4>
  <p>Create a "style DNA" prompt for your campaign:</p>
  <code style="display: block; background: var(--background); padding: 1rem; border-radius: 4px; margin-top: 0.5rem;">
    "medieval fantasy art style, oil painting technique, dramatic lighting, muted color palette with gold accents, weathered textures, heroic proportions"
  </code>
  <p style="margin-top: 0.5rem;">Add this to every prompt for visual consistency!</p>
</div>

### Rapid Session Prep Workflow

1. **Pre-Session (30 minutes before game):**
   - Generate 3-5 NPC portraits for potential encounters
   - Create 2 battle maps for possible combat scenarios
   - Prepare 1 "wow factor" animated scene

2. **Mid-Session Emergency Assets:**
   - Keep Prompt Catalyst open in another tab
   - Use "Fast Mode" for quick NPC generation
   - Have generic prompts saved for common needs

3. **Post-Session Enhancement:**
   - Generate detailed versions of improvised NPCs
   - Create "memory" images of epic moments
   - Build next session's assets based on player choices

### Campaign-Specific Styling

<div class="campaign-styles" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">
  <div style="background: var(--card); padding: 1rem; border-radius: 8px;">
    <h5 style="color: var(--primary);">🌅 High Fantasy</h5>
    <p style="font-size: 0.9rem;">Add: "bright colors, heroic poses, gleaming armor, majestic, hopeful atmosphere"</p>
  </div>
  
  <div style="background: var(--card); padding: 1rem; border-radius: 8px;">
    <h5 style="color: var(--primary);">🌑 Grimdark</h5>
    <p style="font-size: 0.9rem;">Add: "dark shadows, muted colors, weathered equipment, grim expressions, gothic elements"</p>
  </div>
  
  <div style="background: var(--card); padding: 1rem; border-radius: 8px;">
    <h5 style="color: var(--primary);">⚙️ Steampunk</h5>
    <p style="font-size: 0.9rem;">Add: "brass gears, Victorian fashion, steam effects, mechanical details, goggles"</p>
  </div>
  
  <div style="background: var(--card); padding: 1rem; border-radius: 8px;">
    <h5 style="color: var(--primary);">🏛️ Mythic</h5>
    <p style="font-size: 0.9rem;">Add: "classical architecture, divine light, marble textures, legendary scale, god-like presence"</p>
  </div>
</div>
<!--
<div id="vtt-optimization"></div>

## Optimizing for Virtual Table Tops

### Token Creation

1. **Portrait to Token Workflow:**
   - Generate character portrait
   - Add "circular border, flat background" to prompt
   - Use 1:1 aspect ratio

2. **Map Preparation:**
   - Create day/night versions
   - Design with 5-foot square scaling in mind
-->
<div id="troubleshooting"></div>

## Troubleshooting Common Issues

### "My Characters Don't Look Fantasy Enough"

**Solutions:**
- Add period-specific descriptors: "medieval," "renaissance," "dark ages"
- Include fantasy elements explicitly: "pointed ears," "glowing eyes," "mystical aura"
- Reference D&D directly: "dungeons and dragons style," "fantasy RPG character"

### "Maps Don't Work Well for Combat"

**Solutions:**
- Always specify "top-down view" or "bird's eye view"
- Include "clear grid," "battle map," "5-foot squares"
- Add "high contrast" for better visibility
- Use the Edit tab to edit your images using prompts

### "Inconsistent Art Style Across Assets"

**Solutions:**
- Create a style reference document
- Use same model for related assets
- Include consistent style keywords
- Generate in batches during same session

<div id="resource-showcase"></div>

## Campaign Asset Showcase

<div class="showcase-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0;">
  <div class="tutorial-image-container">
    <img src="/images/tutorials/dnd-party-portrait.png" alt="D&D party group shot" />
    <div class="image-caption">
      <h4>Adventuring Party Portrait</h4>
      <p>"An epic D&D adventuring party portrait on a cliff’s edge overlooking a stormy sea, with a fierce tiefling warlock summoning dark energy, a noble human knight in shining armor holding a flag, a cunning gnome artificer tinkering with a mechanical crossbow, a graceful druid in leaf-patterned robes with animal companions, and a mysterious shadowy figure cloaked in darkness, framed by thunderous clouds and crashing waves."</p>
    </div>
  </div>
  
  <div class="tutorial-image-container">
    <img src="/images/tutorials/dnd-magic-item.png" alt="Legendary sword artifact" />
    <div class="image-caption">
      <h4>Legendary Artifact</h4>
      <p>"An enormous legendary sword made of iridescent celestial steel, its broad blade inscribed with gold filigree depicting a cosmos map. The crossguard resembles intertwined phoenix wings, crafted from molten silver that glows warmly. The pommel houses a fiery ruby orb radiating waves of fiery magical energy, illuminating swirling smoke around the weapon. Positioned vertically against a weathered stone wall covered in ancient script, with soft moonlight filtering through cracks above, highlighting fine metalwork and radiant enchantments. The sword’s scale dwarfs nearby human figures for size reference."</p>
    </div>
  </div>
  
  <div class="tutorial-image-container">
    <img src="/images/tutorials/dnd-dragon-lair.png" alt="Dragon's treasure hoard" />
    <div class="image-caption">
      <h4>Dragon's Hoard</h4>
      <p>"A highly detailed fantasy dragon figurine perched atop a sprawling hoard of gold coins, jewels, and ancient artifacts. The dragon’s scales are textured with a blend of translucent resin and metallic paints to mimic iridescent dragon skin. The base features a rugged stone cavern floor with embedded crystals, measuring 8 inches in diameter for stability. The dragon is posed dynamically with wings partially unfurled, tail coiled around treasure piles, and head turned to the side. Assembly points are discreetly positioned at wing joints and tail base for easy attachment. Display angles highlight the intricate scale patterns and sparkling treasure under soft, warm lighting."</p>
    </div>
  </div>
</div>

<div id="quick-reference"></div>

## Quick Reference Guide

### Essential D&D Prompt Templates

<div style="background: var(--card); padding: 2rem; border-radius: 8px; margin: 2rem 0;">
  <h4 style="color: var(--primary); margin-bottom: 1rem;">Copy & Customize These Templates:</h4>
  
  <p><strong>🧙 Character Portrait:</strong></p>
  <code style="display: block; background: var(--background); padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
    "[RACE] [CLASS], [AGE], [KEY TRAIT], [ARMOR/CLOTHING], [WEAPON/ITEM], [EXPRESSION], D&D style"
  </code>
  
  <p><strong>🗺️ Battle Map:</strong></p>
  <code style="display: block; background: var(--background); padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
    "[LOCATION TYPE], [ROOM DESCRIPTIONS], [SPECIAL FEATURES], [LIGHTING], D&D style"
  </code>
  
  <p><strong>⚔️ Magic Item:</strong></p>
  <code style="display: block; background: var(--background); padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
    "[ITEM TYPE], [MAGICAL PROPERTIES], [VISUAL EFFECTS], [MATERIALS], [DECORATIONS]"
  </code>
  
  <p><strong>🐉 Monster:</strong></p>
  <code style="display: block; background: var(--background); padding: 1rem; border-radius: 4px;">
    "[CREATURE TYPE], [SIZE], [DISTINCTIVE FEATURES], [POSE/ACTION], [ENVIRONMENT]"
  </code>
</div>

<div id="conclusion"></div>

## Conclusion

<div class="conclusion-box">
  <h2>Your Epic Campaign Awaits!</h2>
  
  <p>With <a href="https://promptcatalyst.ai" style="color: lime;">Prompt Catalyst</a>, you're no longer limited by your artistic skills or budget when creating D&D campaign assets. Every DM now has the power to create professional-quality visuals that bring their unique vision to life.</p>
  
  <p>Remember these key strategies for D&D asset success:</p>
  <ul>
    <li>🎯 Use purpose-specific prompts for different asset types</li>
    <li>🎨 Maintain consistent style across your campaign</li>
    <li>⚡ Build asset libraries during prep time</li>
    <li>🎭 Create memorable NPCs with distinctive features</li>
    <li>🗺️ Design maps with actual play in mind</li>
    <li>✨ Use animation sparingly for maximum impact</li>
  </ul>
  
  <p>Whether you're crafting your first homebrew campaign or you're a seasoned DM looking to enhance your games, Prompt Catalyst provides the tools to transform your imagination into stunning visual assets. Your players will be amazed when you reveal custom artwork for every character they meet, every location they explore, and every treasure they discover.</p>
  
  <p>Roll for initiative and start creating your legendary campaign assets today!</p>
  
  <div style="text-align: center; margin-top: 2rem;">
    <p style="font-size: 1.2rem; color: var(--primary);">🎲 May your rolls be natural 20s and your campaigns unforgettable! 🎲</p>
  </div>
</div>

<a href="#" class="back-to-top" aria-label="Back to top" >
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position:relative; top:-1px;"><path d="m5 12 7-7 7 7"/><path d="m5 19 7-7 7 7"/></svg>
  <span class="sr-only">Back to top</span>
</a>
  `,
  tags: ["D&D", "RPG", "Fantasy", "Maps", "Characters", "Game Assets"]
};

export default dungeonsAndDragonsTutorial;
