import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { getRedisClient } from '../config/redis';
import { logger } from '@matchpulse/logger';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: {
    database: { status: string; latency?: number };
    redis: { status: string; latency?: number };
    memory: { status: string; usage: string };
    uptime: number;
  };
}

/**
 * Comprehensive health check endpoint
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const checks = {
    database: { status: 'unknown' } as { status: string; latency?: number },
    redis: { status: 'unknown' } as { status: string; latency?: number },
    memory: { status: 'unknown', usage: '0%' } as { status: string; usage: string },
    uptime: process.uptime(),
  };

  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = { status: 'unhealthy' };
    overallStatus = 'degraded';
    logger.error('Database health check failed', error as Error);
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    const redis = await getRedisClient();
    await redis.ping();
    checks.redis = {
      status: 'healthy',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis = { status: 'unhealthy' };
    overallStatus = 'degraded';
    logger.error('Redis health check failed', error as Error);
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryPercent = ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2);
  checks.memory = {
    status: parseFloat(memoryPercent) > 90 ? 'unhealthy' : 'healthy',
    usage: `${memoryPercent}%`,
  };

  if (parseFloat(memoryPercent) > 90) {
    overallStatus = 'degraded';
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  res.status(statusCode).json(result);
}

/**
 * Readiness check - is the application ready to receive traffic?
 */
export async function readinessCheck(req: Request, res: Response): Promise<void> {
  try {
    // Check critical dependencies
    await prisma.$queryRaw`SELECT 1`;
    
    const redis = await getRedisClient();
    await redis.ping();

    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error('Readiness check failed', error as Error);
    res.status(503).json({ status: 'not ready' });
  }
}

/**
 * Liveness check - is the application still running?
 */
export async function livenessCheck(req: Request, res: Response): Promise<void> {
  res.status(200).json({ status: 'alive', uptime: process.uptime() });
}
