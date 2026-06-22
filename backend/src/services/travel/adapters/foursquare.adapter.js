// backend/src/services/travel/adapters/foursquare.adapter.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalises Foursquare Places API v3 responses into NormalisedAttraction.
//
// FSQ v3 place search response:
//   { results: [{ fsq_id, name, categories, geocodes, location, distance,
//       rating, stats, photos, hours_popular, price, ... }] }
//
// Category mapping uses FSQ's numeric category IDs.
// ─────────────────────────────────────────────────────────────────────────────

// Foursquare category ID → internal category
// Reference: https://docs.foursquare.com/data-products/docs/categories
const CATEGORY_MAP = {
  10000: 'Entertainment',  // Arts & Entertainment
  11000: 'Heritage',       // Business & Professional Services (filtered out usually)
  12000: 'Food',           // Dining & Drinking
  13000: 'Nature',         // Event
  14000: 'Nature',         // Health & Medicine
  15000: 'Nature',         // Landmarks & Outdoors
  16000: 'Nature',         // Nature & Parks
  17000: 'Sightseeing',    // Retail
  18000: 'Sightseeing',    // Travel & Transportation
  19000: 'Spiritual',      // Religion
}

function mapFSQCategory(categories = []) {
  if (!categories.length) return 'Sightseeing'
  const firstId = categories[0]?.id
  if (!firstId) return 'Sightseeing'
  // Match on the leading 5-digit prefix
  const prefix = Math.floor(firstId / 1000) * 1000
  return CATEGORY_MAP[prefix] || categories[0]?.short_name || 'Sightseeing'
}

function mapPriceToINR(priceLevel) {
  // FSQ price 1–4 mapped to rough INR entry cost buckets
  const map = { 1: 0, 2: 100, 3: 300, 4: 800 }
  return map[priceLevel] ?? null
}

/**
 * Normalise a single Foursquare place result.
 *
 * @param {Object} place — FSQ place result object
 * @returns {NormalisedAttraction}
 */
function normalise(place) {
  const geocode = place.geocodes?.main
  const photo   = (place.photos || [])[0]
  const imgUrl  = photo
    ? `${photo.prefix}400x300${photo.suffix}`
    : null

  // FSQ rating is 0–10; normalise to 0–5
  const rating = place.rating != null ? Math.round((place.rating / 2) * 10) / 10 : null

  return {
    id:          `fsq:${place.fsq_id}`,
    xid:         place.fsq_id,
    source:      'Foursquare',
    name:        place.name || 'Unnamed Venue',
    category:    mapFSQCategory(place.categories),
    rating,
    distanceM:   place.distance || null,
    coordinates: geocode ? { lat: geocode.latitude, lon: geocode.longitude } : null,
    image:       imgUrl,
    description: null, // FSQ v3 free tier doesn't include descriptions
    entryFee:    mapPriceToINR(place.price),
    bestTime:    'morning',
    durationHrs: 2,
    mustSee:     rating != null && rating >= 4,
    tags:        (place.categories || []).map(c => c.short_name).filter(Boolean),
    address:     place.location?.formatted_address || place.location?.address || null,
    totalRatings: place.stats?.total_ratings || null,
    verified:    place.verified || false,
    _raw:        null,
  }
}

/**
 * Normalise an array of FSQ place results.
 */
function normaliseMany(places = []) {
  return places
    .filter(p => p.name && p.geocodes?.main)
    .map(normalise)
}

module.exports = { normalise, normaliseMany, mapFSQCategory }
