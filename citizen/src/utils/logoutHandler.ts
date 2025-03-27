/**
 * src/utils/logoutHandler.ts
 * 
 * Lớp xử lý đăng xuất người dùng
 */

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setError as setErrorMessage } from '@/store/authSlice';
import { logout as logoutAction } from '@/store/authSlice';

/**
 * Định nghĩa kiểu LogoutOptions
 */
export interface LogoutOptions {
  /** Có chuyển hướng đến trang đăng nhập sau khi đăng xuất không */
  redirect?: boolean;
  /** Thông báo lỗi (nếu có) */
  errorMessage?: string;
}

/**
 * Lớp quản lý đăng xuất người dùng
 */
export class LogoutHandler {
  private readonly router;
  private readonly dispatch;

  /**
   * Khởi tạo LogoutHandler
   * @param router Router instance từ next/navigation
   * @param dispatch Dispatch function từ Redux
   */
  constructor(router: ReturnType<typeof useRouter>, dispatch: ReturnType<typeof useDispatch>) {
    this.router = router;
    this.dispatch = dispatch;
  }

  /**
   * Thực hiện đăng xuất người dùng
   * @param options Tùy chọn đăng xuất
   */
  public executeLogout(options: LogoutOptions = {}): void {
    const { redirect = true, errorMessage } = options;

    // Xóa token khỏi cookies
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');

    // Cập nhật trạng thái Redux
    this.dispatch(logoutAction());

    // Xử lý hiển thị thông báo lỗi nếu có
    if (errorMessage) {
      this.dispatch(setErrorMessage(errorMessage));
    }

    // Chuyển hướng đến trang đăng nhập nếu được yêu cầu
    if (redirect) {
      this.router.replace('/login');
    }
  }

  /**
   * Đăng xuất do token hết hạn
   */
  public logoutDueToExpiredToken(): void {
    this.executeLogout({
      redirect: true,
      errorMessage: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    });
  }

  /**
   * Đăng xuất do lỗi xác thực
   */
  public logoutDueToAuthError(): void {
    this.executeLogout({
      redirect: true,
      errorMessage: 'Có lỗi xác thực. Vui lòng đăng nhập lại.'
    });
  }

  /**
   * Đăng xuất theo yêu cầu người dùng
   */
  public logoutByUserRequest(): void {
    this.executeLogout({
      redirect: true
    });
  }
}

/**
 * Hook tạo LogoutHandler instance
 * @returns LogoutHandler instance
 */
export const useLogoutHandler = (): LogoutHandler => {
  const router = useRouter();
  const dispatch = useDispatch();
  return new LogoutHandler(router, dispatch);
};

/**
 * Hàm tương thích với code cũ
 */
export const executeLogout = (
  router: ReturnType<typeof useRouter>,
  dispatch: ReturnType<typeof useDispatch>,
  redirect: boolean = true,
  errorMessage?: string
): void => {
  const handler = new LogoutHandler(router, dispatch);
  handler.executeLogout({ redirect, errorMessage });
};
