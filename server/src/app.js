const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();
const sequelize = require('./config/database'); 
const redisClient = require('./config/redis');
const citizensRoutes = require('./routes/citizensRoutes');

const app = express();

// Middleware
// Use Helmet to secure headers
app.use(helmet());

// Sanitize user input to prevent NoSQL injection and XSS attacks
app.use(xssClean());
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use(limiter);

// CORS setup
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', // Define allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Parse incoming requests with JSON payloads
app.use(express.json());

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database successfully!');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
};

// Execute database connection test
testConnection();

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

// Handle application shutdown
process.on('SIGINT', async () => {
  try {
    await redisClient.quit();
    console.log('Redis connection closed');
    await pool.end();
    console.log('Pool has ended');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});
