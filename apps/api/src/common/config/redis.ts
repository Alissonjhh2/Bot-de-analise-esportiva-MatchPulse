import Redis from 'ioredis';
import { env } from './env-validation';
import { logger } from '@matchpulse/logger';

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
  if (redisClient) {
    return redisClient;
  }

  if (!env.REDIS_URL) {
    throw new Error('REDIS_URL is required but not configured');
  }

  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 10) {
          logger.error('Redis reconnection failed after 10 retries');
          return null;
        }
        const delay = Math.min(times * 100, 3000);
        logger.info(`Redis reconnecting... attempt ${times}, delay ${delay}ms`);
        return delay;
      },
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('disconnect', () => {
      logger.warn('Redis Client Disconnected');
    });

    logger.info('Redis client initialized successfully');

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis client', error as Error);
    throw error;
  }
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis client closed');
  }
}

// Helper functions for common Redis operations
export async function redisGet(key: string): Promise<string | null> {
  const client = await getRedisClient();
  return await client.get(key);
}

export async function redisSet(key: string, value: string, ttl?: number): Promise<void> {
  const client = await getRedisClient();
  if (ttl) {
    await client.setex(key, ttl, value);
  } else {
    await client.set(key, value);
  }
}

export async function redisDel(key: string): Promise<void> {
  const client = await getRedisClient();
  await client.del(key);
}

export async function redisIncr(key: string): Promise<number> {
  const client = await getRedisClient();
  return await client.incr(key);
}

export async function redisExpire(key: string, ttl: number): Promise<void> {
  const client = await getRedisClient();
  await client.expire(key, ttl);
}

export async function redisTTL(key: string): Promise<number> {
  const client = await getRedisClient();
  const ttl = await client.ttl(key);
  return ttl === -1 ? -1 : ttl; // -1 means no expiration
}
