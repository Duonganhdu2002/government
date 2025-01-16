const redis = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL;
const [host, port] = redisUrl.split(':');

const redisClient = redis.createClient({
  socket: {
    host: host,
    port: port,
    connectTimeout: 10000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  },
  password: process.env.REDIS_PASSWORD
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