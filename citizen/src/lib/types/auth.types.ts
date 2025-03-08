/**
 * auth.types.ts
 * 
 * Type definitions for authentication and user data
 */

/**
 * User role enum
 */
export enum UserRole {
  CITIZEN = 'citizen',
  STAFF = 'staff',
  ADMIN = 'admin'
}

/**
 * User type enum
 */
export enum UserType {
  CITIZEN = 'citizen',
  STAFF = 'staff'
}

/**
 * Base user interface
 */
export interface BaseUser {
  id: number;
  username: string;
  type: UserType;
}

/**
 * Citizen user interface
 */
export interface CitizenUser extends BaseUser {
  type: UserType.CITIZEN;
  name: string;
  identificationNumber?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  areaCode: number;
  imageLink?: string;
}

/**
 * Staff user interface
 */
export interface StaffUser extends BaseUser {
  type: UserType.STAFF;
  role: string;
  agencyId: number;
  name?: string;
}

/**
 * Combined user type
 */
export type User = CitizenUser | StaffUser;

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
  userType: UserType;
}

/**
 * Login response payload
 */
export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    }
  }
}

/**
 * Register citizen request payload
 */
export interface RegisterCitizenRequest {
  fullname: string;
  identificationnumber: string;
  address?: string;
  phonenumber?: string;
  email?: string;
  username: string;
  password: string;
  areacode: number;
}

/**
 * Register response payload
 */
export interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user: CitizenUser;
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

/**
 * Change password request payload
 */
export interface ChangePasswordRequest {
  citizenid: number;
  oldPassword: string;
  newPassword: string;
}

/**
 * Change password response payload
 */
export interface ChangePasswordResponse {
  status: string;
  message: string;
} 