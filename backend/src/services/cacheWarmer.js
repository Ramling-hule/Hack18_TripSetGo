const logger = require('../utils/logger');
const cacheService = require('./cache.service');
const { geocodeDestination } = require('./travel/travelApi.service');
const hotelsService = require('./hotels.service');
const restaurantsService = require('./restaurants.service');
const attractionsService = require('./attractions.service');
const weatherService = require('./weather.service');

const TOP_DESTINATIONS = [
  'Goa', 'Manali', 'Jaipur', 'Kerala', 'Shimla',
  'Udaipur', 'Varanasi', 'Leh', 'Rishikesh', 'Darjeeling'
];

/**
 * Sequential cache warming with 500ms stagger between cities.
 */
const warmDestination = async (city) => {
  try {
    logger.info(`[CacheWarmer] 🔥 Warming destination: "${city}"`);
    
    // 1. Geocode first (since others might depend on it)
    const geo = await geocodeDestination(city);
    if (!geo) {
      logger.warn(`[CacheWarmer] Could not geocode "${city}" - skipping further warming`);
      return;
    }

    // 2. Parallel warm for the other components in this destination
    await Promise.allSettled([
      // Attractions
      attractionsService.searchByCity(city).catch(err => {
        logger.warn(`[CacheWarmer] Failed to warm attractions for "${city}": ${err.message}`);
      }),
      // Hotels
      hotelsService.searchByCity(city).catch(err => {
        logger.warn(`[CacheWarmer] Failed to warm hotels for "${city}": ${err.message}`);
      }),
      // Restaurants
      restaurantsService.searchByCity(city).catch(err => {
        logger.warn(`[CacheWarmer] Failed to warm restaurants for "${city}": ${err.message}`);
      }),
      // Weather (coordinates preferred if available)
      weatherService.getWeatherIntelligence({ city, lat: geo.lat, lon: geo.lon }).catch(err => {
        logger.warn(`[CacheWarmer] Failed to warm weather for "${city}": ${err.message}`);
      })
    ]);

    logger.info(`[CacheWarmer] ✅ Destination "${city}" warmed successfully`);
  } catch (err) {
    logger.error(`[CacheWarmer] Error warming destination "${city}": ${err.message}`);
  }
};

/**
 * Warm all destinations.
 */
const warmAll = async () => {
  logger.info(`[CacheWarmer] 🚀 Starting cache warming for ${TOP_DESTINATIONS.length} destinations...`);
  
  for (const city of TOP_DESTINATIONS) {
    await warmDestination(city);
    // 500ms stagger between cities to avoid API rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  logger.info('[CacheWarmer] 🔥 Cache warming complete — all destinations warmed');
};

/**
 * Boot warming (15s delay to let server start and Redis connect).
 */
const warmOnBoot = () => {
  logger.info('[CacheWarmer] Scheduling boot cache warming in 15 seconds...');
  setTimeout(() => {
    warmAll().catch(err => logger.error(`[CacheWarmer] Boot warming error: ${err.message}`));
  }, 15000);
};

/**
 * Cron warming
 */
const warmCron = async () => {
  logger.info('[CacheWarmer] Running scheduled cron cache warming...');
  await warmAll();
};

module.exports = {
  warmOnBoot,
  warmCron,
  warmAll,
  TOP_DESTINATIONS
};
