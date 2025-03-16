/**
 * useAuth.ts
 * 
 * Custom hook for handling authentication operations for staff application
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
import { StaffUser, StaffLoginRequest } from '@/lib/types/auth.types';

// Define type constants for this file only
const STAFF_TYPE = 'staff';

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
   * Login for staff members using staffId
   * 
   * @param credentials Staff login credentials
   * @returns Promise resolving to login success status
   */
  const loginStaff = useCallback(
    async (credentials: StaffLoginRequest) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        // Validate staffId
        if (!credentials.staffId) {
          throw new Error('Vui lòng nhập ID nhân viên');
        }

        if (!credentials.password) {
          throw new Error('Vui lòng nhập mật khẩu');
        }

        console.log('Sending login request with credentials:', { 
          staffId: credentials.staffId,
          passwordLength: credentials.password.length 
        });

        // Send login request to staff-login endpoint
        const response = await apiClient.post('/api/auth/staff-login', {
          staffId: credentials.staffId,
          password: credentials.password.trim() // Trim whitespace from password
        });
        
        console.log('Login response received:', response);
        
        // Handle standard response structure
        if (response?.status === 'success' && response?.data) {
          const userData = response.data.user || response.data;
          const tokens = response.data.tokens || {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            expiresIn: response.data.expiresIn || '1h'
          };
          
          console.log('Extracted user data:', userData);
          console.log('Extracted tokens:', { 
            accessTokenPresent: !!tokens.accessToken,
            refreshTokenPresent: !!tokens.refreshToken
          });
          
          if (userData && tokens.accessToken && tokens.refreshToken) {
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
            
            // Double-check that role is properly set
            if (!userData.role) {
              console.warn('WARNING: User role is not defined in the API response');
              console.log('Full user data received:', userData);
              
              // Try to check for role in a different case format
              const possibleRoleKeys = ['role', 'Role', 'ROLE', 'userRole', 'user_role'];
              for (const key of possibleRoleKeys) {
                if (userData[key]) {
                  console.log(`Found role in field ${key}:`, userData[key]);
                  userData.role = userData[key];
                  break;
                }
              }
            }
            
            const staffUser: StaffUser = {
              id: userData.id || userData.staffid,
              type: STAFF_TYPE as 'staff',
              role: userData.role || 'staff', // Default to 'staff' if not provided
              agencyId: userData.agencyId || userData.agencyid || 0,
              name: userData.name || userData.fullname || ''
            };
            
            console.log('Created staff user object:', staffUser);
            
            // Save more detailed token and user details to localStorage for debugging
            try {
              localStorage.setItem('auth_debug', JSON.stringify({
                hasRole: !!staffUser.role,
                role: staffUser.role,
                agencyId: staffUser.agencyId,
                tokenTime: new Date().toISOString(),
                userId: staffUser.id,
                tokenExp: tokens.expiresIn
              }));
              
              // Also save raw user data for troubleshooting
              localStorage.setItem('user_data_debug', JSON.stringify(userData));
            } catch (e) {
              console.error('Error saving debug info:', e);
            }
            
            dispatch(loginAction(staffUser));
            
            try {
              localStorage.setItem('profile_fetched', 'true');
            } catch (e) {
              console.error('Error setting profile fetched status:', e);
            }
            
            return true;
          } else {
            console.error('Missing required data in response:', { 
              hasUserData: !!userData,
              hasAccessToken: !!tokens.accessToken,
              hasRefreshToken: !!tokens.refreshToken
            });
            throw new Error('Login response missing required data');
          }
        } else {
          console.error('Invalid login response structure:', {
            status: response?.status,
            hasData: !!response?.data
          });
          throw new Error('Login failed - invalid response structure');
        }
      } catch (error) {
        console.error('Staff login error:', error);
        let errorMessage = 'Đăng nhập thất bại';
        
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
   * Logout current user
   */
  const logout = useCallback(() => {
    dispatch(logoutAction());
    router.push('/login');
  }, [dispatch, router]);

  /**
   * Check authentication state from cookies/localStorage
   * 
   * @returns Promise resolving when check is complete
   */
  const checkAuthState = useCallback(async () => {
    // Return immediately if already authenticated
    if (isAuthenticated && user) {
      return;
    }
    
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        return;
      }
      
      // Get current user data
      const userData = await apiClient.get('/api/auth/me');
      
      if (userData) {
        const staffUser: StaffUser = {
          id: userData.id || userData.staffid,
          type: STAFF_TYPE as 'staff',
          role: userData.role || '',
          agencyId: userData.agencyId || userData.agencyid || 0,
          name: userData.name || userData.fullname || ''
        };
        
        dispatch(setUser(staffUser));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      
      // Clear cookies and state on auth check error
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      dispatch(setUser(null));
    }
  }, [dispatch, isAuthenticated, user]);

  /**
   * Change user password
   * 
   * @param oldPassword Current password
   * @param newPassword New password
   * @returns Promise resolving to success status
   */
  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      if (!user) {
        dispatch(setError('Not authenticated'));
        return false;
      }
      
      dispatch(setLoading(true));
      
      try {
        const response = await apiClient.post('/api/auth/change-password', {
          userId: user.id,
          userType: STAFF_TYPE,
          oldPassword,
          newPassword
        });
        
        if (response?.status === 'success') {
          return true;
        }
        
        throw new Error('Password change failed');
      } catch (error) {
        let errorMessage = 'Failed to change password';
        
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
    [dispatch, user]
  );

  /**
   * Update user profile data
   * 
   * @param userData Updated user data
   * @returns Promise resolving to profile update success status
   */
  const updateProfile = useCallback(
    async (userData: Partial<StaffUser>) => {
      if (!user) {
        dispatch(setError('Not authenticated'));
        return false;
      }
      
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const endpoint = `/api/staff/${user.id}`;
        const response = await apiClient.patch(endpoint, userData);
        
        if (response?.data) {
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
    loginStaff,
    logout,
    changePassword,
    updateProfile,
    checkAuthState
  };
}; 