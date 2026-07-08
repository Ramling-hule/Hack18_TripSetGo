// src/components/common/Loader.jsx
// Aurora Design System — Loading states
// Loader: branded spinner with indigo.700
// Skeleton: generic shape primitive (line, circle, rect)
// SkeletonCard: pre-composed card skeleton

export default function Loader({ size = 'md', fullScreen = false, text }) {
  const sizes = { sm: 24, md: 48, lg: 72 }
  const px = sizes[size] || 48

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div
        className="animate-spin"
        style={{
          width: px,
          height: px,
          border: `${size === 'sm' ? 2 : 3}px solid var(--color-indigo-dim)`,
          borderTopColor: 'var(--color-indigo-700)',
          borderRadius: '50%',
        }}
      />
      {text && (
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-body-sm)',
          fontFamily: 'var(--font-family-body)',
          margin: 0,
        }}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(14, 17, 23, 0.88)',
        backdropFilter: 'blur(8px)',
      }}>
        {spinner}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      {spinner}
    </div>
  )
}

/**
 * Generic skeleton primitive — line, circle, or rectangle.
 * Uses the shimmer animation from index.css.
 */
export function Skeleton({ variant = 'line', width, height, className = '' }) {
  const defaults = {
    line:   { w: '100%', h: 16, r: 'var(--radius-xs)' },
    circle: { w: 44,    h: 44, r: '50%' },
    rect:   { w: '100%', h: 120, r: 'var(--radius-md)' },
  }
  const d = defaults[variant] || defaults.line

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || d.w,
        height: height || d.h,
        borderRadius: d.r,
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Pre-composed trip card skeleton.
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-5 ${className}`}
    >
      <Skeleton variant="rect" height={180} className="mb-4" />
      <Skeleton variant="line" width="70%" height={20} className="mb-3" />
      <Skeleton variant="line" width="50%" height={16} className="mb-2" />
      <Skeleton variant="line" width="40%" height={16} />
    </div>
  )
}
