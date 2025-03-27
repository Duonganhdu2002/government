/**
 * routes.ts
 * 
 * Tập trung tất cả các đường dẫn định tuyến trong ứng dụng
 */

// Đường dẫn gốc
export const ROOT = {
  HOME: '/',
  DASHBOARD: '/dashboard',
};

// Các đường dẫn xác thực
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
};

// Các đường dẫn trong dashboard
export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  PROFILE: '/dashboard/profile',
  APPLICATIONS: '/dashboard/applications',
  APPLICATION_DETAIL: (id: string | number) => `/dashboard/applications/${id}`,
  APPLICATION_NEW: '/dashboard/applications/new',
  HISTORY: '/dashboard/history',
  GUIDES: '/dashboard/guides',
  GUIDE_DETAIL: (id: string | number) => `/dashboard/guides/${id}`,
  NOTIFICATIONS: '/dashboard/notifications',
  SETTINGS: '/dashboard/settings',
};

// Các đường dẫn công cộng (không yêu cầu đăng nhập)
export const PUBLIC_ROUTES = {
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  FAQ: '/faq',
  NEWS: '/news',
  NEWS_DETAIL: (id: string | number) => `/news/${id}`,
};

// Đường dẫn API
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USER: {
    PROFILE: '/api/citizens',
    UPDATE: '/api/citizens',
  },
  APPLICATIONS: {
    BASE: '/api/applications',
    TYPES: '/api/application-types',
    SPECIAL_TYPES: '/api/special-application-types',
    MEDIA: '/api/media-files',
  },
};

// Danh sách các đường dẫn yêu cầu đăng nhập
export const PROTECTED_ROUTES = [
  DASHBOARD_ROUTES.HOME,
  DASHBOARD_ROUTES.PROFILE,
  DASHBOARD_ROUTES.APPLICATIONS,
  DASHBOARD_ROUTES.HISTORY,
  DASHBOARD_ROUTES.GUIDES,
  DASHBOARD_ROUTES.NOTIFICATIONS,
  DASHBOARD_ROUTES.SETTINGS,
  '/dashboard/*', // Wildcard cho tất cả các trang con trong dashboard
];

// Danh sách các đường dẫn không yêu cầu đăng nhập
export const PUBLIC_ONLY_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
];

// Export tất cả
export default {
  ROOT,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  PUBLIC_ROUTES,
  API_ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ONLY_ROUTES,
}; 