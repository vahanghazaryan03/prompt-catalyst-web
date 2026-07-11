// index.js - Import and export all tutorial content

import miniatureVideosTutorial from './miniature-videos';
import videoGameAssetsTutorial from './video-game-assets-new';
import dungeonsAndDragonsTutorial from './dungeons-and-dragons';
// Helper function to generate a slug from a title
const generateSlug = (title) => {
  return title
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .toLowerCase(); // Convert to lowercase
};

// Export an array of all tutorials
const tutorialData = [
dungeonsAndDragonsTutorial,
  videoGameAssetsTutorial,
  miniatureVideosTutorial
 
  // Add new tutorials here as they are created
];

// Ensure all tutorials have a slug
const processedTutorialData = tutorialData.map(tutorial => {
  // If tutorial doesn't have a slug, generate one from the title
  if (!tutorial.slug && tutorial.title) {
    return {
      ...tutorial,
      slug: generateSlug(tutorial.title)
    };
  }
  return tutorial;
});

export default processedTutorialData;