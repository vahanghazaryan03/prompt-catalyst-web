/**
 * Intelligent Preload Manager
 * Handles background preloading without blocking the UI
 */

import { assetCache } from './assetCacheManager';

class PreloadManager {
  constructor() {
    this.isPreloading = false;
    this.preloadQueue = [];
    this.observers = new Map();
    this.loadedSets = new Set(); // Track what we've already preloaded
  }

  /**
   * Initialize preloading system after app is ready
   */
  async init() {
    // Wait for app to be interactive before starting preloading
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    // Wait additional time to ensure app is fully interactive
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start with critical assets
    this.preloadCritical();

    // Set up intersection observers for smart preloading
    this.setupIntersectionObservers();

    // Start background preloading queue
    this.processPreloadQueue();
  }

  /**
   * Preload critical assets that are likely to be needed first
   */
  async preloadCritical() {
    if (this.loadedSets.has('critical')) return;

    try {
      await assetCache.preloadPredictive('critical', {
        onProgress: (loaded, total) => {
          
        }
      });
      
      this.loadedSets.add('critical');
     
    } catch (error) {
      
    }
  }

  /**
   * Queue preloading based on current mode
   */
  queueModePreload(isVideoMode) {
    const mode = isVideoMode ? 'videos' : 'images';
    
    if (this.loadedSets.has(mode)) return;

    this.preloadQueue.push({
      type: mode,
      priority: 2,
      callback: async () => {
        await assetCache.preloadPredictive(mode, {
          onProgress: (loaded, total) => {
           
          }
        });
        this.loadedSets.add(mode);
      
      }
    });
  }

  /**
   * Queue preloading when user interacts with specific components
   */
  queueInteractionPreload(componentType) {
    const key = `interaction-${componentType}`;
    if (this.loadedSets.has(key)) return;

    let assetType;
    switch (componentType) {
      case 'style-dialog':
        assetType = 'images';
        break;
      case 'video-dialog':
        assetType = 'videos';
        break;
      case 'settings-panel':
        assetType = 'all';
        break;
      default:
        return;
    }

    this.preloadQueue.push({
      type: key,
      priority: 3,
      callback: async () => {
        await assetCache.preloadPredictive(assetType);
        this.loadedSets.add(key);
      }
    });
  }

  /**
   * Set up intersection observers for visible elements
   */
  setupIntersectionObservers() {
    if (!window.IntersectionObserver) return;

    // Observer for settings panel visibility
    const settingsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.queueInteractionPreload('settings-panel');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observer for dialog triggers
    const dialogObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            if (element.dataset.preloadType) {
              this.queueInteractionPreload(element.dataset.preloadType);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    this.observers.set('settings', settingsObserver);
    this.observers.set('dialogs', dialogObserver);

    // Start observing when elements are available
    this.startObserving();
  }

  /**
   * Start observing relevant elements
   */
  startObserving() {
    // Observe settings panels
    const settingsElements = document.querySelectorAll('[data-component="settings"]');
    settingsElements.forEach(el => {
      this.observers.get('settings')?.observe(el);
    });

    // Observe dialog triggers
    const dialogTriggers = document.querySelectorAll('[data-preload-type]');
    dialogTriggers.forEach(el => {
      this.observers.get('dialogs')?.observe(el);
    });

    // Re-run periodically as new elements are added
    setTimeout(() => this.startObserving(), 5000);
  }

  /**
   * Process the preload queue with priority
   */
  async processPreloadQueue() {
    if (this.isPreloading) return;
    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      // Sort by priority (higher number = higher priority)
      this.preloadQueue.sort((a, b) => b.priority - a.priority);
      
      const task = this.preloadQueue.shift();
      
      try {
        await task.callback();
      } catch (error) {
        
      }

      // Small delay to prevent blocking the main thread
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isPreloading = false;

    // Check again in a few seconds for new tasks
    setTimeout(() => this.processPreloadQueue(), 3000);
  }

  /**
   * Preload assets for a specific dialog type
   */
  preloadForDialog(dialogType) {
    const assetMappings = {
      'style': 'images',
      'videoStyle': 'videos',
      'cameraMovement': 'videos',
      'lighting': 'images',
      'cameraAngle': 'images',
      'purpose': 'images',
      'specialEffects': 'videos'
    };

    const assetType = assetMappings[dialogType];
    if (assetType) {
      this.queueInteractionPreload(`${dialogType}-dialog`);
    }
  }

  /**
   * Handle mode changes
   */
  onModeChange(isVideoMode) {
    this.queueModePreload(isVideoMode);
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  /**
   * Get preloading statistics
   */
  getStats() {
    return {
      queueLength: this.preloadQueue.length,
      isPreloading: this.isPreloading,
      loadedSets: Array.from(this.loadedSets),
      observersActive: this.observers.size
    };
  }
}

// Export singleton instance
export const preloadManager = new PreloadManager();