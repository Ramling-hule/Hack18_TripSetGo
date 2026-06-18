// server/src/models/UserActivity.model.js
// ─────────────────────────────────────────────────────────────────────────────
// Lightweight event log for tracking user interactions.
// Used by the recommendation engine to build user profiles, compute trending
// scores, and power the "recently viewed" feature.
//
// A TTL index auto-expires documents after 90 days to keep the collection lean.
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose')

const userActivitySchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },
  action: {
    type:     String,
    enum:     ['view', 'search', 'bookmark', 'review', 'trip_create', 'trip_clone'],
    required: true,
  },
  targetType: {
    type: String,
    enum: ['Hotel', 'Restaurant', 'Attraction', 'Trip'],
    default: null,
  },
  targetId: {
    type:    mongoose.Schema.Types.ObjectId,
    default: null,
  },
  metadata: {
    type:    mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type:    Date,
    default: Date.now,
  },
})

// ── Indexes ──────────────────────────────────────────────────────────────────

// Primary query pattern: fetch a user's recent activity
userActivitySchema.index({ userId: 1, action: 1, timestamp: -1 })

// Trending aggregation: group by target across all users within a time window
userActivitySchema.index({ targetType: 1, targetId: 1, timestamp: -1 })

// Action-based queries for trending computation
userActivitySchema.index({ action: 1, timestamp: -1 })

// TTL index: auto-delete documents older than 90 days
userActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

module.exports = mongoose.model('UserActivity', userActivitySchema)
