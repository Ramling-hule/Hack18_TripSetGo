// backend/src/routes/flights.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Flight Search Engine routes (AviationStack).
//
// Base path: /api/v1/flights  (mounted in routes/index.js)
// ─────────────────────────────────────────────────────────────────────────────
const router         = require('express').Router()
const flightsCtrl    = require('../controllers/flights.controller')
const cache          = require('../middleware/cache.middleware')
const validate       = require('../middleware/validate.middleware')
const { optionalAuth } = require('../middleware/auth.middleware')

const {
  airportSearchSchema,
  airportsByCitySchema,
  flightSearchSchema,
  flightStatusSchema,
  airlineSchema,
} = require('../validators/flights.validator')

// ── Health check (no cache, no auth) ─────────────────────────────────────────
router.get('/health', flightsCtrl.getHealth)

// ── Airport autocomplete (24h cache — airport data is static) ─────────────────
router.get(
  '/airports',
  optionalAuth,
  validate({ query: airportSearchSchema }),
  cache('flights:airports', 86400),
  flightsCtrl.searchAirports
)

// ── Airport by city (7 days cache) ────────────────────────────────────────────
router.get(
  '/airports/city',
  optionalAuth,
  validate({ query: airportsByCitySchema }),
  cache('flights:airports:city', 604800),
  flightsCtrl.searchAirportsByCity
)

// ── Flight search (30 min cache) ──────────────────────────────────────────────
router.get(
  '/search',
  optionalAuth,
  validate({ query: flightSearchSchema }),
  cache('flights:search', 1800),
  flightsCtrl.searchFlights
)

// ── Live Flight Status (2 min cache) ──────────────────────────────────────────
router.get(
  '/status',
  optionalAuth,
  validate({ query: flightStatusSchema }),
  cache('flights:status', 120),
  flightsCtrl.getFlightStatus
)

// ── Airline details (24h cache — static data) ─────────────────────────────────
router.get(
  '/airlines',
  optionalAuth,
  validate({ query: airlineSchema }),
  cache('flights:airlines', 86400),
  flightsCtrl.getAirlines
)

module.exports = router
