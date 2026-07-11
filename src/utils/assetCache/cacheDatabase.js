/**
 * IndexedDB wrapper for persistent asset caching
 * Stores images and videos as blobs with metadata
 */

class CacheDatabase {
  constructor() {
    this.dbName = 'PromptCatalystAssets';
    this.version = 1;
    this.db = null;
    this.isReady = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to memory cache');
        resolve(false);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.warn('Failed to open IndexedDB:', request.error);
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isReady = true;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for assets
        if (!db.objectStoreNames.contains('assets')) {
          const store = db.createObjectStore('assets', { keyPath: 'url' });
          store.createIndex('type', 'type');
          store.createIndex('lastAccessed', 'lastAccessed');
          store.createIndex('priority', 'priority');
        }
      };
    });

    return this.initPromise;
  }

  async store(url, blob, metadata = {}) {
    await this.init();
    if (!this.isReady) return false;

    try {
      const transaction = this.db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      const assetData = {
        url,
        blob,
        type: metadata.type || this.getAssetType(url),
        size: blob.size,
        cached: Date.now(),
        lastAccessed: Date.now(),
        priority: metadata.priority || 1,
        expires: metadata.expires || (Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days
      };

      await new Promise((resolve, reject) => {
        const request = store.put(assetData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return true;
    } catch (error) {
      console.warn('Failed to store asset in IndexedDB:', error);
      return false;
    }
  }

  async get(url) {
    await this.init();
    if (!this.isReady) return null;

    try {
      const transaction = this.db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(url);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!result) return null;

      // Check if expired
      if (result.expires && Date.now() > result.expires) {
        this.delete(url); // Clean up expired asset
        return null;
      }

      // Update last accessed time
      result.lastAccessed = Date.now();
      store.put(result);

      return result;
    } catch (error) {
      console.warn('Failed to get asset from IndexedDB:', error);
      return null;
    }
  }

  async delete(url) {
    await this.init();
    if (!this.isReady) return false;

    try {
      const transaction = this.db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      await new Promise((resolve, reject) => {
        const request = store.delete(url);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return true;
    } catch (error) {
      console.warn('Failed to delete asset from IndexedDB:', error);
      return false;
    }
  }

  async clear() {
    await this.init();
    if (!this.isReady) return false;

    try {
      const transaction = this.db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return true;
    } catch (error) {
      console.warn('Failed to clear IndexedDB:', error);
      return false;
    }
  }

  async cleanup() {
    await this.init();
    if (!this.isReady) return;

    try {
      const transaction = this.db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const index = store.index('lastAccessed');
      
      // Get all assets sorted by last accessed (oldest first)
      const assets = await new Promise((resolve, reject) => {
        const request = index.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      let deletedCount = 0;

      for (const asset of assets) {
        // Delete expired or very old assets
        if ((asset.expires && now > asset.expires) || 
            (now - asset.lastAccessed > maxAge)) {
          await this.delete(asset.url);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} expired assets`);
      }
    } catch (error) {
      console.warn('Failed to cleanup IndexedDB:', error);
    }
  }

  getAssetType(url) {
    if (url.includes('.webm')) return 'video';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) return 'image';
    return 'unknown';
  }

  async getStorageStats() {
    await this.init();
    if (!this.isReady) return null;

    try {
      const transaction = this.db.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      
      const assets = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const totalSize = assets.reduce((sum, asset) => sum + (asset.size || 0), 0);
      const imageCount = assets.filter(asset => asset.type === 'image').length;
      const videoCount = assets.filter(asset => asset.type === 'video').length;

      return {
        totalAssets: assets.length,
        totalSize,
        imageCount,
        videoCount,
        sizeMB: (totalSize / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      console.warn('Failed to get storage stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const cacheDB = new CacheDatabase();