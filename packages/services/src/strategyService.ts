import { apiClient } from './apiClient';
import { Strategy } from '@matchpulse/types';

export const strategyService = {
  async getAll(): Promise<Strategy[]> {
    return apiClient.get<Strategy[]>('/strategies');
  },

  async getById(id: string): Promise<Strategy> {
    return apiClient.get<Strategy>(`/strategies/${id}`);
  },

  async getPopular(): Promise<Strategy[]> {
    return apiClient.get<Strategy[]>('/strategies/popular');
  },

  async create(data: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Strategy> {
    return apiClient.post<Strategy>('/strategies', data);
  },

  async update(id: string, data: Partial<Strategy>): Promise<Strategy> {
    return apiClient.put<Strategy>(`/strategies/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/strategies/${id}`);
  },
};
