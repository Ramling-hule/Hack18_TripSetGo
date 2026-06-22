// backend/src/services/travel/aggregators/weather.aggregator.js
// ─────────────────────────────────────────────────────────────────────────────
// Processes OpenWeather data for plan enrichment.
//
// Produces:
//   - Trip-period weather summary (min/max temps, dominant conditions)
//   - Packing list recommendations based on forecast
//   - Day-by-day weather tags for itinerary UI
// ─────────────────────────────────────────────────────────────────────────────
const travelLogger = require('../utils/travelLogger')

/**
 * Aggregate weather data for the plan enricher.
 *
 * @param {NormalisedWeather | null} weatherData — From OpenWeather provider
 * @param {string} startDate  — ISO date 'YYYY-MM-DD'
 * @param {number} days       — Trip duration
 * @returns {AggregatedWeather}
 */
function aggregate(weatherData, startDate, days) {
  if (!weatherData) {
    return {
      available:   false,
      summary:     'Weather data unavailable — check local forecasts.',
      tempRange:   null,
      packingHints:[],
      dailyTags:   {},
      current:     null,
      forecast:    [],
    }
  }

  const { current, forecast, packingHints, summary } = weatherData

  // Compute trip-period temp range from forecast
  const tripDates = _generateDates(startDate, days)
  const relevantForecast = forecast.filter(d => tripDates.has(d.date))

  const allMinTemps = relevantForecast.map(d => d.tempMinC)
  const allMaxTemps = relevantForecast.map(d => d.tempMaxC)

  const tripMinC = allMinTemps.length ? Math.min(...allMinTemps) : current?.tempMinC
  const tripMaxC = allMaxTemps.length ? Math.max(...allMaxTemps) : current?.tempMaxC

  const tempRange = tripMinC != null && tripMaxC != null
    ? `${tripMinC}–${tripMaxC}°C`
    : current
      ? `${current.tempMinC}–${current.tempMaxC}°C`
      : null

  // Build per-day weather tags for itinerary UI
  const dailyTags = {}
  for (const dayForecast of relevantForecast) {
    dailyTags[dayForecast.date] = {
      icon:        dayForecast.conditionIcon,
      condition:   dayForecast.conditionMain,
      tempMinC:    dayForecast.tempMinC,
      tempMaxC:    dayForecast.tempMaxC,
      advisory:    dayForecast.advisory,
    }
  }

  // If we have fewer forecast days than the trip, fill from current weather
  for (const date of tripDates) {
    if (!dailyTags[date] && current) {
      dailyTags[date] = {
        icon:      current.conditionIcon,
        condition: current.conditionMain,
        tempMinC:  current.tempMinC,
        tempMaxC:  current.tempMaxC,
        advisory:  current.advisory,
      }
    }
  }

  travelLogger.info('WeatherAggregator', `Aggregated weather: ${tempRange}`, {
    forecastDays: forecast.length,
    relevantDays: relevantForecast.length,
    tripDays: days,
  })

  return {
    available:    true,
    summary,
    tempRange,
    packingHints,
    dailyTags,
    current,
    forecast:     relevantForecast,
  }
}

function _generateDates(startDate, days) {
  const dates = new Set()
  const start = new Date(startDate)
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.add(d.toISOString().split('T')[0])
  }
  return dates
}

module.exports = { aggregate }
