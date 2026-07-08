import { redisGet, redisSet, redisDel } from '../config/redis';
import { logger } from '@matchpulse/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: boolean; // Return stale data while revalidating
  staleTtl?: number; // How long stale data is valid
}

// Default TTL values for different cache types
const DEFAULT_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

/**
 * Get cached data
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redisGet(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error('Cache get failed', error as Error);
    return null;
  }
}

/**
 * Set cached data
 */
export async function cacheSet<T>(key: string, value: T, ttl: number = DEFAULT_TTL.MEDIUM): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redisSet(key, serialized, ttl);
  } catch (error) {
    logger.error('Cache set failed', error as Error);
  }
}

/**
 * Delete cached data
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    await redisDel(key);
  } catch (error) {
    logger.error('Cache delete failed', error as Error);
  }
}

/**
 * Get or set pattern (cache-aside)
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await cacheGet<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    
    // Set in cache
    const ttl = options.ttl || DEFAULT_TTL.MEDIUM;
    await cacheSet(key, data, ttl);
    
    return data;
  } catch (error) {
    logger.error('Cache getOrSet failed', error as Error);
    // On error, try to fetch fresh data
    return fetcher();
  }
}

/**
 * Invalidate cache pattern
 */
export async function cacheInvalidate(_pattern: string): Promise<void> {
  // This would require Redis SCAN or KEYS command
  // For now, implement simple deletion
  logger.warn('cacheInvalidate not fully implemented');
}

/**
 * Cache decorator for functions
 */
export function Cached(ttl: number = DEFAULT_TTL.MEDIUM) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const key = `cached:${(target as { constructor: { name: string } }).constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      const cached = await cacheGet(key);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      await cacheSet(key, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Stale-while-revalidate pattern
 */
export async function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  try {
    const cached = await cacheGet<T>(key);
    
    if (cached !== null) {
      // Return stale data immediately
      // Revalidate in background
      setImmediate(async () => {
        try {
          const fresh = await fetcher();
          const ttl = options.ttl || DEFAULT_TTL.MEDIUM;
          await cacheSet(key, fresh, ttl);
        } catch (error) {
          logger.error('Background revalidation failed', error as Error);
        }
      });
      
      return cached;
    }

    // No cache, fetch fresh
    const data = await fetcher();
    const ttl = options.ttl || DEFAULT_TTL.MEDIUM;
    await cacheSet(key, data, ttl);
    
    return data;
  } catch (error) {
    logger.error('staleWhileRevalidate failed', error as Error);
    return fetcher();
  }
}
