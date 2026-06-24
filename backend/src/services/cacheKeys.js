const crypto = require('crypto');

/**
 * Sanitize a string segment to avoid space/casing issues.
 */
const sanitize = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).trim().toLowerCase();
};

/**
 * Join parts with 'tsg:' prefix.
 */
const buildKey = (...parts) => {
  return 'tsg:' + parts.map(sanitize).filter(Boolean).join(':');
};

const hotelCity = (city) => buildKey('hotel', city);
const hotelNearby = (lat, lon, radius) => buildKey('hotel', 'nearby', lat, lon, radius);
const hotelDetail = (fsqId) => buildKey('hotel', 'detail', fsqId);

const restaurantCity = (city) => buildKey('restaurant', city);
const restaurantNearby = (lat, lon) => buildKey('restaurant', 'nearby', lat, lon);
const restaurantDetail = (fsqId) => buildKey('restaurant', 'detail', fsqId);

const attractionCity = (city) => buildKey('attraction', city);
const attractionNearby = (lat, lon) => buildKey('attraction', 'nearby', lat, lon);
const attractionDetail = (xid) => buildKey('attraction', 'detail', xid);

const weatherCurrent = (city) => buildKey('weather', city);
const weatherForecast = (city) => buildKey('weather', 'forecast', city);

const flightSearch = (dep, arr, date) => buildKey('flight', dep, arr, date);
const flightAirport = (query) => buildKey('flight', 'airport', query);
const flightStatus = (flightNum) => buildKey('flight', 'status', flightNum);

const itinerary = (userId, raw) => {
  const hash = crypto.createHash('sha256').update(String(raw)).digest('hex').slice(0, 16);
  return buildKey('itinerary', userId, hash);
};

const geocode = (city) => buildKey('geocode', city);

const searchEs = (index, raw) => {
  const hash = crypto.createHash('sha256').update(String(raw)).digest('hex').slice(0, 16);
  return buildKey('search', index, hash);
};

const feed = (raw) => {
  const hash = crypto.createHash('sha256').update(String(raw)).digest('hex').slice(0, 16);
  return buildKey('feed', hash);
};

const trending = (type) => buildKey('trending', type);

const recUser = (userId) => buildKey('rec', 'user', userId);

const recent = (userId) => buildKey('recent', userId);

const enriched = (city, raw) => {
  const hash = crypto.createHash('sha256').update(String(raw)).digest('hex').slice(0, 16);
  return buildKey('enriched', city, hash);
};

const blacklist = (jti) => buildKey('blacklist', jti);

/**
 * Generic query hash fallback function
 */
const queryHash = (namespace, raw) => {
  const hash = crypto.createHash('sha256').update(String(raw)).digest('hex').slice(0, 16);
  return buildKey(namespace, hash);
};

module.exports = {
  sanitize,
  buildKey,
  hotelCity,
  hotelNearby,
  hotelDetail,
  restaurantCity,
  restaurantNearby,
  restaurantDetail,
  attractionCity,
  attractionNearby,
  attractionDetail,
  weatherCurrent,
  weatherForecast,
  flightSearch,
  flightAirport,
  flightStatus,
  itinerary,
  geocode,
  searchEs,
  feed,
  trending,
  recUser,
  recent,
  enriched,
  blacklist,
  queryHash,
};
