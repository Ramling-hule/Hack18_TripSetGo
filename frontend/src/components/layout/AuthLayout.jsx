// src/components/layout/AuthLayout.jsx
// Aurora Design System — Centered layout container for authentication pages.
// Supports full-screen travel photography background with dark scrim overlays.
import Card from '@/components/common/Card'

export default function AuthLayout({ children, backgroundImageUrl }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-surface-base)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="md:p-[var(--spacing-8)]"
    >
      {/* Background Image Layer (Full Screen) */}
      {backgroundImageUrl ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <img
            src={backgroundImageUrl}
            alt="Scenic Travel Background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            loading="eager"
          />
          {/* Deep dark gradient scrim for premium legibility and AAA contrast */}
          <div
            className="scrim-bottom"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(8, 17, 34, 0.6) 0%, rgba(8, 17, 34, 0.85) 100%)',
              zIndex: 1,
            }}
          />
        </div>
      ) : (
        /* Atmospheric Glow Dots Fallback */
        <>
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '10%',
              width: 'min(45vw, 450px)',
              height: 'min(45vw, 450px)',
              background: 'radial-gradient(circle, var(--color-indigo-dim) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(70px)',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '15%',
              right: '10%',
              width: 'min(35vw, 350px)',
              height: 'min(35vw, 350px)',
              background: 'radial-gradient(circle, rgba(107, 163, 214, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(60px)',
              zIndex: 1,
            }}
          />
        </>
      )}

      {/* Content wrapper centered on top of background */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 460,
          margin: '0 auto',
        }}
      >
        <Card
          variant="glass"
          padding="xl"
          className="w-full border-[rgba(255,255,255,0.08)] bg-[rgba(14,17,23,0.7)] backdrop-blur-[24px]"
        >
          {children}
        </Card>
      </div>
    </div>
  )
}
