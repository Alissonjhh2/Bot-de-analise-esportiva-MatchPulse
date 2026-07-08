import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid();

export const emailSchema = z.string().email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be less than 100 characters');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: uuidSchema,
});

export type PaginationParams = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
