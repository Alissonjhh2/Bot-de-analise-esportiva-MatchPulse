import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema } from './common';

// User validation schemas
export const createUserSchema = z.object({
  firebaseUid: z.string().min(1, 'Firebase UID is required'),
  email: emailSchema,
  name: nameSchema,
  avatar: z.string().url().optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  plan: z.enum(['FREE', 'PREMIUM']).default('FREE'),
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  avatar: z.string().url().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
