const redis = require('redis');

// Connect to redis
const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redisClient.on('connect', function() {
    console.log('Successfully connected to Redis server');
});

module.exports = redisClient;
