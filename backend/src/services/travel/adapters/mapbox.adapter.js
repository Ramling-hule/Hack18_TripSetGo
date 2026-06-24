// backend/src/services/travel/adapters/mapbox.adapter.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalises raw Mapbox Geocoding API responses into the NormalisedDestination
// schema.
// ─────────────────────────────────────────────────────────────────────────────

const { validateEntity } = require('../dto/schemas');
const { safeStr } = require('../utils/safeExtract');

/**
 * Normalise a single Mapbox Feature into NormalisedDestination
 * @param {Object} feature 
 * @returns {NormalisedDestination|null}
 */
function normaliseDestination(feature) {
  if (!feature || !feature.center) return null;

  const [lon, lat] = feature.center;
  let country = null;

  if (Array.isArray(feature.context)) {
    const countryCtx = feature.context.find(c => c.id && c.id.startsWith('country'));
    if (countryCtx) country = countryCtx.text;
  }

  const result = {
    id: `mapbox:${feature.id}`,
    name: safeStr(feature.text),
    country: safeStr(country) || 'India', // Fallback or extracted
    coordinates: { lat, lon },
    source: 'Mapbox'
  };

  return validateEntity('Destination', result);
}

/**
 * Normalise a Mapbox FeatureCollection into an array of NormalisedDestinations
 * @param {Object} raw 
 * @returns {NormalisedDestination[]}
 */
function normaliseDestinations(raw) {
  if (!raw || !Array.isArray(raw.features)) return [];
  return raw.features.map(normaliseDestination).filter(Boolean);
}

module.exports = {
  normaliseDestination,
  normaliseDestinations
};
