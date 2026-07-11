/**
 * Cache debugging and management utilities
 * Available in development for testing and debugging the cache system
 */

import { assetCache, preloadManager, cacheDB } from './index';

class CacheDebugger {
  constructor() {
    this.logPrefix = '[AssetCache]';
  }

  /**
   * Log cache statistics to console
   */
  async logStats() {
    const stats = await assetCache.getStats();
    const preloadStats = preloadManager.getStats();
    
    console.group(this.logPrefix + ' Cache Statistics');
    console.log('Memory Cache:', stats.memory.cached, 'items');
    if (stats.persistent) {
      console.log('Persistent Cache:', stats.persistent.totalAssets, 'assets');
      console.log('Total Size:', stats.persistent.sizeMB, 'MB');
      console.log('Images:', stats.persistent.imageCount);
      console.log('Videos:', stats.persistent.videoCount);
    }
    console.log('Preload Queue:', preloadStats.queueLength, 'items');
    console.log('Currently Preloading:', preloadStats.isPreloading);
    console.log('Loaded Sets:', preloadStats.loadedSets);
    console.groupEnd();
  }

  /**
   * Force preload all assets for testing
   */
  async preloadAll() {
    console.log(this.logPrefix, 'Starting full preload...');
    const start = Date.now();
    
    await preloadManager.preloadCritical();
    preloadManager.queueModePreload(false); // Images
    preloadManager.queueModePreload(true);  // Videos
    
    const elapsed = Date.now() - start;
    console.log(this.logPrefix, `Full preload completed in ${elapsed}ms`);
    await this.logStats();
  }

  /**
   * Clear all caches
   */
  async clearAll() {
    console.log(this.logPrefix, 'Clearing all caches...');
    await assetCache.clearCache(true); // Include IndexedDB
    console.log(this.logPrefix, 'All caches cleared');
  }

  /**
   * Test asset loading performance
   */
  async performanceTest(assetUrls = []) {
    if (assetUrls.length === 0) {
      assetUrls = [
        '/previews/styles/realism-preview.png',
        '/previews/video-styles/cinematic-preview.webm',
        '/previews/lighting/natural-preview.png',
        '/previews/camera-movements/static-shot-preview.webm'
      ];
    }

    console.group(this.logPrefix + ' Performance Test');
    
    for (const url of assetUrls) {
      const start = Date.now();
      try {
        await assetCache.getAsset(url);
        const elapsed = Date.now() - start;
        console.log(`✓ ${url.split('/').pop()}: ${elapsed}ms`);
      } catch (error) {
        console.error(`✗ ${url.split('/').pop()}:`, error.message);
      }
    }
    
    console.groupEnd();
  }

  /**
   * Monitor cache hits vs misses
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.stats = { hits: 0, misses: 0, errors: 0 };
    
    // Intercept asset cache calls (simplified monitoring)
    const originalGetAsset = assetCache.getAsset.bind(assetCache);
    assetCache.getAsset = async (...args) => {
      try {
        const result = await originalGetAsset(...args);
        this.stats.hits++;
        return result;
      } catch (error) {
        this.stats.errors++;
        throw error;
      }
    };
    
    console.log(this.logPrefix, 'Cache monitoring started');
  }

  /**
   * Stop monitoring and show results
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    console.log(this.logPrefix, 'Cache monitoring results:', this.stats);
    this.stats = null;
  }

  /**
   * Export cache contents for debugging
   */
  async exportCache() {
    try {
      await cacheDB.init();
      const transaction = cacheDB.db.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      
      const assets = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const exportData = assets.map(asset => ({
        url: asset.url,
        type: asset.type,
        size: asset.size,
        cached: new Date(asset.cached).toISOString(),
        lastAccessed: new Date(asset.lastAccessed).toISOString()
      }));
      
      console.log(this.logPrefix, 'Cache export:', exportData);
      return exportData;
    } catch (error) {
      console.error(this.logPrefix, 'Export failed:', error);
      return null;
    }
  }
}

// Create singleton debugger
export const cacheDebugger = new CacheDebugger();

// Expose to window in development
if (process.env.NODE_ENV === 'development') {
  window.cacheDebugger = cacheDebugger;
  window.assetCache = assetCache;
  window.preloadManager = preloadManager;
  
  console.log(
    '%c[AssetCache] Debugging tools available on window.cacheDebugger',
    'color: #10b981; font-weight: bold;'
  );
}