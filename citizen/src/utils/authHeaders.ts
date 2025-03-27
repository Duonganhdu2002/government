/**
 * src/utils/authHeaders.ts
 * 
 * Lớp quản lý headers xác thực cho các request API
 */
import Cookies from 'js-cookie';

/**
 * Lớp cung cấp headers xác thực
 */
export class AuthHeadersProvider {
  /**
   * Token cookie key
   */
  private static readonly TOKEN_COOKIE_KEY = 'accessToken';

  /**
   * Lấy access token từ cookie
   */
  public static getAccessToken(): string | undefined {
    return Cookies.get(this.TOKEN_COOKIE_KEY);
  }

  /**
   * Kiểm tra xem đã có token hay chưa
   */
  public static hasToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Lấy headers chuẩn cho request API
   */
  public static getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  /**
   * Lấy headers xác thực với bearer token (nếu có)
   */
  public static getAuthHeaders(): Record<string, string> {
    const headers = this.getDefaultHeaders();
    const token = this.getAccessToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
}

// Export để tương thích với code cũ
export const getAuthHeaders = AuthHeadersProvider.getAuthHeaders.bind(AuthHeadersProvider);
