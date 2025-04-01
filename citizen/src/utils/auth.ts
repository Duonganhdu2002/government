/**
 * auth.ts
 * 
 * Comprehensive authentication utilities
 * Consolidates auth headers and token management functionality
 */

import Cookies from 'js-cookie';
import { store } from '@/store';

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
export const refreshAccessToken = async (apiUrl: string): Promise<string | null> => {
  try {
    const refreshToken = Cookies.get('refreshToken');
    
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
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
    // Import the logout action dynamically to avoid circular dependency
    const { logout } = await import('@/store');
    store.dispatch(logout());
    return null;
  }
}; 