/************************************************
 * config/database.js - PostgreSQL connection
 ************************************************/
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,       // e.g. 'postgres'
  host: process.env.DB_HOST,       // e.g. 'localhost'
  database: process.env.DB_DATABASE, 
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,       // 5432 by default
  ssl: {
    require: true,
    rejectUnauthorized: false, // Set to false if using Heroku or similar
  },
  max: 20,                // Max number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test pool connection
pool
  .connect()
  .then(() => console.log('Connected to PostgreSQL via pg Pool!'))
  .catch((err) => console.error('Failed to connect via pg Pool:', err));

module.exports = pool;
