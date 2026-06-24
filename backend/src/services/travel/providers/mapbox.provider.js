// backend/src/services/travel/providers/mapbox.provider.js
// ─────────────────────────────────────────────────────────────────────────────
// Mapbox Geocoding API Provider
// ─────────────────────────────────────────────────────────────────────────────

const BaseProvider = require('./BaseProvider');
const adapter = require('../adapters/mapbox.adapter');
const travelLogger = require('../utils/travelLogger');

// Configuration for Mapbox
// Mapbox keys usually start with 'pk.'
const mapboxConfig = {
  enabled: !!process.env.MAPBOX_API_KEY,
  keys: process.env.MAPBOX_API_KEY ? [process.env.MAPBOX_API_KEY] : [],
  baseUrl: 'https://api.mapbox.com',
  timeoutMs: 4000,
  maxRetries: 3,
  rateLimit: {
    strategy: 'token-bucket',
    maxRequests: 5,
    windowMs: 1000
  }
};

class MapboxProvider extends BaseProvider {
  constructor() {
    super(mapboxConfig);
    this.name = 'Mapbox';
  }

  /**
   * Geocode a destination string into coordinates
   * @param {string} query 
   * @returns {Promise<NormalisedDestination|null>}
   */
  async geocode(query) {
    if (!this.config.enabled) {
      travelLogger.warn(this.name, 'Mapbox provider disabled — missing MAPBOX_API_KEY');
      return null;
    }

    const key = this.keyRotator.next();
    if (!key) return null;

    travelLogger.info(this.name, `Geocoding query: "${query}"`);

    try {
      const path = `/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
      const params = {
        access_token: key,
        types: 'place,locality,neighborhood,poi',
        limit: 1
      };

      const raw = await this.request(path, params);
      const destinations = adapter.normaliseDestinations(raw);

      if (!destinations || destinations.length === 0) {
        travelLogger.warn(this.name, `No results for "${query}"`);
        return null;
      }

      await this.circuitBreaker.recordSuccess();
      return destinations[0];
    } catch (error) {
      travelLogger.warn(this.name, `Geocode failed for "${query}": ${error.message}`);
      await this.circuitBreaker.recordFailure(error);
      return null;
    }
  }

  // Stubs for BaseProvider
  async fetchAttractions() { return []; }
  async fetchHotels() { return []; }
  async fetchWeather() { return null; }
}

module.exports = new MapboxProvider();
