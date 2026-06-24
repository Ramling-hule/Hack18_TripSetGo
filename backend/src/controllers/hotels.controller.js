// backend/src/controllers/hotels.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Hotel Discovery API — Express controllers.
// ─────────────────────────────────────────────────────────────────────────────
const hotelsService = require('../services/hotels.service')
const asyncHandler  = require('../utils/asyncHandler')
const { success, error, notFound } = require('../utils/response')

function providerDisabledResponse(res) {
  return error(
    res,
    'Hotel search is temporarily unavailable — Foursquare API key not configured.',
    503
  )
}

exports.searchByCity = asyncHandler(async (req, res) => {
  if (!hotelsService.isProviderEnabled()) return providerDisabledResponse(res)

  const { city, limit, radius } = req.query
  const result = await hotelsService.searchByCity(city, {
    limit: parseInt(limit, 10),
    radius: parseInt(radius, 10),
  })

  success(res, result, result.total > 0 ? `Found ${result.total} hotels in ${city}` : `No hotels found in ${city}`)
})

exports.searchNearby = asyncHandler(async (req, res) => {
  if (!hotelsService.isProviderEnabled()) return providerDisabledResponse(res)

  const { lat, lon, radius, limit } = req.query
  const result = await hotelsService.searchNearby(parseFloat(lat), parseFloat(lon), {
    limit: parseInt(limit, 10),
    radius: parseInt(radius, 10),
  })

  success(res, result, result.total > 0 ? `Found ${result.total} hotels nearby` : 'No hotels found nearby')
})

exports.getDetail = asyncHandler(async (req, res) => {
  if (!hotelsService.isProviderEnabled()) return providerDisabledResponse(res)

  const { fsqId } = req.params
  const hotel = await hotelsService.getHotelDetail(fsqId)

  if (!hotel) return notFound(res, `Hotel detail not found for id ${fsqId}`)
  
  success(res, { hotel }, `Hotel detail: ${hotel.name}`)
})

exports.getHealth = asyncHandler(async (req, res) => {
  const health = await hotelsService.getProviderHealth()
  success(res, { provider: health, enabled: hotelsService.isProviderEnabled() }, 'Hotel provider health check')
})
