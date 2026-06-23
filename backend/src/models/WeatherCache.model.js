// backend/src/models/WeatherCache.model.js
// ─────────────────────────────────────────────────────────────────────────────
// MongoDB persistence for weather intelligence data.
//
// Strategy:
//   - Upsert by `locationKey` (city name normalised, or "lat,lon" rounded 2dp)
//   - Separate documents for current weather vs. forecast to avoid large docs
//   - TTL index auto-expires current records after 10 min, forecast after 1h
//   - `travelScore` and `packingList` persist computed intelligence per city
//   - Used as L3 cache (Redis L1→L2, MongoDB L3) when Redis is cold
//
// Collections:
//   weather_current  — current weather snapshot per location
//   weather_forecast — 5-day forecast per location
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose')

// ── Current Weather Schema ────────────────────────────────────────────────────

const currentWeatherSchema = new mongoose.Schema({

  /** Canonical location key — "city,countrycode" or "lat,lon" (2dp) */
  locationKey: {
    type:     String,
    required: true,
    unique:   true,
    index:    true,
  },

  /** Display city name from OWM response */
  cityName: { type: String, default: null },

  // ── Temperature ───────────────────────────────────────────────────────────
  tempC:       { type: Number },
  feelsLikeC:  { type: Number },
  tempMinC:    { type: Number },
  tempMaxC:    { type: Number },
  humidity:    { type: Number },  // %
  pressure:    { type: Number },  // hPa

  // ── Wind ──────────────────────────────────────────────────────────────────
  windKmh:     { type: Number },
  windDeg:     { type: Number },  // degrees
  windGustKmh: { type: Number },

  // ── Condition ─────────────────────────────────────────────────────────────
  conditionId:   { type: Number },
  conditionMain: { type: String },
  conditionDesc: { type: String },
  conditionIcon: { type: String },  // emoji icon
  owmIconCode:   { type: String },  // OWM icon code e.g. "10d"

  // ── Visibility & UV ───────────────────────────────────────────────────────
  visibilityM:   { type: Number },
  uvIndex:       { type: Number, default: null },
  cloudCover:    { type: Number },  // %

  // ── Rain / Snow ───────────────────────────────────────────────────────────
  rainMm1h:   { type: Number, default: null },
  snowMm1h:   { type: Number, default: null },

  // ── Travel Intelligence (computed) ────────────────────────────────────────
  travelScore: {
    overall:        { type: Number, min: 0, max: 100 },
    label:          { type: String },  // Excellent | Good | Fair | Poor | Avoid
    breakdown: {
      temperature:  { type: Number },
      precipitation:{ type: Number },
      wind:         { type: Number },
      visibility:   { type: Number },
      humidity:     { type: Number },
    },
    advisory: { type: String },
  },

  // ── Sun ───────────────────────────────────────────────────────────────────
  sunriseAt: { type: String, default: null },  // ISO time string
  sunsetAt:  { type: String, default: null },

  // ── Source ────────────────────────────────────────────────────────────────
  source:      { type: String, default: 'OpenWeather' },
  observedAt:  { type: Date },

  /** TTL field — auto-expire document after 10 min (600s) */
  expiresAt: {
    type:    Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000),
    index:   { expireAfterSeconds: 0 },
  },

}, { timestamps: true, collection: 'weather_current' })

// ── Forecast Schema ───────────────────────────────────────────────────────────

const forecastDaySchema = new mongoose.Schema({
  date:          { type: String },   // 'YYYY-MM-DD'
  tempMinC:      { type: Number },
  tempMaxC:      { type: Number },
  avgTempC:      { type: Number },
  avgHumidity:   { type: Number },
  avgWindKmh:    { type: Number },
  conditionMain: { type: String },
  conditionDesc: { type: String },
  conditionIcon: { type: String },
  rainProbability: { type: Number },  // 0–100%
  rainMm:        { type: Number, default: 0 },
  snowMm:        { type: Number, default: 0 },
  uvIndex:       { type: Number, default: null },
  advisory:      { type: String },
  travelScore:   { type: Number },    // 0–100
  slots:         { type: Number },    // number of 3h slots used
}, { _id: false })

const forecastWeatherSchema = new mongoose.Schema({
  locationKey: {
    type:     String,
    required: true,
    unique:   true,
    index:    true,
  },
  cityName:     { type: String, default: null },
  country:      { type: String, default: null },

  // ── Forecast days ────────────────────────────────────────────────────────
  forecast:     [forecastDaySchema],
  forecastDays: { type: Number },

  // ── Trip intelligence (computed across all forecast days) ─────────────────
  packingList: {
    essentials:   [String],
    clothing:     [String],
    accessories:  [String],
    healthAndSafety: [String],
    documents:    [String],
  },
  travelSummary: {
    bestDays:     [String],  // dates best for outdoor activity
    rainDays:     [String],  // dates with high rain probability
    avgTravelScore: { type: Number },
    overallLabel:   { type: String },
    headline:       { type: String },
  },

  source:    { type: String, default: 'OpenWeather' },
  fetchedAt: { type: Date },

  /** TTL — auto-expire after 1 hour */
  expiresAt: {
    type:    Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000),
    index:   { expireAfterSeconds: 0 },
  },

}, { timestamps: true, collection: 'weather_forecast' })

const WeatherCurrent  = mongoose.model('WeatherCurrent', currentWeatherSchema)
const WeatherForecast = mongoose.model('WeatherForecast', forecastWeatherSchema)

module.exports = { WeatherCurrent, WeatherForecast }
