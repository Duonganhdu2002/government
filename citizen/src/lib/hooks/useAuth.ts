/**
 * useAuth.ts
 * 
 * Custom hook for handling authentication operations
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';

import { 
  RootState,
  login as loginAction, 
  logout as logoutAction,
  setUser, 
  setError, 
  setLoading
} from '@/store';
import { apiClient } from '@/lib/api';
import { 
  LoginRequest, 
  RegisterCitizenRequest, 
  ChangePasswordRequest,
  User,
  UserType,
  CitizenUser,
  StaffUser
} from '@/types';

/**
 * Extract error message from API error response
 * Handles various error response formats
 */
const extractErrorMessage = (error: any): string => {
  // Default error message
  let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
  
  if (!error) return errorMessage;
  
  // Handle response.data.message format
  if (error.data) {
    if (typeof error.data === 'string') {
      return error.data;
    }
    
    if (typeof error.data === 'object') {
      return error.data.message || 
             error.data.error || 
             error.data.errorMessage || 
             errorMessage;
    }
  }
  
  // Handle error.message format
  if (error.message) {
    // Translate common error messages to user-friendly Vietnamese
    if (error.message.includes('duplicate') || error.message.includes('already exists')) {
      return 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại tên đăng nhập, email hoặc số CMND/CCCD.';
    }
    
    if (error.message.includes('invalid') || error.message.includes('incorrect')) {
      return 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.';
    }
    
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return 'Máy chủ không phản hồi. Vui lòng thử lại sau.';
    }
    
    if (error.message.includes('network') || error.message.includes('connection')) {
      return 'Kiểm tra kết nối mạng của bạn và thử lại.';
    }
    
    return error.message;
  }
  
  // Handle direct string errors
  if (typeof error === 'string') {
    return error;
  }
  
  return errorMessage;
};

/**
 * Authentication hook to manage user login, logout, and session
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.user
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
        const response = await apiClient.post('/api/auth/login', credentials);
        
        if (response?.user && response?.tokens) {
          // Handle first response format
          const { accessToken, refreshToken } = response.tokens;
          
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
          
          const userData: User = credentials.userType === UserType.CITIZEN
            ? {
                id: response.user.id,
                username: response.user.username,
                type: UserType.CITIZEN,
                name: response.user.name || '',
                identificationNumber: response.user.identificationNumber || '',
                address: response.user.address || '',
                phoneNumber: response.user.phoneNumber || '',
                email: response.user.email || '',
                areaCode: response.user.areaCode || 0,
                imageLink: response.user.imageLink || ''
              } as CitizenUser
            : {
                id: response.user.id,
                username: response.user.username,
                type: UserType.STAFF,
                role: response.user.role || '',
                agencyId: response.user.agencyId || 0,
                name: response.user.name || ''
              } as StaffUser;
          
          dispatch(loginAction(userData));
          
          try {
            localStorage.setItem('profile_fetched', 'true');
          } catch (e) {
            console.error('Error setting profile fetched status:', e);
          }
          
          return true;
        } else if (response?.data?.user && response?.data?.tokens) {
          // Handle second response format
          const { accessToken, refreshToken } = response.data.tokens;
          const userData = response.data.user;
          
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
          
          const userObject: User = credentials.userType === UserType.CITIZEN
            ? {
                id: userData.id,
                username: userData.username,
                type: UserType.CITIZEN,
                name: userData.name || '',
                identificationNumber: userData.identificationNumber || '',
                address: userData.address || '',
                phoneNumber: userData.phoneNumber || '',
                email: userData.email || '',
                areaCode: userData.areaCode || 0,
                imageLink: userData.imageLink || ''
              } as CitizenUser
            : {
                id: userData.id,
                username: userData.username,
                type: UserType.STAFF,
                role: userData.role || '',
                agencyId: userData.agencyId || 0,
                name: userData.name || ''
              } as StaffUser;
          
          dispatch(loginAction(userObject));
          
          try {
            localStorage.setItem('profile_fetched', 'true');
          } catch (e) {
            console.error('Error setting profile fetched status:', e);
          }
          
          return true;
        } else if (response?.status === 'success' && response?.data) {
          // Handle third response format
          const userData = response.data.user || response.data;
          const tokens = response.data.tokens || {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            expiresIn: response.data.expiresIn || '1h'
          };
          
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
            
            const userObject: User = credentials.userType === UserType.CITIZEN
              ? {
                  id: userData.id || userData.citizenid,
                  username: userData.username,
                  type: UserType.CITIZEN,
                  name: userData.name || userData.fullname || '',
                  identificationNumber: userData.identificationNumber || userData.identificationnumber || '',
                  address: userData.address || '',
                  phoneNumber: userData.phoneNumber || userData.phonenumber || '',
                  email: userData.email || '',
                  areaCode: userData.areaCode || userData.areacode || 0,
                  imageLink: userData.imageLink || userData.imagelink || ''
                } as CitizenUser
              : {
                  id: userData.id || userData.staffid,
                  username: userData.username,
                  type: UserType.STAFF,
                  role: userData.role || '',
                  agencyId: userData.agencyId || userData.agencyid || 0,
                  name: userData.name || userData.fullname || ''
                } as StaffUser;
            
            dispatch(loginAction(userObject));
            
            try {
              localStorage.setItem('profile_fetched', 'true');
            } catch (e) {
              console.error('Error setting profile fetched status:', e);
            }
            
            return true;
          }
        }
        
        // If we get here, the response format was not recognized
        throw new Error('Đăng nhập không thành công. Định dạng phản hồi từ máy chủ không hợp lệ.');
      } catch (error) {
        // Use our error extraction utility
        const errorMessage = extractErrorMessage(error);
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
        
        // Check various successful response formats
        if (response?.message === "User registered successfully." || 
            response?.status === 'success' || 
            response?.tokens || 
            (response?.data && response?.data?.status === 'success')) {
          return true;
        }
        
        // If we get here, the response was successful but unexpected format
        console.warn('Unexpected successful registration response format:', response);
        return true;
      } catch (error) {
        // Use our error extraction utility for consistent error handling
        const errorMessage = extractErrorMessage(error);
        
        // Special handling for common registration errors
        if (errorMessage.includes('duplicate') || 
            errorMessage.includes('already exists') || 
            errorMessage.includes('đã tồn tại')) {
          dispatch(setError('Tài khoản hoặc thông tin cá nhân đã tồn tại. Vui lòng kiểm tra lại tên đăng nhập, email hoặc số CMND/CCCD.'));
        } else {
          dispatch(setError(errorMessage));
        }
        
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Logout the current user
   * 
   * @param redirectPath Path to redirect after logout (defaults to /login)
   */
  const logout = useCallback(
    async (redirectPath = '/login') => {
      try {
        // Clear all auth cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // Dispatch logout action
        dispatch(logoutAction());
        
        // Clear any localStorage data
        try {
          localStorage.removeItem('profile_fetched');
        } catch (e) {
          console.error('Error clearing localStorage:', e);
        }
        
        // Redirect to login page
        router.push(redirectPath);
        
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        return false;
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
        const passwordChangeData = {
          ...passwordData,
          citizenid: passwordData.citizenid || user.id 
        };
        
        await apiClient.post(
          '/api/auth/change-password',
          passwordChangeData
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
   * Check authentication state on load
   * Verifies if tokens exist and fetches user data if needed
   */
  const checkAuthState = useCallback(async () => {
    // If already authenticated, skip
    if (isAuthenticated && user) {
      return true;
    }

    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');

    // If no tokens, user is definitely not authenticated
    if (!accessToken && !refreshToken) {
      return false;
    }

    dispatch(setLoading(true));

    try {
      // Verify token and get user profile
      const response = await apiClient.get('/api/auth/profile');
      
      if (response?.data?.user) {
        const userData = response.data.user;
        
        const userObject: User = userData.type === UserType.CITIZEN
          ? {
              id: userData.id,
              username: userData.username,
              type: UserType.CITIZEN,
              name: userData.name || userData.fullname || '',
              identificationNumber: userData.identificationNumber || userData.identificationnumber || '',
              address: userData.address || '',
              phoneNumber: userData.phoneNumber || userData.phonenumber || '',
              email: userData.email || '',
              areaCode: userData.areaCode || userData.areacode || 0,
              imageLink: userData.imageLink || userData.imagelink || ''
            } as CitizenUser
          : {
              id: userData.id,
              username: userData.username,
              type: UserType.STAFF,
              role: userData.role || '',
              agencyId: userData.agencyId || userData.agencyid || 0,
              name: userData.name || userData.fullname || ''
            } as StaffUser;
        
        dispatch(loginAction(userObject));
        return true;
      }
      
      // If we get here without a valid user, tokens might be invalid
      Cookies.remove('accessToken', { path: '/', sameSite: 'lax' });
      Cookies.remove('refreshToken', { path: '/', sameSite: 'lax' });
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      
      // Token validation failed, clean up
      Cookies.remove('accessToken', { path: '/', sameSite: 'lax' });
      Cookies.remove('refreshToken', { path: '/', sameSite: 'lax' });
      dispatch(logoutAction());
      return false;
    } finally {
      dispatch(setLoading(false));
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