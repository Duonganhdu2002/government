import { ApplicationType, SpecialApplicationType } from '@/types/application';
import { getAuthHeaders } from '@/lib/api';

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

/**
 * Tạo đơn mới và upload files trong cùng một request
 */
export const submitApplicationWithFiles = async (
  applicationData: any, 
  images: File[], 
  video: File | null
) => {
  try {
    const formData = new FormData();
    
    // Thêm dữ liệu đơn
    Object.keys(applicationData).forEach(key => {
      if (applicationData[key] !== null && applicationData[key] !== undefined) {
        // Đảm bảo rằng các ID được gửi dưới dạng số nguyên
        if (key === 'applicationtypeid' || key === 'specialapplicationtypeid') {
          const numValue = Number(applicationData[key]);
          if (!isNaN(numValue)) {
            formData.append(key, numValue.toString());
          }
        } else {
          formData.append(key, applicationData[key].toString());
        }
      }
    });
    
    // Thêm các file ảnh
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('files', image);
      });
    }
    
    // Thêm file video nếu có
    if (video) {
      formData.append('files', video);
    }
    
    console.log('Submitting application with data:', {
      title: applicationData.title,
      applicationtypeid: applicationData.applicationtypeid,
      numFiles: images.length + (video ? 1 : 0)
    });
    
    // Lấy headers auth từ utility function
    const authHeaders = getAuthHeaders();
    console.log('Using auth headers:', Object.keys(authHeaders).length > 0 ? 'Available' : 'None');
    
    console.log(`Sending request to: ${API_BASE_URL}/api/application-upload`);
    
    // Thêm timeout dài hơn vì uploading có thể mất thời gian
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 giây timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/application-upload`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          // Don't set Content-Type for multipart/form-data - browser will set it with boundary
        },
        body: formData,
        credentials: 'include', // Include cookies if needed
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('Error reading response text:', textError);
        responseText = 'Could not read response';
      }
      
      // Check if response is OK
      if (!response.ok) {
        console.error('Error response:', responseText);
        
        // Try to parse as JSON if possible
        let errorDetails = 'Unknown error';
        try {
          const errorJson = JSON.parse(responseText);
          errorDetails = errorJson.details || errorJson.error || errorJson.message || 'Unknown error';
        } catch (parseError) {
          errorDetails = responseText || `${response.status} ${response.statusText}`;
        }
        
        throw new Error(`Failed to submit application: ${errorDetails}`);
      }
      
      // Try to parse success response
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing success response:', parseError);
        console.error('Raw response:', responseText);
        result = { message: 'Application submitted but response invalid' };
      }
      
      console.log('Application submission successful:', result);
      return result;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - the server took too long to respond');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in submitApplicationWithFiles:', error);
    throw error;
  }
};

/**
 * Kiểm tra kết nối đến endpoint upload
 */
export const testApplicationUploadConnection = async (): Promise<any> => {
  try {
    const authHeaders = getAuthHeaders();
    console.log('Testing connection to application upload endpoint');
    
    const response = await fetch(`${API_BASE_URL}/api/application-upload/test`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...authHeaders
      },
      credentials: 'include'
    });
    
    const data = await response.text();
    console.log('Response:', data);
    
    try {
      return JSON.parse(data);
    } catch (e) {
      return { message: 'Received non-JSON response', raw: data };
    }
  } catch (error) {
    console.error('Error testing application upload connection:', error);
    throw error;
  }
};

/**
 * Kiểm tra schema của database
 */
export const testDatabaseSchema = async (): Promise<any> => {
  try {
    console.log('Testing database schema...');
    
    const response = await fetch(`${API_BASE_URL}/api/application-upload/test-schema`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.text();
    console.log('Schema response:', data);
    
    try {
      return JSON.parse(data);
    } catch (e) {
      return { message: 'Received non-JSON response', raw: data };
    }
  } catch (error) {
    console.error('Error testing database schema:', error);
    throw error;
  }
}; 