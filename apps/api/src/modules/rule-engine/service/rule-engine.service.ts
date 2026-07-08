import { RuleEngineInput, RuleEngineOutput, ConditionEvaluationResult, RuleEngineConfig } from '../types/rule-engine.types';
import { getStatValue, evaluateCondition, isWithinTimeRange } from '../utils/rule-engine.utils';
import { logger } from '@matchpulse/logger';

export class RuleEngineService {
  private config: RuleEngineConfig;

  constructor(config?: Partial<RuleEngineConfig>) {
    this.config = {
      enableLogging: config?.enableLogging ?? true,
    };
  }

  evaluate(input: RuleEngineInput): RuleEngineOutput {
    const { matchId, minute, stats, strategy } = input;

    // Check if strategy is active
    if (strategy.status !== 'ACTIVE') {
      if (this.config.enableLogging) {
        logger.debug(`Strategy ${strategy.strategyId} is not active, skipping`);
      }
      return this.createOutput(matchId, strategy, minute, false, [], []);
    }

    // Check time range
    if (!isWithinTimeRange(minute, strategy.startMinute, strategy.endMinute)) {
      if (this.config.enableLogging) {
        logger.debug(`Strategy ${strategy.strategyId} not in time range (${strategy.startMinute}-${strategy.endMinute}), current minute: ${minute}`);
      }
      return this.createOutput(matchId, strategy, minute, false, [], []);
    }

    // Evaluate all conditions
    const results: ConditionEvaluationResult[] = [];
    let allPassed = true;

    strategy.conditions.forEach((condition, index) => {
      const actualValue = getStatValue(stats, condition.indicator, condition.team);
      const passed = evaluateCondition(actualValue, condition.quantity, condition.operator);

      const result: ConditionEvaluationResult = {
        conditionIndex: index,
        indicator: condition.indicator,
        team: condition.team,
        expectedValue: condition.quantity,
        actualValue,
        operator: condition.operator,
        passed,
      };

      results.push(result);

      if (!passed) {
        allPassed = false;
      }
    });

    const output = this.createOutput(
      matchId,
      strategy,
      minute,
      allPassed,
      results.filter((r) => r.passed),
      results.filter((r) => !r.passed)
    );

    if (this.config.enableLogging && allPassed) {
      logger.info(`🎯 STRATEGY MATCHED! Strategy: ${strategy.name} (${strategy.strategyId}) at minute ${minute}`);
    }

    return output;
  }

  evaluateBatch(inputs: RuleEngineInput[]): RuleEngineOutput[] {
    return inputs.map((input) => this.evaluate(input));
  }

  private createOutput(
    matchId: string,
    strategy: { strategyId: string; name: string; userId: string },
    minute: number,
    result: boolean,
    matchedConditions: ConditionEvaluationResult[],
    failedConditions: ConditionEvaluationResult[]
  ): RuleEngineOutput {
    return {
      matchId,
      strategyId: strategy.strategyId,
      strategyName: strategy.name,
      result,
      minute,
      matchedConditions,
      failedConditions,
      timestamp: new Date(),
    };
  }
}
