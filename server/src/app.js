/**********************************************
 * server.js - Clean Version
 **********************************************/

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
const citizensRoutes = require('./routes/citizensRoutes');

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
