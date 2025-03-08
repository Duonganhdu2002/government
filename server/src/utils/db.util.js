/**
 * src/utils/db.util.js
 *
 * Các hàm tiện ích dùng để thao tác với cơ sở dữ liệu PostgreSQL và Redis.
 * Hỗ trợ thực hiện truy vấn với cơ chế thử lại, phân trang, cache dữ liệu và
 * xóa cache theo mẫu.
 */

const pool = require('../config/database');
const redisClient = require('../config/redis');

/**
 * Thực thi một truy vấn SQL với xử lý lỗi và cơ chế thử lại (retry).
 * 
 * @param {string} query - Câu lệnh SQL cần thực thi.
 * @param {Array} params - Các tham số cho truy vấn.
 * @param {Object} options - Các tùy chọn bổ sung.
 *   @property {number} retries - Số lần thử lại (mặc định: 3).
 *   @property {number} timeout - Thời gian timeout cho truy vấn (ms, mặc định: 60000).
 * @returns {Promise<Object>} Kết quả truy vấn.
 * @throws {Error} Lỗi cơ sở dữ liệu sau khi hết số lần thử lại.
 */
const executeQuery = async (query, params = [], options = {}) => {
  const retries = options.retries || 3;
  const timeout = options.timeout || 60000; // Timeout mặc định: 60 giây

  let lastError;
  let client = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Lấy client từ pool; nếu lỗi kết nối sẽ log và ném lỗi
      client = await pool.connect().catch(err => {
        console.error(`Không thể kết nối tới DB (lần thử ${attempt + 1}/${retries + 1}):`, err);
        throw err;
      });

      try {
        // Thiết lập timeout cho truy vấn hiện tại
        await client.query(`SET statement_timeout TO ${timeout}`);

        // Log truy vấn (không log giá trị tham số để bảo mật)
        console.log(`Thực thi truy vấn (lần thử ${attempt + 1}/${retries + 1}): ${query.replace(/\s+/g, ' ').trim()} [${params.length} params]`);

        // Thực hiện truy vấn với các tham số cung cấp
        const result = await client.query(query, params);
        return result;
      } finally {
        // Giải phóng client về pool, kết thúc kết nối nếu có lỗi
        if (client) {
          client.release(true);
        }
      }
    } catch (error) {
      lastError = error;
      console.error(`Lỗi truy vấn DB (lần thử ${attempt + 1}/${retries + 1}):`, error.message);

      // Kiểm tra xem lỗi có phải lỗi kết nối hoặc timeout hay không
      const isConnectionError = error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.code === '57P01' || // admin shutdown
        error.code === '57014' || // query_canceled
        error.code === '08006' || // connection failure
        error.code === '08003' || // connection does not exist
        error.code === '08004' || // rejected connection
        error.code === '08001' || // unable to connect
        error.code === '08007' || // transaction state unknown
        (error.message && (error.message.includes('timeout') ||
          error.message.includes('terminated')));

      if (isConnectionError && attempt < retries) {
        // Chờ trước khi thử lại (exponential backoff)
        const delay = Math.min(100 * Math.pow(2, attempt), 3000);
        console.log(`Đang thử lại sau ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Nếu đây là lần thử cuối, thêm thông tin chi tiết vào lỗi và ném ra
      if (attempt === retries) {
        console.error('Tất cả lần thử lại cho truy vấn đã thất bại:', query);
        console.error('Lỗi cuối cùng:', lastError);

        const enhancedError = new Error(`Truy vấn DB thất bại sau ${retries + 1} lần thử: ${lastError.message}`);
        enhancedError.originalError = lastError;
        enhancedError.query = query;
        // Giới hạn thông tin tham số cho an toàn
        enhancedError.params = params.map(p => typeof p === 'string' ? p.substring(0, 10) + '...' : p);
        throw enhancedError;
      }

      // Nếu chưa đạt đến lần thử cuối, ném lỗi để chuyển sang vòng lặp thử lại
      throw error;
    }
  }
};

/**
 * Tạo câu lệnh SQL cho phân trang.
 * 
 * @param {number} page - Số trang (mặc định: 1).
 * @param {number} limit - Số kết quả trên mỗi trang (mặc định: 10).
 * @returns {Object} Đối tượng chứa câu lệnh LIMIT, OFFSET và metadata phân trang.
 */
const getPaginationSQL = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  return {
    limitClause: `LIMIT ${limit} OFFSET ${offset}`,
    params: [],
    metadata: {
      page,
      limit,
      offset
    }
  };
};

/**
 * Tạo khóa cache dựa trên các tham số đầu vào.
 * 
 * @param {string} prefix - Tiền tố cho khóa cache.
 * @param {Object} params - Các tham số để tạo khóa cache.
 * @returns {string} Khóa cache đã được định dạng.
 */
const createCacheKey = (prefix, params = {}) => {
  let key = prefix;

  if (Object.keys(params).length > 0) {
    key += '_' + Object.entries(params)
      .map(([k, v]) => `${k}:${v}`)
      .join('_');
  }

  return key;
};

/**
 * Lấy dữ liệu từ cache hoặc thực thi truy vấn nếu không có dữ liệu trong cache.
 * 
 * @param {string} cacheKey - Khóa cache trong Redis.
 * @param {string} query - Câu lệnh SQL cần thực thi nếu không có cache.
 * @param {Array} params - Các tham số cho truy vấn.
 * @param {number} expiry - Thời gian hết hạn của cache (giây, mặc định: 60).
 * @returns {Promise<Object>} Dữ liệu từ cache hoặc kết quả truy vấn từ DB.
 */
const getFromCacheOrExecute = async (cacheKey, query, params = [], expiry = 60) => {
  try {
    // Thử lấy dữ liệu từ cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit cho khóa: ${cacheKey}`);
      return JSON.parse(cachedData);
    }

    // Nếu không có cache, thực thi truy vấn DB
    console.log(`Cache miss cho khóa: ${cacheKey}. Thực thi truy vấn...`);
    const result = await executeQuery(query, params);

    // Lưu kết quả truy vấn vào cache nếu có dữ liệu
    if (result.rows) {
      await redisClient.set(cacheKey, JSON.stringify(result.rows), {
        EX: expiry
      });
    }

    return result.rows;
  } catch (error) {
    console.error('Lỗi trong thao tác cache/DB:', error);
    throw error;
  }
};

/**
 * Xóa các khóa cache trong Redis khớp với một mẫu nhất định.
 * 
 * @param {string} pattern - Mẫu khóa cache cần xóa.
 * @returns {Promise<void>}
 */
const invalidateCache = async (pattern) => {
  try {
    // Sử dụng lệnh SCAN để tìm các khóa cache khớp với mẫu
    let cursor = '0';
    let keys = [];

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });

      cursor = result.cursor;
      keys = keys.concat(result.keys);
    } while (cursor !== '0');

    // Xóa các khóa cache tìm được
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Đã xóa ${keys.length} khóa cache khớp với mẫu: ${pattern}`);
    }
  } catch (error) {
    console.error('Lỗi khi xóa cache:', error);
    throw error;
  }
};

module.exports = {
  executeQuery,
  getPaginationSQL,
  createCacheKey,
  getFromCacheOrExecute,
  invalidateCache
};
