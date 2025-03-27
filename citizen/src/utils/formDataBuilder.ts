/**
 * src/utils/formDataBuilder.ts
 * 
 * Lớp xây dựng đối tượng FormData để gửi đi API
 */

/**
 * Lớp xây dựng FormData
 */
export class FormDataBuilder {
  private formData: FormData;

  /**
   * Khởi tạo FormDataBuilder
   */
  constructor() {
    this.formData = new FormData();
  }

  /**
   * Thêm một trường vào FormData
   */
  public append(key: string, value: string | Blob): FormDataBuilder {
    this.formData.append(key, value);
    return this;
  }

  /**
   * Thêm một trường dữ liệu nếu giá trị không phải null/undefined
   */
  public appendIfExists(key: string, value: any): FormDataBuilder {
    if (value !== null && value !== undefined) {
      this.formData.append(key, value.toString());
    }
    return this;
  }

  /**
   * Thêm nhiều trường từ đối tượng
   */
  public appendFromObject(data: Record<string, any>): FormDataBuilder {
    Object.entries(data).forEach(([key, value]) => {
      this.appendIfExists(key, value);
    });
    return this;
  }

  /**
   * Thêm danh sách file
   */
  public appendFiles(files: File[], fieldName: string = 'files'): FormDataBuilder {
    if (files && files.length > 0) {
      files.forEach(file => {
        this.formData.append(fieldName, file);
      });
    }
    return this;
  }

  /**
   * Thêm một file đơn lẻ nếu có
   */
  public appendFileIfExists(file: File | null, fieldName: string = 'files'): FormDataBuilder {
    if (file) {
      this.formData.append(fieldName, file);
    }
    return this;
  }

  /**
   * Xây dựng và trả về đối tượng FormData
   */
  public build(): FormData {
    return this.formData;
  }
}

/**
 * Lớp cung cấp các phương thức tạo FormData cụ thể cho ứng dụng
 */
export class ApplicationFormDataFactory {
  /**
   * Tạo FormData từ đối tượng dữ liệu
   */
  public static createFromObject(data: Record<string, any>): FormData {
    return new FormDataBuilder().appendFromObject(data).build();
  }

  /**
   * Tạo FormData cho việc upload thông tin đơn từ kèm file đính kèm
   */
  public static createApplicationFormData(
    applicationData: Record<string, any>,
    images: File[] = [],
    video: File | null = null
  ): FormData {
    return new FormDataBuilder()
      .appendFromObject(applicationData)
      .appendFiles(images)
      .appendFileIfExists(video)
      .build();
  }

  /**
   * Tạo FormData cho việc upload media files
   */
  public static createMediaUploadFormData(
    applicationId: number,
    files: File[],
    fileType?: string
  ): FormData {
    return new FormDataBuilder()
      .append('applicationid', applicationId.toString())
      .appendFiles(files)
      .appendIfExists('filetype', fileType)
      .build();
  }
}

// Exports để tương thích với code cũ
export const createFormDataFromObject = ApplicationFormDataFactory.createFromObject;
export const createApplicationFormData = ApplicationFormDataFactory.createApplicationFormData;
export const createMediaUploadFormData = ApplicationFormDataFactory.createMediaUploadFormData;

/**
 * Hàm thêm file vào FormData - giữ lại cho tương thích ngược
 */
export const appendFilesToFormData = (
  formData: FormData, 
  files: File[], 
  fieldName: string = 'files'
): FormData => {
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append(fieldName, file);
    });
  }
  return formData;
}; 