// backend/src/routes/travel.routes.js
const router = require('express').Router()
const travelCtrl = require('../controllers/travel.controller')

// GET /api/v1/travel/attractions - Search attractions
router.get('/attractions', travelCtrl.getAttractions)

// GET /api/v1/travel/attractions/geocode - Resolve city name to lat/lon
router.get('/attractions/geocode', travelCtrl.geocode)

// GET /api/v1/travel/health - Provider health status
router.get('/health', travelCtrl.getHealth)

module.exports = router
