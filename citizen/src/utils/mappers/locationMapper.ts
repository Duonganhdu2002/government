/**
 * src/utils/mappers/locationMapper.ts
 * 
 * Lớp chuyển đổi dữ liệu vị trí địa lý từ API sang interfaces
 */

import { Province, District, Ward } from '@/types';

/**
 * Lớp chuyển đổi dữ liệu địa lý
 */
export class LocationMapper {
    /**
     * Chuyển đổi dữ liệu tỉnh/thành từ API sang interface Province
     */
    public static mapProvinceFromApi(data: any): Province | null {
        if (!data) return null;

        return {
            code: data.idProvince || data.code || '',
            name: data.name || '',
            name_with_type: data.name_with_type || data.nameWithType || data.name || '',
            type: data.type || 'province'
        };
    }

    /**
     * Chuyển đổi dữ liệu quận/huyện từ API sang interface District
     */
    public static mapDistrictFromApi(data: any, provinceCode: string): District | null {
        if (!data) return null;

        return {
            code: data.idDistrict || data.code || '',
            name: data.name || '',
            name_with_type: data.name_with_type || data.nameWithType || data.name || '',
            path: data.path || '',
            path_with_type: data.path_with_type || data.pathWithType || '',
            parent_code: data.parent_code || data.parentCode || data.idProvince || provinceCode,
            type: data.type || 'district'
        };
    }

    /**
     * Chuyển đổi dữ liệu phường/xã từ API sang interface Ward
     */
    public static mapWardFromApi(data: any, districtCode: string): Ward | null {
        if (!data) return null;

        return {
            code: data.idCommune || data.code || '',
            name: data.name || '',
            name_with_type: data.name_with_type || data.nameWithType || data.name || '',
            path: data.path || '',
            path_with_type: data.path_with_type || data.pathWithType || '',
            parent_code: data.parent_code || data.parentCode || data.idDistrict || districtCode,
            type: data.type || 'ward'
        };
    }

    /**
     * Chuyển đổi mảng dữ liệu tỉnh/thành từ API
     */
    public static mapProvincesFromApi(data: any[]): Province[] {
        if (!Array.isArray(data)) return [];

        return data.map(item => this.mapProvinceFromApi(item))
            .filter(Boolean) as Province[];
    }

    /**
     * Chuyển đổi mảng dữ liệu quận/huyện từ API
     */
    public static mapDistrictsFromApi(data: any[], provinceCode: string): District[] {
        if (!Array.isArray(data)) return [];

        return data.map(item => this.mapDistrictFromApi(item, provinceCode))
            .filter(Boolean) as District[];
    }

    /**
     * Chuyển đổi mảng dữ liệu phường/xã từ API
     */
    public static mapWardsFromApi(data: any[], districtCode: string): Ward[] {
        if (!Array.isArray(data)) return [];

        return data.map(item => this.mapWardFromApi(item, districtCode))
            .filter(Boolean) as Ward[];
    }

    /**
     * Tìm tên tỉnh/thành từ danh sách theo mã
     */
    public static findProvinceName(provinces: Province[], code: string): string {
        if (!code || !Array.isArray(provinces)) return '';

        const province = provinces.find(p => p.code === code);
        return province ? province.name_with_type : '';
    }

    /**
     * Tìm tên quận/huyện từ danh sách theo mã
     */
    public static findDistrictName(districts: District[], code: string): string {
        if (!code || !Array.isArray(districts)) return '';

        const district = districts.find(d => d.code === code);
        return district ? district.name_with_type : '';
    }

    /**
     * Tìm tên phường/xã từ danh sách theo mã
     */
    public static findWardName(wards: Ward[], code: string): string {
        if (!code || !Array.isArray(wards)) return '';

        const ward = wards.find(w => w.code === code);
        return ward ? ward.name_with_type : '';
    }

    /**
     * Tạo địa chỉ đầy đủ
     */
    public static buildFullAddress(
        streetAddress: string = '',
        wardCode: string = '',
        districtCode: string = '',
        provinceCode: string = '',
        wards: Ward[] = [],
        districts: District[] = [],
        provinces: Province[] = []
    ): string {
        const parts: string[] = [];

        if (streetAddress) parts.push(streetAddress);

        const wardName = this.findWardName(wards, wardCode);
        if (wardName) parts.push(wardName);

        const districtName = this.findDistrictName(districts, districtCode);
        if (districtName) parts.push(districtName);

        const provinceName = this.findProvinceName(provinces, provinceCode);
        if (provinceName) parts.push(provinceName);

        return parts.join(', ');
    }
}

// Exports để tương thích với code cũ
export const mapProvinceFromApi = (data: any): Province | null =>
    LocationMapper.mapProvinceFromApi(data);

export const mapDistrictFromApi = (data: any, provinceCode: string): District | null =>
    LocationMapper.mapDistrictFromApi(data, provinceCode);

export const mapWardFromApi = (data: any, districtCode: string): Ward | null =>
    LocationMapper.mapWardFromApi(data, districtCode);

export const mapProvincesFromApi = (data: any[]): Province[] =>
    LocationMapper.mapProvincesFromApi(data);

export const mapDistrictsFromApi = (data: any[], provinceCode: string): District[] =>
    LocationMapper.mapDistrictsFromApi(data, provinceCode);

export const mapWardsFromApi = (data: any[], districtCode: string): Ward[] =>
    LocationMapper.mapWardsFromApi(data, districtCode); 