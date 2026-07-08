import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';
import { ErrorCode } from '../types/api-response';
import { redisIncr, redisExpire, redisTTL } from '../config/redis';
import { logger } from '@matchpulse/logger';
import { env } from '../config/env-validation';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

// Rate limit configurations per route type
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  'auth-login': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  'auth-signup': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 requests per hour
  'auth-reset': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 requests per hour
  
  // Telegram endpoints
  'telegram-verify': { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 requests per 5 minutes
  'telegram-link': { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 requests per hour
  
  // Strategy endpoints
  'strategy-create': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  'strategy-update': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  'strategy-delete': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  
  // General API endpoints
  'general': { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  'read-heavy': { windowMs: 60 * 1000, maxRequests: 120 }, // 120 requests per minute
  
  // Admin endpoints
  'admin': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  
  // Public endpoints
  'public': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
};

// Get rate limit key for different scopes
function getRateLimitKey(
  identifier: string,
  scope: 'ip' | 'uid' | 'global',
  routeType: string
): string {
  return `ratelimit:${scope}:${routeType}:${identifier}`;
}

// Check rate limit using Redis
async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitInfo> {
  try {
    const current = await redisIncr(key);
    
    if (current === 1) {
      // First request, set expiration
      await redisExpire(key, Math.ceil(config.windowMs / 1000));
    }
    
    const ttl = await redisTTL(key);
    const reset = Date.now() + (ttl * 1000);
    
    return {
      remaining: Math.max(0, config.maxRequests - current),
      reset,
      limit: config.maxRequests,
    };
  } catch (error) {
    logger.error('Rate limit check failed', error as Error);
    // Fail open - allow request if Redis is down
    return {
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
      limit: config.maxRequests,
    };
  }
}

// Get client IP address
function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// Determine route type from request path
function getRouteType(req: Request): string {
  const path = req.path;
  
  if (path.includes('/auth/login')) return 'auth-login';
  if (path.includes('/auth/signup')) return 'auth-signup';
  if (path.includes('/auth/reset')) return 'auth-reset';
  if (path.includes('/telegram/verify')) return 'telegram-verify';
  if (path.includes('/telegram/link')) return 'telegram-link';
  if (path.includes('/strategies') && req.method === 'POST') return 'strategy-create';
  if (path.includes('/strategies') && (req.method === 'PUT' || req.method === 'PATCH')) return 'strategy-update';
  if (path.includes('/strategies') && req.method === 'DELETE') return 'strategy-delete';
  if (path.includes('/admin')) return 'admin';
  if (path.includes('/live-matches') || path.includes('/health')) return 'public';
  
  // Default to general
  return 'general';
}

// Rate limiting middleware factory
export function createRateLimiter(routeType?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!env.ENABLE_RATE_LIMITING) {
      return next();
    }

    const actualRouteType = routeType || getRouteType(req);
    const config = RATE_LIMIT_CONFIGS[actualRouteType] || RATE_LIMIT_CONFIGS.general;
    
    const ip = getClientIP(req);
    const uid = req.user?.uid || 'anonymous';
    
    // Check IP-based rate limit
    const ipKey = getRateLimitKey(ip, 'ip', actualRouteType);
    const ipLimit = await checkRateLimit(ipKey, config);
    
    // Check UID-based rate limit (if authenticated)
    let uidLimit: RateLimitInfo | null = null;
    if (req.user?.uid) {
      const uidKey = getRateLimitKey(uid, 'uid', actualRouteType);
      uidLimit = await checkRateLimit(uidKey, config);
    }
    
    // Use the stricter limit
    const effectiveLimit = uidLimit && uidLimit.remaining < ipLimit.remaining ? uidLimit : ipLimit;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', effectiveLimit.limit);
    res.setHeader('X-RateLimit-Remaining', effectiveLimit.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(effectiveLimit.reset).toISOString());
    
    if (effectiveLimit.remaining <= 0) {
      logger.warn(`Rate limit exceeded for ${actualRouteType}`, {
        ip,
        uid: req.user?.uid,
        path: req.path,
      });
      
      throw new AppError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Too many requests. Please try again later.',
        429
      );
    }
    
    next();
  };
}

// Specific rate limiters for common use cases
export const authLoginRateLimiter = createRateLimiter('auth-login');
export const authSignupRateLimiter = createRateLimiter('auth-signup');
export const authResetRateLimiter = createRateLimiter('auth-reset');
export const telegramVerifyRateLimiter = createRateLimiter('telegram-verify');
export const telegramLinkRateLimiter = createRateLimiter('telegram-link');
export const strategyCreateRateLimiter = createRateLimiter('strategy-create');
export const strategyUpdateRateLimiter = createRateLimiter('strategy-update');
export const strategyDeleteRateLimiter = createRateLimiter('strategy-delete');
export const adminRateLimiter = createRateLimiter('admin');
export const publicRateLimiter = createRateLimiter('public');
export const generalRateLimiter = createRateLimiter('general');

// Global rate limiter (applies to all requests)
export const globalRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (!env.ENABLE_RATE_LIMITING) {
    return next();
  }

  const config = { windowMs: 60 * 1000, maxRequests: 1000 }; // 1000 requests per minute globally
  const ip = getClientIP(req);
  
  const globalKey = getRateLimitKey(ip, 'global', 'all');
  const limit = await checkRateLimit(globalKey, config);
  
  res.setHeader('X-RateLimit-Limit', limit.limit);
  res.setHeader('X-RateLimit-Remaining', limit.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(limit.reset).toISOString());
  
  if (limit.remaining <= 0) {
    logger.warn('Global rate limit exceeded', { ip });
    throw new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please try again later.',
      429
    );
  }
  
  next();
};
