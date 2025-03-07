/**
 * Interface cho loại hồ sơ
 */
export interface ApplicationType {
  applicationtypeid: number;
  typename: string;
  description: string;
  processingtimelimit: number;
}

/**
 * Interface cho loại hồ sơ đặc biệt
 */
export interface SpecialApplicationType {
  specialapplicationtypeid: number;
  applicationtypeid: number;
  typename: string;
  processingtimelimit: number;
  applicationtypename?: string;
}

/**
 * Interface cho file đã upload
 */
export interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

/**
 * Interface cho dữ liệu đơn mới
 */
export interface ApplicationFormData {
  citizenid: number | null;
  applicationtypeid: number | string;
  specialapplicationtypeid?: number | string | null;
  title: string;
  description: string;
  submissiondate: string;
  status: string;
  hasmedia: boolean;
  eventdate: string;
  location: string;
}

/**
 * Interface cho props của modal
 */
export interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (applicationId: number) => void;
} 