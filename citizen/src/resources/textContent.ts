/**
 * textContent.ts
 * 
 * Tập trung tất cả nội dung văn bản được sử dụng trong ứng dụng
 */

export const HOME_PAGE = {
  WELCOME: 'Chào mừng bạn đến với Cổng Dịch Vụ Công',
  DESCRIPTION: 'Nơi cung cấp các dịch vụ công trực tuyến, giúp bạn thực hiện các thủ tục hành chính một cách nhanh chóng và thuận tiện.',
  CALL_TO_ACTION: 'Bắt đầu ngay',
};

export const AUTH = {
  LOGIN: {
    TITLE: 'Đăng nhập',
    SUBTITLE: 'Đăng nhập để truy cập vào tài khoản của bạn',
    USERNAME_PLACEHOLDER: 'Tên đăng nhập',
    PASSWORD_PLACEHOLDER: 'Mật khẩu',
    SUBMIT_BUTTON: 'Đăng nhập',
    FORGOT_PASSWORD: 'Quên mật khẩu?',
    REGISTER_PROMPT: 'Chưa có tài khoản?',
    REGISTER_LINK: 'Đăng ký ngay',
  },
  REGISTER: {
    TITLE: 'Đăng ký tài khoản',
    SUBTITLE: 'Tạo tài khoản mới để sử dụng dịch vụ',
    FULLNAME_PLACEHOLDER: 'Họ và tên',
    USERNAME_PLACEHOLDER: 'Tên đăng nhập',
    PASSWORD_PLACEHOLDER: 'Mật khẩu',
    CONFIRM_PASSWORD_PLACEHOLDER: 'Xác nhận mật khẩu',
    EMAIL_PLACEHOLDER: 'Email',
    PHONE_PLACEHOLDER: 'Số điện thoại',
    ID_PLACEHOLDER: 'Số CCCD/CMND',
    ADDRESS_PLACEHOLDER: 'Địa chỉ',
    SUBMIT_BUTTON: 'Đăng ký',
    LOGIN_PROMPT: 'Đã có tài khoản?',
    LOGIN_LINK: 'Đăng nhập',
    TERMS_AGREEMENT: 'Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư của chúng tôi.',
  },
  LOGOUT: 'Đăng xuất',
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
    REQUIRED_FIELD: 'Vui lòng nhập trường này.',
    PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp.',
    USERNAME_TAKEN: 'Tên đăng nhập đã tồn tại.',
    EMAIL_TAKEN: 'Email đã được sử dụng.',
    WEAK_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
    GENERAL_ERROR: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
  },
};

export const DASHBOARD = {
  WELCOME: 'Chào mừng trở lại, ',
  STATS: {
    SUBMITTED_APPLICATIONS: 'Đơn đã nộp',
    PROCESSING_APPLICATIONS: 'Đơn đang xử lý',
    COMPLETED_APPLICATIONS: 'Đơn đã hoàn thành',
    REJECTED_APPLICATIONS: 'Đơn bị từ chối',
  },
  RECENT_APPLICATIONS: 'Đơn gần đây',
  VIEW_ALL: 'Xem tất cả',
  DOCUMENT_GUIDES: 'Hướng dẫn hồ sơ',
  QUICK_LINKS: {
    NEW_APPLICATION: 'Nộp đơn mới',
    VIEW_HISTORY: 'Xem lịch sử đơn',
    UPDATE_PROFILE: 'Cập nhật thông tin',
  },
  NO_APPLICATIONS: 'Bạn chưa có đơn nào. Hãy bắt đầu nộp đơn mới.',
  EMPTY_STATE: 'Chưa có dữ liệu để hiển thị.',
};

export const APPLICATIONS = {
  TITLE: 'Quản lý đơn từ',
  NEW_APPLICATION: 'Tạo đơn mới',
  FILTERS: {
    STATUS: 'Trạng thái',
    APPLICATION_TYPE: 'Loại đơn',
    DATE_RANGE: 'Thời gian',
    SEARCH: 'Tìm kiếm...',
    APPLY: 'Áp dụng',
    RESET: 'Đặt lại',
  },
  STATUS_LABELS: {
    SUBMITTED: 'Đã nộp',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Đã hoàn thành',
    REJECTED: 'Đã từ chối',
    PENDING: 'Chờ xử lý',
  },
  TABLE: {
    ID: 'Mã số đơn',
    TITLE: 'Tiêu đề',
    TYPE: 'Loại đơn',
    STATUS: 'Trạng thái',
    SUBMISSION_DATE: 'Ngày nộp',
    DUE_DATE: 'Hạn xử lý',
    ACTIONS: 'Thao tác',
  },
  ACTIONS: {
    VIEW: 'Xem chi tiết',
    PRINT: 'In đơn',
    CANCEL: 'Hủy đơn',
  },
  FORM: {
    SELECT_TYPE: 'Chọn loại đơn',
    SPECIAL_TYPE: 'Chọn loại đơn chi tiết',
    TITLE: 'Tiêu đề đơn',
    DESCRIPTION: 'Mô tả',
    EVENT_DATE: 'Ngày diễn ra',
    LOCATION: 'Địa điểm',
    ATTACHMENTS: 'Tài liệu đính kèm',
    SELECT_PROVINCE: 'Chọn Tỉnh/Thành phố',
    SELECT_DISTRICT: 'Chọn Quận/Huyện',
    SELECT_WARD: 'Chọn Phường/Xã',
    UPLOAD_IMAGES: 'Tải lên hình ảnh',
    UPLOAD_VIDEO: 'Tải lên video (không bắt buộc)',
    SUBMIT: 'Nộp đơn',
    CANCEL: 'Hủy',
    NEXT: 'Tiếp theo',
    PREVIOUS: 'Quay lại',
  },
  MESSAGES: {
    SUCCESS: 'Đơn của bạn đã được nộp thành công.',
    ERROR: 'Đã có lỗi xảy ra khi nộp đơn. Vui lòng thử lại.',
    VALIDATION: {
      REQUIRED: 'Trường này là bắt buộc.',
      INVALID_FILE_TYPE: 'Loại file không được hỗ trợ.',
      FILE_TOO_LARGE: 'Kích thước file quá lớn.',
    },
  },
};

export const PROFILE = {
  TITLE: 'Thông tin cá nhân',
  EDIT: 'Chỉnh sửa',
  SAVE: 'Lưu lại',
  CANCEL: 'Hủy',
  TABS: {
    PERSONAL: 'Thông tin cá nhân',
    SECURITY: 'Bảo mật',
  },
  FIELDS: {
    FULLNAME: 'Họ và tên',
    USERNAME: 'Tên đăng nhập',
    EMAIL: 'Email',
    PHONE: 'Số điện thoại',
    ADDRESS: 'Địa chỉ',
    ID_NUMBER: 'Số CCCD/CMND',
    BIRTHDATE: 'Ngày sinh',
    BIO: 'Giới thiệu',
  },
  SECURITY: {
    CURRENT_PASSWORD: 'Mật khẩu hiện tại',
    NEW_PASSWORD: 'Mật khẩu mới',
    CONFIRM_PASSWORD: 'Xác nhận mật khẩu mới',
    CHANGE_PASSWORD: 'Đổi mật khẩu',
  },
  MESSAGES: {
    UPDATE_SUCCESS: 'Cập nhật thông tin thành công.',
    UPDATE_ERROR: 'Đã có lỗi xảy ra khi cập nhật thông tin.',
    PASSWORD_SUCCESS: 'Đổi mật khẩu thành công.',
    PASSWORD_ERROR: 'Đã có lỗi xảy ra khi đổi mật khẩu.',
  },
};

export const ERRORS = {
  PAGE_NOT_FOUND: {
    TITLE: 'Không tìm thấy trang',
    MESSAGE: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.',
    BACK_HOME: 'Quay lại trang chủ',
  },
  SERVER_ERROR: {
    TITLE: 'Lỗi máy chủ',
    MESSAGE: 'Đã có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau.',
    RETRY: 'Thử lại',
  },
  UNAUTHORIZED: {
    TITLE: 'Không có quyền truy cập',
    MESSAGE: 'Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập để tiếp tục.',
    LOGIN: 'Đăng nhập',
  },
  GENERAL: {
    TITLE: 'Đã có lỗi xảy ra',
    MESSAGE: 'Đã có lỗi không xác định xảy ra. Vui lòng thử lại sau.',
    BACK: 'Quay lại',
  },
};

export const NOTIFICATIONS = {
  SUCCESS: 'Thành công',
  ERROR: 'Lỗi',
  WARNING: 'Cảnh báo',
  INFO: 'Thông tin',
}; 