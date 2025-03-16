import { getAuthHeaders } from '@/lib/api';
import { fetchAllAgencies } from '@/services/agencyService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Staff data interface
export interface StaffMember {
  staffid?: number;
  agencyid: number;
  fullname: string;
  role: string;
  status?: string;
  agencyname?: string; // Populated when joined with agency data
  password?: string; // Only used for creation
  passwordhash?: string; // Used for API requests
  [key: string]: any;
}

/**
 * Lấy danh sách tất cả nhân viên từ API
 */
export const fetchAllStaff = async (): Promise<StaffMember[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/staff`, {
      signal: controller.signal,
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Error response from API:', response.status, response.statusText);
      throw new Error(`Failed to fetch staff list: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Staff response:', data); // Debug logging
    
    // Handle different response formats
    if (data && data.status === 'success' && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      // Try to extract arrays from any property
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    
    console.warn('No valid staff data found in response');
    return [];
  } catch (error) {
    console.error('Error in fetchAllStaff:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của nhân viên theo ID
 */
export const fetchStaffById = async (id: number): Promise<StaffMember | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
      signal: controller.signal,
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch staff: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object') {
      if (data.status === 'success' && data.data) {
        return data.data;
      }
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchStaffById:', error);
    throw error;
  }
};

/**
 * Tạo nhân viên mới
 */
export const createStaff = async (staffData: StaffMember): Promise<StaffMember> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    // Prepare data for the API (camelCase to PascalCase for DB columns)
    const apiData = {
      agencyid: staffData.agencyid,
      fullname: staffData.fullname,
      role: staffData.role || 'staff',
      ...(staffData.password && { passwordhash: staffData.password })
    };

    console.log('Creating staff with data:', JSON.stringify({
      ...apiData,
      passwordhash: '[REDACTED]'
    }));
    
    const response = await fetch(`${API_BASE_URL}/api/staff`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData),
      signal: controller.signal,
      credentials: 'include'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create staff: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object') {
      if (data.status === 'success' && data.data) {
        return data.data;
      }
      return data;
    }
    
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error in createStaff:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin nhân viên
 */
export const updateStaff = async (id: number, staffData: Partial<StaffMember>): Promise<StaffMember> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    // Check if this is a password update
    const isPasswordUpdate = !!staffData.password || !!staffData.passwordhash;
    
    // Prepare data for the API ensuring it has all required fields
    const apiData = {
      agencyid: staffData.agencyid,
      fullname: staffData.fullname,
      role: staffData.role || 'staff',
      // Only include password fields if they are provided
      ...(staffData.passwordhash && { passwordhash: staffData.passwordhash })
    };
    
    console.log('Updating staff with data:', JSON.stringify({
      ...apiData,
      passwordhash: isPasswordUpdate ? '[REDACTED]' : undefined
    })); // Debug: log request payload with redacted password
    
    const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData),
      signal: controller.signal,
      credentials: 'include'
    });
    
    clearTimeout(timeoutId);
    
    // Get response as text first to properly log errors
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Error response from server:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      // Try to parse as JSON if possible
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        // If not JSON, use the text as is
        errorData = { error: responseText };
      }
      
      throw new Error(`Failed to update staff: ${response.status} ${response.statusText} - ${errorData.error || responseText}`);
    }
    
    // Parse the response if it's not already parsed
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing response as JSON:', e);
      throw new Error('Invalid response format from server');
    }
    
    console.log('Staff update successful:', data); // Debug: log response
    
    if (data && typeof data === 'object') {
      if (data.status === 'success' && data.data) {
        return data.data;
      }
      return data;
    }
    
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error in updateStaff:', error);
    throw error;
  }
};

/**
 * Xóa nhân viên
 */
export const deleteStaff = async (id: number): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      signal: controller.signal,
      credentials: 'include'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to delete staff: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteStaff:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử đăng nhập của nhân viên
 */
export const fetchStaffLoginHistory = async (id: number): Promise<any[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/staff/admin/login-history/${id}`, {
      signal: controller.signal,
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch login history: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.status === 'success' && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchStaffLoginHistory:', error);
    return [];
  }
};

/**
 * Lấy danh sách nhân viên với thông tin chi tiết cơ quan
 * Kết hợp dữ liệu từ API staff và agencies để có thông tin đầy đủ
 */
export const fetchStaffWithAgencyDetails = async (): Promise<StaffMember[]> => {
  try {
    // Fetch staff and agencies in parallel
    const [staffData, agencyData] = await Promise.all([
      fetchAllStaff(),
      fetchAllAgencies() // Import fetchAllAgencies from agencyService
    ]);
    
    if (!Array.isArray(staffData) || staffData.length === 0) {
      console.warn('No staff data found');
      return [];
    }
    
    // Create a map of agencies by ID for quick lookup
    const agencyMap = new Map();
    if (Array.isArray(agencyData)) {
      agencyData.forEach(agency => {
        // The ID might be in different properties
        const agencyId = agency.agencyid || agency.id;
        if (agencyId) {
          agencyMap.set(agencyId, agency);
        }
      });
    }
    
    console.log(`Created agency map with ${agencyMap.size} agencies`);
    
    // Enrich staff data with agency details
    const enrichedStaffData = staffData.map(staff => {
      const staffAgencyId = staff.agencyid || staff.agency_id;
      if (!staffAgencyId) {
        return { ...staff, agencyname: "Không xác định" };
      }
      
      const agency = agencyMap.get(staffAgencyId);
      if (!agency) {
        return { ...staff, agencyname: `Cơ quan #${staffAgencyId}` };
      }
      
      // Get agency name from the correct property
      const agencyName = agency.agencyname || agency.name;
      
      return {
        ...staff,
        agencyname: agencyName || `Cơ quan #${staffAgencyId}`
      };
    });
    
    console.log('Staff data enriched with agency details:', enrichedStaffData);
    return enrichedStaffData;
  } catch (error) {
    console.error('Error in fetchStaffWithAgencyDetails:', error);
    return [];
  }
}; 