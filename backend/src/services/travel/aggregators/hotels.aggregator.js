// backend/src/services/travel/aggregators/hotels.aggregator.js
// ─────────────────────────────────────────────────────────────────────────────
// Processes Amadeus hotel results for the plan enricher.
//
// Responsibilities:
//   1. Group by tier (budget/standard/superior/luxury)
//   2. Select best-value hotel per tier (cheapest within the tier)
//   3. Compute budget fit score relative to user's total trip budget
//   4. Flag the recommended tier based on budget allocation heuristic
// ─────────────────────────────────────────────────────────────────────────────
const travelLogger = require('../utils/travelLogger')

// Tier priority order for UI display
const TIER_ORDER = ['budget', 'standard', 'superior', 'luxury']

// What % of total trip budget should go to accommodation
const ACCOMMODATION_BUDGET_FRACTION = 0.30

/**
 * Aggregate Amadeus hotel results into tiered recommendations.
 *
 * @param {NormalisedHotel[]} hotels    — Sorted cheapest-first from Amadeus adapter
 * @param {number}            budget    — Total trip budget in INR
 * @param {number}            nights    — Number of nights
 * @returns {{ byTier: Object, recommended: string, bestFit: NormalisedHotel | null }}
 */
function aggregate(hotels = [], budget = 0, nights = 1) {
  if (hotels.length === 0) {
    return { byTier: {}, recommended: 'standard', bestFit: null, all: [] }
  }

  const accommodationBudget = budget * ACCOMMODATION_BUDGET_FRACTION
  const perNightBudget      = nights > 0 ? accommodationBudget / nights : accommodationBudget

  // Group by tier
  const byTier = {}
  for (const tier of TIER_ORDER) {
    const inTier = hotels.filter(h => h.tier === tier)
    if (inTier.length > 0) {
      // Best value = closest to perNightBudget without exceeding it (if possible)
      const affordable = inTier.filter(h => h.pricePerNightINR <= perNightBudget)
      byTier[tier] = affordable.length > 0
        ? affordable[affordable.length - 1] // most expensive within budget
        : inTier[0]                          // cheapest available in this tier
    }
  }

  // Recommend tier closest to accommodation budget fraction
  let recommended = 'standard'
  let minDelta = Infinity

  for (const [tier, hotel] of Object.entries(byTier)) {
    const delta = Math.abs(hotel.pricePerNightINR * nights - accommodationBudget)
    if (delta < minDelta) {
      minDelta = delta
      recommended = tier
    }
  }

  const bestFit = byTier[recommended] || null

  travelLogger.info('HotelsAggregator', `Aggregated ${hotels.length} hotels into ${Object.keys(byTier).length} tiers`, {
    recommended,
    accommodationBudget: Math.round(accommodationBudget),
    perNightBudget: Math.round(perNightBudget),
    nights,
  })

  return {
    byTier,
    recommended,
    bestFit,
    all: hotels,
  }
}

module.exports = { aggregate, TIER_ORDER, ACCOMMODATION_BUDGET_FRACTION }
