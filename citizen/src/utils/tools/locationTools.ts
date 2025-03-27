/**
 * src/utils/locationTools.ts
 * 
 * Công cụ xử lý dữ liệu địa chính và tương tác với API
 */

import { 
  Province, 
  District, 
  Ward,
  LocationData 
} from '@/types/location';
import {
  fetchProvinces,
  fetchDistrictsByProvince,
  fetchWardsByDistrict
} from '@/services/locationService';
import { locationStrings } from '@/resources';

/**
 * Lớp xử lý dữ liệu địa chính
 */
export class LocationDataHandler {
  /**
   * Xây dựng địa chỉ đầy đủ từ các thành phần
   */
  public static buildFullAddress(
    province?: Province | null,
    district?: District | null,
    ward?: Ward | null
  ): string {
    const parts = [
      ward?.name_with_type,
      district?.name_with_type,
      province?.name_with_type
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  /**
   * Tạo đối tượng LocationData từ các giá trị thành phần
   */
  public static createLocationData(
    provinceCode: string,
    districtCode: string,
    wardCode: string,
    province?: Province | null,
    district?: District | null,
    ward?: Ward | null
  ): LocationData {
    return {
      provinceCode,
      districtCode,
      wardCode,
      fullAddress: this.buildFullAddress(province, district, ward)
    };
  }
}

/**
 * Lớp xử lý tương tác với API địa chính
 */
export class LocationFetcher {
  /**
   * Lấy danh sách tỉnh/thành phố với xử lý lỗi
   */
  public static async fetchProvinces(
    setLoading: (loading: boolean) => void,
    setError: (error: string) => void,
    setData: (data: Province[]) => void
  ): Promise<void> {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProvinces();
      
      if (data && data.length > 0) {
        setData(data);
      } else {
        setError(locationStrings.errors.noProvinceData);
      }
    } catch (error) {
      console.error(locationStrings.logs.provinceError, error);
      setError(locationStrings.errors.provinceLoadFailed);
    } finally {
      setLoading(false);
    }
  }
  
  /**
   * Lấy danh sách quận/huyện theo mã tỉnh với xử lý lỗi
   */
  public static async fetchDistricts(
    provinceCode: string,
    setLoading: (loading: boolean) => void,
    setError: (error: string) => void,
    setData: (data: District[]) => void
  ): Promise<void> {
    try {
      setLoading(true);
      setError('');
      const data = await fetchDistrictsByProvince(provinceCode);
      
      if (data && data.length > 0) {
        setData(data);
      } else {
        setError(locationStrings.errors.noDistrictData);
      }
    } catch (error) {
      console.error(locationStrings.logs.districtError, error);
      setError(locationStrings.errors.districtLoadFailed);
    } finally {
      setLoading(false);
    }
  }
  
  /**
   * Lấy danh sách phường/xã theo mã huyện với xử lý lỗi
   */
  public static async fetchWards(
    districtCode: string,
    setLoading: (loading: boolean) => void,
    setError: (error: string) => void,
    setData: (data: Ward[]) => void
  ): Promise<void> {
    try {
      setLoading(true);
      setError('');
      const data = await fetchWardsByDistrict(districtCode);
      
      if (data && data.length > 0) {
        setData(data);
      } else {
        setError(locationStrings.errors.noWardData);
      }
    } catch (error) {
      console.error(locationStrings.logs.wardError, error);
      setError(locationStrings.errors.wardLoadFailed);
    } finally {
      setLoading(false);
    }
  }
} 