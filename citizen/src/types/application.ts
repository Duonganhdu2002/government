/**
 * Types related to applications
 */
import { MediaAttachment } from './media';

/**
 * Interface cho loại hồ sơ
 */
export interface ApplicationType {
  applicationtypeid: number;
  typename: string;
  description: string;
  processingtimelimit: number;
  category?: string;
  processingTimeRange?: {
    min: number;
    max: number;
  };
}

/**
 * Interface cho loại hồ sơ đặc biệt
 */
export interface SpecialApplicationType {
  specialapplicationtypeid: number;
  applicationtypeid: number;
  typename: string;
  description?: string;
  processingtimelimit: number;
  applicationtypename?: string;
}

/**
 * Interface cho file đã upload
 */
export interface UploadedFile {
  file: File;
  preview: string;
}

/**
 * Interface cho dữ liệu đơn mới
 */
export interface ApplicationFormData {
  citizenid?: number | null;
  applicationtypeid: number | string;
  specialapplicationtypeid?: number | string | null;
  title: string;
  description?: string;
  submissiondate?: string;
  status?: string;
  currentagencyid?: number;
  lastupdated?: string;
  duedate?: string;
  isoverdue?: boolean;
  hasmedia?: boolean;
  eventdate?: string;
  location?: string;
}

/**
 * Interface for Application Data display
 */
export interface ApplicationData {
  applicationid: number;
  title: string;
  description?: string;
  status: string;
  submissiondate: string;
  duedate?: string;
  applicationtypename: string;
  specialapplicationtypename?: string;
  eventdate?: string;
  location?: string;
  citizenname?: string;
  citizenid?: string;
  citizenemail?: string;
  citizenphone?: string;
  citizenaddress?: string;
  attachments?: MediaAttachment[];
  [key: string]: any;
}

/**
 * Interface for Print Preview Props
 */
export interface PrintPreviewProps {
  application: ApplicationData;
  onClose: () => void;
}

/**
 * Interface cho props của modal
 */
export interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (applicationId: number) => void;
}

/**
 * Interface for Application Detail Modal Props
 */
export interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number | null;
} 