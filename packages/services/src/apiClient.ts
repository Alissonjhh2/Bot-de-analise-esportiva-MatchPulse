import { config } from '@matchpulse/config';

class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private onTokenExpired?: () => void;

  constructor(getToken?: () => string | null, onTokenExpired?: () => void) {
    this.baseUrl = config.api.baseUrl;
    this.getToken = getToken || (() => null);
    this.onTokenExpired = onTokenExpired;
  }

  private handleAuthError() {
    if (this.onTokenExpired) {
      this.onTokenExpired();
    }
  }

  private getHeaders(options?: RequestInit): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: 'GET',
        headers: this.getHeaders(options),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log('[ApiClient] GET response:', endpoint, json);
      return json as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('[ApiClient] API unreachable - backend offline or CORS blocked');
        console.error('[ApiClient] BaseURL:', this.baseUrl);
        console.error('[ApiClient] Endpoint:', endpoint);
        throw new Error('API unreachable - backend offline or CORS blocked');
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: this.getHeaders(options),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        const errorJson = await response.json().catch(() => null) as { message?: string; error?: { message?: string } } | null;
        const errorMessage = errorJson?.message || errorJson?.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const json = await response.json();
      return json as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('[ApiClient] API unreachable - backend offline or CORS blocked');
        console.error('[ApiClient] BaseURL:', this.baseUrl);
        console.error('[ApiClient] Endpoint:', endpoint);
        throw new Error('API unreachable - backend offline or CORS blocked');
      }
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: 'PUT',
        headers: this.getHeaders(options),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json() as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('[ApiClient] API unreachable - backend offline or CORS blocked');
        console.error('[ApiClient] BaseURL:', this.baseUrl);
        console.error('[ApiClient] Endpoint:', endpoint);
        throw new Error('API unreachable - backend offline or CORS blocked');
      }
      throw error;
    }
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: 'PATCH',
        headers: this.getHeaders(options),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json() as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('[ApiClient] API unreachable - backend offline or CORS blocked');
        console.error('[ApiClient] BaseURL:', this.baseUrl);
        console.error('[ApiClient] Endpoint:', endpoint);
        throw new Error('API unreachable - backend offline or CORS blocked');
      }
      throw error;
    }
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        method: 'DELETE',
        headers: this.getHeaders(options),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json() as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('[ApiClient] API unreachable - backend offline or CORS blocked');
        console.error('[ApiClient] BaseURL:', this.baseUrl);
        console.error('[ApiClient] Endpoint:', endpoint);
        throw new Error('API unreachable - backend offline or CORS blocked');
      }
      throw error;
    }
  }
}

export { ApiClient };
export const apiClient = new ApiClient();
