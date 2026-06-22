// backend/src/services/travel/providerRegistry.js
// ─────────────────────────────────────────────────────────────────────────────
// Runtime provider registry with priority-ordered chains per data domain.
//
// Defines:
//   attractions: OpenTripMap (primary) → Foursquare (secondary)
//   hotels:      Amadeus (sole provider)
//   weather:     OpenWeather (sole provider)
//   geocode:     Nominatim (sole provider) — no fallback needed (24h cache)
//
// The registry is the single place where provider priority and routing logic
// is declared. Orchestrator and planEnricher import from here.
// ─────────────────────────────────────────────────────────────────────────────
const overpassProvider     = require('./providers/overpass.provider')
const foursquareProvider   = require('./providers/foursquare.provider')
const openWeatherProvider  = require('./providers/openWeather.provider')
const amadeusProvider      = require('./providers/amadeus.provider')
const travelLogger         = require('./utils/travelLogger')

const registry = {
  /**
   * Attraction provider chain (primary → secondary).
   * Secondary is invoked only if primary returns < minResults attractions.
   */
  attractions: {
    primary:    overpassProvider,
    secondary:  foursquareProvider,
    minResults: 5, // invoke secondary if primary returns fewer than this
  },

  /**
   * Hotel provider chain (single provider).
   */
  hotels: {
    primary: amadeusProvider,
  },

  /**
   * Weather provider chain (single provider).
   */
  weather: {
    primary: openWeatherProvider,
  },
}

/**
 * Fetch attractions using the primary → secondary fallback chain.
 *
 * @param {Object} params — { lat, lon, radiusM, limit, kinds }
 * @returns {Promise<NormalisedAttraction[]>}
 */
async function fetchAttractions(params) {
  const { primary, secondary, minResults } = registry.attractions
  let results = []

  // Try primary
  try {
    results = await primary.fetchAttractions(params)
    travelLogger.info('Registry', `Primary (${primary.name}): ${results.length} attractions`)
  } catch (err) {
    travelLogger.warn('Registry', `Primary attractions provider failed: ${err.message}`, {
      provider: primary.name,
    })
  }

  // Try secondary if primary returned too few results
  if (results.length < minResults && secondary?.config?.enabled) {
    travelLogger.info('Registry', `Invoking secondary (${secondary.name}) — primary returned ${results.length}/${minResults}`)
    try {
      const secondaryResults = await secondary.fetchAttractions(params)
      // Return secondary results; aggregator will merge them later
      return { primary: results, secondary: secondaryResults }
    } catch (err) {
      travelLogger.warn('Registry', `Secondary attractions provider failed: ${err.message}`, {
        provider: secondary.name,
      })
    }
  }

  return { primary: results, secondary: [] }
}

/**
 * Fetch hotels via Amadeus.
 *
 * @param {Object} params — { cityCode, checkIn, checkOut, adults, budget, nights }
 * @returns {Promise<NormalisedHotel[]>}
 */
async function fetchHotels(params) {
  try {
    return await registry.hotels.primary.fetchHotels(params)
  } catch (err) {
    travelLogger.warn('Registry', `Hotel provider failed: ${err.message}`)
    return []
  }
}

/**
 * Fetch weather via OpenWeather.
 *
 * @param {Object} params — { city, lat, lon }
 * @returns {Promise<NormalisedWeather | null>}
 */
async function fetchWeather(params) {
  try {
    return await registry.weather.primary.fetchWeather(params)
  } catch (err) {
    travelLogger.warn('Registry', `Weather provider failed: ${err.message}`)
    return null
  }
}

/**
 * Get health status of all registered providers.
 */
async function healthCheck() {
  const providers = [
    overpassProvider,
    foursquareProvider,
    openWeatherProvider,
    amadeusProvider,
  ]

  const statuses = await Promise.allSettled(providers.map(p => p.healthStatus()))
  return statuses.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { name: providers[i].name, error: r.reason?.message }
  )
}

module.exports = { fetchAttractions, fetchHotels, fetchWeather, healthCheck, registry }
