

const Notification = require('../models/Notification.model')
const User         = require('../models/User.model')
const queueService = require('./queue.service')
const logger       = require('../utils/logger')

// ── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Persist a Notification document and emit it via Socket.io to the recipient
 * (if they are online). This is the shared "inner loop" for all event types.
 *
 * @param {object} params
 * @param {string}  params.userId      - Recipient user ObjectId (string)
 * @param {string}  params.type        - Notification type enum value
 * @param {string}  params.message     - Human-readable notification message
 * @param {string}  [params.targetUrl] - Deep-link URL (optional)
 * @param {object}  [params.meta]      - Extra metadata (tripId, reviewId, etc.)
 * @param {string}  [params.actor]     - Actor user ObjectId (string)
 * @param {boolean} [params.emailSent] - Mark email channel as sent?
 * @param {object}  params.io          - Socket.io Server instance
 * @param {Map}     params.activeUsers - Map<userId, socketId>
 * @returns {Promise<object>} Created Notification document
 */
const _createAndEmit = async ({
  userId,
  type,
  message,
  targetUrl,
  meta = {},
  actor = null,
  emailSent = false,
  io,
  activeUsers,
}) => {
  // 1. Persist to DB
  const notification = await Notification.create({
    userId,
    type,
    message,
    targetUrl,
    meta,
    actor,
    channels: { inApp: true, email: emailSent },
  })

  // 2. Real-time push (if recipient is online)
  const socketId = activeUsers.get(userId.toString())
  if (socketId) {
    io.to(socketId).emit('notification', {
      _id:       notification._id,
      userId,
      type,
      message,
      targetUrl,
      meta,
      actor,
      isRead:    false,
      createdAt: notification.createdAt,
    })
  }

  return notification
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * EVENT: trip_shared
 * Fires when a trip owner makes their trip public via the share endpoint.
 *
 * Who is notified: all accepted collaborators on the trip.
 * Channels: in-app (real-time socket) + email
 *
 * @param {object} params
 * @param {object} params.trip        - Mongoose Trip document (populated)
 * @param {object} params.actor       - Mongoose User document (trip owner)
 * @param {string} params.shareUrl    - The generated public URL
 * @param {object} params.io          - Socket.io Server instance
 * @param {Map}    params.activeUsers - Map<userId, socketId>
 */
exports.notifyTripShared = async ({ trip, actor, shareUrl, io, activeUsers }) => {
  try {
    // Collect accepted collaborators (exclude the owner themselves)
    const recipients = trip.collaborators.filter(
      (c) => c.status === 'accepted' && !c.userId.equals(actor._id)
    )

    if (recipients.length === 0) return

    // Fetch recipient user documents for email details
    const userIds = recipients.map((c) => c.userId)
    const users   = await User.find({ _id: { $in: userIds } }).lean()

    await Promise.all(
      users.map(async (user) => {
        const message  = `${actor.name} shared the trip to ${trip.destination} publicly`
        const targetUrl = shareUrl

        // In-app + DB
        await _createAndEmit({
          userId: user._id,
          type: 'trip_shared',
          message,
          targetUrl,
          meta:  { tripId: trip._id, destination: trip.destination, shareUrl },
          actor: actor._id,
          emailSent: true,
          io,
          activeUsers,
        })

        // Email channel
        queueService.addJob('email', 'send', {
          type: 'trip_shared',
          email: user.email,
          name: user.name,
          opts: {
            actorName:   actor.name,
            destination: trip.destination,
            shareUrl,
            startDate:   trip.startDate,
            endDate:     trip.endDate,
          }
        }, {
          attempts: 5,
          backoff: { type: 'exponential', delay: 10000 }
        }).catch(err => logger.error(`[NotifService] Failed to queue trip shared email: ${err.message}`))

        logger.info(`[Notif] trip_shared → user ${user._id} (email + socket)`)
      })
    )
  } catch (err) {
    logger.error(`[Notif] notifyTripShared failed: ${err.message}`)
  }
}

/**
 * EVENT: new_review
 * Fires when a user submits a review for a place (Hotel/Restaurant/Attraction).
 * Notifies all trip owners whose itinerary contains that place.
 *
 * Channels: in-app (real-time socket) + email
 *
 * @param {object} params
 * @param {object} params.review      - Mongoose Review document (just created)
 * @param {object} params.actor       - Mongoose User document (reviewer)
 * @param {object} params.placeName   - Display name of the reviewed place
 * @param {object} params.io          - Socket.io Server instance
 * @param {Map}    params.activeUsers - Map<userId, socketId>
 */
exports.notifyNewReview = async ({ review, actor, placeName, io, activeUsers }) => {
  try {
    const Trip = require('../models/Trip.model')

    // Find trips that contain this place in their itinerary
    const affectedTrips = await Trip.find({
      'itinerary.activities': {
        $elemMatch: {
          targetType: review.targetType,
          targetId:   review.targetId,
        },
      },
    })
      .select('userId destination _id')
      .lean()

    if (affectedTrips.length === 0) return

    // Deduplicate owners (a user may own multiple matching trips)
    const ownerIds = [...new Set(affectedTrips.map((t) => t.userId.toString()))]
    const owners   = await User.find({ _id: { $in: ownerIds } }).lean()

    await Promise.all(
      owners.map(async (owner) => {
        // Don't notify the reviewer themselves
        if (owner._id.toString() === actor._id.toString()) return

        // Pick the first matching trip for the deep-link
        const relatedTrip = affectedTrips.find((t) => t.userId.toString() === owner._id.toString())
        const targetUrl   = `${process.env.CLIENT_URL || 'http://localhost:3000'}/trips/${relatedTrip._id}`

        const message = `${actor.name} left a ${review.rating}★ review on ${placeName} — a spot in your trip to ${relatedTrip.destination}`

        // In-app + DB
        await _createAndEmit({
          userId: owner._id,
          type:   'new_review',
          message,
          targetUrl,
          meta: {
            reviewId:   review._id,
            targetType: review.targetType,
            targetId:   review.targetId,
            placeName,
            rating:     review.rating,
            tripId:     relatedTrip._id,
          },
          actor: actor._id,
          emailSent: true,
          io,
          activeUsers,
        })

        // Email channel
        queueService.addJob('email', 'send', {
          type: 'new_review',
          email: owner.email,
          name: owner.name,
          opts: {
            actorName:       actor.name,
            placeName,
            targetType:      review.targetType,
            rating:          review.rating,
            reviewTitle:     review.title,
            tripDestination: relatedTrip.destination,
            tripId:          relatedTrip._id,
          }
        }, {
          attempts: 5,
          backoff: { type: 'exponential', delay: 10000 }
        }).catch(err => logger.error(`[NotifService] Failed to queue new review email: ${err.message}`))

        logger.info(`[Notif] new_review → user ${owner._id} for place "${placeName}"`)
      })
    )
  } catch (err) {
    logger.error(`[Notif] notifyNewReview failed: ${err.message}`)
  }
}

/**
 * EVENT: itinerary_updated
 * Fires when any collaborator (or owner) modifies the itinerary.
 * Notifies all OTHER participants (owner + accepted collaborators, minus the editor).
 *
 * Channels: in-app (real-time socket) + email
 *
 * @param {object} params
 * @param {object} params.trip        - Mongoose Trip document (populated collaborators)
 * @param {object} params.actor       - Mongoose User document (the editor)
 * @param {string} params.changeDesc  - Human-readable description of the change, e.g. "Day 3 updated"
 * @param {object} params.io          - Socket.io Server instance
 * @param {Map}    params.activeUsers - Map<userId, socketId>
 */
exports.notifyItineraryUpdated = async ({ trip, actor, changeDesc, io, activeUsers }) => {
  try {
    // Build recipient list: owner + accepted collaborators, excluding the actor
    const participantIds = new Set()

    // Trip owner
    participantIds.add(trip.userId.toString())

    // Accepted collaborators
    for (const c of trip.collaborators) {
      if (c.status === 'accepted') {
        participantIds.add(c.userId.toString())
      }
    }

    // Remove the editor themselves
    participantIds.delete(actor._id.toString())

    if (participantIds.size === 0) return

    const users = await User.find({ _id: { $in: [...participantIds] } }).lean()
    const tripUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/trips/${trip._id}`

    await Promise.all(
      users.map(async (user) => {
        const message = `${actor.name} updated the itinerary for your trip to ${trip.destination} — ${changeDesc}`

        // In-app + DB
        await _createAndEmit({
          userId: user._id,
          type:   'itinerary_updated',
          message,
          targetUrl: tripUrl,
          meta: {
            tripId:      trip._id,
            destination: trip.destination,
            changeDesc,
            editorId:    actor._id,
            editorName:  actor.name,
          },
          actor: actor._id,
          emailSent: true,
          io,
          activeUsers,
        })

        // Email channel
        queueService.addJob('email', 'send', {
          type: 'itinerary_updated',
          email: user.email,
          name: user.name,
          opts: {
            actorName:   actor.name,
            destination: trip.destination,
            changeDesc,
            tripId:      trip._id,
          }
        }, {
          attempts: 5,
          backoff: { type: 'exponential', delay: 10000 }
        }).catch(err => logger.error(`[NotifService] Failed to queue itinerary updated email: ${err.message}`))

        logger.info(`[Notif] itinerary_updated → user ${user._id} (trip ${trip._id})`)
      })
    )
  } catch (err) {
    logger.error(`[Notif] notifyItineraryUpdated failed: ${err.message}`)
  }
}
