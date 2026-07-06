// src/components/domain/TripCard.jsx
// Aurora Design System — Trip card with photography, scrim, metadata overlay
// Per Screen Blueprint: PhotographyCard scrim formula, 4:3 aspect ratio
import { Heart, Calendar, MapPin, Users } from 'lucide-react'
import Badge from '@/components/common/Badge'
import { getDestinationImage } from '@/utils/imageUtils'

export default function TripCard({
  trip,
  variant = 'full', // 'full' or 'compact'
  onLike,
  onClick,
  className = '',
}) {
  if (!trip) return null

  const { title, destination, coverImage, startDate, endDate, status, memberCount, isLiked } = trip
  const activeCover = coverImage || getDestinationImage(destination || title || '')

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  const statusVariant = {
    planning: 'primary',
    ongoing:  'success',
    completed:'secondary',
    cancelled:'danger',
  }

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden
        rounded-[var(--radius-lg)]
        border border-[var(--color-border-default)]
        bg-[var(--color-surface-default)]
        transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
        hover:border-[var(--color-border-interactive)]
        hover:shadow-[var(--shadow-md)]
        hover:-translate-y-0.5
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Photography */}
      <div className="relative" style={{ aspectRatio: variant === 'compact' ? '16/9' : '4/3' }}>
        <img
          src={activeCover}
          alt={title || destination}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Scrim overlay */}
        <div className="scrim-bottom absolute inset-0" />

        {/* Like button */}
        {onLike && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onLike(trip) }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-[rgba(0,0,0,0.4)] backdrop-blur-[4px] border-none cursor-pointer transition-all duration-[var(--duration-fast)] hover:bg-[rgba(0,0,0,0.6)]"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={16}
              fill={isLiked ? 'var(--color-rose-500)' : 'none'}
              stroke={isLiked ? 'var(--color-rose-500)' : 'white'}
            />
          </button>
        )}

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-h3)',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              marginBottom: 4,
            }}
          >
            {title || destination}
          </h3>
          {destination && title && (
            <p style={{
              fontSize: 'var(--font-size-caption)',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <MapPin size={12} /> {destination}
            </p>
          )}
        </div>
      </div>

      {/* Metadata strip */}
      {variant === 'full' && (
        <div className="p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[var(--font-size-caption)] text-[var(--color-text-muted)]">
            {startDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(startDate)}{endDate ? ` – ${formatDate(endDate)}` : ''}
              </span>
            )}
            {memberCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users size={12} /> {memberCount}
              </span>
            )}
          </div>
          {status && (
            <Badge label={status} variant={statusVariant[status] || 'secondary'} />
          )}
        </div>
      )}
    </div>
  )
}
