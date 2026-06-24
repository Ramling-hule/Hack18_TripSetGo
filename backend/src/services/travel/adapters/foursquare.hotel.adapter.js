// backend/src/services/travel/adapters/foursquare.hotel.adapter.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalises raw Foursquare Places v3 hotel results to NormalisedHotel schema.
//
// NormalisedHotel {
//   id, fsqId,
//   name,
//   rating,          — 0–10 (Foursquare native scale)
//   address,         — formatted address string
//   coordinates,     — { lat, lon }
//   photos,          — string[] CDN URLs
//   image,           — first photo URL (convenience)
//   category,        — "Hotel" | "Motel" | "Hostel" | "Resort" | etc.
//   priceLevel,      — 1 ($) to 4 ($$$$)
//   priceInfo,       — "$$ · Mid-Range" display string
//   phone,           — "+91-XXX"
//   website,         — URL string
//   openingHours,    — { display, isOpen }
//   isOpenNow,       — boolean | null
//   verified,        — boolean
//   popularityScore, — 0–100
//   totalRatings,    — integer count
//   distanceM,       — meters (from search center, only on nearby searches)
//   source
// }
// ─────────────────────────────────────────────────────────────────────────────
const { validateList } = require('../dto/schemas')


// ── Utility ───────────────────────────────────────────────────────────────────

function safeStr(v) {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function safeFloat(v) {
  const n = parseFloat(v)
  return isFinite(n) ? n : null
}

function safeInt(v) {
  const n = parseInt(v, 10)
  return isFinite(n) ? n : null
}

// ── Photo URL builder ─────────────────────────────────────────────────────────

/**
 * Build a CDN URL from a FSQ photo object.
 * FSQ photo format: { prefix, suffix, width, height }
 * @param {Object} photo
 * @param {number} [width=800]
 * @returns {string|null}
 */
function buildPhotoUrl(photo, width = 800) {
  if (!photo?.prefix || !photo?.suffix) return null
  return `${photo.prefix}${width}${photo.suffix}`
}

// ── Price helpers ─────────────────────────────────────────────────────────────

const PRICE_LABELS = {
  1: '$ · Budget',
  2: '$$ · Mid-Range',
  3: '$$$ · Upscale',
  4: '$$$$ · Luxury',
}

// ── Category label ────────────────────────────────────────────────────────────

/**
 * Extract the most relevant category label from FSQ categories array.
 */
function extractCategory(categories) {
  if (!Array.isArray(categories) || !categories.length) return 'Hotel'
  const cat = categories[0]
  return safeStr(cat?.short_name) || safeStr(cat?.name) || 'Hotel'
}

// ── Address builder ───────────────────────────────────────────────────────────

function buildAddress(location) {
  if (!location) return null
  const parts = [
    location.address,
    location.locality || location.neighborhood,
    location.region,
    location.country,
  ].filter(Boolean)
  return parts.join(', ') || null
}

// ── Single hotel normaliser ───────────────────────────────────────────────────

/**
 * Normalise a single FSQ hotel place result.
 * @param {Object} raw — raw FSQ place object
 * @returns {NormalisedHotel}
 */
function normalise(raw) {
  if (!raw?.fsq_id) return null

  const photos   = (raw.photos || []).map(p => buildPhotoUrl(p)).filter(Boolean)
  const geo      = raw.geocodes?.main || raw.geocodes?.roof || {}
  const price    = raw.price != null ? safeInt(raw.price) : null

  return {
    id:             `fsq:${raw.fsq_id}`,
    fsqId:          raw.fsq_id,
    name:           safeStr(raw.name),
    rating:         safeFloat(raw.rating),
    totalRatings:   safeInt(raw.stats?.total_ratings),
    popularityScore: raw.popularity != null ? Math.round(raw.popularity * 100) : null,

    address:        buildAddress(raw.location),
    city:           safeStr(raw.location?.locality) || safeStr(raw.location?.region),
    neighborhood:   safeStr(raw.location?.neighborhood?.[0]),
    country:        safeStr(raw.location?.country),
    postcode:       safeStr(raw.location?.postcode),

    coordinates: geo.latitude != null && geo.longitude != null
      ? { lat: geo.latitude, lon: geo.longitude }
      : null,

    photos,
    image: photos[0] || null,
    totalPhotos: safeInt(raw.stats?.total_photos),

    category:       extractCategory(raw.categories),
    categories:     (raw.categories || []).map(c => safeStr(c.name)).filter(Boolean),

    priceLevel:     price,
    priceInfo:      price ? PRICE_LABELS[price] : null,

    phone:          safeStr(raw.tel),
    website:        safeStr(raw.website),

    openingHours: raw.hours ? {
      display:  safeStr(raw.hours.display),
      isOpen:   raw.hours.open_now ?? null,
      periods:  raw.hours.regular || [],
    } : null,
    isOpenNow: raw.hours?.open_now ?? null,

    verified:       !!raw.verified,

    distanceM:      raw.distance != null ? safeInt(raw.distance) : null,
    distanceLabel:  raw.distance != null
      ? (raw.distance < 1000
          ? `${raw.distance}m`
          : `${(raw.distance / 1000).toFixed(1)}km`)
      : null,

    source: 'Foursquare',
  }
}

/**
 * Normalise a list of FSQ hotel places.
 * @param {Object[]} list
 * @returns {NormalisedHotel[]}
 */
function normaliseMany(list) {
  if (!Array.isArray(list)) return []
  return validateList('Hotel', list.map(normalise).filter(Boolean))
}

module.exports = { normalise, normaliseMany, buildPhotoUrl }
