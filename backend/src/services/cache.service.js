// server/src/services/cache.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralised cache service used by middleware and controllers.
// Enhanced with SWR, human-readable keys, and cost optimization.
// ─────────────────────────────────────────────────────────────────────────────
const crypto = require('crypto')
const redis  = require('../config/redis')
const logger = require('../utils/logger')
const cacheKeys = require('./cacheKeys')

// ── TTL Registry (seconds) ────────────────────────────────────────────────
const TTL = {
  // Tier 1: HOT (≤ 10 min) — Data that changes frequently
  'weather:current':       600,   // 10 min
  'flights:status':        120,   // 2 min
  'destinations:feed':     300,   // 5 min
  'rec:personalized':      300,   // 5 min

  // Tier 2: WARM (10-60 min) — Semi-stable entity data
  'hotels:city':           1800,  // 30 min
  'restaurants:city':      900,   // 15 min
  'attractions:city':      900,   // 15 min
  'flights:search':        1800,  // 30 min
  'itinerary':             3600,  // 60 min
  'search:es':             300,   // 5 min
  'rec:trending':          600,   // 10 min
  'destinations:trending': 600,   // 10 min

  // Tier 3: COLD (1-24 hr) — Static/near-static reference data
  'travel:geocode':        86400, // 24 hr
  'flights:airports':      86400, // 24 hr
  'hotels:detail':         7200,  // 2 hr
  'restaurants:detail':    2700,  // 45 min
  'attractions:detail':    1800,  // 30 min
  'travel:enriched':       7200,  // 2 hr
  'default':               300,   // 5 min
}

/**
 * Resolve TTL for a given namespace.
 */
const resolveTTL = (namespace) =>
  TTL[namespace] ??
  Object.entries(TTL).find(([k]) => namespace.startsWith(k))?.[1] ??
  TTL.default

/**
 * Resolve max TTL for SWR (stale window fallback/expiration).
 */
const resolveMaxTTL = (namespace, freshTTL) => {
  if (namespace === 'travel:geocode' || namespace === 'flights:airports') {
    return freshTTL + 3600; // 1 hour extra
  }
  return Math.min(freshTTL * 5, 86400); // 5x fresh TTL, capped at 24 hours
}

/**
 * Maps legacy namespace + raw key to new human-readable key.
 */
const resolveCacheKey = (namespace, raw) => {
  if (typeof raw === 'string' && raw.startsWith('tsg:')) {
    return raw;
  }
  if (typeof namespace === 'string' && namespace.startsWith('tsg:')) {
    return namespace;
  }

  // 1. Geocode
  if (namespace === 'travel:geocode') {
    const city = raw.split(':').pop();
    return cacheKeys.geocode(city);
  }

  // 2. Hotels
  if (namespace === 'hotels:city') {
    const match = raw.match(/city:([^|]+)/);
    const city = match ? match[1] : raw;
    return cacheKeys.hotelCity(city);
  }
  if (namespace === 'hotels:nearby') {
    const match = raw.match(/nearby:([^,]+),([^|]+)/);
    const rMatch = raw.match(/r=([^|]+)/);
    if (match) {
      return cacheKeys.hotelNearby(parseFloat(match[1]), parseFloat(match[2]), rMatch ? parseInt(rMatch[1]) : 5000);
    }
    return cacheKeys.queryHash('hotel:nearby', raw);
  }
  if (namespace === 'hotels:detail') {
    const fsqId = raw.split(':').pop();
    return cacheKeys.hotelDetail(fsqId);
  }

  // 3. Restaurants
  if (namespace === 'restaurants:city') {
    const match = raw.match(/city:([^|]+)/);
    const city = match ? match[1] : raw;
    return cacheKeys.restaurantCity(city);
  }
  if (namespace === 'restaurants:nearby') {
    const match = raw.match(/nearby:([^,]+),([^|]+)/);
    if (match) {
      return cacheKeys.restaurantNearby(parseFloat(match[1]), parseFloat(match[2]));
    }
    return cacheKeys.queryHash('restaurant:nearby', raw);
  }
  if (namespace === 'restaurants:detail') {
    const fsqId = raw.split(':').pop();
    return cacheKeys.restaurantDetail(fsqId);
  }

  // 4. Attractions
  if (namespace === 'attractions:city') {
    const match = raw.match(/city:([^|]+)/);
    const city = match ? match[1] : raw;
    return cacheKeys.attractionCity(city);
  }
  if (namespace === 'attractions:nearby') {
    const match = raw.match(/nearby:([^,]+),([^|]+)/);
    if (match) {
      return cacheKeys.attractionNearby(parseFloat(match[1]), parseFloat(match[2]));
    }
    return cacheKeys.queryHash('attraction:nearby', raw);
  }
  if (namespace === 'attractions:detail') {
    const xid = raw.split(':').pop();
    return cacheKeys.attractionDetail(xid);
  }

  // 5. Weather
  if (namespace === 'weather:current' || namespace === 'travel:weather:current') {
    const key = raw.replace('weather:intelligence:', '');
    return cacheKeys.weatherCurrent(key);
  }
  if (namespace === 'weather:forecast' || namespace === 'travel:weather:forecast') {
    const key = raw.replace('weather:intelligence:', '');
    return cacheKeys.weatherForecast(key);
  }

  // 6. Flights
  if (namespace === 'flights:search') {
    const depMatch = raw.match(/dep=([^|]+)/);
    const arrMatch = raw.match(/arr=([^|]+)/);
    const dateMatch = raw.match(/date=([^|]+)/);
    if (depMatch && arrMatch && dateMatch) {
      return cacheKeys.flightSearch(depMatch[1], arrMatch[1], dateMatch[1]);
    }
    return cacheKeys.queryHash('flight', raw);
  }
  if (namespace === 'flights:airports') {
    const query = raw.replace('query:', '');
    return cacheKeys.flightAirport(query);
  }
  if (namespace === 'flights:status') {
    const flightNum = raw.replace('flight:', '');
    return cacheKeys.flightStatus(flightNum);
  }

  // 7. Itinerary
  if (namespace === 'itinerary') {
    const parts = raw.split('|');
    const userId = parts[0] || 'anonymous';
    const jsonStr = parts.slice(1).join('|');
    return cacheKeys.itinerary(userId, jsonStr);
  }

  // 8. Enriched
  if (namespace === 'travel:enriched') {
    const match = raw.match(/enriched:([^|]+)\|(.*)/);
    if (match) {
      return cacheKeys.enriched(match[1], match[2]);
    }
    return cacheKeys.queryHash('enriched', raw);
  }

  // 9. Discover Feed
  if (namespace === 'destinations:feed') {
    return cacheKeys.feed(raw);
  }

  // 10. Trending
  if (namespace === 'destinations:trending') {
    const match = raw.match(/[?&]type=([^&]+)/);
    if (match) {
      return cacheKeys.trending(match[1]);
    }
    if (raw && raw.length < 30 && !raw.includes('/')) {
      return cacheKeys.trending(raw);
    }
    return cacheKeys.queryHash('trending', raw);
  }

  // 11. JWT Blacklist
  if (namespace === 'blacklist') {
    return cacheKeys.blacklist(raw);
  }

  // Fallback
  return cacheKeys.queryHash(namespace, raw);
}

/**
 * Build a deterministic, short cache key (legacy wrapper).
 */
const buildKey = (namespace, raw) => {
  return resolveCacheKey(namespace, raw);
}

/**
 * Get a value from cache.
 * Returns the parsed value or null on miss. Unpacks SWR envelopes automatically.
 */
const get = async (key) => {
  try {
    const val = await redis.cacheGet(key)
    if (val && val.isSWREnvelope) {
      return val.data;
    }
    return val;
  } catch (err) {
    logger.warn(`[CacheService] GET failed for key "${key}": ${err.message}`)
    return null
  }
}

/**
 * SWR-specific get. Returns the raw envelope.
 */
const swrGet = async (key) => {
  try {
    const val = await redis.cacheGet(key)
    if (val && val.isSWREnvelope) {
      return val;
    }
    return null;
  } catch (err) {
    logger.warn(`[CacheService] swrGet failed for key "${key}": ${err.message}`)
    return null;
  }
}

/**
 * SWR-specific set. Wraps in an SWR envelope.
 */
const swrSet = async (key, data, freshTTL, maxTTL) => {
  try {
    const swrService = require('./swr.service')
    const envelope = swrService.wrapEnvelope(data, freshTTL, maxTTL)
    await redis.cacheSet(key, envelope, maxTTL)
  } catch (err) {
    logger.warn(`[CacheService] swrSet failed for key "${key}": ${err.message}`)
  }
}

/**
 * Set a value in cache under the given namespace.
 * TTL is resolved automatically from the namespace registry unless overridden.
 */
const setByNamespace = async (namespace, raw, value, ttl) => {
  const key = resolveCacheKey(namespace, raw)
  const freshTTL = ttl ?? resolveTTL(namespace)
  const maxTTL = resolveMaxTTL(namespace, freshTTL)
  await swrSet(key, value, freshTTL, maxTTL)
  return key
}

/**
 * Get by namespace + raw string (builds the same key as setByNamespace).
 * If fetchFn is provided, handles stale-while-revalidate background fetching.
 */
const getByNamespace = async (namespace, raw, fetchFn) => {
  const key = resolveCacheKey(namespace, raw)
  const envelope = await redis.cacheGet(key)

  if (envelope && envelope.isSWREnvelope) {
    const now = Date.now()
    if (now >= envelope.expireAt) {
      return null
    }
    if (now >= envelope.staleAt && fetchFn) {
      const freshTTL = resolveTTL(namespace)
      const maxTTL = resolveMaxTTL(namespace, freshTTL)
      const swrService = require('./swr.service')
      swrService.triggerRevalidate(key, fetchFn, freshTTL, maxTTL)
    }
    return envelope.data
  }

  return envelope
}

/**
 * Atomic cache-aside with SWR support.
 */
const getOrSet = async (key, fetchFn, opts = {}) => {
  const freshTTL = opts.ttl ?? opts.freshTTL ?? 300
  const maxTTL = opts.maxTTL ?? resolveMaxTTL(key.split(':')[1] || 'default', freshTTL)
  const useSWR = opts.useSWR !== false

  const envelope = await redis.cacheGet(key)

  if (envelope && envelope.isSWREnvelope) {
    const now = Date.now()
    if (now < envelope.staleAt) {
      return envelope.data
    }
    if (now < envelope.expireAt) {
      if (useSWR) {
        const swrService = require('./swr.service')
        swrService.triggerRevalidate(key, fetchFn, freshTTL, maxTTL)
        return envelope.data
      }
    }
  } else if (envelope !== null) {
    return envelope
  }

  const data = await fetchFn()
  if (data !== undefined && data !== null) {
    await swrSet(key, data, freshTTL, maxTTL)
  }
  return data
}

/**
 * Warm helper (sets without returning data).
 */
const warmKey = async (key, fetchFn, ttl) => {
  try {
    const data = await fetchFn()
    if (data !== undefined && data !== null) {
      const freshTTL = ttl ?? 300
      const maxTTL = resolveMaxTTL(key.split(':')[1] || 'default', freshTTL)
      await swrSet(key, data, freshTTL, maxTTL)
      return true
    }
  } catch (err) {
    logger.warn(`[CacheService] warmKey failed for "${key}": ${err.message}`)
  }
  return false
}

/**
 * Delete a single key.
 */
const del = async (key) => redis.cacheDel(key)

/**
 * Delete all keys matching a glob pattern.
 */
const delPattern = async (pattern) => {
  // If pattern is a legacy namespace (doesn't start with tsg:), convert it
  let finalPattern = pattern;
  if (!pattern.startsWith('tsg:') && !pattern.startsWith('*')) {
    finalPattern = `tsg:${pattern}*`;
  }
  return redis.cacheDelPattern(finalPattern);
}

/**
 * Flush an entire namespace (e.g. "hotels" deletes all "hotels:*" keys).
 */
const flush = async (namespace) => {
  logger.info(`[CacheService] Flushing namespace "${namespace}"`)
  const pattern = namespace.startsWith('tsg:') ? `${namespace}*` : `tsg:${namespace.replace(/:/g, '')}*`
  return redis.cacheDelPattern(pattern)
}

/**
 * Flush multiple namespaces at once.
 */
const flushMany = async (...namespaces) => {
  await Promise.all(namespaces.map(flush))
}

/**
 * Return cache statistics from the underlying client.
 */
const getStats = () => redis.getStats()

/**
 * Scan-based key count per namespace.
 */
const getKeyStats = async () => {
  const client = global.__redisClient
  const keyStats = {}

  if (!client) {
    return { error: 'Redis client not connected or using node-cache fallback' }
  }

  try {
    let cursor = '0'
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', 'tsg:*', 'COUNT', 250)
      cursor = nextCursor
      for (const key of keys) {
        const parts = key.split(':')
        const namespace = parts[1] || 'other'
        keyStats[namespace] = (keyStats[namespace] || 0) + 1
      }
    } while (cursor !== '0')
    return keyStats
  } catch (err) {
    logger.warn(`[CacheService] getKeyStats failed: ${err.message}`)
    return { error: err.message }
  }
}

/**
 * Reset statistics counters.
 */
const resetStats = () => redis.resetStats()

module.exports = {
  TTL,
  buildKey,
  resolveTTL,
  resolveCacheKey,
  get,
  swrGet,
  swrSet,
  getOrSet,
  warmKey,
  del,
  delPattern,
  flush,
  flushMany,
  set:          setByNamespace,
  getByNs:      getByNamespace,
  getStats,
  getKeyStats,
  resetStats,
}

