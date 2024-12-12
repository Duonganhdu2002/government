const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');
const redisClient = require('./config/redis');

const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully!');
    client.release();
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
};

// Execute database connection test
testConnection();

// Routes
app.use('/api/users', userRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to Express PostgreSQL API');
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