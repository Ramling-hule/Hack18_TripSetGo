// src/components/landing/DestinationLabel.jsx
// Crossfading destination name label — bottom-left of the carousel.
// Announces slide changes to screen readers via aria-live.
import { AnimatePresence, motion } from 'framer-motion'

export default function DestinationLabel({ destination, region }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        bottom: 'var(--spacing-8)',
        left: 'var(--spacing-10)',
        zIndex: 20,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={destination}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1], type: 'tween' }}
          className="text-section-label"
          style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}
        >
          {destination.toUpperCase()} &mdash; {region.toUpperCase()}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
