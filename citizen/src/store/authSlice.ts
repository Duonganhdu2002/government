/**
 * src/store/authSlice.ts
 * 
 * Quản lý trạng thái xác thực trong Redux
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, CitizenUser, StaffUser, User } from '@/types';
import Cookies from 'js-cookie';

/**
 * Lớp quản lý cookie
 */
class CookieManager {
  private static readonly DEFAULT_OPTIONS = { 
    path: '/',
    sameSite: 'lax' as const
  };
  
  /**
   * Xóa cookie xác thực
   */
  public static removeAuthCookies(): void {
    Cookies.remove('accessToken', this.DEFAULT_OPTIONS);
    Cookies.remove('refreshToken', this.DEFAULT_OPTIONS);
  }
}

/**
 * Namespace quản lý các actions và reducer xác thực
 */
export namespace AuthStateManager {
  /**
   * Trạng thái xác thực ban đầu
   */
  export const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  };
  
  /**
   * Tạo slice Redux cho xác thực
   */
  export const createAuthSlice = () => {
    return createSlice({
      name: 'auth',
      initialState,
      reducers: {
        /**
         * Cập nhật trạng thái loading
         */
        setLoading: (state, action: PayloadAction<boolean>) => {
          state.loading = action.payload;
        },
        
        /**
         * Cập nhật thông báo lỗi
         */
        setError: (state, action: PayloadAction<string | null>) => {
          state.error = action.payload;
        },
        
        /**
         * Cập nhật thông tin người dùng
         */
        setUser: (state, action: PayloadAction<User | null>) => {
          state.user = action.payload;
          state.isAuthenticated = !!action.payload;
        },
        
        /**
         * Đăng nhập: cập nhật trạng thái xác thực và thông tin người dùng
         */
        login: (state, action: PayloadAction<User>) => {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.error = null;
        },
        
        /**
         * Đăng xuất: xóa trạng thái xác thực và các cookie liên quan
         */
        logout: (state) => {
          state.isAuthenticated = false;
          state.user = null;
          state.error = null;
          
          // Xóa cookie xác thực
          CookieManager.removeAuthCookies();
        },
        
        /**
         * Cập nhật thông tin hồ sơ người dùng
         */
        updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
          if (state.user) {
            // Giữ nguyên loại người dùng khi cập nhật
            const updatedUser = {
              ...state.user,
              ...action.payload,
              type: state.user.type // Đảm bảo loại vẫn giữ nguyên
            };
            
            state.user = updatedUser as CitizenUser | StaffUser;
          }
        }
      }
    });
  };
}

// Tạo slice xác thực
const authSlice = AuthStateManager.createAuthSlice();

// Export các actions
export const { 
  setLoading, 
  setError, 
  setUser, 
  login, 
  logout, 
  updateUserProfile 
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
