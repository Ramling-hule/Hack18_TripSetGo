// src/components/domain/auth/AuthHeader.jsx
// Aurora Design System — Top branding header for all auth forms
// Displays the brand logo pointing back to home, a page title, and details.
// Replaces raw emojis with clean Lucide icons in colored backgrounds.
import { Link } from 'react-router-dom'

export default function AuthHeader({ title, subtitle, icon }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
      {/* Brand logo */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 no-underline"
        style={{ marginBottom: 'var(--spacing-4)' }}
      >
        <img src="/favicon.svg" style={{ width: 28, height: 28, objectFit: 'contain' }} alt="TripSetGo Logo" />
        <span
          style={{
            fontFamily: 'var(--font-family-display)',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
          }}
        >
          Trip
          <span style={{ color: 'var(--color-indigo-400)' }}>SetGo</span>
        </span>
      </Link>

      {/* Decorative Icon */}
      {icon && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--color-indigo-dim)',
            border: '1px solid rgba(98, 119, 204, 0.2)',
            color: 'var(--color-indigo-400)',
            marginBottom: 'var(--spacing-4)',
          }}
        >
          {icon}
        </div>
      )}

      {/* Page Title */}
      <h1
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--font-size-h2)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0,
          marginBottom: 'var(--spacing-1)',
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-body-sm)',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
