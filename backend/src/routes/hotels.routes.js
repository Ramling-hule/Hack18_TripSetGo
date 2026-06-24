// backend/src/routes/hotels.routes.js
// ─────────────────────────────────────────────────────────────────────────────
// Hotel Discovery routes.
// ─────────────────────────────────────────────────────────────────────────────
const router       = require('express').Router()
const hotelsCtrl   = require('../controllers/hotels.controller')
const cache        = require('../middleware/cache.middleware')
const validate     = require('../middleware/validate.middleware')
const { optionalAuth } = require('../middleware/auth.middleware')

const {
  hotelSearchSchema,
  hotelNearbySchema,
  hotelDetailSchema,
} = require('../validators/hotels.validator')

router.get('/health', hotelsCtrl.getHealth)

router.get(
  '/search',
  optionalAuth,
  validate({ query: hotelSearchSchema }),
  cache('hotels:city', 1800),
  hotelsCtrl.searchByCity
)

router.get(
  '/nearby',
  optionalAuth,
  validate({ query: hotelNearbySchema }),
  cache('hotels:nearby', 900),
  hotelsCtrl.searchNearby
)

router.get(
  '/:fsqId',
  optionalAuth,
  validate({ params: hotelDetailSchema }),
  cache('hotels:detail', 7200),
  hotelsCtrl.getDetail
)

module.exports = router
