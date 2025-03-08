/**
 * auth.util.js
 *
 * Các hàm tiện ích xác thực và phân quyền.
 * Cung cấp các phương thức hỗ trợ quản lý token, xác thực người dùng,
 * cũng như kiểm tra quyền truy cập và xử lý mật khẩu.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { executeQuery } = require('./db.util');
const logger = require('./logger.util');

// Cấu hình mặc định
const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Băm (hash) mật khẩu sử dụng bcrypt.
 * 
 * @param {string} password - Mật khẩu ở dạng văn bản thường cần băm.
 * @returns {Promise<string>} Mật khẩu đã được băm.
 * @throws {Error} Nếu quá trình băm thất bại.
 */
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    logger.error('Lỗi khi băm mật khẩu:', { error: error.message });
    throw new Error('Quá trình băm mật khẩu thất bại');
  }
};

/**
 * So sánh mật khẩu văn bản thường với mật khẩu đã băm.
 * 
 * @param {string} password - Mật khẩu văn bản thường cần so sánh.
 * @param {string} hash - Mật khẩu đã được băm để so sánh.
 * @returns {Promise<boolean>} True nếu mật khẩu khớp, ngược lại là false.
 */
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Lỗi khi so sánh mật khẩu:', { error: error.message });
    return false;
  }
};

/**
 * Tạo JWT access token.
 * 
 * @param {Object} payload - Dữ liệu payload cho token.
 * @param {string} secret - Secret key dùng để ký token.
 * @param {string} expiry - Thời gian hết hạn của token.
 * @returns {string} Token JWT đã được ký.
 * @throws {Error} Nếu tạo token thất bại.
 */
const generateToken = (payload, secret, expiry) => {
  try {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  } catch (error) {
    logger.error('Lỗi khi tạo token:', { error: error.message });
    throw new Error('Tạo token thất bại');
  }
};

/**
 * Xác minh JWT token.
 * 
 * @param {string} token - Token cần xác minh.
 * @param {string} secret - Secret key dùng để xác minh token.
 * @returns {Object|null} Payload đã giải mã hoặc null nếu token không hợp lệ.
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error('Xác minh token thất bại:', { error: error.message });
    return null;
  }
};

/**
 * Kiểm tra xem người dùng có thuộc quyền (role) yêu cầu hay không.
 * 
 * @param {Object} user - Đối tượng người dùng có thuộc tính role.
 * @param {string|Array} requiredRoles - Quyền (role) hoặc danh sách quyền cần kiểm tra.
 * @returns {boolean} True nếu người dùng có quyền yêu cầu.
 */
const hasRole = (user, requiredRoles) => {
  if (!user || !user.role) return false;

  // Nếu chỉ có 1 role, chuyển thành mảng
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role);
};

/**
 * Lưu trữ token vào cơ sở dữ liệu để theo dõi.
 * 
 * @param {number} userId - ID người dùng.
 * @param {string} token - Token cần lưu.
 * @param {string} userType - Loại người dùng ('staff' hoặc 'citizen').
 * @param {number} expiryDays - Số ngày đến khi token hết hạn (mặc định: 7).
 * @returns {Promise<void>}
 */
const storeTokenInDatabase = async (userId, token, userType, expiryDays = 7) => {
  // Xác định bảng và trường ID dựa trên loại người dùng
  const table = userType === 'staff' ? 'staffrefreshtoken' : 'citizenrefreshtoken';
  const idField = userType === 'staff' ? 'staffid' : 'citizenid';

  try {
    // Xóa các token cũ của người dùng này
    await executeQuery(`DELETE FROM ${table} WHERE ${idField} = $1;`, [userId]);

    // Chèn token mới vào cơ sở dữ liệu với thời gian hết hạn
    await executeQuery(
      `INSERT INTO ${table} (${idField}, token, expiresat)
       VALUES ($1, $2, NOW() + interval '${expiryDays} days');`,
      [userId, token]
    );

    logger.debug('Token đã được lưu vào cơ sở dữ liệu', { userId, userType, expiryDays });
  } catch (error) {
    logger.error('Lỗi khi lưu token vào cơ sở dữ liệu:', { 
      error: error.message, 
      userId, 
      userType 
    });
    throw error;
  }
};

/**
 * Kiểm tra token trong cơ sở dữ liệu.
 * 
 * @param {number} userId - ID người dùng.
 * @param {string} token - Token cần xác thực.
 * @param {string} userType - Loại người dùng ('staff' hoặc 'citizen').
 * @returns {Promise<boolean>} True nếu token hợp lệ.
 */
const validateTokenInDatabase = async (userId, token, userType) => {
  const table = userType === 'staff' ? 'staffrefreshtoken' : 'citizenrefreshtoken';
  const idField = userType === 'staff' ? 'staffid' : 'citizenid';

  try {
    const result = await executeQuery(
      `SELECT token FROM ${table} 
       WHERE ${idField} = $1 AND token = $2 AND expiresat > NOW();`,
      [userId, token]
    );

    return result.rows.length > 0;
  } catch (error) {
    logger.error('Lỗi khi xác thực token trong cơ sở dữ liệu:', { 
      error: error.message, 
      userId, 
      userType 
    });
    return false;
  }
};

/**
 * Xóa token khỏi cơ sở dữ liệu (thao tác logout).
 * 
 * @param {number} userId - ID người dùng.
 * @param {string} token - Token cần xóa.
 * @param {string} userType - Loại người dùng ('staff' hoặc 'citizen').
 * @returns {Promise<boolean>} True nếu xóa token thành công.
 */
const removeTokenFromDatabase = async (userId, token, userType) => {
  const table = userType === 'staff' ? 'staffrefreshtoken' : 'citizenrefreshtoken';
  const idField = userType === 'staff' ? 'staffid' : 'citizenid';

  try {
    const result = await executeQuery(
      `DELETE FROM ${table} WHERE ${idField} = $1 AND token = $2;`,
      [userId, token]
    );

    return result.rowCount > 0;
  } catch (error) {
    logger.error('Lỗi khi xóa token khỏi cơ sở dữ liệu:', { 
      error: error.message, 
      userId, 
      userType 
    });
    return false;
  }
};

/**
 * Tạo chuỗi ngẫu nhiên an toàn (dùng cho token CSRF, v.v.).
 * 
 * @param {number} length - Độ dài của chuỗi cần tạo (mặc định: 32).
 * @returns {string} Chuỗi ngẫu nhiên.
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  hasRole,
  storeTokenInDatabase,
  validateTokenInDatabase,
  removeTokenFromDatabase,
  generateRandomString,
  constants: {
    SALT_ROUNDS,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
  }
};
