// backend/src/services/travel/aggregators/hotels.aggregator.js
// ─────────────────────────────────────────────────────────────────────────────
// Processes Foursquare Places hotel results for the plan enricher.
//
// Responsibilities:
//   1. Group by tier based on Foursquare priceLevel (1-4)
//   2. Select best-value hotel per tier (highest rated within the tier)
//   3. Estimate pricePerNightINR based on tier for budget calculations
//   4. Recommend the tier that best fits the accommodation budget (30% of total)
// ─────────────────────────────────────────────────────────────────────────────
const travelLogger = require('../utils/travelLogger')

// Tier priority order for UI display
const TIER_ORDER = ['budget', 'standard', 'superior', 'luxury']

// What % of total trip budget should go to accommodation
const ACCOMMODATION_BUDGET_FRACTION = 0.30

// Foursquare price levels to UI tiers
const PRICE_TO_TIER = {
  1: 'budget',
  2: 'standard',
  3: 'superior',
  4: 'luxury'
}

// Estimated INR per night by tier (since Foursquare only gives 1-4)
const ESTIMATED_PRICES = {
  budget: 2500,
  standard: 5000,
  superior: 8000,
  luxury: 15000
}

/**
 * Aggregate Foursquare hotel results into tiered recommendations.
 *
 * @param {NormalisedHotel[]} hotels    — From Foursquare adapter
 * @param {number}            budget    — Total trip budget in INR
 * @param {number}            nights    — Number of nights
 * @returns {{ byTier: Object, recommended: string, bestFit: NormalisedHotel | null, options: NormalisedHotel[] }}
 */
function aggregate(hotels = [], budget = 0, nights = 1) {
  if (hotels.length === 0) {
    return { byTier: {}, recommended: 'standard', bestFit: null, all: [], options: [] }
  }

  const accommodationBudget = budget * ACCOMMODATION_BUDGET_FRACTION
  const perNightBudget      = nights > 0 ? accommodationBudget / nights : accommodationBudget

  // Group by tier
  const byTier = {}
  
  hotels.forEach(h => {
    // Determine tier from priceLevel, default to standard if missing
    const tier = PRICE_TO_TIER[h.priceLevel || 2]
    h.tier = tier
    h.pricePerNightINR = ESTIMATED_PRICES[tier]
    h.price = h.pricePerNightINR * nights // Total price for frontend 'options'

    if (!byTier[tier]) byTier[tier] = []
    byTier[tier].push(h)
  })

  // Pick the best hotel per tier (highest rating)
  const bestByTier = {}
  for (const tier of TIER_ORDER) {
    if (byTier[tier]) {
      const sorted = byTier[tier].sort((a, b) => (b.rating || 0) - (a.rating || 0))
      bestByTier[tier] = sorted[0]
    }
  }

  // Recommend tier closest to accommodation budget fraction
  let recommended = 'standard'
  let minDelta = Infinity

  for (const [tier, hotel] of Object.entries(bestByTier)) {
    const delta = Math.abs(hotel.pricePerNightINR * nights - accommodationBudget)
    if (delta < minDelta) {
      minDelta = delta
      recommended = tier
    }
  }

  const bestFit = bestByTier[recommended] || null
  const options = Object.values(bestByTier).filter(Boolean)

  travelLogger.info('HotelsAggregator', `Aggregated ${hotels.length} hotels into ${Object.keys(bestByTier).length} tiers`, {
    recommended,
    accommodationBudget: Math.round(accommodationBudget),
    perNightBudget: Math.round(perNightBudget),
    nights,
  })

  return {
    byTier: bestByTier,
    recommended,
    bestFit,
    options,
    all: hotels,
  }
}

module.exports = { aggregate, TIER_ORDER, ACCOMMODATION_BUDGET_FRACTION }
