import { useEffect, useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import {
  fetchFeed, searchTrips, setFilters, setSearchQuery, discoverLikeTrip, discoverSaveTrip, fetchTrending,
  selectFeed, selectDiscoverLoading, selectHasMore, selectDiscoverFilters, selectTrending,
} from '@/features/discover/discoverSlice'
import { cloneTrip } from '@/features/trips/tripsSlice'
import { selectIsAuthenticated } from '@/features/auth/authSlice'
import { useDebounce } from '@/hooks/useDebounce'

import SearchHero from '@/components/domain/discover/SearchHero'
import SearchBar from '@/components/domain/discover/SearchBar'
import FilterChips from '@/components/domain/discover/FilterChips'
import FeaturedDestination from '@/components/domain/discover/FeaturedDestination'
import TrendingDestinations from '@/components/domain/discover/TrendingDestinations'
import DestinationGrid from '@/components/domain/discover/DestinationGrid'
import RecommendationCarousel from '@/components/domain/discover/RecommendationCarousel'
import TravelCollections from '@/components/domain/discover/TravelCollections'
import RecentlyViewed from '@/components/domain/discover/RecentlyViewed'
import EmptyState from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Loader'

export default function Discover() {
  const dispatch = useDispatch()
  const feed = useSelector(selectFeed) || []
  const trending = useSelector(selectTrending) || []
  const loading = useSelector(selectDiscoverLoading)
  const hasMore = useSelector(selectHasMore)
  const filters = useSelector(selectDiscoverFilters)
  const cursor = useSelector(s => s.discover.cursor)
  const query = useSelector(s => s.discover.searchQuery)
  const searchResults = useSelector(s => s.discover.searchResults)
  const error = useSelector(s => s.discover.error)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const debouncedQuery = useDebounce(query, 500)

  // Local state for recently viewed trips (persisted in localStorage)
  const [recentTrips, setRecentTrips] = useState([])

  // Load recently viewed on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tsg_recently_viewed')
      if (stored) {
        setRecentTrips(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load recently viewed trips from localStorage:', e)
    }
  }, [])

  // Initial load of feed and trending destinations
  useEffect(() => {
    dispatch(fetchFeed({}))
    dispatch(fetchTrending())
  }, [dispatch])

  // Search trigger on debounced query or filters change
  useEffect(() => {
    if (debouncedQuery) {
      dispatch(searchTrips({ query: debouncedQuery, filters }))
    } else if (debouncedQuery === '') {
      dispatch(fetchFeed({}))
    }
  }, [debouncedQuery, filters, dispatch])

  // Infinite scroll observer setup
  const sentinelRef = useRef()
  const handleObserver = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !loading && !debouncedQuery) {
      dispatch(fetchFeed({ cursor, filters }))
    }
  }, [hasMore, loading, cursor, filters, debouncedQuery, dispatch])

  useEffect(() => {
    const obs = new IntersectionObserver(handleObserver, { threshold: 0.5 })
    if (sentinelRef.current) obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [handleObserver])

  // Handle setting recently viewed trips when users interact with cards
  const handleCardInteraction = (trip) => {
    setRecentTrips((prev) => {
      const filtered = prev.filter(t => t._id !== trip._id)
      const updated = [trip, ...filtered].slice(0, 5)
      localStorage.setItem('tsg_recently_viewed', JSON.stringify(updated))
      return updated
    })
  }

  // Wrapper dispatches for social actions
  const handleLike = (id) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message: 'Please sign in to like trips' } }))
      return
    }
    dispatch(discoverLikeTrip(id))
    const clickedTrip = feed.find(t => t._id === id) || (searchResults && searchResults.find(t => t._id === id))
    if (clickedTrip) handleCardInteraction(clickedTrip)
  }

  const handleSave = (id) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message: 'Please sign in to bookmark trips' } }))
      return
    }
    dispatch(discoverSaveTrip(id))
    const clickedTrip = feed.find(t => t._id === id) || (searchResults && searchResults.find(t => t._id === id))
    if (clickedTrip) handleCardInteraction(clickedTrip)
  }

  const handleClone = (id) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', message: 'Please sign in to clone trips' } }))
      return
    }
    dispatch(cloneTrip(id))
      .unwrap()
      .then(() => {
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Trip itinerary cloned successfully! ✨' } }))
      })
      .catch((err) => {
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: err || 'Failed to clone trip' } }))
      })
    const clickedTrip = feed.find(t => t._id === id) || (searchResults && searchResults.find(t => t._id === id))
    if (clickedTrip) handleCardInteraction(clickedTrip)
  }

  // Handle trending/collection selection
  const handleSelectDestination = (destName) => {
    dispatch(setSearchQuery(destName))
  }

  const handleSelectCollection = (tag) => {
    dispatch(setFilters({ tags: [tag] }))
    // If search text is present, clear it to let tags query override
    if (query) dispatch(setSearchQuery(''))
  }

  const handleSelectSort = (sortByValue) => {
    dispatch(setFilters({ sortBy: sortByValue }))
  }

  const displayFeed = searchResults || feed

  // Algorithmic featured trip: most liked trip from loaded feed list
  const featuredTrip = feed.length > 0
    ? [...feed].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))[0]
    : null

  return (
    <div className="animate-fadeIn pb-12" style={{ width: '100%' }}>
      {/* Search and Cover Hero */}
      <SearchHero>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <SearchBar
            value={query}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            suggestions={trending.map(t => t.destination)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
            <FilterChips
              activeFilter={filters.sortBy}
              onSelect={handleSelectSort}
            />

            {/* Tags reset indicator */}
            {filters.tags?.length > 0 && (
              <button
                onClick={() => dispatch(setFilters({ tags: [] }))}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-indigo-400)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Clear Tag Filters
              </button>
            )}
          </div>
        </div>
      </SearchHero>

      {/* Error banner block */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: 16,
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            color: 'var(--color-border-error)',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
          <button
            onClick={() => dispatch(fetchFeed({}))}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--color-indigo-400)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Discover Panels */}
      {!query && filters.tags?.length === 0 && (
        <>
          {/* Trending destinations list slider */}
          <TrendingDestinations
            destinations={trending}
            onSelect={handleSelectDestination}
          />

          {/* Curated featured premium display */}
          <FeaturedDestination
            trip={featuredTrip}
            onLike={handleLike}
            onSave={handleSave}
            onClone={handleClone}
            isAuthenticated={isAuthenticated}
          />

          {/* Thematic Travel Collections */}
          <TravelCollections
            onSelectCollection={handleSelectCollection}
          />
        </>
      )}

      {/* Dynamic Recommendation list */}
      {!query && feed.length > 0 && (
        <RecommendationCarousel
          trips={feed}
          onLike={handleLike}
          onSave={handleSave}
          onClone={handleClone}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Main Feed grid header */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h3 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          {query ? `Search results for "${query}"` : filters.tags?.length > 0 ? `Trips matching #${filters.tags[0]}` : 'Explore Community Feed'}
        </h3>
        {!query && feed.length > 0 && (
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            Showing {displayFeed.length} trips
          </span>
        )}
      </div>

      {/* Feed grid */}
      {loading && displayFeed.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <DestinationGrid
            trips={displayFeed}
            onLike={handleLike}
            onSave={handleSave}
            onClone={handleClone}
            isAuthenticated={isAuthenticated}
          />

          {/* Empty Results Placeholder */}
          {displayFeed.length === 0 && !loading && (
            <EmptyState
              title="No Trips Found"
              description={`We couldn't find any community itineraries matching "${query || filters.tags?.[0]}". Try checking spelling or search tags.`}
              action={{
                label: 'Browse All Trips',
                onClick: () => {
                  dispatch(setSearchQuery(''))
                  dispatch(setFilters({ tags: [], sortBy: 'latest' }))
                }
              }}
            />
          )}

          {/* Sentinel intersection observer boundary */}
          <div
            ref={sentinelRef}
            style={{
              height: 60,
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loading && displayFeed.length > 0 && (
              <div
                className="animate-spin"
                style={{
                  width: 28,
                  height: 28,
                  border: '2.5px solid rgba(98, 119, 204, 0.15)',
                  borderTopColor: 'var(--color-indigo-500)',
                  borderRadius: '50%',
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Recently Viewed Strip */}
      {recentTrips.length > 0 && (
        <RecentlyViewed
          trips={recentTrips}
          onLike={handleLike}
          onSave={handleSave}
          onClone={handleClone}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  )
}
