/**
 * src/types/user.ts
 * 
 * Định nghĩa kiểu dữ liệu cho người dùng, hồ sơ cá nhân và tùy chọn
 */

import { ApplicationModels } from './application';
import { ApiModels } from './common';
import { UserModels } from './auth';

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến người dùng
 */
export namespace ProfileModels {
  /**
   * Giới tính người dùng
   */
  export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    PREFER_NOT_TO_SAY = 'prefer_not_to_say'
  }
  
  /**
   * Thông tin hồ sơ người dùng
   */
  export interface UserProfile {
    readonly user_id?: number;
    readonly userId?: number; // Tương thích với cả hai kiểu đặt tên
    readonly username?: string;
    readonly email?: string;
    readonly phone?: string;
    readonly first_name?: string;
    readonly firstName?: string; // Tương thích với cả hai kiểu đặt tên
    readonly last_name?: string;
    readonly lastName?: string; // Tương thích với cả hai kiểu đặt tên
    readonly full_name?: string;
    readonly fullName?: string; // Tương thích với cả hai kiểu đặt tên
    readonly dob?: string;
    readonly gender?: string;
    readonly id_number?: string;
    readonly idNumber?: string; // Tương thích với cả hai kiểu đặt tên
    readonly address?: string;
    readonly province_code?: string;
    readonly provinceCode?: string; // Tương thích với cả hai kiểu đặt tên
    readonly district_code?: string;
    readonly districtCode?: string; // Tương thích với cả hai kiểu đặt tên
    readonly ward_code?: string;
    readonly wardCode?: string; // Tương thích với cả hai kiểu đặt tên
    readonly street_address?: string;
    readonly streetAddress?: string; // Tương thích với cả hai kiểu đặt tên
    readonly avatar_url?: string;
    readonly avatarUrl?: string; // Tương thích với cả hai kiểu đặt tên
    readonly created_at?: string;
    readonly createdAt?: string; // Tương thích với cả hai kiểu đặt tên
    readonly updated_at?: string;
    readonly updatedAt?: string; // Tương thích với cả hai kiểu đặt tên
    readonly bio?: string;
    readonly occupation?: string;
    readonly company?: string;
    readonly website?: string;
    readonly social_media?: {
      readonly facebook?: string;
      readonly twitter?: string;
      readonly instagram?: string;
      readonly linkedin?: string;
    };
    readonly socialMedia?: {
      readonly facebook?: string;
      readonly twitter?: string;
      readonly instagram?: string;
      readonly linkedin?: string;
    }; // Tương thích với cả hai kiểu đặt tên
  }
  
  /**
   * Yêu cầu cập nhật hồ sơ
   */
  export interface UpdateRequest {
    readonly first_name?: string;
    readonly last_name?: string;
    readonly dob?: string;
    readonly gender?: string;
    readonly id_number?: string;
    readonly phone?: string;
    readonly email?: string;
    readonly province_code?: string;
    readonly district_code?: string;
    readonly ward_code?: string;
    readonly street_address?: string;
    readonly bio?: string;
    readonly occupation?: string;
    readonly company?: string;
    readonly website?: string;
    readonly social_media?: {
      readonly facebook?: string;
      readonly twitter?: string;
      readonly instagram?: string;
      readonly linkedin?: string;
    };
  }
  
  /**
   * Phản hồi khi cập nhật hồ sơ
   */
  export interface UpdateResponse extends ApiModels.Response<UserProfile> {}
  
  /**
   * Yêu cầu tải lên ảnh đại diện
   */
  export interface AvatarUploadRequest {
    readonly file: File;
  }
  
  /**
   * Phản hồi khi tải lên ảnh đại diện
   */
  export interface AvatarUploadResponse extends ApiModels.Response<{
    readonly avatar_url: string;
  }> {}
  
  /**
   * Dữ liệu dashboard người dùng
   */
  export interface DashboardData {
    readonly user: UserProfile;
    readonly applicationStats: ApplicationModels.Stats;
    readonly recentApplications: ApplicationModels.Application[];
    readonly notifications?: NotificationModels.Notification[];
  }
  
  /**
   * Lịch sử hoạt động người dùng
   */
  export interface ActivityLog {
    readonly id: number;
    readonly user_id: number;
    readonly action: string;
    readonly description: string;
    readonly ip_address?: string;
    readonly timestamp: string;
    readonly related_entity?: string;
    readonly related_id?: number;
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
    APPLICATION = 'application',
    SYSTEM = 'system',
    INFO = 'info',
    WARNING = 'warning',
    ALERT = 'alert'
  }
  
  /**
   * Thông báo
   */
  export interface Notification {
    readonly id: number;
    readonly user_id: number;
    readonly title: string;
    readonly message: string;
    readonly type: string;
    readonly is_read: boolean;
    readonly created_at: string;
    readonly related_entity?: string;
    readonly related_id?: number;
    readonly action_url?: string;
  }
}

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến tùy chọn người dùng
 */
export namespace PreferenceModels {
  /**
   * Tùy chọn thông báo
   */
  export interface NotificationPreferences {
    readonly email_notifications: boolean;
    readonly application_updates: boolean;
    readonly system_announcements: boolean;
    readonly marketing_emails: boolean;
  }
  
  /**
   * Tùy chọn giao diện
   */
  export interface UIPreferences {
    readonly theme: 'light' | 'dark' | 'system';
    readonly language: string;
    readonly text_size: 'small' | 'medium' | 'large';
    readonly high_contrast: boolean;
  }
  
  /**
   * Tất cả tùy chọn người dùng
   */
  export interface UserPreferences {
    readonly notifications: NotificationPreferences;
    readonly ui: UIPreferences;
    readonly privacy: {
      readonly show_profile: boolean;
      readonly share_activity: boolean;
    };
  }
}

/**
 * Lớp tiện ích xử lý thông tin người dùng
 */
export class UserUtility {
  /**
   * Tạo tên đầy đủ từ tên và họ
   */
  public static getFullName(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) return '';
    if (!firstName) return lastName || '';
    if (!lastName) return firstName || '';
    return `${firstName} ${lastName}`;
  }
  
  /**
   * Tạo tên viết tắt từ tên đầy đủ
   */
  public static getInitials(fullName?: string): string {
    if (!fullName) return '';
    
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  /**
   * Kiểm tra xem hồ sơ đã hoàn thiện chưa
   */
  public static isProfileComplete(profile: ProfileModels.UserProfile): boolean {
    const requiredFields = [
      'first_name', 
      'last_name', 
      'email', 
      'phone', 
      'id_number', 
      'province_code',
      'district_code',
      'ward_code',
      'street_address'
    ];
    
    return requiredFields.every(field => 
      Object.prototype.hasOwnProperty.call(profile, field) && 
      Boolean(profile[field as keyof ProfileModels.UserProfile])
    );
  }
}

// Exports tương thích với code cũ
export type UserProfile = ProfileModels.UserProfile;
export type ProfileUpdateRequest = ProfileModels.UpdateRequest;
export type ProfileUpdateResponse = ProfileModels.UpdateResponse;
export type AvatarUploadRequest = ProfileModels.AvatarUploadRequest;
export type AvatarUploadResponse = ProfileModels.AvatarUploadResponse;
export type UserDashboardData = ProfileModels.DashboardData;
export type UserActivityLog = ProfileModels.ActivityLog;
export type Notification = NotificationModels.Notification;
export type UserPreferences = PreferenceModels.UserPreferences; 