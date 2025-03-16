import { getAuthHeaders } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Lấy danh sách tất cả các cơ quan từ API
 * @returns Promise<Array<{ agencyid: number, name: string, ... }>>
 */
export const fetchAllAgencies = async (): Promise<any[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
    
    const response = await fetch(`${API_BASE_URL}/api/agencies`, {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error fetching agencies:', response.status, response.statusText);
      throw new Error(`Failed to fetch agencies: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Agency response:', data); // Debug
    
    // Backend returns agencies directly as an array
    if (Array.isArray(data)) {
      return data;
    } 
    
    // For backward compatibility - if the API returns data in a nested property
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) {
        return data.data;
      }
      
      // Try to extract arrays from any property
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    
    // If no array found, log and return empty array
    console.warn('No valid agency data found in response, returning empty array');
    return [];
  } catch (error) {
    console.error('Error in fetchAllAgencies:', error);
    return []; // Return empty array on error
  }
};

/**
 * Lấy thông tin chi tiết của một cơ quan
 * @param id ID của cơ quan
 * @returns Promise<{ agencyid: number, name: string, ... }>
 */
export const fetchAgencyById = async (id: number): Promise<any> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/api/agencies/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error fetching agency details:', response.status, response.statusText);
      throw new Error(`Failed to fetch agency details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Agency by ID response:', data); // Debug
    
    // Backend returns agency directly as an object
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('data' in data) {
        return data.data; // Nested data format
      }
      
      // Check if it has common agency properties
      if ('agencyid' in data || 'agencyname' in data) {
        return data;
      }
    }
    
    console.warn('Invalid agency data format received');
    return null;
  } catch (error) {
    console.error('Error in fetchAgencyById:', error);
    return null;
  }
};

/**
 * Lấy danh sách đơn theo cơ quan
 * @param agencyId ID của cơ quan
 * @returns Promise<Array<{ applicationid: number, title: string, ... }>>
 */
export const fetchApplicationsByAgency = async (agencyId: number): Promise<any[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${API_BASE_URL}/api/applications/by-agency/${agencyId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Không có đơn nào cho cơ quan này
        return [];
      }
      
      console.error('Error fetching applications by agency:', response.status, response.statusText);
      throw new Error(`Failed to fetch applications by agency: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Applications by agency response:', data); // Debug
    
    // Handle array response directly
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle nested data structure
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) {
        return data.data;
      }
      
      // Try to find arrays in response
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    
    console.warn('Unexpected data format for applications by agency');
    return [];
  } catch (error) {
    console.error('Error in fetchApplicationsByAgency:', error);
    return [];
  }
};

/**
 * Lấy thống kê số lượng đơn theo từng cơ quan
 * @returns Promise<Array<{ agencyid: number, name: string, count: number }>>
 */
export const fetchApplicationsCountByAgency = async (): Promise<any[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/api/stats/applications-by-agency`, {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error fetching application counts by agency:', response.status, response.statusText);
      throw new Error(`Failed to fetch application counts: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Application counts by agency:', data); // Debug
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) {
        return data.data;
      }
      
      // Try to find arrays in response
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    
    console.warn('Invalid statistics data format received');
    return [];
  } catch (error) {
    console.error('Error in fetchApplicationsCountByAgency:', error);
    throw error;
  }
}; 