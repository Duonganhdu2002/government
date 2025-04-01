/**
 * Service for fetching location data (provinces, districts, wards) in Vietnam
 */
import { getAuthHeaders } from '@/utils/auth';
import { Province, District, Ward } from '@/types';

// Using a more reliable API endpoint
const BASE_URL = 'https://vietnam-administrative-division-json-server-swart.vercel.app';

/**
 * Fetch all provinces from Vietnam
 */
export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${BASE_URL}/province`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    
    const data = await response.json();
    // Transform data to match our interface
    return data.map((item: any) => ({
      code: item.idProvince || item.code,
      name: item.name,
      name_with_type: item.name,
      slug: item.name?.toLowerCase().replace(/\s+/g, '-') || '',
      type: item.type || 'province'
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

/**
 * Fetch districts by province code
 */
export const fetchDistrictsByProvince = async (provinceCode: string): Promise<District[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${BASE_URL}/district/?idProvince=${provinceCode}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch districts');
    }
    
    const data = await response.json();
    // Transform data to match our interface
    return data.map((item: any) => ({
      code: item.idDistrict || item.code,
      name: item.name,
      name_with_type: item.name,
      parent_code: item.idProvince || provinceCode,
      slug: item.name?.toLowerCase().replace(/\s+/g, '-') || '',
      type: item.type || 'district'
    }));
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

/**
 * Fetch wards by district code
 */
export const fetchWardsByDistrict = async (districtCode: string): Promise<Ward[]> => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${BASE_URL}/commune/?idDistrict=${districtCode}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch wards');
    }
    
    const data = await response.json();
    // Transform data to match our interface
    return data.map((item: any) => ({
      code: item.idCommune || item.code,
      name: item.name,
      name_with_type: item.name,
      parent_code: item.idDistrict || districtCode,
      slug: item.name?.toLowerCase().replace(/\s+/g, '-') || '',
      type: item.type || 'ward'
    }));
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
}; 