import { z } from 'zod';
import { nameSchema } from './common';

// Strategy condition validation schemas
export const createStrategyConditionSchema = z.object({
  indicator: z.enum(['GOALS', 'CORNERS', 'OFFENSIVE_PRESSURE', 'SHOTS_ON_GOAL', 'CARDS', 'FOULS', 'OFFSIDES', 'BALL_POSSESSION']),
  team: z.enum(['HOME', 'AWAY', 'MATCH']),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  operator: z.enum(['ANY', 'MORE', 'LESS']),
});

export const updateStrategyConditionSchema = z.object({
  indicator: z.enum(['GOALS', 'CORNERS', 'OFFENSIVE_PRESSURE', 'SHOTS_ON_GOAL', 'CARDS', 'FOULS', 'OFFSIDES', 'BALL_POSSESSION']).optional(),
  team: z.enum(['HOME', 'AWAY', 'MATCH']).optional(),
  quantity: z.number().int().min(0, 'Quantity must be non-negative').optional(),
  operator: z.enum(['ANY', 'MORE', 'LESS']).optional(),
});

// Strategy validation schemas
export const createStrategySchema = z.object({
  userId: z.string().uuid(),
  name: nameSchema,
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  startMinute: z.number().int().min(1, 'Start minute must be at least 1').max(90, 'Start minute must be at most 90').default(1),
  endMinute: z.number().int().min(1, 'End minute must be at least 1').max(90, 'End minute must be at most 90').default(90),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
  conditions: z.array(createStrategyConditionSchema).optional(),
  leagues: z.array(z.string()).default(['bra.1']), // Default to Campeonato Brasileiro
});

export const updateStrategySchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  startMinute: z.number().int().min(1, 'Start minute must be at least 1').max(90, 'Start minute must be at most 90').optional(),
  endMinute: z.number().int().min(1, 'End minute must be at least 1').max(90, 'End minute must be at most 90').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  conditions: z.array(createStrategyConditionSchema).optional(),
  leagues: z.array(z.string()).optional(),
});

export const updateStrategyStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type CreateStrategyInput = z.infer<typeof createStrategySchema>;
export type UpdateStrategyInput = z.infer<typeof updateStrategySchema>;
export type UpdateStrategyStatusInput = z.infer<typeof updateStrategyStatusSchema>;
export type CreateStrategyConditionInput = z.infer<typeof createStrategyConditionSchema>;
export type UpdateStrategyConditionInput = z.infer<typeof updateStrategyConditionSchema>;
