/**
 * constants.ts
 * 
 * Tập trung tất cả các hằng số được sử dụng trong ứng dụng
 */

// Thông tin ứng dụng
export const APP_INFO = {
  NAME: 'Cổng Dịch Vụ Công',
  VERSION: '1.0.0',
  DESCRIPTION: 'Hệ thống Dịch vụ công trực tuyến dành cho người dân',
  COPYRIGHT: '© 2024 Cổng Dịch Vụ Công. Bản quyền thuộc về Bộ Thông tin và Truyền thông.'
};

// Thời gian timeout của các API calls (ms)
export const API_TIMEOUT = 30000;

// Các loại đơn từ
export const APPLICATION_CATEGORIES = {
  PERSONAL: 'Hồ sơ cá nhân',
  LEGAL: 'Pháp lý & Tư pháp',
  PROPERTY: 'Nhà đất & Tài sản',
  BUSINESS: 'Doanh nghiệp & Kinh doanh',
  SOCIAL: 'Xã hội & Cộng đồng',
  OTHER: 'Loại hồ sơ khác'
};

// Trạng thái đơn
export const APPLICATION_STATUS = {
  SUBMITTED: 'Submitted',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  PENDING: 'Pending'
};

// Loại người dùng
export const USER_TYPES = {
  CITIZEN: 'citizen',
  STAFF: 'staff',
  ADMIN: 'admin'
};

// Các giá trị mặc định
export const DEFAULT_VALUES = {
  PAGINATION_LIMIT: 10,
  AVATAR_PLACEHOLDER: '/placeholder-image.svg'
};

// Thời gian cache (ms)
export const CACHE_DURATIONS = {
  APPLICATION_TYPES: 30 * 60 * 1000, // 30 phút
  LOCATION_DATA: 24 * 60 * 60 * 1000 // 24 giờ
};

// Kích thước file tối đa (bytes)
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 10 * 1024 * 1024 // 10MB
};

// Định dạng file được chấp nhận
export const ACCEPTED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Keys lưu trữ local storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PROFILE: 'userProfile',
  APPLICATION_TYPES: 'application-types-data',
  APPLICATION_TYPES_TIMESTAMP: 'application-types-timestamp'
}; 