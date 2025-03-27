/**
 * src/utils/fileUtils.ts
 * 
 * Lớp tiện ích xử lý file
 */
import { UploadedFile } from "@/types/application";

/**
 * Enum kiểu file
 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document'
}

/**
 * Lớp quản lý kích thước file
 */
export class FileSizeConfig {
  /**
   * Kích thước tối đa mặc định (bytes)
   */
  public static readonly DEFAULT_IMAGE_MAX_SIZE = 5 * 1024 * 1024;   // 5MB
  public static readonly DEFAULT_VIDEO_MAX_SIZE = 50 * 1024 * 1024;  // 50MB
  public static readonly DEFAULT_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  
  /**
   * Chuyển đổi kích thước từ bytes sang MB để hiển thị
   */
  public static bytesToMB(bytes: number): number {
    return bytes / (1024 * 1024);
  }
}

/**
 * Lớp xử lý file
 */
export class FileProcessor {
  /**
   * Kiểm tra kiểu mimetype của file
   */
  public static checkMimeType(file: File, type: FileType): boolean {
    switch (type) {
      case FileType.IMAGE:
        return file.type.startsWith('image/');
      case FileType.VIDEO:
        return file.type.startsWith('video/');
      case FileType.DOCUMENT:
        return file.type.startsWith('application/') || file.type.startsWith('text/');
      default:
        return false;
    }
  }
  
  /**
   * Kiểm tra kích thước file
   */
  public static checkFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
  
  /**
   * Tạo preview URL cho file
   */
  public static createPreviewURL(file: File): string {
    return URL.createObjectURL(file);
  }
  
  /**
   * Giải phóng preview URL để tránh memory leak
   */
  public static revokePreviewURL(preview: string): void {
    URL.revokeObjectURL(preview);
  }
  
  /**
   * Tạo UploadedFile từ File
   */
  public static createUploadedFile(file: File): UploadedFile {
    return {
      file,
      preview: this.createPreviewURL(file)
    };
  }
  
  /**
   * Giải phóng danh sách preview URL
   */
  public static revokeFilePreviews(files: UploadedFile[]): void {
    files.forEach(file => {
      if (file.preview) {
        this.revokePreviewURL(file.preview);
      }
    });
  }
}

/**
 * Lớp xác thực file
 */
export class FileValidator {
  /**
   * Kiểm tra file hình ảnh
   */
  public static validateImageFile(file: File, maxSize: number = FileSizeConfig.DEFAULT_IMAGE_MAX_SIZE): string | null {
    // Kiểm tra kích thước ảnh
    if (!FileProcessor.checkFileSize(file, maxSize)) {
      return `Ảnh phải nhỏ hơn ${FileSizeConfig.bytesToMB(maxSize)}MB`;
    }
    
    // Kiểm tra định dạng file
    if (!FileProcessor.checkMimeType(file, FileType.IMAGE)) {
      return 'File không phải là ảnh';
    }
    
    return null;
  }
  
  /**
   * Kiểm tra file video
   */
  public static validateVideoFile(file: File, maxSize: number = FileSizeConfig.DEFAULT_VIDEO_MAX_SIZE): string | null {
    // Kiểm tra kích thước video
    if (!FileProcessor.checkFileSize(file, maxSize)) {
      return `Video phải nhỏ hơn ${FileSizeConfig.bytesToMB(maxSize)}MB`;
    }
    
    // Kiểm tra định dạng file
    if (!FileProcessor.checkMimeType(file, FileType.VIDEO)) {
      return 'File không phải là video';
    }
    
    return null;
  }
  
  /**
   * Kiểm tra file tài liệu
   */
  public static validateDocumentFile(file: File, maxSize: number = FileSizeConfig.DEFAULT_DOCUMENT_MAX_SIZE): string | null {
    // Kiểm tra kích thước tài liệu
    if (!FileProcessor.checkFileSize(file, maxSize)) {
      return `Tài liệu phải nhỏ hơn ${FileSizeConfig.bytesToMB(maxSize)}MB`;
    }
    
    // Kiểm tra định dạng file
    if (!FileProcessor.checkMimeType(file, FileType.DOCUMENT)) {
      return 'File không phải là tài liệu';
    }
    
    return null;
  }
}

// Exports để tương thích với code cũ
export const validateImageFile = FileValidator.validateImageFile;
export const validateVideoFile = FileValidator.validateVideoFile;
export const createFilePreview = FileProcessor.createPreviewURL;
export const createUploadedFile = FileProcessor.createUploadedFile;
export const revokeFilePreviews = FileProcessor.revokeFilePreviews; 