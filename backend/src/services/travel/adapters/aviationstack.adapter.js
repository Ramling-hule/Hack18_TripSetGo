// backend/src/services/travel/adapters/aviationstack.adapter.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalises raw AviationStack API responses to internal schemas.
//
// Normalised schemas:
//
//   NormalisedAirport {
//     id, iataCode, icaoCode, name, city, country, countryCode,
//     coordinates: { lat, lon }, timezone, source
//   }
//
//   NormalisedFlight {
//     id, airline: { name, iataCode, icaoCode },
//     flightNumber, flightIata,
//     departureAirport: { name, iataCode, city, country, terminal, gate },
//     arrivalAirport:   { name, iataCode, city, country, terminal, gate },
//     departureTime, arrivalTime, duration,
//     status, aircraft: { model, registration },
//     isCodeshare, source
//   }
//
//   NormalisedAirline {
//     name, iataCode, icaoCode, country, countryCode,
//     active, callsign, source
//   }
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

/**
 * Compute flight duration in minutes from two ISO strings.
 */
function calcDurationMin(dep, arr) {
  if (!dep || !arr) return null
  const diff = new Date(arr) - new Date(dep)
  return diff > 0 ? Math.round(diff / 60000) : null
}

// ── Airport normaliser ────────────────────────────────────────────────────────

/**
 * Normalise a single AviationStack airport object.
 * @param {Object} raw — raw AviationStack airport
 * @returns {NormalisedAirport}
 */
function normaliseAirport(raw) {
  if (!raw) return null

  const lat = safeFloat(raw.latitude)
  const lon = safeFloat(raw.longitude)

  return {
    id:          raw.iata_code || raw.icao_code || raw.airport_name,
    iataCode:    safeStr(raw.iata_code),
    icaoCode:    safeStr(raw.icao_code),
    name:        safeStr(raw.airport_name) || safeStr(raw.name),
    city:        safeStr(raw.city_iata_code) || safeStr(raw.city),
    cityName:    safeStr(raw.city),
    country:     safeStr(raw.country_name),
    countryCode: safeStr(raw.country_iso2),
    coordinates: lat != null && lon != null ? { lat, lon } : null,
    timezone:    safeStr(raw.timezone),
    source:      'AviationStack',
  }
}

/**
 * Normalise a list of AviationStack airports.
 * @param {Object[]} list
 * @returns {NormalisedAirport[]}
 */
function normaliseAirports(list) {
  if (!Array.isArray(list)) return []
  return list
    .map(normaliseAirport)
    .filter(Boolean)
    .filter(a => a.iataCode || a.name) // skip empty records
}

// ── Flight normaliser ─────────────────────────────────────────────────────────

/**
 * Normalise a single AviationStack flight object.
 * @param {Object} raw — raw AviationStack flight
 * @returns {NormalisedFlight}
 */
function normaliseFlight(raw) {
  if (!raw) return null

  const dep  = raw.departure || {}
  const arr  = raw.arrival   || {}
  const airl = raw.airline   || {}
  const flt  = raw.flight    || {}
  const ac   = raw.aircraft  || {}

  const depTime = safeStr(dep.scheduled) || safeStr(dep.estimated) || safeStr(dep.actual)
  const arrTime = safeStr(arr.scheduled) || safeStr(arr.estimated) || safeStr(arr.actual)

  const flightIata   = safeStr(flt.iata)
  const flightNumber = flightIata
    ? flightIata.replace(/([A-Z]+)(\d+)/, '$1 $2') // "AI302" → "AI 302"
    : null

  return {
    id: [
      dep.iata || 'UNK',
      arr.iata || 'UNK',
      flightIata || 'FLTUNK',
      (raw.flight_date || '').replace(/-/g, ''),
    ].filter(Boolean).join('-'),

    airline: {
      name:     safeStr(airl.name),
      iataCode: safeStr(airl.iata),
      icaoCode: safeStr(airl.icao),
    },

    flightNumber,
    flightIata,
    flightDate: safeStr(raw.flight_date),

    departureAirport: {
      name:     safeStr(dep.airport),
      iataCode: safeStr(dep.iata),
      icaoCode: safeStr(dep.icao),
      terminal: safeStr(dep.terminal),
      gate:     safeStr(dep.gate),
      city:     null, // AviationStack doesn't return city in flight endpoint
      country:  null,
      delay:    dep.delay != null ? Number(dep.delay) : null,
    },

    arrivalAirport: {
      name:     safeStr(arr.airport),
      iataCode: safeStr(arr.iata),
      icaoCode: safeStr(arr.icao),
      terminal: safeStr(arr.terminal),
      gate:     safeStr(arr.gate),
      baggage:  safeStr(arr.baggage),
      city:     null,
      country:  null,
      delay:    arr.delay != null ? Number(arr.delay) : null,
    },

    departureTime:    depTime,
    departureActual:  safeStr(dep.actual),
    arrivalTime:      arrTime,
    arrivalActual:    safeStr(arr.actual),
    duration:         calcDurationMin(depTime, arrTime),

    // Normalised status: scheduled | active | landed | cancelled | diverted | unknown
    status: _normaliseStatus(raw.flight_status),

    aircraft: {
      model:        safeStr(ac.registration) ? safeStr(ac.iata) : null,
      registration: safeStr(ac.registration),
      iata:         safeStr(ac.iata),
      icao:         safeStr(ac.icao),
    },

    isCodeshare:    !!(flt.codeshared),
    codesharedWith: flt.codeshared ? {
      name:     safeStr(flt.codeshared.airline_name),
      iataCode: safeStr(flt.codeshared.airline_iata),
      flight:   safeStr(flt.codeshared.flight_iata),
    } : null,

    source: 'AviationStack',
  }
}

/**
 * Map raw AviationStack flight_status to normalised values.
 */
function _normaliseStatus(raw) {
  if (!raw) return 'unknown'
  const s = raw.toLowerCase()
  if (s === 'scheduled')  return 'scheduled'
  if (s === 'active')     return 'active'
  if (s === 'landed')     return 'landed'
  if (s === 'cancelled')  return 'cancelled'
  if (s === 'diverted')   return 'diverted'
  if (s === 'incident')   return 'incident'
  return 'unknown'
}

/**
 * Normalise a list of AviationStack flights.
 * @param {Object[]} list
 * @returns {NormalisedFlight[]}
 */
function normaliseFlights(list) {
  if (!Array.isArray(list)) return []
  return validateList('Flight', list.map(normaliseFlight).filter(Boolean))
}

// ── Airline normaliser ────────────────────────────────────────────────────────

/**
 * Normalise a single AviationStack airline object.
 * @param {Object} raw
 * @returns {NormalisedAirline}
 */
function normaliseAirline(raw) {
  if (!raw) return null
  return {
    name:        safeStr(raw.airline_name) || safeStr(raw.name),
    iataCode:    safeStr(raw.iata_code),
    icaoCode:    safeStr(raw.icao_code),
    country:     safeStr(raw.country_name),
    countryCode: safeStr(raw.country_iso2),
    callsign:    safeStr(raw.callsign),
    active:      raw.status === 'active' || raw.status == null,
    source:      'AviationStack',
  }
}

/**
 * Normalise a list of AviationStack airlines.
 * @param {Object[]} list
 * @returns {NormalisedAirline[]}
 */
function normaliseAirlines(list) {
  if (!Array.isArray(list)) return []
  return list.map(normaliseAirline).filter(Boolean)
}

module.exports = {
  normaliseAirport,
  normaliseAirports,
  normaliseFlight,
  normaliseFlights,
  normaliseAirline,
  normaliseAirlines,
}
