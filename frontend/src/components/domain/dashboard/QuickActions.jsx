// src/components/domain/dashboard/QuickActions.jsx
// Aurora Design System — Quick actions section
// 1 large PrimaryActionCard ("Plan a Trip" 33% width)
// + 3 SecondaryActionCards ("Discover", "My Trips", "Analytics")
import { Link } from 'react-router-dom'
import { Map, Compass, Briefcase, TrendingUp } from 'lucide-react'
import Card from '@/components/common/Card'

export default function QuickActions() {
  const secondaryActions = [
    { icon: <Compass size={24} />, label: 'Discover Feed', to: '/dashboard/discover' },
    { icon: <Briefcase size={24} />, label: 'My Trips', to: '/dashboard/trips' },
    { icon: <TrendingUp size={24} />, label: 'Analytics Hub', to: '/dashboard/analytics' },
  ]

  return (
    <section style={{ marginBottom: 'var(--spacing-8)' }} aria-label="Quick Actions">
      <h2 className="text-section-label" style={{ marginBottom: 'var(--spacing-4)' }}>
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Primary Action Card (Plan a Trip - 4 Cols on md/lg) */}
        <div className="md:col-span-4">
          <Link to="/dashboard/planner" className="no-underline">
            <Card
              variant="interactive"
              padding="lg"
              className="flex items-center gap-4 h-[120px]"
              style={{
                background: 'var(--color-indigo-dim)',
                border: '1px solid rgba(98, 119, 204, 0.3)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(98, 119, 204, 0.2)',
                  color: 'var(--color-indigo-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Map size={24} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 700,
                    color: 'var(--color-indigo-400)',
                    margin: 0,
                  }}
                >
                  Plan a Trip
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--color-text-secondary)',
                    margin: '2px 0 0 0',
                  }}
                >
                  Create AI itinerary in seconds
                </p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Secondary Action Cards (3 items - 8 Cols on md/lg total -> 2.6 cols each) */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {secondaryActions.map((action) => (
            <Link key={action.label} to={action.to} className="no-underline">
              <Card
                variant="interactive"
                padding="lg"
                className="flex items-center gap-4 h-[120px]"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {action.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: 'var(--font-size-h4)',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {action.label}
                  </h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
