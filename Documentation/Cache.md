# APT Cache System

## Overview

APT includes a built-in global caching system that stores data in the `Data/Cache` directory for global data accessing and caching. The cache system provides a simple key-value storage mechanism for temporary data used by APT during project operations.

## Cache Location

The cache is stored in:
```
<APT>/Data/Cache/
```

## Cache Commands

APT provides two CLI commands for managing the cache:

1. **View Cache Contents**
   ```bash
   apt <ProjectEntryFile> :LogCache
   ```
   Displays all current cache entries and their values.

2. **Clean Cache**
   ```bash
   apt <ProjectEntryFile> :CleanCache
   ```
   Removes all cache entries by deleting the cache directory.

## Cache Operations

If you're developing with APT, the following cache operations are available:

### Reading Cache

```javascript
// Check if cache exists
APT.Common.HasCache(key)

// Read cache (throws error if not found)
APT.Common.ReadCache(key)

// Try read cache (returns false if not found)
APT.Common.TryReadCache(key)

// Get all cache entries
APT.Common.GatherCache()
```

### Writing Cache

```javascript
// Write cache (throws error if already exists)
APT.Common.Cache(key, value)

// Try write cache (returns null if already exists)
APT.Common.TryCache(key, value)
```

### Removing Cache

```javascript
// Remove cache (throws error if not found)
APT.Common.Uncache(key)

// Try remove cache (returns false if not found)
APT.Common.TryUncache(key)
```

## Technical Details

- Cache files are stored as plain text
- Cache operations are synchronous
- Cache keys map directly to filenames in the cache directory
- Cache values are stored as strings
- The cache system will automatically create the cache directory if it doesn't exist
