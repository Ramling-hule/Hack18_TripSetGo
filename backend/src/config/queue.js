const logger = require('../utils/logger');

// Connection options required by BullMQ
const redisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,    // Recommended by BullMQ
};

const IORedis = require('ioredis');
let sharedConnection;

const getQueueConnectionOptions = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.error('❌ REDIS_URL not set — BullMQ requires Redis to run');
    throw new Error('REDIS_URL environment variable is required for BullMQ');
  }

  if (!sharedConnection) {
    sharedConnection = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    });
    sharedConnection.on('error', (err) => {
      logger.warn(`⚠️  BullMQ Redis error: ${err.message}`);
    });
  }

  return {
    connection: sharedConnection
  };
};

const closeQueueConnection = async () => {
  if (sharedConnection) {
    await sharedConnection.quit();
    sharedConnection = null;
  }
};

module.exports = { getQueueConnectionOptions, closeQueueConnection };
