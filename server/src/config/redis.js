/************************************************
 * config/redis.js - Redis client connection
 ************************************************/
const redis = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL; 
// e.g. REDIS_URL=127.0.0.1:6379 or 'my-redis-host:6379'
// If you only have host:port, split them
const [host, port] = redisUrl.split(':');

const redisClient = redis.createClient({
  socket: {
    host,
    port,
    connectTimeout: 10000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
  },
  password: process.env.REDIS_PASSWORD, // optional if your redis requires password
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully!');
});

redisClient.on('ready', () => {
  console.log('Redis is ready to use');
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting');
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

module.exports = redisClient;
