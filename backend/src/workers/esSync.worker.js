const { Worker } = require('bullmq');
const { getQueueConnectionOptions } = require('../config/queue');
const { indexDocument, deleteDocument } = require('../services/elasticsearch.service');
const { logFailedJob } = require('../services/dlq.service');
const logger = require('../utils/logger');

const processor = async (job) => {
  const { action, index, id, doc } = job.data;
  logger.info(`[ES Worker] Processing job ${job.id} (Index: ${index}, ID: ${id}, Action: ${action})`);

  if (action === 'index') {
    await indexDocument(index, id, doc);
  } else if (action === 'delete') {
    await deleteDocument(index, id);
  } else {
    throw new Error(`Unsupported action type: ${action}`);
  }
};

const initWorker = () => {
  const connectionOpts = getQueueConnectionOptions();
  const worker = new Worker('es-sync', processor, {
    ...connectionOpts,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.debug(`[ES Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[ES Worker] Job ${job.id} failed: ${err.message}`);
    if (job) {
      logFailedJob('es-sync', job, err);
    }
  });

  return worker;
};

module.exports = { initWorker };
