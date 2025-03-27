/**
 * images.ts
 * 
 * Tập trung tất cả các đường dẫn đến hình ảnh và biểu tượng trong ứng dụng
 */

// Đường dẫn cơ sở đến thư mục public
const PUBLIC_PATH = '';

// Logos
export const LOGOS = {
  PRIMARY: `${PUBLIC_PATH}/vercel.svg`,
  SECONDARY: `${PUBLIC_PATH}/next.svg`,
  ICON: `${PUBLIC_PATH}/favicon.ico`,
};

// Biểu tượng (icons)
export const ICONS = {
  // Biểu tượng cơ bản
  BELL: `${PUBLIC_PATH}/bell.svg`,
  FILE: `${PUBLIC_PATH}/file.svg`,
  GLOBE: `${PUBLIC_PATH}/globe.svg`,
  WINDOW: `${PUBLIC_PATH}/window.svg`,
  
  // Placeholder
  PLACEHOLDER: `${PUBLIC_PATH}/placeholder-image.svg`,
};

// Ảnh cho ứng dụng
export const APPLICATION_IMAGES = {
  ID_CARD: `${PUBLIC_PATH}/applications/id-card.png`,
  MARRIAGE: `${PUBLIC_PATH}/applications/marriage.png`,
  BIRTH: `${PUBLIC_PATH}/applications/birth.png`,
  BUSINESS: `${PUBLIC_PATH}/applications/business.png`,
  PROPERTY: `${PUBLIC_PATH}/applications/property.png`,
  LEGAL: `${PUBLIC_PATH}/applications/legal.png`,
  OTHER: `${PUBLIC_PATH}/applications/other.png`,
};

// Thông tin về sizes và tỷ lệ ảnh
export const IMAGE_DIMENSIONS = {
  AVATAR: {
    WIDTH: 120,
    HEIGHT: 120,
    ASPECT_RATIO: '1:1',
  },
  THUMBNAIL: {
    WIDTH: 120,
    HEIGHT: 80,
    ASPECT_RATIO: '3:2',
  },
  BANNER: {
    WIDTH: 1200,
    HEIGHT: 300,
    ASPECT_RATIO: '4:1',
  },
};

// Hỗ trợ lười tải (lazy loading) của ảnh
export const LAZY_LOADING = {
  ENABLED: true,
  PLACEHOLDER_COLOR: '#f0f0f0',
};

export default {
  LOGOS,
  ICONS,
  APPLICATION_IMAGES,
  IMAGE_DIMENSIONS,
  LAZY_LOADING,
}; 