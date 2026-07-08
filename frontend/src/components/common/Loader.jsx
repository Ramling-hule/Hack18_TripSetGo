// src/components/common/Loader.jsx
export default function Loader({ size = 'md', fullScreen = false, text }) {
  const sizes = { sm: 24, md: 48, lg: 72 }
  const px = sizes[size] || 48

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      <div className="relative flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full animate-pulse-slow" 
          style={{ background: 'rgba(14, 165, 233, 0.2)', filter: 'blur(10px)', transform: 'scale(1.2)' }}
        />
        <div 
          style={{
            width: px, height: px,
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            position: 'relative',
            zIndex: 1,
            animation: 'pulseSlow 2s ease-in-out infinite'
          }}
        >
          <img 
            src="/favicon.svg" 
            style={{ width: px * 0.5, height: px * 0.5, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
            alt="Loading..." 
          />
        </div>
      </div>
      {text && <p style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em', animation: 'pulseSlow 2s ease-in-out infinite' }}>{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(8, 15, 30, 0.9)', backdropFilter: 'blur(12px)',
      }}>
        {spinner}
      </div>
    )
  }

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem' }}>{spinner}</div>
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 transition-all duration-250 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" style={{ padding: '1.5rem' }}>
      <div className="bg-gradient-to-r from-white/4 via-white/9 to-white/4 bg-[length:200%_100%] animate-shimmer rounded-sm" style={{ height: 180, marginBottom: '1rem', borderRadius: 'var(--radius-md)' }} />
      <div className="bg-gradient-to-r from-white/4 via-white/9 to-white/4 bg-[length:200%_100%] animate-shimmer rounded-sm" style={{ height: 20, width: '70%', marginBottom: '0.75rem' }} />
      <div className="bg-gradient-to-r from-white/4 via-white/9 to-white/4 bg-[length:200%_100%] animate-shimmer rounded-sm" style={{ height: 16, width: '50%', marginBottom: '0.5rem' }} />
      <div className="bg-gradient-to-r from-white/4 via-white/9 to-white/4 bg-[length:200%_100%] animate-shimmer rounded-sm" style={{ height: 16, width: '40%' }} />
    </div>
  )
}
