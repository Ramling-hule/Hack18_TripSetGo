// server/src/controllers/recommendation.controller.js
const recService   = require('../services/recommendation.service')
const cacheService = require('../services/cache.service')
const asyncHandler = require('../utils/asyncHandler')
const { success, badRequest, error } = require('../utils/response')
const logger       = require('../utils/logger')

const VALID_TYPES = ['Hotel', 'Restaurant', 'Attraction']

// ── GET /api/v1/recommendations/similar/:targetType/:targetId ────────────────
//
// Returns items similar to the given entity using ES more_like_this.
// Auth: optional (used to deprioritise already-viewed items for logged-in users).
//
// Query params:
//   limit  — number of results (default: 10, max: 20)

exports.getSimilar = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 20)

  if (!VALID_TYPES.includes(targetType)) {
    return badRequest(res, `targetType must be one of: ${VALID_TYPES.join(', ')}`)
  }

  const cacheKey = `rec:similar:${targetType}:${targetId}:${limit}`
  const cached   = await cacheService.get(cacheKey)
  if (cached) return success(res, cached)

  const results = await recService.getSimilar(
    targetType,
    targetId,
    req.user?._id?.toString(),
    limit
  )

  await cacheService.set('rec:similar', cacheKey, results)
  success(res, results)
})

// ── GET /api/v1/recommendations/trending ─────────────────────────────────────
//
// Returns trending places — combined or for a specific entity type.
// Auth: none.
//
// Query params:
//   type   — Hotel | Restaurant | Attraction (omit for combined)
//   limit  — number of results per type (default: 10, max: 30)

exports.getTrending = asyncHandler(async (req, res) => {
  const { type, limit: rawLimit } = req.query
  const limit = Math.min(parseInt(rawLimit, 10) || 10, 30)

  if (type && !VALID_TYPES.includes(type)) {
    return badRequest(res, `type must be one of: ${VALID_TYPES.join(', ')}`)
  }

  const cacheKey = `rec:trending:${type || 'all'}:${limit}`
  const cached   = await cacheService.get(cacheKey)
  if (cached) return success(res, cached)

  const results = await recService.getTrending(type || null, limit)

  await cacheService.set('rec:trending', cacheKey, results)
  success(res, results)
})

// ── GET /api/v1/recommendations/for-you ──────────────────────────────────────
//
// Returns personalized recommendations based on user history and preferences.
// Auth: required.
//
// Query params:
//   limit  — total results across all types (default: 20, max: 60)

exports.getPersonalized = asyncHandler(async (req, res) => {
  const limit    = Math.min(parseInt(req.query.limit, 10) || 20, 60)
  const userId   = req.user._id.toString()
  const cacheKey = `rec:personalized:${userId}:${limit}`

  const cached = await cacheService.get(cacheKey)
  if (cached) return success(res, cached)

  const results = await recService.getPersonalized(userId, limit)

  await cacheService.set('rec:personalized', cacheKey, results)
  success(res, results)
})

// ── GET /api/v1/recommendations/recently-viewed ───────────────────────────────
//
// Returns the user's recently viewed Hotels, Restaurants, and Attractions.
// Auth: required.
//
// Query params:
//   limit  — number of results (default: 20, max: 50)

exports.getRecentlyViewed = asyncHandler(async (req, res) => {
  const limit   = Math.min(parseInt(req.query.limit, 10) || 20, 50)
  const results = await recService.getRecentlyViewed(req.user._id.toString(), limit)
  success(res, results)
})

// ── POST /api/v1/recommendations/view ────────────────────────────────────────
//
// Record that the authenticated user viewed an entity.
// Writes to Redis sorted set + UserActivity collection.
// Auth: required.
//
// Body: { targetType, targetId, metadata? }

exports.recordView = asyncHandler(async (req, res) => {
  const { targetType, targetId, metadata } = req.body

  if (!targetType || !targetId) {
    return badRequest(res, 'targetType and targetId are required')
  }
  if (!VALID_TYPES.includes(targetType)) {
    return badRequest(res, `targetType must be one of: ${VALID_TYPES.join(', ')}`)
  }

  await recService.recordView(
    req.user._id.toString(),
    targetType,
    targetId,
    metadata || {}
  )

  // Invalidate personalized cache for this user (their profile just changed)
  cacheService.delPattern(`rec:personalized:${req.user._id}:*`).catch(() => {})

  success(res, null, 'View recorded')
})

// ── POST /api/v1/recommendations/trending/refresh ─────────────────────────────
//
// Force-recompute trending scores (admin only).
// Auth: required + admin role.

exports.refreshTrending = asyncHandler(async (req, res) => {
  logger.info(`[Rec] Manual trending refresh triggered by admin ${req.user._id}`)

  // Flush cached trending responses
  await cacheService.flush('rec:trending')

  // Recompute (non-blocking — respond immediately)
  recService.computeTrending().catch(err =>
    logger.error(`[Rec] Manual trending refresh failed: ${err.message}`)
  )

  success(res, null, 'Trending score refresh started')
})
