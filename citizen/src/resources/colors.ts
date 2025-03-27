/**
 * colors.ts
 * 
 * Tập trung tất cả các màu sắc được sử dụng trong ứng dụng
 * Phù hợp với Tailwind CSS
 */

// Màu chính của ứng dụng
export const PRIMARY = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
  950: '#082f49',
};

// Màu phụ của ứng dụng
export const SECONDARY = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
};

// Màu trạng thái
export const STATUS = {
  // Màu thành công (success)
  SUCCESS: {
    LIGHT: '#dcfce7', // green-100
    DEFAULT: '#16a34a', // green-600
    DARK: '#166534', // green-800
  },
  // Màu cảnh báo (warning)
  WARNING: {
    LIGHT: '#fef3c7', // amber-100
    DEFAULT: '#d97706', // amber-600
    DARK: '#92400e', // amber-800
  },
  // Màu lỗi (error)
  ERROR: {
    LIGHT: '#fee2e2', // red-100
    DEFAULT: '#dc2626', // red-600
    DARK: '#991b1b', // red-800
  },
  // Màu thông tin (info)
  INFO: {
    LIGHT: '#e0f2fe', // sky-100
    DEFAULT: '#0284c7', // sky-600
    DARK: '#075985', // sky-800
  },
};

// Màu trạng thái đơn từ
export const APPLICATION_STATUS_COLORS = {
  SUBMITTED: {
    BG: 'bg-ui-bg-subtle',
    TEXT: 'text-ui-fg-base',
    BORDER: 'border border-ui-border-base',
  },
  PROCESSING: {
    BG: 'bg-ui-bg-base',
    TEXT: 'text-ui-fg-base',
    BORDER: 'border border-ui-border-base',
  },
  COMPLETED: {
    BG: 'bg-ui-fg-base',
    TEXT: 'text-ui-bg-base',
    BORDER: '',
  },
  REJECTED: {
    BG: 'bg-ui-bg-base',
    TEXT: 'text-ui-fg-subtle',
    BORDER: 'border border-ui-border-base',
  },
  PENDING: {
    BG: 'bg-ui-bg-subtle',
    TEXT: 'text-ui-fg-subtle',
    BORDER: 'border border-ui-border-base',
  },
};

// Màu xám (Công bố màu theo Medusa UI)
export const GRAY = {
  50: 'var(--bg-base)', 
  100: 'var(--bg-subtle)',
  200: 'var(--border-base)',
  300: 'var(--border-strong)',
  400: 'var(--fg-muted)',
  500: 'var(--fg-subtle)',
  600: 'var(--fg-base)',
  700: 'var(--fg-strong)',
  800: 'var(--fg-stronger)',
  900: 'var(--fg-strongest)',
};

// Màu nền
export const BACKGROUND = {
  PRIMARY: 'var(--bg-base)', // Nền chính
  SECONDARY: 'var(--bg-subtle)', // Nền phụ
  COMPONENT: 'var(--bg-component)', // Nền thành phần
  OVERLAY: 'var(--bg-overlay)', // Nền lớp phủ
  HIGHLIGHT: 'var(--bg-highlight)', // Nền nhấn mạnh
  INPUT: 'var(--bg-field)', // Nền input
};

// Màu văn bản
export const TEXT = {
  PRIMARY: 'var(--fg-base)', // Văn bản chính
  SECONDARY: 'var(--fg-subtle)', // Văn bản phụ
  MUTED: 'var(--fg-muted)', // Văn bản mờ
  HIGHLIGHT: 'var(--fg-interactive)', // Văn bản nhấn mạnh
  INVERTED: 'var(--bg-base)', // Văn bản đảo ngược màu nền
  DISABLED: 'var(--fg-disabled)', // Văn bản bị vô hiệu
};

// Màu viền
export const BORDER = {
  LIGHT: 'var(--border-base)', // Viền mỏng
  DEFAULT: 'var(--border-strong)', // Viền mặc định
  FOCUS: 'var(--border-interactive)', // Viền khi focus
};

// Màu tương tác
export const INTERACTIVE = {
  DEFAULT: 'var(--fg-interactive)', // Màu tương tác mặc định
  HOVER: 'var(--interactive-hover)', // Màu khi hover
  PRESS: 'var(--interactive-press)', // Màu khi nhấn
  DISABLED: 'var(--fg-disabled)', // Màu khi bị vô hiệu
};

// Export tất cả
export default {
  PRIMARY,
  SECONDARY,
  STATUS,
  APPLICATION_STATUS_COLORS,
  GRAY,
  BACKGROUND,
  TEXT,
  BORDER,
  INTERACTIVE,
}; 