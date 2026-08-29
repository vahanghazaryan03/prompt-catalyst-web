// src/utils/regenerateThumbnails.js
// Utility to regenerate all thumbnails for existing animations
import { logger } from './logger';

import { loadAnimationHistory, saveAnimationHistory } from './animationStorage';
import { generateFalMediaThumbnail } from './falMediaThumbnail';

/**
 * Regenerates thumbnails for all animations in history, with focus on fal.media videos
 * @returns {Promise<Object>} Result of the operation
 */
export const regenerateAllThumbnails = async () => {
  try {
    // Set up a status tracker for the UI
    let status = {
      inProgress: true,
      total: 0,
      processed: 0,
      updated: 0,
      errors: 0,
      startTime: Date.now()
    };

    // Update status in console for user feedback
    const updateStatus = () => {
      const elapsed = ((Date.now() - status.startTime) / 1000).toFixed(1);
      logger.debug(
        `Processing: ${status.processed}/${status.total} videos (${status.updated} updated, ${status.errors} errors) - ${elapsed}s elapsed`
      );
    };

    // Load animation history
    logger.debug('Loading animation history...');
    const history = loadAnimationHistory();

    if (!Array.isArray(history) || history.length === 0) {
      logger.debug('No animations found in history');
      return { success: true, message: 'No animations to process', count: 0 };
    }

    // Filter for animations with video URLs
    const animationsWithVideos = history.filter(
      animation => animation && animation.url && animation.url.startsWith('http')
    );

    status.total = animationsWithVideos.length;
    logger.debug(`Found ${status.total} animations with video URLs`);

    if (status.total === 0) {
      return { success: true, message: 'No videos to process', count: 0 };
    }

    // Process animations in small batches to avoid overwhelming the browser
    const batchSize = 3;
    const totalBatches = Math.ceil(animationsWithVideos.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      logger.debug(`Processing batch ${batchIndex + 1} of ${totalBatches}...`);

      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, animationsWithVideos.length);
      const batch = animationsWithVideos.slice(startIndex, endIndex);

      // Process each animation in this batch
      const updates = [];

      for (const animation of batch) {
        status.processed++;

        try {
          logger.debug(`Processing animation: ${animation.id} (${animation.url})`);
          
          // Check if this is a fal.media URL
          if (animation.url.includes('fal.media')) {
            const newThumbnail = await generateFalMediaThumbnail(animation.url, {
              width: 320,
              height: 180,
              forceRegenerate: true
            });

            if (newThumbnail) {
              updates.push({
                id: animation.id,
                thumbnail: newThumbnail
              });
              status.updated++;
              logger.debug(`✓ Generated new thumbnail for ${animation.id}`);
            }
          } else {
            // For non-fal.media URLs, we could implement other thumbnail generation methods here
            logger.debug(`Skipping non-fal.media URL: ${animation.url}`);
          }
        } catch (error) {
          logger.warn(`Failed to generate thumbnail for animation ${animation.id}:`, error);
          status.errors++;
        }

        // Update status every animation
        updateStatus();
      }

      // Apply updates if we have any
      if (updates.length > 0) {
        // Update history with new thumbnails
        const updatedHistory = history.map(item => {
          const update = updates.find(u => u.id === item.id);
          if (update) {
            return { ...item, thumbnail: update.thumbnail };
          }
          return item;
        });

        // Save the updated history
        saveAnimationHistory(updatedHistory);
        logger.debug(`Batch ${batchIndex + 1}: Saved ${updates.length} updated thumbnails`);
      } else {
        logger.debug(`Batch ${batchIndex + 1}: No thumbnails needed updating`);
      }

      // Wait a bit between batches to keep the UI responsive
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Final status update
    status.inProgress = false;
    const totalTime = ((Date.now() - status.startTime) / 1000).toFixed(1);
    logger.debug(
      `Thumbnail regeneration completed in ${totalTime}s: ${status.updated} updated, ${status.errors} errors`
    );

    return {
      success: true,
      total: status.total,
      processed: status.processed,
      updated: status.updated,
      errors: status.errors,
      time: totalTime
    };
  } catch (error) {
    logger.error('Error during thumbnail regeneration:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sets up a global function that can be called from the browser console
 * to regenerate all thumbnails
 */
export const setupThumbnailRegenerator = () => {
  window.fixAnimationThumbnails = async () => {
  
    try {
      const result = await regenerateAllThumbnails();
      
      return result;
    } catch (error) {
      
      return { success: false, error: error.message };
    }
  };
  
  
};

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  setupThumbnailRegenerator();
}

export default regenerateAllThumbnails;
