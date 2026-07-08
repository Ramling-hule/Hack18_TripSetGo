// src/components/landing/CTASection.jsx
// Final call-to-action block.
// Center-aligned typography and a primary conversion button.
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'

export default function CTASection() {
  return (
    <section
      style={{
        paddingTop: 'var(--spacing-16)',
        paddingBottom: 'var(--spacing-20)',
        backgroundColor: 'var(--color-surface-base)',
      }}
    >
      <div className="container-landing flex justify-center">
        <Card
          variant="raised"
          padding="xl"
          className="w-full max-w-[var(--layout-landing-max)] flex flex-col gap-6 text-center items-center relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div
            className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, var(--color-indigo-dim) 0%, transparent 70%)',
              transform: 'translate(40%, 40%)',
            }}
          />

          <div className="flex flex-col gap-3 max-w-[520px]">
            <span className="text-section-label">Start Your Journey</span>
            <h2
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 'var(--line-height-tight)',
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Ready to plan your next escape?
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height-body)',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              Join thousands of travelers planning itineraries, tracking budgets, and splitting expenses effortlessly.
            </p>
          </div>

          <div style={{ zIndex: 10 }}>
            <Link to="/auth/signup" className="no-underline">
              <Button
                variant="primary"
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                Start Planning Free
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}
