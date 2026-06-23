// backend/src/services/travel/providers/foursquare.restaurant.provider.js
// ─────────────────────────────────────────────────────────────────────────────
// Foursquare Places v3 — Restaurant Discovery Provider.
//
// Dedicated provider for restaurant search, separate from the attractions
// provider to:
//   1. Use restaurant-specific category IDs (13000 = Dining & Drinking)
//   2. Request restaurant-specific fields (hours, menu, tastes, tel)
//   3. Preserve FSQ daily quota (950/day) — restaurants and attractions
//      now each have their own rate budget
//
// API: Foursquare Places Search v3
//   GET /places/search
//   Headers: Authorization: <api_key>
//   Params:  ll, categories, radius, limit, fields, sort, open_now, price
//
//   GET /places/{fsq_id}
//   Headers: Authorization: <api_key>
//   Params:  fields
//
// Rate limiting: daily-counter strategy — shared with attractions provider
// through the same provider config. Both use the same key pool.
// ─────────────────────────────────────────────────────────────────────────────
const BaseProvider = require('./BaseProvider')
const adapter      = require('../adapters/foursquare.restaurant.adapter')
const travelLogger = require('../utils/travelLogger')
const providersCfg = require('../../../config/travelProviders.config')

// FSQ category IDs for food & dining
// 13000 = Dining & Drinking (parent category — covers all sub-categories)
const FSQ_FOOD_CATEGORIES = '13000'

// Fields to request for list results (balance detail vs. response size)
const FSQ_LIST_FIELDS = [
  'fsq_id',
  'name',
  'categories',
  'geocodes',
  'location',
  'distance',
  'rating',
  'stats',
  'photos',
  'hours',
  'price',
  'tel',
  'website',
  'verified',
  'popularity',
  'tastes',
].join(',')

// Additional fields for detail fetch
const FSQ_DETAIL_FIELDS = [
  ...FSQ_LIST_FIELDS.split(','),
  'description',
  'menu',
  'hours_popular',
  'features',
].join(',')

class FoursquareRestaurantProvider extends BaseProvider {
  constructor() {
    // Re-use the foursquare config (same API key pool, same rate limits)
    super(providersCfg.foursquare)
    // Override name for distinct logging
    this.name = 'Foursquare[Restaurants]'
  }

  // ── Auth override — FSQ v3 uses Bearer token header, not query param ──────

  async request(path, params = {}, headers = {}) {
    const key = this.keyRotator.next()
    if (key) headers.Authorization = key
    return super.request(path, params, headers)
  }

  // ── Search Restaurants by Coordinates ────────────────────────────────────

  /**
   * Search restaurants near given coordinates.
   *
   * @param {Object} params
   * @param {number}  params.lat               — Latitude
   * @param {number}  params.lon               — Longitude
   * @param {number}  [params.radiusM=3000]    — Search radius in meters (max 100000)
   * @param {number}  [params.limit=20]        — Max results (1–50)
   * @param {string}  [params.categories]      — FSQ category IDs (comma-separated)
   * @param {boolean} [params.openNow=false]   — Only return currently open restaurants
   * @param {number}  [params.minPrice]        — Minimum price level (1–4)
   * @param {number}  [params.maxPrice]        — Maximum price level (1–4)
   * @param {string}  [params.sort='RATING']   — RELEVANCE | RATING | DISTANCE | POPULARITY
   * @param {string}  [params.query]           — Free-text search (e.g. "pizza", "biryani")
   * @returns {Promise<NormalisedRestaurant[]>}
   */
  async searchRestaurants({
    lat,
    lon,
    radiusM    = 3000,
    limit      = 20,
    categories = FSQ_FOOD_CATEGORIES,
    openNow    = false,
    minPrice,
    maxPrice,
    sort       = 'RATING',
    query,
  } = {}) {
    if (!this.config.enabled) {
      travelLogger.warn(this.name, 'Provider disabled — FOURSQUARE_API_KEY_1 not set')
      return []
    }

    const clampedRadius = Math.min(radiusM, 100000)
    const clampedLimit  = Math.min(limit, 50)
    const cacheRaw = [
      `fsq:restaurants`,
      `${lat},${lon}`,
      `r=${clampedRadius}`,
      `l=${clampedLimit}`,
      `cat=${categories}`,
      `open=${openNow}`,
      `price=${minPrice || ''}-${maxPrice || ''}`,
      `sort=${sort}`,
      `q=${query || ''}`,
    ].join('|')

    return this.fetchWithCache('restaurants:city', cacheRaw, async () => {
      travelLogger.info(this.name, `Searching restaurants near (${lat}, ${lon}) r=${clampedRadius}m`)

      try {
        const params = {
          ll:         `${lat},${lon}`,
          categories,
          radius:     clampedRadius,
          limit:      clampedLimit,
          fields:     FSQ_LIST_FIELDS,
          sort,
        }

        if (query)    params.query    = query
        if (openNow)  params.open_now = 'true'
        if (minPrice) params.min_price = minPrice
        if (maxPrice) params.max_price = maxPrice

        const raw = await this.request('/places/search', params)
        const places = adapter.normaliseMany(raw?.results || [])

        await this.circuitBreaker.recordSuccess()
        travelLogger.info(this.name, `✅ Found ${places.length} restaurants`)
        return places
      } catch (err) {
        travelLogger.warn(this.name, `searchRestaurants failed: ${err.message}`)
        await this.circuitBreaker.recordFailure(err)
        return []
      }
    })
  }

  // ── Search Restaurants by City Name ──────────────────────────────────────

  /**
   * Search restaurants by city name (text-based query with geoname fallback).
   * Adds the city name as a search query to improve location relevance.
   *
   * @param {Object} params
   * @param {number}  params.lat        — City centre latitude (from geocoder)
   * @param {number}  params.lon        — City centre longitude
   * @param {string}  params.city       — City name (used as search query context)
   * @param {number}  [params.radiusM]
   * @param {number}  [params.limit]
   * @param {string}  [params.cuisine]  — Cuisine filter (e.g. "Indian", "Pizza")
   * @param {boolean} [params.openNow]
   * @param {number}  [params.minPrice]
   * @param {number}  [params.maxPrice]
   * @returns {Promise<NormalisedRestaurant[]>}
   */
  async searchByCity({
    lat,
    lon,
    city,
    radiusM  = 5000,
    limit    = 20,
    cuisine,
    openNow  = false,
    minPrice,
    maxPrice,
  } = {}) {
    return this.searchRestaurants({
      lat,
      lon,
      radiusM,
      limit,
      query:     cuisine || undefined, // cuisine as FSQ text query
      openNow,
      minPrice,
      maxPrice,
      sort:      'RATING',
    })
  }

  // ── Get Restaurant Detail ─────────────────────────────────────────────────

  /**
   * Fetch full restaurant details by FSQ ID.
   * Returns all available fields including description, features, and full hours.
   *
   * @param {string} fsqId — Foursquare place ID (e.g. "4b058706f964a520d6a322e3")
   * @returns {Promise<NormalisedRestaurant | null>}
   */
  async getRestaurantDetail(fsqId) {
    if (!this.config.enabled) return null
    if (!fsqId?.trim()) return null

    const cacheRaw = `fsq:restaurant:detail:${fsqId}`

    return this.fetchWithCache('restaurants:detail', cacheRaw, async () => {
      travelLogger.info(this.name, `Fetching detail for fsqId="${fsqId}"`)

      try {
        const detail = await this.request(`/places/${encodeURIComponent(fsqId)}`, {
          fields: FSQ_DETAIL_FIELDS,
        })

        if (!detail?.fsq_id) {
          travelLogger.warn(this.name, `Empty detail response for fsqId="${fsqId}"`)
          return null
        }

        const normalised = adapter.normalise(detail)
        await this.circuitBreaker.recordSuccess()
        travelLogger.info(this.name, `✅ Detail fetched for "${normalised?.name || fsqId}"`)
        return normalised
      } catch (err) {
        travelLogger.warn(this.name, `getRestaurantDetail failed for "${fsqId}": ${err.message}`)
        await this.circuitBreaker.recordFailure(err)
        return null
      }
    })
  }

  // ── Haversine Distance Utility ────────────────────────────────────────────

  /**
   * Calculate distance in meters between two coordinate pairs.
   * Exposed for use in service layer distance-sorting.
   *
   * @param {{ lat: number, lon: number }} from
   * @param {{ lat: number, lon: number }} to
   * @returns {number} Distance in meters
   */
  static distanceM(from, to) {
    if (!from || !to) return Infinity
    const R  = 6371000
    const φ1 = (from.lat * Math.PI) / 180
    const φ2 = (to.lat  * Math.PI) / 180
    const Δφ = ((to.lat  - from.lat) * Math.PI) / 180
    const Δλ = ((to.lon  - from.lon) * Math.PI) / 180
    const a  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // ── BaseProvider overrides ────────────────────────────────────────────────
  async fetchAttractions() { return [] }
  async fetchHotels()      { return [] }
  async fetchWeather()     { return null }
}

module.exports = new FoursquareRestaurantProvider()
