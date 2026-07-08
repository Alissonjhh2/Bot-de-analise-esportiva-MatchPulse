import { getCostWeights } from './cost-weights';
import { logger } from '@matchpulse/logger';

export interface StrategyInput {
  leagues: string[];
  conditions: number;
  indicators: string[];
  apiCalls: number;
  events: number;
  notifications: boolean;
  frequency: number; // checks per minute
}

export interface ComplexityResult {
  totalScore: number;
  breakdown: {
    leagueCost: number;
    conditionCost: number;
    indicatorCost: number;
    apiCost: number;
    eventCost: number;
    notificationCost: number;
    frequencyCost: number;
  };
}

// Calculate complexity score for a strategy
export async function calculateComplexity(strategy: StrategyInput): Promise<ComplexityResult> {
  try {
    const weights = await getCostWeights();

    // Calculate individual costs
    const leagueCost = Math.floor(strategy.leagues.length * 10 * weights.leagueWeight);
    const conditionCost = Math.floor(strategy.conditions * 5 * weights.conditionWeight);
    const indicatorCost = Math.floor(strategy.indicators.length * 3 * weights.indicatorWeight);
    const apiCost = Math.floor(strategy.apiCalls * 20 * weights.apiWeight);
    const eventCost = Math.floor(strategy.events * 15 * weights.eventWeight);
    const notificationCost = strategy.notifications ? Math.floor(50 * weights.notificationWeight) : 0;
    const frequencyCost = Math.floor(strategy.frequency * 2 * weights.frequencyWeight);

    // Calculate total score
    const totalScore = leagueCost + conditionCost + indicatorCost + apiCost + eventCost + notificationCost + frequencyCost;

    const result: ComplexityResult = {
      totalScore,
      breakdown: {
        leagueCost,
        conditionCost,
        indicatorCost,
        apiCost,
        eventCost,
        notificationCost,
        frequencyCost,
      },
    };

    logger.info('Complexity calculated', { totalScore, breakdown: result.breakdown });
    return result;
  } catch (error) {
    logger.error('Failed to calculate complexity', error as Error);
    throw error;
  }
}

// Check if complexity exceeds maximum allowed
export async function isComplexityAcceptable(complexity: number, plan: string): Promise<boolean> {
  const MAX_COMPLEXITY = {
    FREE: 100,
    PREMIUM: 500,
    ENTERPRISE: 9999,
  };

  const max = MAX_COMPLEXITY[plan as keyof typeof MAX_COMPLEXITY] || MAX_COMPLEXITY.FREE;
  return complexity <= max;
}

// Get maximum complexity for a plan
export function getMaxComplexity(plan: string): number {
  const MAX_COMPLEXITY = {
    FREE: 100,
    PREMIUM: 500,
    ENTERPRISE: 9999,
  };

  return MAX_COMPLEXITY[plan as keyof typeof MAX_COMPLEXITY] || MAX_COMPLEXITY.FREE;
}
