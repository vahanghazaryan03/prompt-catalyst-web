# Improved Asset Caching System

This new caching system provides persistent, intelligent caching for both images and videos with the following benefits:

## Key Features

### 1. **Persistent Storage**
- Uses IndexedDB for persistent caching across browser sessions
- Assets remain cached even after page refresh or browser restart
- Automatic cleanup of expired assets

### 2. **Intelligent Preloading**
- **Critical assets** load first (most commonly used previews)
- **Mode-specific preloading** (images for image mode, videos for video mode)
- **Interaction-based preloading** (triggered when user hovers over settings)
- **Background processing** without blocking the UI

### 3. **Performance Optimized**
- **Memory cache** for instant access to recently used assets
- **Concurrent loading** with configurable limits
- **Priority-based queuing** system
- **Duplicate request prevention**

### 4. **Graceful Fallbacks**
- Falls back to browser cache if IndexedDB fails
- Progressive enhancement approach
- Error handling with retry logic

## Usage Examples

### Basic Usage in Components

```javascript
import { assetCache } from '../utils/assetCache';

// In a component
const [imageUrl, setImageUrl] = useState(null);

useEffect(() => {
  const loadImage = async () => {
    try {
      const cachedUrl = await assetCache.getAsset('/previews/styles/realism-preview.png', {
        priority: 2 // Higher number = higher priority
      });
      setImageUrl(cachedUrl);
    } catch (error) {
      console.warn('Failed to load image:', error);
    }
  };
  
  loadImage();
}, []);
```

### Preloading Assets

```javascript
import { preloadManager } from '../utils/assetCache';

// Preload critical assets
await preloadManager.preloadCritical();

// Preload for specific mode
preloadManager.onModeChange(true); // true = video mode

// Preload for specific dialog
preloadManager.preloadForDialog('style');
```

### Cache Statistics

```javascript
import { assetCache } from '../utils/assetCache';

const stats = await assetCache.getStats();
console.log(\`Cached: \${stats.persistent.totalAssets} assets (\${stats.persistent.sizeMB}MB)\`);
```

## Implementation Details

### Asset Loading Strategy

1. **Memory Cache Check** (fastest - ~1ms)
2. **IndexedDB Check** (fast - ~5-10ms)
3. **Network Request** (slowest - ~50-500ms)

### Preloading Priorities

- **Priority 3**: Currently selected/visible assets
- **Priority 2**: Assets in current mode (image/video)
- **Priority 1**: Background assets for future use

### Storage Management

- Assets expire after 30 days of inactivity
- Automatic cleanup removes old assets
- Graceful handling of storage quota limits

## Browser Support

- **IndexedDB**: All modern browsers (IE 10+)
- **Intersection Observer**: All modern browsers (IE not supported, graceful fallback)
- **Blob URLs**: All modern browsers

## Performance Impact

- **Initial load**: No impact (preloading starts after app is interactive)
- **Dialog opening**: Assets ready instantly instead of 200-500ms loading
- **Memory usage**: ~50MB typical cache size
- **Storage usage**: Persists across sessions, auto-managed

This system ensures that preview images and videos are ready instantly when users open selection dialogs, providing a much smoother user experience without affecting initial app load times.
