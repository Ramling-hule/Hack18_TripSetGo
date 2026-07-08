// src/components/domain/auth/AuthIllustration.jsx
// Aurora Design System — Desktop-only split-screen travel photography illustration
// Displays high-resolution Unsplash photo with a dark bottom scrim overlay.
import { Compass } from 'lucide-react'

export default function AuthIllustration({
  imageUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  title = 'Plan with confidence.',
  subtitle = 'Quietly powered by intelligence.',
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 460,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--color-surface-raised)',
      }}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt="Travel Destination Scenic"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        loading="lazy"
      />

      {/* Scrim Overlay */}
      <div
        className="scrim-bottom"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--spacing-8)',
          zIndex: 10,
        }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-[var(--color-indigo-400)]">
          <Compass size={20} />
          <span className="text-section-label" style={{ color: 'inherit' }}>
            TripSetGo Companion
          </span>
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h2)',
            fontWeight: 800,
            color: 'white',
            margin: 0,
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-body-sm)',
            color: 'rgba(255, 255, 255, 0.72)',
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}
