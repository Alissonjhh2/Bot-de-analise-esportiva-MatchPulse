import { calculateComplexity, isComplexityAcceptable, getMaxComplexity, StrategyInput, ComplexityResult } from './complexity-calculator';

export class EventCostEngine {
  /**
   * Calculate the computational cost of a strategy
   */
  async calculateStrategyCost(strategy: StrategyInput): Promise<ComplexityResult> {
    return calculateComplexity(strategy);
  }

  /**
   * Check if a strategy's complexity is acceptable for the user's plan
   */
  async isStrategyAcceptable(strategy: StrategyInput, plan: string): Promise<{ acceptable: boolean; complexity: ComplexityResult; maxAllowed: number }> {
    const complexity = await this.calculateStrategyCost(strategy);
    const maxAllowed = getMaxComplexity(plan);
    const acceptable = await isComplexityAcceptable(complexity.totalScore, plan);

    return {
      acceptable,
      complexity,
      maxAllowed,
    };
  }

  /**
   * Validate a strategy before creation/update
   */
  async validateStrategy(strategy: StrategyInput, plan: string): Promise<{ valid: boolean; reason?: string; complexity?: ComplexityResult }> {
    const result = await this.isStrategyAcceptable(strategy, plan);

    if (!result.acceptable) {
      return {
        valid: false,
        reason: `Strategy complexity (${result.complexity.totalScore}) exceeds maximum allowed for ${plan} plan (${result.maxAllowed})`,
        complexity: result.complexity,
      };
    }

    return {
      valid: true,
      complexity: result.complexity,
    };
  }

  /**
   * Get complexity breakdown for UI display
   */
  async getComplexityBreakdown(strategy: StrategyInput): Promise<ComplexityResult> {
    return this.calculateStrategyCost(strategy);
  }
}

// Singleton instance
export const eventCostEngine = new EventCostEngine();
