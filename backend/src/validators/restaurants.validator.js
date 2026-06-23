// backend/src/validators/restaurants.validator.js
// ─────────────────────────────────────────────────────────────────────────────
// Joi validation schemas for the Restaurant Discovery API.
// ─────────────────────────────────────────────────────────────────────────────
const Joi = require('joi')

// ── Reusable fields ───────────────────────────────────────────────────────────

const limitField = Joi.number()
  .integer()
  .min(1)
  .max(50)
  .default(20)
  .optional()

const priceLevelField = Joi.number()
  .integer()
  .min(1)
  .max(4)
  .optional()
  .description('Price level 1–4: 1=Budget, 2=Moderate, 3=Upscale, 4=Fine Dining')

const sortField = Joi.string()
  .valid('RATING', 'DISTANCE', 'POPULARITY', 'RELEVANCE')
  .default('RATING')
  .optional()

// ── cityQuerySchema ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/restaurants/city
 * Query: { city, limit?, radius?, cuisine?, openNow?, minPrice?, maxPrice? }
 */
const cityQuerySchema = Joi.object({
  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'City name is required',
      'string.min':   'City name must be at least 2 characters',
      'any.required': 'City name is required',
    }),

  limit: limitField,

  radius: Joi.number()
    .integer()
    .min(200)
    .max(50000)
    .default(5000)
    .optional()
    .description('Search radius in meters around city centre (200–50000)'),

  cuisine: Joi.string()
    .trim()
    .max(50)
    .optional()
    .description('Cuisine filter, e.g. "Indian", "Chinese", "Pizza"'),

  openNow: Joi.boolean()
    .default(false)
    .optional()
    .truthy('true', '1')
    .falsy('false', '0'),

  minPrice: priceLevelField,
  maxPrice: priceLevelField,
})

// ── nearbyQuerySchema ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/restaurants/nearby
 * Query: { lat, lon, radius?, limit?, query?, openNow?, minPrice?, maxPrice?, sort? }
 */
const nearbyQuerySchema = Joi.object({
  lat: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.base':  'lat must be a valid number',
      'any.required': 'lat (latitude) is required',
    }),

  lon: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.base':  'lon must be a valid number',
      'any.required': 'lon (longitude) is required',
    }),

  radius: Joi.number()
    .integer()
    .min(100)
    .max(50000)
    .default(2000)
    .optional()
    .description('Search radius in meters (100–50000)'),

  limit: limitField,

  query: Joi.string()
    .trim()
    .max(100)
    .optional()
    .description('Free-text search query, e.g. "biryani", "vegan pizza"'),

  openNow: Joi.boolean()
    .default(false)
    .optional()
    .truthy('true', '1')
    .falsy('false', '0'),

  minPrice: priceLevelField,
  maxPrice: priceLevelField,

  sort: sortField,
})

// ── fsqIdParamSchema ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/restaurants/:fsqId
 * Params: { fsqId }
 */
const fsqIdParamSchema = Joi.object({
  fsqId: Joi.string()
    .pattern(/^[a-zA-Z0-9]+$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty':        'Restaurant ID (fsqId) is required',
      'string.pattern.base': 'Invalid restaurant ID format',
      'any.required':        'Restaurant ID (fsqId) is required',
    }),
})

module.exports = {
  cityQuerySchema,
  nearbyQuerySchema,
  fsqIdParamSchema,
}
