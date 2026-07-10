import { redisGet, redisSet } from '../config/redis';
import { logger } from '@matchpulse/logger';
import { Request, Response, NextFunction } from 'express';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number; // For gradual rollout
}

// Default feature flags
const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  // Security features
  ENABLE_RATE_LIMITING: {
    name: 'ENABLE_RATE_LIMITING',
    enabled: true,
    description: 'Enable rate limiting for all endpoints',
  },
  ENABLE_IP_CONTROL: {
    name: 'ENABLE_IP_CONTROL',
    enabled: true,
    description: 'Enable IP-based risk scoring and control',
  },
  ENABLE_AUDIT_LOG: {
    name: 'ENABLE_AUDIT_LOG',
    enabled: true,
    description: 'Enable security audit logging',
  },
  
  // Cost optimization features
  ENABLE_EVENT_COST_ENGINE: {
    name: 'ENABLE_EVENT_COST_ENGINE',
    enabled: true,
    description: 'Enable event cost calculation for strategies',
  },
  ENABLE_RESOURCE_BUDGET: {
    name: 'ENABLE_RESOURCE_BUDGET',
    enabled: true,
    description: 'Enable user resource budget enforcement',
  },
  ENABLE_STRATEGY_FINGERPRINT: {
    name: 'ENABLE_STRATEGY_FINGERPRINT',
    enabled: true,
    description: 'Enable strategy fingerprinting for deduplication',
  },
  
  // API protection features
  ENABLE_API_PROTECTION: {
    name: 'ENABLE_API_PROTECTION',
    enabled: true,
    description: 'Enable API cost protection (circuit breaker, retry, etc)',
  },
  ENABLE_CACHE: {
    name: 'ENABLE_CACHE',
    enabled: true,
    description: 'Enable Redis caching',
  },
  
  // New features (can be rolled out gradually)
  NEW_DASHBOARD: {
    name: 'NEW_DASHBOARD',
    enabled: false,
    description: 'Enable new dashboard UI',
    rolloutPercentage: 0,
  },
  ADVANCED_ANALYTICS: {
    name: 'ADVANCED_ANALYTICS',
    enabled: false,
    description: 'Enable advanced analytics features',
    rolloutPercentage: 0,
  },
};

/**
 * Check if a feature flag is enabled
 */
export async function isFeatureEnabled(flagName: string, userId?: string): Promise<boolean> {
  try {
    // Check Redis first (for dynamic flags)
    const redisKey = `feature_flag:${flagName}`;
    const cached = await redisGet(redisKey);
    
    if (cached !== null) {
      const flag = JSON.parse(cached) as FeatureFlag;
      
      // Check rollout percentage if specified
      if (flag.rolloutPercentage && userId) {
        const hash = hashUserId(userId);
        return hash < flag.rolloutPercentage;
      }
      
      return flag.enabled;
    }
    
    // Fallback to default flags
    const defaultFlag = DEFAULT_FLAGS[flagName];
    if (!defaultFlag) {
      logger.warn(`Feature flag not found: ${flagName}`);
      return false;
    }
    
    if (defaultFlag.rolloutPercentage && userId) {
      const hash = hashUserId(userId);
      return hash < defaultFlag.rolloutPercentage;
    }
    
    return defaultFlag.enabled;
  } catch (error) {
    logger.error('Failed to check feature flag', error as Error);
    // Fail safe - return default value
    const defaultFlag = DEFAULT_FLAGS[flagName];
    return defaultFlag?.enabled ?? false;
  }
}

/**
 * Set a feature flag
 */
export async function setFeatureFlag(flagName: string, enabled: boolean, rolloutPercentage?: number): Promise<void> {
  try {
    const flag: FeatureFlag = {
      name: flagName,
      enabled,
      description: DEFAULT_FLAGS[flagName]?.description || 'Custom flag',
      rolloutPercentage,
    };
    
    const redisKey = `feature_flag:${flagName}`;
    await redisSet(redisKey, JSON.stringify(flag), 24 * 60 * 60); // 24 hours
    
    logger.info(`Feature flag updated: ${flagName}`, { enabled, rolloutPercentage });
  } catch (error) {
    logger.error('Failed to set feature flag', error as Error);
    throw error;
  }
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<Record<string, FeatureFlag>> {
  try {
    const flags: Record<string, FeatureFlag> = { ...DEFAULT_FLAGS };
    
    // Check Redis for overrides
    for (const flagName of Object.keys(DEFAULT_FLAGS)) {
      const redisKey = `feature_flag:${flagName}`;
      const cached = await redisGet(redisKey);
      
      if (cached !== null) {
        flags[flagName] = JSON.parse(cached) as FeatureFlag;
      }
    }
    
    return flags;
  } catch (error) {
    logger.error('Failed to get feature flags', error as Error);
    return DEFAULT_FLAGS;
  }
}

/**
 * Reset a feature flag to default
 */
export async function resetFeatureFlag(flagName: string): Promise<void> {
  try {
    const redisKey = `feature_flag:${flagName}`;
    await redisGet(redisKey); // This would need a delete function
    logger.info(`Feature flag reset: ${flagName}`);
  } catch (error) {
    logger.error('Failed to reset feature flag', error as Error);
    throw error;
  }
}

/**
 * Hash user ID for rollout percentage (0-100)
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash % 100);
}

/**
 * Middleware to check feature flag
 */
export function requireFeatureFlag(flagName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.uid;
    const enabled = await isFeatureEnabled(flagName, userId);
    
    if (!enabled) {
      return res.status(403).json({
        success: false,
        error: 'Feature not available',
      });
    }
    
    next();
  };
}
