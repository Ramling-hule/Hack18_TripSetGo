// src/components/landing/TestimonialSection.jsx
// Testimonial section containing a quote from a verified user.
// Uses glass-morphic Card styling and the shared Avatar component.
import Card from '@/components/common/Card'
import Avatar from '@/components/common/Avatar'

export default function TestimonialSection() {
  return (
    <section
      style={{
        paddingTop: 'var(--spacing-16)',
        paddingBottom: 'var(--spacing-16)',
        backgroundColor: 'var(--color-surface-base)',
      }}
    >
      <div className="container-landing flex justify-center">
        <Card
          variant="glass"
          padding="xl"
          className="max-w-[var(--layout-narrow-max)] flex flex-col gap-6 text-center items-center relative overflow-hidden"
        >
          {/* Decorative faint indigo radial glow */}
          <div
            className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, var(--color-indigo-dim) 0%, transparent 70%)',
              transform: 'translate(-30%, -30%)',
            }}
          />

          <blockquote style={{ margin: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height-body)',
                color: 'var(--color-text-primary)',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              &ldquo;TripSetGo completely changed how my group plans trips. The live budget tracking and auto expense splitting worked flawlessly during our 2-week trip across Japan. The AI itinerary felt incredibly personalized, not generic.&rdquo;
            </p>
          </blockquote>

          <div className="flex items-center gap-3">
            <Avatar
              name="Sarah Jenkins"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80"
              size="sm"
            />
            <div className="flex flex-col text-left">
              <span
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Sarah Jenkins
              </span>
              <span
                style={{
                  fontSize: 'var(--font-size-caption)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Verified Traveler &middot; 8 Trips Planned
              </span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
