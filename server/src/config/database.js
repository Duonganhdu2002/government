// config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    require: true,
    rejectUnauthorized: false, // Set to false if using Heroku or similar
  },
  max: 20, // Max number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool
  .connect()
  .then(() => console.log('Connected to PostgreSQL via pg Pool!'))
  .catch((err) => console.error('Failed to connect via pg Pool:', err));

module.exports = pool;
