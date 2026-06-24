const { Worker } = require('bullmq');
const { getQueueConnectionOptions } = require('../config/queue');
const { computeTrending } = require('../services/recommendation.service');
const { logFailedJob } = require('../services/dlq.service');
const logger = require('../utils/logger');

const processor = async (job) => {
  logger.info(`[Recommendation Worker] Processing job ${job.id} - running computeTrending`);
  await computeTrending();
};

const initWorker = () => {
  const connectionOpts = getQueueConnectionOptions();
  const worker = new Worker('recommendation', processor, {
    ...connectionOpts,
    concurrency: 1,
  });

  worker.on('completed', (job) => {
    logger.info(`[Recommendation Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Recommendation Worker] Job ${job.id} failed: ${err.message}`);
    if (job) {
      logFailedJob('recommendation', job, err);
    }
  });

  return worker;
};

module.exports = { initWorker };
