/**
 * src/types/location.ts
 * 
 * Định nghĩa kiểu dữ liệu cho dữ liệu địa chính (tỉnh/thành, quận/huyện, phường/xã)
 */

/**
 * Namespace chứa các kiểu dữ liệu địa chính
 */
export namespace LocationModels {
  /**
   * Loại đơn vị hành chính
   */
  export enum AdministrativeUnitType {
    PROVINCE = 'province',            // Tỉnh
    CITY = 'thanh-pho-trung-uong',    // Thành phố trung ương
    URBAN_DISTRICT = 'quan',          // Quận
    RURAL_DISTRICT = 'huyen',         // Huyện
    TOWN = 'thi-xa',                  // Thị xã
    PROVINCIAL_CITY = 'thanh-pho',    // Thành phố thuộc tỉnh
    WARD = 'phuong',                  // Phường
    COMMUNE = 'xa',                   // Xã
    TOWNSHIP = 'thi-tran'             // Thị trấn
  }
  
  /**
   * Cấu trúc cơ sở cho đơn vị hành chính
   */
  export interface AdministrativeUnit {
    readonly code: string;
    readonly name: string;
    readonly name_with_type: string;
    readonly type: string;
  }

  /**
   * Kiểu dữ liệu cho tỉnh/thành phố
   */
  export interface Province extends AdministrativeUnit {
    // Tỉnh/thành không cần thêm thuộc tính
  }

  /**
   * Kiểu dữ liệu cho quận/huyện
   */
  export interface District extends AdministrativeUnit {
    readonly path: string;
    readonly path_with_type: string;
    readonly parent_code: string;
  }

  /**
   * Kiểu dữ liệu cho phường/xã
   */
  export interface Ward extends AdministrativeUnit {
    readonly path: string;
    readonly path_with_type: string;
    readonly parent_code: string;
  }

  /**
   * Kiểu dữ liệu cho địa chỉ đầy đủ
   */
  export interface Address {
    readonly provinceCode: string;
    readonly provinceName: string;
    readonly districtCode: string;
    readonly districtName: string;
    readonly wardCode: string;
    readonly wardName: string;
    readonly streetAddress: string;
  }
  
  /**
   * Kiểu dữ liệu cho dữ liệu vị trí địa lý
   */
  export interface GeoLocation {
    readonly latitude: number;
    readonly longitude: number;
    readonly address?: Address;
  }
}

/**
 * Lớp tiện ích xử lý địa chỉ
 */
export class AddressFormatter {
  /**
   * Format địa chỉ đầy đủ từ các thành phần
   */
  public static formatFullAddress(
    streetAddress: string = '',
    wardName: string = '',
    districtName: string = '',
    provinceName: string = ''
  ): string {
    const parts: string[] = [
      streetAddress,
      wardName,
      districtName,
      provinceName
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  /**
   * Format địa chỉ đầy đủ từ đối tượng Address
   */
  public static formatFromAddress(address: LocationModels.Address): string {
    return this.formatFullAddress(
      address.streetAddress,
      address.wardName,
      address.districtName,
      address.provinceName
    );
  }
}

// Exports tương thích với code cũ
export type Province = LocationModels.Province;
export type District = LocationModels.District;
export type Ward = LocationModels.Ward;
export type AddressData = LocationModels.Address; 