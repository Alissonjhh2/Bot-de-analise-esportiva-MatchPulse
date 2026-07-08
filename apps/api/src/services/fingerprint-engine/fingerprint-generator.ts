import crypto from 'crypto';
import { logger } from '@matchpulse/logger';

export interface StrategyData {
  leagues: string[];
  conditions: Record<string, unknown>[];
  startMinute: number;
  endMinute: number;
  indicators: string[];
}

/**
 * Normalize strategy data for consistent fingerprinting
 */
function normalizeStrategy(strategy: StrategyData): string {
  // Sort leagues alphabetically
  const sortedLeagues = [...strategy.leagues].sort();
  
  // Sort conditions by indicator, team, operator, quantity
  const sortedConditions = [...strategy.conditions].sort((a, b) => {
    if (a.indicator !== b.indicator) return String(a.indicator).localeCompare(String(b.indicator));
    if (a.team !== b.team) return String(a.team).localeCompare(String(b.team));
    if (a.operator !== b.operator) return String(a.operator).localeCompare(String(b.operator));
    return Number(a.quantity) - Number(b.quantity);
  });
  
  // Sort indicators
  const sortedIndicators = [...strategy.indicators].sort();
  
  // Create normalized object
  const normalized = {
    leagues: sortedLeagues,
    conditions: sortedConditions,
    startMinute: strategy.startMinute,
    endMinute: strategy.endMinute,
    indicators: sortedIndicators,
  };
  
  return JSON.stringify(normalized);
}

/**
 * Generate SHA-256 hash of strategy data
 */
export function generateFingerprint(strategy: StrategyData): string {
  try {
    const normalized = normalizeStrategy(strategy);
    const hash = crypto.createHash('sha256').update(normalized).digest('hex');
    return hash;
  } catch (error) {
    logger.error('Failed to generate fingerprint', error as Error);
    throw error;
  }
}

/**
 * Generate fingerprint from strategy ID (for existing strategies)
 */
export function generateFingerprintFromId(strategyId: string): string {
  return crypto.createHash('sha256').update(strategyId).digest('hex');
}
