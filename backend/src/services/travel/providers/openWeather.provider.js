// backend/src/services/travel/providers/openWeather.provider.js
// ─────────────────────────────────────────────────────────────────────────────
// OpenWeatherMap provider — sole source for weather data.
//
// APIs used:
//   GET /weather?q={city}&units=metric      — current weather
//   GET /forecast?q={city}&units=metric     — 5-day / 3-hour forecast
//
// Free tier: 60 req/min. Both endpoints are cached aggressively:
//   current  → 10 min TTL
//   forecast → 60 min TTL
// ─────────────────────────────────────────────────────────────────────────────
const BaseProvider  = require('./BaseProvider')
const adapter       = require('../adapters/openWeather.adapter')
const travelLogger  = require('../utils/travelLogger')
const providersCfg  = require('../../../config/travelProviders.config')
const cacheService  = require('../../cache.service')

class OpenWeatherProvider extends BaseProvider {
  constructor() {
    super(providersCfg.openWeather)
  }

  /**
   * OWM uses appid as a query param.
   */
  async request(path, params = {}, headers = {}) {
    const key = this.keyRotator.next()
    if (key) params.appid = key
    return super.request(path, params, headers)
  }

  // ── Weather ───────────────────────────────────────────────────────────────

  /**
   * Fetch current + forecast weather for a city.
   * Both are fetched in parallel and merged via the adapter.
   *
   * @param {Object} params
   * @param {string} params.city    — City name (e.g. "Goa,IN")
   * @param {number} [params.lat]   — Prefer lat/lon when available
   * @param {number} [params.lon]
   * @returns {Promise<NormalisedWeather | null>}
   */
  async fetchWeather({ city, lat, lon } = {}) {
    if (!this.config.enabled) return null

    const locationKey = lat && lon ? `${lat},${lon}` : city
    const cacheRaw    = `owm:weather:${locationKey}`

    return this.fetchWithCache('travel:weather:current', cacheRaw, async () => {
      travelLogger.info(this.name, `Fetching weather for "${locationKey}"`)

      const locationParams = lat && lon
        ? { lat, lon, units: 'metric' }
        : { q: city, units: 'metric' }

      // Parallel fetch: current + forecast
      const [currentResult, forecastResult] = await Promise.allSettled([
        this.request('/weather', locationParams),
        this.request('/forecast', { ...locationParams, cnt: 40 }), // 5 days × 8 slots
      ])

      const currentRaw  = currentResult.status  === 'fulfilled' ? currentResult.value  : null
      const forecastRaw = forecastResult.status === 'fulfilled' ? forecastResult.value : null

      if (!currentRaw && !forecastRaw) {
        travelLogger.warn(this.name, `Both weather endpoints failed for "${locationKey}"`)
        return null
      }

      const weather = adapter.normalise(currentRaw, forecastRaw)

      // Cache forecast separately with a longer TTL
      if (forecastRaw) {
        const forecastKey = `owm:forecast:${locationKey}`
        cacheService.set('travel:weather:forecast', forecastKey,
          adapter.normaliseForecast(forecastRaw)).catch(() => {})
      }

      travelLogger.info(this.name, `✅ Weather fetched for "${locationKey}"`, {
        currentOk:  !!currentRaw,
        forecastOk: !!forecastRaw,
        forecastDays: weather.forecast?.length,
      })

      return weather
    })
  }

  // ── Attractions & Hotels ──────────────────────────────────────────────────
  // OpenWeather is weather-only.

  async fetchAttractions() { return [] }
  async fetchHotels()      { return [] }
}

module.exports = new OpenWeatherProvider()
