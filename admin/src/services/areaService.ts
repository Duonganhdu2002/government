import { Area } from "@/components/AreaModal";
import { getAuthHeaders } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch all areas from the backend API
export const fetchAreas = async (): Promise<Area[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/areas`, {
      headers: await getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map the API response to our Area interface
    return data.map((area: any) => ({
      id: area.areacode,
      areacode: area.areacode,
      name: area.areaname,
      level: getLevelName(area.level),
      parentId: area.parentareacode
    }));
  } catch (error: any) {
    console.error('Error fetching areas:', error);
    throw new Error(error.message || 'Không thể tải dữ liệu khu vực');
  }
};

// Fetch areas by level (province, district, commune)
export const fetchAreasByLevel = async (level: string): Promise<Area[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/areas/level/${level}`, {
      headers: await getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map the API response to our Area interface
    return data.map((area: any) => ({
      id: area.areacode,
      areacode: area.areacode,
      name: area.areaname,
      level: getLevelName(area.level),
      parentId: area.parentareacode
    }));
  } catch (error: any) {
    console.error(`Error fetching ${level} areas:`, error);
    throw new Error(error.message || `Không thể tải dữ liệu ${level}`);
  }
};

// Fetch child areas by parent ID
export const fetchChildAreas = async (parentId: number): Promise<Area[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/areas/children/${parentId}`, {
      headers: await getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map the API response to our Area interface
    return data.map((area: any) => ({
      id: area.areacode,
      areacode: area.areacode,
      name: area.areaname,
      level: getLevelName(area.level),
      parentId: area.parentareacode
    }));
  } catch (error: any) {
    console.error('Error fetching child areas:', error);
    throw new Error(error.message || 'Không thể tải dữ liệu khu vực con');
  }
};

// Create new area
export const createArea = async (areaData: Area): Promise<Area> => {
  try {
    // Convert the area level string to a numeric value
    const levelValue = getLevelValue(areaData.level);

    const response = await fetch(`${API_BASE_URL}/api/areas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders())
      },
      body: JSON.stringify({
        areacode: areaData.areacode,
        areaname: areaData.name,
        parentareacode: areaData.parentId,
        level: levelValue
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map the API response to our Area interface
    return {
      id: data.areacode,
      areacode: data.areacode,
      name: data.areaname,
      level: getLevelName(data.level),
      parentId: data.parentareacode
    };
  } catch (error: any) {
    console.error('Error creating area:', error);
    throw new Error(error.message || 'Không thể tạo khu vực mới');
  }
};

// Update existing area
export const updateArea = async (areaId: number, areaData: Area): Promise<Area> => {
  try {
    // Convert the area level string to a numeric value
    const levelValue = getLevelValue(areaData.level);

    const response = await fetch(`${API_BASE_URL}/api/areas/${areaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders())
      },
      body: JSON.stringify({
        areaname: areaData.name,
        parentareacode: areaData.parentId,
        level: levelValue
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map the API response to our Area interface
    return {
      id: data.areacode,
      areacode: data.areacode,
      name: data.areaname,
      level: getLevelName(data.level),
      parentId: data.parentareacode
    };
  } catch (error: any) {
    console.error('Error updating area:', error);
    throw new Error(error.message || 'Không thể cập nhật khu vực');
  }
};

// Delete area
export const deleteArea = async (areaId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/areas/${areaId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error deleting area:', error);
    throw new Error(error.message || 'Không thể xóa khu vực');
  }
};

// Helper function to convert numeric level to string level
const getLevelName = (level: number): 'province' | 'district' | 'commune' => {
  switch (level) {
    case 1: return 'province';
    case 2: return 'district';
    case 3: return 'commune';
    default: return 'province'; // Default fallback
  }
};

// Helper function to convert string level to numeric level
const getLevelValue = (level: string): number => {
  switch (level) {
    case 'province': return 1;
    case 'district': return 2;
    case 'commune': return 3;
    default: return 1; // Default fallback
  }
}; 