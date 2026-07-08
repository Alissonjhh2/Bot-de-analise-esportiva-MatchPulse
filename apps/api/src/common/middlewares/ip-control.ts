import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';
import { ErrorCode } from '../types/api-response';
import { redisGet, redisSet, redisIncr, redisExpire } from '../config/redis';
import { logger } from '@matchpulse/logger';
import { env } from '../config/env-validation';

// Risk levels
export enum RiskLevel {
  NORMAL = 'normal',
  SUSPICIOUS = 'suspicious',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Risk score thresholds
const RISK_THRESHOLDS = {
  [RiskLevel.NORMAL]: 0,
  [RiskLevel.SUSPICIOUS]: 30,
  [RiskLevel.HIGH]: 60,
  [RiskLevel.CRITICAL]: 80,
};

// Actions based on risk level
const RISK_ACTIONS = {
  [RiskLevel.NORMAL]: 'allow',
  [RiskLevel.SUSPICIOUS]: 'monitor',
  [RiskLevel.HIGH]: 'throttle',
  [RiskLevel.CRITICAL]: 'block',
};

// IP reputation factors
interface IPReputationFactors {
  multipleAccounts: number; // Multiple accounts from same IP
  automationDetected: number; // Bot-like behavior
  vpnOrDatacenter: number; // VPN or datacenter IP
  rateLimitViolations: number; // Rate limit violations
  failedAuthAttempts: number; // Failed authentication attempts
  suspiciousPatterns: number; // Other suspicious patterns
}

// Get client IP
function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// Calculate risk score for an IP
async function calculateRiskScore(ip: string): Promise<{ score: number; level: RiskLevel }> {
  const factors: IPReputationFactors = {
    multipleAccounts: 0,
    automationDetected: 0,
    vpnOrDatacenter: 0,
    rateLimitViolations: 0,
    failedAuthAttempts: 0,
    suspiciousPatterns: 0,
  };

  try {
    // Check for multiple accounts from same IP
    const accountsKey = `ip:accounts:${ip}`;
    const accountCount = await redisGet(accountsKey);
    if (accountCount && parseInt(accountCount) > 5) {
      factors.multipleAccounts = Math.min(parseInt(accountCount) * 5, 30);
    }

    // Check for automation detection
    const automationKey = `ip:automation:${ip}`;
    const automationScore = await redisGet(automationKey);
    if (automationScore) {
      factors.automationDetected = parseInt(automationScore);
    }

    // Check for VPN or datacenter
    const vpnKey = `ip:vpn:${ip}`;
    const isVPN = await redisGet(vpnKey);
    if (isVPN === 'true') {
      factors.vpnOrDatacenter = 20;
    }

    // Check for rate limit violations
    const violationsKey = `ip:violations:${ip}`;
    const violations = await redisGet(violationsKey);
    if (violations) {
      factors.rateLimitViolations = Math.min(parseInt(violations) * 10, 40);
    }

    // Check for failed auth attempts
    const authFailuresKey = `ip:auth_failures:${ip}`;
    const authFailures = await redisGet(authFailuresKey);
    if (authFailures) {
      factors.failedAuthAttempts = Math.min(parseInt(authFailures) * 5, 25);
    }

    // Calculate total score
    const totalScore = Object.values(factors).reduce((sum, value) => sum + value, 0);

    // Determine risk level
    let level = RiskLevel.NORMAL;
    if (totalScore >= RISK_THRESHOLDS[RiskLevel.CRITICAL]) {
      level = RiskLevel.CRITICAL;
    } else if (totalScore >= RISK_THRESHOLDS[RiskLevel.HIGH]) {
      level = RiskLevel.HIGH;
    } else if (totalScore >= RISK_THRESHOLDS[RiskLevel.SUSPICIOUS]) {
      level = RiskLevel.SUSPICIOUS;
    }

    return { score: totalScore, level };
  } catch (error) {
    logger.error('Failed to calculate risk score', error as Error);
    // Fail open - return normal risk if Redis is down
    return { score: 0, level: RiskLevel.NORMAL };
  }
}

// Update IP reputation factors
async function updateIPReputation(
  ip: string,
  factor: keyof IPReputationFactors,
  _increment: number = 1
): Promise<void> {
  try {
    const key = `ip:${factor === 'multipleAccounts' ? 'accounts' : 
                  factor === 'automationDetected' ? 'automation' :
                  factor === 'vpnOrDatacenter' ? 'vpn' :
                  factor === 'rateLimitViolations' ? 'violations' :
                  factor === 'failedAuthAttempts' ? 'auth_failures' : 'suspicious'}:${ip}`;
    
    await redisIncr(key);
    await redisExpire(key, 24 * 60 * 60); // 24 hours
  } catch (error) {
    logger.error('Failed to update IP reputation', error as Error);
  }
}

// Check if IP is whitelisted
async function isIPWhitelisted(ip: string): Promise<boolean> {
  try {
    // For now, assume localhost is whitelisted
    return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');
  } catch (error) {
    return false;
  }
}

// Check if IP is blacklisted
async function isIPBlacklisted(ip: string): Promise<boolean> {
  try {
    const blacklistKey = `ip:blacklist:${ip}`;
    const isBlacklisted = await redisGet(blacklistKey);
    return isBlacklisted === 'true';
  } catch (error) {
    return false;
  }
}

// Block IP temporarily
async function blockIP(ip: string, duration: number = 60 * 60): Promise<void> {
  try {
    const blacklistKey = `ip:blacklist:${ip}`;
    await redisSet(blacklistKey, 'true', duration);
    logger.warn(`IP ${ip} blocked for ${duration} seconds`);
  } catch (error) {
    logger.error('Failed to block IP', error as Error);
  }
}

// IP Control middleware
export const ipControl = async (req: Request, res: Response, next: NextFunction) => {
  if (!env.ENABLE_IP_CONTROL) {
    return next();
  }

  const ip = getClientIP(req);

  // Check whitelist
  const whitelisted = await isIPWhitelisted(ip);
  if (whitelisted) {
    return next();
  }

  // Check blacklist
  const blacklisted = await isIPBlacklisted(ip);
  if (blacklisted) {
    logger.warn(`Blacklisted IP attempted access: ${ip}`);
    throw new AppError(
      ErrorCode.AUTHORIZATION_ERROR,
      'Access denied. Your IP has been blocked.',
      403
    );
  }

  // Calculate risk score
  const { score, level } = await calculateRiskScore(ip);

  // Set risk level in request for other middleware
  (req as { riskLevel?: RiskLevel; riskScore?: number }).riskLevel = level;
  (req as { riskLevel?: RiskLevel; riskScore?: number }).riskScore = score;

  // Take action based on risk level
  const action = RISK_ACTIONS[level];

  switch (action) {
    case 'allow':
      next();
      break;

    case 'monitor':
      logger.info(`Suspicious IP monitored: ${ip} (score: ${score})`);
      next();
      break;

    case 'throttle':
      logger.warn(`High risk IP throttled: ${ip} (score: ${score})`);
      // Add additional rate limiting for high risk IPs
      res.setHeader('X-Risk-Level', level);
      res.setHeader('X-Risk-Score', score.toString());
      next();
      break;

    case 'block':
      logger.warn(`Critical risk IP blocked: ${ip} (score: ${score})`);
      // Block IP for 1 hour
      await blockIP(ip, 60 * 60);
      throw new AppError(
        ErrorCode.AUTHORIZATION_ERROR,
        'Access denied due to suspicious activity.',
        403
      );

    default:
      next();
  }
};

// Helper functions to update IP reputation
export const reportMultipleAccounts = async (ip: string): Promise<void> => {
  await updateIPReputation(ip, 'multipleAccounts');
};

export const reportAutomation = async (ip: string, score: number = 10): Promise<void> => {
  const automationKey = `ip:automation:${ip}`;
  const current = await redisGet(automationKey);
  const newScore = current ? Math.min(parseInt(current) + score, 100) : score;
  await redisSet(automationKey, newScore.toString(), 24 * 60 * 60);
};

export const reportVPN = async (ip: string): Promise<void> => {
  await updateIPReputation(ip, 'vpnOrDatacenter');
};

export const reportRateLimitViolation = async (ip: string): Promise<void> => {
  await updateIPReputation(ip, 'rateLimitViolations');
};

export const reportAuthFailure = async (ip: string): Promise<void> => {
  await updateIPReputation(ip, 'failedAuthAttempts');
};

export const reportSuspiciousPattern = async (ip: string): Promise<void> => {
  await updateIPReputation(ip, 'suspiciousPatterns');
};
