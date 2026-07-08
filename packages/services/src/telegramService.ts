import { apiClient } from './apiClient';
import { TelegramConnection } from '@matchpulse/types';

export const telegramService = {
  async getConnection(): Promise<TelegramConnection | null> {
    return apiClient.get<TelegramConnection | null>('/telegram/connection');
  },

  async connect(chatId: string, username?: string): Promise<TelegramConnection> {
    return apiClient.post<TelegramConnection>('/telegram/connect', { chatId, username });
  },

  async disconnect(): Promise<void> {
    return apiClient.delete<void>('/telegram/disconnect');
  },

  async verifyCode(code: string): Promise<TelegramConnection> {
    return apiClient.post<TelegramConnection>('/telegram/verify', { code });
  },
};
