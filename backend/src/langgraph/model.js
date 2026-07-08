// src/langgraph/model.js
// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 — TripSetGo Copilot: LangChain Model Initialisation
//
// Exports a single, lazily-resolved `ChatGoogleGenerativeAI` instance that all
// LangGraph nodes share.  Using a singleton avoids re-instantiating the client
// on every request and ensures env-var validation happens once at startup.
//
// The model is configured for STREAMING by default because the Copilot SSE
// endpoint yields tokens to the client as they arrive.  A non-streaming call
// (model.invoke) still works — LangChain buffers the stream internally.
//
// Configuration mirrors the original gemini.service.js:
//   • Model name:   GEMINI_MODEL env var (default: "gemini-2.0-flash")
//   • Temperature:  0.2  (low = consistent, factual travel advice)
//   • maxRetries:   3    (LangChain built-in retry with exponential back-off)
//   • streaming:    true (required for token-by-token SSE delivery)
// ─────────────────────────────────────────────────────────────────────────────

'use strict'

const { ChatGoogleGenerativeAI } = require('@langchain/google-genai')
const logger = require('../utils/logger')

// ── Resolved model name ────────────────────────────────────────────────────────
// Reads GEMINI_MODEL from the environment; falls back to gemini-2.0-flash.
// This env var is already set to "gemini-2.5-flash" in the production .env,
// so the default only kicks in for test environments that omit the variable.
const RESOLVED_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

// ── Singleton model instance ───────────────────────────────────────────────────
// We declare the variable here and initialise it lazily inside getCopilotModel()
// so that modules can be imported without crashing if GEMINI_API_KEY hasn't been
// loaded yet (e.g. during Jest unit tests that mock env vars).
let _copilotModel = null

/**
 * Returns the shared ChatGoogleGenerativeAI instance, creating it on first call.
 *
 * Lazy init is important because:
 *   1. dotenv is loaded in server.js BEFORE any src/ modules are required.
 *   2. Jest tests can set process.env.GEMINI_API_KEY before importing this file.
 *
 * @returns {ChatGoogleGenerativeAI}
 */
function getCopilotModel() {
  if (_copilotModel) return _copilotModel

  if (!process.env.GEMINI_API_KEY) {
    // Log a warning but do NOT crash — the Copilot will degrade gracefully
    // (the controller catches errors and returns a user-friendly SSE error event).
    logger.warn('[LangGraph/model] GEMINI_API_KEY is not set — Copilot calls will fail.')
  }

  _copilotModel = new ChatGoogleGenerativeAI({
    // ── Identity ────────────────────────────────────────────────────────────
    // The model name read from the environment.  In production this is
    // "gemini-2.5-flash" (set in backend/.env).
    model: RESOLVED_MODEL,

    // ── API key ─────────────────────────────────────────────────────────────
    // LangChain reads GOOGLE_API_KEY by default.  We pass it explicitly so
    // the intention is clear and there is no ambiguity with GOOGLE_CLIENT_ID.
    apiKey: process.env.GEMINI_API_KEY,

    // ── Sampling ────────────────────────────────────────────────────────────
    // Low temperature keeps travel-advice factual and consistent.
    // 0.2 matches the original gemini.service.js generationConfig.
    temperature: 0.2,

    // ── Streaming ───────────────────────────────────────────────────────────
    // Required for the Copilot's SSE endpoint.  When set to true,
    // model.stream() returns an async iterable of AIMessageChunk objects.
    // model.invoke() still works (LangChain gathers the stream internally).
    streaming: true,

    // ── Resilience ──────────────────────────────────────────────────────────
    // LangChain retries failed API calls with exponential back-off.
    // 3 retries = up to ~7 s of extra latency before giving up.
    maxRetries: 3,

    // ── Safety ─────────────────────────────────────────────────────────────
    // Inherit Gemini's default safety settings (BLOCK_MEDIUM_AND_ABOVE).
    // These can be overridden here if the app needs more permissive settings,
    // e.g. for discussing alcohol/nightlife destinations.
    // safetySettings: [...],
  })

  logger.info(`[LangGraph/model] ChatGoogleGenerativeAI initialised — model: ${RESOLVED_MODEL}`)
  return _copilotModel
}

/**
 * Reset the singleton (useful in tests to force re-initialisation).
 * Call this in afterEach / beforeEach when mocking process.env.
 */
function resetCopilotModel() {
  _copilotModel = null
}

module.exports = { getCopilotModel, resetCopilotModel, RESOLVED_MODEL }
