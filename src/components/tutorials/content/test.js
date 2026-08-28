// test.js - A script to verify that our tutorial structure works

logger.debug('Loading tutorials...');

// Import tutorials
import tutorialData from './index';
import { logger } from '../../../utils/logger';

// Print information about loaded tutorials
logger.debug(`Successfully loaded ${tutorialData.length} tutorials:`);
tutorialData.forEach((tutorial, index) => {
  logger.debug(`${index + 1}. ${tutorial.title} by ${tutorial.author}`);
  logger.debug(`   Tags: ${tutorial.tags.join(', ')}`);
  logger.debug(`   Content length: ${tutorial.content.length} characters`);
  logger.debug('---');
});

// This file is just for testing and doesn't need to be imported anywhere