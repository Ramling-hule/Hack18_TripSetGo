// TripSummaryHero.jsx
// Aurora Design System — Premium editorial header for the results view.
// Displays destination, dates, theme badge, and group companion type.
import { Calendar, Users, Sparkles, MapPin } from 'lucide-react'
import Badge from '@/components/common/Badge'

export default function TripSummaryHero({
  destination,
  startDate,
  endDate,
  theme,
  numTravelers,
  groupType,
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
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        paddingBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          {/* Section mini label */}
          <p
            style={{
              fontSize: 'var(--font-size-caption)',
              fontWeight: 600,
              color: 'var(--color-indigo-400)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-widest)',
              marginBottom: '0.5rem',
            }}
          >
            Generated Itinerary
          </p>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 'var(--line-height-tight)',
              margin: '0 0 0.75rem 0',
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            {destination}
          </h1>

          {/* Subheading dates */}
          {(startDate || endDate) && (
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: 'var(--font-size-body-sm)',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              <Calendar size={13} aria-hidden="true" />
              <span>
                {formatDate(startDate)}
                {endDate && ` — ${formatDate(endDate)}`}
              </span>
            </p>
          )}
        </div>

        {/* Badges column */}
        <div
          role="group"
          aria-label="Trip classifications"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            marginTop: '0.5rem',
          }}
        >
          {theme && (
            <Badge
              label={theme}
              variant="primary"
              icon={<Sparkles size={11} />}
            />
          )}
          <Badge
            label={`${numTravelers} ${numTravelers === 1 ? 'Traveler' : 'Travelers'}`}
            variant="secondary"
            icon={<Users size={11} />}
          />
          <Badge
            label={groupLabel}
            variant="secondary"
            icon={<MapPin size={11} />}
          />
        </div>
      </div>
    </div>
  )
}
