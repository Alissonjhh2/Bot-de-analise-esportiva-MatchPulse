import { z } from 'zod';

export const createTelegramConnectionDto = z.object({
  chatId: z.string().min(1, 'Chat ID is required'),
  username: z.string().optional(),
  firstName: z.string().optional(),
});

export const telegramConnectionResponseDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  chatId: z.string(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  connectedAt: z.date(),
});

export const telegramLinkCodeResponseDto = z.object({
  id: z.string().uuid(),
  code: z.string(),
  userId: z.string().uuid(),
  expiresAt: z.date(),
  used: z.boolean(),
  createdAt: z.date(),
});

export type CreateTelegramConnectionDto = z.infer<typeof createTelegramConnectionDto>;
export type TelegramConnectionResponseDto = z.infer<typeof telegramConnectionResponseDto>;
export type TelegramLinkCodeResponseDto = z.infer<typeof telegramLinkCodeResponseDto>;
