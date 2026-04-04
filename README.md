<div align="center">

<img src="https://img.shields.io/badge/TripSetGo-AI%20Travel%20Platform-6366f1?style=for-the-badge&logo=airplane&logoColor=white" alt="TripSetGo" />

# 🌍 TripSetGo — AI-Powered Travel Planning Platform

**Plan. Discover. Travel.**

A production-ready, full-stack travel planning platform featuring an AI-powered interactive trip planner, a social travel feed, group expense management, and a subscription system.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-F54D21?style=flat-square)](https://groq.com/)

</div>

---

## 📸 Screenshots

| AI Trip Planner | Discover Feed | Budget Tracker |
|---|---|---|
| Interactive multi-option selection | Social travel feed with likes & saves | Live real-time budget tracking |

---

## ✨ Feature Overview

### 🤖 AI-Powered Interactive Trip Planner
The flagship feature — generates a fully interactive trip plan using **Groq LLM (llama-3.3-70b)**:

- **Multiple options per category** — 3–5 transport modes, 4–5 hotel tiers, 3 food plans, 3 activities per time slot
- **Live Budget Tracker** — real-time cost recalculation as users select options (green/yellow/red status)
- **Smart Budget Suggestions** — "You have ₹X left — upgrade your hotel?" or "Over budget by ₹Y"
- **Day-by-Day Planner** — Morning / Afternoon / Evening slots, each with 3 selectable activities
- **AI Suggestions** — 4–5 contextual tips (romantic, upgrade, warning, adventure)
- **Favorites** — heart any hotel or activity to save it
- **Deterministic Fallback** — if Groq API is unavailable, an instant rule-based engine generates the plan

### 🗺️ Discover Page (Social Travel Feed)
- Browse public trips from other users
- Search, filter, infinite scroll
- Like, comment, save, and clone trips
- Follow travelers

### 👥 Group & Expense Management
- Create group trips
- Splitwise-style expense tracking
- Settlement calculations

### 💳 Subscription System
- Free / Pro tiers via Razorpay payments
- Daily search limits enforced server-side
- Subscription status tracking

### 🔐 Authentication
- Email/password with OTP verification
- Google OAuth (Sign in with Google)
- JWT access + refresh token system

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   Next.js 14  ·  Tailwind CSS  ·  Zustand  ·  Dark Mode    │
│                                                             │
│  /dashboard/planner   - AI Interactive Trip Planner         │
│  /dashboard/discover  - Social Travel Feed                  │
│  /dashboard/trips     - My Trips                            │
│  /dashboard/expenses  - Group Expenses (Splitwise)          │
│  /dashboard/analytics - Usage Analytics                     │
│  /dashboard/subscription - Plans & Billing                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────────────┐
│                      BACKEND (FastAPI)                      │
│                     PORT 8000                               │
│                                                             │
│  /api/v1/auth/*      - JWT + Google OAuth                   │
│  /api/v1/trips       - AI Trip Planning (POST)              │
│  /api/v1/trips/{id}  - Like / Save / Comment / Clone        │
│  /api/v1/discover    - Public Feed                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            AI PLANNING ENGINE                       │    │
│  │                                                     │    │
│  │  llm_planner.py   ← Groq LLM  (primary)            │    │
│  │    ├── tool_get_hotels(destination, budget)         │    │
│  │    ├── tool_get_attractions(destination)            │    │
│  │    └── tool_get_transport(source, destination)      │    │
│  │                                                     │    │
│  │  planner.py       ← Deterministic (fallback)        │    │
│  │  data.py          ← Knowledge base (destinations,   │    │
│  │                      hotels, transport, places)     │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   INFRASTRUCTURE                            │
│  PostgreSQL 16 (Neon)  ·  Redis (Upstash)  ·  Nginx        │
└─────────────────────────────────────────────────────────────┘
```

### Legacy Agent System (retained, not used for planning)
The original 7-agent microservice architecture is preserved in `/agents/` and `/orchestrator/`:
- **Intent Agent** (8010) — parse user intent
- **Destination Agent** (8011) — validate destination
- **Transport Agent** (8012) — find transport options
- **Stay Agent** (8013) — find accommodations
- **Itinerary Agent** (8014) — build day plans
- **Budget Agent** (8015) — optimize budget
- **Navigation Agent** (8016) — navigation info

> ⚠️ Trip planning now uses the integrated LLM engine in the backend directly. The agents are decoupled and not required for the planner to function.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14.2, React 18, Tailwind CSS, Zustand |
| **Backend** | FastAPI 0.135, SQLAlchemy 2.0, Pydantic v2 |
| **Database** | PostgreSQL 16 (Neon serverless) |
| **Cache** | Redis 7 (Upstash) |
| **AI / LLM** | Groq Cloud — `llama-3.3-70b-versatile` |
| **Auth** | JWT (access + refresh), Google OAuth 2.0 |
| **Payments** | Razorpay (subscriptions) |
| **Infra** | Docker Compose, Nginx reverse proxy |

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A **Groq API key** (free at [console.groq.com](https://console.groq.com/))
- A **Google OAuth client** (for Google Sign In)
- A **Neon PostgreSQL** database (or local PostgreSQL)

### 1. Clone the repo
```bash
git clone https://github.com/Ramling-hule/Hack18_TripSetGo.git
cd Hack18_TripSetGo
```

### 2. Configure environment variables

**Backend** — copy and fill `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET_KEY=your-secret-key
REFRESH_SECRET_KEY=your-refresh-secret
GOOGLE_PREFILL_SECRET=your-google-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GROQ_API_KEY=gsk_...              # Get from console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile

RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=your-secret

REDIS_URL=rediss://...            # Upstash or local redis://redis:6379/0
```

**Frontend** — copy and fill `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Start all services
```bash
docker-compose up -d --build
```

This starts:
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Nginx | http://localhost:80 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### 4. Open the app
Navigate to **http://localhost:3000** and sign up or log in with Google.

---

## 🧭 How the AI Planner Works

```
User submits form
  │
  ├─► Backend gathers tool data (deterministic, instant)
  │     ├── get_hotels(destination, budget)      → hotel options from data.py
  │     ├── get_attractions(destination)         → places from data.py
  │     └── get_transport(source, destination)   → transport modes from data.py
  │
  ├─► Groq LLM receives tool data + user input
  │     → Model: llama-3.3-70b-versatile
  │     → Generates: transport_options[], hotel_options[],
  │                  food_plans[], itinerary[day → slots → 3 activities each],
  │                  ai_suggestions[], budget_breakdown, ui palette
  │     → Retry on 429 (rate limit) with exponential backoff (1s/2s/4s)
  │
  ├─► If LLM fails → Deterministic fallback (instant, no API required)
  │     → Uses cycling pool of attractions (no index-out-of-range errors)
  │     → Generates full multi-option schema identical to LLM output
  │
  └─► Frontend receives plan
        → Zustand store tracks selections
        → Live budget = sum(selected transport + hotel + food + activities)
        → BudgetTracker rerenders on every selection
```

### LLM Output Schema
```json
{
  "meta": { "destination", "total_days", "total_budget", "theme", "tags" },
  "transport_options": [ { "mode", "cost_per_person", "total_cost", "comfort", "recommended" } ],
  "hotel_options": [ { "name", "tier", "price_per_night", "rating", "amenities" } ],
  "food_plans": [ { "name", "cost_per_day", "total_cost", "highlights" } ],
  "itinerary": [
    {
      "day": 1, "date": "YYYY-MM-DD",
      "morning":   { "activities": [ { "name", "type", "duration", "cost" } ] },
      "afternoon": { "activities": [ ... ] },
      "evening":   { "activities": [ ... ] }
    }
  ],
  "ai_suggestions": [ { "type", "icon", "title", "description" } ],
  "budget_breakdown_estimate": { "transport", "stay", "food", "activities", "misc" },
  "ui": { "color_primary", "color_secondary", "destination_vibe" }
}
```

---

## 📂 Project Structure

```
Hack18_TripSetGo/
├── backend/                        # FastAPI backend
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── auth/               # JWT + Google OAuth endpoints
│   │   │   ├── trips/              # AI trip planning API
│   │   │   └── discover/           # Social feed API
│   │   ├── planning_engine/        # ✨ Core AI planning system
│   │   │   ├── llm_planner.py      # Groq LLM + tool functions
│   │   │   ├── planner.py          # Deterministic fallback engine
│   │   │   └── data.py             # Knowledge base (destinations, hotels, transport)
│   │   ├── models/                 # SQLAlchemy database models
│   │   ├── services/               # Business logic (auth, subscription, etc.)
│   │   └── main.py                 # FastAPI app entry point
│   ├── Dockerfile
│   └── .env
│
├── frontend/                       # Next.js 14 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── planner/        # ✨ Interactive AI Trip Planner page
│   │   │   │   ├── discover/       # Social travel feed
│   │   │   │   ├── trips/          # My trips
│   │   │   │   ├── expenses/       # Group expense management
│   │   │   │   ├── analytics/      # Usage analytics
│   │   │   │   └── subscription/   # Razorpay subscription
│   │   │   ├── login/              # Auth pages
│   │   │   └── signup/
│   │   ├── components/             # Reusable UI components (Sidebar, etc.)
│   │   ├── store/                  # Zustand state management
│   │   │   ├── plannerStore.js     # ✨ Interactive planner state + live budget
│   │   │   ├── discoverStore.js    # Social feed state
│   │   │   └── authStore.js        # Auth state
│   │   └── lib/api.js              # Axios API client
│   ├── Dockerfile
│   └── .env
│
├── agents/                         # Legacy: 7 microservice agents (preserved)
│   ├── intent_agent/               # Port 8010
│   ├── destination_agent/          # Port 8011
│   ├── transport_agent/            # Port 8012
│   ├── stay_agent/                 # Port 8013
│   ├── itinerary_agent/            # Port 8014
│   ├── budget_agent/               # Port 8015
│   └── navigation_agent/           # Port 8016
│
├── orchestrator/                   # Legacy: LangGraph orchestrator (Port 8004)
├── infrastructure/                 # Nginx config
├── data_pipeline/                  # Data scripts
└── docker-compose.yml              # All services
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Register with email |
| `POST` | `/api/v1/auth/login` | Login, get JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `GET` | `/api/v1/auth/google` | Initiate Google OAuth |
| `GET` | `/api/v1/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/v1/auth/logout` | Logout |

### Trip Planning
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/trips` | **Generate AI interactive trip plan** |
| `GET` | `/api/v1/trips/{id}` | Get trip by ID |
| `POST` | `/api/v1/trips/{id}/like` | Like a trip |
| `POST` | `/api/v1/trips/{id}/save` | Save/bookmark a trip |
| `POST` | `/api/v1/trips/{id}/comment` | Add comment |
| `POST` | `/api/v1/trips/{id}/clone` | Clone trip to my trips |

### Plan Trip Request Body
```json
{
  "source": "Mumbai",
  "destination": "Goa",
  "start_date": "2025-12-20",
  "end_date": "2025-12-25",
  "budget": 50000,
  "num_travelers": 4,
  "group_type": "friends",
  "preferences": ["beach", "nightlife", "food"]
}
```

### Discover Feed
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/discover/feed` | Social trip feed (paginated) |
| `GET` | `/api/v1/discover/search` | Search trips |

Full interactive docs at **http://localhost:8000/docs** (Swagger UI).

---

## 🔧 Development

### Run backend locally (without Docker)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Run frontend locally (without Docker)
```bash
cd frontend
npm install
npm run dev
```

### Check backend logs
```bash
docker logs hack18_tripsetgo-backend-1 --tail 50 -f
```

### Hot-reload code into running container (faster than rebuild)
```bash
docker cp backend/app/planning_engine/llm_planner.py \
  hack18_tripsetgo-backend-1:/app/app/planning_engine/llm_planner.py
docker restart hack18_tripsetgo-backend-1
```

---

## 🌐 Key Environment Variables

| Variable | Service | Description |
|---|---|---|
| `DATABASE_URL` | Backend | Neon/PostgreSQL connection string |
| `GROQ_API_KEY` | Backend | Groq Cloud API key (LLM) |
| `GROQ_MODEL` | Backend | Default: `llama-3.3-70b-versatile` |
| `GOOGLE_CLIENT_ID` | Backend + Frontend | Google OAuth app client ID |
| `JWT_SECRET_KEY` | Backend | JWT signing secret |
| `REDIS_URL` | Backend | Redis/Upstash connection |
| `RAZORPAY_KEY_ID` | Backend | Razorpay payment key |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API base URL |

---

## 🧪 Health Check

```bash
# Backend health
curl http://localhost:8000/health

# Test trip planning (requires auth token)
curl -X POST http://localhost:8000/api/v1/trips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":"Mumbai","destination":"Goa","start_date":"2025-12-20","end_date":"2025-12-25","budget":50000,"num_travelers":2,"group_type":"couple"}'
```

---

## 🐛 Known Issues & Notes

- **Groq Rate Limits**: The free Groq tier has rate limits. The backend handles 429 errors with automatic retry (exponential backoff: 1s → 2s → 4s). If all retries fail, the deterministic fallback generates the plan instantly.
- **Agent Services**: The 7 microservice agents (ports 8010–8016) and orchestrator (8004) are still in docker-compose but are **not required** for trip planning — the backend's integrated engine handles everything.
- **Database Migrations**: Schema is managed manually (no Alembic). Run the app once and SQLAlchemy will auto-create tables.

---

## 👥 Team

Built for **Hack18** — a 24-hour hackathon challenge.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.