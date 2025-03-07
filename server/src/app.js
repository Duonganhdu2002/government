/**
 * app.js
 * 
 * Main application entry point for the government services API
 * This file initializes the Express application, sets up middleware,
 * configures routes, and handles graceful shutdown.
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

// Database & cache connections
const pool = require('./config/database');
const redisClient = require('./config/redis');

// Utilities
const logger = require('./utils/logger.util');

// Error handling middleware
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// Import routes
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
  posts: require('./routes/postRoutes')
};

const app = express();

/**
 * Express Configuration & Middleware Setup
 */

// Request logging
app.use(logger.requestLogger());

// Static file serving
app.use('/public', express.static(path.join(__dirname, 'public')));

// Thêm thông tin log để dễ debug
console.log('Public directory path:', path.join(__dirname, 'public'));

// Security middleware
app.use(helmet());        // Secure HTTP headers
app.use(xssClean());      // Prevent XSS attacks
app.use(mongoSanitize()); // Sanitize against NoSQL injection
app.use(hpp());           // Prevent HTTP parameter pollution

// Rate limiting to mitigate brute force / DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Accept'],
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
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

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Government Services API is running',
    version: '1.0.0'
  });
});

// API documentation route
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API documentation',
    docs: {
      swagger: '/api-docs',
      description: 'This API provides government services for citizens'
    }
  });
});

/**
 * Error Handling
 */
// Handle 404 errors for routes not found
app.use(notFoundHandler);

// Global error handler - must be the last middleware
app.use(errorHandler);

/**
 * Server Initialization
 */
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/**
 * Graceful Shutdown Handler
 * Properly closes database connections when the application is terminated
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  try {
    // Close Redis connection
    await redisClient.quit();
    logger.info('Redis connection closed');

    // End PostgreSQL pool connections
    await pool.end();
    logger.info('PostgreSQL pool has ended');

    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', { error: err.message, stack: err.stack });
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', { error: err.message, stack: err.stack });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app; // Export for testing purposes
