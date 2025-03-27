/**
 * src/utils/dateUtils.ts
 * 
 * Lớp tiện ích xử lý ngày tháng
 */

/**
 * Các format ngày tháng được hỗ trợ
 */
export enum DateFormat {
  SHORT_DATE = 'DD/MM/YYYY',
  LONG_DATE = 'DD/MM/YYYY HH:mm',
  ISO = 'YYYY-MM-DD',
  ISO_WITH_TIME = 'YYYY-MM-DD HH:mm:ss'
}

/**
 * Lớp xử lý ngày tháng
 */
export class DateFormatter {
  /**
   * Kiểm tra xem chuỗi ngày có hợp lệ không
   */
  public static isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  
  /**
   * Chuyển chuỗi ngày thành đối tượng Date
   */
  public static parseDate(dateString: string): Date | null {
    if (!this.isValidDate(dateString)) return null;
    return new Date(dateString);
  }
  
  /**
   * Định dạng ngày tháng theo format cụ thể
   */
  public static format(dateString: string, format: DateFormat = DateFormat.SHORT_DATE): string {
    if (!dateString) return '';
    
    try {
      const date = this.parseDate(dateString);
      if (!date) return dateString;
      
      switch (format) {
        case DateFormat.SHORT_DATE:
          return this.formatAsShortDate(date);
        
        case DateFormat.LONG_DATE:
          return this.formatAsLongDate(date);
          
        case DateFormat.ISO:
          return this.formatAsIso(date);
          
        case DateFormat.ISO_WITH_TIME:
          return this.formatAsIsoWithTime(date);
          
        default:
          return this.formatAsShortDate(date);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }
  
  /**
   * Định dạng ngày tháng dạng DD/MM/YYYY
   */
  private static formatAsShortDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
  
  /**
   * Định dạng ngày tháng dạng DD/MM/YYYY HH:MM
   */
  private static formatAsLongDate(date: Date): string {
    const shortDate = this.formatAsShortDate(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${shortDate} ${hours}:${minutes}`;
  }
  
  /**
   * Định dạng ngày tháng dạng YYYY-MM-DD
   */
  private static formatAsIso(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Định dạng ngày tháng dạng YYYY-MM-DD HH:MM:SS
   */
  private static formatAsIsoWithTime(date: Date): string {
    const isoDate = this.formatAsIso(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${isoDate} ${hours}:${minutes}:${seconds}`;
  }
}

// Exports để tương thích với code cũ
export const formatDate = (dateString: string): string => 
  DateFormatter.format(dateString, DateFormat.SHORT_DATE);

export const formatDateTime = (dateString: string): string => 
  DateFormatter.format(dateString, DateFormat.LONG_DATE); 