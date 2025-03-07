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
        
        // Try to handle different response structures
        if (response?.user && response?.tokens) {
          // Direct user and tokens in response
          const { accessToken, refreshToken } = response.tokens;
          
          // Store tokens in cookies with proper settings
          Cookies.set('accessToken', accessToken, { 
            expires: 1,  // 1 day
            path: '/',
            sameSite: 'lax' 
          });
          Cookies.set('refreshToken', refreshToken, { 
            expires: 7,  // 7 days
            path: '/',
            sameSite: 'lax'
          });
          
          // Store user in Redux
          dispatch(loginAction(response.user));
          return true;
        } else if (response?.data?.user && response?.data?.tokens) {
          // User and tokens nested inside data property
          const { accessToken, refreshToken } = response.data.tokens;
          
          // Store tokens in cookies with proper settings
          Cookies.set('accessToken', accessToken, { 
            expires: 1,  // 1 day
            path: '/',
            sameSite: 'lax'
          });
          Cookies.set('refreshToken', refreshToken, { 
            expires: 7,  // 7 days
            path: '/',
            sameSite: 'lax'
          });
          
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
            // Store tokens in cookies with proper settings
            Cookies.set('accessToken', tokens.accessToken, { 
              expires: 1,
              path: '/',
              sameSite: 'lax' 
            });
            Cookies.set('refreshToken', tokens.refreshToken, { 
              expires: 7,
              path: '/',
              sameSite: 'lax'
            });
            
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
        
        if (response?.tokens) {
          // Không lưu token và đăng nhập ngay, mà để người dùng đăng nhập thủ công
          console.log('Registration successful');
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
        
        // Remove cookies with the same options they were set with
        Cookies.remove('accessToken', { 
          path: '/',
          sameSite: 'lax'
        });
        Cookies.remove('refreshToken', { 
          path: '/',
          sameSite: 'lax'
        });
        
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

        const response = await apiClient.patch(endpoint, userData);
        
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

  /**
   * Kiểm tra và khôi phục phiên đăng nhập
   * Gọi hàm này khi ứng dụng khởi động để kiểm tra trạng thái token
   */
  const checkAuthState = useCallback(async () => {
    // Nếu đã xác thực trong redux, không cần làm gì
    if (isAuthenticated && user) {
      console.log('User already authenticated in Redux store');
      return true;
    }

    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');

    // Ghi log để debug
    console.log('Checking auth state. Access token exists:', !!accessToken);
    console.log('Checking auth state. Refresh token exists:', !!refreshToken);

    if (!accessToken && !refreshToken) {
      console.log('No tokens found in cookies');
      dispatch(logoutAction());
      return false;
    }

    try {
      if (!accessToken && refreshToken) {
        // Nếu chỉ có refresh token, thử làm mới token
        console.log('Access token expired, attempting to refresh');
        
        const response = await apiClient.post('/api/auth/refresh', { refreshToken });
        
        if (response?.accessToken) {
          // Lưu token mới
          Cookies.set('accessToken', response.accessToken, { 
            expires: 1,
            path: '/',
            sameSite: 'lax'
          });
          
          if (response.refreshToken) {
            Cookies.set('refreshToken', response.refreshToken, { 
              expires: 7,
              path: '/',
              sameSite: 'lax'
            });
          }
          
          console.log('Token refreshed successfully');
        } else {
          console.log('Token refresh failed, logging out');
          dispatch(logoutAction());
          return false;
        }
      }
      
      // Nếu có access token (hoặc vừa được làm mới), thử lấy thông tin người dùng
      const userInfo = await apiClient.get('/api/auth/me');
      
      if (userInfo && userInfo.user) {
        dispatch(loginAction(userInfo.user));
        console.log('Auth state restored successfully');
        return true;
      } else {
        console.log('Failed to get user info, logging out');
        dispatch(logoutAction());
        return false;
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      dispatch(logoutAction());
      return false;
    }
  }, [dispatch, isAuthenticated, user]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    registerCitizen,
    logout,
    changePassword,
    updateProfile,
    checkAuthState
  };
}; 