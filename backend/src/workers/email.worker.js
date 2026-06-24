const { Worker } = require('bullmq');
const { getQueueConnectionOptions } = require('../config/queue');
const emailService = require('../services/email.service');
const { logFailedJob } = require('../services/dlq.service');
const logger = require('../utils/logger');

const processor = async (job) => {
  const { type, email, name, otp, opts } = job.data;
  logger.info(`[Email Worker] Processing job ${job.id} - Type: ${type}, To: ${email}`);

  switch (type) {
    case 'otp':
      await emailService.sendOTP(email, name, otp);
      break;
    case 'password_reset_otp':
      await emailService.sendPasswordResetOTP(email, name, otp);
      break;
    case 'trip_shared':
      await emailService.sendTripSharedEmail(email, name, opts);
      break;
    case 'new_review':
      await emailService.sendNewReviewEmail(email, name, opts);
      break;
    case 'itinerary_updated':
      await emailService.sendItineraryUpdatedEmail(email, name, opts);
      break;
    default:
      throw new Error(`Unsupported email type: ${type}`);
  }
};

const initWorker = () => {
  const connectionOpts = getQueueConnectionOptions();
  const worker = new Worker('email', processor, {
    ...connectionOpts,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.debug(`[Email Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Email Worker] Job ${job.id} failed: ${err.message}`);
    if (job) {
      logFailedJob('email', job, err);
    }
  });

  return worker;
};

module.exports = { initWorker };
