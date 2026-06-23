// backend/src/validators/weather.validator.js
// ─────────────────────────────────────────────────────────────────────────────
// Joi validation schemas for the Weather Intelligence API.
// ─────────────────────────────────────────────────────────────────────────────
const Joi = require('joi')

// ── Shared location schema (city OR lat+lon required) ─────────────────────────

/**
 * Resolves to either city or lat/lon.
 * At least one of city or (lat AND lon) must be present.
 */
const locationSchema = Joi.object({
  city: Joi.string().trim().min(2).max(100).optional()
    .description('City name, e.g. "Goa", "Jaipur,IN", "Paris"'),

  lat: Joi.number().min(-90).max(90).optional()
    .description('Latitude (-90 to 90)'),

  lon: Joi.number().min(-180).max(180).optional()
    .description('Longitude (-180 to 180)'),
}).or('city', 'lat')  // require at least one
  .and('lat', 'lon')  // if lat is provided, lon must be too
  .messages({
    'object.missing': 'Either "city" or coordinates ("lat" and "lon") are required',
    'object.and':     '"lon" is required when "lat" is provided',
  })

// ── currentQuerySchema ────────────────────────────────────────────────────────

/**
 * GET /api/v1/weather/current?city=Goa
 * GET /api/v1/weather/current?lat=15.5&lon=73.8
 */
const currentQuerySchema = locationSchema.keys({
  refresh: Joi.boolean()
    .default(false)
    .optional()
    .truthy('true', '1')
    .falsy('false', '0')
    .description('Force a cache bypass and re-fetch fresh data'),
})

// ── forecastQuerySchema ────────────────────────────────────────────────────────

/**
 * GET /api/v1/weather/forecast?city=Goa
 */
const forecastQuerySchema = locationSchema.keys({
  days: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .default(5)
    .optional()
    .description('Number of forecast days to return (1–5, default 5)'),

  startDate: Joi.string()
    .isoDate()
    .optional()
    .description('Filter forecast from this date (ISO: YYYY-MM-DD)'),
})

// ── intelligenceQuerySchema ───────────────────────────────────────────────────

/**
 * GET /api/v1/weather?city=Goa  (full intelligence endpoint)
 */
const intelligenceQuerySchema = locationSchema.keys({
  refresh: Joi.boolean()
    .default(false)
    .optional()
    .truthy('true', '1')
    .falsy('false', '0'),
})

// ── suitabilityQuerySchema ────────────────────────────────────────────────────

/**
 * GET /api/v1/weather/suitability?city=Goa
 * Optional date range for trip planning suitability.
 */
const suitabilityQuerySchema = locationSchema.keys({
  startDate: Joi.string()
    .isoDate()
    .optional()
    .description('Trip start date (ISO: YYYY-MM-DD)'),

  days: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .default(5)
    .optional()
    .description('Trip duration in days'),
})

module.exports = {
  currentQuerySchema,
  forecastQuerySchema,
  intelligenceQuerySchema,
  suitabilityQuerySchema,
}
