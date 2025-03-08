/************************************************
 * config/database.js - Kết nối PostgreSQL
 ************************************************/

// Import Pool từ thư viện 'pg' để quản lý kết nối
const { Pool } = require('pg');
// Nạp biến môi trường từ file .env
require('dotenv').config();

/**
 * Hàm lấy cấu hình SSL dựa trên biến môi trường.
 * - Nếu biến DB_SSL được thiết lập là 'false' (không phân biệt hoa thường), trả về false.
 * - Ngược lại, trả về đối tượng cấu hình SSL với require true và không từ chối chứng chỉ không hợp lệ.
 *
 * @returns {boolean|Object} Cấu hình SSL cho kết nối
 */
const getSslConfig = () => {
  const sslMode = process.env.DB_SSL || 'true';
  
  if (sslMode.toLowerCase() === 'false') {
    return false;
  }
  
  return {
    require: true,
    // Thiết lập rejectUnauthorized thành false nếu sử dụng Heroku, Aiven hoặc các dịch vụ cloud tương tự
    rejectUnauthorized: false
  };
};

// Tạo một đối tượng pool kết nối mới sử dụng các biến môi trường
const pool = new Pool({
  user: process.env.DB_USER,                              // Tên người dùng của DB
  host: process.env.DB_HOST,                              // Địa chỉ host của DB
  database: process.env.DB_DATABASE,                      // Tên database
  password: process.env.DB_PASSWORD,                      // Mật khẩu của DB
  port: process.env.DB_PORT || 5432,                      // Cổng kết nối, mặc định 5432
  ssl: getSslConfig(),                                    // Cấu hình SSL
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),  // Số kết nối tối đa trong pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),   // Thời gian giữ kết nối nhàn rỗi (ms)
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'), // Thời gian chờ kết nối (ms)
});

// Kiểm tra kết nối của pool và log thông tin chi tiết nếu thành công hoặc thất bại
pool
  .connect()
  .then(client => {
    console.log('Connected to PostgreSQL via pg Pool!');
    console.log(`Database: ${process.env.DB_DATABASE} at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    // Giải phóng client sau khi kiểm tra kết nối thành công
    client.release();
  })
  .catch((err) => {
    console.error('Failed to connect via pg Pool:', err);
    console.error('Connection details (sanitized):');
    console.error(`- Host: ${process.env.DB_HOST}`);
    console.error(`- Port: ${process.env.DB_PORT}`);
    console.error(`- Database: ${process.env.DB_DATABASE}`);
    console.error(`- SSL enabled: ${process.env.DB_SSL !== 'false'}`);
  });

// Lắng nghe sự kiện lỗi từ pool khi có lỗi xảy ra ở client nhàn rỗi
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

// Xuất pool để sử dụng ở các module khác
module.exports = pool;
