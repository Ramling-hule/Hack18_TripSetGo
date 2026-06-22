// backend/src/services/travel/planEnricher.js
// ─────────────────────────────────────────────────────────────────────────────
// Merges live API data (attractions, hotels, weather) into an existing plan
// produced by Gemini or fallbackPlanner.js.
//
// ENRICHMENT SCOPE: Full replacement (per user decision Q4)
//   - recommended_attractions → fully replaced with live data from OTM + FSQ
//   - hotel_options           → fully replaced with live Amadeus offers
//   - weather                 → fully replaced with live OpenWeather data
//   - packing_list / packing_suggestions → augmented with weather-driven hints
//   - itinerary activity costs → recalibrated against real attraction entry fees
//   - budget_breakdown_estimate.stay → updated from real hotel prices
//
// The enricher is purely functional — it takes `plan` + live data and returns
// a new enriched plan object. It never throws; on partial failure it returns
// the best available plan.
// ─────────────────────────────────────────────────────────────────────────────
const travelLogger = require('./utils/travelLogger')

// ── Helpers ───────────────────────────────────────────────────────────────

function safeGet(obj, path, fallback = null) {
  try {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? fallback
  } catch {
    return fallback
  }
}

// ── Attraction Enrichment ─────────────────────────────────────────────────

/**
 * Convert aggregated NormalisedAttraction[] into the schema expected by the
 * existing frontend (matches recommended_attractions in Gemini plan).
 *
 * @param {NormalisedAttraction[]} attractions
 * @param {number} limit
 * @returns {Object[]}
 */
function buildRecommendedAttractions(attractions, limit = 8) {
  return attractions.slice(0, limit).map((a, i) => ({
    name:        a.name,
    category:    a.category,
    description: a.description || `${a.name} is a notable landmark worth visiting.`,
    entry_fee:   a.entryFee ?? 0,
    best_time:   a.bestTime || 'morning',
    duration:    `${a.durationHrs || 2} hours`,
    must_see:    a.mustSee || i < 3,
    rating:      a.rating,
    image:       a.image,
    source:      a.source,
    coordinates: a.coordinates,
    tags:        a.tags?.slice(0, 4) || [],
    _live:       true,
  }))
}

// ── Hotel Enrichment ──────────────────────────────────────────────────────

/**
 * Convert aggregated hotel data into hotel_options schema.
 *
 * For the plan schema that generates trip_plans (generateTripPlan), we need:
 *   hotel_options: [{ name, tier, price_per_night, total_cost, rating, amenities, location }]
 *
 * For the detailed plan schema (generateDetailedPlan) we need:
 *   estimated_cost.accommodation = recommended hotel total cost
 */
function buildHotelOptions(hotelAggregation, nights) {
  const { byTier, recommended, bestFit } = hotelAggregation

  // Emit one option per available tier
  const tiers = ['budget', 'standard', 'superior', 'luxury']
  const options = tiers
    .filter(t => byTier[t])
    .map(t => {
      const h = byTier[t]
      return {
        name:            h.name,
        tier:            h.tier,
        price_per_night: h.pricePerNightINR,
        total_cost:      h.totalCostINR,
        rating:          h.rating || h.stars || null,
        amenities:       h.amenities,
        location:        h.location,
        amadeus_id:      h.hotelId,
        check_in:        h.checkIn,
        check_out:       h.checkOut,
        recommended:     t === recommended,
        _live:           true,
      }
    })

  return {
    options,
    recommended,
    bestFitTotal: bestFit?.totalCostINR || null,
  }
}

// ── Weather Enrichment ────────────────────────────────────────────────────

/**
 * Build the weather block matching the plan schema.
 */
function buildWeatherBlock(aggregatedWeather) {
  if (!aggregatedWeather?.available) return null

  const { summary, tempRange, current, forecast } = aggregatedWeather

  return {
    best_season:   'See forecast below',
    temp_range:    tempRange || (current ? `${current.tempMinC}–${current.tempMaxC}°C` : 'N/A'),
    note:          summary || 'Check local forecasts before travelling.',
    current: current ? {
      tempC:         current.tempC,
      condition:     current.conditionMain,
      icon:          current.conditionIcon,
      humidity:      current.humidity,
      windKmh:       current.windKmh,
      advisory:      current.advisory,
    } : null,
    forecast:      forecast?.map(d => ({
      date:         d.date,
      tempMinC:     d.tempMinC,
      tempMaxC:     d.tempMaxC,
      condition:    d.conditionMain,
      icon:         d.conditionIcon,
      advisory:     d.advisory,
    })) || [],
    daily_tags:    aggregatedWeather.dailyTags || {},
    source:        'OpenWeather',
    _live:         true,
  }
}

// ── Packing List Enrichment ───────────────────────────────────────────────

function mergePackingHints(existingList, weatherHints = []) {
  if (!existingList || !weatherHints.length) return existingList

  // Array form (generateDetailedPlan uses object with .clothing, .essentials, etc.)
  if (Array.isArray(existingList)) {
    const combined = [...new Set([...existingList, ...weatherHints])]
    return combined.slice(0, 10)
  }

  // Object form
  if (typeof existingList === 'object') {
    return {
      ...existingList,
      weather_based: weatherHints,
      weather_note:  existingList.weather_note || '',
    }
  }

  return existingList
}

// ── Itinerary Recalibration ───────────────────────────────────────────────

/**
 * Update itinerary day activity costs using real entry fees from attractions.
 * Builds a lookup map: { attraction_name_lower → entry_fee }.
 */
function recalibrateItineraryCosts(itinerary, attractions) {
  if (!itinerary?.length || !attractions?.length) return itinerary

  const feeMap = {}
  for (const a of attractions) {
    if (a.entry_fee != null && a.name) {
      feeMap[a.name.toLowerCase()] = a.entry_fee
    }
  }

  return itinerary.map(day => {
    const slots = ['morning', 'afternoon', 'evening']
    const updated = { ...day }

    for (const slot of slots) {
      if (!day[slot]) continue

      // Plan schema variant 1: slot.activities[]
      if (day[slot].activities) {
        updated[slot] = {
          ...day[slot],
          activities: day[slot].activities.map(act => {
            const realFee = feeMap[act.name?.toLowerCase()]
            return realFee != null ? { ...act, cost: realFee, _cost_live: true } : act
          }),
        }
      }

      // Plan schema variant 2: slot.activity (string) + slot.estimated_cost
      if (typeof day[slot].activity === 'string') {
        const realFee = feeMap[day[slot].activity.toLowerCase()]
        if (realFee != null) {
          updated[slot] = { ...day[slot], estimated_cost: realFee, _cost_live: true }
        }
      }
    }

    return updated
  })
}

// ── Budget Recalibration ──────────────────────────────────────────────────

function recalibrateBudget(plan, hotelResult, nights, budget) {
  if (!hotelResult?.bestFitTotal) return plan

  // schema 1: budget_breakdown_estimate.stay
  if (plan.budget_breakdown_estimate) {
    const newStay  = hotelResult.bestFitTotal
    const oldStay  = plan.budget_breakdown_estimate.stay || 0
    const delta    = newStay - oldStay

    return {
      ...plan,
      budget_breakdown_estimate: {
        ...plan.budget_breakdown_estimate,
        stay:  newStay,
        misc:  Math.max(0, (plan.budget_breakdown_estimate.misc || 0) - delta),
        _stay_live: true,
      },
    }
  }

  // schema 2: estimated_cost.accommodation
  if (plan.estimated_cost) {
    return {
      ...plan,
      estimated_cost: {
        ...plan.estimated_cost,
        accommodation: hotelResult.bestFitTotal,
        _accommodation_live: true,
      },
    }
  }

  return plan
}

// ── Main Export ───────────────────────────────────────────────────────────

/**
 * Enrich a plan with live API data. Pure function — never throws.
 *
 * @param {Object} plan              — Gemini or fallback plan
 * @param {Object} liveData
 * @param {NormalisedAttraction[]}  liveData.attractions   — From aggregator
 * @param {Object}                  liveData.hotelResult   — From hotels aggregator
 * @param {Object}                  liveData.weather       — From weather aggregator
 * @param {number}                  liveData.nights
 * @param {number}                  liveData.budget
 * @returns {Object}  Enriched plan
 */
function enrich(plan, { attractions = [], hotelResult = {}, weather = null, nights = 1, budget = 0 }) {
  try {
    let enriched = { ...plan }

    // 1. Replace attractions
    if (attractions.length > 0) {
      const liveAttractions = buildRecommendedAttractions(attractions)
      enriched.recommended_attractions = liveAttractions
      travelLogger.info('PlanEnricher', `Replaced attractions: ${liveAttractions.length} live entries`)
    }

    // 2. Replace hotels
    if (hotelResult.options?.length > 0) {
      enriched.hotel_options = hotelResult.options
      // Also replace hotel_options if in schema variant 1
      enriched = recalibrateBudget(enriched, hotelResult, nights, budget)
      travelLogger.info('PlanEnricher', `Replaced hotel_options: ${hotelResult.options.length} live tiers`)
    }

    // 3. Replace weather
    const liveWeather = buildWeatherBlock(weather)
    if (liveWeather) {
      enriched.weather = liveWeather
      travelLogger.info('PlanEnricher', `Replaced weather block (live)`)
    }

    // 4. Augment packing list with weather hints
    if (weather?.packingHints?.length) {
      if (enriched.packing_list) {
        enriched.packing_list = mergePackingHints(enriched.packing_list, weather.packingHints)
      }
      if (enriched.packing_suggestions) {
        enriched.packing_suggestions = mergePackingHints(enriched.packing_suggestions, weather.packingHints)
      }
    }

    // 5. Recalibrate itinerary activity costs
    if (enriched.itinerary && attractions.length > 0) {
      enriched.itinerary = recalibrateItineraryCosts(
        enriched.itinerary,
        buildRecommendedAttractions(attractions)
      )
    }

    // 6. Mark enrichment provenance
    enriched._liveData    = true
    enriched._enrichedAt  = new Date().toISOString()
    enriched._isFallback  = undefined // clear fallback flag if was set

    return enriched
  } catch (err) {
    travelLogger.error('PlanEnricher', `Enrichment error — returning original plan: ${err.message}`)
    return plan
  }
}

module.exports = {
  enrich,
  buildRecommendedAttractions,
  buildHotelOptions,
  buildWeatherBlock,
  mergePackingHints,
}
