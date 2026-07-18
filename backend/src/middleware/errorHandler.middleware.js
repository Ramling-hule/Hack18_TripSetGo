// server/src/middleware/errorHandler.middleware.js
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  const requestId  = req.requestId || res.locals?.requestId || null
  const userId     = req.user?._id?.toString() || req.user?.id || null

  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    requestId,
    userId,
    method:     req.method,
    url:        req.originalUrl,
    statusCode: err.statusCode || err.status || 500,
    stack:      err.stack,
  })

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ success: false, message: 'Validation error', errors })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(400).json({ success: false, message: `${field} already exists` })
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' })
  }

  // Travel API Provider errors (Circuit Breaker / Rate Limit)
  if (err.message && err.message.includes('Circuit breaker is OPEN')) {
    return res.status(503).json({ success: false, message: 'External provider is temporarily unavailable' })
  }
  if (err.message && err.message.includes('Rate limit exceeded')) {
    res.set('Retry-After', '60')
    return res.status(429).json({ success: false, message: 'External provider rate limit exceeded' })
  }

  // Generic
  const statusCode = err.statusCode || err.status || 500
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error',
  })
}

module.exports = errorHandler
