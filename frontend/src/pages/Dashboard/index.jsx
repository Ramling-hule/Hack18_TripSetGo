// src/pages/Dashboard/index.jsx
// Aurora Design System — Dashboard Home orchestrator.
// Follows Screen 06 blueprint layout exactly.
// Preserves all existing Redux hooks, slice actions, and API models.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser } from '@/features/auth/authSlice'
import { fetchMyTrips, selectTrips, selectTripsLoading, likeTrip } from '@/features/trips/tripsSlice'
import { selectSubscription, fetchSubscriptionStatus } from '@/features/subscription/subscriptionSlice'

import GreetingStrip from '@/components/domain/dashboard/GreetingStrip'
import ProBanner from '@/components/domain/ProBanner'
import QuickActions from '@/components/domain/dashboard/QuickActions'
import StatsOverview from '@/components/domain/dashboard/StatsOverview'
import RecentTrips from '@/components/domain/dashboard/RecentTrips'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const user = useSelector(selectUser)
  const trips = useSelector(selectTrips)
  const loading = useSelector(selectTripsLoading)
  const subscription = useSelector(selectSubscription)

  useEffect(() => {
    dispatch(fetchMyTrips({ page: 1, limit: 10 }))
    dispatch(fetchSubscriptionStatus())
  }, [dispatch])

  // Calculate dynamic stats
  const totalTrips = trips.length
  const totalDestinations = new Set(trips.map(t => t.destination?.trim()).filter(Boolean)).size
  const totalLikes = trips.reduce((acc, t) => acc + (t.likesCount || 0), 0)

  const handleLike = (tripId) => {
    dispatch(likeTrip(tripId))
  }

  const handleTripClick = (tripId) => {
    navigate(`/trips/${tripId}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} className="animate-fadeIn">
      {/* 1. Dynamic Greeting Strip */}
      <GreetingStrip userName={user?.name} />

      {/* 2. Pro Banner (conditional, inline variant) */}
      {subscription?.plan === 'free' && (
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <ProBanner variant="inline" />
        </div>
      )}

      {/* 3. Asymmetric Quick Actions */}
      <QuickActions />

      {/* 4. Statistics overview (hidden if totalTrips === 0) */}
      <StatsOverview
        totalTrips={totalTrips}
        totalDestinations={totalDestinations}
        totalLikes={totalLikes}
      />

      {/* 5. Recent Trips Grid (TripCard / Loader / EmptyState) */}
      <RecentTrips
        trips={trips}
        loading={loading}
        onLike={handleLike}
        onClickTrip={handleTripClick}
      />
    </div>
  )
}
