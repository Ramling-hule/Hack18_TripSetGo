// server/src/services/recommendation.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Recommendation engine for TripSetGo.
//
// Four modules:
//   A. getSimilar       — ES more_like_this + attribute fallback
//   B. computeTrending  — time-decayed scoring → Redis sorted sets
//   C. getPersonalized  — multi-signal user profile → weighted scoring
//   D. recentlyViewed   — Redis sorted set (ZADD/ZREVRANGE) + MongoDB hydration
// ─────────────────────────────────────────────────────────────────────────────
const mongoose     = require('mongoose')
const redis        = require('../config/redis')
const logger       = require('../utils/logger')
const { esClient } = require('../config/elasticsearch')
const { INDICES }  = require('./elasticsearch.service')

const Hotel        = require('../models/Hotel.model')
const Restaurant   = require('../models/Restaurant.model')
const Attraction   = require('../models/Attraction.model')
const Review       = require('../models/Review.model')
const Bookmark     = require('../models/Bookmark.model')
const Trip         = require('../models/Trip.model')
const UserActivity = require('../models/UserActivity.model')

// ── Constants ────────────────────────────────────────────────────────────────

const ACTION_WEIGHTS = {
  view:         1,
  bookmark:     3,
  review:       5,
  trip_create:  4,
  trip_clone:   2,
}

// Exponential decay lambda — half-life ≈ 69h / 0.01 ≈ 2.9 days
const DECAY_LAMBDA = 0.01

// Redis key helpers
const trendingKey    = (type) => `rec:trending:${type}`
const recentlyKey    = (userId) => `rec:recentlyViewed:${userId}`
const RECENTLY_MAX   = 50  // max items kept per user in Redis

// Model map for hydration
const MODEL_MAP = { Hotel, Restaurant, Attraction }

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Exponential decay factor.
 * @param {Date} eventTime
 */
const decayFactor = (eventTime) => {
  const hoursAgo = (Date.now() - new Date(eventTime).getTime()) / (1000 * 60 * 60)
  return Math.exp(-DECAY_LAMBDA * hoursAgo)
}

/**
 * Get the ES index name for a given targetType string.
 */
const esIndexForType = (type) => {
  const map = {
    Hotel:      INDICES.hotels,
    Restaurant: INDICES.restaurants,
    Attraction: INDICES.attractions,
  }
  return map[type] || null
}

// ── A. SIMILAR DESTINATIONS ───────────────────────────────────────────────────

/**
 * Find items similar to a given Hotel / Restaurant / Attraction.
 *
 * Strategy:
 *  1. Try Elasticsearch `more_like_this` query
 *  2. Fall back to same-city + same-category MongoDB query
 *
 * @param {string}  targetType   - 'Hotel' | 'Restaurant' | 'Attraction'
 * @param {string}  targetId     - MongoDB _id
 * @param {string}  [userId]     - Optional — penalise already-viewed items
 * @param {number}  [limit=10]
 */
const getSimilar = async (targetType, targetId, userId, limit = 10) => {
  const index = esIndexForType(targetType)

  // Fetch the source document for fallback attributes
  const Model     = MODEL_MAP[targetType]
  const sourceDoc = await Model.findById(targetId).lean()
  if (!sourceDoc) return []

  // Get recently viewed IDs to deprioritise
  let viewedIds = new Set()
  if (userId) {
    const viewed = await getRecentlyViewedRaw(userId, 50)
    viewed
      .filter(v => v.type === targetType)
      .forEach(v => viewedIds.add(v.id))
  }

  // ── 1. Elasticsearch more_like_this ────────────────────────────────────
  if (index) {
    try {
      const response = await esClient.search({
        index,
        body: {
          size: limit + 5,  // fetch extra so we can exclude the source item
          query: {
            more_like_this: {
              fields:               ['name', 'description', 'city', 'category', 'amenities', 'cuisines'],
              like:                 [{ _index: index, _id: targetId }],
              min_term_freq:        1,
              min_doc_freq:         1,
              max_query_terms:      20,
              minimum_should_match: '30%',
            },
          },
          _source: ['mongoId', 'name', 'city', 'averageRating', 'images', 'priceLevel', 'category', 'cuisines', 'starRating'],
        },
      })

      const hits = response.hits.hits
        .filter(h => h._id !== targetId.toString())   // exclude the source item
        .slice(0, limit)

      if (hits.length >= Math.min(limit, 3)) {
        // Apply view-penalty: push already-viewed items to end
        const sorted = hits.sort((a, b) => {
          const aViewed = viewedIds.has(a._id) ? -3 : 0
          const bViewed = viewedIds.has(b._id) ? -3 : 0
          return (b._score + bViewed) - (a._score + aViewed)
        })

        return sorted.map(h => ({ _entityType: targetType, ...h._source }))
      }
    } catch (err) {
      logger.warn(`[Rec] ES more_like_this failed for ${targetType}/${targetId}: ${err.message}`)
    }
  }

  // ── 2. MongoDB fallback (same city + category/cuisine) ──────────────────
  const filter = {
    _id:  { $ne: new mongoose.Types.ObjectId(targetId) },
    city: sourceDoc.city,
  }

  if (targetType === 'Attraction' && sourceDoc.category) filter.category  = sourceDoc.category
  if (targetType === 'Restaurant' && sourceDoc.cuisines?.length) filter.cuisines = { $in: sourceDoc.cuisines }

  const fallbackDocs = await Model
    .find(filter)
    .sort({ averageRating: -1 })
    .limit(limit)
    .lean()

  // Deprioritise viewed items
  return fallbackDocs
    .sort((a, b) => {
      const penalty = (id) => viewedIds.has(id.toString()) ? -3 : 0
      return (b.averageRating + penalty(b._id)) - (a.averageRating + penalty(a._id))
    })
    .map(doc => ({ _entityType: targetType, ...doc }))
}

// ── B. TRENDING ───────────────────────────────────────────────────────────────

/**
 * Recompute trending scores for all entity types and store them in Redis
 * sorted sets.
 *
 * Called by the 30-min cron job and the admin refresh endpoint.
 *
 * Redis structure per type:
 *   Key: rec:trending:Hotel  (also Restaurant, Attraction)
 *   Members: "<mongoId>"
 *   Score:   sum of time-decayed weighted actions
 */
const computeTrending = async () => {
  const startTime = Date.now()
  const since     = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)  // last 7 days

  const types = ['Hotel', 'Restaurant', 'Attraction']

  for (const type of types) {
    try {
      // Aggregate all relevant actions for this entity type
      const activities = await UserActivity.find({
        targetType: type,
        action:     { $in: Object.keys(ACTION_WEIGHTS) },
        timestamp:  { $gte: since },
      })
        .select('targetId action timestamp')
        .lean()

      if (!activities.length) continue

      // Accumulate time-decayed scores per entity
      const scores = {}
      for (const act of activities) {
        const id     = act.targetId.toString()
        const weight = ACTION_WEIGHTS[act.action] || 1
        const decay  = decayFactor(act.timestamp)
        scores[id]   = (scores[id] || 0) + (weight * decay)
      }

      if (!Object.keys(scores).length) continue

      // Write to Redis sorted set (ZADD NX — replace all each refresh)
      const key = trendingKey(type)

      // Build args for ZADD: [score, member, score, member, ...]
      // ioredis zadd signature: zadd(key, score1, member1, score2, member2, ...)
      const args = Object.entries(scores).flatMap(([id, score]) => [score, id])

      // Delete stale set first, then re-populate atomically
      if (redis.cacheDelPattern) await redis.cacheDelPattern(`${key}`)

      // Use raw Redis client (ioredis) if available, else skip
      const ioredis = global.__redisClient
      if (ioredis) {
        await ioredis.del(key)
        await ioredis.zadd(key, ...args)
        await ioredis.expire(key, 3600)  // 1h safety TTL
      } else {
        // Fallback: store top-20 in node-cache via the cache service
        const sorted = Object.entries(scores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([id, score]) => ({ id, score }))
        await redis.cacheSet(key, sorted, 3600)
      }

      logger.info(`[Rec] Trending computed: ${type} — ${Object.keys(scores).length} entities scored`)
    } catch (err) {
      logger.error(`[Rec] computeTrending failed for ${type}: ${err.message}`)
    }
  }

  logger.info(`[Rec] ✅ Trending refresh complete in ${Date.now() - startTime}ms`)
}

/**
 * Read trending items for a given type from Redis and hydrate from MongoDB.
 *
 * @param {string}  type   - 'Hotel' | 'Restaurant' | 'Attraction'
 * @param {number}  limit  - How many to return (default 10)
 */
const getTrendingByType = async (type, limit = 10) => {
  const key    = trendingKey(type)
  const Model  = MODEL_MAP[type]
  if (!Model) return []

  let ids = []

  // Try raw Redis ZREVRANGE first (highest score first)
  const ioredis = global.__redisClient
  if (ioredis) {
    try {
      ids = await ioredis.zrevrange(key, 0, limit - 1)
    } catch (err) {
      logger.warn(`[Rec] ZREVRANGE failed for ${key}: ${err.message}`)
    }
  }

  // Fallback to node-cache if Redis not available
  if (!ids.length) {
    const cached = await redis.cacheGet(key)
    if (cached && Array.isArray(cached)) {
      ids = cached.slice(0, limit).map(e => e.id)
    }
  }

  if (!ids.length) {
    // Last resort: highest rated from MongoDB
    return Model.find({}).sort({ averageRating: -1 }).limit(limit).lean()
  }

  // Hydrate from MongoDB, preserving trending rank order
  const objectIds = ids.map(id => new mongoose.Types.ObjectId(id))
  const docs = await Model.find({ _id: { $in: objectIds } }).lean()

  // Re-sort by trending rank
  const rankMap = Object.fromEntries(ids.map((id, i) => [id, i]))
  return docs
    .sort((a, b) => (rankMap[a._id.toString()] ?? 99) - (rankMap[b._id.toString()] ?? 99))
    .map(doc => ({ _entityType: type, ...doc }))
}

/**
 * Get trending places across all types or for a specific type.
 *
 * @param {string|null} type   - 'Hotel' | 'Restaurant' | 'Attraction' | null (all)
 * @param {number}      limit
 */
const getTrending = async (type, limit = 10) => {
  if (type && MODEL_MAP[type]) {
    return getTrendingByType(type, limit)
  }

  // Combined: fetch from all types
  const perType = Math.ceil(limit / 3)
  const [hotels, restaurants, attractions] = await Promise.all([
    getTrendingByType('Hotel',      perType),
    getTrendingByType('Restaurant', perType),
    getTrendingByType('Attraction', perType),
  ])

  return { hotels, restaurants, attractions }
}

// ── C. PERSONALIZED RECOMMENDATIONS ──────────────────────────────────────────

/**
 * Build a user preference profile from multiple signals.
 * Returns { preferredCities, preferredCategories, preferredCuisines, interestTags, viewedIds }
 */
const buildUserProfile = async (userId) => {
  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const [user, reviews, bookmarks, trips, recentViews] = await Promise.all([
    require('../models/User.model').findById(userId).lean(),
    Review.find({ userId, createdAt: { $gte: since90d } }).select('targetType targetId rating').lean(),
    Bookmark.find({ userId }).select('targetType targetId').lean(),
    Trip.find({ userId }).select('destination preferences groupType budget tags').lean(),
    UserActivity.find({ userId, action: 'view', timestamp: { $gte: since90d } })
      .select('targetType targetId metadata')
      .sort({ timestamp: -1 })
      .limit(100)
      .lean(),
  ])

  if (!user) return null

  // ── Preferred cities ────────────────────────────────────────────────────
  const cityCounts = {}
  const addCity = (city, weight = 1) => {
    if (!city) return
    cityCounts[city.toLowerCase()] = (cityCounts[city.toLowerCase()] || 0) + weight
  }

  user.favoriteDestinations?.forEach(d => addCity(d, 3))
  trips.forEach(t => { addCity(t.destination, 2); addCity(t.source, 1) })
  recentViews.forEach(v => v.metadata?.city && addCity(v.metadata.city, 1))

  const preferredCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city]) => city)

  // ── Preferred categories ────────────────────────────────────────────────
  const categoryCounts = {}
  const addCategory = (cat, weight = 1) => {
    if (!cat) return
    categoryCounts[cat.toLowerCase()] = (categoryCounts[cat.toLowerCase()] || 0) + weight
  }

  reviews.filter(r => r.rating >= 4).forEach(r => {
    if (r.targetType === 'Attraction') addCategory('attraction', 2)
    if (r.targetType === 'Hotel')      addCategory('hotel', 2)
    if (r.targetType === 'Restaurant') addCategory('restaurant', 2)
  })
  bookmarks.forEach(b => addCategory(b.targetType.toLowerCase(), 1))

  const preferredCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat)

  // ── Interest tags ────────────────────────────────────────────────────────
  const interestTags = new Set([
    ...(user.travelInterests || []).map(t => t.toLowerCase()),
    ...trips.flatMap(t => (t.preferences || []).map(p => p.toLowerCase())),
    ...trips.flatMap(t => (t.tags || []).map(tag => tag.toLowerCase())),
  ])

  // ── Already viewed IDs (to penalise) ────────────────────────────────────
  const viewedIds = new Set(recentViews.map(v => v.targetId?.toString()).filter(Boolean))

  return { preferredCities, preferredCategories, interestTags: [...interestTags], viewedIds }
}

/**
 * Score a single entity document against the user profile.
 */
const scoreEntity = (doc, entityType, profile) => {
  let score = 0

  // City affinity (+2 per match)
  const city = (doc.city || '').toLowerCase()
  if (profile.preferredCities.includes(city)) score += 2

  // Category / cuisine match (+2)
  if (entityType === 'Attraction') {
    const cat = (doc.category || '').toLowerCase()
    if (profile.preferredCategories.includes(cat)) score += 2
  }
  if (entityType === 'Restaurant') {
    const cuisineMatch = (doc.cuisines || []).some(c => profile.interestTags.includes(c.toLowerCase()))
    if (cuisineMatch) score += 2
  }

  // Tag overlap (+3 per matching tag)
  const entityTags = [
    doc.name,
    doc.category,
    ...(doc.amenities || []),
    ...(doc.cuisines  || []),
  ].filter(Boolean).map(t => t.toLowerCase())

  const tagOverlap = entityTags.filter(t => profile.interestTags.includes(t)).length
  score += tagOverlap * 3

  // Rating boost (+0 to +1)
  score += (doc.averageRating || 0) / 5

  // Freshness boost: if created in last 30 days (+0.5)
  const daysOld = (Date.now() - new Date(doc.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  if (daysOld < 30) score += 0.5

  // Already-viewed penalty (-5)
  if (profile.viewedIds.has(doc._id.toString())) score -= 5

  return score
}

/**
 * Generate personalized recommendations for a user.
 *
 * @param {string} userId
 * @param {number} [limit=20]
 */
const getPersonalized = async (userId, limit = 20) => {
  const profile = await buildUserProfile(userId)

  if (!profile) return { hotels: [], restaurants: [], attractions: [] }

  // If insufficient history, fall back to trending
  const hasHistory = profile.preferredCities.length > 0 || profile.interestTags.length > 0
  if (!hasHistory) {
    const trending = await getTrending(null, limit)
    return { ...trending, _fallback: 'trending' }
  }

  // Fetch broad candidate pool from MongoDB for each type
  const cityFilter = profile.preferredCities.length
    ? { city: { $in: profile.preferredCities.map(c => new RegExp(`^${c}$`, 'i')) } }
    : {}

  const candidateLimit = limit * 5  // fetch wide pool, then score

  const [hotelCandidates, restaurantCandidates, attractionCandidates] = await Promise.all([
    Hotel.find(cityFilter).sort({ averageRating: -1 }).limit(candidateLimit).lean(),
    Restaurant.find(cityFilter).sort({ averageRating: -1 }).limit(candidateLimit).lean(),
    Attraction.find(cityFilter).sort({ averageRating: -1 }).limit(candidateLimit).lean(),
  ])

  const score = (docs, type) =>
    docs
      .map(doc => ({ ...doc, _entityType: type, _score: scoreEntity(doc, type, profile) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, Math.ceil(limit / 3))

  return {
    hotels:      score(hotelCandidates,      'Hotel'),
    restaurants: score(restaurantCandidates, 'Restaurant'),
    attractions: score(attractionCandidates, 'Attraction'),
  }
}

// ── D. RECENTLY VIEWED ────────────────────────────────────────────────────────

/**
 * Record a view event.
 * Writes to both UserActivity (MongoDB) and the Redis sorted set.
 *
 * @param {string} userId
 * @param {string} targetType  - 'Hotel' | 'Restaurant' | 'Attraction'
 * @param {string} targetId
 * @param {object} [metadata]  - Extra context (city, category, etc.)
 */
const recordView = async (userId, targetType, targetId, metadata = {}) => {
  const now = Date.now()

  // 1. Log to MongoDB (fire-and-forget — doesn't block the response)
  UserActivity.create({
    userId,
    action:     'view',
    targetType,
    targetId,
    metadata,
    timestamp:  new Date(now),
  }).catch(err => logger.warn(`[Rec] UserActivity create failed: ${err.message}`))

  // 2. Update Redis sorted set
  const key    = recentlyKey(userId)
  const member = `${targetType}:${targetId}`

  const ioredis = global.__redisClient
  if (ioredis) {
    try {
      await ioredis.zadd(key, now, member)
      // Trim to RECENTLY_MAX (remove lowest scores = oldest)
      await ioredis.zremrangebyrank(key, 0, -(RECENTLY_MAX + 1))
      await ioredis.expire(key, 30 * 24 * 60 * 60)  // 30 day TTL
    } catch (err) {
      logger.warn(`[Rec] Redis ZADD recently-viewed failed: ${err.message}`)
    }
  }
}

/**
 * Log a non-view activity event (review, bookmark, trip_create, etc.).
 * Fire-and-forget — does not affect API response time.
 */
const logActivity = (userId, action, targetType, targetId, metadata = {}) => {
  UserActivity.create({
    userId, action, targetType, targetId, metadata, timestamp: new Date(),
  }).catch(err => logger.warn(`[Rec] logActivity failed: ${err.message}`))
}

/**
 * Get raw recently-viewed items from Redis (without hydrating from MongoDB).
 * Returns array of { type, id } objects.
 */
const getRecentlyViewedRaw = async (userId, limit = 20) => {
  const key     = recentlyKey(userId)
  const ioredis = global.__redisClient

  if (ioredis) {
    try {
      const members = await ioredis.zrevrange(key, 0, limit - 1)
      return members.map(m => {
        const [type, ...rest] = m.split(':')
        return { type, id: rest.join(':') }
      })
    } catch (err) {
      logger.warn(`[Rec] ZREVRANGE recently-viewed failed: ${err.message}`)
    }
  }

  // Fallback: query UserActivity from MongoDB
  const activities = await UserActivity.find({ userId, action: 'view' })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('targetType targetId')
    .lean()

  return activities.map(a => ({ type: a.targetType, id: a.targetId?.toString() }))
}

/**
 * Get recently viewed items, hydrated from MongoDB.
 *
 * @param {string} userId
 * @param {number} [limit=20]
 */
const getRecentlyViewed = async (userId, limit = 20) => {
  const raw = await getRecentlyViewedRaw(userId, limit)
  if (!raw.length) return []

  // Group by type for batched queries
  const grouped = {}
  raw.forEach(({ type, id }) => {
    if (!grouped[type]) grouped[type] = []
    if (id) grouped[type].push(new mongoose.Types.ObjectId(id))
  })

  // Fetch each group from MongoDB
  const fetched = {}
  await Promise.all(
    Object.entries(grouped).map(async ([type, ids]) => {
      const Model = MODEL_MAP[type]
      if (!Model) return
      const docs = await Model.find({ _id: { $in: ids } }).lean()
      fetched[type] = Object.fromEntries(docs.map(d => [d._id.toString(), d]))
    })
  )

  // Re-assemble in the original order (newest first)
  return raw
    .map(({ type, id }) => {
      const doc = fetched[type]?.[id]
      if (!doc) return null
      return { _entityType: type, ...doc }
    })
    .filter(Boolean)
}

module.exports = {
  // Similar
  getSimilar,
  // Trending
  computeTrending,
  getTrending,
  // Personalized
  getPersonalized,
  // Recently viewed
  recordView,
  logActivity,
  getRecentlyViewed,
}
