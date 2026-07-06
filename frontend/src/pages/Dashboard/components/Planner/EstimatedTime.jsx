// EstimatedTime.jsx
// Aurora Design System — Live elapsed counter with escalating reassurance copy.
// aria-live="off" — seconds-level updates must not interrupt screen reader flow.
import { AnimatePresence, motion } from 'framer-motion'
import { Clock } from 'lucide-react'

function formatElapsed(s) {
  if (s < 60) return `${s}s elapsed`
  return `${Math.floor(s / 60)}m ${s % 60}s elapsed`
}

function getLabel(s) {
  if (s < 25) return 'Usually takes 10–25 seconds'
  if (s < 55) return 'Taking a little longer than usual…'
  return 'Almost there, just a moment more…'
}

export default function EstimatedTime({ elapsedSeconds }) {
  return (
    <div
      aria-live="off"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}
    >
      <Clock
        size={11}
        aria-hidden="true"
        style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
      />

      <AnimatePresence mode="wait">
        <motion.span
          key={elapsedSeconds}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, type: 'tween' }}
          aria-label={`Time elapsed: ${elapsedSeconds} seconds`}
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatElapsed(elapsedSeconds)}
        </motion.span>
      </AnimatePresence>

      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--font-size-caption)',
          color: 'rgba(255,255,255,0.2)',
        }}
      >
        ·
      </span>

      <span
        style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--font-size-caption)',
          color: 'var(--color-text-muted)',
        }}
      >
        {getLabel(elapsedSeconds)}
      </span>
    </div>
  )
}
