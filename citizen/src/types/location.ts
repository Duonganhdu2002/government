/**
 * Types related to locations in Vietnam
 */

/**
 * Interface for province data
 */
export interface Province {
  code: string;
  name: string;
  name_with_type: string;
  slug: string;
  type: string;
}

/**
 * Interface for district data
 */
export interface District {
  code: string;
  name: string;
  name_with_type: string;
  parent_code: string;
  slug: string;
  type: string;
}

/**
 * Interface for ward data
 */
export interface Ward {
  code: string;
  name: string;
  name_with_type: string;
  parent_code: string;
  slug: string;
  type: string;
}

/**
 * Interface for location selection data
 */
export interface LocationData {
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  fullAddress: string;
} 