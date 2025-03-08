/**
 * src/utils/logger.util.js
 *
 * Tiện ích ghi log tập trung, cung cấp các hàm log đồng nhất trong toàn bộ ứng dụng.
 */

/**
 * Định nghĩa các mức log với thứ tự ưu tiên
 * Mức log cao hơn sẽ in ra các thông tin log ở mức thấp hơn.
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Thiết lập mức log hiện tại từ biến môi trường hoặc mặc định là INFO
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL 
  ? (LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO)
  : LOG_LEVELS.INFO;

/**
 * Hàm định dạng thông điệp log với thời gian và metadata kèm theo.
 *
 * @param {string} level - Mức log (error, warn, info, debug)
 * @param {string} message - Thông điệp log
 * @param {Object} meta - Thông tin bổ sung (nếu có)
 * @returns {string} Chuỗi log đã được định dạng
 */
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length 
    ? `\n${JSON.stringify(meta, null, 2)}` 
    : '';
  
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
};

/**
 * Ghi log thông điệp lỗi.
 *
 * @param {string} message - Thông điệp lỗi
 * @param {Object} meta - Thông tin chi tiết lỗi (nếu có)
 */
const error = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
    console.error(formatLogMessage('error', message, meta));
  }
};

/**
 * Ghi log thông điệp cảnh báo.
 *
 * @param {string} message - Thông điệp cảnh báo
 * @param {Object} meta - Thông tin chi tiết cảnh báo (nếu có)
 */
const warn = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
    console.warn(formatLogMessage('warn', message, meta));
  }
};

/**
 * Ghi log thông điệp thông tin.
 *
 * @param {string} message - Thông điệp thông tin
 * @param {Object} meta - Thông tin bổ sung (nếu có)
 */
const info = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
    console.info(formatLogMessage('info', message, meta));
  }
};

/**
 * Ghi log thông điệp debug.
 *
 * @param {string} message - Thông điệp debug
 * @param {Object} meta - Thông tin chi tiết debug (nếu có)
 */
const debug = (message, meta = {}) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    console.debug(formatLogMessage('debug', message, meta));
  }
};

/**
 * Ghi log thông tin yêu cầu HTTP.
 * Hàm này được gọi sau khi response đã được gửi về client.
 *
 * @param {Object} req - Đối tượng request của Express
 * @param {Object} res - Đối tượng response của Express
 * @param {number} time - Thời gian xử lý yêu cầu (ms)
 */
const httpRequest = (req, res, time) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      statusCode: res.statusCode,
      responseTime: `${time}ms`,
      userId: req.userId || 'anonymous',
      userAgent: req.headers['user-agent']
    };
    
    info(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
  }
};

/**
 * Ghi log truy vấn cơ sở dữ liệu.
 *
 * @param {string} query - Câu lệnh SQL đã thực thi
 * @param {Array} params - Các tham số truyền vào truy vấn
 * @param {number} time - Thời gian thực thi truy vấn (ms)
 */
const dbQuery = (query, params, time) => {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    const meta = {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      executionTime: `${time}ms`
    };
    
    debug('Database query executed', meta);
  }
};

/**
 * Middleware ghi log yêu cầu HTTP.
 * Ghi log thông tin sau khi response đã được gửi về client.
 *
 * @returns {Function} Hàm middleware của Express
 */
const requestLogger = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Sau khi response hoàn thành, tính thời gian xử lý và ghi log yêu cầu
    res.on('finish', () => {
      const time = Date.now() - start;
      httpRequest(req, res, time);
    });
    
    next();
  };
};

module.exports = {
  error,
  warn,
  info,
  debug,
  httpRequest,
  dbQuery,
  requestLogger
};
