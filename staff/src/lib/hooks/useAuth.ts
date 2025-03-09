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
  UserType,
  CitizenUser,
  StaffUser
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
        const response = await apiClient.post('/api/auth/login', credentials);
        
        if (response?.user && response?.tokens) {
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
        }
        
        if (response?.status === 'success' && response?.data) {
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
        
        console.error('Invalid login response structure:', response);
        throw new Error('Login failed - invalid response structure');
      } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed';
        
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
        console.log('Sending registration data:', { ...userData, password: '***' });
        const response = await apiClient.post('/api/auth/register', userData);
        console.log('Registration response:', response);
        
        // Kiểm tra các định dạng response khác nhau
        if (response?.message === "User registered successfully." || 
            response?.status === 'success' || 
            response?.tokens) {
          console.log('Registration successful, response structure:', response);
          return true;
        }
        
        // Log response nếu không thành công
        console.error('Unexpected registration response format:', response);
        throw new Error('Registration failed - invalid server response format');
      } catch (error) {
        console.error('Registration error details:', error);
        
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'Đăng ký thất bại';
        
        if (error.data) {
          // Trích xuất thông báo lỗi chi tiết từ phản hồi API
          errorMessage = error.data.error || error.data.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
          
          // Định dạng lại thông báo lỗi thân thiện với người dùng
          if (errorMessage.includes('duplicate')) {
            errorMessage = 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại số CMND/CCCD, email, số điện thoại hoặc tên đăng nhập.';
          } else if (errorMessage.includes('timeout')) {
            errorMessage = 'Yêu cầu đăng ký hết thời gian chờ. Vui lòng thử lại sau.';
          } else if (errorMessage.includes('network')) {
            errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn và thử lại.';
          }
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
          await apiClient.post('/api/auth/logout', { refreshToken })
            .catch(() => {
              console.log('Logout API call failed, continuing with local logout');
            });
        }
        
        Cookies.remove('accessToken', { 
          path: '/',
          sameSite: 'lax'
        });
        Cookies.remove('refreshToken', { 
          path: '/',
          sameSite: 'lax'
        });
        
        dispatch(logoutAction());
        
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
   * Kiểm tra và khôi phục phiên đăng nhập
   * Gọi hàm này khi ứng dụng khởi động để kiểm tra trạng thái token
   */
  const checkAuthState = useCallback(async () => {
    if (isAuthenticated && user) {
      console.log('User already authenticated in Redux store');
      return true;
    }

    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');

    console.log('Checking auth state. Access token exists:', !!accessToken);
    console.log('Checking auth state. Refresh token exists:', !!refreshToken);

    if (!accessToken && !refreshToken) {
      console.log('No tokens found in cookies');
      dispatch(logoutAction());
      return false;
    }

    try {
      if (!accessToken && refreshToken) {
        console.log('Access token expired, attempting to refresh');
        
        const response = await apiClient.post('/api/auth/refresh', { refreshToken });
        
        if (response?.accessToken) {
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