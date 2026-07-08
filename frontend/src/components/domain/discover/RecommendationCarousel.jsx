import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import DestinationCard from './DestinationCard'

export default function RecommendationCarousel({
  trips = [],
  onLike,
  onSave,
  onClone,
  isAuthenticated = true,
  title = 'Recommended For You',
}) {
  // Client-side filter to get budget-friendly recommendations
  const recommendedTrips = trips.filter(t => Number(t.budget) <= 60000).slice(0, 5)

  if (recommendedTrips.length === 0) return null

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--color-indigo-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-indigo-400)'
        }}>
          <Sparkles size={14} />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          {title}
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
        {recommendedTrips.map((trip) => (
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
