import React from 'react'
import { Heart, Copy, UserPlus, FileEdit, Check, Share2, Compass } from 'lucide-react'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'

export default function SocialSidebar({
  trip,
  currentUser,
  onLike,
  onClone,
  onShare,
  copied,
  canEdit,
  isOwner,
  editMode,
  setEditMode,
  setInviteModal,
  isCustomized,
  handleInitializeItinerary,
}) {
  const isLiked = trip.isLiked
  const likesCount = trip.likesCount || 0
  const interests = trip.planData?.meta?.interests || []

  return (
    <div
      style={{
        position: 'sticky',
        top: '120px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.5rem',
        background: 'var(--color-surface-glass)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <p
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}
      >
        Actions
      </p>

      {/* Social Actions Group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Like Button */}
        <button
          onClick={onLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            background: isLiked ? 'var(--color-rose-dim)' : 'transparent',
            color: isLiked ? 'var(--color-rose-400)' : 'var(--color-text-primary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.15s ease-out',
          }}
          className="hover:bg-[var(--color-surface-hover)]"
        >
          <Heart size={16} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
          <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
        </button>

        {/* Clone Button */}
        <button
          onClick={onClone}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            background: 'var(--color-indigo-600)',
            color: '#ffffff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.15s ease-out',
          }}
          className="hover:bg-[var(--color-indigo-500)]"
        >
          <Compass size={16} />
          <span>Clone Trip</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.15s ease-out',
          }}
          className="hover:bg-[var(--color-surface-hover)]"
        >
          {copied ? <Check size={16} style={{ color: 'var(--color-emerald-400)' }} /> : <Share2 size={16} />}
          <span>{copied ? 'Link Copied!' : 'Share Itinerary'}</span>
        </button>
      </div>

      {/* Editor Controls (Visible if collaborator/owner) */}
      {canEdit && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            Planning Tools
          </p>

          {isCustomized ? (
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-lg)',
                border: editMode ? '1px solid var(--color-indigo-400)' : '1px solid var(--color-border)',
                background: editMode ? 'var(--color-indigo-dim)' : 'transparent',
                color: editMode ? 'var(--color-indigo-400)' : 'var(--color-text-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease-out',
              }}
              className="hover:bg-[var(--color-surface-hover)]"
            >
              <FileEdit size={16} />
              <span>{editMode ? 'Finish Editing' : 'Edit Itinerary'}</span>
            </button>
          ) : (
            <button
              onClick={handleInitializeItinerary}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'var(--color-emerald-600)',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease-out',
              }}
              className="hover:bg-[var(--color-emerald-500)]"
            >
              <span>Unlock Customization</span>
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => setInviteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease-out',
              }}
              className="hover:bg-[var(--color-surface-hover)]"
            >
              <UserPlus size={16} />
              <span>Invite Friend</span>
            </button>
          )}
        </div>
      )}

      {/* Tags section */}
      {interests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            Interests
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {interests.map((t, idx) => (
              <Badge key={idx} label={t} variant="info" className="text-[0.65rem] px-2 py-0.5" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
