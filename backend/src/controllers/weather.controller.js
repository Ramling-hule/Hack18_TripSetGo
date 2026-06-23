// backend/src/controllers/weather.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Weather Intelligence API — Express controllers.
//
// Handled routes:
//   GET /api/v1/weather/health        → provider health check
//   GET /api/v1/weather               → full intelligence (current + forecast + packing)
//   GET /api/v1/weather/current       → current conditions only
//   GET /api/v1/weather/forecast      → 5-day forecast with rain probability
//   GET /api/v1/weather/suitability   → travel suitability scores per day
//   GET /api/v1/weather/packing       → categorised packing recommendations
//
// All handlers use asyncHandler for error forwarding.
// Input is pre-validated by validate.middleware.js (Joi schemas).
// ─────────────────────────────────────────────────────────────────────────────
const weatherService = require('../services/weather.service')
const asyncHandler   = require('../utils/asyncHandler')
const { success, error, notFound } = require('../utils/response')
const logger         = require('../utils/logger')

// ── Provider guard helper ─────────────────────────────────────────────────────

function providerDisabledResponse(res) {
  return error(
    res,
    'Weather service is unavailable — provider not configured. ' +
    'Set OPENWEATHER_API_KEY_1 in .env (free key at https://openweathermap.org/api)',
    503
  )
}

/**
 * Extract location params from validated query.
 * Always prefers coordinates over city name.
 */
function extractLocation(query) {
  const { city, lat, lon } = query
  return lat != null && lon != null
    ? { lat: parseFloat(lat), lon: parseFloat(lon) }
    : { city }
}

// ── GET /api/v1/weather ───────────────────────────────────────────────────────

/**
 * Full weather intelligence payload:
 * current + 5-day forecast + travel suitability + packing list.
 *
 * Query params:
 *   city    {string}  — e.g. "Goa" or "Paris,FR"
 *   lat     {number}  — latitude (takes precedence)
 *   lon     {number}  — longitude
 *   refresh {boolean} — bypass cache
 */
exports.getIntelligence = asyncHandler(async (req, res) => {
  if (!weatherService.isProviderEnabled()) return providerDisabledResponse(res)

  const location = extractLocation(req.query)
  const label    = location.city || `${location.lat},${location.lon}`
  logger.info(`[WeatherCtrl] getIntelligence for "${label}"`)

  const data = await weatherService.getWeatherIntelligence(location)
  if (!data) return notFound(res, `Weather data not available for "${label}"`)

  success(res, {
    location: {
      cityName: data.current?.cityName || label,
      country:  data.current?.country  || null,
      coords:   data.current?.coords   || null,
    },
    current:       data.current,
    forecast:      data.forecast,
    packingList:   data.packingList,
    travelSummary: data.travelSummary,
    meta: {
      source:    data.source,
      fetchedAt: data.fetchedAt,
      cached:    data.cached,
      query:     location,
    },
  }, `Weather intelligence for "${data.current?.cityName || label}"`)
})

// ── GET /api/v1/weather/current ───────────────────────────────────────────────

/**
 * Current weather conditions only.
 *
 * Query: city | (lat + lon)
 */
exports.getCurrent = asyncHandler(async (req, res) => {
  if (!weatherService.isProviderEnabled()) return providerDisabledResponse(res)

  const location = extractLocation(req.query)
  const label    = location.city || `${location.lat},${location.lon}`
  logger.info(`[WeatherCtrl] getCurrent for "${label}"`)

  const data = await weatherService.getCurrentWeather(location)
  if (!data?.current) return notFound(res, `Current weather not available for "${label}"`)

  success(res, {
    location: {
      cityName: data.current.cityName || label,
      country:  data.current.country  || null,
    },
    current:  data.current,
    meta: {
      source:    data.source,
      fetchedAt: data.fetchedAt,
      cached:    data.cached,
    },
  }, `Current weather for "${data.current.cityName || label}"`)
})

// ── GET /api/v1/weather/forecast ──────────────────────────────────────────────

/**
 * 5-day weather forecast with per-day travel scores and rain probability.
 *
 * Query: city | (lat + lon), days?, startDate?
 */
exports.getForecast = asyncHandler(async (req, res) => {
  if (!weatherService.isProviderEnabled()) return providerDisabledResponse(res)

  const location  = extractLocation(req.query)
  const days      = parseInt(req.query.days, 10) || 5
  const startDate = req.query.startDate || null
  const label     = location.city || `${location.lat},${location.lon}`
  logger.info(`[WeatherCtrl] getForecast for "${label}" days=${days}`)

  const data = await weatherService.getForecast(location)
  if (!data) return notFound(res, `Forecast not available for "${label}"`)

  // Apply date and day limit filters
  let forecast = data.forecast || []
  if (startDate) {
    forecast = forecast.filter(d => d.date >= startDate)
  }
  forecast = forecast.slice(0, days)

  success(res, {
    location: {
      cityName: data.location || label,
    },
    forecast,
    forecastDays:  forecast.length,
    travelSummary: data.travelSummary,
    meta: {
      source:    data.source,
      fetchedAt: data.fetchedAt,
      cached:    data.cached,
      requested: { days, startDate },
    },
  }, `${forecast.length}-day forecast for "${data.location || label}"`)
})

// ── GET /api/v1/weather/suitability ──────────────────────────────────────────

/**
 * Travel suitability scores per day — lightweight payload for trip planners.
 *
 * Query: city | (lat + lon), days?, startDate?
 */
exports.getSuitability = asyncHandler(async (req, res) => {
  if (!weatherService.isProviderEnabled()) return providerDisabledResponse(res)

  const location  = extractLocation(req.query)
  const days      = parseInt(req.query.days, 10) || 5
  const startDate = req.query.startDate || null
  const label     = location.city || `${location.lat},${location.lon}`
  logger.info(`[WeatherCtrl] getSuitability for "${label}"`)

  const data = await weatherService.getTravelSuitability(location)
  if (!data) return notFound(res, `Travel suitability data not available for "${label}"`)

  // Apply filters
  let forecast = data.forecast || []
  if (startDate) forecast = forecast.filter(d => d.date >= startDate)
  forecast = forecast.slice(0, days)

  success(res, {
    location:      data.current?.location || label,
    currentScore:  data.current,
    forecast,
    travelSummary: data.travelSummary,
    meta: {
      source:    data.source,
      cached:    data.cached,
      scoreInfo: {
        description: 'Score 0–100. Excellent ≥85, Good ≥70, Fair ≥50, Poor ≥30, Avoid <30',
        dimensions: 'Temperature (25), Precipitation+RainProb (30), Wind (20), Visibility (15), Humidity (10)',
      },
    },
  }, `Travel suitability for "${label}"`)
})

// ── GET /api/v1/weather/packing ───────────────────────────────────────────────

/**
 * Categorised packing recommendations based on forecast.
 *
 * Query: city | (lat + lon)
 *
 * Response:
 *   packingList.essentials      — always-carry items
 *   packingList.clothing        — weather-appropriate clothing
 *   packingList.accessories     — bags, umbrellas, sunglasses
 *   packingList.healthAndSafety — sunscreen, medications
 *   packingList.documents       — ID, insurance
 */
exports.getPackingRecommendations = asyncHandler(async (req, res) => {
  if (!weatherService.isProviderEnabled()) return providerDisabledResponse(res)

  const location = extractLocation(req.query)
  const label    = location.city || `${location.lat},${location.lon}`
  logger.info(`[WeatherCtrl] getPackingRecommendations for "${label}"`)

  const data = await weatherService.getPackingRecommendations(location)
  if (!data) return notFound(res, `Packing data not available for "${label}"`)

  success(res, {
    location:      data.location || label,
    packingList:   data.packingList,
    travelSummary: data.travelSummary,
    forecastPreview: data.forecast,
    meta: {
      source:    data.source,
      cached:    data.cached,
    },
  }, `Packing recommendations for "${data.location || label}"`)
})

// ── GET /api/v1/weather/health ────────────────────────────────────────────────

/**
 * Provider health check — circuit breaker state, key availability, enabled flag.
 */
exports.getHealth = asyncHandler(async (req, res) => {
  const health  = await weatherService.getProviderHealth()
  const enabled = weatherService.isProviderEnabled()

  success(res, {
    provider: health,
    enabled,
    service: 'WeatherIntelligence',
  }, 'Weather provider health check')
})
