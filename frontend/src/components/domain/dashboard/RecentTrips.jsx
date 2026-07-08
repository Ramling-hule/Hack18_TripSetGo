// src/components/domain/dashboard/RecentTrips.jsx
// Aurora Design System — Recent trips list section
// Integrates reusable TripCard, EmptyState, and SkeletonLoader.
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, Plane } from 'lucide-react'
import TripCard from '@/components/domain/TripCard'
import EmptyState from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Loader'
import { getDestinationImage } from '@/utils/imageUtils'

export default function RecentTrips({ trips = [], loading, error, onLike, onClickTrip }) {
  const navigate = useNavigate()
  const recentTrips = trips.slice(0, 4)

  if (loading) {
    return (
      <section style={{ marginBottom: 'var(--spacing-8)' }} aria-label="Recent Trips Loading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--font-size-h2)', fontWeight: 800, margin: 0 }}>
            Recent Trips
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section style={{ marginBottom: 'var(--spacing-8)' }} aria-label="Recent Trips Error">
        <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--font-size-h2)', fontWeight: 800, margin: 0, marginBottom: 'var(--spacing-4)' }}>
          Recent Trips
        </h2>
        <div
          role="alert"
          style={{
            background: 'var(--color-rose-dim)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-6)',
            textAlign: 'center',
            color: 'var(--color-rose-400)',
          }}
        >
          <p style={{ fontWeight: 600, margin: '0 0 var(--spacing-3) 0' }}>Couldn't load your trips.</p>
          <p style={{ fontSize: 'var(--font-size-body-sm)', margin: 0 }}>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section style={{ marginBottom: 'var(--spacing-8)' }} aria-label="Recent Trips">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--font-size-h2)', fontWeight: 800, margin: 0 }}>
          Recent Trips
        </h2>
        {trips.length > 0 && (
          <Link
            to="/dashboard/trips"
            style={{
              color: 'var(--color-indigo-400)',
              fontSize: 'var(--font-size-body-sm)',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {recentTrips.length === 0 ? (
        <EmptyState
          icon={<Plane size={48} style={{ color: 'var(--color-text-muted)' }} />}
          title="Your first trip is one prompt away"
          description="Plan your first AI-powered travel itinerary in seconds."
          action={{
            variant: 'primary',
            label: 'Plan a Trip',
            onClick: () => navigate('/dashboard/planner')
          }}
          style={{
            border: '1px dashed var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            height: 240,
            background: 'var(--color-surface-default)',
          }}
          bgImage={getDestinationImage('travel')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentTrips.map((trip) => {
            // Map api model to TripCard contract format
            const mappedTrip = {
              ...trip,
              title: trip.destination,
              destination: `from ${trip.source}`,
              coverImage: trip.coverImage,
              startDate: trip.createdAt,
              endDate: null,
              status: trip.plan === 'pro' ? 'pro' : 'free',
              memberCount: trip.numTravelers || 0,
              isLiked: trip.isLiked || false,
            }

            return (
              <div key={trip._id}>
                <TripCard
                  trip={mappedTrip}
                  onLike={() => onLike?.(trip._id)}
                  onClick={() => onClickTrip?.(trip._id)}
                />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
