// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const pool = require('./config/database');
const redisClient = require('./config/redis'); // optional if using Redis
const citizensRoutes = require('./routes/citizensRoutes');

const app = express();

// Use Helmet to secure headers
app.use(helmet());

// Sanitize user input to prevent NoSQL injection and XSS attacks
app.use(xssClean());
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use(limiter);

// CORS setup
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Parse incoming JSON
app.use(express.json());

// Routes
app.use('/api/citizens', citizensRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to Secure Express PostgreSQL API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    // Quit Redis if you're using it
    await redisClient.quit();
    console.log('Redis connection closed');

    // End PG Pool
    await pool.end();
    console.log('PostgreSQL pool has ended');

    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});
