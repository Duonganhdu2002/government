/**
 * src/store/hooks.ts
 *
 * Hook đã được typedd cho Redux để sử dụng trong ứng dụng
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Namespace chứa các hooks Redux đã được typed
 */
export namespace AppReduxHooks {
  /**
   * Hook để dispatch actions tới store với kiểu dữ liệu chính xác
   */
  export const useAppDispatch = (): AppDispatch => useDispatch();
  
  /**
   * Hook để lấy dữ liệu từ store với kiểu dữ liệu chính xác
   */
  export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  
  /**
   * Hook để lấy trạng thái xác thực
   */
  export const useAuthState = (): RootState['auth'] => {
    return useAppSelector((state) => state.auth);
  };
  
  /**
   * Hook để kiểm tra xem người dùng đã đăng nhập chưa
   */
  export const useIsAuthenticated = (): boolean => {
    return useAppSelector((state) => state.auth.isAuthenticated);
  };
  
  /**
   * Hook để lấy thông tin người dùng hiện tại
   */
  export const useCurrentUser = () => {
    return useAppSelector((state) => state.auth.user);
  };
}

// Xuất các hooks để dễ sử dụng
export const useAppDispatch = AppReduxHooks.useAppDispatch;
export const useAppSelector = AppReduxHooks.useAppSelector;
export const useAuthState = AppReduxHooks.useAuthState;
export const useIsAuthenticated = AppReduxHooks.useIsAuthenticated;
export const useCurrentUser = AppReduxHooks.useCurrentUser;
