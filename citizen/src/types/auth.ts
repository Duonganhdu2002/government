/**
 * src/types/auth.ts
 * 
 * Định nghĩa các kiểu dữ liệu cho xác thực và dữ liệu người dùng
 */

/**
 * Namespace chứa các enum liên quan đến người dùng
 */
export namespace UserEnums {
  /**
   * Vai trò của người dùng
   */
  export enum Role {
    CITIZEN = 'citizen',
    STAFF = 'staff',
    ADMIN = 'admin'
  }

  /**
   * Loại người dùng
   */
  export enum Type {
    CITIZEN = 'citizen',
    STAFF = 'staff'
  }
}

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến người dùng
 */
export namespace UserModels {
  /**
   * Cấu trúc người dùng cơ bản
   */
  export interface Base {
    readonly id: number;
    readonly username: string;
    readonly type: UserEnums.Type;
  }

  /**
   * Cấu trúc người dùng công dân
   */
  export interface Citizen extends Base {
    readonly type: UserEnums.Type.CITIZEN;
    readonly fullname: string;
    readonly name?: string; // Hỗ trợ cả hai định dạng tên
    readonly identificationNumber?: string;
    readonly identificationnumber?: string; // Định dạng từ backend
    readonly address?: string;
    readonly phone?: string;
    readonly phoneNumber?: string; // Hỗ trợ cả hai định dạng số điện thoại
    readonly email?: string;
    readonly areaCode?: number;
    readonly areacode?: number; // Định dạng từ backend
    readonly profileImage?: string;
    readonly imageLink?: string; // Hỗ trợ cả hai định dạng hình ảnh
    readonly registrationDate?: string;
    readonly lastLogin?: string;
  }

  /**
   * Cấu trúc người dùng nhân viên
   */
  export interface Staff extends Base {
    readonly type: UserEnums.Type.STAFF;
    readonly role: string;
    readonly agencyId: number;
    readonly fullname?: string;
    readonly name?: string; // Hỗ trợ cả hai định dạng tên
    readonly employeeCode?: string;
  }

  /**
   * Kiểu dữ liệu người dùng kết hợp
   */
  export type User = Citizen | Staff;
}

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến xác thực
 */
export namespace AuthModels {
  /**
   * Trạng thái xác thực
   */
  export interface State {
    readonly isAuthenticated: boolean;
    readonly user: UserModels.User | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly tokens?: {
      readonly accessToken: string;
      readonly refreshToken: string;
      readonly expiresIn: number;
    };
  }

  /**
   * Các request/response liên quan đến xác thực
   */
  export namespace Requests {
    /**
     * Request đăng nhập
     */
    export interface Login {
      readonly username: string;
      readonly password: string;
      readonly userType: UserEnums.Type;
    }

    /**
     * Request đăng nhập nhân viên
     */
    export interface StaffLogin {
      readonly staffId: number;
      readonly password: string;
    }

    /**
     * Request đăng ký công dân
     */
    export interface RegisterCitizen {
      readonly fullname: string;
      readonly identificationNumber: string;
      readonly address?: string;
      readonly phone?: string;
      readonly email?: string;
      readonly username: string;
      readonly password: string;
      readonly areaCode?: number;
    }

    /**
     * Request refresh token
     */
    export interface RefreshToken {
      readonly refreshToken: string;
    }

    /**
     * Request đăng xuất
     */
    export interface Logout {
      readonly refreshToken: string;
    }

    /**
     * Request đổi mật khẩu
     */
    export interface ChangePassword {
      readonly citizenId: number;
      readonly citizenid?: number; // Định dạng từ backend
      readonly oldPassword: string;
      readonly newPassword: string;
    }

    /**
     * Request khôi phục mật khẩu
     */
    export interface ResetPassword {
      readonly email: string;
    }
  }

  /**
   * Các responses liên quan đến xác thực
   */
  export namespace Responses {
    /**
     * Response đăng nhập
     */
    export interface Login {
      readonly status: string;
      readonly message: string;
      readonly data: {
        readonly user: UserModels.User;
        readonly tokens: {
          readonly accessToken: string;
          readonly refreshToken: string;
          readonly expiresIn: string;
        }
      }
    }

    /**
     * Response đăng ký
     */
    export interface Register {
      readonly status: string;
      readonly message: string;
      readonly data: {
        readonly user: UserModels.Citizen;
        readonly tokens: {
          readonly accessToken: string;
          readonly refreshToken: string;
          readonly expiresIn: string;
        }
      }
    }

    /**
     * Response refresh token
     */
    export interface RefreshToken {
      readonly status: string;
      readonly data: {
        readonly tokens: {
          readonly accessToken: string;
          readonly refreshToken: string;
          readonly expiresIn: string;
        }
      }
    }

    /**
     * Response đăng xuất
     */
    export interface Logout {
      readonly status: string;
      readonly message: string;
    }

    /**
     * Response đổi mật khẩu
     */
    export interface ChangePassword {
      readonly status: string;
      readonly message: string;
    }

    /**
     * Response khôi phục mật khẩu
     */
    export interface ResetPassword {
      readonly status: string;
      readonly message: string;
    }
  }
}

// Exports tương thích với code cũ

// Enums
export const UserRole = UserEnums.Role;
export const UserType = UserEnums.Type;

// User types
export type BaseUser = UserModels.Base;
export type CitizenUser = UserModels.Citizen;
export type StaffUser = UserModels.Staff;
export type User = UserModels.User;

// Auth state
export type AuthState = AuthModels.State;

// Requests
export type LoginRequest = AuthModels.Requests.Login;
export type StaffLoginRequest = AuthModels.Requests.StaffLogin;
export type RegisterCitizenRequest = AuthModels.Requests.RegisterCitizen;
export type RefreshTokenRequest = AuthModels.Requests.RefreshToken;
export type LogoutRequest = AuthModels.Requests.Logout;
export type ChangePasswordRequest = AuthModels.Requests.ChangePassword;
export type ResetPasswordRequest = AuthModels.Requests.ResetPassword;

// Responses
export type LoginResponse = AuthModels.Responses.Login;
export type RegisterResponse = AuthModels.Responses.Register;
export type RefreshTokenResponse = AuthModels.Responses.RefreshToken;
export type LogoutResponse = AuthModels.Responses.Logout;
export type ChangePasswordResponse = AuthModels.Responses.ChangePassword;
export type ResetPasswordResponse = AuthModels.Responses.ResetPassword; 