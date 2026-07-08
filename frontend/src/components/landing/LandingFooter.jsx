// src/components/landing/LandingFooter.jsx
// Landing page footer using Bricolage display font and Aurora design tokens.
// No gradient text, no Plus Jakarta Sans font, no hardcoded colors.
import { Link } from 'react-router-dom'

export default function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface-base)',
        borderTop: '1px solid var(--color-border-subtle)',
        paddingTop: 'var(--spacing-16)',
        paddingBottom: 'var(--spacing-12)',
      }}
    >
      <div className="container-landing grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" className="w-8 h-8 object-contain" alt="TripSetGo Logo" />
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
          </div>
          <p
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-body-sm)',
              lineHeight: 'var(--line-height-body)',
              color: 'var(--color-text-muted)',
              margin: 0,
              maxWidth: 320,
            }}
          >
            An intelligent companion for modern travelers. Plan itineraries, track budgets, and split expenses effortlessly.
          </p>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <span className="text-section-label">Product</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="flex flex-col gap-2">
              <li>
                <Link to="/auth/signup" className="text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-150 no-underline">
                  AI Planner
                </Link>
              </li>
              <li>
                <Link to="/discover" className="text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-150 no-underline">
                  Discover Feed
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3">
            <span className="text-section-label">Legal</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="flex flex-col gap-2">
              <li>
                <span className="text-[var(--font-size-body-sm)] text-[var(--color-text-muted)]">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-[var(--font-size-body-sm)] text-[var(--color-text-muted)]">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Links */}
          <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
            <span className="text-section-label">Company</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} className="flex flex-col gap-2">
              <li>
                <span className="text-[var(--font-size-body-sm)] text-[var(--color-text-muted)]">
                  About Us
                </span>
              </li>
              <li>
                <span className="text-[var(--font-size-body-sm)] text-[var(--color-text-muted)]">
                  Support
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="container-landing" style={{ marginTop: 'var(--spacing-12)' }}>
        <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--spacing-6)' }} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)]">
            &copy; {currentYear} TripSetGo. All rights reserved.
          </span>
          <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)]">
            Quietly powered by AI.
          </span>
        </div>
      </div>
    </footer>
  )
}
