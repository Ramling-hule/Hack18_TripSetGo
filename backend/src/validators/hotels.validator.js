// backend/src/validators/hotels.validator.js
// ─────────────────────────────────────────────────────────────────────────────
// Joi validation schemas for Hotel Discovery API (Foursquare).
// ─────────────────────────────────────────────────────────────────────────────
const Joi = require('joi')

// ── Shared ────────────────────────────────────────────────────────────────────
const limitField = Joi.number().integer().min(1).max(50).default(20)
const radiusField = Joi.number().integer().min(500).max(100000).default(5000)
const latField = Joi.number().min(-90).max(90).required()
const lonField = Joi.number().min(-180).max(180).required()

// ── Schemas ───────────────────────────────────────────────────────────────────

const hotelSearchSchema = Joi.object({
  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'City name is required',
      'any.required': 'City name is required',
    }),
  limit: limitField,
  radius: radiusField,
})

const hotelNearbySchema = Joi.object({
  lat: latField,
  lon: lonField,
  limit: limitField,
  radius: radiusField,
})

const hotelDetailSchema = Joi.object({
  fsqId: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Foursquare Place ID (fsqId) is required',
      'any.required': 'Foursquare Place ID (fsqId) is required',
    }),
})

module.exports = {
  hotelSearchSchema,
  hotelNearbySchema,
  hotelDetailSchema,
}
