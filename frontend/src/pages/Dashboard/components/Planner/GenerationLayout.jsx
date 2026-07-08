// GenerationLayout.jsx
// Aurora Design System — Planner Generation Screen root orchestrator.
//
// Replaces the inline <Loader> block in Planner.jsx while `loading === true`.
// Owns the synthetic stage timer and elapsed-seconds counter.
// Does NOT dispatch Redux actions. Does NOT touch socket, API, or business logic.
//
// Layout strategy:
//   - Uses negative margin to bleed to the edges of DashboardLayout's padded content area
//   - BackgroundPhotography is position:absolute inside an overflow:hidden clip container
//   - Content column is z-index 1, centered, max-width 560px
//
// Aurora compliance:
//   - All Framer Motion transitions: type:'tween', no spring physics
//   - Durations ≤ 200ms for interactive, ≤ 250ms for content
//   - staggerContainer / staggerItem: 40ms stagger
//   - prefers-reduced-motion: handled by index.css base layer
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/components/landing/animations/variants'

import BackgroundPhotography  from './BackgroundPhotography'
import HeroIllustration       from './HeroIllustration'
import GenerationStatus       from './GenerationStatus'
import NarrativeTimeline      from './NarrativeTimeline'
import CurrentTask            from './CurrentTask'
import ProgressIndicator      from './ProgressIndicator'
import TripPreviewSkeleton    from './TripPreviewSkeleton'
import TravelTips             from './TravelTips'
import EstimatedTime          from './EstimatedTime'
import GenerationFooter       from './GenerationFooter'

// Seconds spent in each stage before auto-advancing.
// Stage 4 never auto-advances — it stays until the socket fires.
const STAGE_DURATIONS = [4, 5, 6, 8, Infinity]

export default function GenerationLayout({
  destination,
  source,
  startDate,
  endDate,
  budget,
  numTravelers,
  groupType,
  preferences,
  onCancel,
}) {
  const [stageIndex,     setStageIndex]     = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // ── Elapsed-seconds counter (1s tick) ──────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  // ── Stage-advancement timer ────────────────────────────────────────────────
  useEffect(() => {
    const duration = STAGE_DURATIONS[stageIndex]
    if (duration === Infinity) return          // Stage 4: wait for socket
    const timer = setTimeout(
      () => setStageIndex((prev) => Math.min(prev + 1, 4)),
      duration * 1000
    )
    return () => clearTimeout(timer)
  }, [stageIndex])

  return (
    /*
     * Outer wrapper:
     *   - Negative margin (-32px all sides) to bleed past DashboardLayout's padding
     *   - Matching padding (32px) restored so content respects safe-area
     *   - overflow:hidden on inner clip div to confine the photo background
     */
    <div
      id="generation-screen"
      role="status"
      aria-live="polite"
      aria-label="Gemini AI is generating your trip itinerary"
      aria-atomic="false"
      style={{
        position: 'relative',
        margin: 'calc(-1 * var(--spacing-8))',
        minHeight: 'calc(100vh - var(--layout-navbar-height))',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'var(--spacing-8) var(--spacing-4)',
      }}
    >
      {/* ── Layer 0: Ambient background (clipped) ────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <BackgroundPhotography destination={destination} />
      </div>

      {/* ── Layer 1: Content column ──────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 560,
        }}
      >
        {/* 1. Destination identity + orb */}
        <HeroIllustration
          destination={destination}
          source={source}
          startDate={startDate}
          endDate={endDate}
          budget={budget}
          numTravelers={numTravelers}
          groupType={groupType}
        />

        {/* 2. Stage headline */}
        <motion.div variants={staggerItem}>
          <GenerationStatus stageIndex={stageIndex} destination={destination} />
        </motion.div>

        {/* 3. Rotating micro-copy */}
        <motion.div variants={staggerItem}>
          <CurrentTask
            stageIndex={stageIndex}
            destination={destination}
            source={source}
            preferences={preferences}
          />
        </motion.div>

        {/* 4. Stage progress bar (no fake %) */}
        <motion.div variants={staggerItem}>
          <ProgressIndicator stageIndex={stageIndex} />
        </motion.div>

        {/* 5. AI work stage list */}
        <motion.div variants={staggerItem}>
          <NarrativeTimeline stageIndex={stageIndex} />
        </motion.div>

        {/* 6. Progressive skeleton preview (stage 2+) */}
        <motion.div variants={staggerItem}>
          <TripPreviewSkeleton stageIndex={stageIndex} />
        </motion.div>

        {/* 7. Rotating travel tips */}
        <motion.div variants={staggerItem}>
          <TravelTips preferences={preferences || []} />
        </motion.div>

        {/* 8. Elapsed time + reassurance */}
        <motion.div variants={staggerItem}>
          <EstimatedTime elapsedSeconds={elapsedSeconds} />
        </motion.div>

        {/* 9. Cancel + Gemini branding */}
        <GenerationFooter onCancel={onCancel} />
      </motion.div>
    </div>
  )
}
