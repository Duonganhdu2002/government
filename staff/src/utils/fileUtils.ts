import { UploadedFile } from "@/types/application";

/**
 * Kiểm tra kích thước của file ảnh
 * @param file File ảnh cần kiểm tra
 * @param maxSize Kích thước tối đa tính bằng byte (mặc định 5MB)
 */
export const validateImageFile = (file: File, maxSize: number = 5 * 1024 * 1024): string | null => {
  // Kiểm tra kích thước ảnh
  if (file.size > maxSize) {
    return `Ảnh phải nhỏ hơn ${maxSize / (1024 * 1024)}MB`;
  }
  
  // Kiểm tra định dạng file
  if (!file.type.startsWith('image/')) {
    return 'File không phải là ảnh';
  }
  
  return null;
};

/**
 * Kiểm tra kích thước của file video
 * @param file File video cần kiểm tra
 * @param maxSize Kích thước tối đa tính bằng byte (mặc định 50MB)
 */
export const validateVideoFile = (file: File, maxSize: number = 50 * 1024 * 1024): string | null => {
  // Kiểm tra kích thước video
  if (file.size > maxSize) {
    return `Video phải nhỏ hơn ${maxSize / (1024 * 1024)}MB`;
  }
  
  // Kiểm tra định dạng file
  if (!file.type.startsWith('video/')) {
    return 'File không phải là video';
  }
  
  return null;
};

/**
 * Tạo preview URL cho file
 * @param file File cần tạo preview
 */
export const createFilePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Tạo object UploadedFile từ File
 * @param file File gốc
 */
export const createUploadedFile = (file: File): UploadedFile => {
  return {
    file,
    preview: createFilePreview(file),
    progress: 100
  };
};

/**
 * Giải phóng các preview URL để tránh memory leak
 * @param files Danh sách file cần giải phóng
 */
export const revokeFilePreviews = (files: UploadedFile[]): void => {
  files.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  });
}; 