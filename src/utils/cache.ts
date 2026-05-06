// Simple in-memory cache utility for the EcoSpark Hub API
type CacheEntry = {
  data: any;
  expiry: number;
};

const cache = new Map<string, CacheEntry>();

export const getCache = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
};

export const setCache = (key: string, data: any, ttlSeconds: number = 300) => {
  cache.set(key, {
    data,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
};

export const clearCache = (pattern?: string) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};
