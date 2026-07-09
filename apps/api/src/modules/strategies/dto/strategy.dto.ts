import { z } from 'zod';

export const createStrategyConditionDto = z.object({
  indicator: z.enum(['GOALS', 'CORNERS', 'DANGEROUS_ATTACKS', 'SHOTS_ON_GOAL', 'CARDS', 'FOULS', 'OFFSIDES', 'BALL_POSSESSION']),
  team: z.enum(['HOME', 'AWAY', 'MATCH']),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  operator: z.enum(['ANY', 'MORE', 'LESS']),
});

export const updateStrategyConditionDto = z.object({
  indicator: z.enum(['GOALS', 'CORNERS', 'DANGEROUS_ATTACKS', 'SHOTS_ON_GOAL', 'CARDS', 'FOULS', 'OFFSIDES', 'BALL_POSSESSION']).optional(),
  team: z.enum(['HOME', 'AWAY', 'MATCH']).optional(),
  quantity: z.number().int().min(0, 'Quantity must be non-negative').optional(),
  operator: z.enum(['ANY', 'MORE', 'LESS']).optional(),
});

export const createStrategyDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  startMinute: z.number().int().min(1, 'Start minute must be at least 1').max(90, 'Start minute must be at most 90').default(1),
  endMinute: z.number().int().min(1, 'End minute must be at least 1').max(90, 'End minute must be at most 90').default(90),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
  leagues: z.array(z.string()).optional(),
  conditions: z.array(createStrategyConditionDto).optional(),
});

export const updateStrategyDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  startMinute: z.number().int().min(1, 'Start minute must be at least 1').max(90, 'Start minute must be at most 90').optional(),
  endMinute: z.number().int().min(1, 'End minute must be at least 1').max(90, 'End minute must be at most 90').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  leagues: z.array(z.string()).optional(),
  conditions: z.array(createStrategyConditionDto).optional(),
});

export const updateStrategyStatusDto = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const strategyResponseDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  startMinute: z.number(),
  endMinute: z.number(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  visibility: z.enum(['PRIVATE', 'PUBLIC']),
  leagues: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const strategyConditionResponseDto = z.object({
  id: z.string().uuid(),
  strategyId: z.string().uuid(),
  indicator: z.enum(['GOALS', 'CORNERS', 'DANGEROUS_ATTACKS', 'SHOTS_ON_GOAL', 'CARDS', 'FOULS', 'OFFSIDES', 'BALL_POSSESSION']),
  team: z.enum(['HOME', 'AWAY', 'MATCH']),
  quantity: z.number(),
  operator: z.enum(['ANY', 'MORE', 'LESS']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateStrategyDto = z.infer<typeof createStrategyDto>;
export type UpdateStrategyDto = z.infer<typeof updateStrategyDto>;
export type UpdateStrategyStatusDto = z.infer<typeof updateStrategyStatusDto>;
export type CreateStrategyConditionDto = z.infer<typeof createStrategyConditionDto>;
export type UpdateStrategyConditionDto = z.infer<typeof updateStrategyConditionDto>;
export type StrategyResponseDto = z.infer<typeof strategyResponseDto>;
export type StrategyConditionResponseDto = z.infer<typeof strategyConditionResponseDto>;
