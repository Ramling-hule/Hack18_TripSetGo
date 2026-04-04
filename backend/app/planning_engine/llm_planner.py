"""
TripSetGo LLM-Based Interactive Trip Planner
=============================================
Returns MULTIPLE OPTIONS per category — transport, hotels, food, activities.
Schema designed for frontend interactive selection + live budget tracking.
"""

from __future__ import annotations

import json
import logging
import re
import time
from datetime import date, timedelta
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings
from app.planning_engine.data import (
    get_transport_options,
    get_stay_options,
    get_places_for_destination,
    DESTINATIONS,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# TOOL FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def tool_get_hotels(destination: str, budget: float) -> Dict:
    nights = 3
    num_travelers = 2
    options = get_stay_options(destination, nights, num_travelers, budget)
    return {
        "destination": destination,
        "options": [
            {
                "id": f"hotel_{i}",
                "name": o["name"],
                "tier": o["tier"],
                "type": o["type"],
                "price_per_night": o["price_per_room_per_night"],
                "total_for_stay": o["total_stay_cost"],
                "rating": o["rating"],
                "amenities": o["amenities"],
                "privacy": o["privacy"],
                "best_for": o["best_for"],
            }
            for i, o in enumerate(options)
        ],
    }


def tool_get_attractions(destination: str) -> Dict:
    places = get_places_for_destination(destination)
    return {
        "destination": destination,
        "attractions": [
            {
                "id": f"attr_{i}",
                "name": p["name"],
                "type": p["type"],
                "duration_hrs": p.get("avg_time_hrs", 2),
                "entry_cost": p.get("cost", 0),
                "best_time": p.get("best_time", "Morning"),
                "group_types": p.get("group_types", ["all"]),
            }
            for i, p in enumerate(places)
        ],
    }


def tool_get_transport(source: str, destination: str, num_travelers: int) -> Dict:
    options = get_transport_options(source, destination, num_travelers)
    return {
        "source": source,
        "destination": destination,
        "options": [
            {
                "id": f"tx_{i}",
                "mode": o.get("mode", ""),
                "provider": o.get("provider", ""),
                "cost_per_person": o.get("cost_per_person", 0),
                "total_cost": o.get("total_cost", 0),
                "duration_hrs": o.get("duration_hours", o.get("duration_hrs", 0)),
                "comfort_rating": o.get("comfort_rating", 3),
                "best_for": o.get("best_for", ""),
                "details": o.get("details", ""),
            }
            for i, o in enumerate(options)
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# GROQ CLIENT
# ─────────────────────────────────────────────────────────────────────────────

async def _call_groq(messages: List[Dict], max_tokens: int = 8000) -> Optional[str]:
    if not settings.GROQ_API_KEY:
        return None
    payload: Dict[str, Any] = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": max_tokens,
    }
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    # Retry up to 3 times (handles 429 rate limits with backoff)
    import asyncio as _asyncio
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    f"{settings.GROQ_BASE_URL}/chat/completions",
                    json=payload,
                    headers=headers,
                )
                if resp.status_code == 429:
                    wait = 2 ** attempt  # 1s, 2s, 4s
                    logger.warning("[LLM] Rate limited (429) — retrying in %ds", wait)
                    await _asyncio.sleep(wait)
                    continue
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 429 and attempt < 2:
                await _asyncio.sleep(2 ** attempt)
                continue
            logger.error("[LLM] Groq HTTP error: %s", exc)
            return None
        except Exception as exc:
            logger.error("[LLM] Groq error: %s", exc)
            return None
    return None


def _extract_json(raw: str) -> Dict:
    if not raw:
        return {}
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except Exception:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
    return {}


# ─────────────────────────────────────────────────────────────────────────────
# SYSTEM PROMPT — MULTI-OPTION INTERACTIVE SCHEMA
# ─────────────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are TripSetGo AI — an elite interactive travel planning assistant.

Generate an INTERACTIVE trip plan where users can choose from MULTIPLE OPTIONS per category.

CRITICAL RULES:
1. Use ONLY data from the provided tool context — never hallucinate
2. Generate 3-5 real options per category
3. Return ONLY valid JSON — no markdown, no explanation text
4. All costs must be in INR (Indian Rupees) as integers
5. Use real place names, hotel names, and transport providers from the tool data

RETURN THIS EXACT JSON SCHEMA (nothing else):

{
  "meta": {
    "source": "string",
    "destination": "string",
    "total_days": number,
    "total_nights": number,
    "num_travelers": number,
    "group_type": "string",
    "total_budget": number,
    "theme": "luxury|budget|balanced|adventure",
    "tags": ["string"],
    "summary_text": "string - exciting 2-3 sentence Instagram-worthy description"
  },
  "transport_options": [
    {
      "id": "tx_0",
      "mode": "string",
      "provider": "string",
      "cost_per_person": number,
      "total_cost": number,
      "duration": "string (e.g. 2h 30m)",
      "comfort": number (1-5),
      "best_for": "string",
      "highlights": ["string"],
      "recommended": boolean
    }
  ],
  "hotel_options": [
    {
      "id": "hotel_0",
      "name": "string",
      "tier": "budget|standard|premium|luxury",
      "price_per_night": number,
      "total_stay_cost": number,
      "rating": number (1-5),
      "location": "string",
      "amenities": ["string"],
      "best_for": "string",
      "recommended": boolean
    }
  ],
  "food_plans": [
    {
      "id": "food_0",
      "name": "string (e.g. Budget Local Eats)",
      "description": "string",
      "cost_per_day": number,
      "total_cost": number,
      "highlights": ["string"],
      "recommended": boolean
    }
  ],
  "itinerary": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "day_summary": "string",
      "morning": {
        "time": "08:00 AM",
        "activities": [
          {
            "id": "act_d1_m_0",
            "name": "string",
            "type": "adventure|culture|relaxation|food|shopping|nature",
            "duration": "string",
            "cost": number,
            "location": "string",
            "description": "string",
            "tags": ["string"]
          }
        ]
      },
      "afternoon": {
        "time": "01:00 PM",
        "activities": [
          {
            "id": "act_d1_a_0",
            "name": "string",
            "type": "string",
            "duration": "string",
            "cost": number,
            "location": "string",
            "description": "string",
            "tags": ["string"]
          }
        ]
      },
      "evening": {
        "time": "06:00 PM",
        "activities": [
          {
            "id": "act_d1_e_0",
            "name": "string",
            "type": "string",
            "duration": "string",
            "cost": number,
            "location": "string",
            "description": "string",
            "tags": ["string"]
          }
        ]
      }
    }
  ],
  "ai_suggestions": [
    {
      "type": "upgrade|tip|warning|romantic|adventure",
      "icon": "emoji",
      "title": "string",
      "description": "string",
      "potential_cost": number
    }
  ],
  "budget_breakdown_estimate": {
    "transport": number,
    "stay": number,
    "food": number,
    "activities": number,
    "misc": number,
    "total": number
  },
  "ui": {
    "color_primary": "hex color",
    "color_secondary": "hex color",
    "color_accent": "hex color",
    "destination_vibe": "beach|mountain|city|heritage|island|desert"
  }
}

RULES FOR ACTIVITIES:
- Morning: 3 options (early activities, sightseeing)
- Afternoon: 3 options (main attractions, adventure)
- Evening: 3 options (dining, sunset, nightlife, cultural shows)
- NEVER repeat the same activity in multiple slots
- Include realistic costs from the tool data
- Day 1: include arrival/check-in activity in morning slot
- Last day: include checkout/departure activity in morning slot"""


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PLANNER
# ─────────────────────────────────────────────────────────────────────────────

async def generate_interactive_plan(
    source: str,
    destination: str,
    start_date: date,
    end_date: date,
    budget: float,
    num_travelers: int,
    group_type: str,
    preferences: List[str] = None,
) -> Dict[str, Any]:
    t0 = time.perf_counter()
    preferences = preferences or []
    nights = (end_date - start_date).days
    num_days = nights + 1
    budget_per_person = budget / num_travelers

    logger.info("[LLMPlanner] %s→%s | %d days | ₹%s | %s", source, destination, num_days, budget, group_type)

    # ── Gather tool data ───────────────────────────────────────────────────
    hotels_data = tool_get_hotels(destination, budget)
    attractions_data = tool_get_attractions(destination)
    transport_data = tool_get_transport(source, destination, num_travelers)

    date_list = [(start_date + timedelta(days=i)).isoformat() for i in range(num_days)]

    user_message = f"""Plan an INTERACTIVE trip with MULTIPLE OPTIONS per category.

TRIP DETAILS:
- Source: {source}
- Destination: {destination}
- Dates: {start_date} to {end_date} ({num_days} days, {nights} nights)
- Budget: ₹{budget:,.0f} total (₹{budget_per_person:,.0f}/person)
- Travelers: {num_travelers} ({group_type} group)
- Preferences: {', '.join(preferences) if preferences else 'general sightseeing, food, culture'}
- Day dates: {json.dumps(date_list)}

=== TOOL DATA — USE THIS, DO NOT HALLUCINATE ===

TRANSPORT OPTIONS (use these exact modes and costs):
{json.dumps(transport_data, indent=2)}

HOTELS AVAILABLE (use these exact names and prices):
{json.dumps(hotels_data, indent=2)}

ATTRACTIONS (use these exact places):
{json.dumps(attractions_data, indent=2)}

=== INSTRUCTIONS ===
1. Include ALL transport modes from tool data as transport_options (3-5 options)
2. Include ALL hotel tiers from tool data as hotel_options (3-5 options)
3. Mark ONE transport and ONE hotel as recommended=true (best value for budget)
4. Create 3 food_plans: budget (₹300-400/day/person), balanced (₹600-800), fine dining (₹1500+)
5. For EACH of {num_days} days, create morning/afternoon/evening slots with 3 activity choices EACH
6. Use attraction names from the tool data
7. ai_suggestions: 4-5 smart tips (mix of romantic, upgrade, tip, warning)
8. budget_breakdown_estimate should sum to roughly ₹{budget:,.0f}
9. ui.destination_vibe: pick based on {destination}
10. Choose color palette matching {destination}'s personality

Generate the complete JSON now:"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    raw = await _call_groq(messages, max_tokens=8000)
    plan = _extract_json(raw) if raw else {}

    elapsed = (time.perf_counter() - t0) * 1000

    if plan and plan.get("meta") and plan.get("itinerary"):
        plan = _patch_interactive_plan(plan, source, destination, start_date, end_date, budget, num_travelers, nights, transport_data, hotels_data)
        plan["_meta"] = {
            "planning_time_ms": round(elapsed, 1),
            "llm_used": True,
            "model": settings.GROQ_MODEL,
            "interactive": True,
        }
        logger.info("[LLMPlanner] ✓ LLM success in %.0fms", elapsed)
        return plan

    # ── Fallback to deterministic ──────────────────────────────────────────
    logger.warning("[LLMPlanner] LLM failed (%.0fms) — building interactive fallback", elapsed)
    return _build_deterministic_interactive(
        source, destination, start_date, end_date, budget,
        num_travelers, group_type, nights, num_days, date_list,
        transport_data, hotels_data, attractions_data, elapsed
    )


def _patch_interactive_plan(plan, source, destination, start_date, end_date, budget, num_travelers, nights, transport_data, hotels_data):
    """Ensure all required fields are present."""
    meta = plan.setdefault("meta", {})
    meta.setdefault("source", source)
    meta.setdefault("destination", destination)
    meta.setdefault("total_days", nights + 1)
    meta.setdefault("total_nights", nights)
    meta.setdefault("num_travelers", num_travelers)
    meta.setdefault("total_budget", budget)
    meta.setdefault("tags", [])
    meta.setdefault("summary_text", f"An unforgettable {nights + 1}-day trip to {destination}!")

    # Ensure transport options have required fields
    for i, t in enumerate(plan.get("transport_options", [])):
        t.setdefault("id", f"tx_{i}")
        t.setdefault("recommended", i == 1)
        t.setdefault("highlights", [t.get("best_for", "Good option")])

    # Ensure hotel options
    for i, h in enumerate(plan.get("hotel_options", [])):
        h.setdefault("id", f"hotel_{i}")
        h.setdefault("recommended", i == 1)
        h.setdefault("location", f"Central {destination}")

    # Fill transport/hotels from tool data if empty
    if not plan.get("transport_options"):
        plan["transport_options"] = [
            {
                "id": f"tx_{i}",
                "mode": o.get("mode", ""),
                "provider": o.get("provider", ""),
                "cost_per_person": int(o.get("cost_per_person", 0)),
                "total_cost": int(o.get("total_cost", 0)),
                "duration": f"{o.get('duration_hrs', 0)}h",
                "comfort": o.get("comfort_rating", 3),
                "best_for": o.get("best_for", ""),
                "highlights": [o.get("details", "")[:60]],
                "recommended": i == 1,
            }
            for i, o in enumerate(transport_data.get("options", []))
        ]

    if not plan.get("hotel_options"):
        plan["hotel_options"] = [
            {
                "id": f"hotel_{i}",
                "name": h.get("name", ""),
                "tier": h.get("tier", "standard"),
                "price_per_night": int(h.get("price_per_night", 2000)),
                "total_stay_cost": int(h.get("price_per_night", 2000)) * int(nights),
                "rating": h.get("rating", 3.5),
                "location": f"Central {destination}",
                "amenities": h.get("amenities", ["WiFi", "AC"]),
                "best_for": h.get("best_for", "All travelers"),
                "recommended": h.get("tier") == "mid_range",
            }
            for i, h in enumerate(hotels_data.get("options", []))
        ]

    # Food plans default
    if not plan.get("food_plans"):
        plan["food_plans"] = [
            {"id": "food_0", "name": "Budget Local Eats", "description": "Street food, local dhabas, and casual restaurants", "cost_per_day": 350 * num_travelers, "total_cost": 350 * num_travelers * (nights + 1), "highlights": ["Street food", "Local chai", "Home-style meals"], "recommended": False},
            {"id": "food_1", "name": "Balanced Cafe & Restaurants", "description": "Mix of cafes, restaurants, and local eateries", "cost_per_day": 700 * num_travelers, "total_cost": 700 * num_travelers * (nights + 1), "highlights": ["Cafes", "Local restaurants", "Rooftop dining"], "recommended": True},
            {"id": "food_2", "name": "Fine Dining Experience", "description": "Premium restaurants and curated food experiences", "cost_per_day": 1500 * num_travelers, "total_cost": 1500 * num_travelers * (nights + 1), "highlights": ["Fine dining", "Chef's specials", "Wine pairing"], "recommended": False},
        ]

    # AI suggestions default
    if not plan.get("ai_suggestions"):
        plan["ai_suggestions"] = [
            {"type": "tip", "icon": "💡", "title": "Book in advance", "description": "Book transport and hotels at least 2 weeks early for best prices", "potential_cost": 0},
            {"type": "upgrade", "icon": "⬆️", "title": "Upgrade your hotel", "description": f"A premium hotel in {destination} adds only ₹{2000 * nights:,} but transforms your stay", "potential_cost": 2000 * nights},
        ]

    # UI defaults
    ui = plan.setdefault("ui", {})
    ui.setdefault("color_primary", "#6366f1")
    ui.setdefault("color_secondary", "#a5b4fc")
    ui.setdefault("color_accent", "#f59e0b")
    ui.setdefault("destination_vibe", "city")

    # Budget breakdown
    bb = plan.setdefault("budget_breakdown_estimate", {})
    tx_cost = plan["transport_options"][1]["total_cost"] if len(plan.get("transport_options", [])) > 1 else 5000
    ht_cost = next((h["total_stay_cost"] for h in plan.get("hotel_options", []) if h.get("recommended")), budget * 0.35)
    bb.setdefault("transport", int(tx_cost))
    bb.setdefault("stay", int(ht_cost))
    bb.setdefault("food", int(700 * num_travelers * (nights + 1)))
    bb.setdefault("activities", int(budget * 0.12))
    bb.setdefault("misc", int(budget * 0.05))
    bb["total"] = sum([bb["transport"], bb["stay"], bb["food"], bb["activities"], bb["misc"]])

    return plan


def _build_deterministic_interactive(source, destination, start_date, end_date, budget, num_travelers, group_type, nights, num_days, date_list, transport_data, hotels_data, attractions_data, elapsed):
    """Build a full interactive plan from deterministic data when LLM fails."""
    places = attractions_data.get("attractions", [])

    def _activity(place, slot_prefix, day_num, idx):
        return {
            "id": f"act_d{day_num}_{slot_prefix}_{idx}",
            "name": place.get("name", f"Activity {idx}"),
            "type": place.get("type", "culture"),
            "duration": f"{place.get('duration_hrs', 2)} hrs",
            "cost": int(place.get("entry_cost", 0)),
            "location": destination,
            "description": f"Visit {place.get('name', 'this attraction')}. Entry: ₹{place.get('entry_cost', 0):,}. Best time: {place.get('best_time', 'Morning')}.",
            "tags": [place.get("type", "culture")],
        }

    # Build a safe pool: cycle places using modulo so we never run out
    import itertools as _itertools
    # Ensure we have at least 9 unique-looking entries by cycling
    if not places:
        places = [
            {"name": "City Exploration", "type": "culture", "duration_hrs": 2, "entry_cost": 0, "best_time": "Morning"},
            {"name": "Local Market", "type": "shopping", "duration_hrs": 1, "entry_cost": 0, "best_time": "Afternoon"},
            {"name": "Sunset Point", "type": "nature", "duration_hrs": 2, "entry_cost": 0, "best_time": "Evening"},
        ]
    # Infinite cycling pool — safe for any number of days
    pool = list(_itertools.islice(_itertools.cycle(places), num_days * 9 + 9))

    itinerary = []
    for d in range(num_days):
        base = d * 9
        morning_places  = pool[base:base + 3]
        afternoon_places = pool[base + 3:base + 6]
        evening_places  = pool[base + 6:base + 9]

        morning_acts   = [_activity(morning_places[i],   "m", d + 1, i) for i in range(3)]
        afternoon_acts = [_activity(afternoon_places[i], "a", d + 1, i) for i in range(3)]
        evening_acts   = [_activity(evening_places[i],   "e", d + 1, i) for i in range(3)]

        # Override morning slot of day 1 (arrival) and last day (checkout)
        if d == 0:
            morning_acts[0] = {"id": "act_d1_m_arrival", "name": "Arrival & Check-in", "type": "relaxation", "duration": "2 hrs", "cost": 0, "location": destination, "description": "Arrive, check in to hotel, and freshen up.", "tags": ["arrival"]}
        if d == num_days - 1:
            morning_acts[0] = {"id": "act_dlast_m_checkout", "name": "Checkout & Departure", "type": "relaxation", "duration": "2 hrs", "cost": 0, "location": source, "description": "Check out from hotel and head to departure point.", "tags": ["departure"]}

        itinerary.append({
            "day": d + 1,
            "date": date_list[d],
            "day_summary": f"Day {d + 1} in {destination}",
            "morning":   {"time": "08:00 AM", "activities": morning_acts},
            "afternoon": {"time": "01:00 PM", "activities": afternoon_acts},
            "evening":   {"time": "06:00 PM", "activities": evening_acts},
        })

    transport_options = [
        {
            "id": f"tx_{i}",
            "mode": o.get("mode", ""),
            "provider": o.get("provider", ""),
            "cost_per_person": int(o.get("cost_per_person", 0)),
            "total_cost": int(o.get("total_cost", 0)),
            "duration": f"{o.get('duration_hours', o.get('duration_hrs', 0))}h",
            "comfort": o.get("comfort_rating", 3),
            "best_for": o.get("best_for", ""),
            "highlights": [o.get("details", "")[:80]],
            "recommended": i == 1,
        }
        for i, o in enumerate(transport_data.get("options", []))
    ]

    hotel_options = [
        {
            "id": f"hotel_{i}",
            "name": h.get("name", ""),
            "tier": h.get("tier", "standard"),
            "price_per_night": int(h.get("price_per_night", 2000)),
            "total_stay_cost": int(h.get("price_per_night", 2000)) * nights,
            "rating": h.get("rating", 3.5),
            "location": f"Central {destination}",
            "amenities": h.get("amenities", ["WiFi"]),
            "best_for": h.get("best_for", "All travelers"),
            "recommended": h.get("tier") == "budget_hotel",
        }
        for i, h in enumerate(hotels_data.get("options", []))
    ]

    # Safe fallback for budget breakdown — never crash on empty lists
    def _safe_tx_cost(opts):
        for o in opts:
            if o.get("recommended"):
                return o.get("total_cost", 5000)
        return opts[0].get("total_cost", 5000) if opts else 5000

    def _safe_ht_cost(opts):
        for o in opts:
            if o.get("recommended"):
                return o.get("total_stay_cost", int(budget * 0.35))
        return opts[1]["total_stay_cost"] if len(opts) > 1 else (opts[0]["total_stay_cost"] if opts else int(budget * 0.35))

    bb = {
        "transport": _safe_tx_cost(transport_options),
        "stay": _safe_ht_cost(hotel_options),
        "food": 700 * num_travelers * num_days,
        "activities": int(budget * 0.12),
        "misc": int(budget * 0.05),
    }
    bb["total"] = sum(bb.values())

    return {
        "meta": {
            "source": source, "destination": destination,
            "total_days": num_days, "total_nights": nights,
            "num_travelers": num_travelers, "group_type": group_type,
            "total_budget": budget, "theme": "balanced",
            "tags": ["sightseeing", "culture", "food"],
            "summary_text": f"Discover the best of {destination} in {num_days} days — a perfect blend of sightseeing, food, and unforgettable experiences!",
        },
        "transport_options": transport_options,
        "hotel_options": hotel_options,
        "food_plans": [
            {"id": "food_0", "name": "Budget Local Eats", "description": "Street food, dhabas, casual eateries", "cost_per_day": 350 * num_travelers, "total_cost": 350 * num_travelers * num_days, "highlights": ["Street food", "Chai stops", "Local thali"], "recommended": False},
            {"id": "food_1", "name": "Balanced Cafes & Dining", "description": "Casual cafes, restaurants, and local specialties", "cost_per_day": 700 * num_travelers, "total_cost": 700 * num_travelers * num_days, "highlights": ["Local restaurants", "Cafe culture", "Regional cuisine"], "recommended": True},
            {"id": "food_2", "name": "Fine Dining & Experiences", "description": "Premium dining with curated experiences", "cost_per_day": 1500 * num_travelers, "total_cost": 1500 * num_travelers * num_days, "highlights": ["Fine dining", "Food tours", "Chef's table"], "recommended": False},
        ],
        "itinerary": itinerary,
        "ai_suggestions": [
            {"type": "tip", "icon": "💡", "title": "Book Early", "description": "Book 2+ weeks ahead for 20-30% savings on hotels and transport.", "potential_cost": 0},
            {"type": "upgrade", "icon": "⬆️", "title": "Go Premium", "description": f"Upgrade to a 4-star hotel for ₹{2500 * nights:,} more — worth every rupee!", "potential_cost": 2500 * nights},
            {"type": "tip", "icon": "🗺️", "title": "Download Offline Maps", "description": "Use Google Maps offline to navigate without data.", "potential_cost": 0},
            {"type": "warning", "icon": "⚠️", "title": "Peak Season", "description": "December-January is peak season — book early to avoid price surges.", "potential_cost": 0},
        ],
        "budget_breakdown_estimate": bb,
        "ui": {"color_primary": "#6366f1", "color_secondary": "#a5b4fc", "color_accent": "#f59e0b", "destination_vibe": "city"},
        "_meta": {"planning_time_ms": round(elapsed, 1), "llm_used": False, "model": "deterministic", "interactive": True},
    }
