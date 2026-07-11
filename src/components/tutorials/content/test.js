// test.js - A script to verify that our tutorial structure works

console.log('Loading tutorials...');

// Import tutorials
import tutorialData from './index';

// Print information about loaded tutorials
console.log(`Successfully loaded ${tutorialData.length} tutorials:`);
tutorialData.forEach((tutorial, index) => {
  console.log(`${index + 1}. ${tutorial.title} by ${tutorial.author}`);
  console.log(`   Tags: ${tutorial.tags.join(', ')}`);
  console.log(`   Content length: ${tutorial.content.length} characters`);
  console.log('---');
});

// This file is just for testing and doesn't need to be imported anywhere