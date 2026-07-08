export type Plan = 'FREE' | 'PREMIUM' | 'ENTERPRISE';

export interface BudgetConfig {
  totalBudget: number;
  maxStrategies: number;
  maxComplexity: number;
}

// Budget configurations per plan
export const BUDGET_CONFIGS: Record<Plan, BudgetConfig> = {
  FREE: {
    totalBudget: 100,
    maxStrategies: 1,
    maxComplexity: 100,
  },
  PREMIUM: {
    totalBudget: 500,
    maxStrategies: 10,
    maxComplexity: 500,
  },
  ENTERPRISE: {
    totalBudget: 99999,
    maxStrategies: 999,
    maxComplexity: 9999,
  },
};

// Get budget config for a plan
export function getBudgetConfig(plan: Plan): BudgetConfig {
  return BUDGET_CONFIGS[plan] || BUDGET_CONFIGS.FREE;
}

// Check if user can create a strategy based on plan
export function canCreateStrategy(plan: Plan, currentStrategies: number): boolean {
  const config = getBudgetConfig(plan);
  return currentStrategies < config.maxStrategies;
}

// Get remaining budget
export function getRemainingBudget(plan: Plan, usedBudget: number): number {
  const config = getBudgetConfig(plan);
  return Math.max(0, config.totalBudget - usedBudget);
}
