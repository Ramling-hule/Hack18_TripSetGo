// server/src/services/es.sync.js
// ─────────────────────────────────────────────────────────────────────────────
// Mongoose post-hook sync: keeps Elasticsearch in sync via background BullMQ jobs.
// ─────────────────────────────────────────────────────────────────────────────
const logger = require('../utils/logger')
const queueService = require('./queue.service')

const {
  INDICES,
  shapeHotel,
  shapeRestaurant,
  shapeAttraction,
  shapeReview,
} = require('./elasticsearch.service')

// ── Generic hook factory ─────────────────────────────────────────────────────

/**
 * Register post-save and post-remove hooks on a Mongoose schema to queue ES jobs.
 *
 * @param {mongoose.Schema} schema  - The schema to patch
 * @param {string}          index   - Target ES index name (from INDICES)
 * @param {Function}        shaper  - (mongoDoc) => esBody
 */
const registerSyncHooks = (schema, index, shaper) => {
  const addSyncJob = async (action, id, doc) => {
    try {
      await queueService.addJob('es-sync', 'sync-doc', {
        action,
        index,
        id,
        doc
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      });
    } catch (err) {
      logger.error(`[ES Sync] Failed to queue sync job for ${index}/${id}: ${err.message}`);
    }
  };

  // ── post save (create + update) ────────────────────────────────────────
  schema.post('save', async function (doc) {
    const shaped = shaper(doc.toObject ? doc.toObject() : doc);
    await addSyncJob('index', doc._id.toString(), shaped);
  })

  // ── post findOneAndUpdate ──────────────────────────────────────────────
  schema.post('findOneAndUpdate', async function (doc) {
    if (!doc) return
    const shaped = shaper(doc.toObject ? doc.toObject() : doc);
    await addSyncJob('index', doc._id.toString(), shaped);
  })

  // ── post remove (Mongoose 6+ doc.deleteOne()) ──────────────────────────
  schema.post('deleteOne', { document: true, query: false }, async function (doc) {
    await addSyncJob('delete', doc._id.toString(), null);
  })

  // ── post findOneAndDelete ──────────────────────────────────────────────
  schema.post('findOneAndDelete', async function (doc) {
    if (!doc) return
    await addSyncJob('delete', doc._id.toString(), null);
  })
}

module.exports = {
  registerSyncHooks,
  INDICES,
  shapeHotel,
  shapeRestaurant,
  shapeAttraction,
  shapeReview
};

