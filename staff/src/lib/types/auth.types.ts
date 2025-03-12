/**
 * auth.types.ts - Simplified for staff app
 * 
 * Type definitions for authentication and user data
 */

/**
 * User role enum
 */
export enum UserRole {
  STAFF = 'staff',
  ADMIN = 'admin'
}

/**
 * Staff user interface
 */
export interface StaffUser {
  id: number;
  type: 'staff';
  role: string;
  agencyId: number;
  name?: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: StaffUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Staff login request payload
 */
export interface StaffLoginRequest {
  staffId: number;
  password: string;
}

/**
 * Login response payload
 */
export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: StaffUser;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    }
  }
}

/**
 * Refresh token request payload
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response payload
 */
export interface RefreshTokenResponse {
  status: string;
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    }
  }
}

/**
 * Logout request payload
 */
export interface LogoutRequest {
  refreshToken: string;
}

/**
 * Logout response payload
 */
export interface LogoutResponse {
  status: string;
  message: string;
} 