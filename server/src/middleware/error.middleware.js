/**
 * error.middleware.js
 *
 * Middleware xử lý lỗi toàn cục của ứng dụng.
 * Cung cấp các hàm:
 * - notFoundHandler: Xử lý lỗi 404 (Not Found) khi route không tồn tại.
 * - errorHandler: Xử lý và định dạng tất cả các lỗi phát sinh.
 * - asyncErrorHandler: Bọc các hàm async để tự động bắt lỗi.
 * - createError: Tạo lỗi tùy chỉnh với mã trạng thái.
 */

/**
 * Middleware xử lý lỗi 404 Not Found.
 * Tạo lỗi mới với thông tin URL không tìm thấy và chuyển sang middleware xử lý lỗi.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware xử lý lỗi toàn cục.
 * - Định dạng lỗi, log thông tin lỗi, và gửi phản hồi lỗi cho client.
 * - Chỉ gửi stack trace khi không ở môi trường production.
 *
 * @param {Error} err - Đối tượng lỗi.
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo (không sử dụng ở đây).
 */
const errorHandler = (err, req, res, next) => {
  // Sử dụng mã trạng thái mặc định nếu không được chỉ định
  const statusCode = err.statusCode || 500;
  
  // Log thông tin lỗi chi tiết
  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.userId || 'unauthenticated'
  });
  
  // Gửi phản hồi lỗi cho client
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'An unexpected error occurred',
    // Chỉ bao gồm stack trace khi không ở production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    // Bao gồm thông tin lỗi chi tiết nếu có (ví dụ lỗi validate)
    ...(err.errors && { errors: err.errors })
  });
};

/**
 * Wrapper cho các hàm async.
 * Bắt lỗi từ các hàm async và chuyển cho middleware xử lý lỗi.
 *
 * @param {Function} fn - Hàm async cần bọc.
 * @returns {Function} Hàm được bọc, tự động chuyển lỗi qua next().
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Tạo lỗi tùy chỉnh với thông điệp và mã trạng thái.
 *
 * @param {string} message - Thông điệp lỗi.
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định: 500).
 * @returns {Error} Đối tượng lỗi đã được tạo.
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncErrorHandler,
  createError
};
