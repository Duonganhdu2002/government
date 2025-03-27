/**
 * src/types/common.ts
 * 
 * Định nghĩa các kiểu dữ liệu chung được sử dụng trong toàn bộ ứng dụng
 */

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến API
 */
export namespace ApiModels {
  /**
   * Generic API response 
   */
  export interface Response<T> {
    readonly status: string;
    readonly message?: string;
    readonly data?: T;
    readonly error?: string;
    readonly errors?: Record<string, string[]>;
  }

  /**
   * Thông tin phân trang
   */
  export interface PaginationMeta {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly pageSize: number;
    readonly totalCount: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  }

  /**
   * Tham số request phân trang
   */
  export interface PaginationParams {
    readonly page?: number;
    readonly limit?: number;
    readonly sortBy?: string;
    readonly sortOrder?: 'asc' | 'desc';
    readonly search?: string;
  }

  /**
   * Response phân trang
   */
  export interface PaginatedResponse<T> extends Response<T[]> {
    readonly meta: PaginationMeta;
  }
}

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến thông báo
 */
export namespace NotificationModels {
  /**
   * Loại thông báo
   */
  export enum Type {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
  }

  /**
   * Cấu trúc thông báo
   */
  export interface Notification {
    readonly id: number;
    readonly userId: number;
    readonly title: string;
    readonly message: string;
    readonly isRead: boolean;
    readonly type: Type;
    readonly createdAt: string;
    readonly link?: string;
    readonly relatedEntityId?: number;
    readonly relatedEntityType?: string;
  }
}

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến form
 */
export namespace FormModels {
  /**
   * Lỗi form
   */
  export interface Errors {
    readonly [key: string]: string;
  }

  /**
   * Tùy chọn select
   */
  export interface SelectOption {
    readonly value: string | number;
    readonly label: string;
    readonly disabled?: boolean;
    readonly description?: string;
  }
}

/**
 * Namespace chứa các enums liên quan đến trạng thái hồ sơ
 */
export namespace ApplicationEnums {
  /**
   * Trạng thái hồ sơ
   */
  export enum Status {
    PENDING = 'pending',
    PROCESSING = 'processing',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COMPLETED = 'completed'
  }
}

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến thời gian
 */
export namespace DateModels {
  /**
   * Khoảng thời gian
   */
  export interface Range {
    readonly startDate: string;
    readonly endDate: string;
  }
}

// Exports tương thích với code cũ
export type ApiResponse<T> = ApiModels.Response<T>;
export type PaginationMeta = ApiModels.PaginationMeta;
export type PaginationParams = ApiModels.PaginationParams;
export type PaginatedResponse<T> = ApiModels.PaginatedResponse<T>;
export type Notification = NotificationModels.Notification;
export type FormErrors = FormModels.Errors;
export type SelectOption = FormModels.SelectOption;
export const ApplicationStatus = ApplicationEnums.Status;
export type DateRange = DateModels.Range; 