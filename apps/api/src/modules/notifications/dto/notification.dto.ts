import { z } from 'zod';

export const notificationHistoryResponseDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  strategyId: z.string().uuid(),
  matchName: z.string(),
  championship: z.string(),
  message: z.string(),
  sentAt: z.date(),
});

export type NotificationHistoryResponseDto = z.infer<typeof notificationHistoryResponseDto>;
