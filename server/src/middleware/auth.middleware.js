/**
 * auth.middleware.js
 *
 * Các middleware xác thực (authentication) và kiểm tra quyền truy cập (authorization)
 * của người dùng trong ứng dụng.
 * Cung cấp các hàm:
 * - verifyToken: Xác minh JWT token và gắn userId vào request.
 * - isStaff: Kiểm tra người dùng có phải là nhân viên không.
 * - isAdmin: Kiểm tra người dùng có quyền admin không.
 * - isCitizen: Kiểm tra người dùng có phải là công dân không.
 */

const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

/**
 * Middleware xác thực JWT token.
 * - Kiểm tra header Authorization.
 * - Trích xuất token và xác minh token.
 * - Nếu hợp lệ, gắn userId vào req và chuyển sang middleware tiếp theo.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'Not provided');

    if (!authHeader) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No authorization header provided'
      });
    }

    // Trích xuất token từ header (định dạng "Bearer <token>")
    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? `${token.substring(0, 10)}...` : 'Not available');

    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No token provided'
      });
    }

    // Xác minh token với secret key
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err.message);
        return res.status(403).json({ 
          status: 'error',
          message: 'Invalid or expired token'
        });
      }

      console.log('Token decoded successfully, user ID:', decoded.id);
      // Gắn userId vào request để sử dụng sau này
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware kiểm tra người dùng là nhân viên (staff).
 * - Truy vấn cơ sở dữ liệu dựa trên req.userId.
 * - Nếu không tìm thấy hoặc không phải nhân viên, trả về lỗi 403.
 * - Nếu hợp lệ, gắn role vào req và chuyển sang middleware tiếp theo.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const isStaff = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM staff WHERE staffid = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        status: 'error',
        message: 'User is not staff'
      });
    }

    // Gắn role vào request để sử dụng sau này
    req.userRole = result.rows[0].role;
    next();
  } catch (error) {
    console.error('Error in isStaff middleware:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware kiểm tra người dùng là admin.
 * - Truy vấn cơ sở dữ liệu dựa trên req.userId.
 * - Nếu không tìm thấy hoặc role không phải admin, trả về lỗi 403.
 * - Nếu hợp lệ, gắn role "admin" vào req và chuyển sang middleware tiếp theo.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const isAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM staff WHERE staffid = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        status: 'error',
        message: 'User is not staff'
      });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ 
        status: 'error',
        message: 'User is not an admin'
      });
    }

    req.userRole = 'admin';
    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware kiểm tra người dùng là công dân (citizen).
 * - Truy vấn cơ sở dữ liệu dựa trên req.userId trong bảng citizens.
 * - Nếu không tìm thấy, trả về lỗi 403.
 * - Nếu hợp lệ, chuyển sang middleware tiếp theo.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const isCitizen = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT citizenid FROM citizens WHERE citizenid = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        status: 'error',
        message: 'User is not a citizen'
      });
    }

    next();
  } catch (error) {
    console.error('Error in isCitizen middleware:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  verifyToken,
  isStaff,
  isAdmin,
  isCitizen
};
