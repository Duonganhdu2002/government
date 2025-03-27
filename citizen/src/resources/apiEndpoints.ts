/**
 * apiEndpoints.ts
 * 
 * Tập trung tất cả các endpoint API được sử dụng trong ứng dụng
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
  USER_INFO: `${API_BASE_URL}/api/auth/me`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password-request`,
};

// Citizen endpoints
export const CITIZEN_ENDPOINTS = {
  PROFILE: (id: number) => `${API_BASE_URL}/api/citizens/${id}`,
  UPDATE_PROFILE: (id: number) => `${API_BASE_URL}/api/citizens/${id}`,
};

// Application endpoints
export const APPLICATION_ENDPOINTS = {
  LIST: `${API_BASE_URL}/api/applications`,
  DETAIL: (id: number) => `${API_BASE_URL}/api/applications/${id}`,
  BY_ID: (id: string) => `${API_BASE_URL}/api/applications/${id}`,
  MEDIA_FILES: (id: string) => `${API_BASE_URL}/api/media-files/by-application/${id}`,
  CREATE: `${API_BASE_URL}/api/applications`,
  UPDATE: (id: number) => `${API_BASE_URL}/api/applications/${id}`,
  USER_APPLICATIONS: `${API_BASE_URL}/api/applications/current-user`,
  MEDIA_UPLOAD: `${API_BASE_URL}/api/media-files`,
  APPLICATION_TYPES: `${API_BASE_URL}/api/application-types`,
  SPECIAL_TYPES: (typeId: number) => `${API_BASE_URL}/api/special-application-types/by-application-type/${typeId}`,
};

// Location endpoints
export const LOCATION_ENDPOINTS = {
  PROVINCES: 'https://vietnam-administrative-division-json-server-swart.vercel.app/province',
  DISTRICTS: (provinceCode: string) => `https://vietnam-administrative-division-json-server-swart.vercel.app/district/?idProvince=${provinceCode}`,
  WARDS: (districtCode: string) => `https://vietnam-administrative-division-json-server-swart.vercel.app/commune/?idDistrict=${districtCode}`,
};

// Post endpoints
export const POST_ENDPOINTS = {
  LIST: `${API_BASE_URL}/api/posts`,
  DETAIL: (id: number) => `${API_BASE_URL}/api/posts/${id}`,
  CATEGORIES: `${API_BASE_URL}/api/post-categories`,
};

export default {
  AUTH_ENDPOINTS,
  CITIZEN_ENDPOINTS,
  APPLICATION_ENDPOINTS,
  LOCATION_ENDPOINTS,
  POST_ENDPOINTS,
}; 