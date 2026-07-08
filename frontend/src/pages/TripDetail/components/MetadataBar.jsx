import React from 'react'
import { Calendar, Users, DollarSign, Heart, MapPin, Globe, Lock } from 'lucide-react'

function MetaItem({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

export default function MetadataBar({ trip }) {
  const days = trip.planData?.meta?.total_days || 0
  const dateStr = trip.startDate
    ? `${new Date(trip.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Flexible Dates'

  return (
    <div
      style={{
        width: '100%',
        background: 'var(--color-surface-default)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.5rem',
        }}
        className="px-6 md:px-10 py-4"
      >
        {/* Left indicators */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          <MetaItem
            icon={<MapPin size={16} />}
            text={`${trip.source} → ${trip.destination}`}
          />
          <MetaItem
            icon={<Calendar size={16} />}
            text={`${days} days (${dateStr})`}
          />
          <MetaItem
            icon={<Users size={16} />}
            text={`${trip.numTravelers} traveler${trip.numTravelers > 1 ? 's' : ''} (${trip.groupType})`}
          />
          <MetaItem
            icon={<DollarSign size={16} />}
            text={`₹${Number(trip.budget).toLocaleString()} budget`}
          />
          {trip.likesCount > 0 && (
            <MetaItem
              icon={<Heart size={16} className="fill-rose-500/20 text-rose-500" />}
              text={`${trip.likesCount} likes`}
            />
          )}
        </div>

        {/* Right privacy tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface-hover)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border-subtle)' }}>
          {trip.isPublic ? (
            <>
              <Globe size={13} style={{ color: 'var(--color-emerald-400)' }} />
              <span>Shared Publicly</span>
            </>
          ) : (
            <>
              <Lock size={13} style={{ color: 'var(--color-amber-400)' }} />
              <span>Private Plan</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
