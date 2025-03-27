/**
 * src/types/application.ts
 * 
 * Định nghĩa kiểu dữ liệu cho đơn từ, hồ sơ và các thành phần liên quan
 */

import { UserModels } from './auth';

/**
 * Namespace chứa các kiểu dữ liệu liên quan đến đơn từ
 */
export namespace ApplicationModels {
  /**
   * Trạng thái đơn
   */
  export enum Status {
    PENDING = 'pending',
    PROCESSING = 'processing',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COMPLETED = 'completed'
  }

  /**
   * Loại đơn
   */
  export interface Type {
    readonly applicationtypeid: number;
    readonly typename: string;
    readonly description: string;
    readonly processingtimelimit: number;
    readonly category?: string;
  }

  /**
   * Loại đơn đặc biệt
   */
  export interface SpecialType {
    readonly specialapplicationtypeid: number;
    readonly applicationtypeid: number;
    readonly typename: string;
    readonly processingtimelimit: number;
    readonly applicationtypename?: string;
  }

  /**
   * Tệp đa phương tiện đính kèm
   */
  export interface MediaFile {
    readonly mediafileid?: number;
    readonly id?: number;
    readonly applicationid: number;
    readonly mimetype?: string;
    readonly filename?: string;
    readonly originalfilename?: string;
    readonly filesize?: number;
    readonly filepath?: string;
    readonly uploaddate?: string;
    readonly [key: string]: any;
  }

  /**
   * Tệp đã upload (đang ở client)
   */
  export interface UploadedFile {
    readonly file: File;
    readonly preview: string;
  }

  /**
   * Dữ liệu đơn khi tạo mới
   */
  export interface FormData {
    readonly applicationtypeid?: number | '';
    readonly specialapplicationtypeid?: number | '';
    readonly title: string;
    readonly description: string;
    readonly eventdate: string;
    readonly location: string;
    readonly hasattachments: boolean;
    readonly submissiondate?: string;
    readonly status?: string;
    readonly duedate?: string;
    readonly provinceCode?: string;
    readonly districtCode?: string;
    readonly wardCode?: string;
  }

  /**
   * Dữ liệu đơn đã nộp
   */
  export interface Application {
    readonly applicationid: number;
    readonly applicationtypeid: number;
    readonly specialapplicationtypeid?: number;
    readonly citizenid: number;
    readonly title: string;
    readonly description: string;
    readonly eventdate: string;
    readonly location: string;
    readonly submissiondate: string;
    readonly status: string;
    readonly processingdate?: string;
    readonly completiondate?: string;
    readonly duedate?: string;
    readonly notes?: string;
    readonly staffid?: number;
    readonly hasmedia?: boolean;
    readonly typename?: string;
    readonly specialtypename?: string;
    readonly attachments?: MediaFile[];
  }

  /**
   * Thống kê đơn từ
   */
  export interface Stats {
    readonly total: number;
    readonly pending: number;
    readonly approved: number;
    readonly rejected: number;
  }

  /**
   * Phản hồi cho dashboard
   */
  export interface DashboardResponse {
    readonly applications: Application[];
    readonly stats: Stats;
  }

  /**
   * Các props cho modal tạo đơn mới
   */
  export interface NewApplicationModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onSuccess?: (applicationId: number) => void;
  }
  
  /**
   * Lịch sử xử lý đơn
   */
  export interface ProcessingHistory {
    readonly id: number;
    readonly applicationid: number;
    readonly staffid: number;
    readonly action: string;
    readonly note?: string;
    readonly timestamp: string;
    readonly status?: string;
    readonly staffName?: string;
  }
}

/**
 * Lớp tiện ích xử lý đơn từ
 */
export class ApplicationProcessor {
  /**
   * Kiểm tra xem đơn có đang trong trạng thái chờ xử lý hay không
   */
  public static isPending(status: string): boolean {
    return status.toLowerCase() === ApplicationModels.Status.PENDING.toLowerCase() ||
           status.toLowerCase() === ApplicationModels.Status.PROCESSING.toLowerCase();
  }
  
  /**
   * Kiểm tra xem đơn có đã được xử lý xong hay không
   */
  public static isCompleted(status: string): boolean {
    return status.toLowerCase() === ApplicationModels.Status.APPROVED.toLowerCase() ||
           status.toLowerCase() === ApplicationModels.Status.COMPLETED.toLowerCase();
  }
  
  /**
   * Kiểm tra xem đơn có bị từ chối hay không
   */
  public static isRejected(status: string): boolean {
    return status.toLowerCase() === ApplicationModels.Status.REJECTED.toLowerCase();
  }
  
  /**
   * Lấy màu sắc dựa trên trạng thái đơn
   */
  public static getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    
    if (statusLower === ApplicationModels.Status.PENDING.toLowerCase()) {
      return '#FFA500'; // Orange
    } else if (statusLower === ApplicationModels.Status.PROCESSING.toLowerCase()) {
      return '#3498DB'; // Blue
    } else if (statusLower === ApplicationModels.Status.APPROVED.toLowerCase() ||
              statusLower === ApplicationModels.Status.COMPLETED.toLowerCase()) {
      return '#2ECC71'; // Green
    } else if (statusLower === ApplicationModels.Status.REJECTED.toLowerCase()) {
      return '#E74C3C'; // Red
    }
    
    return '#95A5A6'; // Gray (default)
  }
}

// Exports tương thích với code cũ
export type ApplicationType = ApplicationModels.Type;
export type SpecialApplicationType = ApplicationModels.SpecialType;
export type MediaFile = ApplicationModels.MediaFile;
export type UploadedFile = ApplicationModels.UploadedFile;
export type ApplicationFormData = ApplicationModels.FormData;
export type Application = ApplicationModels.Application;
export type ApplicationStats = ApplicationModels.Stats;
export type DashboardResponse = ApplicationModels.DashboardResponse;
export type NewApplicationModalProps = ApplicationModels.NewApplicationModalProps; 