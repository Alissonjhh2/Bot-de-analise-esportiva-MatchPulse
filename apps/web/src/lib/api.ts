import { ApiClient } from '@matchpulse/services';

// Create apiClient with Firebase token support and automatic logout on token expiration
const apiClient = new ApiClient(
  () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('firebase_token');
    }
    return null;
  },
  () => {
    // Automatic logout on token expiration
    if (typeof window !== 'undefined') {
      localStorage.removeItem('firebase_token');
      window.location.href = '/login';
    }
  }
);

export { apiClient };
