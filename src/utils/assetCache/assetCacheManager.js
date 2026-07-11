/**
 * Unified Asset Cache Manager
 * Handles both images and videos with persistent IndexedDB storage
 */

import { cacheDB } from './cacheDatabase';

class AssetCacheManager {
  constructor() {
    this.memoryCache = new Map(); // Fast in-memory cache for blob URLs
    this.loadingPromises = new Map(); // Prevent duplicate requests
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    await cacheDB.init();
    this.isInitialized = true;
    
    // Schedule cleanup on first init
    setTimeout(() => this.cleanup(), 5000);
  }

  /**
   * Get an asset (image or video) with fallback chain:
   * 1. Memory cache (fastest)
   * 2. IndexedDB cache (fast)
   * 3. Network request (slowest)
   */
  async getAsset(url, options = {}) {
    await this.init();

    // Check memory cache first
    if (this.memoryCache.has(url)) {
      return this.memoryCache.get(url);
    }

    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    // Create loading promise
    const loadingPromise = this._loadAsset(url, options);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  async _loadAsset(url, options = {}) {
    try {
      // Try IndexedDB first
      const cached = await cacheDB.get(url);
      if (cached && cached.blob) {
        const blobUrl = URL.createObjectURL(cached.blob);
        this.memoryCache.set(url, blobUrl);
        return blobUrl;
      }

      // Fallback to network
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Cache in memory immediately
      this.memoryCache.set(url, blobUrl);

      // Cache in IndexedDB for persistence (don't await to avoid blocking)
      this._storeInBackground(url, blob, options);

      return blobUrl;
    } catch (error) {
      console.warn(`Failed to load asset: ${url}`, error);
      throw error;
    }
  }

  async _storeInBackground(url, blob, options) {
    try {
      await cacheDB.store(url, blob, {
        type: this._getAssetType(url),
        priority: options.priority || 1,
        ...options
      });
    } catch (error) {
      console.warn('Background storage failed:', error);
    }
  }

  /**
   * Preload multiple assets with priority
   */
  async preloadAssets(urls, options = {}) {
    const { 
      priority = 1, 
      concurrent = 3,
      onProgress 
    } = options;

    const chunks = this._chunkArray(urls, concurrent);
    let loaded = 0;

    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        try {
          await this.getAsset(url, { priority });
          loaded++;
          onProgress?.(loaded, urls.length);
        } catch (error) {
          console.warn(`Failed to preload: ${url}`, error);
          loaded++;
          onProgress?.(loaded, urls.length);
        }
      });

      await Promise.all(promises);
    }
  }

  /**
   * Preload assets that are likely to be needed soon
   */
  async preloadPredictive(type, options = {}) {
    const assetLists = this._getAssetListsByType(type);
    const { priorityAssets, backgroundAssets } = assetLists;

    // Preload priority assets first
    if (priorityAssets.length > 0) {
      await this.preloadAssets(priorityAssets, {
        priority: 3,
        concurrent: 2,
        ...options
      });
    }

    // Preload background assets with lower priority
    if (backgroundAssets.length > 0) {
      // Don't await - let this happen in background
      this.preloadAssets(backgroundAssets, {
        priority: 1,
        concurrent: 1,
        ...options
      });
    }
  }

  /**
   * Get lists of assets to preload based on usage patterns
   */
  _getAssetListsByType(type) {
    const baseUrl = '/previews';
    
    const commonAssets = {
      // Most commonly used preview images
      images: [
        `${baseUrl}/styles/realism-preview.png`,
        `${baseUrl}/styles/not_specified-preview.png`,
        `${baseUrl}/lighting/natural-preview.png`,
        `${baseUrl}/camera-angles/eye_level-preview.png`,
        `${baseUrl}/purposes/illustration-preview.png`,
      ],
      // Most commonly used preview videos
      videos: [
        `${baseUrl}/video-styles/cinematic-preview.webm`,
        `${baseUrl}/video-styles/documentary-preview.webm`,
        `${baseUrl}/camera-movements/static-shot-preview.webm`,
        `${baseUrl}/camera-movements/pan-shot-preview.webm`,
      ]
    };

    const allAssets = {
      images: this._generateImagePaths(),
      videos: this._generateVideoPaths()
    };

    switch (type) {
      case 'critical':
        return {
          priorityAssets: [...commonAssets.images, ...commonAssets.videos],
          backgroundAssets: []
        };
      
      case 'images':
        return {
          priorityAssets: commonAssets.images,
          backgroundAssets: allAssets.images.filter(url => !commonAssets.images.includes(url))
        };
      
      case 'videos':
        return {
          priorityAssets: commonAssets.videos,
          backgroundAssets: allAssets.videos.filter(url => !commonAssets.videos.includes(url))
        };
      
      case 'all':
      default:
        return {
          priorityAssets: [...commonAssets.images, ...commonAssets.videos],
          backgroundAssets: [
            ...allAssets.images.filter(url => !commonAssets.images.includes(url)),
            ...allAssets.videos.filter(url => !commonAssets.videos.includes(url))
          ]
        };
    }
  }

  _generateImagePaths() {
    const baseUrl = '/previews';
    const imagePaths = [];

    // Add known image paths from the existing code
    const imageTypes = ['styles', 'lighting', 'camera-angles', 'purposes'];
    const knownValues = {
      styles: ['realism', 'pixel_art', 'impressionism', 'pop_art', 'vintage', 'hand_drawn', 'abstract', 'minimalism', 'cartoon', 'surrealism', 'weirdcore'],
      lighting: ['natural', 'studio', 'dramatic', 'backlight', 'soft', 'hard', 'cinematic', 'low_key', 'high_key'],
      'camera-angles': ['wide_angle', 'close_up', 'eye_level', 'low_angle', 'high_angle', 'dutch_angle', 'over_the_shoulder', 'birds_eye_view', 'worm_eye_view'],
      purposes: ['illustration', 'concept_art', 'character_illustration', 'portrait', 'landscape', 'wallpaper']
    };

    for (const [type, values] of Object.entries(knownValues)) {
      for (const value of values) {
        imagePaths.push(`${baseUrl}/${type}/${value}-preview.png`);
      }
    }

    return imagePaths;
  }

  _generateVideoPaths() {
    const baseUrl = '/previews';
    const videoPaths = [];

    const videoTypes = {
      'video-styles': ['cinematic', 'documentary', 'vlog', 'time-lapse', 'music-video', 'experimental', 'aerial', 'slow-motion'],
      'camera-movements': ['static-shot', 'pan-shot', 'tilt-shot', 'dolly-shot', 'zoom-shot', 'crane-shot', 'handheld-shot', 'steadicam-shot'],
      'special-effects': ['fade', 'blur', 'vignette']
    };

    for (const [type, values] of Object.entries(videoTypes)) {
      for (const value of values) {
        videoPaths.push(`${baseUrl}/${type}/${value}-preview.webm`);
      }
    }

    return videoPaths;
  }

  _chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  _getAssetType(url) {
    if (url.includes('.webm') || url.includes('.mp4')) return 'video';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) return 'image';
    return 'unknown';
  }

  /**
   * Clear memory cache and optionally IndexedDB
   */
  async clearCache(includeIndexedDB = false) {
    // Clear memory cache and revoke blob URLs
    for (const blobUrl of this.memoryCache.values()) {
      URL.revokeObjectURL(blobUrl);
    }
    this.memoryCache.clear();
    this.loadingPromises.clear();

    if (includeIndexedDB) {
      await cacheDB.clear();
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const memorySize = this.memoryCache.size;
    const dbStats = await cacheDB.getStorageStats();
    
    return {
      memory: {
        cached: memorySize
      },
      persistent: dbStats
    };
  }

  /**
   * Cleanup old assets
   */
  async cleanup() {
    await cacheDB.cleanup();
  }
}

// Export singleton instance
export const assetCache = new AssetCacheManager();