import React from 'react'
import { motion } from 'framer-motion'
import { getDestinationImage } from '@/utils/imageUtils'

export default function HeroStrip({ trip }) {
  const photoUrl = getDestinationImage(trip.destination)
  const days = trip.planData?.meta?.total_days || 0
  const author = trip.userId?.name || 'Traveler'

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        overflow: 'hidden',
        background: 'var(--color-bg-secondary)',
      }}
      className="md:h-[320px] h-[200px]"
    >
      <motion.img
        src={photoUrl}
        alt={`Cover scenery of ${trip.destination}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 30%',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      {/* Dark scrim gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(12, 14, 20, 0.95) 0%, rgba(12, 14, 20, 0.4) 60%, transparent 100%)',
        }}
      />
      {/* Content overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '2rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
        className="px-6 md:px-10"
      >
        <motion.h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'clamp(1.75rem, 4vw, 2.50rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'var(--color-text-primary)',
            margin: 0,
            marginBottom: '0.5rem',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {trip.source} → <span className="bg-gradient-primary bg-clip-text text-transparent">{trip.destination}</span>
        </motion.h1>
        <motion.p
          style={{
            fontFamily: 'var(--font-family-sans)',
            fontSize: 'var(--font-size-body-sm)',
            fontWeight: 400,
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        >
          A {days}-day trip planned by <strong style={{ color: 'var(--color-text-primary)' }}>{author}</strong>
        </motion.p>
      </div>
    </div>
  )
}
