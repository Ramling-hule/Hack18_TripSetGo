// server/src/routes/logs.routes.js
// Ingests structured error / warning payloads beaconed from the React frontend.
// The frontend logger uses navigator.sendBeacon (or fetch fallback) to POST here
// whenever logger.error() or logger.warn() is called in production.
// Responds 204 No Content — clients do not await a body.
const router  = require('express').Router()
const logger  = require('../utils/logger')

const VALID_LEVELS = new Set(['warn', 'error'])

router.post('/', (req, res) => {
  try {
    const {
      level     = 'error',
      message   = '(no message)',
      stack     = null,
      url       = '',
      userAgent = '',
      timestamp = new Date().toISOString(),
      sessionId = null,
      userId    = null,
    } = req.body || {}

    const safeLevel = VALID_LEVELS.has(level) ? level : 'warn'

    // Trim stack to avoid multi-MB payloads
    const safeStack = typeof stack === 'string' ? stack.slice(0, 4000) : null

    logger[safeLevel](`[CLIENT] ${String(message).slice(0, 500)}`, {
      source:    'browser',
      sessionId,
      userId,
      clientUrl: String(url).slice(0, 512),
      userAgent: String(userAgent).slice(0, 256),
      clientTs:  timestamp,
      stack:     safeStack,
      // Thread through the server-side requestId so the server access log
      // entry for this POST and the browser error are correlatable.
      requestId: req.requestId,
    })
  } catch (parseErr) {
    // Never let a bad client payload crash the logging endpoint itself
    logger.warn('[CLIENT] Failed to parse client log payload', {
      requestId: req.requestId,
      error:     parseErr.message,
    })
  }

  // 204 — no body. sendBeacon ignores the response body anyway.
  res.status(204).end()
})

module.exports = router
