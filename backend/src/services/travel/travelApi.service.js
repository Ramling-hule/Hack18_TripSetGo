// backend/src/services/travel/travelApi.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Production-grade travel API service — main orchestrator.
//
// Public API (consumed by planner.controller.js):
//   enrichPlan(plan, input)  → enriched plan (never throws)
//   geocodeDestination(name) → { lat, lon, name, country } | null
//   healthCheck()            → provider health statuses
//
// Internal data flow:
//   1. Geocode destination name → lat/lon (Nominatim, cached 24h)
//   2. Fire parallel requests:
//        a. Attractions: OTM (primary) → FSQ (secondary if insufficient)
//        b. Hotels:      Amadeus
//        c. Weather:     OpenWeather
//   3. Aggregate each domain (dedup, rank, tier)
//   4. Enrich plan with live data via planEnricher.js
//   5. Cache the enriched composite result (2h TTL)
//   6. Emit structured metric log for APM
//
// On any provider failure, the relevant domain falls through gracefully:
//   - Attractions: [] → Gemini/fallback text preserved
//   - Hotels:      {} → Gemini/fallback hotel tiers preserved
//   - Weather:     null → Gemini/fallback weather block preserved
// ─────────────────────────────────────────────────────────────────────────────
const https = require('https')
const { URL } = require('url')

const travelLogger  = require('./utils/travelLogger')
const cacheService  = require('../cache.service')
const { patchTravelTTLs } = require('./cache/travelCache.config')

const registry      = require('./providerRegistry')
const attractionAgg = require('./aggregators/attractions.aggregator')
const hotelAgg      = require('./aggregators/hotels.aggregator')
const weatherAgg    = require('./aggregators/weather.aggregator')
const { enrich }    = require('./planEnricher')

// Patch travel TTL namespaces into cache.service on first import
patchTravelTTLs()

// ── Nominatim Geocoder ────────────────────────────────────────────────────
// Used to convert destination name → lat/lon for proximity-based API calls.

/**
 * Geocode a city name using Nominatim (OpenStreetMap).
 * Cached for 24 hours.
 *
 * @param {string} destination — e.g. "Goa", "Manali", "Jaipur"
 * @returns {Promise<{ lat: number, lon: number, name: string } | null>}
 */
async function geocodeDestination(destination) {
  const cacheRaw = `nominatim:${destination.trim().toLowerCase()}`
  const cached   = await cacheService.getByNs('travel:geocode', cacheRaw)

  if (cached) {
    travelLogger.cache('Nominatim', 'HIT', 'travel:geocode', { destination })
    return cached
  }

  travelLogger.info('Nominatim', `Geocoding "${destination}"`)

  try {
    const result = await _nominatimSearch(destination)
    if (result) {
      await cacheService.set('travel:geocode', cacheRaw, result)
      travelLogger.info('Nominatim', `✅ Geocoded "${destination}" → (${result.lat}, ${result.lon})`)
    }
    return result
  } catch (err) {
    travelLogger.warn('Nominatim', `Geocoding failed for "${destination}": ${err.message}`)
    return null
  }
}

function _nominatimSearch(query) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', `${query}, India`)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('addressdetails', '0')

    const options = {
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      headers: {
        'User-Agent': 'TripSetGo/1.0 (travel-planning-app)',
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
      timeout: 4000,
    }

    const req = https.request(options, res => {
      let body = ''
      res.on('data', c => { body += c })
      res.on('end', () => {
        try {
          const results = JSON.parse(body)
          if (!results?.length) return resolve(null)
          const r = results[0]
          resolve({
            lat:         parseFloat(r.lat),
            lon:         parseFloat(r.lon),
            name:        r.display_name?.split(',')[0] || query,
            country:     'India',
            displayName: r.display_name,
          })
        } catch (e) {
          reject(new Error(`Nominatim parse error: ${e.message}`))
        }
      })
    })

    req.on('timeout', () => { req.destroy(); reject(new Error('Nominatim timeout')) })
    req.on('error', err => reject(err))
    req.end()
  })
}

// ── IATA City Code Resolution ─────────────────────────────────────────────
// Amadeus requires IATA city codes (e.g. GOI for Goa, DEL for Delhi).
// This minimal lookup covers top Indian destinations.

const IATA_MAP = {
  goa:       'GOI', panaji: 'GOI', vasco: 'GOI',
  mumbai:    'BOM', bombay: 'BOM',
  delhi:     'DEL', 'new delhi': 'DEL',
  bangalore: 'BLR', bengaluru: 'BLR',
  hyderabad: 'HYD',
  chennai:   'MAA', madras: 'MAA',
  kolkata:   'CCU', calcutta: 'CCU',
  jaipur:    'JAI',
  ahmedabad: 'AMD',
  pune:      'PNQ',
  kochi:     'COK', cochin: 'COK',
  kerala:    'COK',
  manali:    'KUU', kullu: 'KUU',
  shimla:    'SLV',
  agra:      'AGR',
  varanasi:  'VNS',
  udaipur:   'UDR',
  amritsar:  'ATQ',
  leh:       'IXL', ladakh: 'IXL',
  srinagar:  'SXR',
  dehradun:  'DED',
  bhubaneswar: 'BBI',
  mysore:    'MYQ', mysuru: 'MYQ',
  coimbatore:'CJB',
  vizag:     'VTZ', visakhapatnam: 'VTZ',
  guwahati:  'GAU',
  patna:     'PAT',
  ranchi:    'IXR',
  raipur:    'RPR',
  bhopal:    'BHO',
  indore:    'IDR',
  nagpur:    'NAG',
  surat:     'STV',
  chandigarh:'IXC',
  jammu:     'IXJ',
  pondicherry: 'PNY', puducherry: 'PNY',
  ooty:      'CJB', // nearest airport
}

function resolveIataCode(destination) {
  const key = destination.toLowerCase().trim()
  return IATA_MAP[key] || null
}

// ── Date Utilities ────────────────────────────────────────────────────────

function buildCheckoutDate(startDate, days) {
  const d = new Date(startDate || Date.now())
  d.setDate(d.getDate() + (days || 3))
  return d.toISOString().split('T')[0]
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

// ── Main enrichPlan ───────────────────────────────────────────────────────

/**
 * Enrich an existing plan with live data from all providers.
 * This is the single entry point called by planner.controller.js.
 *
 * @param {Object} plan   — Gemini or fallbackPlanner output
 * @param {Object} input  — { destination, budget, days, startDate?, interests? }
 * @returns {Promise<Object>}  Always returns a plan (enriched or original)
 */
async function enrichPlan(plan, input) {
  const { destination, budget, days } = input
  const startDate = input.startDate || todayISO()
  const requestStart = Date.now()

  const providersAttempted = []
  const providersSucceeded = []
  const cacheHits          = []
  const enrichedFields     = []

  // ── 1. Geocode ────────────────────────────────────────────────────────
  const geo = await geocodeDestination(destination)
  if (!geo) {
    travelLogger.warn('travelApi', `Cannot geocode "${destination}" — returning unenriched plan`)
    return plan
  }

  const { lat, lon } = geo

  // ── 2. Parallel data fetch ────────────────────────────────────────────
  const iataCode = resolveIataCode(destination)
  const checkIn  = startDate
  const checkOut = buildCheckoutDate(startDate, days)

  const [attractionResult, hotelsRaw, weatherRaw] = await Promise.allSettled([
    (async () => {
      providersAttempted.push('OpenTripMap', 'Foursquare')
      const r = await registry.fetchAttractions({ lat, lon, radiusM: 12000, limit: 20 })
      if (r.primary.length || r.secondary.length) {
        providersSucceeded.push('OpenTripMap')
        if (r.secondary.length) providersSucceeded.push('Foursquare')
      }
      return r
    })(),

    (async () => {
      if (!iataCode) {
        travelLogger.warn('travelApi', `No IATA code for "${destination}" — skipping Amadeus`)
        return []
      }
      providersAttempted.push('Amadeus')
      const r = await registry.fetchHotels({ cityCode: iataCode, checkIn, checkOut, adults: 2, budget, nights: days })
      if (r.length) providersSucceeded.push('Amadeus')
      return r
    })(),

    (async () => {
      providersAttempted.push('OpenWeather')
      const r = await registry.fetchWeather({ city: `${destination},IN`, lat, lon })
      if (r) providersSucceeded.push('OpenWeather')
      return r
    })(),
  ])

  // Safely unwrap settled promises
  const attrResult = attractionResult.status === 'fulfilled' ? attractionResult.value : { primary: [], secondary: [] }
  const hotels     = hotelsRaw.status      === 'fulfilled' ? hotelsRaw.value      : []
  const weatherRawVal = weatherRaw.status  === 'fulfilled' ? weatherRaw.value     : null

  // ── 3. Aggregate ──────────────────────────────────────────────────────
  const attractions = attractionAgg.aggregate(attrResult.primary, attrResult.secondary)
  const hotelResult = hotelAgg.aggregate(hotels, budget, days)
  const weather     = weatherAgg.aggregate(weatherRawVal, startDate, days)

  if (attractions.length > 0) enrichedFields.push('attractions')
  if (hotelResult.options?.length > 0) enrichedFields.push('hotels')
  if (weather.available) enrichedFields.push('weather')

  // ── 4. Enrich plan ────────────────────────────────────────────────────
  const enrichedPlan = enrich(plan, {
    attractions,
    hotelResult,
    weather,
    nights: days,
    budget,
  })

  // ── 5. Cache enriched result ──────────────────────────────────────────
  const sortedInterests = [...(input.interests || [])].sort()
  const enrichedCacheRaw = `enriched:${destination}|${budget}|${days}|${sortedInterests.join(',')}`

  cacheService.set('travel:enriched', enrichedCacheRaw, enrichedPlan).catch(err => {
    travelLogger.warn('travelApi', `Failed to cache enriched plan: ${err.message}`)
  })

  // ── 6. Emit metric log ────────────────────────────────────────────────
  travelLogger.metric({
    event:                'travel:request',
    destination,
    lat,
    lon,
    iataCode:             iataCode || 'N/A',
    providersAttempted,
    providersSucceeded,
    cacheHits,
    enrichedFields,
    attractionsCount:     attractions.length,
    hotelsCount:          hotels.length,
    weatherAvailable:     weather.available,
    totalLatencyMs:       Date.now() - requestStart,
    usedFallback:         !!plan._isFallback,
  })

  travelLogger.info('travelApi', `✅ Plan enriched for "${destination}"`, {
    enrichedFields,
    latencyMs: Date.now() - requestStart,
  })

  return enrichedPlan
}

// ── Health Check ──────────────────────────────────────────────────────────

/**
 * Get health status of all registered travel providers.
 * Called by admin/health endpoint.
 */
async function healthCheck() {
  return registry.healthCheck()
}

module.exports = { enrichPlan, geocodeDestination, healthCheck }
