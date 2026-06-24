// backend/src/validators/flights.validator.js
// ─────────────────────────────────────────────────────────────────────────────
// Joi validation schemas for the Flight Search Engine API (AviationStack).
// ─────────────────────────────────────────────────────────────────────────────
const Joi = require('joi')

// ── Reusable ──────────────────────────────────────────────────────────────────

const iataCodeField = Joi.string()
  .trim()
  .uppercase()
  .length(3)
  .pattern(/^[A-Z]{3}$/)
  .messages({
    'string.length':       'Airport code must be exactly 3 letters (IATA format)',
    'string.pattern.base': 'Airport code must be 3 uppercase letters (e.g. DEL, BOM)',
  })

const flightIataField = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z0-9]{2,3}\s*\d{1,4}$/)
  .messages({
    'string.pattern.base': 'Flight IATA code must be a valid airline code + number (e.g. "AI302", "6E 104")',
  })

const isoDateField = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
  })

const passengerCount = Joi.number().integer().min(0).max(9).default(0)

// ── airportSearchSchema ───────────────────────────────────────────────────────

/**
 * GET /api/v1/flights/airports?keyword=Delhi
 */
const airportSearchSchema = Joi.object({
  keyword: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Keyword is required (e.g. "Delhi", "DEL", "Mumbai")',
      'string.min':   'Keyword must be at least 2 characters',
      'any.required': 'Keyword is required',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional(),
})

// ── airportsByCitySchema ──────────────────────────────────────────────────────

/**
 * GET /api/v1/flights/airports/city?city=Mumbai
 */
const airportsByCitySchema = Joi.object({
  city: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'City name is required (e.g. "Mumbai")',
      'any.required': 'City name is required',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional(),
})

// ── flightSearchSchema ────────────────────────────────────────────────────────

/**
 * GET /api/v1/flights/search
 */
const flightSearchSchema = Joi.object({
  depIata: iataCodeField.required()
    .messages({ 'any.required': 'Departure airport code is required (e.g. "DEL")' }),

  arrIata: iataCodeField.required()
    .messages({ 'any.required': 'Arrival airport code is required (e.g. "BOM")' }),

  flightDate: isoDateField.optional()
    .description('Departure date (YYYY-MM-DD). Defaults to today if omitted.'),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional()
    .description('Maximum number of results (1–50)'),
})

// ── flightStatusSchema ────────────────────────────────────────────────────────

/**
 * GET /api/v1/flights/status
 */
const flightStatusSchema = Joi.object({
  flightIata: flightIataField.required()
    .messages({ 'any.required': 'Flight IATA code is required (e.g. "AI302")' }),

  flightDate: isoDateField.optional()
    .description('Flight date (YYYY-MM-DD). Defaults to today if omitted.'),
})

// ── airlineSchema ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/flights/airlines?codes=6E,AI
 */
const airlineSchema = Joi.object({
  codes: Joi.string()
    .pattern(/^[A-Z0-9]{2}(,[A-Z0-9]{2})*$/i)
    .required()
    .messages({
      'string.pattern.base': 'codes must be comma-separated 2-character IATA airline codes (e.g. "6E,AI")',
      'any.required':        'codes parameter is required (e.g. ?codes=6E,AI)',
    }),
})

module.exports = {
  airportSearchSchema,
  airportsByCitySchema,
  flightSearchSchema,
  flightStatusSchema,
  airlineSchema,
}
