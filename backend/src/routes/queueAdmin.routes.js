const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { queues } = require('../services/queue.service');

const serverAdapter = new ExpressAdapter();
// Ensure base path matches where it is mounted (Express router + sub-path)
serverAdapter.setBasePath('/api/v1/admin/queues');

const adaptedQueues = Object.entries(queues)
  .filter(([_, q]) => q !== null && q !== undefined)
  .map(([_, q]) => new BullMQAdapter(q));

createBullBoard({
  queues: adaptedQueues,
  serverAdapter: serverAdapter,
});

module.exports = serverAdapter.getRouter();
