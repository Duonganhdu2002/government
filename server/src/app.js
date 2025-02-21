// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const pool = require('./config/database');
const redisClient = require('./config/redis');

// Import routes
const citizensRoutes = require('./routes/citizensRoutes');
const applicationsRoutes = require('./routes/applicationsRoutes');
const applicationTypesRoutes = require('./routes/applicationTypesRoutes');
const agenciesRoutes = require('./routes/agenciesRoutes');
const staffRoutes = require('./routes/staffRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const processingHistoryRoutes = require('./routes/processingHistoryRoutes');
const agencyDelaysRoutes = require('./routes/agencyDelaysRoutes');
const publicNotificationsRoutes = require('./routes/publicNotificationsRoutes');
const areasRoutes = require('./routes/areasRoutes');
const mediaFilesRoutes = require('./routes/mediaFilesRoutes');
const authRoutes = require('./routes/authRoutes'); // Giả sử file authRoutes đã được tạo

const app = express();

/* 
 * Security & Middleware
 */
app.use(helmet());        // Secure HTTP headers
app.use(xssClean());      // Prevent XSS
app.use(mongoSanitize()); // Sanitize against NoSQL injection
app.use(hpp());           // Prevent HTTP parameter pollution

// Rate limiting to mitigate brute force / DDoS
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
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

/* 
 * Routes
 */
app.use('/api/citizens', citizensRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/application-types', applicationTypesRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/processing-history', processingHistoryRoutes);
app.use('/api/agency-delays', agencyDelaysRoutes);
app.use('/api/public-notifications', publicNotificationsRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/media-files', mediaFilesRoutes);
app.use('/api/auth', authRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('Welcome to Secure Express PostgreSQL API');
});

/* 
 * Start the Server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/* 
 * Graceful Shutdown
 */
process.on('SIGINT', async () => {
  try {
    // Close Redis if in use
    await redisClient.quit();
    console.log('Redis connection closed');

    // End PostgreSQL pool connections
    await pool.end();
    console.log('PostgreSQL pool has ended');

    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});
