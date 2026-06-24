const mongoose = require('mongoose');

const FailedJobSchema = new mongoose.Schema({
  queueName: {
    type: String,
    required: true,
    index: true,
  },
  jobId: {
    type: String,
    required: true,
  },
  jobName: {
    type: String,
    required: true,
    index: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  failedReason: {
    type: String,
  },
  stacktrace: {
    type: [String],
  },
  failedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  attemptsMade: {
    type: Number,
    required: true,
  },
  retried: {
    type: Boolean,
    default: false,
  },
  retriedAt: {
    type: Date,
  },
  newJobId: {
    type: String,
  }
});

module.exports = mongoose.model('FailedJob', FailedJobSchema);
