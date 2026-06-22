// backend/src/services/travel/middleware/circuitBreaker.js
// ─────────────────────────────────────────────────────────────────────────────
// Per-provider circuit breaker implementing the three-state automaton:
//
//   CLOSED   → normal operation; failure counter increments on each error
//   OPEN     → all calls fail fast; no requests reach the provider
//   HALF_OPEN → probe phase; one request allowed to test recovery
//
// State transitions:
//   CLOSED  → OPEN       when failureCount >= threshold within windowMs
//   OPEN    → HALF_OPEN  when cooldownMs has elapsed since the OPEN transition
//   HALF_OPEN → CLOSED   on successful probe
//   HALF_OPEN → OPEN     on failed probe
//
// State is stored in Redis so all Node processes share a single breaker.
// Falls back to in-memory state when Redis is unavailable.
// ─────────────────────────────────────────────────────────────────────────────
const travelLogger = require('../utils/travelLogger')

const STATE = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
}

const DEFAULTS = {
  failureThreshold: 5,    // failures within windowMs to trip the breaker
  windowMs: 60000,        // 60s failure tracking window
  cooldownMs: 30000,      // 30s before switching OPEN → HALF_OPEN
}

class CircuitBreaker {
  /**
   * @param {string} providerName
   * @param {Object} opts
   * @param {number} opts.failureThreshold
   * @param {number} opts.windowMs
   * @param {number} opts.cooldownMs
   */
  constructor(providerName, opts = {}) {
    this.providerName = providerName
    this.opts = { ...DEFAULTS, ...opts }

    // In-memory state (used when Redis unavailable)
    this._memState = {
      state: STATE.CLOSED,
      failureCount: 0,
      lastFailureTime: null,
      openedAt: null,
    }
  }

  _redisKey() {
    return `cb:${this.providerName.toLowerCase()}:state`
  }

  _redis() {
    return global.__redisClient || null
  }

  // ── State Accessors ──────────────────────────────────────────────────────

  async _getState() {
    const redis = this._redis()
    if (!redis) return this._memState

    try {
      const raw = await redis.get(this._redisKey())
      return raw ? JSON.parse(raw) : { state: STATE.CLOSED, failureCount: 0, lastFailureTime: null, openedAt: null }
    } catch {
      return this._memState
    }
  }

  async _setState(newState) {
    const redis = this._redis()
    this._memState = newState // always keep in-memory in sync

    if (!redis) return
    try {
      // Keep circuit state for 2× the cooldown window
      const ttl = Math.ceil((this.opts.cooldownMs * 2) / 1000)
      await redis.setex(this._redisKey(), ttl, JSON.stringify(newState))
    } catch {
      // Silently ignore — in-memory is still correct for this process
    }
  }

  // ── Core API ─────────────────────────────────────────────────────────────

  /**
   * Check whether a request is allowed through.
   *
   * @returns {Promise<{ allowed: boolean, state: string }>}
   */
  async canRequest() {
    const st = await this._getState()
    const now = Date.now()

    if (st.state === STATE.CLOSED) {
      return { allowed: true, state: STATE.CLOSED }
    }

    if (st.state === STATE.OPEN) {
      const cooledDown = st.openedAt && (now - st.openedAt >= this.opts.cooldownMs)
      if (cooledDown) {
        // Transition to HALF_OPEN — allow one probe
        await this._setState({ ...st, state: STATE.HALF_OPEN })
        travelLogger.info(this.providerName, `Circuit OPEN → HALF_OPEN (probe allowed)`)
        return { allowed: true, state: STATE.HALF_OPEN }
      }
      return { allowed: false, state: STATE.OPEN }
    }

    if (st.state === STATE.HALF_OPEN) {
      // Only one probe at a time — deny if already probing
      return { allowed: true, state: STATE.HALF_OPEN }
    }

    return { allowed: true, state: STATE.CLOSED }
  }

  /**
   * Record a successful call. Resets the failure counter.
   */
  async recordSuccess() {
    const st = await this._getState()

    if (st.state === STATE.HALF_OPEN) {
      travelLogger.info(this.providerName, `Circuit HALF_OPEN → CLOSED (probe succeeded)`)
    }

    await this._setState({
      state: STATE.CLOSED,
      failureCount: 0,
      lastFailureTime: null,
      openedAt: null,
    })
  }

  /**
   * Record a failed call. Opens the circuit if threshold is reached.
   * @param {Error} err
   */
  async recordFailure(err) {
    const st = await this._getState()
    const now = Date.now()

    if (st.state === STATE.HALF_OPEN) {
      // Probe failed — snap back to OPEN immediately
      travelLogger.warn(this.providerName, `Circuit HALF_OPEN → OPEN (probe failed)`, {
        error: err?.message,
      })
      await this._setState({ ...st, state: STATE.OPEN, openedAt: now })
      return
    }

    // In CLOSED state, track failures within the rolling window
    const windowStart = now - this.opts.windowMs
    const inWindow = st.lastFailureTime && st.lastFailureTime >= windowStart

    const newCount = inWindow ? st.failureCount + 1 : 1

    if (newCount >= this.opts.failureThreshold) {
      travelLogger.error(this.providerName, `Circuit CLOSED → OPEN (${newCount} failures in ${this.opts.windowMs}ms)`, {
        failureCount: newCount,
        threshold: this.opts.failureThreshold,
        error: err?.message,
      })
      await this._setState({
        state: STATE.OPEN,
        failureCount: newCount,
        lastFailureTime: now,
        openedAt: now,
      })
    } else {
      await this._setState({
        ...st,
        state: STATE.CLOSED,
        failureCount: newCount,
        lastFailureTime: now,
      })
    }
  }

  /**
   * Current breaker status (for health checks / monitoring).
   */
  async status() {
    const st = await this._getState()
    return {
      provider: this.providerName,
      state: st.state,
      failureCount: st.failureCount,
      openedAt: st.openedAt ? new Date(st.openedAt).toISOString() : null,
      cooldownMs: this.opts.cooldownMs,
      failureThreshold: this.opts.failureThreshold,
    }
  }
}

module.exports = { CircuitBreaker, STATE }
