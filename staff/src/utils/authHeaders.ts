// src/utils/authHeaders.ts
import Cookies from 'js-cookie';

export const getAuthHeaders = (): { [key: string]: string } => {
  const token = Cookies.get('accessToken');
  
  // Default headers that should be included in all requests
  const headers: { [key: string]: string } = {
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
