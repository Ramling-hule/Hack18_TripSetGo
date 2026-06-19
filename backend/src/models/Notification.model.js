
const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Notification event type
  type: {
    type: String,
    enum: [
      // Legacy / social
      'like',
      'comment',
      'follow',
      'system',
      'system_alert',
      'price_drop',

      // Collaboration
      'trip_invite',

      // ── NEW: Notification Service Events ──────────────────────────────
      'trip_shared',       // Owner shared a trip publicly
      'new_review',        // Someone posted a review on a place in your trip
      'itinerary_updated', // A collaborator updated the itinerary
    ],
    required: true,
  },

  message:   { type: String, required: true },
  isRead:    { type: Boolean, default: false, index: true },
  targetUrl: { type: String },

  // Flexible metadata: tripId, actorId, reviewId, dayNum, etc.
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },

  // The user who triggered the event (optional)
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Which channels were already sent (prevents duplicate sends on retry)
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
  },
}, { timestamps: true })

// Compound index: fetch unread notifications for a user in reverse-chron order
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
