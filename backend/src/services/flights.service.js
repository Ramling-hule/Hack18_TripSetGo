// backend/src/services/flights.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Flight Search Engine Service — high-level business logic layer.
//
// Orchestrates:
//   1. Redis cache lookup per endpoint (via provider's fetchWithCache)
//   2. AviationStack API calls (airport search, flight schedules, status, airlines)
//   3. Response enrichment and metadata wrapping
//
// Public API:
//   searchAirports(params)             → NormalisedAirport[]
//   searchAirportsByCity(city, limit)  → NormalisedAirport[]
//   searchFlights(params)              → { flights, total, meta }
//   getFlightStatus(params)            → NormalisedFlight | null
//   getAirlineDetails(codes)           → NormalisedAirline[]
//   getProviderHealth()                → health status object
//   isProviderEnabled()                → boolean
//
// Caching strategy (all managed by the provider's cache layer):
//   Namespace               TTL      Use
//   ─────────────────────────────────────────────────────────────────────
//   flights:airports        24h      Airport autocomplete (static IATA data)
//   flights:airports:city   7 days   City→airports mapping (very stable)
//   flights:search          30 min   Flight schedules (semi-stable)
//   flights:airlines        24h      Airline name/details (static)
//   flights:status          2 min    Live flight status (changes rapidly)
//
// NOTE: There is no pricing confirmation endpoint — AviationStack provides
// schedule and status data, not bookable offers. For booking, integrate a
// GDS/OTA layer (e.g. Duffel, Kiwi.com) on top of these normalised results.
// ─────────────────────────────────────────────────────────────────────────────
const flightProvider = require('./travel/providers/aviationstack.provider')
const logger         = require('../utils/logger')

// ── searchAirports ────────────────────────────────────────────────────────────

/**
 * Search airports by keyword (name or IATA code) for autocomplete.
 *
 * @param {Object} params
 * @param {string}  params.keyword  — partial name or IATA code (min 2 chars)
 * @param {number}  [params.limit=10]
 * @returns {Promise<NormalisedAirport[]>}
 */
async function searchAirports(params) {
  logger.info(`[FlightsService] searchAirports keyword="${params?.keyword}"`)
  return flightProvider.searchAirports(params)
}

// ── searchAirportsByCity ──────────────────────────────────────────────────────

/**
 * Find all airports serving a given city.
 *
 * @param {string} city  — City name e.g. "Mumbai"
 * @param {number} [limit=10]
 * @returns {Promise<NormalisedAirport[]>}
 */
async function searchAirportsByCity(city, limit = 10) {
  logger.info(`[FlightsService] searchAirportsByCity city="${city}"`)
  return flightProvider.searchAirportsByCity(city, limit)
}

// ── searchFlights ─────────────────────────────────────────────────────────────

/**
 * Search scheduled flights between two airports.
 *
 * @param {Object} params
 * @param {string}  params.depIata      — Departure IATA code (e.g. "DEL")
 * @param {string}  params.arrIata      — Arrival IATA code (e.g. "BOM")
 * @param {string}  [params.flightDate] — ISO date "YYYY-MM-DD" (defaults to today)
 * @param {number}  [params.limit=10]
 * @returns {Promise<{ flights: NormalisedFlight[], total: number, meta: Object }>}
 */
async function searchFlights(params) {
  const {
    depIata,
    arrIata,
    flightDate = new Date().toISOString().split('T')[0],
    limit = 10,
  } = params

  logger.info(`[FlightsService] searchFlights ${depIata}→${arrIata} on ${flightDate}`)

  const flights = await flightProvider.searchFlights({ depIata, arrIata, flightDate, limit })

  return {
    flights,
    total: flights.length,
    meta: {
      depIata,
      arrIata,
      flightDate,
      limit,
      provider: 'AviationStack',
    },
  }
}

// ── getFlightStatus ───────────────────────────────────────────────────────────

/**
 * Get live status for a specific flight.
 *
 * @param {Object} params
 * @param {string}  params.flightIata  — e.g. "AI302"
 * @param {string}  [params.flightDate] — ISO date (defaults to today)
 * @returns {Promise<NormalisedFlight | null>}
 */
async function getFlightStatus(params) {
  const {
    flightIata,
    flightDate = new Date().toISOString().split('T')[0],
  } = params

  logger.info(`[FlightsService] getFlightStatus flight="${flightIata}" date="${flightDate}"`)
  return flightProvider.getFlightStatus({ flightIata, flightDate })
}

// ── getAirlineDetails ─────────────────────────────────────────────────────────

/**
 * Get airline details by IATA code(s).
 *
 * @param {string|string[]} codes — IATA code(s), e.g. "AI" or ["AI","6E"]
 * @returns {Promise<NormalisedAirline[]>}
 */
async function getAirlineDetails(codes) {
  const codeList = Array.isArray(codes) ? codes : [codes]
  logger.info(`[FlightsService] getAirlineDetails codes=[${codeList.join(',')}]`)
  return flightProvider.getAirlines(codeList)
}

// ── Health ────────────────────────────────────────────────────────────────────

async function getProviderHealth() {
  return flightProvider.healthStatus()
}

function isProviderEnabled() {
  return flightProvider.isEnabled()
}

module.exports = {
  searchAirports,
  searchAirportsByCity,
  searchFlights,
  getFlightStatus,
  getAirlineDetails,
  getProviderHealth,
  isProviderEnabled,
}
