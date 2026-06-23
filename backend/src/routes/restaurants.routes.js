// backend/src/routes/restaurants.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Restaurant Discovery API routes.
//
// Base path: /api/v1/restaurants  (mounted in routes/index.js)
//
// Endpoints:
//   GET /health        → provider health check (no cache, no auth)
//   GET /city          → search restaurants by city name (cached 15 min)
//   GET /nearby        → search nearby restaurants by lat/lon (cached 10 min)
//   GET /:fsqId        → get full restaurant details (cached 45 min)
//
// Route order matters:
//   /health, /city, /nearby must be defined BEFORE /:fsqId to avoid
//   the dynamic param swallowing the named routes.
//
// Cache namespaces (resolved by cache.middleware.js against TTL registry):
//   restaurants:city   → 900s
//   restaurants:nearby → 600s
//   restaurants:detail → 2700s
// ─────────────────────────────────────────────────────────────────────────────
const router          = require('express').Router()
const restaurantsCtrl = require('../controllers/restaurants.controller')
const cache           = require('../middleware/cache.middleware')
const validate        = require('../middleware/validate.middleware')
const { optionalAuth } = require('../middleware/auth.middleware')

const {
  cityQuerySchema,
  nearbyQuerySchema,
  fsqIdParamSchema,
} = require('../validators/restaurants.validator')

// ── Health check (no cache) ───────────────────────────────────────────────────
router.get(
  '/health',
  restaurantsCtrl.getHealth
)

// ── Search by city (15 min cache) ─────────────────────────────────────────────
//
// GET /api/v1/restaurants/city?city=Goa&limit=20&radius=5000&cuisine=Indian&openNow=true
router.get(
  '/city',
  optionalAuth,
  validate({ query: cityQuerySchema }),
  cache('restaurants:city', 900),
  restaurantsCtrl.searchByCity
)

// ── Search nearby (10 min cache) ──────────────────────────────────────────────
//
// GET /api/v1/restaurants/nearby?lat=15.5&lon=73.8&radius=2000&limit=20&openNow=true
router.get(
  '/nearby',
  optionalAuth,
  validate({ query: nearbyQuerySchema }),
  cache('restaurants:nearby', 600),
  restaurantsCtrl.searchNearby
)

// ── Get restaurant detail by FSQ ID (45 min cache) ────────────────────────────
//
// GET /api/v1/restaurants/4b058706f964a520d6a322e3
// GET /api/v1/restaurants/4b058706f964a520d6a322e3?refresh=true   ← bypass cache
router.get(
  '/:fsqId',
  optionalAuth,
  validate({ params: fsqIdParamSchema }),
  cache('restaurants:detail', 2700),
  restaurantsCtrl.getDetail
)

module.exports = router
