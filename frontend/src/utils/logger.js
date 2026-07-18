// src/utils/logger.js — Environment-aware client-side logger
// Development: delegates to browser console with styled prefix.
// Production:  error/warn levels are beaconed to the backend ingestion endpoint
//              via navigator.sendBeacon (non-blocking, survives page unload).
//              debug/info are silently dropped in production to reduce noise.

const IS_PROD     = import.meta.env.PROD
const LOG_ENDPOINT = `${import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
  : 'http://localhost:5001'}/api/v1/logs/client`

// ── Session ID (tab-scoped, not persisted across hard-reloads) ────────────────
let _sessionId = null
try {
  _sessionId = sessionStorage.getItem('__tsg_sid')
  if (!_sessionId) {
    _sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem('__tsg_sid', _sessionId)
  }
} catch {
  _sessionId = 'unknown'
}

// ── Beacon helper ─────────────────────────────────────────────────────────────
// Uses sendBeacon for fire-and-forget delivery that survives page unload.
// Falls back to fetch if sendBeacon is not available (e.g. older browsers / SSR).
function _beacon(level, message, extra = {}) {
  if (!IS_PROD) return  // only send in production

  const userId = (() => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.userId || payload?.sub || null
    } catch {
      return null
    }
  })()

  const body = JSON.stringify({
    level,
    message,
    stack:     extra.stack  || null,
    url:       window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: _sessionId,
    userId,
    ...extra,
  })

  if (typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon(LOG_ENDPOINT, new Blob([body], { type: 'application/json' }))
  } else {
    // Fallback: best-effort fetch (not awaited)
    fetch(LOG_ENDPOINT, {
      method:      'POST',
      body,
      headers:     { 'Content-Type': 'application/json' },
      keepalive:   true,
      credentials: 'include',
    }).catch(() => { /* silently swallow — logger must not throw */ })
  }
}

// ── Console helper (development only) ────────────────────────────────────────
const PREFIX = '%c[TripSetGo]%c'
const STYLES = {
  debug: ['color:#7c3aed;font-weight:bold', 'color:inherit'],
  info:  ['color:#0ea5e9;font-weight:bold', 'color:inherit'],
  warn:  ['color:#f59e0b;font-weight:bold', 'color:inherit'],
  error: ['color:#ef4444;font-weight:bold', 'color:inherit'],
}

function _console(level, args) {
  if (IS_PROD) return
  const fn = level === 'debug' ? console.debug
           : level === 'info'  ? console.info
           : level === 'warn'  ? console.warn
           : console.error
  fn(PREFIX, ...STYLES[level], ...args)
}

// ── Public API ────────────────────────────────────────────────────────────────
const logger = {
  /**
   * Verbose debug info — dev console only, suppressed in production.
   */
  debug(...args) {
    _console('debug', args)
    // never beaconed
  },

  /**
   * General informational messages — dev console only, suppressed in production.
   */
  info(...args) {
    _console('info', args)
    // never beaconed — keep the endpoint for meaningful signals
  },

  /**
   * Warnings that don't break the app but should be investigated.
   * Beaconed to the backend in production.
   */
  warn(message, extra = {}) {
    _console('warn', [message, extra])
    _beacon('warn', String(message), extra)
  },

  /**
   * Errors that break an operation. Always beaconed in production.
   * Pass an Error object as the first arg to capture the stack trace.
   *   logger.error(err)
   *   logger.error('Context message', err)
   *   logger.error('Context message', { detail: 'value' })
   */
  error(messageOrError, extra = {}) {
    let message, stack

    if (messageOrError instanceof Error) {
      message = messageOrError.message
      stack   = messageOrError.stack
    } else if (typeof messageOrError === 'string' && extra instanceof Error) {
      message = messageOrError
      stack   = extra.stack
      extra   = {}
    } else {
      message = String(messageOrError)
      stack   = extra?.stack || null
    }

    _console('error', [message, stack || extra])
    _beacon('error', message, { stack, ...extra })
  },
}

export default logger
