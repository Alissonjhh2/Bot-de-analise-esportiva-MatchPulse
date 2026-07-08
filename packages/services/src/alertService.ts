import { apiClient } from './apiClient';
import { Alert } from '@matchpulse/types';

export const alertService = {
  async getAll(): Promise<Alert[]> {
    return apiClient.get<Alert[]>('/alerts');
  },

  async getById(id: string): Promise<Alert> {
    return apiClient.get<Alert>(`/alerts/${id}`);
  },

  async create(data: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    return apiClient.post<Alert>('/alerts', data);
  },

  async update(id: string, data: Partial<Alert>): Promise<Alert> {
    return apiClient.put<Alert>(`/alerts/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/alerts/${id}`);
  },

  async toggleActive(id: string): Promise<Alert> {
    return apiClient.put<Alert>(`/alerts/${id}/toggle`);
  },
};
