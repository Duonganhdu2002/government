# Staff Dashboard

## Tổng quan

Dashboard cung cấp cho cán bộ một cái nhìn tổng quan về các hoạt động liên quan đến xử lý hồ sơ. Dashboard được thiết kế tuân theo ngôn ngữ thiết kế Medusa UI, cung cấp giao diện người dùng đồng nhất và trực quan.

## Các tính năng chính

### 1. Thẻ Chào Mừng Cá Nhân Hóa
- Hiển thị lời chào dựa trên thời gian trong ngày
- Hiển thị ngày tháng hiện tại
- Tóm tắt số lượng hồ sơ cần xử lý

### 2. Theo dõi nhiệm vụ hàng ngày
- Hiển thị tiến độ các nhiệm vụ cần hoàn thành trong ngày
- Cập nhật tự động dựa trên hoạt động của cán bộ

### 3. Thống kê hồ sơ
- Tổng số hồ sơ
- Số hồ sơ chờ xử lý
- Số hồ sơ đã phê duyệt
- Số hồ sơ đã từ chối
- Số hồ sơ được nộp trong ngày
- Số hồ sơ quá hạn

### 4. Biểu đồ hiệu suất
- Tỷ lệ xử lý hồ sơ theo từng trạng thái
- Biểu diễn trực quan bằng biểu đồ tròn và thanh tiến trình

### 5. Danh sách hồ sơ cần xử lý
- Hiển thị các hồ sơ ưu tiên cần xử lý
- Tìm kiếm hồ sơ nhanh chóng
- Truy cập nhanh đến trang xử lý hồ sơ

### 6. Hoạt động gần đây
- Hiển thị các hành động xử lý hồ sơ gần đây của cán bộ
- Theo dõi lịch sử xử lý

### 7. Truy cập nhanh
- Các đường dẫn đến các tính năng thường xuyên sử dụng
- Hiển thị số lượng hồ sơ cho từng mục

### 8. Hiệu suất làm việc
- Thời gian xử lý trung bình
- Số lượng hồ sơ đã xử lý
- Tỷ lệ hiệu quả so với trung bình chung

## Kết nối với API

Dashboard sử dụng API `/api/applications/dashboard` để lấy dữ liệu. API này trả về các thông tin sau:

```json
{
  "stats": {
    "total": 100,
    "pending": 20,
    "approved": 60,
    "rejected": 20,
    "today": 5,
    "overdue": 3
  },
  "applications": [...],
  "recentActivity": [...],
  "dailyTasks": [
    {
      "taskId": 1,
      "title": "Xử lý các hồ sơ mới",
      "status": "completed",
      "progress": 100,
      "target": 2,
      "current": 2
    },
    ...
  ],
  "performance": {
    "avgProcessingTime": 2.5,
    "processedApplications": 35,
    "efficiency": 80
  },
  "staffInfo": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "role": "admin",
    "agencyId": 1
  }
}
```

## Phát triển

### Yêu cầu
- Node.js 16+
- NextJS 14+
- Medusa UI

### Cài đặt
```bash
npm install
npm run dev
```

### Sử dụng các component Medusa UI

Dashboard sử dụng các component từ thư viện Medusa UI:
- `Badge`, `Button`, `Text`, `Heading`, `Drawer`, `Input` từ `@medusajs/ui`
- Các icon từ `@medusajs/icons`

### Component tùy chỉnh

Chúng tôi đã tạo một số component tùy chỉnh để bổ sung các tính năng không có sẵn trong Medusa UI:
- `ProgressBar`: Thanh tiến trình tuyến tính
- `ProgressCircle`: Biểu đồ tiến trình hình tròn

## Cập nhật và bảo trì

- Dữ liệu được tự động làm mới mỗi 5 phút
- Bộ nhớ đệm Redis được sử dụng để tối ưu hóa hiệu suất
- Kiểm tra lỗi và xử lý trường hợp không có dữ liệu
