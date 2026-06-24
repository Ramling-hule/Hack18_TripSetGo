// backend/src/services/travel/adapters/foursquare.attraction.adapter.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalises raw Foursquare Places v3 attraction results to NormalisedAttraction.
//
// NormalisedAttraction {
//   id, fsqId,
//   name,
//   category,        — "Museum" | "Park" | "Historical Place" | "Tourist Attraction" | etc.
//   description,     — optional text
//   coordinates,     — { lat, lon }
//   rating,          — 0–10 (FSQ native scale)
//   photos,          — string[] CDN URLs
//   image,           — first photo URL
//   address,         — formatted address string
//   website,         — URL
//   phone,
//   distanceM,       — meters from search center
//   popularityScore, — 0–100
//   distanceM,       — meters (from search center, only on nearby searches)
//   source           — "Foursquare"
// }
// ─────────────────────────────────────────────────────────────────────────────
const { validateList } = require('../dto/schemas')


// ── Category ID → label mapping ───────────────────────────────────────────────

const CATEGORY_LABEL_MAP = {
  '10027': 'Museum',
  '10040': 'Art Gallery',
  '16000': 'Tourist Attraction',
  '16017': 'Historical Place',
  '16020': 'Landmark',
  '16032': 'Park',
}

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

function buildPhotoUrl(photo, width = 800) {
  if (!photo?.prefix || !photo?.suffix) return null
  return `${photo.prefix}${width}${photo.suffix}`
}

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

/**
 * Determine the best category label for an attraction from its FSQ categories array.
 * Prefers known category IDs over the raw name.
 */
function extractCategory(categories) {
  if (!Array.isArray(categories) || !categories.length) return 'Tourist Attraction'

  for (const cat of categories) {
    const id    = String(cat.id || '')
    const label = CATEGORY_LABEL_MAP[id]
    if (label) return label
  }

  // Fall back to the short_name of the first category
  const first = categories[0]
  return safeStr(first?.short_name) || safeStr(first?.name) || 'Tourist Attraction'
}

// ── Single attraction normaliser ──────────────────────────────────────────────

/**
 * Normalise a single FSQ place to NormalisedAttraction.
 * @param {Object} raw — raw FSQ place object
 * @returns {NormalisedAttraction}
 */
function normalise(raw) {
  if (!raw?.fsq_id) return null

  const photos = (raw.photos || []).map(p => buildPhotoUrl(p)).filter(Boolean)
  const geo    = raw.geocodes?.main || raw.geocodes?.roof || {}

  return {
    id:             `fsq:${raw.fsq_id}`,
    fsqId:          raw.fsq_id,
    name:           safeStr(raw.name),
    category:       extractCategory(raw.categories),
    categories:     (raw.categories || []).map(c => safeStr(c.name)).filter(Boolean),
    description:    safeStr(raw.description),

    coordinates: geo.latitude != null && geo.longitude != null
      ? { lat: geo.latitude, lon: geo.longitude }
      : null,

    rating:          safeFloat(raw.rating),
    popularityScore: raw.popularity != null ? Math.round(raw.popularity * 100) : null,
    totalRatings:    safeInt(raw.stats?.total_ratings),

    photos,
    image:           photos[0] || null,
    totalPhotos:     safeInt(raw.stats?.total_photos),

    address:         buildAddress(raw.location),
    city:            safeStr(raw.location?.locality) || safeStr(raw.location?.region),
    country:         safeStr(raw.location?.country),

    website:         safeStr(raw.website),
    phone:           safeStr(raw.tel),

    openingHours: raw.hours ? {
      display: safeStr(raw.hours.display),
      isOpen:  raw.hours.open_now ?? null,
    } : null,

    verified:        !!raw.verified,

    distanceM:       raw.distance != null ? safeInt(raw.distance) : null,
    distanceLabel:   raw.distance != null
      ? (raw.distance < 1000
          ? `${raw.distance}m`
          : `${(raw.distance / 1000).toFixed(1)}km`)
      : null,

    // Compatibility shims for attractionsService.js (uses OTM xid/tags/mustSee)
    xid:            `fsq:${raw.fsq_id}`,
    source:         'Foursquare',
    mustSee:        (raw.popularity != null && raw.popularity > 0.7),
    tags:           (raw.categories || []).map(c => safeStr(c.name)).filter(Boolean),
  }
}

/**
 * Normalise a list of FSQ attraction places.
 * @param {Object[]} list
 * @returns {NormalisedAttraction[]}
 */
function normaliseMany(list) {
  if (!Array.isArray(list)) return []
  return validateList('Attraction', list.map(normalise).filter(Boolean))
}

module.exports = { normalise, normaliseMany }
