import { z } from 'zod';

// Telegram validation schemas
export const createTelegramConnectionSchema = z.object({
  userId: z.string().uuid(),
  chatId: z.string().min(1, 'Chat ID is required'),
  username: z.string().optional(),
  firstName: z.string().optional(),
});

export const createTelegramLinkCodeSchema = z.object({
  userId: z.string().uuid(),
});

export const verifyTelegramCodeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 characters'),
});

export type CreateTelegramConnectionInput = z.infer<typeof createTelegramConnectionSchema>;
export type CreateTelegramLinkCodeInput = z.infer<typeof createTelegramLinkCodeSchema>;
export type VerifyTelegramCodeInput = z.infer<typeof verifyTelegramCodeSchema>;
