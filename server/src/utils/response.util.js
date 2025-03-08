/**
 * src/utils/response.util.js
 *
 * Các hàm tiện ích dùng để tạo phản hồi API chuẩn, đảm bảo định dạng phản hồi đồng nhất trong toàn bộ ứng dụng.
 */

/**
 * Tạo đối tượng phản hồi thành công (Success Response)
 *
 * @param {Object} data - Dữ liệu cần gửi trong phản hồi
 * @param {string} message - Thông điệp thành công
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định: 200)
 * @returns {Object} Đối tượng phản hồi đã định dạng cho thành công
 */
const success = (data = null, message = 'Operation successful', statusCode = 200) => {
  return {
    status: 'success',
    message,
    data,
    statusCode
  };
};

/**
 * Tạo đối tượng phản hồi lỗi (Error Response)
 *
 * @param {string} message - Thông điệp lỗi
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định: 500)
 * @param {Object} errors - Thông tin chi tiết lỗi (nếu có)
 * @returns {Object} Đối tượng phản hồi đã định dạng cho lỗi
 */
const error = (message = 'An error occurred', statusCode = 500, errors = null) => {
  return {
    status: 'error',
    message,
    errors,
    statusCode
  };
};

/**
 * Gửi phản hồi thành công qua đối tượng res của Express
 *
 * @param {Object} res - Đối tượng response của Express
 * @param {Object} data - Dữ liệu cần gửi trong phản hồi
 * @param {string} message - Thông điệp thành công
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định: 200)
 */
const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json(success(data, message, statusCode));
};

/**
 * Gửi phản hồi lỗi qua đối tượng res của Express
 *
 * @param {Object} res - Đối tượng response của Express
 * @param {string} message - Thông điệp lỗi
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định: 500)
 * @param {Object} errors - Thông tin chi tiết lỗi (nếu có)
 */
const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json(error(message, statusCode, errors));
};

/**
 * Gửi phản hồi khi tài nguyên không được tìm thấy (404 Not Found)
 *
 * @param {Object} res - Đối tượng response của Express
 * @param {string} message - Thông điệp thông báo không tìm thấy
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

/**
 * Gửi phản hồi khi yêu cầu không hợp lệ (400 Bad Request)
 *
 * @param {Object} res - Đối tượng response của Express
 * @param {string} message - Thông điệp báo lỗi yêu cầu không hợp lệ
 * @param {Object} errors - Thông tin lỗi chi tiết (nếu có)
 */
const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  return sendError(res, message, 400, errors);
};

module.exports = {
  success,
  error,
  sendSuccess,
  sendError,
  sendNotFound,
  sendBadRequest
};
