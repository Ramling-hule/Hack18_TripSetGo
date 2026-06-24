// backend/src/models/Restaurant.model.js
// ─────────────────────────────────────────────────────────────────────────────
// Extended Restaurant model with Foursquare fields for the Restaurant
// Discovery Service. Persists normalised data from FSQ Places API v3.
//
// Persistence strategy:
//   - Primary upsert key: `fsqId` (FSQ unique ID) — sparse unique index
//   - Geospatial: 2dsphere index on `location` for nearby queries
//   - Compound indexes: (city, averageRating), (city, cuisines), (city, priceLevel)
//   - Staleness: `lastFetchedAt` — re-fetch from FSQ if older than 6h
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose')

// ── Opening Hours Sub-schema ──────────────────────────────────────────────────
const openingHoursSchema = new mongoose.Schema({
  display:     { type: String, default: null },
  isOpen:      { type: Boolean, default: null },
  openNowText: { type: String,  default: null },
  periods:     [mongoose.Schema.Types.Mixed],  // FSQ regular hours periods
}, { _id: false })

// ── Price Info Sub-schema ─────────────────────────────────────────────────────
const priceInfoSchema = new mongoose.Schema({
  level:    { type: Number, min: 1, max: 4 },
  label:    { type: String },   // Budget | Moderate | Upscale | Fine Dining
  rangeINR: { type: String },   // e.g. "₹200–₹500"
}, { _id: false })

// ── Category Sub-schema ───────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  id:        { type: Number },
  name:      { type: String },
  shortName: { type: String },
  icon:      { type: String, default: null },
}, { _id: false })

// ── Main Schema ───────────────────────────────────────────────────────────────
const restaurantSchema = new mongoose.Schema({

  // ── Core identity ────────────────────────────────────────────────────────
  name: {
    type:     String,
    required: true,
    trim:     true,
    index:    true,
  },

  // ── Foursquare source fields ──────────────────────────────────────────────

  /**
   * FSQ unique place identifier — primary upsert key.
   * Sparse to allow non-FSQ documents without an fsqId.
   */
  fsqId: {
    type:   String,
    index:  true,
    sparse: true,
    unique: true,
    trim:   true,
  },

  /**
   * Data source provider name.
   */
  source: {
    type:    String,
    default: 'Foursquare',
    index:   true,
  },

  // ── Location ──────────────────────────────────────────────────────────────
  location: {
    type:        { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  address: {
    type:     String,
    required: false,
    default:  null,
  },
  city: {
    type:     String,
    required: true,
    index:    true,
    trim:     true,
  },
  neighborhood: {
    type:    String,
    default: null,
  },

  // ── Cuisine & dietary ─────────────────────────────────────────────────────
  cuisines: {
    type:    [String],
    default: [],
    index:   true,
  },
  dietaryOptions: {
    type:    [String],
    enum:    ['Vegan', 'Vegetarian', 'Gluten-Free', 'Halal'],
    default: [],
  },
  tastes: {
    type:    [String],
    default: [],
  },

  // ── Ratings ───────────────────────────────────────────────────────────────
  averageRating: {
    type:    Number,
    default: 0,
    min:     0,
    max:     5,
    index:   true,
  },
  reviewCount: {
    type:    Number,
    default: 0,
  },
  totalPhotos: {
    type:    Number,
    default: 0,
  },
  popularityScore: {
    type:    Number,
    default: null,
    min:     0,
    max:     100,
  },

  // ── Price ─────────────────────────────────────────────────────────────────
  priceLevel: {
    type: Number,
    min:  1,
    max:  4,
    default: null,
    index: true,
  },
  priceInfo: {
    type: priceInfoSchema,
    default: null,
  },

  // ── Media ─────────────────────────────────────────────────────────────────
  images: {
    type:    [String],
    default: [],
  },

  // ── Hours ─────────────────────────────────────────────────────────────────
  openingHours: {
    type:    openingHoursSchema,
    default: null,
  },
  isOpenNow: {
    type:    Boolean,
    default: null,
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  phone: {
    type:    String,
    default: null,
  },
  website: {
    type:    String,
    default: null,
  },
  menu: {
    type:    String,
    default: null,
  },

  // ── FSQ categories ────────────────────────────────────────────────────────
  categories: {
    type:    [categorySchema],
    default: [],
  },

  // ── Metadata ──────────────────────────────────────────────────────────────
  verified: {
    type:    Boolean,
    default: false,
  },
  description: {
    type:    String,
    default: null,
  },

  /**
   * Timestamp of last successful FSQ fetch.
   * Used to determine staleness (> 6h = stale, re-fetch).
   */
  lastFetchedAt: {
    type:    Date,
    default: null,
    index:   true,
  },

}, { timestamps: true })

// ── Indexes ───────────────────────────────────────────────────────────────────

// Geospatial — near restaurant queries
restaurantSchema.index({ location: '2dsphere' })

// City browsing with rating sort
restaurantSchema.index({ city: 1, averageRating: -1 })

// Cuisine filtering per city
restaurantSchema.index({ city: 1, cuisines: 1, averageRating: -1 })

// Price filtering per city
restaurantSchema.index({ city: 1, priceLevel: 1 })

// Global popularity leaderboard
restaurantSchema.index({ popularityScore: -1 })

// Text search on name and description
restaurantSchema.index({ name: 'text', description: 'text' })

// ── Virtual ───────────────────────────────────────────────────────────────────

/**
 * isStale: true if lastFetchedAt is older than 6 hours.
 * Restaurants change more frequently than attractions.
 */
restaurantSchema.virtual('isStale').get(function () {
  if (!this.lastFetchedAt) return true
  return Date.now() - this.lastFetchedAt.getTime() > 6 * 60 * 60 * 1000
})

// Register hooks before compilation
const { registerSyncHooks, INDICES, shapeRestaurant } = require('../services/es.sync')
const { registerCacheInvalidationSchemaHooks } = require('../services/cacheInvalidator')

registerSyncHooks(restaurantSchema, INDICES.restaurants, shapeRestaurant)
registerCacheInvalidationSchemaHooks(restaurantSchema, 'restaurant')

module.exports = mongoose.model('Restaurant', restaurantSchema)
