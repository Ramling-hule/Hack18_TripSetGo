// backend/src/services/travel/adapters/openWeather.adapter.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalises OpenWeatherMap API responses into the NormalisedWeather schema.
//
// Current weather response:
//   { weather: [{id, main, description, icon}], main: {temp, feels_like,
//     humidity, temp_min, temp_max}, wind: {speed}, dt, name, ... }
//
// 5-day / 3-hour forecast response:
//   { list: [{ dt, main, weather, wind, dt_txt }], city: { name, ... } }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map OWM weather condition code to a simple icon name + travel advisory.
 */
function mapCondition(id) {
  if (id >= 200 && id < 300) return { icon: '⛈️',  advisory: 'Thunderstorms expected — carry rain gear' }
  if (id >= 300 && id < 400) return { icon: '🌦️',  advisory: 'Light drizzle — pack a light jacket' }
  if (id >= 500 && id < 600) return { icon: '🌧️',  advisory: 'Rain expected — pack an umbrella' }
  if (id >= 600 && id < 700) return { icon: '❄️',  advisory: 'Snow — bring warm layers and waterproof boots' }
  if (id >= 700 && id < 800) return { icon: '🌫️',  advisory: 'Foggy or hazy — drive carefully' }
  if (id === 800)             return { icon: '☀️',  advisory: 'Clear skies — great day for outdoor activities' }
  if (id > 800)               return { icon: '🌤️',  advisory: 'Partly cloudy — pleasant conditions' }
  return { icon: '🌡️', advisory: 'Check local forecasts before heading out' }
}

/**
 * Normalise an OWM current weather response.
 *
 * @param {Object} raw — OWM /weather response
 * @returns {NormalisedWeatherCurrent}
 */
function normaliseCurrent(raw) {
  if (!raw || !raw.main) return null

  const condition = raw.weather?.[0]
  const { icon, advisory } = mapCondition(condition?.id || 800)

  return {
    type:           'current',
    cityName:       raw.name,
    tempC:          Math.round(raw.main.temp),
    feelsLikeC:     Math.round(raw.main.feels_like),
    tempMinC:       Math.round(raw.main.temp_min),
    tempMaxC:       Math.round(raw.main.temp_max),
    humidity:       raw.main.humidity,
    windKmh:        raw.wind?.speed ? Math.round(raw.wind.speed * 3.6) : null,
    conditionMain:  condition?.main || 'Unknown',
    conditionDesc:  condition?.description || '',
    conditionIcon:  icon,
    advisory,
    observedAt:     raw.dt ? new Date(raw.dt * 1000).toISOString() : new Date().toISOString(),
    _raw:           null,
  }
}

/**
 * Normalise an OWM 5-day forecast response.
 * Groups 3-hour slots into daily summaries.
 *
 * @param {Object} raw — OWM /forecast response
 * @returns {NormalisedWeatherForecast[]}
 */
function normaliseForecast(raw) {
  if (!raw?.list) return []

  // Group by calendar date
  const byDate = {}
  for (const slot of raw.list) {
    const date = slot.dt_txt.split(' ')[0]
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(slot)
  }

  return Object.entries(byDate).slice(0, 5).map(([date, slots]) => {
    const temps     = slots.map(s => s.main.temp)
    const humidities= slots.map(s => s.main.humidity)
    const winds     = slots.map(s => s.wind?.speed || 0)
    const mainSlot  = slots[Math.floor(slots.length / 2)] // midday approximation
    const condition = mainSlot.weather?.[0]
    const { icon, advisory } = mapCondition(condition?.id || 800)

    return {
      date,
      tempMinC:      Math.round(Math.min(...temps)),
      tempMaxC:      Math.round(Math.max(...temps)),
      avgHumidity:   Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
      avgWindKmh:    Math.round((winds.reduce((a, b) => a + b, 0) / winds.length) * 3.6),
      conditionMain: condition?.main || 'Unknown',
      conditionDesc: condition?.description || '',
      conditionIcon: icon,
      advisory,
      slots:         slots.length,
    }
  })
}

/**
 * Combine current + forecast into a single NormalisedWeather object.
 */
function normalise(current, forecast) {
  const currentNorm   = normaliseCurrent(current)
  const forecastNorm  = normaliseForecast(forecast)

  // Derive packing suggestions from weather
  const packingHints = derivePackingHints(currentNorm, forecastNorm)

  return {
    current:        currentNorm,
    forecast:       forecastNorm,
    packingHints,
    summary:        buildSummary(currentNorm, forecastNorm),
    source:         'OpenWeather',
    fetchedAt:      new Date().toISOString(),
  }
}

function buildSummary(current, forecast) {
  if (!current) return 'Weather data unavailable'
  const minTemp = Math.min(...(forecast.map(d => d.tempMinC)), current.tempC)
  const maxTemp = Math.max(...(forecast.map(d => d.tempMaxC)), current.tempC)
  return `${current.conditionMain}. ${minTemp}–${maxTemp}°C over your trip. ${current.advisory}`
}

function derivePackingHints(current, forecast) {
  const hints = []
  const allTemps = forecast.map(d => d.tempMinC)
  const minTemp  = allTemps.length ? Math.min(...allTemps) : (current?.tempC || 25)

  if (minTemp < 15) hints.push('Warm jacket or fleece')
  if (minTemp < 5)  hints.push('Heavy winter coat + gloves + thermal layers')
  if (current?.humidity > 70) hints.push('Breathable fabrics — high humidity expected')

  const hasRain = forecast.some(d =>
    d.conditionMain.toLowerCase().includes('rain') ||
    d.conditionMain.toLowerCase().includes('drizzle')
  )
  if (hasRain) hints.push('Compact umbrella or rain poncho')

  const hasSun = forecast.some(d => d.conditionMain === 'Clear')
  if (hasSun) hints.push('Sunscreen SPF 50+ and sunglasses')

  return hints
}

module.exports = { normaliseCurrent, normaliseForecast, normalise, mapCondition }
