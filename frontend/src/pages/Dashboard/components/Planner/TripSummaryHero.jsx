// TripSummaryHero.jsx
// Aurora Design System — Premium editorial header for the results view.
// Displays destination, dates, theme badge, and group companion type.
import { Calendar, Users, Sparkles, MapPin, RotateCcw } from 'lucide-react'
import Badge from '@/components/common/Badge'

export default function TripSummaryHero({
  destination,
  startDate,
  endDate,
  theme,
  numTravelers,
  groupType,
  onNewPlan,
}) {
  const formatDate = (dStr) => {
    if (!dStr) return ''
    return new Date(dStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const groupLabel = {
    solo: 'Solo Trip',
    couple: 'Couple Trip',
    family: 'Family Vacation',
    friends: 'Friends Trip',
  }[groupType] || 'Group Trip'

  return (
    <div
      style={{
        marginBottom: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        paddingBottom: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1.5rem',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {/* 1. Eyebrow */}
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-indigo-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0,
            }}
          >
            Generated Itinerary
          </p>

          {/* 2. Display Title */}
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {destination}
          </h1>

          {/* 3. Travel Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              marginTop: '0.125rem',
            }}
          >
            <span>{formatDate(startDate)}{endDate && ` — ${formatDate(endDate)}`}</span>
            <span>•</span>
            <span>{numTravelers} {numTravelers === 1 ? 'Traveler' : 'Travelers'}</span>
            <span>•</span>
            <span>{groupLabel}</span>
          </div>

          {/* 4. Short Supporting Sentence */}
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              margin: '0.25rem 0 0 0',
              lineHeight: 1.5,
            }}
          >
            "AI-crafted itinerary optimized for your preferences."
          </p>

          {/* 5. Theme Chips */}
          <div
            role="group"
            aria-label="Trip classifications"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              alignItems: 'center',
              marginTop: '0.625rem',
            }}
          >
            {theme && (
              <Badge
                label={theme}
                variant="primary"
                icon={<Sparkles size={10} />}
              />
            )}
            <Badge
              label={`${numTravelers} ${numTravelers === 1 ? 'Traveler' : 'Travelers'}`}
              variant="secondary"
              icon={<Users size={10} />}
            />
            <Badge
              label={groupLabel}
              variant="secondary"
              icon={<MapPin size={10} />}
            />
          </div>
        </div>

        {/* New Plan Reset Trigger */}
        {onNewPlan && (
          <button
            onClick={onNewPlan}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 10,
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              marginTop: '0.25rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)'
              e.currentTarget.style.color = 'var(--color-indigo-400)'
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
            }}
          >
            <RotateCcw size={13} />
            <span>New Plan</span>
          </button>
        )}
      </div>
    </div>
  )
}
