/**
 * src/resources/strings/locationStrings.ts
 * 
 * Tập hợp các chuỗi văn bản được sử dụng trong các component liên quan đến địa chỉ
 */

export const locationStrings = {
  // Nhãn cho các dropdown
  labels: {
    province: 'Tỉnh/Thành phố',
    district: 'Quận/Huyện',
    ward: 'Phường/Xã'
  },
  
  // Placeholder cho các dropdown
  placeholders: {
    province: 'Chọn Tỉnh/Thành phố',
    district: 'Chọn Quận/Huyện',
    ward: 'Chọn Phường/Xã'
  },
  
  // Thông báo loading
  loading: {
    dropdown: 'Đang tải...',
    data: 'Đang tải dữ liệu...'
  },
  
  // Thông báo lỗi
  errors: {
    noProvinceData: 'Không tìm thấy dữ liệu tỉnh/thành phố',
    noDistrictData: 'Không tìm thấy dữ liệu quận/huyện',
    noWardData: 'Không tìm thấy dữ liệu phường/xã',
    provinceLoadFailed: 'Không thể tải danh sách tỉnh/thành phố',
    districtLoadFailed: 'Không thể tải danh sách quận/huyện',
    wardLoadFailed: 'Không thể tải danh sách phường/xã',
    noData: 'Không tìm thấy dữ liệu',
    required: 'Vui lòng chọn {field}'
  },
  
  // Nút và hành động
  actions: {
    retry: 'Thử lại'
  },
  
  // Log messages
  logs: {
    provinceError: 'Error fetching provinces:',
    districtError: 'Error fetching districts:',
    wardError: 'Error fetching wards:'
  }
};

export default locationStrings; 