import { prisma } from '../../common/config/prisma';
import { logger } from '@matchpulse/logger';
import { generateFingerprint, StrategyData } from './fingerprint-generator';

/**
 * Save strategy fingerprint to database
 */
export async function saveFingerprint(strategyId: string, strategyData: StrategyData): Promise<string> {
  try {
    const fingerprint = generateFingerprint(strategyData);
    
    await prisma.strategyFingerprint.create({
      data: {
        strategyId,
        fingerprint,
      },
    });
    
    logger.info(`Fingerprint saved for strategy ${strategyId}`);
    return fingerprint;
  } catch (error) {
    logger.error('Failed to save fingerprint', error as Error);
    throw error;
  }
}

/**
 * Get fingerprint by strategy ID
 */
export async function getFingerprint(strategyId: string): Promise<string | null> {
  try {
    const fp = await prisma.strategyFingerprint.findUnique({
      where: { strategyId },
    });
    
    return fp?.fingerprint || null;
  } catch (error) {
    logger.error('Failed to get fingerprint', error as Error);
    return null;
  }
}

/**
 * Find strategies with similar fingerprints
 */
export async function findSimilarStrategies(fingerprint: string, _threshold: number = 85): Promise<string[]> {
  try {
    // This would need a more sophisticated implementation with proper database queries
    // For now, return empty array
    logger.warn('findSimilarStrategies not fully implemented');
    return [];
  } catch (error) {
    logger.error('Failed to find similar strategies', error as Error);
    return [];
  }
}

/**
 * Update fingerprint when strategy is modified
 */
export async function updateFingerprint(strategyId: string, strategyData: StrategyData): Promise<string> {
  try {
    const fingerprint = generateFingerprint(strategyData);
    
    await prisma.strategyFingerprint.update({
      where: { strategyId },
      data: { fingerprint },
    });
    
    logger.info(`Fingerprint updated for strategy ${strategyId}`);
    return fingerprint;
  } catch (error) {
    logger.error('Failed to update fingerprint', error as Error);
    throw error;
  }
}

/**
 * Delete fingerprint when strategy is deleted
 */
export async function deleteFingerprint(strategyId: string): Promise<void> {
  try {
    await prisma.strategyFingerprint.delete({
      where: { strategyId },
    });
    
    logger.info(`Fingerprint deleted for strategy ${strategyId}`);
  } catch (error) {
    logger.error('Failed to delete fingerprint', error as Error);
    throw error;
  }
}
