// backend/src/services/rag.service.js
const { geocodeDestination } = require('./travel/travelApi.service');
const registry = require('./travel/providerRegistry');
const travelLogger = require('./travel/utils/travelLogger');

/**
 * Strips unnecessary heavy fields from objects to optimize token usage.
 */
function compressContext(data, type) {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => {
    switch (type) {
      case 'hotel':
        return {
          name: item.name,
          rating: item.rating,
          category: item.category,
          address: item.address,
        };
      case 'restaurant':
        return {
          name: item.name,
          rating: item.rating,
          cuisine: item.cuisine,
          address: item.address,
        };
      case 'attraction':
        return {
          name: item.name,
          rating: item.rating,
          category: item.category,
          description: item.description ? item.description.substring(0, 100) + '...' : undefined,
        };
      case 'flight':
        return {
          airline: item.airline,
          flightNumber: item.flightNumber,
          dep: item.departureAirport,
          arr: item.arrivalAirport,
          depTime: item.departureTime,
          arrTime: item.arrivalTime,
        };
      default:
        return item;
    }
  });
}

/**
 * Builds a compressed, ranked context package to inject into the LLM.
 * @param {Object} input - { source, destination, budget, days, startDate }
 * @returns {Promise<Object>} The RAG context package
 */
async function buildContextPackage(input) {
  const { source, destination, startDate } = input;
  const start = Date.now();

  const geo = await geocodeDestination(destination);
  if (!geo) {
    travelLogger.warn('RAG', `Could not geocode destination: ${destination}`);
    return {};
  }
  const { lat, lon } = geo;

  const [attrRes, hotelsRes, restRes, weatherRes, flightsRes] = await Promise.allSettled([
    registry.fetchAttractions({ lat, lon, radiusM: 10000, limit: 15 }),
    registry.fetchHotels({ lat, lon, city: destination, radiusM: 8000, limit: 10 }),
    registry.fetchRestaurants({ lat, lon, city: destination, radiusM: 8000, limit: 10 }),
    registry.fetchWeather({ city: `${destination},IN`, lat, lon }),
    source ? registry.fetchFlights({ source, destination, date: startDate || new Date().toISOString().split('T')[0] }) : Promise.resolve([])
  ]);

  const rawAttractions = attrRes.status === 'fulfilled' ? attrRes.value.primary.concat(attrRes.value.secondary).slice(0, 15) : [];
  const rawHotels = hotelsRes.status === 'fulfilled' ? hotelsRes.value : [];
  const rawRestaurants = restRes.status === 'fulfilled' ? restRes.value : [];
  const weather = weatherRes.status === 'fulfilled' ? weatherRes.value : null;
  const rawFlights = flightsRes.status === 'fulfilled' ? flightsRes.value : [];

  const contextPackage = {
    destination: geo.name,
    weather: weather ? {
      temp: weather.currentTemp,
      condition: weather.condition,
      forecast: weather.forecast.slice(0, 3).map(f => ({ date: f.date, temp: f.temp, desc: f.description }))
    } : null,
    hotels: compressContext(rawHotels, 'hotel'),
    restaurants: compressContext(rawRestaurants, 'restaurant'),
    attractions: compressContext(rawAttractions, 'attraction'),
    flights: compressContext(rawFlights, 'flight')
  };

  travelLogger.info('RAG', `Context package built in ${Date.now() - start}ms`, {
    hotels: contextPackage.hotels.length,
    restaurants: contextPackage.restaurants.length,
    attractions: contextPackage.attractions.length,
    flights: contextPackage.flights.length
  });

  return contextPackage;
}

module.exports = { buildContextPackage };
