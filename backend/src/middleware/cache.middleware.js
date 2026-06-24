// server/src/middleware/cache.middleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Redis-backed HTTP response cache middleware factory with SWR support.
// ─────────────────────────────────────────────────────────────────────────────
const cacheService = require('../services/cache.service')
const logger       = require('../utils/logger')

/**
 * Create a cache middleware for a specific namespace and optional TTL.
 *
 * @param {string} namespace   Namespace prefix (e.g. 'hotels', 'destinations:trending')
 * @param {number} [ttl]       TTL override in seconds. Falls back to namespace registry.
 * @returns {Function}         Express middleware
 */
const cacheMiddleware = (namespace, ttl) => async (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') return next()

  const key = cacheService.buildKey(namespace, req.originalUrl)
  const forceRefresh = req.query.refresh === 'true'

  try {
    if (!forceRefresh) {
      const envelope = await cacheService.swrGet(key)

      if (envelope) {
        const now = Date.now()
        const ageSeconds = Math.round((now - envelope.cachedAt) / 1000)

        // 1. Fresh HIT
        if (now < envelope.staleAt) {
          logger.info(`[Cache] FRESH HIT ${namespace} — ${req.originalUrl}`)
          res.setHeader('X-Cache', 'HIT')
          res.setHeader('X-Cache-Age', ageSeconds)
          res.setHeader('X-Cache-Namespace', namespace)
          return res.status(200).json(envelope.data)
        }

        // 2. Stale HIT (staleAt <= now < expireAt)
        if (now < envelope.expireAt) {
          logger.info(`[Cache] STALE HIT ${namespace} — ${req.originalUrl}`)
          res.setHeader('X-Cache', 'STALE')
          res.setHeader('X-Cache-Age', ageSeconds)
          res.setHeader('X-Cache-Namespace', namespace)
          res.status(200).json(envelope.data)

          // Trigger background revalidation
          const lockKey = `tsg:lock:${key}`
          const swrService = require('../services/swr.service')

          (async () => {
            const locked = await swrService.acquireLock(lockKey, 15)
            if (!locked) {
              logger.debug(`[Cache SWR] Revalidation lock already held for key: ${key}`)
              return
            }

            try {
              logger.info(`[Cache SWR] Background revalidating route: ${req.originalUrl}`)

              // Intercept res object for downstream controller execution
              const originalJson = res.json
              const originalStatus = res.status
              const originalSend = res.send
              const originalEnd = res.end
              const originalSetHeader = res.setHeader

              res.json = (body) => {
                if (res.statusCode >= 200 && res.statusCode < 300 && body?.success !== false) {
                  const effectiveTTL = ttl ?? cacheService.resolveTTL(namespace)
                  cacheService.set(namespace, req.originalUrl, body, effectiveTTL).catch(err => {
                    logger.warn(`[Cache SWR] Background store failed: ${err.message}`)
                  })
                }
                return res
              }

              res.status = (code) => {
                res.statusCode = code
                return res
              }

              res.send = () => res
              res.end = () => res
              res.setHeader = () => res

              // Run downstream handlers in background
              next()
            } catch (err) {
              logger.error(`[Cache SWR] Background revalidation failed: ${err.message}`)
            } finally {
              await swrService.releaseLock(lockKey)
            }
          })()

          return
        }
      }
    }

    // 3. Cache MISS / Expired / Refresh
    logger.info(`[Cache] MISS ${namespace} — ${req.originalUrl}`)
    res.setHeader('X-Cache', 'MISS')
    res.setHeader('X-Cache-Age', '0')
    res.setHeader('X-Cache-Namespace', namespace)

    // Intercept res.json to cache the response body before sending
    const originalJson = res.json.bind(res)
    res.json = async (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success !== false) {
        try {
          const effectiveTTL = ttl ?? cacheService.resolveTTL(namespace)
          await cacheService.set(namespace, req.originalUrl, body, effectiveTTL)
        } catch (err) {
          logger.warn(`[Cache] Failed to store response for "${key}": ${err.message}`)
        }
      }
      return originalJson(body)
    }
  } catch (err) {
    logger.warn(`[Cache] Middleware error for "${key}": ${err.message}`)
  }

  next()
}

module.exports = cacheMiddleware

