// backend/src/services/travel/cache/travelCache.config.js
// ─────────────────────────────────────────────────────────────────────────────
// Extends the existing cache.service.js TTL registry with travel-specific
// namespaces. Merged into cache.service at startup via patchTravelTTLs().
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Travel-specific cache namespaces and their TTLs (seconds).
 *
 * Namespace                    TTL      Rationale
 * ─────────────────────────────────────────────────────────────────────────────
 * travel:geocode               86400    Destination → lat/lon never changes
 * travel:attractions           21600    POI data stable; 6h balances freshness
 * travel:hotels                1800     Prices shift; 30 min acceptable for UX
 * travel:weather:current       600      Current weather stale after 10 min
 * travel:weather:forecast      3600     5-day forecast valid for 1 h
 * travel:enriched              7200     Full enriched plan; 2 h composite cache
 * travel:amadeus:token         1500     Amadeus OAuth2 token (expires in 30 min,
 *                                       cache for 25 min with safety margin)
 */
const TRAVEL_TTL = {
  'travel:geocode':           86400,
  'travel:attractions':       21600,
  'travel:hotels':            1800,
  'travel:weather:current':   600,
  'travel:weather:forecast':  3600,
  'travel:enriched':          7200,
  'travel:amadeus:token':     1500,
}

/**
 * Merge travel TTLs into the existing cache.service TTL registry.
 * Must be called once at server startup (before any travel API calls).
 */
function patchTravelTTLs() {
  const cacheService = require('../../cache.service')
  Object.assign(cacheService.TTL, TRAVEL_TTL)
}

module.exports = { TRAVEL_TTL, patchTravelTTLs }
