/**
 * src/services/authService.ts
 *
 * Module định nghĩa các hàm gọi API cho các thao tác liên quan đến xác thực
 */
import { apiClient } from '@/utils/api';
import { AUTH_ENDPOINTS } from '@/resources/apiEndpoints';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterCitizenRequest, 
  RegisterResponse, 
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserType
} from '@/types';

/**
 * Đăng ký tài khoản người dùng mới (người dân)
 */
export const registerUser = async (
  data: RegisterCitizenRequest
): Promise<RegisterResponse> => {
  const requestData = {
    ...data,
    // Chuyển đổi tên trường để khớp với backend
    identificationnumber: data.identificationNumber,
    phonenumber: data.phone,
    areacode: data.areaCode,
    userType: UserType.CITIZEN
  };

  return await apiClient.post(AUTH_ENDPOINTS.REGISTER, requestData);
};

/**
 * Đăng nhập người dùng
 */
export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  return await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
};

/**
 * Làm mới token
 */
export const refreshToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {
  const request: RefreshTokenRequest = { refreshToken };
  return await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, request);
};

/**
 * Đăng xuất người dùng
 */
export const logoutUser = async (
  refreshToken: string
): Promise<LogoutResponse> => {
  const request: LogoutRequest = { refreshToken };
  return await apiClient.post(AUTH_ENDPOINTS.LOGOUT, request);
};

/**
 * Thay đổi mật khẩu
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  return await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
};

/**
 * Yêu cầu đặt lại mật khẩu
 */
export const requestResetPassword = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  return await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
};
