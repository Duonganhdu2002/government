import { ApplicationType, SpecialApplicationType } from '@/types/application';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Lấy danh sách loại đơn
 */
export const fetchApplicationTypes = async (): Promise<ApplicationType[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/application-types`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error response from API:', response.status, response.statusText);
      throw new Error(`Failed to fetch application types: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Unexpected API response format:', data);
      throw new Error('API returned unexpected data format');
    }
    
    console.log('Successfully fetched application types:', data.length);
    return data;
  } catch (error) {
    console.error('Error in fetchApplicationTypes:', error);
    throw error;
  }
};

/**
 * Lấy danh sách loại đơn đặc biệt theo loại đơn
 */
export const fetchSpecialApplicationTypes = async (applicationTypeId: number): Promise<SpecialApplicationType[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/special-application-types/by-application-type/${applicationTypeId}`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Không có loại đơn đặc biệt, trả về mảng rỗng
        console.log(`No special application types found for applicationTypeId: ${applicationTypeId}`);
        return [];
      }
      
      console.error('Error response from API:', response.status, response.statusText);
      throw new Error(`Failed to fetch special application types: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Unexpected API response format for special types:', data);
      throw new Error('API returned unexpected data format for special types');
    }
    
    console.log(`Successfully fetched ${data.length} special application types for applicationTypeId: ${applicationTypeId}`);
    return data;
  } catch (error) {
    console.error('Error in fetchSpecialApplicationTypes:', error);
    throw error;
  }
};

/**
 * Tạo đơn mới
 */
export const createApplication = async (applicationData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(applicationData)
    });

    if (!response.ok) {
      throw new Error('Failed to create application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createApplication:', error);
    throw error;
  }
};

/**
 * Upload files cho đơn
 */
export const uploadMediaFiles = async (applicationId: number, files: File[], fileType?: string) => {
  try {
    const formData = new FormData();
    formData.append('applicationid', applicationId.toString());
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (fileType) {
      formData.append('filetype', fileType);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/media-files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload media files: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in uploadMediaFiles:', error);
    throw error;
  }
}; 