// backend/src/config/queue.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared BullMQ Redis connection.
//
// BullMQ creates 2 connections per Queue/Worker by default (one for commands,
// one for blocking BRPOP). On a free Redis plan (e.g. Upstash free: 20 max
// connections) this quickly causes "ERR max number of clients reached".
//
// Solution: use a SINGLE shared ioredis connection across all queues and
// workers via BullMQ's `connection` option (passing an ioredis instance rather
// than a config object).  BullMQ will duplicate the connection internally only
// where it must (blocking commands), but callers all share one TCP socket.
// ─────────────────────────────────────────────────────────────────────────────
const logger = require('../utils/logger');

let sharedConnection = null;

/**
 * Returns a singleton ioredis connection suitable for BullMQ.
 * All queues and workers share this one connection.
 */
const getSharedConnection = () => {
  if (sharedConnection) return sharedConnection;

  const url = process.env.REDIS_URL;
  if (!url) {
    logger.error('❌ REDIS_URL not set — BullMQ requires Redis to run');
    throw new Error('REDIS_URL environment variable is required for BullMQ');
  }

  const Redis = require('ioredis');
  sharedConnection = new Redis(url, {
    maxRetriesPerRequest: null,   // Required by BullMQ
    enableReadyCheck:     false,  // Recommended by BullMQ
    enableOfflineQueue:   false,  // Don't queue commands while disconnected
    lazyConnect:          false,
  });

  sharedConnection.on('error', (err) => {
    logger.warn(`[BullMQ Redis] Connection error: ${err.message}`);
  });

  sharedConnection.on('connect', () => {
    logger.info('[BullMQ Redis] Shared connection established');
  });

  return sharedConnection;
};

/**
 * Returns BullMQ-compatible options using the shared connection.
 * Pass the result directly to `new Queue(name, opts)` or `new Worker(name, fn, opts)`.
 */
const getQueueConnectionOptions = () => {
  return {
    connection: getSharedConnection(),
  };
};

module.exports = { getQueueConnectionOptions, getSharedConnection };
