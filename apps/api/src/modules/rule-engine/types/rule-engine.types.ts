import { MatchStats } from '../../match-simulator/types/match-simulator.types';

export interface StrategyCondition {
  indicator: string;
  team: string;
  quantity: number;
  operator: string;
}

export interface Strategy {
  strategyId: string;
  userId: string;
  name: string;
  description?: string;
  startMinute: number;
  endMinute: number;
  status: string;
  conditions: StrategyCondition[];
}

export interface RuleEngineInput {
  matchId: string;
  minute: number;
  stats: MatchStats;
  strategy: Strategy;
}

export interface ConditionEvaluationResult {
  conditionIndex: number;
  indicator: string;
  team: string;
  expectedValue: number;
  actualValue: number;
  operator: string;
  passed: boolean;
}

export interface RuleEngineOutput {
  matchId: string;
  strategyId: string;
  strategyName: string;
  result: boolean;
  minute: number;
  matchedConditions: ConditionEvaluationResult[];
  failedConditions: ConditionEvaluationResult[];
  timestamp: Date;
}

export interface RuleEngineConfig {
  enableLogging: boolean;
}
