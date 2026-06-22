// backend/src/services/travel/adapters/amadeus.adapter.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalises Amadeus Hotel Offers API v3 response into NormalisedHotel schema.
//
// Amadeus /v3/shopping/hotel-offers response:
//   { data: [{ hotel: { hotelId, name, cityCode, latitude, longitude,
//               address, amenities, rating },
//             offers: [{ id, price: { currency, total, base },
//               room: { type, description }, policies, checkInDate, checkOutDate }] }] }
//
// Amadeus test environment returns synthetic data — structure is identical
// to production so adapters work unchanged when switching environments.
// ─────────────────────────────────────────────────────────────────────────────

/** Map Amadeus amenity codes to human-readable strings */
const AMENITY_MAP = {
  SWIMMING_POOL: 'Pool',
  SPA:           'Spa',
  FITNESS_CENTER:'Gym',
  AIR_CONDITIONING: 'AC',
  RESTAURANT:    'Restaurant',
  PARKING:       'Parking',
  WIFI:          'Free WiFi',
  ROOM_SERVICE:  'Room Service',
  BAR:           'Bar',
  PETS_ALLOWED:  'Pet Friendly',
  BUSINESS_CENTER: 'Business Center',
  CONCIERGE:     'Concierge',
}

function mapAmenities(codes = []) {
  return codes
    .map(c => AMENITY_MAP[c] || null)
    .filter(Boolean)
    .slice(0, 8)
}

function mapRating(starRating) {
  // Amadeus rating is number of stars (1–5) as a string
  const n = parseInt(starRating, 10)
  return isNaN(n) ? null : Math.min(5, n)
}

function mapTier(starRating) {
  const n = parseInt(starRating, 10)
  if (n <= 2) return 'budget'
  if (n === 3) return 'standard'
  if (n === 4) return 'superior'
  return 'luxury'
}

/**
 * Normalise a single Amadeus hotel-offer entry.
 *
 * @param {Object} entry  — One element from data[]
 * @param {number} nights — Duration to compute total cost
 * @returns {NormalisedHotel}
 */
function normalise(entry, nights = 1) {
  const { hotel, offers = [] } = entry
  const bestOffer = offers[0] // already sorted cheapest-first by Amadeus

  const totalStr  = bestOffer?.price?.total
  const baseStr   = bestOffer?.price?.base
  const currency  = bestOffer?.price?.currency || 'USD'

  // Amadeus test env returns USD; approximate to INR for display
  const usdToInr  = 83.5
  const totalUSD  = parseFloat(totalStr) || 0
  const baseUSD   = parseFloat(baseStr)  || 0

  const totalINR        = Math.round(totalUSD * usdToInr)
  const pricePerNightINR= nights > 0 ? Math.round(totalINR / nights) : totalINR

  const amenityCodes = hotel?.amenities || []

  return {
    id:              `amadeus:${hotel?.hotelId}`,
    hotelId:         hotel?.hotelId,
    source:          'Amadeus',
    name:            hotel?.name || 'Unknown Hotel',
    tier:            mapTier(hotel?.rating),
    stars:           mapRating(hotel?.rating),
    pricePerNightINR,
    totalCostINR:    totalINR,
    originalCurrency: currency,
    originalTotal:   totalUSD,
    amenities:       mapAmenities(amenityCodes),
    location:        hotel?.address?.lines?.join(', ') || hotel?.cityCode || '',
    coordinates:     hotel?.latitude && hotel?.longitude
                       ? { lat: hotel.latitude, lon: hotel.longitude }
                       : null,
    checkIn:         bestOffer?.checkInDate  || null,
    checkOut:        bestOffer?.checkOutDate || null,
    offerId:         bestOffer?.id || null,
    roomType:        bestOffer?.room?.type || null,
    roomDescription: bestOffer?.room?.description?.text || null,
    cancellation:    bestOffer?.policies?.cancellation?.description?.text || 'See hotel policy',
    rating:          mapRating(hotel?.rating),
    image:           null, // Amadeus v3 does not provide images in offers endpoint
    mustSee:         false,
    _raw:            null,
  }
}

/**
 * Normalise an array of Amadeus offer entries.
 * Filters out entries with no pricing data.
 */
function normaliseMany(entries = [], nights = 1) {
  return entries
    .filter(e => e.offers?.length > 0 && e.hotel?.hotelId)
    .map(e => normalise(e, nights))
    .sort((a, b) => a.pricePerNightINR - b.pricePerNightINR) // cheapest first
}

module.exports = { normalise, normaliseMany, mapAmenities, mapTier }
