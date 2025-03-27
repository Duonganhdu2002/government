/**
 * index.ts
 * 
 * File này export tất cả các nguồn tài nguyên từ các file khác nhau
 * để có thể import dễ dàng từ một điểm duy nhất
 */

// Export từ các file tài nguyên
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

// Tạo object tổng hợp tất cả tài nguyên
const resources = {
  api: apiEndpoints,
  constants,
  images,
  routes,
  text: textContent,
  colors
};

export default resources; 