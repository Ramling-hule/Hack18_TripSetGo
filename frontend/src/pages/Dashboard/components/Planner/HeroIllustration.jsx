// HeroIllustration.jsx
// Aurora Design System — Destination identity + animated orb
// Displays destination name, route info, and trip meta badges.
// Orb pulses via CSS animation (--animate-pulse-slow) — no spring physics.
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Sparkles } from 'lucide-react'
import Badge from '@/components/common/Badge'
import { staggerItem } from '@/components/landing/animations/variants'

const inr = (n) =>
  n ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : null

export default function HeroIllustration({
  destination,
  source,
  startDate,
  endDate,
  budget,
  numTravelers,
  groupType,
}) {
  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
        )
      : null

  const groupLabel = {
    solo: 'Solo',
    couple: 'Couple',
    family: 'Family',
    friends: 'Friends',
  }[groupType] || null

  return (
    <motion.div
      variants={staggerItem}
      style={{ textAlign: 'center', marginBottom: '1.75rem' }}
    >
      {/* ── Animated orb ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(61,82,160,0.25), 0 0 40px rgba(61,82,160,0.10)',
              '0 0 36px rgba(61,82,160,0.45), 0 0 70px rgba(61,82,160,0.18)',
              '0 0 20px rgba(61,82,160,0.25), 0 0 40px rgba(61,82,160,0.10)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, var(--color-indigo-700) 0%, var(--color-sky-500) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <motion.span
            animate={{ opacity: [1, 0.45, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', type: 'tween' }}
            style={{ display: 'inline-flex', color: 'white' }}
          >
            <Sparkles size={30} />
          </motion.span>
        </motion.div>
      </div>

      {/* ── Destination heading ── */}
      <h2
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 800,
          color: '#ffffff',
          margin: 0,
          marginBottom: '0.375rem',
          letterSpacing: 'var(--tracking-tight)',
          lineHeight: 'var(--line-height-tight)',
        }}
      >
        {destination || 'Your destination'}
      </h2>

      {/* ── Route line ── */}
      {source && (
        <div
          aria-label={`Route: ${source} to ${destination}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            marginBottom: '0.875rem',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-body-sm)',
          }}
        >
          <MapPin size={12} aria-hidden="true" />
          <span>{source}</span>
          <ArrowRight size={12} aria-hidden="true" />
          <span style={{ color: 'var(--color-indigo-400)' }}>{destination}</span>
        </div>
      )}

      {/* ── Trip meta badges ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {days && <Badge label={`${days} day${days !== 1 ? 's' : ''}`} variant="secondary" />}
        {budget && inr(budget) && <Badge label={inr(budget)} variant="secondary" />}
        {numTravelers && groupLabel && (
          <Badge label={`${numTravelers} · ${groupLabel}`} variant="primary" />
        )}
      </div>
    </motion.div>
  )
}
