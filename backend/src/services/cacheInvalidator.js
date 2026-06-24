const logger = require('../utils/logger');
const cacheService = require('./cache.service');

/**
 * Handle invalidation on write events.
 *
 * @param {string} event - The entity type (e.g. 'hotel', 'restaurant', 'attraction', 'trip', 'review')
 * @param {Object} [meta] - Optional metadata (e.g. ID of modified document)
 */
const invalidateOnWrite = async (event, meta = {}) => {
  try {
    logger.info(`[CacheInvalidator] Invalidating cache for event: "${event}"`);

    switch (event) {
      case 'hotel':
        await cacheService.delPattern('tsg:hotel:*');
        await cacheService.delPattern('tsg:search:hotels:*');
        break;

      case 'restaurant':
        await cacheService.delPattern('tsg:restaurant:*');
        await cacheService.delPattern('tsg:search:restaurants:*');
        break;

      case 'attraction':
        await cacheService.delPattern('tsg:attraction:*');
        await cacheService.delPattern('tsg:search:attractions:*');
        break;

      case 'trip':
        await cacheService.delPattern('tsg:feed:*');
        await cacheService.delPattern('tsg:trending:*');
        break;

      case 'review':
        // Flush search keys
        await cacheService.delPattern('tsg:search:*');
        if (meta.entityType && meta.entityId) {
          // Flush the specific entity detail key
          const key = `tsg:${meta.entityType}:detail:${meta.entityId}`;
          await cacheService.del(key);
          logger.info(`[CacheInvalidator] Specific entity detail flushed: ${key}`);
        }
        break;

      default:
        logger.warn(`[CacheInvalidator] Unhandled invalidation event: "${event}"`);
    }
  } catch (err) {
    logger.error(`[CacheInvalidator] Invalidation failed for event "${event}": ${err.message}`);
  }
};

/**
 * Register cache invalidation hooks on a Mongoose schema before compilation.
 *
 * @param {mongoose.Schema} schema - The Mongoose schema to hook
 * @param {string} event - The entity type ('hotel', 'restaurant', 'attraction', 'review', 'trip')
 */
const registerCacheInvalidationSchemaHooks = (schema, event) => {
  // Register save
  schema.post('save', async function (doc) {
    let meta = {};
    if (event === 'review' && doc.targetType && doc.targetId) {
      meta = {
        entityType: doc.targetType.toLowerCase(),
        entityId: doc.targetId.toString()
      };
    }
    invalidateOnWrite(event, meta);
  });

  // Register findOneAndUpdate
  schema.post('findOneAndUpdate', async function (doc) {
    if (!doc) return;
    let meta = {};
    if (event === 'review' && doc.targetType && doc.targetId) {
      meta = {
        entityType: doc.targetType.toLowerCase(),
        entityId: doc.targetId.toString()
      };
    }
    invalidateOnWrite(event, meta);
  });

  // Register deleteOne
  schema.post('deleteOne', { document: true, query: false }, async function (doc) {
    invalidateOnWrite(event);
  });

  // Register findOneAndDelete
  schema.post('findOneAndDelete', async function (doc) {
    if (!doc) return;
    invalidateOnWrite(event);
  });
};

const registerCacheInvalidationHooks = () => {
  logger.info('🔁 Cache invalidation hooks registered on Mongoose models');
};

module.exports = {
  invalidateOnWrite,
  registerCacheInvalidationSchemaHooks,
  registerCacheInvalidationHooks
};
