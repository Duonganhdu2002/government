/**
 * src/types/index.ts
 * 
 * Tệp chính xuất tất cả các kiểu dữ liệu được sử dụng trong ứng dụng
 */

// Xuất từ auth
export {
  UserRole,
  UserType,
  // User types
  type BaseUser,
  type CitizenUser,
  type StaffUser,
  type User,
  // Auth state
  type AuthState,
  // Requests
  type LoginRequest,
  type StaffLoginRequest,
  type RegisterCitizenRequest,
  type RefreshTokenRequest,
  type LogoutRequest,
  type ChangePasswordRequest,
  type ResetPasswordRequest,
  // Responses
  type LoginResponse,
  type RegisterResponse,
  type RefreshTokenResponse,
  type LogoutResponse,
  type ChangePasswordResponse,
  type ResetPasswordResponse,
} from './auth';

// Xuất từ user
export {
  type UserProfile,
  type ProfileUpdateRequest,
  type ProfileUpdateResponse,
  type AvatarUploadRequest,
  type AvatarUploadResponse,
  type UserDashboardData,
  type UserActivityLog,
  type UserPreferences,
  // Utility class
  UserUtility,
} from './user';

// Xuất từ common
export {
  type ApiResponse,
  type PaginationMeta,
  type PaginationParams,
  type PaginatedResponse,
  type FormErrors,
  type SelectOption,
  ApplicationStatus,
  type DateRange,
} from './common';

// Xuất từ application
export {
  type ApplicationType,
  type SpecialApplicationType,
  type MediaFile,
  type UploadedFile,
  type ApplicationFormData,
  type Application,
  type ApplicationStats,
  type DashboardResponse,
  type NewApplicationModalProps,
  // Utility class
  ApplicationProcessor,
} from './application';

// Xuất từ post
export {
  type PostCategory,
  type Post,
  type CreatePostCategoryData,
  type CreatePostData,
  type PostCategoryListResponse,
  type PostListResponse,
  type UpdatePostData,
  // Utility class
  PostUtility,
} from './post';

// Xuất từ location
export {
  type Province,
  type District,
  type Ward,
  type AddressData,
  // Utility class
  AddressFormatter,
} from './location';

// Xuất các namespace để sử dụng trực tiếp
export type { UserModels, UserEnums } from './auth';
export type { ProfileModels, NotificationModels as UserNotificationModels, PreferenceModels } from './user';
export type { ApiModels, FormModels, ApplicationEnums, NotificationModels as CommonNotificationModels, DateModels } from './common';
export type { ApplicationModels } from './application';
export type { LocationModels } from './location';
export type { PostModels } from './post';

// Notifications from both modules với tên rõ ràng
export { type Notification as UserNotification } from './user';
export { type Notification as SystemNotification } from './common';