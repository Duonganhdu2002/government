/**
 * api.ts
 * 
 * Centralized API client configuration and interceptors
 * Handles authentication, error handling, and request/response formatting
 */

import Cookies from 'js-cookie';
import { store } from '@/store/store';
import { logout } from '@/store/authSlice';

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_TIMEOUT = 15000; // 15 seconds

// Log API configuration for debugging
console.log('API Configuration:', { 
  API_URL, 
  API_TIMEOUT,
  NODE_ENV: process.env.NODE_ENV
});

/**
 * Custom API error class with additional properties
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Handles request timeout
 * 
 * @param ms Timeout duration in milliseconds
 * @returns Promise that rejects after specified timeout
 */
const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ApiError('Request timeout', 408));
    }, ms);
  });
};

/**
 * Get authentication headers from cookies
 * 
 * @returns Object containing all required headers including auth header if token exists
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = Cookies.get('accessToken');
  
  // Default headers that should be included in all requests
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Handle refresh token when access token expires
 * 
 * @returns New access token or null if refresh fails
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = Cookies.get('refreshToken');
    
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    
    if (data.tokens?.accessToken) {
      Cookies.set('accessToken', data.tokens.accessToken, { expires: 1 }); // 1 day
      
      if (data.tokens.refreshToken) {
        Cookies.set('refreshToken', data.tokens.refreshToken, { expires: 7 }); // 7 days
      }
      
      return data.tokens.accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Force logout if refresh token fails
    store.dispatch(logout());
    return null;
  }
};

/**
 * Process API response
 * 
 * @param response Fetch response object
 * @returns Parsed response data
 * @throws ApiError if response is not OK
 */
const processResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  let data;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (err) {
    console.error('Error parsing response:', err);
    data = { message: 'Failed to parse response' };
  }
  
  console.log(`API Response [${response.status}]:`, data);
  
  if (!response.ok) {
    // Handle 401 Unauthorized - attempt to refresh token
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Token refreshed successfully, retry original request
        return null; // Caller should retry with new token
      }
    }
    
    // Get error message from response
    let errorMessage = 'API request failed';
    
    if (typeof data === 'object' && data !== null) {
      // Handle different error response formats
      errorMessage = data.message || data.error || errorMessage;
      
      // For cases where the backend returns a 404 with "No applications found"
      // we might want to return an empty array instead of throwing an error
      if (response.status === 404 && 
          (errorMessage.includes('applications') || errorMessage.includes('not found'))) {
        if (errorMessage.includes('applications')) {
          return { applications: [] };
        }
        // For other "not found" resources, return appropriate empty structures
        return { data: [] };
      }
    } else if (typeof data === 'string' && data.length > 0) {
      errorMessage = data;
    }
    
    throw new ApiError(
      errorMessage, 
      response.status,
      data
    );
  }
  
  return data;
};

/**
 * Main API client for making requests to the backend
 */
export const apiClient = {
  /**
   * Make a GET request
   * 
   * @param endpoint API endpoint (without base URL)
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  get: async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
          },
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.get(endpoint, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`GET request failed: ${error.message}`, 500);
    }
  },
  
  /**
   * Make a POST request
   * 
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  post: async (endpoint: string, data: any, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
          },
          body: JSON.stringify(data),
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.post(endpoint, data, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`POST request failed: ${error.message}`, 500);
    }
  },
  
  /**
   * Make a PUT request
   * 
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  put: async (endpoint: string, data: any, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
          },
          body: JSON.stringify(data),
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.put(endpoint, data, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`PUT request failed: ${error.message}`, 500);
    }
  },
  
  /**
   * Make a DELETE request
   * 
   * @param endpoint API endpoint (without base URL)
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  delete: async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
          },
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.delete(endpoint, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`DELETE request failed: ${error.message}`, 500);
    }
  }
}; 