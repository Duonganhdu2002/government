/**
 * src/services/locationService.ts
 *
 * Module định nghĩa các hàm gọi API để lấy dữ liệu địa chính (tỉnh/thành, quận/huyện, phường/xã)
 */
import { apiClient } from '@/utils/api';
import { LOCATION_ENDPOINTS } from '@/resources/apiEndpoints';
import { Province, District, Ward } from '@/types/location';
import { 
  mapProvincesFromApi, 
  mapDistrictsFromApi, 
  mapWardsFromApi 
} from '@/utils/mappers/locationMapper';

/**
 * Lấy danh sách tất cả các tỉnh/thành
 */
export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    const data = await apiClient.get(LOCATION_ENDPOINTS.PROVINCES);
    return mapProvincesFromApi(data);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

/**
 * Lấy danh sách quận/huyện theo mã tỉnh/thành
 */
export const fetchDistrictsByProvince = async (provinceCode: string): Promise<District[]> => {
  try {
    const data = await apiClient.get(LOCATION_ENDPOINTS.DISTRICTS(provinceCode));
    return mapDistrictsFromApi(data, provinceCode);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

/**
 * Lấy danh sách phường/xã theo mã quận/huyện
 */
export const fetchWardsByDistrict = async (districtCode: string): Promise<Ward[]> => {
  try {
    const data = await apiClient.get(LOCATION_ENDPOINTS.WARDS(districtCode));
    return mapWardsFromApi(data, districtCode);
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
}; 