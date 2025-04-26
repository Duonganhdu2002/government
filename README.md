# Hệ thống Quản lý Dịch vụ Hành chính Công

Hệ thống toàn diện để quản lý dịch vụ hành chính công, hỗ trợ tương tác giữa công dân và cơ quan chính phủ.

## Tổng quan dự án

Dự án bao gồm các thành phần chính:

- **Backend (server)**: API RESTful xây dựng trên Express.js, kết nối PostgreSQL và Redis
- **Admin Portal**: Giao diện quản trị dành cho người quản lý hệ thống
- **Citizen Portal**: Cổng dịch vụ công dành cho người dân
- **Staff Portal**: Giao diện dành cho cán bộ, nhân viên cơ quan hành chính
- **Mobile App**: Ứng dụng di động cho người dân xây dựng bằng Flutter

## Công nghệ sử dụng

### Backend
- Node.js & Express.js
- PostgreSQL (cơ sở dữ liệu quan hệ)
- Redis (cache và quản lý phiên)
- Sequelize ORM
- JWT (xác thực)
- Bcrypt (mã hóa)
- Middleware bảo mật: Helmet, XSS-Clean, Rate Limiting

### Frontend
- Next.js (React Framework)
- Tailwind CSS
- TypeScript

### Mobile
- Flutter

## Tính năng chính

- Quản lý hồ sơ công dân
- Xử lý đơn đăng ký dịch vụ công
- Quản lý loại hồ sơ và đơn từ
- Quản lý cơ quan hành chính
- Hệ thống thông báo và theo dõi trạng thái
- Lịch sử xử lý hồ sơ
- Quản lý tài khoản cán bộ
- Thông báo công khai
- Quản lý khu vực địa lý
- Hệ thống bài viết và thông tin

## Cài đặt

### Yêu cầu hệ thống
- Node.js (v14+)
- PostgreSQL
- Redis
- Flutter SDK (cho phát triển mobile)

### Bước 1: Clone Repository

```bash
git clone <git@github.com:Duonganhdu2002/government.git>
cd government
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` trong thư mục `server` và thiết lập các biến môi trường:

```bash
cp server/.env.example server/.env
```

Chỉnh sửa file `.env` với các thông số phù hợp cho:
- Kết nối database
- Cấu hình Redis
- JWT secret
- Cổng server
- CORS settings

### Bước 3: Cài đặt dependencies và khởi chạy server

```bash
# Cài đặt và chạy Backend
cd server
npm install
npm run dev

# Cài đặt và chạy Admin Portal
cd ../admin
npm install
npm run dev

# Cài đặt và chạy Citizen Portal
cd ../citizen
npm install
npm run dev

# Cài đặt và chạy Staff Portal
cd ../staff
npm install
npm run dev

# Cài đặt và chạy Mobile App
cd ../mobile
flutter pub get
flutter run
```

## Cấu trúc thư mục

- `/server`: Backend API
  - `/src`: Mã nguồn
    - `/controllers`: Xử lý logic nghiệp vụ
    - `/models`: Định nghĩa database models
    - `/routes`: Định nghĩa API endpoints
    - `/middleware`: Middleware xác thực và xử lý lỗi
    - `/config`: Cấu hình database và Redis
    - `/utils`: Các tiện ích

- `/admin`: Admin Portal
- `/citizen`: Citizen Portal
- `/staff`: Staff Portal
- `/mobile`: Mobile Application

## Thư viện hình ảnh dự án

<p align="center">
  <img src="./readme/z6398879828930_4871a1573ace63de05997d3c91bc75bb.jpg" alt="Ảnh 1" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398889510052_02d1a723e12d0db435b1e05a36d2edf9.jpg" alt="Ảnh 2" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398891021644_0a71af4cc3c2412b58760532520bbdd.jpg" alt="Ảnh 3" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398891046727_868893d6d614afa920451d2e2b20bd57.jpg" alt="Ảnh 4" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398891047465_e11bc1ad37f5c5990711e3836ab82ab.jpg" alt="Ảnh 5" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398891076898_a35c73dd96ac0f50bd1fa860d9b5498a.jpg" alt="Ảnh 6" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398891096671_916dceb8ac59785bd85b197cb998dd7c.jpg" alt="Ảnh 7" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398891099465_eea5245519281a48da318507fd148f4.jpg" alt="Ảnh 8" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398927764609_17812a80de8fdad811d927144cdee523.jpg" alt="Ảnh 9" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398927764697_276f1b8ca3fd52d9279e366f7c30caf0.jpg" alt="Ảnh 10" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398930802602_3a9996001b76fcdc6aab41eca5f10fc1.jpg" alt="Ảnh 11" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398939497534_0b88d7f9167905ef09d8e2569ed54553.jpg" alt="Ảnh 12" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398939497565_5fa58ca9a952ac4df63b88b92abee67f.jpg" alt="Ảnh 13" width="500"/>
</p>

<p align="center">
  <img src="./readme/z6398939497587_4829198a33fb91800d40d5dab298150.jpg" alt="Ảnh 14" width="500"/>
</p>

<p align="center">
  <img src="./readme/z640048598122_c9b81e9b96c3dceb4ffd119eadd0757.jpg" alt="Ảnh 15" width="500"/>
</p>
