const redis = require('../config/redis');
const logger = require('../utils/logger');

// Local fallback locks map
const localLocks = new Map();

/**
 * Acquire a lock for revalidation to prevent thundering herd.
 */
const acquireLock = async (lockKey, ttlSeconds = 10) => {
  const client = global.__redisClient;
  if (client) {
    try {
      const res = await client.set(lockKey, '1', 'EX', ttlSeconds, 'NX');
      return res === 'OK';
    } catch (err) {
      logger.warn(`[SWR Lock] Redis lock failed for ${lockKey}: ${err.message}`);
    }
  }
  
  const now = Date.now();
  const lockExpires = localLocks.get(lockKey);
  if (lockExpires && lockExpires > now) {
    return false;
  }
  localLocks.set(lockKey, now + ttlSeconds * 1000);
  return true;
};

/**
 * Release the lock.
 */
const releaseLock = async (lockKey) => {
  const client = global.__redisClient;
  if (client) {
    try {
      await client.del(lockKey);
    } catch (err) {
      logger.warn(`[SWR Lock] Redis unlock failed for ${lockKey}: ${err.message}`);
    }
  }
  localLocks.delete(lockKey);
};

/**
 * Wraps data into an SWR envelope.
 */
const wrapEnvelope = (data, freshTTLSeconds, maxTTLSeconds) => {
  const now = Date.now();
  return {
    data,
    cachedAt: now,
    staleAt: now + freshTTLSeconds * 1000,
    expireAt: now + maxTTLSeconds * 1000,
    isSWREnvelope: true, // Marker to easily distinguish from old/raw cache items
  };
};

/**
 * Revalidate cache in background.
 */
const triggerRevalidate = async (key, fetchFn, freshTTLSeconds, maxTTLSeconds) => {
  const lockKey = `tsg:lock:${key}`;
  const locked = await acquireLock(lockKey, 15); // 15s lock
  if (!locked) {
    logger.debug(`[SWR] Revalidation lock already held for key: ${key}`);
    return;
  }

  // Fire async revalidation
  (async () => {
    try {
      logger.info(`[SWR] Background revalidating key: ${key}`);
      const freshData = await fetchFn();
      if (freshData !== undefined && freshData !== null) {
        const envelope = wrapEnvelope(freshData, freshTTLSeconds, maxTTLSeconds);
        await redis.cacheSet(key, envelope, maxTTLSeconds);
        logger.info(`[SWR] Background revalidation successful for key: ${key}`);
      }
    } catch (err) {
      logger.error(`[SWR] Background revalidation failed for key: ${key}: ${err.message}`);
    } finally {
      await releaseLock(lockKey);
    }
  })();
};

module.exports = {
  acquireLock,
  releaseLock,
  wrapEnvelope,
  triggerRevalidate,
};
