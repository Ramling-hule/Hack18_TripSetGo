const logger = require('../utils/logger');

// Connection options required by BullMQ
const redisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,    // Recommended by BullMQ
};

const getQueueConnectionOptions = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.error('❌ REDIS_URL not set — BullMQ requires Redis to run');
    throw new Error('REDIS_URL environment variable is required for BullMQ');
  }

  // Parse connection URL
  return {
    connection: {
      url,
      ...redisOptions
    }
  };
};

module.exports = { getQueueConnectionOptions };
