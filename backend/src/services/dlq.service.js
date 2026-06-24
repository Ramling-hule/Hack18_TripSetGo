const FailedJob = require('../models/FailedJob.model');
const queueService = require('./queue.service');
const logger = require('../utils/logger');

/**
 * Log a failed job to the MongoDB Dead Letter Queue collection.
 * Only logs if the job has exhausted its max attempt count.
 */
const logFailedJob = async (queueName, job, err) => {
  try {
    const maxAttempts = job.opts.attempts || 1;
    if (job.attemptsMade < maxAttempts) {
      logger.debug(`[DLQ] Job ${job.id} failed in "${queueName}" but will retry (${job.attemptsMade}/${maxAttempts})`);
      return;
    }

    logger.error(`[DLQ] Job ${job.id} in "${queueName}" exhausted all retries. Logging to MongoDB DLQ.`);

    await FailedJob.create({
      queueName,
      jobId: job.id,
      jobName: job.name,
      data: job.data,
      failedReason: err.message,
      stacktrace: job.stacktrace && job.stacktrace.length ? job.stacktrace : [err.stack].filter(Boolean),
      attemptsMade: job.attemptsMade,
    });
  } catch (dbErr) {
    logger.error(`[DLQ] Failed to write failed job to DB: ${dbErr.message}`);
  }
};

/**
 * Re-queue a failed job from the Dead Letter Queue.
 */
const retryFailedJob = async (failedJobId) => {
  const failedJob = await FailedJob.findById(failedJobId);
  if (!failedJob) {
    throw new Error('Failed job record not found');
  }

  if (failedJob.retried) {
    throw new Error('This failed job has already been retried');
  }

  logger.info(`[DLQ] Retrying job "${failedJob.jobName}" from queue "${failedJob.queueName}" (DLQ Ref: ${failedJobId})`);

  // Add the job back to the queue using original configurations
  const newJob = await queueService.addJob(
    failedJob.queueName,
    failedJob.jobName,
    failedJob.data,
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    }
  );

  if (newJob) {
    failedJob.retried = true;
    failedJob.retriedAt = new Date();
    failedJob.newJobId = newJob.id;
    await failedJob.save();
    return newJob;
  }

  throw new Error('Failed to re-queue job');
};

module.exports = {
  logFailedJob,
  retryFailedJob,
};
