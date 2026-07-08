// TripPreviewSkeleton.jsx
// Aurora Design System — Progressive skeleton preview of the upcoming plan.
// Reuses Skeleton + SkeletonCard from common/Loader.jsx.
// Appears at stage 2+ to signal the plan is taking shape.
// Entirely aria-hidden — visual affordance only.
import { AnimatePresence, motion } from 'framer-motion'
import { Skeleton, SkeletonCard } from '@/components/common/Loader'

const TAB_LABELS = ['Transport', 'Hotels', 'Food', 'Itinerary', 'Tips']

export default function TripPreviewSkeleton({ stageIndex }) {
  const showSkeleton = stageIndex >= 2
  const showCards    = stageIndex >= 3

  return (
    <AnimatePresence>
      {showSkeleton && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, type: 'tween', ease: [0, 0, 0.2, 1] }}
          aria-hidden="true"
          style={{ marginBottom: '1.5rem' }}
        >
          {/* Section label */}
          <p
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wide)',
              fontWeight: 600,
              marginBottom: '0.75rem',
              margin: '0 0 0.75rem 0',
            }}
          >
            Your plan is taking shape
          </p>

          {/* Tab pills skeleton */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              marginBottom: '0.875rem',
              flexWrap: 'wrap',
            }}
          >
            {TAB_LABELS.map((t) => (
              <div
                key={t}
                className="skeleton"
                style={{
                  width: 72,
                  height: 28,
                  borderRadius: 99,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Card grid — only at stage 3+ */}
          {showCards && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '0.625rem',
              }}
            >
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
