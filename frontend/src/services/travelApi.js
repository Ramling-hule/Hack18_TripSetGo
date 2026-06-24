import api from './api';

export const travelApi = {
  // Flights
  searchAirports: (keyword, limit = 10) => 
    api.get(`/api/v1/flights/airports`, { params: { keyword, limit } }),
  searchAirportsByCity: (city, limit = 10) =>
    api.get(`/api/v1/flights/airports/city`, { params: { city, limit } }),
  searchFlights: (params) => 
    api.get(`/api/v1/flights/search`, { params }), // depIata, arrIata, flightDate, limit
  getFlightStatus: (flightIata, flightDate) =>
    api.get(`/api/v1/flights/status`, { params: { flightIata, flightDate } }),
  getAirlines: (codes) => 
    api.get(`/api/v1/flights/airlines`, { params: { codes } }),

  // Weather
  getCurrentWeather: (city, lat, lon) => 
    api.get(`/api/v1/weather/current`, { params: { city, lat, lon } }),
  getWeatherForecast: (city, lat, lon) => 
    api.get(`/api/v1/weather/forecast`, { params: { city, lat, lon } }),

  // Attractions
  searchAttractionsByCity: (city, limit = 20, radius = 10000, kinds) => 
    api.get(`/api/v1/attractions/city`, { params: { city, limit, radius, kinds } }),
  searchAttractionsByCategory: (city, category, limit = 20, radius = 12000) => 
    api.get(`/api/v1/attractions/category`, { params: { city, category, limit, radius } }),
  searchAttractionsNearby: (lat, lon, limit = 20, radius = 5000, kinds) => 
    api.get(`/api/v1/attractions/nearby`, { params: { lat, lon, limit, radius, kinds } }),
  getAttractionDetails: (xid) => 
    api.get(`/api/v1/attractions/${xid}`),

  // Restaurants
  searchRestaurantsByCity: (city, limit = 20, radius = 5000, cuisine, openNow, minPrice, maxPrice) => 
    api.get(`/api/v1/restaurants/city`, { params: { city, limit, radius, cuisine, openNow, minPrice, maxPrice } }),
  searchRestaurantsNearby: (lat, lon, limit = 20, radius = 2000, cuisine, openNow, minPrice, maxPrice) => 
    api.get(`/api/v1/restaurants/nearby`, { params: { lat, lon, limit, radius, cuisine, openNow, minPrice, maxPrice } }),
  getRestaurantDetails: (fsqId) => 
    api.get(`/api/v1/restaurants/${fsqId}`),

  // Hotels
  searchHotelsByCity: (city, limit = 20, radius = 5000) =>
    api.get(`/api/v1/hotels/search`, { params: { city, limit, radius } }),
  searchHotelsNearby: (lat, lon, limit = 20, radius = 2000) =>
    api.get(`/api/v1/hotels/nearby`, { params: { lat, lon, limit, radius } }),
  getHotelDetails: (fsqId) =>
    api.get(`/api/v1/hotels/${fsqId}`),
};
