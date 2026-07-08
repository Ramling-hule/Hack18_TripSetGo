import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Bookmark, Copy, CalendarDays, Users, Wallet } from 'lucide-react'
import { getDestinationImage } from '@/utils/imageUtils'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'

export default function FeaturedDestination({
  trip,
  onLike,
  onSave,
  onClone,
  isAuthenticated = true,
}) {
  if (!trip) return null

  const coverImg = getDestinationImage(trip.destination || '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid var(--color-border-default)',
        background: 'var(--color-surface-default)',
        marginBottom: '2.5rem',
      }}
      className="group"
    >
      {/* Background Image treating it as design material */}
      <Link
        to={`/trips/${trip._id}`}
        style={{
          display: 'block',
          position: 'relative',
          width: '100%',
          aspectRatio: '21/9',
          minHeight: 320,
          overflow: 'hidden',
        }}
        className="w-full"
      >
        <img
          src={coverImg}
          alt={trip.destination}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          className="transition-transform duration-[3000ms] ease-out group-hover:scale-105"
        />
        {/* Scrim Overlay formula */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(14, 17, 23, 0.95) 0%, rgba(14, 17, 23, 0.4) 50%, rgba(14, 17, 23, 0.1) 100%)',
          }}
        />
      </Link>

        {/* Featured Tag absolute overlay */}
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <Badge label="★ TODAY'S FEATURED ESCAPE" variant="primary" />
        </div>

        {/* Social metrics overlay top right */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10,
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={() => onLike(trip._id)}
            style={{
              padding: '0.625rem',
              borderRadius: 12,
              background: 'rgba(14, 17, 23, 0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              color: trip.isLiked ? 'var(--color-rose-500)' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            className="hover:scale-110 active:scale-95"
            aria-label={`Like trip, current count ${trip.likesCount || 0}`}
          >
            <Heart size={16} fill={trip.isLiked ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => onSave(trip._id)}
            style={{
              padding: '0.625rem',
              borderRadius: 12,
              background: 'rgba(14, 17, 23, 0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              color: trip.isSaved ? 'var(--color-amber-500)' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            className="hover:scale-110 active:scale-95"
            aria-label={`Bookmark trip, current count ${trip.savesCount || 0}`}
          >
            <Bookmark size={16} fill={trip.isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Bottom content overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '2.5rem',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              <Link to={`/trips/${trip._id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">
                {trip.destination}
              </Link>
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: '0.9375rem',
                color: 'var(--color-text-secondary)',
                margin: 0,
                marginTop: '0.25rem',
              }}
            >
              A curated experience from {trip.source} · Created by {trip.user?.name || 'Anonymous'}
            </p>
          </div>

          {/* Quick stats chips */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#ffffff', fontSize: '0.875rem', fontWeight: 600 }}>
              <CalendarDays size={14} className="text-indigo-400" />
              <span>{trip.planData?.meta?.total_days || 5} Days</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#ffffff', fontSize: '0.875rem', fontWeight: 600 }}>
              <Users size={14} className="text-emerald-400" />
              <span>{trip.numTravelers} {trip.groupType}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#ffffff', fontSize: '0.875rem', fontWeight: 600 }}>
              <Wallet size={14} className="text-sky-400" />
              <span>₹{Number(trip.budget).toLocaleString('en-IN')}</span>
            </div>

            {/* Tags */}
            {trip.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.375rem', marginLeft: '0.5rem' }}>
                {trip.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: '#a5b4fc',
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1.25rem',
            }}
          >
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
              Liked by <strong>{trip.likesCount || 0}</strong> travelers · Bookmarked by <strong>{trip.savesCount || 0}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link
                to={`/trips/${trip._id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.625rem 1.25rem',
                  borderRadius: 12,
                  background: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
                className="hover:bg-[var(--color-surface-raised)]"
              >
                View Experience
              </Link>

              {isAuthenticated ? (
                <Button
                  variant="primary"
                  onClick={() => onClone(trip._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    borderRadius: 12,
                  }}
                >
                  <Copy size={14} /> Clone Itinerary
                </Button>
              ) : (
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  Sign in to clone this trip
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
