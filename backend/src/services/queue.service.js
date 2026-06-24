const { Queue } = require('bullmq');
const { getQueueConnectionOptions } = require('../config/queue');
const logger = require('../utils/logger');

let connectionOpts;
try {
  connectionOpts = getQueueConnectionOptions();
} catch (err) {
  logger.warn(`⚠️ Redis Connection for queues not configured properly: ${err.message}`);
  connectionOpts = { connection: null };
}

const queues = {};

/**
 * Get or create a BullMQ Queue instance.
 */
const getQueue = (name) => {
  if (queues[name]) return queues[name];

  if (!connectionOpts.connection) {
    logger.warn(`⚠️ Queue connection not initialized. Queue "${name}" cannot process jobs.`);
    return null;
  }

  try {
    queues[name] = new Queue(name, {
      ...connectionOpts,
      defaultJobOptions: {
        removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
        removeOnFail: { count: 500 },     // Keep last 500 failed jobs
      }
    });
    logger.info(`📋 Queue "${name}" initialized successfully`);
    return queues[name];
  } catch (err) {
    logger.error(`❌ Failed to initialize Queue "${name}": ${err.message}`);
    return null;
  }
};

// Initialize the 5 primary queues
const esSyncQueue = getQueue('es-sync');
const itineraryQueue = getQueue('itinerary');
const emailQueue = getQueue('email');
const refreshQueue = getQueue('refresh');
const recQueue = getQueue('recommendation');

/**
 * Add a job to a specific queue.
 *
 * @param {string} queueName - e.g. 'email'
 * @param {string} jobName - e.g. 'send-welcome'
 * @param {Object} data - Payload
 * @param {Object} [opts] - BullMQ options (retry, backoff, etc.)
 */
const addJob = async (queueName, jobName, data, opts = {}) => {
  const queue = queues[queueName];
  if (!queue) {
    logger.error(`❌ Queue "${queueName}" is not initialized.`);
    return null;
  }
  try {
    const job = await queue.add(jobName, data, opts);
    logger.debug(`📥 Job "${jobName}" (#${job.id}) added to queue "${queueName}"`);
    return job;
  } catch (err) {
    logger.error(`❌ Failed to add job to queue "${queueName}": ${err.message}`);
    throw err;
  }
};

module.exports = {
  queues,
  esSyncQueue,
  itineraryQueue,
  emailQueue,
  refreshQueue,
  recQueue,
  addJob,
};
