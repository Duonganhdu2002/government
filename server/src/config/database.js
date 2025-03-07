/************************************************
 * config/database.js - PostgreSQL connection
 ************************************************/
const { Pool } = require('pg');
require('dotenv').config();

// Determine SSL configuration based on environment
const getSslConfig = () => {
  const sslMode = process.env.DB_SSL || 'true';
  
  if (sslMode.toLowerCase() === 'false') {
    return false;
  }
  
  return {
    require: true,
    rejectUnauthorized: false // Set to false if using Heroku, Aiven, or similar cloud databases
  };
};

// Create a new pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: getSslConfig(),
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
});

// Test pool connection and log detailed error information
pool
  .connect()
  .then(client => {
    console.log('Connected to PostgreSQL via pg Pool!');
    console.log(`Database: ${process.env.DB_DATABASE} at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    client.release();
  })
  .catch((err) => {
    console.error('Failed to connect via pg Pool:', err);
    console.error('Connection details (sanitized):');
    console.error(`- Host: ${process.env.DB_HOST}`);
    console.error(`- Port: ${process.env.DB_PORT}`);
    console.error(`- Database: ${process.env.DB_DATABASE}`);
    console.error(`- SSL enabled: ${process.env.DB_SSL !== 'false'}`);
  });

// Add event handlers for pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

module.exports = pool;
