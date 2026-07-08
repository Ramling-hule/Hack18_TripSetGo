import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { getDestinationImage } from '@/utils/imageUtils'

export default function TrendingDestinations({
  destinations = [],
  onSelect,
}) {
  if (destinations.length === 0) return null

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--color-indigo-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-indigo-400)'
        }}>
          <TrendingUp size={14} />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          Trending Destinations
        </h3>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
        }}
        className="scrollbar-none snap-x"
      >
        {destinations.slice(0, 8).map((dest, idx) => {
          const coverImg = getDestinationImage(dest.destination || '')
          return (
            <motion.button
              key={idx}
              onClick={() => onSelect(dest.destination)}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: 160,
                aspectRatio: '1/1',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-surface-raised)',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                outline: 'none',
              }}
              className="snap-center group focus-visible:ring-2 focus-visible:ring-indigo-500"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={coverImg}
                alt={dest.destination}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                className="transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay scrim */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(14, 17, 23, 0.9) 0%, rgba(14, 17, 23, 0.2) 60%, transparent 100%)',
                }}
              />

              {/* Text info bottom */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1rem',
                  zIndex: 2,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  {dest.destination}
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    marginTop: '0.125rem',
                  }}
                >
                  {dest.count} {dest.count === 1 ? 'trip' : 'trips'} shared
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
