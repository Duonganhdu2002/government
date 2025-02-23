/**
 * src/services/authService.ts
 *
 * This module defines functions to call the authentication endpoints.
 * It uses the NEXT_PUBLIC_API_URL environment variable.
 */

export interface RegisterData {
    fullname: string;
    identificationnumber: string;
    address: string;
    phonenumber: string;
    email: string;
    username: string;
    password: string;
    areacode: number;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    message: string;
    user: {
      citizenid: number;
      fullname: string;
      identificationnumber: string;
      address: string;
      phonenumber: string;
      email: string;
      username: string;
      areacode: number;
    };
    accessToken: string;
    refreshToken: string;
  }
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  export const registerUserAPI = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    return await response.json();
  };
  
  export const loginUserAPI = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    return await response.json();
  };
  
  export const refreshTokenAPI = async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to refresh token');
    }
    return await response.json();
  };
  
  export const logoutUserAPI = async (userId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Logout failed');
    }
    return await response.json();
  };
  