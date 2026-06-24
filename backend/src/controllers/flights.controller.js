// backend/src/controllers/flights.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Flight Search Engine — Express controllers.
//
// Handled routes:
//   GET  /api/v1/flights/health        → provider health
//   GET  /api/v1/flights/airports      → airport autocomplete
//   GET  /api/v1/flights/airports/city → airport search by city
//   GET  /api/v1/flights/search        → flight schedule search
//   GET  /api/v1/flights/status        → live flight status
//   GET  /api/v1/flights/airlines      → airline details
// ─────────────────────────────────────────────────────────────────────────────
const flightsService = require('../services/flights.service')
const asyncHandler   = require('../utils/asyncHandler')
const { success, error, notFound } = require('../utils/response')
const logger         = require('../utils/logger')

// ── Provider guard ────────────────────────────────────────────────────────────

function providerDisabledResponse(res) {
  return error(
    res,
    'Flight search is unavailable — AviationStack credentials not configured. ' +
    'Set AVIATIONSTACK_API_KEY_1 in .env (get free test credentials at https://aviationstack.com)',
    503
  )
}

// ── GET /api/v1/flights/airports ──────────────────────────────────────────────

exports.searchAirports = asyncHandler(async (req, res) => {
  if (!flightsService.isProviderEnabled()) return providerDisabledResponse(res)

  const { keyword, limit } = req.query
  logger.info(`[FlightsCtrl] searchAirports keyword="${keyword}"`)

  const airports = await flightsService.searchAirports({
    keyword,
    limit: parseInt(limit, 10) || 10,
  })

  success(
    res,
    { airports, total: airports.length, query: keyword },
    airports.length > 0
      ? `Found ${airports.length} airport${airports.length !== 1 ? 's' : ''} matching "${keyword}"`
      : `No airports found for "${keyword}"`
  )
})

// ── GET /api/v1/flights/airports/city ─────────────────────────────────────────

exports.searchAirportsByCity = asyncHandler(async (req, res) => {
  if (!flightsService.isProviderEnabled()) return providerDisabledResponse(res)

  const { city, limit } = req.query
  logger.info(`[FlightsCtrl] searchAirportsByCity city="${city}"`)

  const airports = await flightsService.searchAirportsByCity(city, parseInt(limit, 10) || 10)

  success(
    res,
    { airports, total: airports.length, query: city },
    airports.length > 0
      ? `Found ${airports.length} airport${airports.length !== 1 ? 's' : ''} serving "${city}"`
      : `No airports found for "${city}"`
  )
})

// ── GET /api/v1/flights/search ────────────────────────────────────────────────

exports.searchFlights = asyncHandler(async (req, res) => {
  if (!flightsService.isProviderEnabled()) return providerDisabledResponse(res)

  const { depIata, arrIata, flightDate, limit } = req.query

  logger.info(`[FlightsCtrl] searchFlights ${depIata}→${arrIata} on ${flightDate || 'today'}`)

  const result = await flightsService.searchFlights({
    depIata:    depIata.toUpperCase(),
    arrIata:    arrIata.toUpperCase(),
    flightDate: flightDate || undefined,
    limit:      parseInt(limit, 10) || 10,
  })

  success(
    res,
    {
      flights:  result.flights,
      total:    result.total,
      meta:     result.meta,
      provider: 'AviationStack',
    },
    result.total > 0
      ? `Found ${result.total} flight${result.total !== 1 ? 's' : ''} from ${depIata} to ${arrIata}`
      : `No flights found from ${depIata} to ${arrIata}`
  )
})

// ── GET /api/v1/flights/status ────────────────────────────────────────────────

exports.getFlightStatus = asyncHandler(async (req, res) => {
  if (!flightsService.isProviderEnabled()) return providerDisabledResponse(res)

  const { flightIata, flightDate } = req.query
  logger.info(`[FlightsCtrl] getFlightStatus flight="${flightIata}"`)

  const flight = await flightsService.getFlightStatus({ flightIata, flightDate })

  if (!flight) {
    return notFound(res, `Status not found for flight ${flightIata}`)
  }

  success(
    res,
    { flight, provider: 'AviationStack' },
    `Status for ${flightIata}: ${flight.status}`
  )
})

// ── GET /api/v1/flights/airlines ──────────────────────────────────────────────

exports.getAirlines = asyncHandler(async (req, res) => {
  if (!flightsService.isProviderEnabled()) return providerDisabledResponse(res)

  const { codes } = req.query
  const codeList = codes.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)

  logger.info(`[FlightsCtrl] getAirlines codes=[${codeList.join(',')}]`)

  const airlines = await flightsService.getAirlineDetails(codeList)

  if (!airlines.length) {
    return notFound(res, `No airline details found for codes: ${codeList.join(', ')}`)
  }

  success(res, { airlines, total: airlines.length }, `Airline details for ${codeList.join(', ')}`)
})

// ── GET /api/v1/flights/health ────────────────────────────────────────────────

exports.getHealth = asyncHandler(async (req, res) => {
  const health  = await flightsService.getProviderHealth()
  const enabled = flightsService.isProviderEnabled()

  success(res, {
    provider: health,
    enabled,
    service: 'FlightSearchEngine',
    note:    'Running against AviationStack (HTTP Free Tier)',
  }, 'Flight provider health check')
})
