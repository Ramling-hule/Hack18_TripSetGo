// CurrentTask.jsx
// Aurora Design System — Rotating micro-copy beneath the stage timeline.
// Advances every 2500ms within the current stage's task pool.
// aria-hidden="true" — decorative; screen readers use GenerationStatus instead.
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TASK_POOLS = [
  // Stage 0 — Researching
  (dest, src) => [
    `Checking weather for your travel dates in ${dest || 'your destination'}…`,
    `Finding the fastest transport options from ${src || 'your origin'}…`,
    `Scanning top tourist attractions and landmarks…`,
  ],
  // Stage 1 — Planning
  (dest) => [
    `Mapping the optimal route across ${dest || 'your destination'}…`,
    `Structuring a balanced day-by-day flow…`,
    `Finding the fastest transport connections…`,
  ],
  // Stage 2 — Sourcing
  (dest) => [
    `Sourcing stays and transport within budget…`,
    `Locating highly-rated boutique hotels…`,
    `Finding transport options matching your pace…`,
  ],
  // Stage 3 — Personalising
  (dest, _src, prefs = []) => [
    `Discovering local cafés loved by residents…`,
    `Adding hidden gems near your hotel…`,
    `Tailoring food options to your travel style…`,
  ],
  // Stage 4 — Finalising
  () => [
    `Balancing your itinerary with your budget…`,
    `Reviewing safety notes and local travel tips…`,
    `Almost ready—reviewing your final plan…`,
  ],
]

export default function CurrentTask({ stageIndex, destination, source, preferences }) {
  const [taskIndex, setTaskIndex] = useState(0)

  const tasks =
    (TASK_POOLS[stageIndex] ?? TASK_POOLS[4])(destination, source, preferences)

  // Reset when stage changes
  useEffect(() => {
    setTaskIndex(0)
  }, [stageIndex])

  // Rotate tasks within stage
  useEffect(() => {
    const timer = setInterval(() => {
      setTaskIndex((prev) => (prev + 1) % tasks.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [stageIndex, tasks.length])

  return (
    <div
      aria-hidden="true"
      style={{
        textAlign: 'center',
        marginBottom: '1.25rem',
        minHeight: '1.4rem',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={`${stageIndex}-${taskIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, type: 'tween' }}
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.01em',
          }}
        >
          {tasks[taskIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
