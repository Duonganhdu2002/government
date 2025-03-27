/**
 * src/services/applicationService.ts
 *
 * Module định nghĩa các hàm gọi API cho các thao tác liên quan đến đơn từ
 */
import { apiClient } from '@/utils/api';
import { APPLICATION_ENDPOINTS } from '@/resources/apiEndpoints';
import { 
  ApplicationType, 
  SpecialApplicationType, 
  Application,
  DashboardResponse
} from '@/types';
import { 
  mapMediaFilesToApplication,
  mapApiToDashboardResponse
} from '@/utils/mappers/applicationMapper';
import { 
  createMediaUploadFormData,
  createApplicationFormData 
} from '@/utils/formDataBuilder';

/**
 * Lấy danh sách loại đơn
 */
export const fetchApplicationTypes = async (): Promise<ApplicationType[]> => {
  try {
    const data = await apiClient.get(APPLICATION_ENDPOINTS.APPLICATION_TYPES);
    
    if (!Array.isArray(data)) {
      throw new Error('API trả về dữ liệu không đúng định dạng');
    }
    
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách loại đơn:', error);
    throw error;
  }
};

/**
 * Lấy danh sách loại đơn đặc biệt theo loại đơn
 */
export const fetchSpecialApplicationTypes = async (applicationTypeId: number): Promise<SpecialApplicationType[]> => {
  try {
    const data = await apiClient.get(APPLICATION_ENDPOINTS.SPECIAL_TYPES(applicationTypeId));
    
    if (!Array.isArray(data)) {
      throw new Error('API trả về dữ liệu không đúng định dạng cho loại đơn đặc biệt');
    }
    
    return data;
  } catch (error) {
    // Xử lý trường hợp lỗi 404 (không có loại đơn đặc biệt)
    if (error.status === 404) {
      return [];
    }
    console.error(`Lỗi khi lấy danh sách loại đơn đặc biệt (ID: ${applicationTypeId}):`, error);
    throw error;
  }
};

/**
 * Tạo đơn mới
 */
export const createApplication = async (applicationData: any): Promise<Application> => {
  try {
    return await apiClient.post(APPLICATION_ENDPOINTS.CREATE, applicationData);
  } catch (error) {
    console.error('Lỗi khi tạo đơn mới:', error);
    throw error;
  }
};

/**
 * Upload files cho đơn
 */
export const uploadMediaFiles = async (applicationId: number, files: File[], fileType?: string): Promise<any> => {
  try {
    // Tạo FormData
    const formData = createMediaUploadFormData(applicationId, files, fileType);
    
    // Gọi API sử dụng apiClient.postFormData
    return await apiClient.postFormData(APPLICATION_ENDPOINTS.MEDIA_UPLOAD, formData);
  } catch (error) {
    console.error('Lỗi khi upload files cho đơn:', error);
    throw error;
  }
};

/**
 * Tạo đơn mới và upload files trong cùng một request
 */
export const submitApplicationWithFiles = async (
  applicationData: any, 
  images: File[], 
  video: File | null
): Promise<Application> => {
  try {
    // Tạo FormData
    const formData = createApplicationFormData(applicationData, images, video);
    
    // Gọi API sử dụng apiClient.postFormData
    return await apiClient.postFormData(APPLICATION_ENDPOINTS.CREATE, formData);
  } catch (error) {
    console.error('Lỗi khi tạo đơn và upload files:', error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn đã nộp của người dùng hiện tại
 */
export const fetchUserApplications = async (): Promise<Application[]> => {
  try {
    return await apiClient.get(APPLICATION_ENDPOINTS.USER_APPLICATIONS);
  } catch (error) {
    if (error.status === 404) {
      return [];
    }
    console.error('Lỗi khi lấy danh sách đơn của người dùng:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn theo ID
 */
export const fetchApplicationById = async (id: string): Promise<Application> => {
  try {
    // Lấy thông tin đơn
    const applicationData = await apiClient.get(APPLICATION_ENDPOINTS.BY_ID(id));
    
    try {
      // Lấy thông tin tệp đính kèm
      const mediaFiles = await apiClient.get(APPLICATION_ENDPOINTS.MEDIA_FILES(id));
      
      // Xử lý và bổ sung thông tin tệp đính kèm vào đơn
      return mapMediaFilesToApplication(applicationData, mediaFiles);
    } catch (mediaError) {
      // Lỗi khi lấy tệp đính kèm không nên làm hỏng toàn bộ luồng
      console.error(`Lỗi khi lấy files đính kèm cho đơn ID ${id}:`, mediaError);
      
      // Trả về đơn không có tệp đính kèm
      return {
        ...applicationData,
        attachments: [],
        hasmedia: false
      };
    }
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin đơn ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy dữ liệu cho dashboard
 */
export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  try {
    // Lấy danh sách đơn của người dùng
    const applications = await fetchUserApplications();
    
    // Xử lý dữ liệu để hiển thị trên dashboard
    const dashboardData = mapApiToDashboardResponse({
      applications,
      stats: null
    });
    
    // Nếu không có dữ liệu, trả về một đối tượng mặc định
    if (!dashboardData) {
      return {
        applications: [],
        stats: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        }
      };
    }
    
    return dashboardData;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    throw error;
  }
}; 