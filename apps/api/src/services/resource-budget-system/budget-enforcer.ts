import { getUserBudget, updateUserBudget, hasEnoughBudget } from './budget-tracker';
import { eventCostEngine } from '../event-cost-engine/event-cost-engine';
import { StrategyInput } from '../event-cost-engine/complexity-calculator';
import { logger } from '@matchpulse/logger';

export class BudgetEnforcer {
  /**
   * Check if user can create a strategy based on budget
   */
  async canCreateStrategy(userId: string, strategy: StrategyInput): Promise<{ allowed: boolean; reason?: string; budget?: unknown }> {
    try {
      // Calculate strategy cost
      const complexity = await eventCostEngine.calculateStrategyCost(strategy);
      
      // Check if user has enough budget
      const enoughBudget = await hasEnoughBudget(userId, complexity.totalScore);
      
      if (!enoughBudget) {
        const budget = await getUserBudget(userId);
        return {
          allowed: false,
          reason: `Insufficient budget. Required: ${complexity.totalScore}, Available: ${budget.remainingBudget}`,
          budget,
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Failed to check budget for strategy creation', error as Error);
      return { allowed: false, reason: 'Failed to validate budget' };
    }
  }

  /**
   * Deduct budget when strategy is created
   */
  async deductStrategyCost(userId: string, strategy: StrategyInput): Promise<void> {
    try {
      const complexity = await eventCostEngine.calculateStrategyCost(strategy);
      await updateUserBudget(userId, complexity.totalScore);
      logger.info(`Budget deducted for user ${userId}`, { cost: complexity.totalScore });
    } catch (error) {
      logger.error('Failed to deduct strategy cost', error as Error);
      throw error;
    }
  }

  /**
   * Refund budget when strategy is deleted
   */
  async refundStrategyCost(userId: string, strategy: StrategyInput): Promise<void> {
    try {
      const complexity = await eventCostEngine.calculateStrategyCost(strategy);
      await updateUserBudget(userId, -complexity.totalScore);
      logger.info(`Budget refunded for user ${userId}`, { cost: complexity.totalScore });
    } catch (error) {
      logger.error('Failed to refund strategy cost', error as Error);
      throw error;
    }
  }

  /**
   * Get user budget summary
   */
  async getBudgetSummary(userId: string) {
    return getUserBudget(userId);
  }
}

// Singleton instance
export const budgetEnforcer = new BudgetEnforcer();
