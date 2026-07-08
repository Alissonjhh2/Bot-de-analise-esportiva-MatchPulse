import { Request, Response, NextFunction } from 'express';
import { redisGet, redisSet, redisIncr, redisExpire } from '../config/redis';
import { logger } from '@matchpulse/logger';
import { env } from '../config/env-validation';
import { reportMultipleAccounts, reportAutomation, reportAuthFailure } from './ip-control';

// Abuse detection types
enum AbuseType {
  MULTIPLE_ACCOUNTS = 'multiple_accounts',
  MASS_ACCOUNT_CREATION = 'mass_account_creation',
  SPAM = 'spam',
  AUTOMATION = 'automation',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  BRUTE_FORCE = 'brute_force',
  RAPID_REQUESTS = 'rapid_requests',
}

// Abuse detection thresholds
const ABUSE_THRESHOLDS = {
  [AbuseType.MULTIPLE_ACCOUNTS]: { count: 5, window: 24 * 60 * 60 }, // 5 accounts per day
  [AbuseType.MASS_ACCOUNT_CREATION]: { count: 10, window: 60 * 60 }, // 10 accounts per hour
  [AbuseType.SPAM]: { count: 20, window: 60 * 60 }, // 20 actions per hour
  [AbuseType.AUTOMATION]: { count: 100, window: 60 }, // 100 requests per minute
  [AbuseType.CREDENTIAL_STUFFING]: { count: 10, window: 60 * 60 }, // 10 failed attempts per hour
  [AbuseType.BRUTE_FORCE]: { count: 5, window: 5 * 60 }, // 5 failed attempts per 5 minutes
  [AbuseType.RAPID_REQUESTS]: { count: 200, window: 60 }, // 200 requests per minute
};

// Get client IP
function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// Track account creation by IP
async function trackAccountCreation(ip: string): Promise<boolean> {
  try {
    const key = `abuse:accounts:${ip}`;
    const count = await redisIncr(key);
    await redisExpire(key, ABUSE_THRESHOLDS[AbuseType.MULTIPLE_ACCOUNTS].window);

    if (count >= ABUSE_THRESHOLDS[AbuseType.MULTIPLE_ACCOUNTS].count) {
      await reportMultipleAccounts(ip);
      logger.warn(`Multiple accounts detected from IP: ${ip}`, { count });
      return true;
    }

    // Check for mass creation
    const massKey = `abuse:mass_accounts:${ip}`;
    const massCount = await redisIncr(massKey);
    await redisExpire(massKey, ABUSE_THRESHOLDS[AbuseType.MASS_ACCOUNT_CREATION].window);

    if (massCount >= ABUSE_THRESHOLDS[AbuseType.MASS_ACCOUNT_CREATION].count) {
      logger.warn(`Mass account creation detected from IP: ${ip}`, { count: massCount });
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to track account creation', error as Error);
    return false;
  }
}

// Track failed authentication attempts
async function trackFailedAuth(ip: string, email?: string): Promise<boolean> {
  try {
    const ipKey = `abuse:auth_failures:ip:${ip}`;
    const ipCount = await redisIncr(ipKey);
    await redisExpire(ipKey, ABUSE_THRESHOLDS[AbuseType.BRUTE_FORCE].window);

    if (ipCount >= ABUSE_THRESHOLDS[AbuseType.BRUTE_FORCE].count) {
      await reportAuthFailure(ip);
      logger.warn(`Brute force detected from IP: ${ip}`, { count: ipCount });
      return true;
    }

    // Track by email if provided
    if (email) {
      const emailKey = `abuse:auth_failures:email:${email}`;
      const emailCount = await redisIncr(emailKey);
      await redisExpire(emailKey, ABUSE_THRESHOLDS[AbuseType.CREDENTIAL_STUFFING].window);

      if (emailCount >= ABUSE_THRESHOLDS[AbuseType.CREDENTIAL_STUFFING].count) {
        logger.warn(`Credential stuffing detected for email: ${email}`, { count: emailCount });
        return true;
      }
    }

    return false;
  } catch (error) {
    logger.error('Failed to track failed auth', error as Error);
    return false;
  }
}

// Track rapid requests
async function trackRapidRequests(ip: string): Promise<boolean> {
  try {
    const key = `abuse:rapid_requests:${ip}`;
    const count = await redisIncr(key);
    await redisExpire(key, ABUSE_THRESHOLDS[AbuseType.RAPID_REQUESTS].window);

    if (count >= ABUSE_THRESHOLDS[AbuseType.RAPID_REQUESTS].count) {
      await reportAutomation(ip, 30);
      logger.warn(`Rapid requests detected from IP: ${ip}`, { count });
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to track rapid requests', error as Error);
    return false;
  }
}

// Track spam actions
async function trackSpam(ip: string, action: string): Promise<boolean> {
  try {
    const key = `abuse:spam:${action}:${ip}`;
    const count = await redisIncr(key);
    await redisExpire(key, ABUSE_THRESHOLDS[AbuseType.SPAM].window);

    if (count >= ABUSE_THRESHOLDS[AbuseType.SPAM].count) {
      logger.warn(`Spam detected from IP: ${ip}`, { action, count });
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to track spam', error as Error);
    return false;
  }
}

// Check for concurrent sessions
async function checkConcurrentSessions(uid: string): Promise<boolean> {
  try {
    const key = `abuse:sessions:${uid}`;
    const sessions = await redisGet(key);
    
    if (!sessions) {
      await redisSet(key, '1', 60 * 60); // 1 hour
      return false;
    }

    const sessionCount = parseInt(sessions);
    if (sessionCount > 5) {
      logger.warn(`Concurrent sessions detected for user: ${uid}`, { count: sessionCount });
      return true;
    }

    await redisSet(key, (sessionCount + 1).toString(), 60 * 60);
    return false;
  } catch (error) {
    logger.error('Failed to check concurrent sessions', error as Error);
    return false;
  }
}

// Abuse detection middleware
export const abuseDetection = async (req: Request, res: Response, next: NextFunction) => {
  if (!env.ENABLE_RATE_LIMITING) {
    return next();
  }

  const ip = getClientIP(req);
  const path = req.path;
  const method = req.method;

  try {
    // Track rapid requests for all endpoints
    const isRapid = await trackRapidRequests(ip);
    if (isRapid) {
      res.setHeader('X-Abuse-Detected', 'rapid_requests');
    }

    // Specific checks based on endpoint
    if (path.includes('/auth') && method === 'POST') {
      // Track failed auth attempts (handled in auth controller)
      if (path.includes('/login') || path.includes('/signup')) {
        // Account creation tracking handled in controller
      }
    }

    if (path.includes('/strategies') && method === 'POST') {
      // Track spam strategy creation
      const isSpam = await trackSpam(ip, 'strategy_creation');
      if (isSpam) {
        res.setHeader('X-Abuse-Detected', 'spam');
      }
    }

    next();
  } catch (error) {
    logger.error('Abuse detection error', error as Error);
    // Fail open - allow request if abuse detection fails
    next();
  }
};

// Helper functions for controllers
export const detectAccountCreationAbuse = async (ip: string): Promise<boolean> => {
  return trackAccountCreation(ip);
};

export const detectAuthFailureAbuse = async (ip: string, email?: string): Promise<boolean> => {
  return trackFailedAuth(ip, email);
};

export const detectSpamAbuse = async (ip: string, action: string): Promise<boolean> => {
  return trackSpam(ip, action);
};

export const detectConcurrentSessions = async (uid: string): Promise<boolean> => {
  return checkConcurrentSessions(uid);
};

// Cooldown mechanism
export const applyCooldown = async (identifier: string, duration: number = 60): Promise<boolean> => {
  try {
    const key = `abuse:cooldown:${identifier}`;
    const existing = await redisGet(key);
    
    if (existing) {
      const remaining = parseInt(existing);
      return remaining > Date.now();
    }

    await redisSet(key, (Date.now() + duration * 1000).toString(), duration);
    return false;
  } catch (error) {
    logger.error('Failed to apply cooldown', error as Error);
    return false;
  }
};

export const getCooldownRemaining = async (identifier: string): Promise<number> => {
  try {
    const key = `abuse:cooldown:${identifier}`;
    const expiry = await redisGet(key);
    
    if (!expiry) return 0;
    
    const remaining = parseInt(expiry) - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  } catch (error) {
    logger.error('Failed to get cooldown remaining', error as Error);
    return 0;
  }
};
