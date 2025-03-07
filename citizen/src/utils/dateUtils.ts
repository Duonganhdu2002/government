/**
 * Định dạng ngày tháng dạng YYYY-MM-DD hoặc ISO string thành DD/MM/YYYY
 * 
 * @param dateString Chuỗi ngày cần định dạng
 * @returns Chuỗi ngày đã định dạng
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Định dạng thành DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Định dạng ngày tháng dạng YYYY-MM-DD hoặc ISO string thành chuỗi ngày tháng đầy đủ
 * Ví dụ: 01/01/2023 14:30
 * 
 * @param dateString Chuỗi ngày cần định dạng
 * @returns Chuỗi ngày giờ đã định dạng
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Định dạng thành DD/MM/YYYY HH:MM
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
}; 