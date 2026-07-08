import { z } from 'zod';

export const createUserDto = z.object({
  firebaseUid: z.string().min(1, 'Firebase UID is required'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().url().optional(),
  plan: z.enum(['FREE', 'PREMIUM']).optional(),
});

export const updateUserDto = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url().optional(),
  firebaseUid: z.string().optional(),
});

export const userResponseDto = z.object({
  id: z.string().uuid(),
  firebaseUid: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
  role: z.enum(['USER', 'ADMIN']),
  plan: z.enum(['FREE', 'PREMIUM']),
  createdAt: z.date(),
  updatedAt: z.date(),
  strategiesCount: z.number().optional(),
});

export type CreateUserDto = z.infer<typeof createUserDto>;
export type UpdateUserDto = z.infer<typeof updateUserDto>;
export type UserResponseDto = z.infer<typeof userResponseDto>;
