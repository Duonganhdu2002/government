/**
 * src/utils/mappers/applicationMapper.ts
 * 
 * Lớp chuyển đổi (mapper) dữ liệu cho ứng dụng (application)
 */

import { Application, ApplicationStats, DashboardResponse, MediaFile } from '@/types';
import { DateFormatter, DateFormat } from '@/utils/dateUtils';

/**
 * Lớp mapper cho Application
 */
export class ApplicationMapper {
  /**
   * Chuyển đổi dữ liệu API từ snake_case sang camelCase
   * và chuẩn hóa các trường dữ liệu
   */
  public static mapApiToApplication(data: any): Application | null {
    if (!data) return null;

    return {
      applicationid: data.applicationid || data.id || 0,
      citizenid: data.citizenid || data.citizenId || 0,
      applicationtypeid: data.applicationtypeid || data.applicationTypeId || 0,
      specialapplicationtypeid: data.specialapplicationtypeid || data.specialApplicationTypeId || null,
      title: data.title || '',
      description: data.description || '',
      eventdate: data.eventdate || data.eventDate || '',
      location: data.location || '',
      submissiondate: data.submissiondate || data.submissionDate || '',
      status: data.status || '',
      processingdate: data.processingdate || data.processingDate || '',
      completiondate: data.completiondate || data.completionDate || '',
      duedate: data.duedate || data.dueDate || '',
      notes: data.note || data.notes || '',
      staffid: data.staffid || data.staffId || null,
      hasmedia: Array.isArray(data.attachments) && data.attachments.length > 0,
      typename: data.applicationtypename || data.applicationTypeName || data.typename || '',
      specialtypename: data.specialapplicationtypename || data.specialApplicationTypeName || data.specialtypename || '',
      attachments: Array.isArray(data.attachments) ? data.attachments : []
    };
  }

  /**
   * Chuyển đổi nhiều bản ghi từ API response
   */
  public static mapApiToApplications(data: any[]): Application[] {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => this.mapApiToApplication(item))
      .filter(Boolean) as Application[];
  }

  /**
   * Chuyển đổi dữ liệu thống kê từ API
   */
  public static mapApiToApplicationStats(data: any): ApplicationStats | null {
    if (!data) return null;
    
    return {
      total: data.total || 0,
      pending: data.pending || 0,
      approved: data.approved || data.completed || 0,
      rejected: data.rejected || 0
    };
  }

  /**
   * Chuyển đổi dữ liệu dashboard từ API
   */
  public static mapApiToDashboardResponse(data: any): DashboardResponse | null {
    if (!data) return null;
    
    return {
      applications: this.mapApiToApplications(data.applications || []),
      stats: this.mapApiToApplicationStats(data.stats || {}) || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
    };
  }

  /**
   * Format ngày tháng trong đối tượng Application
   */
  public static formatApplicationDates(application: Application): Application | null {
    if (!application) return null;
    
    return {
      ...application,
      submissiondate: application.submissiondate 
        ? DateFormatter.format(application.submissiondate, DateFormat.LONG_DATE)
        : '',
      processingdate: application.processingdate
        ? DateFormatter.format(application.processingdate, DateFormat.LONG_DATE)
        : application.processingdate,
      completiondate: application.completiondate
        ? DateFormatter.format(application.completiondate, DateFormat.LONG_DATE)
        : application.completiondate
    };
  }

  /**
   * Format ngày tháng trong danh sách Application
   */
  public static formatApplicationsListDates(applications: Application[]): Application[] {
    if (!Array.isArray(applications)) return [];
    
    return applications.map(app => this.formatApplicationDates(app))
      .filter(Boolean) as Application[];
  }
  
  /**
   * Xử lý và bổ sung thông tin tệp đính kèm vào đơn từ
   */
  public static mapMediaFilesToApplication(
    applicationData: Application, 
    mediaFiles: MediaFile[]
  ): Application {
    // Chuẩn hóa thông tin mediaFiles
    const normalizedMediaFiles = mediaFiles.map((file: MediaFile) => ({
      ...file,
      mediafileid: file.mediafileid || file.id,
      mimetype: file.mimetype || 'application/octet-stream',
      originalfilename: file.originalfilename || file.filename || `File-${file.mediafileid || file.id}`
    }));
    
    // Thêm thông tin tệp đính kèm và cập nhật trạng thái hasmedia
    return {
      ...applicationData,
      attachments: normalizedMediaFiles,
      hasmedia: normalizedMediaFiles.length > 0
    };
  }
}

// Exports để tương thích với code cũ
export const mapApiToApplication = (data: any): Application | null => 
  ApplicationMapper.mapApiToApplication(data);

export const mapApiToApplications = (data: any[]): Application[] => 
  ApplicationMapper.mapApiToApplications(data);

export const mapApiToApplicationStats = (data: any): ApplicationStats | null => 
  ApplicationMapper.mapApiToApplicationStats(data);

export const mapApiToDashboardResponse = (data: any): DashboardResponse | null => 
  ApplicationMapper.mapApiToDashboardResponse(data);

export const mapMediaFilesToApplication = (applicationData: Application, mediaFiles: MediaFile[]): Application => 
  ApplicationMapper.mapMediaFilesToApplication(applicationData, mediaFiles); 