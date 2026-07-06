import React from 'react'
import { Heart, Compass, Share2, Check } from 'lucide-react'

export default function FloatingActionBar({
  trip,
  onLike,
  onClone,
  onShare,
  copied,
}) {
  const isLiked = trip.isLiked
  const likesCount = trip.likesCount || 0

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'var(--color-surface-glass)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '0.75rem 1rem 1.25rem',
      }}
      className="md:hidden block"
    >
      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', maxWidth: '480px', margin: '0 auto' }}>
        {/* Like Button */}
        <button
          onClick={onLike}
          style={{
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.625rem 0.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            background: isLiked ? 'var(--color-rose-dim)' : 'transparent',
            color: isLiked ? 'var(--color-rose-400)' : 'var(--color-text-primary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          <Heart size={14} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
          <span>{likesCount}</span>
        </button>

        {/* Clone Button */}
        <button
          onClick={onClone}
          style={{
            flex: '2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.625rem 0.5rem',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            background: 'var(--color-indigo-600)',
            color: '#ffffff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          <Compass size={14} />
          <span>Clone Trip</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          style={{
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.625rem 0.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          {copied ? <Check size={14} style={{ color: 'var(--color-emerald-400)' }} /> : <Share2 size={14} />}
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}
