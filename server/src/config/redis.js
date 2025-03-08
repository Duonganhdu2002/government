/**
 * redis.js
 * 
 * Cấu hình kết nối Redis dùng cho caching.
 * Bao gồm cấu hình kết nối, xử lý lỗi và fallback sang mock client nếu không thể kết nối.
 */

const { createClient } = require('redis');
require('dotenv').config();

/**
 * Hàm định dạng URL cho Redis.
 * - Nếu đã có URL đầy đủ bắt đầu bằng "redis://" hoặc "rediss://", sử dụng trực tiếp.
 * - Nếu chỉ cung cấp host:port, hoặc các thành phần riêng, xây dựng URL dựa theo đó.
 * - Thêm thông tin xác thực nếu có mật khẩu.
 *
 * @param {string} url - URL Redis từ biến môi trường hoặc các thành phần riêng.
 * @param {string} host - Địa chỉ host Redis.
 * @param {string} port - Cổng Redis.
 * @param {string} password - Mật khẩu Redis.
 * @returns {string} URL Redis đã được định dạng đúng.
 */
const formatRedisUrl = (url, host, port, password) => {
  // Nếu URL đầy đủ được cung cấp và hợp lệ, sử dụng luôn URL đó
  if (url && (url.startsWith('redis://') || url.startsWith('rediss://'))) {
    return url;
  }
  
  // Nếu url ở dạng "host:port" được cung cấp
  if (url && url.includes(':')) {
    const [hostPart, portPart] = url.split(':');
    host = hostPart || host;
    port = portPart || port;
  }
  
  // Đặt giá trị mặc định nếu chưa có
  host = host || 'localhost';
  port = port || '6379';
  
  // Xây dựng URL cơ bản
  let formattedUrl = `redis://${host}:${port}`;
  
  // Nếu có mật khẩu, thêm phần xác thực vào URL
  if (password) {
    formattedUrl = `redis://:${encodeURIComponent(password)}@${host}:${port}`;
  }
  
  return formattedUrl;
};

// Định dạng URL Redis dựa trên biến môi trường
const redisUrl = formatRedisUrl(
  process.env.REDIS_URL,
  process.env.REDIS_HOST,
  process.env.REDIS_PORT,
  process.env.REDIS_PASSWORD
);

// Khai báo biến redisClient để lưu đối tượng client
let redisClient;

/**
 * Hàm tạo một mock Redis client.
 * - Sử dụng khi không thể kết nối tới Redis thật để không làm gián đoạn ứng dụng.
 * - Cung cấp giao diện tương tự như client thật nhưng dùng bộ nhớ trong.
 *
 * @returns {Object} Mock Redis client
 */
const createMockRedisClient = () => {
  console.warn('Using mock Redis client - caching disabled');
  
  // Sử dụng Map để lưu trữ dữ liệu in-memory
  const store = new Map();
  
  return {
    connect: async () => Promise.resolve(),
    get: async (key) => store.get(key) || null,
    set: async (key, value, options = {}) => {
      store.set(key, value);
      // Nếu có tùy chọn hết hạn, xóa key sau khoảng thời gian quy định (giây)
      if (options.EX) {
        setTimeout(() => store.delete(key), options.EX * 1000);
      }
      return 'OK';
    },
    del: async (keys) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      let deleted = 0;
      for (const key of keysArray) {
        if (store.delete(key)) deleted++;
      }
      return deleted;
    },
    scan: async (cursor, options = {}) => {
      const keys = Array.from(store.keys());
      return { cursor: '0', keys };
    },
    quit: async () => Promise.resolve('OK'),
    on: (event, listener) => {} // Giả lập các sự kiện mà không thực hiện gì
  };
};

try {
  /**
   * Tạo và cấu hình Redis client với các tùy chọn thích hợp.
   */
  redisClient = createClient({
    url: redisUrl,
    socket: {
      // Thiết lập chiến lược kết nối lại theo exponential backoff (tối đa 10 giây)
      reconnectStrategy: (retries) => {
        const delay = Math.min(Math.pow(2, retries) * 100, 10000);
        return delay;
      },
      connectTimeout: 5000, // Thời gian chờ kết nối: 5 giây
    },
  });

  // Xử lý lỗi kết nối của Redis client
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  // Log thông báo khi kết nối thành công
  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  // Log thông báo khi đang kết nối lại
  redisClient.on('reconnecting', () => {
    console.log('Redis client reconnecting...');
  });

  // Thực hiện kết nối đến Redis (là hàm async)
  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      // Nếu không kết nối được, thay thế bằng mock client
      redisClient = createMockRedisClient();
    }
  })();
} catch (error) {
  console.error('Error creating Redis client:', error);
  // Nếu có lỗi khi tạo client, sử dụng mock client làm fallback
  redisClient = createMockRedisClient();
}

/**
 * Tạo đối tượng enhancedRedisClient với các hàm bọc xử lý lỗi cho các thao tác Redis.
 */
const enhancedRedisClient = {
  /**
   * Lấy giá trị từ cache dựa trên key.
   *
   * @param {string} key - Khóa cache.
   * @returns {Promise<string|null>} Giá trị cache hoặc null nếu không tồn tại.
   */
  get: async (key) => {
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.error(`Redis get error for key "${key}":`, err);
      return null;
    }
  },

  /**
   * Đặt giá trị vào cache với key xác định.
   *
   * @param {string} key - Khóa cache.
   * @param {string} value - Giá trị cần lưu.
   * @param {Object} options - Các tùy chọn cho lệnh SET của Redis.
   * @returns {Promise<string|null>} Phản hồi của Redis hoặc null nếu có lỗi.
   */
  set: async (key, value, options = {}) => {
    try {
      return await redisClient.set(key, value, options);
    } catch (err) {
      console.error(`Redis set error for key "${key}":`, err);
      return null;
    }
  },

  /**
   * Xóa key (hoặc mảng key) khỏi cache.
   *
   * @param {string|string[]} keys - Khóa hoặc mảng khóa cần xóa.
   * @returns {Promise<number|null>} Số lượng key đã bị xóa hoặc null nếu có lỗi.
   */
  del: async (keys) => {
    try {
      return await redisClient.del(keys);
    } catch (err) {
      console.error(`Redis del error for key(s) "${keys}":`, err);
      return null;
    }
  },

  /**
   * Duyệt (scan) các key trong Redis theo mẫu.
   *
   * @param {string} cursor - Con trỏ Redis.
   * @param {Object} options - Các tùy chọn cho lệnh SCAN.
   * @returns {Promise<Object|null>} Kết quả scan hoặc null nếu có lỗi.
   */
  scan: async (cursor, options = {}) => {
    try {
      return await redisClient.scan(cursor, options);
    } catch (err) {
      console.error(`Redis scan error:`, err);
      return { cursor: '0', keys: [] };
    }
  },

  /**
   * Ngắt kết nối Redis.
   *
   * @returns {Promise<string|null>} Phản hồi của Redis hoặc null nếu có lỗi.
   */
  quit: async () => {
    try {
      return await redisClient.quit();
    } catch (err) {
      console.error('Redis quit error:', err);
      return null;
    }
  }
};

// Xuất đối tượng enhancedRedisClient để sử dụng trong toàn ứng dụng
module.exports = enhancedRedisClient;
