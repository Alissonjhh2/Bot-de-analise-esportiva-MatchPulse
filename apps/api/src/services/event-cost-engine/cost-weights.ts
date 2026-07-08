import { prisma } from '../../common/config/prisma';
import { logger } from '@matchpulse/logger';

export interface CostWeights {
  leagueWeight: number;
  conditionWeight: number;
  indicatorWeight: number;
  apiWeight: number;
  eventWeight: number;
  notificationWeight: number;
  frequencyWeight: number;
}

// Default cost weights
const DEFAULT_WEIGHTS: CostWeights = {
  leagueWeight: 1.0,
  conditionWeight: 1.0,
  indicatorWeight: 1.0,
  apiWeight: 1.0,
  eventWeight: 1.0,
  notificationWeight: 1.0,
  frequencyWeight: 1.0,
};

// Get current cost weights from database
export async function getCostWeights(): Promise<CostWeights> {
  try {
    const weights = await prisma.costWeights.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!weights) {
      logger.info('No cost weights found in database, using defaults');
      return DEFAULT_WEIGHTS;
    }

    return {
      leagueWeight: weights.leagueWeight,
      conditionWeight: weights.conditionWeight,
      indicatorWeight: weights.indicatorWeight,
      apiWeight: weights.apiWeight,
      eventWeight: weights.eventWeight,
      notificationWeight: weights.notificationWeight,
      frequencyWeight: weights.frequencyWeight,
    };
  } catch (error) {
    logger.error('Failed to get cost weights, using defaults', error as Error);
    return DEFAULT_WEIGHTS;
  }
}

// Update cost weights
export async function updateCostWeights(weights: Partial<CostWeights>): Promise<CostWeights> {
  try {
    const current = await getCostWeights();
    const updated = { ...current, ...weights };

    await prisma.costWeights.create({
      data: updated,
    });

    logger.info('Cost weights updated', updated);
    return updated;
  } catch (error) {
    logger.error('Failed to update cost weights', error as Error);
    throw error;
  }
}

// Reset cost weights to defaults
export async function resetCostWeights(): Promise<CostWeights> {
  try {
    await prisma.costWeights.create({
      data: DEFAULT_WEIGHTS,
    });

    logger.info('Cost weights reset to defaults');
    return DEFAULT_WEIGHTS;
  } catch (error) {
    logger.error('Failed to reset cost weights', error as Error);
    throw error;
  }
}
