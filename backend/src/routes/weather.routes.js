// backend/src/routes/weather.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Weather Intelligence API routes.
//
// Base path: /api/v1/weather  (mounted in routes/index.js)
//
// Endpoints:
//   GET /health       → provider health check (no cache)
//   GET /             → full intelligence: current + forecast + packing (10min cache)
//   GET /current      → current conditions only (10min cache)
//   GET /forecast     → 5-day forecast with rain probability (60min cache)
//   GET /suitability  → per-day travel suitability scores (10min cache)
//   GET /packing      → categorised packing recommendations (10min cache)
//
// Route order:
//   Named routes (/health, /current, /forecast, /suitability, /packing) must
//   be defined BEFORE any dynamic segment to avoid accidental swallowing.
//
// Cache namespaces:
//   weather:current   → 600s  (10 min)
//   weather:forecast  → 3600s (60 min)
// ─────────────────────────────────────────────────────────────────────────────
const router        = require('express').Router()
const weatherCtrl   = require('../controllers/weather.controller')
const cache         = require('../middleware/cache.middleware')
const validate      = require('../middleware/validate.middleware')
const { optionalAuth } = require('../middleware/auth.middleware')

const {
  intelligenceQuerySchema,
  currentQuerySchema,
  forecastQuerySchema,
  suitabilityQuerySchema,
} = require('../validators/weather.validator')

// ── Health check (no cache, no auth) ─────────────────────────────────────────
router.get(
  '/health',
  weatherCtrl.getHealth
)

// ── Current conditions (10 min cache) ────────────────────────────────────────
//
// GET /api/v1/weather/current?city=Goa
// GET /api/v1/weather/current?lat=15.5&lon=73.8
router.get(
  '/current',
  optionalAuth,
  validate({ query: currentQuerySchema }),
  cache('weather:current', 600),
  weatherCtrl.getCurrent
)

// ── 5-day forecast (60 min cache) ────────────────────────────────────────────
//
// GET /api/v1/weather/forecast?city=Goa&days=5&startDate=2025-01-10
router.get(
  '/forecast',
  optionalAuth,
  validate({ query: forecastQuerySchema }),
  cache('weather:forecast', 3600),
  weatherCtrl.getForecast
)

// ── Travel suitability scores (10 min cache) ──────────────────────────────────
//
// GET /api/v1/weather/suitability?city=Manali&days=5&startDate=2025-01-10
// Response: score 0-100 with label (Excellent/Good/Fair/Poor/Avoid) per day
router.get(
  '/suitability',
  optionalAuth,
  validate({ query: suitabilityQuerySchema }),
  cache('weather:current', 600),
  weatherCtrl.getSuitability
)

// ── Packing recommendations (10 min cache) ────────────────────────────────────
//
// GET /api/v1/weather/packing?city=Leh
// Response: { essentials, clothing, accessories, healthAndSafety, documents }
router.get(
  '/packing',
  optionalAuth,
  validate({ query: currentQuerySchema }),
  cache('weather:current', 600),
  weatherCtrl.getPackingRecommendations
)

// ── Full intelligence (10 min cache) ─────────────────────────────────────────
//
// GET /api/v1/weather?city=Goa
// GET /api/v1/weather?lat=15.5&lon=73.8
// Full payload: current + forecast + travel suitability + packing list
router.get(
  '/',
  optionalAuth,
  validate({ query: intelligenceQuerySchema }),
  cache('weather:current', 600),
  weatherCtrl.getIntelligence
)

module.exports = router
