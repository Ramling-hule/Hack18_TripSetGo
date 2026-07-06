// src/components/domain/dashboard/GreetingStrip.jsx
// Aurora Design System — Greeting strip banner
// Displays time-of-day greeting, personalized welcome message,
// blurred background image (atmospheric color wash), and primary planning CTA.
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/common/Button'
import { getDestinationImage } from '@/utils/imageUtils'

export default function GreetingStrip({ userName }) {
  const bgImg = getDestinationImage('tokyo') // Atmospheric backdrop seed

  // Compute greeting dynamically on render
  const hour = new Date().getHours()
  const greeting = hour < 12
    ? 'Good morning'
    : hour < 18
      ? 'Good afternoon'
      : 'Good evening'

  const firstName = userName?.split(' ')[0] || ''

  return (
    <div
      style={{
        position: 'relative',
        height: 220,
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--color-surface-default)',
        border: '1px solid var(--color-border-subtle)',
        marginBottom: 'var(--spacing-8)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Blurred background image layer (atmospheric color wash) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <img
          src={bgImg}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.18,
            filter: 'blur(24px)',
          }}
        />
        {/* Scrim Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, var(--color-surface-default) 0%, transparent 100%)',
            zIndex: 1,
          }}
        />
      </div>

      {/* Content wrapper */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 var(--spacing-8)',
        }}
        className="flex-col sm:flex-row gap-4 text-center sm:text-left"
      >
        {/* Greetings Typography */}
        <div className="flex flex-col gap-1.5">
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 800,
              lineHeight: 'var(--line-height-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {greeting}, where are we going next?
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Welcome back, {firstName || 'traveler'}.
          </p>
        </div>

        {/* Right CTA */}
        <div style={{ flexShrink: 0 }}>
          <Link to="/dashboard/planner" className="no-underline">
            <Button
              variant="primary"
              size="lg"
              iconRight={<ArrowRight size={18} />}
            >
              Plan New Trip
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
