import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Bookmark, MessageCircle, Copy, Users, CalendarDays, Wallet } from 'lucide-react'
import { getDestinationImage } from '@/utils/imageUtils'
import Card from '@/components/common/Card'

export default function DestinationCard({
  trip,
  onLike,
  onSave,
  onClone,
  isAuthenticated = true,
  aspectRatio = '3/2',
}) {
  const [hovered, setHovered] = useState(false)
  const coverImg = getDestinationImage(trip.destination || '')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClone(trip._id)
    }
  }

  return (
    <div
      role="listitem"
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-surface-default)',
        height: '100%',
        width: '100%',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group focus-within:ring-2 focus-within:ring-indigo-500"
    >
      {/* Aspect ratio bounding box for full photography-first bleed */}
      <div style={{ position: 'relative', width: '100%', aspectRatio, overflow: 'hidden' }}>
        {/* Link wraps only the non-button visual content */}
        <Link to={`/trips/${trip._id}`} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none', color: 'inherit' }}>
          <img
            src={coverImg}
            alt={trip.destination}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            className="transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Scrim Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(14, 17, 23, 0.95) 0%, rgba(14, 17, 23, 0.4) 50%, rgba(14, 17, 23, 0.1) 100%)',
              zIndex: 1,
            }}
          />

          {/* Text Overlay bottom left */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '1.25rem',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {/* Destination Name + Origin */}
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {trip.destination}
              </p>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  marginTop: '0.125rem',
                }}
              >
                from {trip.source} · {trip.user?.name || 'Anonymous'}
              </p>
            </div>

            {/* Trip Details Grid */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 600,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CalendarDays size={12} className="text-indigo-400" />
                {trip.planData?.meta?.total_days || 5}d
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Users size={12} className="text-emerald-400" />
                {trip.numTravelers} {trip.groupType}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Wallet size={12} className="text-sky-400" />
                ₹{Number(trip.budget).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Social Comment Count / Tags */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.125rem' }}>
              {trip.tags?.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {trip.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.35rem',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.85)',
                        borderRadius: 4,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : <div />}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-secondary)', fontSize: '0.7rem' }}>
                <MessageCircle size={12} />
                <span>{trip.commentsCount || 0}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Social stats top right absolute */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            display: 'flex',
            gap: '0.35rem',
          }}
        >
          {/* Like */}
          <button
            onClick={(e) => { e.stopPropagation(); onLike(trip._id) }}
            style={{
              padding: '0.45rem',
              borderRadius: 10,
              background: 'rgba(14, 17, 23, 0.65)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(6px)',
              color: trip.isLiked ? 'var(--color-rose-500)' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s',
            }}
            className="hover:scale-105"
            aria-label={`Like, count ${trip.likesCount || 0}`}
          >
            <Heart size={13} fill={trip.isLiked ? 'currentColor' : 'none'} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{trip.likesCount || 0}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={(e) => { e.stopPropagation(); onSave(trip._id) }}
            style={{
              padding: '0.45rem',
              borderRadius: 10,
              background: 'rgba(14, 17, 23, 0.65)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(6px)',
              color: trip.isSaved ? 'var(--color-amber-500)' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s',
            }}
            className="hover:scale-105"
            aria-label={`Save, count ${trip.savesCount || 0}`}
          >
            <Bookmark size={13} fill={trip.isSaved ? 'currentColor' : 'none'} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{trip.savesCount || 0}</span>
          </button>
        </div>



        {/* Hover slide-up clone action strip */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onClick={(e) => { e.stopPropagation(); onClone(trip._id) }}
              onKeyDown={handleKeyDown}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 48,
                backgroundColor: 'var(--color-indigo-600)',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-family-body)',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                zIndex: 8,
              }}
              className="hover:bg-indigo-700"
            >
              <Copy size={14} />
              <span>Clone Itinerary</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
