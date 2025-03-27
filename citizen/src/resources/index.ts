/**
 * src/resources/index.ts
 * 
 * File export tất cả các resource của ứng dụng
 */

// Export từ thư mục strings
export { default as locationStrings } from './strings/locationStrings';
export { default as commonStrings } from './strings/commonStrings';

// Export các UI components
export * from './uiComponents';
export * from './components';

/**
 * Export từ các file tài nguyên khác
 */
export * from './apiEndpoints';
export * from './constants';
export * from './textContent';
export * from './images';
export * from './routes';
export * from './colors';

// Export mặc định
import apiEndpoints from './apiEndpoints';
import * as constants from './constants';
import images from './images';
import routes from './routes';
import * as textContent from './textContent';
import colors from './colors';
import locationStrings from './strings/locationStrings';
import commonStrings from './strings/commonStrings';

// Tạo object tổng hợp tất cả tài nguyên
const resources = {
  api: apiEndpoints,
  constants,
  images,
  routes,
  text: textContent,
  colors,
  strings: {
    location: locationStrings,
    common: commonStrings
  }
};

export default resources; 