// server/src/middleware/requestLogger.middleware.js
// Attaches a unique requestId (UUID v4) to every incoming request and logs
// structured HTTP access records (method, url, status, duration, ip).
// The requestId is echoed in the X-Request-ID response header and stored in
// res.locals so downstream error handlers and controllers can include it in
// their own log calls for full-request traceability.
const { v4: uuidv4 } = require('uuid')
const logger          = require('../utils/logger')

// ── Timing helper ─────────────────────────────────────────────────────────────
const NS_PER_MS = BigInt(1_000_000)
const hrToMs    = (start) => Number((process.hrtime.bigint() - start) / NS_PER_MS)

// ── Middleware ────────────────────────────────────────────────────────────────
const requestLogger = (req, res, next) => {
  const requestId = (req.headers['x-request-id'] || uuidv4()).slice(0, 36)
  const startTime = process.hrtime.bigint()

  // Make requestId available downstream (error handler, controllers)
  req.requestId          = requestId
  res.locals.requestId   = requestId
  res.locals.startTime   = startTime

  // Echo back to the client so they can correlate with browser network logs
  res.setHeader('X-Request-ID', requestId)

  // Log on finish — after response headers are sent
  res.on('finish', () => {
    const duration  = hrToMs(startTime)
    const level     = res.statusCode >= 500 ? 'error'
                    : res.statusCode >= 400 ? 'warn'
                    : 'http'

    // Decode userId from the request if the auth middleware has run
    const userId = req.user?._id?.toString() || req.user?.id || null

    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      requestId,
      userId,
      method:     req.method,
      url:        req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip:         req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent:  req.headers['user-agent'] || '',
      contentLength: res.getHeader('content-length') || 0,
    })
  })

  next()
}

module.exports = requestLogger
