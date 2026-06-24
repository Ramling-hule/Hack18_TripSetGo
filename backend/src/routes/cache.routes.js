// server/src/routes/cache.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Admin endpoints for cache observability and manual invalidation.
//
//   GET    /api/v1/cache/stats              → hit/miss/error counters + backend info
//   GET    /api/v1/cache/keys               → key count per namespace (SCAN-based)
//   POST   /api/v1/cache/warm               → trigger manual cache warming
//   GET    /api/v1/cache/health             → detailed cache health dashboard
//   DELETE /api/v1/cache/flush/:namespace   → flush all keys in a namespace
//   DELETE /api/v1/cache/reset-stats        → reset counters
// ─────────────────────────────────────────────────────────────────────────────
const router       = require('express').Router()
const cacheService = require('../services/cache.service')
const { authenticate } = require('../middleware/auth.middleware')
const logger       = require('../utils/logger')

// Valid namespaces that can be flushed via API
const VALID_NAMESPACES = [
  'hotel',
  'restaurant',
  'attraction',
  'weather',
  'flight',
  'itinerary',
  'geocode',
  'search',
  'feed',
  'trending',
  'rec',
  'blacklist',
]

/**
 * GET /api/v1/cache/stats
 * Returns cache hit/miss/error statistics and backend info.
 * Protected: requires authentication.
 */
router.get('/stats', authenticate, (req, res) => {
  const stats = cacheService.getStats()
  const hitRate = stats.hits + stats.misses > 0
    ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
    : '0.0'

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      hitRate: `${hitRate}%`,
      namespaces: VALID_NAMESPACES,
      ttlRegistry: cacheService.TTL,
    }
  })
})

/**
 * GET /api/v1/cache/keys
 * Returns key counts per namespace via Redis SCAN.
 * Protected: requires authentication.
 */
router.get('/keys', authenticate, async (req, res) => {
  try {
    const keyStats = await cacheService.getKeyStats()
    res.status(200).json({
      success: true,
      data: keyStats
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch key statistics: ${err.message}`
    })
  }
})

/**
 * POST /api/v1/cache/warm
 * Triggers manual cache warming for top destinations.
 * Protected: requires authentication.
 */
router.post('/warm', authenticate, async (req, res) => {
  try {
    const cacheWarmer = require('../services/cacheWarmer')
    // Trigger in the background so it doesn't block the API response
    cacheWarmer.warmAll().catch(err => {
      logger.error(`[Cache] Manual warming failed: ${err.message}`)
    })

    logger.info(`[Cache] Manual cache warm triggered by user ${req.user._id}`)
    res.status(200).json({
      success: true,
      message: '🔥 Manual cache warm triggered'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to trigger cache warming: ${err.message}`
    })
  }
})

/**
 * GET /api/v1/cache/health
 * Cache health dashboard (hit rate, memory usage, connection status)
 * Protected: requires authentication.
 */
router.get('/health', authenticate, async (req, res) => {
  try {
    const stats = cacheService.getStats()
    const hitRate = stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
      : '0.0'

    // Get key counts
    const keyStats = await cacheService.getKeyStats()
    const totalKeys = Object.values(keyStats).reduce((a, b) => typeof b === 'number' ? a + b : a, 0)

    // Check Redis memory usage if client is available
    let memoryUsage = 'N/A'
    const client = global.__redisClient
    if (client) {
      try {
        const info = await client.info('memory')
        const match = info.match(/used_memory_human:([^\r\n]+)/)
        if (match) memoryUsage = match[1]
      } catch (err) {
        logger.warn(`[Cache Health] Failed to get memory info: ${err.message}`)
      }
    }

    res.status(200).json({
      success: true,
      data: {
        status: stats.redisReady ? 'healthy' : 'degraded (in-memory)',
        hitRate: `${hitRate}%`,
        totalKeys,
        memoryUsage,
        backend: stats.backend,
        counters: {
          hits: stats.hits,
          misses: stats.misses,
          sets: stats.sets,
          deletes: stats.deletes,
          errors: stats.errors
        }
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch cache health: ${err.message}`
    })
  }
})

/**
 * DELETE /api/v1/cache/flush/:namespace
 * Flush all cached keys under a given namespace.
 * Protected: requires authentication.
 */
router.delete('/flush/:namespace', authenticate, async (req, res) => {
  const { namespace } = req.params

  if (namespace === 'all') {
    await cacheService.flushMany(...VALID_NAMESPACES)
    logger.info(`[Cache] Admin flushed ALL namespaces by user ${req.user._id}`)
    return res.status(200).json({ success: true, message: 'All cache namespaces flushed' })
  }

  if (!VALID_NAMESPACES.includes(namespace) && !namespace.startsWith('tsg:')) {
    return res.status(400).json({
      success: false,
      message: `Invalid namespace. Valid options: ${VALID_NAMESPACES.join(', ')}, all`
    })
  }

  await cacheService.flush(namespace)
  logger.info(`[Cache] Admin flushed namespace "${namespace}" by user ${req.user._id}`)

  res.status(200).json({
    success: true,
    message: `Cache namespace "${namespace}" flushed successfully`
  })
})

/**
 * DELETE /api/v1/cache/reset-stats
 * Reset hit/miss/error counters.
 * Protected: requires authentication.
 */
router.delete('/reset-stats', authenticate, (req, res) => {
  cacheService.resetStats()
  logger.info(`[Cache] Stats reset by user ${req.user._id}`)
  res.status(200).json({ success: true, message: 'Cache statistics reset' })
})

module.exports = router
