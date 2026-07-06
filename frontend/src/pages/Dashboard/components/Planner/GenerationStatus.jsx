// GenerationStatus.jsx
// Aurora Design System — Stage-keyed animated headline.
// Changes with stageIndex. aria-live="polite" announces updates to screen readers.
import { AnimatePresence, motion } from 'framer-motion'

const STAGE_MESSAGES = [
  (dest) => `Checking weather and routes for ${dest || 'your trip'}…`,
  ()     => `Finding the fastest transport options…`,
  ()     => `Sourcing stays and local recommendations…`,
  ()     => `Discovering local gems and cafés…`,
  ()     => `Almost ready—reviewing your final plan…`,
]

export default function GenerationStatus({ stageIndex, destination }) {
  const msg = (STAGE_MESSAGES[stageIndex] ?? STAGE_MESSAGES[4])(destination)

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        textAlign: 'center',
        marginBottom: '0.5rem',
        minHeight: '2.2rem',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2, type: 'tween', ease: [0, 0, 0.2, 1] }}
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h3)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          {msg}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
