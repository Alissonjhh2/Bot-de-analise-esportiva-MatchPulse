import { prisma } from '../../common/config/prisma';
import { logger } from '@matchpulse/logger';

export type Plan = 'FREE' | 'PREMIUM' | 'ENTERPRISE';

export interface UserBudgetInfo {
  userId: string;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  plan: Plan;
}

// Get user budget information
export async function getUserBudget(userId: string): Promise<UserBudgetInfo> {
  try {
    let budget = await prisma.userBudget.findUnique({
      where: { userId },
    });

    // If budget doesn't exist, create it based on user's plan
    if (!budget) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const config = getBudgetConfigForPlan(user.plan);
      budget = await prisma.userBudget.create({
        data: {
          userId,
          totalBudget: config.totalBudget,
          usedBudget: 0,
          plan: user.plan,
        },
      });
    }

    return {
      userId: budget.userId,
      totalBudget: budget.totalBudget,
      usedBudget: budget.usedBudget,
      remainingBudget: budget.totalBudget - budget.usedBudget,
      plan: budget.plan,
    };
  } catch (error) {
    logger.error('Failed to get user budget', error as Error);
    throw error;
  }
}

// Update user budget (add or subtract)
export async function updateUserBudget(userId: string, delta: number): Promise<UserBudgetInfo> {
  try {
    const budget = await prisma.userBudget.findUnique({
      where: { userId },
    });

    if (!budget) {
      throw new Error('User budget not found');
    }

    const newUsedBudget = Math.max(0, budget.usedBudget + delta);
    
    const updated = await prisma.userBudget.update({
      where: { userId },
      data: { usedBudget: newUsedBudget },
    });

    return {
      userId: updated.userId,
      totalBudget: updated.totalBudget,
      usedBudget: updated.usedBudget,
      remainingBudget: updated.totalBudget - updated.usedBudget,
      plan: updated.plan,
    };
  } catch (error) {
    logger.error('Failed to update user budget', error as Error);
    throw error;
  }
}

// Check if user has enough budget for a strategy
export async function hasEnoughBudget(userId: string, requiredCost: number): Promise<boolean> {
  try {
    const budget = await getUserBudget(userId);
    return budget.remainingBudget >= requiredCost;
  } catch (error) {
    logger.error('Failed to check budget', error as Error);
    return false;
  }
}

// Get budget config for a plan (temporary until Prisma is regenerated)
function getBudgetConfigForPlan(plan: Plan): { totalBudget: number } {
  const configs: Record<string, { totalBudget: number }> = {
    FREE: { totalBudget: 100 },
    PREMIUM: { totalBudget: 500 },
    ENTERPRISE: { totalBudget: 99999 },
  };
  return configs[plan] || configs.FREE;
}
