import React from 'react'

function Shimmer() {
  return (
    <div
      className="animate-pulse bg-surface-hover"
      style={{
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
      }}
    />
  )
}

export default function TripSkeletons() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Hero Strip Skeleton */}
      <div style={{ height: '320px', width: '100%', background: 'var(--color-bg-secondary)', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', right: '1.5rem', maxWidth: '1200px', margin: '0 auto' }} className="px-6 md:px-10">
          <div className="animate-pulse h-10 w-64 bg-surface-hover rounded-xl mb-4" />
          <div className="animate-pulse h-5 w-48 bg-surface-hover rounded-lg" />
        </div>
      </div>

      {/* Metadata Bar Skeleton */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-default)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'center', height: '100%', padding: '0 1.5rem' }} className="px-6 md:px-10">
          <div className="animate-pulse h-5 w-32 bg-surface-hover rounded-lg" />
          <div className="animate-pulse h-5 w-40 bg-surface-hover rounded-lg" />
          <div className="animate-pulse h-5 w-24 bg-surface-hover rounded-lg" />
        </div>
      </div>

      {/* Content Columns Skeleton */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: '1fr 240px', gap: '2.5rem' }} className="px-6 md:px-10">
        <div>
          {/* Day Panels Accordion Skeletons */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1rem', background: 'var(--color-bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="animate-pulse h-6 w-24 bg-surface-hover rounded-lg" />
                <div className="animate-pulse h-6 w-6 bg-surface-hover rounded-lg" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="animate-pulse h-12 w-full bg-surface-hover rounded-xl" />
                <div className="animate-pulse h-12 w-full bg-surface-hover rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <div>
          <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', background: 'var(--color-surface-glass)', height: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="animate-pulse h-4 w-16 bg-surface-hover rounded-md mb-2" />
            <div className="animate-pulse h-10 w-full bg-surface-hover rounded-lg" />
            <div className="animate-pulse h-10 w-full bg-surface-hover rounded-lg" />
            <div className="animate-pulse h-10 w-full bg-surface-hover rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
