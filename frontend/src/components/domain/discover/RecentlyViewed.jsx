import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import DestinationCard from './DestinationCard'

export default function RecentlyViewed({
  trips = [],
  onLike,
  onSave,
  onClone,
  isAuthenticated = true,
}) {
  if (trips.length === 0) return null

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--color-indigo-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-indigo-400)'
        }}>
          <History size={14} />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          Recently Viewed Itineraries
        </h3>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
        }}
        className="scrollbar-none snap-x"
      >
        {trips.map((trip) => (
          <div
            key={trip._id}
            style={{
              flexShrink: 0,
              width: 280,
            }}
            className="snap-center"
          >
            <DestinationCard
              trip={trip}
              onLike={onLike}
              onSave={onSave}
              onClone={onClone}
              isAuthenticated={isAuthenticated}
              aspectRatio="3/2"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
