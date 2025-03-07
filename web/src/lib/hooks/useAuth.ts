/**
 * useAuth.ts
 * 
 * Custom hook for handling authentication operations
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';

import { RootState } from '@/store/store';
import { 
  login as loginAction, 
  logout as logoutAction,
  setUser, 
  setError, 
  setLoading
} from '@/store/authSlice';
import { apiClient } from '@/lib/api';
import { 
  LoginRequest, 
  RegisterCitizenRequest, 
  ChangePasswordRequest,
  User,
  UserType
} from '@/lib/types/auth.types';

/**
 * Authentication hook to manage user login, logout, and session
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  /**
   * Login user
   * 
   * @param credentials User credentials
   * @returns Promise resolving to login success status
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        console.log('Attempting login with:', { 
          username: credentials.username, 
          userType: credentials.userType 
        });
        
        const response = await apiClient.post('/api/auth/login', credentials);
        console.log('Login response:', response);
        
        if (response?.data?.user && response?.data?.tokens) {
          const { accessToken, refreshToken } = response.data.tokens;
          
          // Store tokens in cookies
          Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
          Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
          
          // Store user in Redux
          dispatch(loginAction(response.data.user));
          return true;
        }
        
        // Handle case where we get a response but missing expected data
        if (response?.status === 'success' && response?.data) {
          // Try to extract user and tokens from a different response structure
          const user = response.data.user || response.data;
          const tokens = response.data.tokens || {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            expiresIn: response.data.expiresIn || '1h'
          };
          
          if (user && tokens.accessToken && tokens.refreshToken) {
            // Store tokens in cookies
            Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
            Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
            
            // Store user in Redux
            dispatch(loginAction(user));
            return true;
          }
        }
        
        console.error('Invalid login response structure:', response);
        throw new Error('Login failed - invalid response structure');
      } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed';
        
        // Try to extract more detailed error message if available
        if (error.data && typeof error.data === 'object') {
          errorMessage = error.data.message || error.data.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        dispatch(setError(errorMessage));
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Register a new citizen account
   * 
   * @param userData User registration data
   * @returns Promise resolving to registration success status
   */
  const registerCitizen = useCallback(
    async (userData: RegisterCitizenRequest) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const response = await apiClient.post('/api/auth/register', userData);
        
        if (response?.data?.tokens) {
          const { accessToken, refreshToken } = response.data.tokens;
          
          // Store tokens in cookies
          Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
          Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
          
          // Store user in Redux
          dispatch(loginAction(response.data.user));
          return true;
        }
        
        throw new Error('Registration failed - invalid response');
      } catch (error) {
        dispatch(setError(error.message || 'Registration failed'));
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Log out current user
   * 
   * @param redirectUrl URL to redirect to after logout
   * @returns Promise resolving to logout success status
   */
  const logout = useCallback(
    async (redirectUrl = '/login') => {
      dispatch(setLoading(true));
      
      try {
        const refreshToken = Cookies.get('refreshToken');
        
        if (refreshToken) {
          // Try to invalidate token on server
          await apiClient.post('/api/auth/logout', { refreshToken })
            .catch(() => {
              // Ignore errors when logging out
              console.log('Logout API call failed, continuing with local logout');
            });
        }
        
        // Remove cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // Clear user from Redux
        dispatch(logoutAction());
        
        // Redirect if needed
        if (redirectUrl) {
          router.push(redirectUrl);
        }
        
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, router]
  );

  /**
   * Change user password
   * 
   * @param passwordData Old and new password
   * @returns Promise resolving to password change success status
   */
  const changePassword = useCallback(
    async (passwordData: ChangePasswordRequest) => {
      if (!user) {
        dispatch(setError('Not authenticated'));
        return false;
      }
      
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        await apiClient.post(
          '/api/auth/change-password',
          passwordData
        );
        
        return true;
      } catch (error) {
        dispatch(setError(error.message || 'Failed to change password'));
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, user]
  );

  /**
   * Update user profile data
   * 
   * @param userData Updated user data
   * @returns Promise resolving to profile update success status
   */
  const updateProfile = useCallback(
    async (userData: Partial<User>) => {
      if (!user) {
        dispatch(setError('Not authenticated'));
        return false;
      }
      
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const endpoint = user.type === UserType.CITIZEN
          ? `/api/citizens/${user.id}`
          : `/api/staff/${user.id}`;

        const response = await apiClient.put(endpoint, userData);
        
        if (response?.data) {
          // Update user in Redux
          dispatch(setUser({
            ...user,
            ...response.data
          }));
          return true;
        }
        
        throw new Error('Profile update failed - invalid response');
      } catch (error) {
        dispatch(setError(error.message || 'Failed to update profile'));
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, user]
  );

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    registerCitizen,
    logout,
    changePassword,
    updateProfile
  };
}; 