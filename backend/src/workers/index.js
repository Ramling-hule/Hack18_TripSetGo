const logger = require('../utils/logger');
const esSyncWorker = require('./esSync.worker');
const itineraryWorker = require('./itinerary.worker');
const emailWorker = require('./email.worker');
const refreshWorker = require('./refresh.worker');
const recommendationWorker = require('./recommendation.worker');

let initialized = false;
const activeWorkers = [];

const startWorkers = () => {
  if (initialized) return;

  if (process.env.RUN_WORKERS === 'false') {
    logger.info('ℹ️ Workers disabled via RUN_WORKERS=false environment variable');
    return;
  }

  logger.info('🚀 Initializing BullMQ background workers...');

  try {
    activeWorkers.push(
      esSyncWorker.initWorker(),
      itineraryWorker.initWorker(),
      emailWorker.initWorker(),
      refreshWorker.initWorker(),
      recommendationWorker.initWorker()
    );
    initialized = true;
    logger.info('✅ All background workers started successfully');
  } catch (err) {
    logger.error(`❌ Failed to initialize workers: ${err.message}`);
  }
};

module.exports = { startWorkers, activeWorkers };
