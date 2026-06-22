// backend/src/services/travel/providers/amadeus.provider.js
// ─────────────────────────────────────────────────────────────────────────────
// Amadeus Hotel Offers v3 provider.
// Uses OAuth2 client credentials flow (not a static API key).
//
// Flow:
//   1. POST /v1/security/oauth2/token → access_token (expires in ~1800s)
//   2. GET  /v3/shopping/hotel-offers  → hotel offers for a city + dates
//
// Token is cached in Redis for 25 min (safety margin below the 30 min expiry).
//
// Test environment: https://test.api.amadeus.com
//   - Returns synthetic hotel data, safe for development.
//   - Switch baseUrl in travelProviders.config.js for production.
// ─────────────────────────────────────────────────────────────────────────────
const https = require('https')
const BaseProvider  = require('./BaseProvider')
const adapter       = require('../adapters/amadeus.adapter')
const travelLogger  = require('../utils/travelLogger')
const providersCfg  = require('../../../config/travelProviders.config')
const cacheService  = require('../../cache.service')

// Max hotels to return (to limit response size)
const MAX_HOTELS = 10

class AmadeusProvider extends BaseProvider {
  constructor() {
    super(providersCfg.amadeus)
    this._tokenCacheKey = 'travel:amadeus:token'
  }

  // ── OAuth2 Token Management ───────────────────────────────────────────────

  /**
   * Get a valid Bearer token.
   * Returns cached token if still valid, otherwise fetches a new one.
   *
   * @returns {Promise<string | null>}
   */
  async _getToken() {
    // Check Redis cache first
    const cached = await cacheService.getByNs(this._tokenCacheKey, 'singleton')
    if (cached?.token) {
      travelLogger.debug(this.name, 'OAuth2 token cache HIT')
      return cached.token
    }

    travelLogger.info(this.name, 'Fetching new OAuth2 token')

    try {
      const token = await this._fetchToken()
      // Cache for 25 min (Amadeus tokens expire at 30 min)
      await cacheService.set(this._tokenCacheKey, 'singleton', { token }, 1500)
      return token
    } catch (err) {
      travelLogger.error(this.name, `OAuth2 token fetch failed: ${err.message}`)
      return null
    }
  }

  /**
   * POST to Amadeus token endpoint with client credentials.
   */
  _fetchToken() {
    return new Promise((resolve, reject) => {
      const cfg    = providersCfg.amadeus
      const body   = `grant_type=client_credentials&client_id=${encodeURIComponent(cfg.clientId)}&client_secret=${encodeURIComponent(cfg.clientSecret)}`
      const url    = new URL(cfg.tokenUrl)

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type':  'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 8000,
      }

      const req = https.request(options, res => {
        let data = ''
        res.on('data', chunk => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.access_token) return resolve(json.access_token)
            reject(new Error(`Token endpoint error: ${json.error_description || JSON.stringify(json)}`))
          } catch (e) {
            reject(new Error(`Token parse error: ${e.message}`))
          }
        })
      })

      req.on('timeout', () => { req.destroy(); reject(new Error('Token request timeout')) })
      req.on('error', err => reject(err))
      req.write(body)
      req.end()
    })
  }

  // ── Hotels ────────────────────────────────────────────────────────────────

  /**
   * Fetch hotel offers for a city and date range.
   *
   * @param {Object} params
   * @param {string} params.cityCode   — IATA city code (e.g. 'GOI' for Goa)
   * @param {string} params.checkIn    — ISO date string 'YYYY-MM-DD'
   * @param {string} params.checkOut   — ISO date string 'YYYY-MM-DD'
   * @param {number} [params.adults=2]
   * @param {number} [params.maxOffers=10]
   * @returns {Promise<NormalisedHotel[]>}
   */
  async fetchHotels({ cityCode, checkIn, checkOut, adults = 2, maxOffers = MAX_HOTELS } = {}) {
    if (!this.config.enabled) return []
    if (!cityCode || !checkIn || !checkOut) {
      travelLogger.warn(this.name, 'fetchHotels called without cityCode/checkIn/checkOut — skipping')
      return []
    }

    const nights = this._calcNights(checkIn, checkOut)
    const cacheRaw = `amadeus:hotels:${cityCode}:${checkIn}:${checkOut}:${adults}`

    return this.fetchWithCache('travel:hotels', cacheRaw, async () => {
      travelLogger.info(this.name, `Fetching hotels for ${cityCode} (${checkIn} → ${checkOut}, ${nights}n)`)

      const token = await this._getToken()
      if (!token) return []

      try {
        // Step 1: Get hotel IDs by city
        const hotelListRaw = await this._authorisedRequest(token,
          '/v1/reference-data/locations/hotels/by-city',
          { cityCode, hotelSource: 'ALL' }
        )

        const hotelIds = (hotelListRaw?.data || [])
          .slice(0, 20) // limit to first 20 hotel IDs for offers search
          .map(h => h.hotelId)
          .join(',')

        if (!hotelIds) {
          travelLogger.warn(this.name, `No hotels found in ${cityCode}`)
          return []
        }

        // Step 2: Get offers for these hotel IDs
        const offersRaw = await this._authorisedRequest(token,
          '/v3/shopping/hotel-offers',
          {
            hotelIds,
            checkInDate:  checkIn,
            checkOutDate: checkOut,
            adults:       String(adults),
            bestRateOnly: 'true',
            view:         'LIGHT',
          }
        )

        const hotels = adapter.normaliseMany(offersRaw?.data || [], nights)
          .slice(0, maxOffers)

        travelLogger.info(this.name, `✅ Returning ${hotels.length} hotel offers for ${cityCode}`)
        return hotels
      } catch (err) {
        travelLogger.warn(this.name, `fetchHotels failed for ${cityCode}: ${err.message}`)
        return []
      }
    })
  }

  /**
   * Make an authenticated GET request to the Amadeus API.
   */
  async _authorisedRequest(token, path, params = {}) {
    // We bypass BaseProvider.request here because Amadeus uses Bearer auth,
    // not a query param key. We call the internal _doRequest with auth header.
    const startMs = Date.now()
    try {
      const result = await this._doRequest(path, params, {
        Authorization: `Bearer ${token}`,
      })
      travelLogger.info(this.name, `✅ ${path}`, { latencyMs: Date.now() - startMs })
      return result
    } catch (err) {
      travelLogger.warn(this.name, `${path} failed: ${err.message}`)
      throw err
    }
  }

  _calcNights(checkIn, checkOut) {
    const diff = new Date(checkOut) - new Date(checkIn)
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
  }

  // ── Attractions & Weather ─────────────────────────────────────────────────

  async fetchAttractions() { return [] }
  async fetchWeather()     { return null }
}

module.exports = new AmadeusProvider()
