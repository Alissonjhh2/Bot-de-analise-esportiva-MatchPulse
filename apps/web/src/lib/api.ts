import { ApiClient } from '@matchpulse/services';

// Create apiClient with Firebase token support
const apiClient = new ApiClient(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('firebase_token');
  }
  return null;
});

export { apiClient };
