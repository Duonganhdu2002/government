/**
 * src/resources/strings/commonStrings.ts
 * 
 * Tập hợp các chuỗi văn bản dùng trong các component chung của ứng dụng
 */

export const commonStrings = {
  // Thông báo log
  logs: {
    auth: {
      checking: 'AuthChecker: Checking authentication state...',
      completed: 'AuthChecker: Authentication check completed.',
      failed: 'AuthChecker: Authentication check failed:'
    },
    modal: {
      opened: 'Modal opened',
      closed: 'Modal closed'
    }
  },
  
  // Accessibility (a11y)
  a11y: {
    modal: {
      closeButton: 'Đóng cửa sổ',
      overlay: 'Nền mờ của cửa sổ'
    }
  }
};

export default commonStrings; 