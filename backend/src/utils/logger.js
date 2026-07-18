// server/src/utils/logger.js
// Production-ready structured logger using Winston + daily-rotate-file.
// - Production: JSON transport to rotating log files (error.log, combined.log)
//   with 14-day retention and 20 MB per-file cap.
// - Development: Human-readable colorised console output.
// - All log entries include: timestamp, level, service, env, pid, requestId, userId.
const winston = require('winston')
require('winston-daily-rotate-file')

const { combine, timestamp, colorize, printf, json, errors } = winston.format

const IS_PROD = process.env.NODE_ENV === 'production'
const SERVICE = 'tripsetgo-api'

// ── Development format ────────────────────────────────────────────────────────
const devFormat = printf(({ level, message, timestamp: ts, requestId, userId, stack, ...meta }) => {
  const rid    = requestId ? ` [rid:${requestId}]` : ''
  const uid    = userId    ? ` [uid:${userId}]`    : ''
  const metaStr = Object.keys(meta).filter(k => !['service', 'env', 'pid'].includes(k)).length
    ? ` ${JSON.stringify(meta)}`
    : ''
  const body = stack ? `\n${stack}` : ''
  return `${ts} [${level}]${rid}${uid}: ${message}${metaStr}${body}`
})

// ── Shared fields added to every log entry ────────────────────────────────────
const sharedFields = winston.format((info) => {
  info.service = SERVICE
  info.env     = process.env.NODE_ENV || 'development'
  info.pid     = process.pid
  return info
})()

// ── Transports ────────────────────────────────────────────────────────────────
const consoleTransport = new winston.transports.Console({
  format: IS_PROD
    ? combine(sharedFields, errors({ stack: true }), timestamp(), json())
    : combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        devFormat
      ),
})

// Daily-rotating file transports — only in production
const fileTransports = IS_PROD
  ? [
      new winston.transports.DailyRotateFile({
        filename:     'logs/error-%DATE%.log',
        datePattern:  'YYYY-MM-DD',
        level:        'error',
        maxSize:      '20m',
        maxFiles:     '14d',
        zippedArchive: true,
        format:       combine(sharedFields, errors({ stack: true }), timestamp(), json()),
      }),
      new winston.transports.DailyRotateFile({
        filename:     'logs/combined-%DATE%.log',
        datePattern:  'YYYY-MM-DD',
        maxSize:      '20m',
        maxFiles:     '14d',
        zippedArchive: true,
        format:       combine(sharedFields, errors({ stack: true }), timestamp(), json()),
      }),
    ]
  : []

// ── Logger instance ───────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level:       IS_PROD ? 'info' : 'debug',
  levels:      { ...winston.config.npm.levels, http: 4 },   // add http between info(2) and verbose(5)
  transports:  [consoleTransport, ...fileTransports],
  exitOnError: false,
})

// ── Helper: create a child logger bound to a specific request context ─────────
// Usage: const reqLog = logger.child({ requestId, userId })
// Then: reqLog.error('message') → inherits requestId/userId on every entry.
logger.child = (bindings) => {
  const child = Object.create(logger)
  const originalLog = logger.log.bind(logger)
  child.log = (level, message, meta = {}) => originalLog(level, message, { ...bindings, ...meta })
  ;['error', 'warn', 'info', 'http', 'debug'].forEach(level => {
    child[level] = (message, meta = {}) => logger[level](message, { ...bindings, ...meta })
  })
  return child
}

module.exports = logger
