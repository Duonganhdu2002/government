/**
 * src/app.js
 *
 * Điểm vào chính của API dịch vụ chính phủ.
 * File này khởi tạo ứng dụng Express, thiết lập các middleware bảo mật,
 * cấu hình các route API và xử lý quá trình tắt server an toàn (graceful shutdown).
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
require('dotenv').config();

// Kết nối cơ sở dữ liệu và Redis cache
const pool = require('./config/database');
const redisClient = require('./config/redis');

// Công cụ ghi log
const logger = require('./utils/logger.util');

// Middleware xử lý lỗi
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// Import các route API
const routes = {
  citizens: require('./routes/citizensRoutes'),
  applications: require('./routes/applicationsRoutes'),
  applicationTypes: require('./routes/applicationTypesRoutes'),
  specialApplicationTypes: require('./routes/specialApplicationTypesRoutes'),
  agencies: require('./routes/agenciesRoutes'),
  staff: require('./routes/staffRoutes'),
  notifications: require('./routes/notificationsRoutes'),
  processingHistory: require('./routes/processingHistoryRoutes'),
  agencyDelays: require('./routes/agencyDelaysRoutes'),
  publicNotifications: require('./routes/publicNotificationsRoutes'),
  areas: require('./routes/areasRoutes'),
  mediaFiles: require('./routes/mediaFilesRoutes'),
  mediaPostFiles: require('./routes/mediaPostFilesRoutes'),
  auth: require('./routes/authRoutes'),
  postCategories: require('./routes/postCategoriesRoutes'),
  posts: require('./routes/postRoutes'),
  applicationUpload: require('./routes/applicationUploadRoutes')
};

// Khởi tạo ứng dụng Express
const app = express();

/**
 * Cấu hình Express và thiết lập middleware
 */

// Debug middleware for CORS issues
app.use((req, res, next) => {
  // Log requests to media files to help debug CORS issues
  if (req.url.includes('/uploads/') || req.url.includes('/api/media-files/')) {
    console.log('Media request:', {
      url: req.url,
      method: req.method,
      origin: req.headers.origin || 'Unknown origin',
      referer: req.headers.referer || 'No referer'
    });
  }
  next();
});

// Ghi log thông tin các yêu cầu HTTP
app.use(logger.requestLogger());

// Phục vụ file tĩnh từ thư mục public
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Phục vụ file tĩnh từ thư mục uploads với CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers specifically for media files
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Proceed to static file serving
  next();
}, express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Kiểm tra và tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Log đường dẫn thư mục public để tiện debug
console.log('Đường dẫn thư mục public:', path.join(__dirname, '..', 'public'));

// Thiết lập các middleware bảo mật
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', '*'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", '*']
    }
  }
}));          // Bảo vệ các HTTP header
app.use(xssClean());        // Ngăn chặn tấn công XSS
app.use(mongoSanitize());   // Làm sạch dữ liệu để phòng chống NoSQL injection
app.use(hpp());             // Ngăn chặn HTTP parameter pollution

// Giới hạn tốc độ yêu cầu để phòng chống brute force và DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100000,                 // Mỗi IP tối đa 100 yêu cầu trong 15 phút
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.'
});
app.use(limiter);

// Cấu hình CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    // For development, allow localhost origins with any port
    if (process.env.NODE_ENV === 'development') {
      if (origin.match(/^https?:\/\/localhost:[0-9]+$/)) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf('*') !== -1 || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(null, true); // Temporarily allow all origins while debugging
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 giờ
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Phân tích dữ liệu JSON gửi lên trong body của yêu cầu
app.use(express.json({ limit: '10mb' }));

// Phân tích dữ liệu URL-encoded (dữ liệu từ form)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Cấu hình các route API
 */
app.use('/api/citizens', routes.citizens);
app.use('/api/applications', routes.applications);
app.use('/api/application-types', routes.applicationTypes);
app.use('/api/special-application-types', routes.specialApplicationTypes);
app.use('/api/agencies', routes.agencies);
app.use('/api/staff', routes.staff);
app.use('/api/notifications', routes.notifications);
app.use('/api/processing-history', routes.processingHistory);
app.use('/api/agency-delays', routes.agencyDelays);
app.use('/api/public-notifications', routes.publicNotifications);
app.use('/api/areas', routes.areas);
app.use('/api/media-files', routes.mediaFiles);
app.use('/api/media-post-files', routes.mediaPostFiles);
app.use('/api/auth', routes.auth);
app.use('/api/post-categories', routes.postCategories);
app.use('/api/posts', routes.posts);
app.use('/api/application-upload', routes.applicationUpload);

// Route kiểm tra sức khỏe của API
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Government Services API đang chạy',
    version: '1.0.0'
  });
});

// Route cung cấp tài liệu API
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tài liệu API',
    docs: {
      swagger: '/api-docs',
      description: 'API này cung cấp dịch vụ chính phủ cho công dân'
    }
  });
});

/**
 * Xử lý lỗi
 */

// Middleware xử lý lỗi 404 (route không tồn tại)
app.use(notFoundHandler);

// Middleware xử lý lỗi toàn cục (phải đặt cuối cùng)
app.use(errorHandler);

/**
 * Khởi tạo server
 */
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  logger.info(`Server đang chạy trên cổng ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/**
 * Xử lý tắt server an toàn (graceful shutdown)
 * Đảm bảo đóng các kết nối cơ sở dữ liệu và cache khi ứng dụng dừng hoạt động
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} đã được nhận. Bắt đầu tắt server an toàn...`);

  // Đóng HTTP server
  server.close(() => {
    logger.info('HTTP server đã được đóng');
  });

  try {
    // Đóng kết nối Redis
    await redisClient.quit();
    logger.info('Đóng kết nối Redis thành công');

    // Đóng kết nối PostgreSQL pool
    await pool.end();
    logger.info('Đóng kết nối PostgreSQL thành công');

    process.exit(0);
  } catch (err) {
    logger.error('Lỗi khi tắt server:', { error: err.message, stack: err.stack });
    process.exit(1);
  }
};

// Lắng nghe các tín hiệu dừng server (SIGINT, SIGTERM)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Xử lý ngoại lệ không bắt được (uncaught exceptions)
process.on('uncaughtException', (err) => {
  logger.error('Ngoại lệ không bắt được:', { error: err.message, stack: err.stack });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Xử lý promise bị từ chối mà không được xử lý (unhandled promise rejections)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise bị từ chối mà không xử lý:', { reason, promise });
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app; // Xuất app để sử dụng cho mục đích test
