import { getAuthHeaders } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Citizen data interface
export interface CitizenUser {
  citizenid?: number;
  fullname: string;
  identificationnumber: string;
  address?: string;
  phonenumber?: string;
  email?: string;
  username: string;
  areacode: number;
  areaname?: string; // Populated when joined with area data
  password?: string; // Only used for creation
  [key: string]: any;
}

/**
 * Lấy danh sách tất cả người dân từ API
 */
export const fetchAllCitizens = async (): Promise<CitizenUser[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/citizens`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Error response from API:', response.status, response.statusText);
      throw new Error(`Failed to fetch citizens list: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Citizens response:', data); // Debug logging
    
    // Handle different response formats
    if (data && data.status === 'success' && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data.citizens)) {
      return data.data.citizens;
    } else if (data && typeof data === 'object') {
      // Try to extract arrays from any property
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    
    console.warn('No valid citizens data found in response');
    return [];
  } catch (error: any) {
    console.error('Error in fetchAllCitizens:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của người dân theo ID
 */
export const fetchCitizenById = async (id: number): Promise<CitizenUser | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/citizens/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch citizen: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object') {
      if (data.status === 'success' && data.data) {
        return data.data;
      }
      return data;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error in fetchCitizenById:', error);
    throw error;
  }
};

/**
 * Tạo người dân mới
 */
export const createCitizen = async (citizenData: CitizenUser): Promise<CitizenUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/citizens`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(citizenData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create citizen: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object') {
      if (data.status === 'success' && data.data) {
        return data.data;
      }
      return data;
    }
    
    throw new Error('Invalid response format from server');
  } catch (error: any) {
    console.error('Error in createCitizen:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin người dân
 */
export const updateCitizen = async (id: number, citizenData: Partial<CitizenUser>): Promise<CitizenUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/citizens/${id}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(citizenData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update citizen: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object') {
      if (data.status === 'success' && data.data) {
        return data.data;
      }
      return data;
    }
    
    throw new Error('Invalid response format from server');
  } catch (error: any) {
    console.error('Error in updateCitizen:', error);
    throw error;
  }
};

/**
 * Xóa người dân
 */
export const deleteCitizen = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/citizens/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete citizen: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('Error in deleteCitizen:', error);
    throw error;
  }
};

/**
 * Lấy danh sách người dân với thông tin chi tiết khu vực
 * Kết hợp dữ liệu từ API citizens và areas để có thông tin đầy đủ
 */
export const fetchCitizensWithAreaDetails = async (): Promise<CitizenUser[]> => {
  try {
    // Fetch citizens data directly
    const citizensData = await fetchAllCitizens();
    
    if (!Array.isArray(citizensData) || citizensData.length === 0) {
      return [];
    }
    
    // Fetch areas data directly
    const areasResponse = await fetch(`${API_BASE_URL}/api/areas`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!areasResponse.ok) {
      return citizensData; // Return citizens without area details
    }
    
    const areasData = await areasResponse.json();
    let areas: any[] = [];
    
    if (areasData && areasData.status === 'success' && Array.isArray(areasData.data)) {
      areas = areasData.data;
    } else if (Array.isArray(areasData)) {
      areas = areasData;
    } else {
      return citizensData; // Return citizens without area details
    }
    
    // Create a map of areas by ID for quick lookup
    const areaMap = new Map();
    areas.forEach(area => {
      const areaId = area.areacode || area.id;
      if (areaId) {
        areaMap.set(areaId, area);
      }
    });
    
    // Enrich citizens data with area details
    return citizensData.map(citizen => {
      const citizenAreaCode = citizen.areacode;
      if (!citizenAreaCode) {
        return { ...citizen, areaname: "Không xác định" };
      }
      
      const area = areaMap.get(citizenAreaCode);
      if (!area) {
        return { ...citizen, areaname: `Khu vực #${citizenAreaCode}` };
      }
      
      const areaName = area.areaname || area.name;
      return {
        ...citizen,
        areaname: areaName || `Khu vực #${citizenAreaCode}`
      };
    });
  } catch (error) {
    console.error('Error in fetchCitizensWithAreaDetails:', error);
    return [];
  }
}; 