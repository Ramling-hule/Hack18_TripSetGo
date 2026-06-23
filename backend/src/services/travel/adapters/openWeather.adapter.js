// backend/src/services/travel/adapters/openWeather.adapter.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalises OpenWeatherMap API responses into the NormalisedWeather schema.
//
// OWM Current Weather (/weather):
//   { weather: [{id, main, description, icon}], main: {temp, feels_like,
//     humidity, pressure, temp_min, temp_max}, wind: {speed, deg, gust},
//     visibility, clouds: {all}, rain: {'1h'}, snow: {'1h'},
//     dt, sys: {sunrise, sunset, country}, name, coord: {lat, lon} }
//
// OWM 5-day/3-hour Forecast (/forecast):
//   { list: [{dt, main, weather, wind, clouds, visibility, pop, rain, snow,
//     dt_txt}], city: {name, country, coord, sunrise, sunset} }
//
// OWM One Call 3.0 (/onecall) — used for UV index when subscribed:
//   { current: {uvi, ...}, daily: [{uvi, ...}] }
//
// Key field: `pop` (probability of precipitation) — 0.0 to 1.0 per slot
// ─────────────────────────────────────────────────────────────────────────────

// ── Weather condition code map ────────────────────────────────────────────────
// OWM condition IDs: https://openweathermap.org/weather-conditions

function mapCondition(id) {
  if (id >= 200 && id < 300) return {
    icon: '⛈️', group: 'Thunderstorm',
    advisory: 'Thunderstorms expected — avoid outdoor activities and carry rain gear',
    travelPenalty: 50,
  }
  if (id >= 300 && id < 400) return {
    icon: '🌦️', group: 'Drizzle',
    advisory: 'Light drizzle expected — pack a light waterproof jacket',
    travelPenalty: 15,
  }
  if (id >= 500 && id < 510) return {
    icon: '🌧️', group: 'Rain',
    advisory: 'Rain expected — carry an umbrella and waterproof footwear',
    travelPenalty: 30,
  }
  if (id >= 510 && id < 600) return {
    icon: '🌨️', group: 'Freezing Rain',
    advisory: 'Freezing rain — extremely dangerous; stay indoors if possible',
    travelPenalty: 65,
  }
  if (id >= 600 && id < 700) return {
    icon: '❄️', group: 'Snow',
    advisory: 'Snowfall — bring warm layers, waterproof boots, and gloves',
    travelPenalty: 40,
  }
  if (id >= 700 && id < 800) return {
    icon: '🌫️', group: 'Atmosphere',
    advisory: 'Reduced visibility (fog/haze/dust) — drive carefully and check air quality',
    travelPenalty: 20,
  }
  if (id === 800) return {
    icon: '☀️', group: 'Clear',
    advisory: 'Clear skies — perfect for outdoor exploration!',
    travelPenalty: 0,
  }
  if (id > 800) return {
    icon: '🌤️', group: 'Clouds',
    advisory: 'Partly cloudy — pleasant conditions for sightseeing',
    travelPenalty: 5,
  }
  return {
    icon: '🌡️', group: 'Unknown',
    advisory: 'Check local forecasts before heading out',
    travelPenalty: 10,
  }
}

// ── Wind direction ─────────────────────────────────────────────────────────────

function windDirection(deg) {
  if (deg == null) return null
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

// ── ms → local time string ────────────────────────────────────────────────────

function unixToTime(unixTs, offsetSec = 0) {
  if (!unixTs) return null
  const d = new Date((unixTs + offsetSec) * 1000)
  return d.toISOString().split('T')[1].slice(0, 5) // 'HH:MM'
}

// ── Travel Suitability Score ──────────────────────────────────────────────────
//
// Score 0–100 (higher = better conditions for travel).
// Broken down into 5 weighted dimensions:
//   Temperature (25pts): ideal 18–28°C
//   Precipitation (30pts): penalised for rain/snow
//   Wind (20pts): penalised for high winds
//   Visibility (15pts): penalised for fog/low vis
//   Humidity (10pts): penalised for extreme humidity

function computeTravelScore({ tempC, conditionId, windKmh, visibilityM, humidity, pop }) {
  // ── Temperature score (25 pts) ────────────────────────────────────────────
  let tempScore = 25
  if (tempC != null) {
    if (tempC >= 18 && tempC <= 28)       tempScore = 25  // ideal
    else if (tempC >= 12 && tempC < 18)   tempScore = 20  // cool
    else if (tempC >= 28 && tempC <= 35)  tempScore = 18  // warm
    else if (tempC >= 5  && tempC < 12)   tempScore = 12  // cold
    else if (tempC > 35  && tempC <= 42)  tempScore = 10  // very hot
    else if (tempC < 5   && tempC >= -5)  tempScore = 6   // very cold
    else                                  tempScore = 2   // extreme
  }

  // ── Precipitation score (30 pts) ──────────────────────────────────────────
  const cond = mapCondition(conditionId || 800)
  const precipScore = Math.max(0, 30 - (cond.travelPenalty * 0.6))

  // Also factor in rain probability
  let popPenalty = 0
  if (pop != null) {
    if (pop > 0.8)      popPenalty = 12
    else if (pop > 0.6) popPenalty = 8
    else if (pop > 0.4) popPenalty = 5
    else if (pop > 0.2) popPenalty = 2
  }
  const precipFinal = Math.max(0, precipScore - popPenalty)

  // ── Wind score (20 pts) ───────────────────────────────────────────────────
  let windScore = 20
  if (windKmh != null) {
    if (windKmh <= 20)       windScore = 20  // calm/gentle
    else if (windKmh <= 40)  windScore = 15  // moderate breeze
    else if (windKmh <= 60)  windScore = 10  // strong breeze
    else if (windKmh <= 80)  windScore = 5   // near gale
    else                     windScore = 0   // storm/hurricane
  }

  // ── Visibility score (15 pts) ─────────────────────────────────────────────
  let visScore = 15
  if (visibilityM != null) {
    if (visibilityM >= 10000)     visScore = 15  // clear
    else if (visibilityM >= 5000) visScore = 12  // moderate
    else if (visibilityM >= 2000) visScore = 8   // poor
    else if (visibilityM >= 1000) visScore = 4   // very poor
    else                          visScore = 0   // fog/severe
  }

  // ── Humidity score (10 pts) ───────────────────────────────────────────────
  let humScore = 10
  if (humidity != null) {
    if (humidity >= 30 && humidity <= 60)     humScore = 10  // comfortable
    else if (humidity >= 20 && humidity < 30) humScore = 8   // dry
    else if (humidity > 60 && humidity <= 75) humScore = 7   // slightly humid
    else if (humidity > 75 && humidity <= 85) humScore = 4   // humid
    else                                      humScore = 2   // very dry/oppressive
  }

  const overall = Math.round(tempScore + precipFinal + windScore + visScore + humScore)

  return {
    overall: Math.min(100, Math.max(0, overall)),
    label:   scoreTolabel(overall),
    breakdown: {
      temperature:   tempScore,
      precipitation: Math.round(precipFinal),
      wind:          windScore,
      visibility:    visScore,
      humidity:      humScore,
    },
    advisory: cond.advisory,
  }
}

function scoreTolabel(score) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 30) return 'Poor'
  return 'Avoid'
}

// ── Packing Recommendations ───────────────────────────────────────────────────
//
// Produces a categorised packing list based on forecast conditions.

function buildPackingList(current, forecast = []) {
  const list = {
    essentials:      [],
    clothing:        [],
    accessories:     [],
    healthAndSafety: [],
    documents:       [],
  }

  // Always recommend
  list.documents.push('Photo ID / Passport', 'Travel insurance docs', 'Emergency contacts')
  list.essentials.push('Phone charger & power bank', 'Reusable water bottle', 'Snacks for transit')

  // Temperature-based
  const allTemps   = forecast.map(d => d.tempMinC).filter(t => t != null)
  const minTemp    = allTemps.length ? Math.min(...allTemps) : (current?.tempC || 25)
  const maxTemps   = forecast.map(d => d.tempMaxC).filter(t => t != null)
  const maxTemp    = maxTemps.length ? Math.max(...maxTemps) : (current?.tempC || 25)

  if (minTemp < 5) {
    list.clothing.push('Heavy winter coat', 'Thermal base layers', 'Insulated gloves', 'Woollen hat', 'Scarf')
  } else if (minTemp < 15) {
    list.clothing.push('Warm jacket or fleece', 'Light sweater', 'Layering tops')
  } else if (maxTemp > 32) {
    list.clothing.push('Light breathable fabrics', 'Short-sleeved shirts', 'Shorts or skirts')
    list.healthAndSafety.push('Sunscreen SPF 50+', 'Stay hydrated — carry extra water')
  } else {
    list.clothing.push('Light jacket for evenings', 'Mix of short and long-sleeved tops', 'Comfortable walking shoes')
  }

  // Rain / precipitation
  const hasRain = forecast.some(d =>
    d.conditionMain?.toLowerCase().includes('rain') ||
    d.conditionMain?.toLowerCase().includes('drizzle') ||
    (d.rainProbability != null && d.rainProbability > 40)
  )
  if (hasRain) {
    list.accessories.push('Compact umbrella or rain poncho', 'Waterproof bag cover or dry bag')
    list.clothing.push('Waterproof jacket or windcheater', 'Quick-dry pants')
  }

  // Snow
  const hasSnow = forecast.some(d => d.conditionMain?.toLowerCase().includes('snow'))
  if (hasSnow) {
    list.clothing.push('Waterproof boots with grip', 'Thermal socks')
    list.healthAndSafety.push('Hand warmers', 'Lip balm for dry cold air')
  }

  // Sunshine
  const hasSun = forecast.some(d => d.conditionMain === 'Clear') || (current?.conditionMain === 'Clear')
  if (hasSun) {
    list.accessories.push('Polarised sunglasses', 'Wide-brim hat or cap')
    list.healthAndSafety.push('Sunscreen SPF 50+', 'Lip balm with SPF')
  }

  // High humidity
  const avgHumidity = forecast.reduce((s, d) => s + (d.avgHumidity || 0), 0) / (forecast.length || 1)
  if (avgHumidity > 70 || (current?.humidity || 0) > 70) {
    list.clothing.push('Moisture-wicking fabrics', 'Extra changes of clothes')
    list.healthAndSafety.push('Anti-chafing cream', 'Electrolyte sachets to stay hydrated')
  }

  // Strong winds
  const hasWind = forecast.some(d => (d.avgWindKmh || 0) > 40) || (current?.windKmh || 0) > 40
  if (hasWind) {
    list.accessories.push('Windproof jacket', 'Secure hat or hair ties')
  }

  // Fog / low visibility
  const hasFog = forecast.some(d => d.conditionMain?.toLowerCase().includes('fog') || d.conditionMain?.toLowerCase().includes('mist'))
  if (hasFog) {
    list.accessories.push('High-visibility reflective band (if cycling/walking at night)')
  }

  // Health defaults
  list.healthAndSafety.push('Basic first-aid kit', 'Personal medications', 'Hand sanitiser & masks')
  list.accessories.push('Universal travel adapter (if international)')

  // Deduplicate each category
  for (const key of Object.keys(list)) {
    list[key] = [...new Set(list[key])]
  }

  return list
}

// ── Trip Summary Intelligence ─────────────────────────────────────────────────

function buildTravelSummary(current, forecast = []) {
  const scores     = forecast.map(d => d.travelScore || 0)
  const avgScore   = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : (current ? computeTravelScore(current).overall : 0)

  const bestDays  = forecast.filter(d => (d.travelScore || 0) >= 70).map(d => d.date)
  const rainDays  = forecast.filter(d => (d.rainProbability || 0) >= 50).map(d => d.date)

  const allMinTemps = forecast.map(d => d.tempMinC).filter(t => t != null)
  const allMaxTemps = forecast.map(d => d.tempMaxC).filter(t => t != null)
  const minTemp     = allMinTemps.length ? Math.min(...allMinTemps) : current?.tempMinC
  const maxTemp     = allMaxTemps.length ? Math.max(...allMaxTemps) : current?.tempMaxC
  const label       = scoreTolabel(avgScore)

  const headline = current
    ? `${current.conditionMain} conditions — ${minTemp}–${maxTemp}°C. Travel suitability: ${label}.`
    : 'Weather data not available for this location.'

  return { bestDays, rainDays, avgTravelScore: avgScore, overallLabel: label, headline }
}

// ── normaliseCurrent ─────────────────────────────────────────────────────────

/**
 * Normalise an OWM current weather response into NormalisedWeatherCurrent.
 * @param {Object} raw — OWM /weather response
 * @returns {NormalisedWeatherCurrent | null}
 */
function normaliseCurrent(raw) {
  if (!raw || !raw.main) return null

  const condition  = raw.weather?.[0]
  const condMap    = mapCondition(condition?.id || 800)
  const windKmh    = raw.wind?.speed != null ? Math.round(raw.wind.speed * 3.6) : null
  const visM       = raw.visibility || null
  const travelScore = computeTravelScore({
    tempC:       Math.round(raw.main.temp),
    conditionId: condition?.id,
    windKmh,
    visibilityM: visM,
    humidity:    raw.main.humidity,
    pop:         0, // no pop in current weather
  })

  return {
    type:           'current',
    cityName:       raw.name,
    country:        raw.sys?.country || null,
    coords:         raw.coord ? { lat: raw.coord.lat, lon: raw.coord.lon } : null,
    tempC:          Math.round(raw.main.temp),
    feelsLikeC:     Math.round(raw.main.feels_like),
    tempMinC:       Math.round(raw.main.temp_min),
    tempMaxC:       Math.round(raw.main.temp_max),
    humidity:       raw.main.humidity,
    pressure:       raw.main.pressure || null,
    windKmh,
    windDeg:        raw.wind?.deg || null,
    windDirection:  windDirection(raw.wind?.deg),
    windGustKmh:    raw.wind?.gust != null ? Math.round(raw.wind.gust * 3.6) : null,
    conditionId:    condition?.id || null,
    conditionMain:  condition?.main || 'Unknown',
    conditionDesc:  condition?.description || '',
    conditionIcon:  condMap.icon,
    conditionGroup: condMap.group,
    owmIconCode:    condition?.icon || null,
    advisory:       condMap.advisory,
    visibilityM:    visM,
    cloudCover:     raw.clouds?.all || null,
    rainMm1h:       raw.rain?.['1h'] || null,
    snowMm1h:       raw.snow?.['1h'] || null,
    sunriseAt:      unixToTime(raw.sys?.sunrise, raw.timezone),
    sunsetAt:       unixToTime(raw.sys?.sunset, raw.timezone),
    travelScore,
    observedAt:     raw.dt ? new Date(raw.dt * 1000).toISOString() : new Date().toISOString(),
    _raw:           null,
  }
}

// ── normaliseForecast ────────────────────────────────────────────────────────

/**
 * Normalise an OWM 5-day/3-hour forecast response into daily summaries.
 * Includes rain probability (pop), per-day travel score.
 * @param {Object} raw — OWM /forecast response
 * @returns {NormalisedWeatherForecast[]}
 */
function normaliseForecast(raw) {
  if (!raw?.list) return []

  // Group 3-hour slots by calendar date
  const byDate = {}
  for (const slot of raw.list) {
    const date = slot.dt_txt.split(' ')[0]
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(slot)
  }

  return Object.entries(byDate).slice(0, 5).map(([date, slots]) => {
    const temps      = slots.map(s => s.main.temp)
    const feelsLike  = slots.map(s => s.main.feels_like)
    const humidities = slots.map(s => s.main.humidity)
    const winds      = slots.map(s => (s.wind?.speed || 0) * 3.6)
    const pops       = slots.map(s => s.pop || 0)  // probability of precipitation per slot
    const rainMms    = slots.map(s => s.rain?.['3h'] || 0)
    const snowMms    = slots.map(s => s.snow?.['3h'] || 0)

    // Midday slot as representative condition
    const middaySlot  = slots[Math.floor(slots.length / 2)]
    const condition   = middaySlot?.weather?.[0]
    const condMap     = mapCondition(condition?.id || 800)

    const avgTemp  = temps.reduce((a, b) => a + b, 0) / temps.length
    const maxPop   = Math.max(...pops)
    const avgWindKmh = Math.round(winds.reduce((a, b) => a + b, 0) / winds.length)
    const avgHum   = Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length)

    const travelScore = computeTravelScore({
      tempC:       Math.round(avgTemp),
      conditionId: condition?.id,
      windKmh:     avgWindKmh,
      visibilityM: middaySlot?.visibility || null,
      humidity:    avgHum,
      pop:         maxPop,
    })

    return {
      date,
      tempMinC:        Math.round(Math.min(...temps)),
      tempMaxC:        Math.round(Math.max(...temps)),
      avgTempC:        Math.round(avgTemp),
      avgFeelsLikeC:   Math.round(feelsLike.reduce((a, b) => a + b, 0) / feelsLike.length),
      avgHumidity:     avgHum,
      avgWindKmh,
      conditionId:     condition?.id || null,
      conditionMain:   condition?.main || 'Unknown',
      conditionDesc:   condition?.description || '',
      conditionIcon:   condMap.icon,
      conditionGroup:  condMap.group,
      owmIconCode:     condition?.icon || null,
      advisory:        condMap.advisory,
      rainProbability: Math.round(maxPop * 100),   // 0–100%
      rainMm:          parseFloat(rainMms.reduce((a, b) => a + b, 0).toFixed(1)),
      snowMm:          parseFloat(snowMms.reduce((a, b) => a + b, 0).toFixed(1)),
      travelScore:     travelScore.overall,
      travelLabel:     travelScore.label,
      slots:           slots.length,
    }
  })
}

// ── normalise (combined) ─────────────────────────────────────────────────────

/**
 * Combine current + forecast into the full NormalisedWeather intelligence object.
 * @param {Object} currentRaw  — OWM /weather response (can be null)
 * @param {Object} forecastRaw — OWM /forecast response (can be null)
 * @returns {NormalisedWeather}
 */
function normalise(currentRaw, forecastRaw) {
  const current  = normaliseCurrent(currentRaw)
  const forecast = normaliseForecast(forecastRaw)

  const packingList    = buildPackingList(current, forecast)
  const travelSummary  = buildTravelSummary(current, forecast)

  // Legacy field (backward compat with weather.aggregator.js)
  const packingHints = [
    ...packingList.clothing.slice(0, 3),
    ...packingList.accessories.slice(0, 2),
    ...packingList.healthAndSafety.slice(0, 2),
  ]

  const summary = travelSummary.headline

  return {
    current,
    forecast,
    packingList,
    packingHints,   // backward compat
    travelSummary,
    summary,        // backward compat
    source:    'OpenWeather',
    fetchedAt: new Date().toISOString(),
  }
}

module.exports = {
  normaliseCurrent,
  normaliseForecast,
  normalise,
  mapCondition,
  computeTravelScore,
  buildPackingList,
  buildTravelSummary,
}
