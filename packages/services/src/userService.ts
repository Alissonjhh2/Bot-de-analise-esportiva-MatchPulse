import { apiClient } from './apiClient';
import { User } from '@matchpulse/types';

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/users/profile');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/users/profile', data);
  },

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    return apiClient.post<void>('/users/password', { oldPassword, newPassword });
  },

  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>('/users/account');
  },
};
