import { ApplicationType, SpecialApplicationType } from '@/types/application';
import { getAuthHeaders } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Định nghĩa kiểu dữ liệu cho MediaFile
interface MediaFile {
  mediafileid?: number;
  id?: number;
  applicationid: number;
  mimetype?: string;
  filename?: string;
  originalfilename?: string;
  filesize?: number;
  filepath?: string;
  uploaddate?: string;
  [key: string]: any;
}

/**
 * Lấy danh sách loại đơn
 */
export const fetchApplicationTypes = async (): Promise<ApplicationType[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/application-types`, {
      signal: controller.signal,
      headers: getAuthHeaders()
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
      headers: getAuthHeaders(),
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
    
    // When submitting FormData, we should not include Content-Type header
    // as the browser will set it automatically with the correct boundary
    const authHeaders = getAuthHeaders();
    delete authHeaders['Content-Type']; // Remove Content-Type for FormData
    
    const response = await fetch(`${API_BASE_URL}/api/media-files`, {
      method: 'POST',
      headers: authHeaders,
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
      // For FormData, we need to remove Content-Type header
      const headers = getAuthHeaders();
      delete headers['Content-Type']; // Browser will set this with boundary for FormData
      
      const response = await fetch(`${API_BASE_URL}/api/application-upload`, {
        method: 'POST',
        headers,
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
    console.log('Testing connection to application upload endpoint');
    
    const response = await fetch(`${API_BASE_URL}/api/application-upload/test`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    const data = await response.text();
    console.log('Response:', data);
    
    try {
      return JSON.parse(data);
    } catch (e) {
      return { message: data };
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
      headers: getAuthHeaders()
    });
    
    const data = await response.text();
    console.log('Schema response:', data);
    
    try {
      return JSON.parse(data);
    } catch (e) {
      return { message: data };
    }
  } catch (error) {
    console.error('Error testing database schema:', error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn đã nộp của người dùng hiện tại
 */
export const fetchUserApplications = async (): Promise<any> => {
  try {
    const authHeaders = getAuthHeaders();
    
    console.log('Auth headers for fetchUserApplications:', authHeaders);
    
    // Debug: Kiểm tra token có tồn tại không
    if (!Object.keys(authHeaders).length) {
      console.error('No authentication token found in cookies');
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
    
    const response = await fetch(`${API_BASE_URL}/api/applications/current-user`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error fetching applications:', response.status, response.statusText);
      
      // Log server error response if any
      try {
        const errorData = await response.text();
        console.error('Server error response:', errorData);
      } catch (e) {
        console.error('Could not parse error response', e);
      }
      
      if (response.status === 404) {
        // Không có đơn nào, trả về mảng rỗng
        return [];
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Vui lòng đăng nhập lại để tiếp tục');
      }
      
      throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn theo ID
 */
export const fetchApplicationById = async (id: string): Promise<any> => {
  try {
    console.log(`Fetching application details for ID: ${id}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
    
    // Lấy thông tin đơn từ bảng Applications
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Không tìm thấy đơn');
      }
      
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error: ${response.status} ${response.statusText}`;
      }
      
      console.error(`Error fetching application with ID ${id}:`, errorMessage);
      throw new Error(errorMessage);
    }
    
    const applicationData = await response.json();
    console.log(`Successfully fetched application ${id}`);
    
    // Sau khi lấy thông tin đơn, lấy các tệp đính kèm từ bảng MediaFiles
    try {
      console.log(`Fetching media files for application ID: ${id}`);
      const mediaController = new AbortController();
      const mediaTimeoutId = setTimeout(() => mediaController.abort(), 15000);
      
      const mediaResponse = await fetch(`${API_BASE_URL}/api/media-files/by-application/${id}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        signal: mediaController.signal,
        mode: 'cors'
      });
      
      clearTimeout(mediaTimeoutId);
      
      if (mediaResponse.ok) {
        const mediaFiles = await mediaResponse.json();
        console.log(`Successfully fetched ${mediaFiles.length} media files for application ${id}`);
        
        // Thêm thông tin tệp đính kèm vào dữ liệu đơn
        applicationData.attachments = mediaFiles.map((file: MediaFile) => {
          // Xác định MIME type dựa trên filetype hoặc đuôi file
          let mimetype = file.mimetype;
          if (!mimetype) {
            const mimeTypeMap: Record<string, string> = {
              'image': 'image/jpeg',
              'pdf': 'application/pdf',
              'doc': 'application/msword',
              'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'xls': 'application/vnd.ms-excel',
              'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'txt': 'text/plain',
              'zip': 'application/zip',
              'rar': 'application/x-rar-compressed',
              'video': 'video/mp4'
            };
            
            if (file.filetype) {
              mimetype = mimeTypeMap[file.filetype.toLowerCase()] || 'application/octet-stream';
            } else if (file.filepath) {
              // Lấy extension từ filepath
              const extension = file.filepath.split('.').pop()?.toLowerCase();
              if (extension) {
                if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif') {
                  mimetype = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
                } else if (extension === 'mp4' || extension === 'webm' || extension === 'ogg') {
                  mimetype = `video/${extension}`;
                } else if (mimeTypeMap[extension]) {
                  mimetype = mimeTypeMap[extension];
                } else {
                  mimetype = 'application/octet-stream';
                }
              }
            }
          }
          
          return {
            ...file,
            // Đảm bảo các trường cần thiết tồn tại
            mediafileid: file.mediafileid || file.id,
            mimetype: mimetype || 'application/octet-stream',
            originalfilename: file.originalfilename || file.filename || `File-${file.mediafileid || file.id}`
          };
        });
        
        // Kiểm tra nếu có tệp đính kèm thì đánh dấu đơn có media
        applicationData.hasmedia = applicationData.attachments.length > 0;
        
        // Log thông tin về các tệp đính kèm để debug
        console.log('Attachment details:', applicationData.attachments.map((a: MediaFile) => ({
          id: a.mediafileid,
          type: a.mimetype,
          name: a.originalfilename
        })));
      } else if (mediaResponse.status !== 404) {
        // Nếu lỗi không phải 404 (không có tệp đính kèm), thì log lỗi
        console.warn(`Could not fetch media files: ${mediaResponse.status} ${mediaResponse.statusText}`);
      }
    } catch (mediaError) {
      // Lỗi khi lấy tệp đính kèm không nên làm hỏng toàn bộ luồng
      console.error('Error fetching media files:', mediaError);
      // Vẫn tiếp tục với thông tin đơn, không có tệp đính kèm
      applicationData.attachments = [];
      applicationData.hasmedia = false;
    }
    
    return applicationData;
  } catch (error) {
    console.error(`Error fetching application with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy dữ liệu cho dashboard
 */
export const fetchDashboardData = async (): Promise<{
  applications: any[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}> => {
  try {
    // Không sử dụng fetchUserApplications nữa vì gọi API citizen
    // Thay vào đó, sử dụng fetchPendingApplications dành cho staff
    const response = await fetchPendingApplications();
    const applications = response?.data || [];
    
    // Tính toán số liệu thống kê dựa trên pending applications
    const stats = {
      total: applications.length,
      pending: applications.length, // Tất cả đều là pending
      approved: 0,  // Staff dashboard chỉ hiển thị pending applications
      rejected: 0,  // Staff dashboard chỉ hiển thị pending applications
    };
    
    // Sắp xếp đơn hàng theo thời gian nộp mới nhất
    const sortedApplications = [...applications].sort((a: any, b: any) => {
      const dateA = new Date(a.submissiondate || 0).getTime();
      const dateB = new Date(b.submissiondate || 0).getTime();
      return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
    });
    
    // Chỉ trả về 5 đơn gần nhất
    const recentApplications = sortedApplications.slice(0, 5);
    
    return {
      applications: recentApplications,
      stats,
    };
  } catch (error) {
    console.error('Error in fetchDashboardData:', error);
    
    // Trả về dữ liệu trống khi có lỗi để tránh crash UI
    return {
      applications: [],
      stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      }
    };
  }
};

/**
 * Lấy danh sách đơn ứng dụng cần duyệt tại cơ quan của nhân viên
 */
export const fetchPendingApplications = async (): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
  
  try {
    console.log('Calling pending-approval endpoint with URL:', `${API_BASE_URL}/api/applications/pending-approval`);
    
    const headers = getAuthHeaders();
    console.log('Auth headers:', headers);
    
    // Make the actual call
    const response = await fetch(`${API_BASE_URL}/api/applications/pending-approval`, {
      signal: controller.signal,
      headers: headers,
      credentials: 'include' // Include cookies with request
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status, response.statusText);
    
    // Log the full response for debugging
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Convert back to JSON if it was successful
    if (response.ok) {
      try {
        const jsonResponse = JSON.parse(responseText);
        
        // Check if the response has the expected structure
        if (jsonResponse && jsonResponse.status === 'success' && Array.isArray(jsonResponse.data)) {
          return jsonResponse;
        } else if (jsonResponse && Array.isArray(jsonResponse)) {
          // Handle old response format (direct array)
          return { status: 'success', data: jsonResponse };
        } else if (jsonResponse && jsonResponse.data) {
          // Ensure we return in the expected format
          return jsonResponse;
        } else {
          console.error('Unexpected response format:', jsonResponse);
          throw new Error('Unexpected response format from server');
        }
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        throw new Error('Invalid response format from server');
      }
    }
    
    // Get more information about the error
    let errorMessage = '';
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.message || 'Unknown error';
      console.log('Error details from server:', errorData);
    } catch (e) {
      errorMessage = responseText || `Error: ${response.status} ${response.statusText}`;
    }
    
    // Check for specific error types and provide more helpful messages
    if (response.status === 403) {
      throw new Error(`Không có quyền truy cập: ${errorMessage}. Vui lòng đăng nhập bằng tài khoản nhân viên có quyền xử lý đơn.`);
    } else if (response.status === 401) {
      throw new Error(`Phiên đăng nhập đã hết hạn: ${errorMessage}. Vui lòng đăng nhập lại.`);
    } else if (response.status === 404) {
      throw new Error(`Không tìm thấy dữ liệu: ${errorMessage}.`);
    } else {
      throw new Error(`Lỗi khi tải dữ liệu: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error in fetchPendingApplications:', error);
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của đơn ứng dụng cho nhân viên
 */
export const fetchApplicationDetailForStaff = async (id: string): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
  
  try {
    console.log(`Fetching application details for ID: ${id} using standard endpoint`);
    
    // Use the standard application detail endpoint instead of staff-view
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include' // Include cookies with request
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error response from API:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE_URL}/api/applications/${id}`
      });
      
      throw new Error(`Failed to fetch application detail: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('Successfully fetched application detail:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchApplicationDetailForStaff:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái đơn ứng dụng (sử dụng PATCH cho cập nhật một phần)
 */
export const updateApplicationStatus = async (id: string, status: string, comments?: string, nextAgencyId?: number): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 giây timeout
  
  // Maximum retries
  const maxRetries = 2;
  let retryCount = 0;
  let lastError;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`Updating application status [Attempt ${retryCount + 1}/${maxRetries + 1}]:`, {
        id,
        status,
        commentsLength: comments ? comments.length : 0,
        hasNextAgency: !!nextAgencyId
      });
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const url = `${API_URL}/api/applications/update-status/${id}`;
      console.log(`Making PATCH request to: ${url}`);
      
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      };
      
      const body = JSON.stringify({
        status,
        comments: comments || '',
        nextAgencyId: nextAgencyId || null
      });
      
      console.log('Request headers:', Object.keys(headers));
      console.log('Request body:', body);
      
      const response = await fetch(url, {
        method: 'PATCH', // Using PATCH for partial update
        signal: controller.signal,
        headers,
        body
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Status: ${response.status} ${response.statusText}`;
        
        try {
          // Try to parse error response as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // Use text response if not JSON
          errorMessage = errorText || errorMessage;
        }
        
        console.error('Error response details:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          url
        });
        throw new Error(`Failed to update application status: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Successfully updated application status:', data);
      return data;
    } catch (error: any) {
      lastError = error;
      
      console.error(`Error in updateApplicationStatus [Attempt ${retryCount + 1}/${maxRetries + 1}]:`, error);
      
      // Don't retry if it's a client-side error (e.g., network issue)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond');
      }
      
      // Only retry on server errors (5xx)
      if (retryCount < maxRetries && error.message && error.message.includes('500')) {
        retryCount++;
        // Exponential backoff delay
        const delay = 1000 * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  
  // If we've exhausted all retries
  throw lastError || new Error('Failed to update application status after multiple attempts');
};

/**
 * Tìm kiếm và lọc đơn ứng dụng
 */
export const searchApplications = async (searchParams: any): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
  
  try {
    // Xây dựng query string từ searchParams
    const queryString = Object.entries(searchParams)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
      .join('&');
    
    const response = await fetch(`${API_BASE_URL}/api/applications/search?${queryString}`, {
      signal: controller.signal,
      headers: getAuthHeaders()
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error response from API:', response.status, response.statusText);
      throw new Error(`Failed to search applications: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('Successfully searched applications:', data);
    return data;
  } catch (error) {
    console.error('Error in searchApplications:', error);
    throw error;
  }
}; 