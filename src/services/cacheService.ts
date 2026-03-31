const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export const cacheService = {
  get<T>(key: string): T | null {
    const entry = cache.get(key);

    if (!entry) return null;

    // Check if cache has expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
      return null;
    }

    return entry.value as T;
  },

  set<T>(key: string, value: T): void {
    cache.set(key, {
      value,
      timestamp: Date.now()
    });
  },

  has(key: string): boolean {
    const entry = cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
      return false;
    }

    return true;
  },

  delete(key: string): void {
    cache.delete(key);
  },

  clear(): void {
    cache.clear();
  },

  // Get cache stats
  getStats() {
    return {
      size: cache.size,
      ttl: CACHE_TTL
    };
  }
};
