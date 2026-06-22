// backend/src/services/travel/utils/retryWithBackoff.js
// ─────────────────────────────────────────────────────────────────────────────
// Exponential backoff with full jitter — AWS-recommended pattern.
//
// Formula:  sleep = random_between(0, min(cap, base * 2^attempt))
//   base = 200ms, cap = 5000ms, max attempts = configurable
//
// Non-retriable HTTP errors (4xx except 429) throw immediately.
// Amadeus token expiry (401) is re-thrown for the provider to handle.
// ─────────────────────────────────────────────────────────────────────────────
const travelLogger = require('./travelLogger')

// HTTP status codes that are safe to retry
const RETRIABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504])

// HTTP status codes that should NOT be retried (bad input, auth handled upstream)
const NON_RETRIABLE_STATUS = new Set([400, 401, 403, 404, 422])

/**
 * Error class carrying the HTTP status code for upstream decisions.
 */
class HttpError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/**
 * Execute `fn` with exponential backoff + full jitter.
 *
 * @param {Function} fn           — Async function to execute. Must throw HttpError on failure.
 * @param {Object}   opts
 * @param {number}   opts.maxRetries    — Max retry attempts (default 4)
 * @param {number}   opts.baseDelayMs   — Base delay in ms (default 200)
 * @param {number}   opts.capMs         — Max delay cap in ms (default 5000)
 * @param {string}   opts.providerName  — Used in log messages
 * @param {string}   opts.operation     — Short description for log messages
 * @returns {Promise<*>}
 */
async function retryWithBackoff(fn, {
  maxRetries = 4,
  baseDelayMs = 200,
  capMs = 5000,
  providerName = 'unknown',
  operation = 'request',
} = {}) {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt)
    } catch (err) {
      lastError = err

      // Non-retriable HTTP errors — fail fast
      if (err instanceof HttpError && NON_RETRIABLE_STATUS.has(err.status)) {
        travelLogger.warn(providerName, `Non-retriable ${err.status} on ${operation} — aborting`, {
          attempt,
          status: err.status,
        })
        throw err
      }

      // If we've exhausted retries, throw
      if (attempt >= maxRetries) {
        travelLogger.error(providerName, `${operation} failed after ${maxRetries + 1} attempts`, {
          error: err.message,
          status: err.status,
        })
        throw err
      }

      // Calculate sleep with full jitter
      const exponential = Math.min(capMs, baseDelayMs * Math.pow(2, attempt))
      const sleep = Math.floor(Math.random() * exponential)

      travelLogger.warn(providerName, `${operation} attempt ${attempt + 1} failed — retrying in ${sleep}ms`, {
        attempt: attempt + 1,
        maxRetries,
        error: err.message,
        status: err.status,
        retryAfterMs: sleep,
      })

      await new Promise(r => setTimeout(r, sleep))
    }
  }

  throw lastError
}

/**
 * Sleep for `ms` milliseconds. Useful for honouring Retry-After headers.
 */
function sleep(ms) {
  return new Promise(r => setTimeout(r, Math.max(0, ms)))
}

module.exports = { retryWithBackoff, HttpError, sleep }
