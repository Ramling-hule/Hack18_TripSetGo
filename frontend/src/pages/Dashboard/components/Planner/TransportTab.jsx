// TransportTab.jsx
// Aurora Design System — Choice selector for transport options (flights, trains).
// Full A11y, keyboard-focusable cards, custom HSL styling and smooth scale hover transitions.
import { Plane, Train, Bus, Navigation } from 'lucide-react'
import Card from '@/components/common/Card'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

function TransportIcon({ mode }) {
  const m = mode.toLowerCase()
  if (m.includes('flight') || m.includes('air')) return <Plane size={18} />
  if (m.includes('train') || m.includes('rail')) return <Train size={18} />
  if (m.includes('bus') || m.includes('coach')) return <Bus size={18} />
  return <Navigation size={18} />
}

export default function TransportTab({ options = [], selectedOption, onSelect }) {
  const handleKeyDown = (e, opt) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(opt)
    }
  }

  return (
    <div
      id="tabpanel-transport"
      role="tabpanel"
      aria-label="Transport option choices"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1rem',
      }}
    >
      {options.map((t, idx) => {
        const isSelected = selectedOption?.mode === t.mode
        return (
          <div
            key={idx}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelect(t)}
            onKeyDown={(e) => handleKeyDown(e, t)}
            style={{
              cursor: 'pointer',
              outline: 'none',
              borderRadius: '16px',
              transition: 'transform var(--transition-base)',
            }}
            className="hover:scale-[1.015] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card
              variant="glass"
              padding="lg"
              style={{
                height: '100%',
                borderColor: isSelected
                  ? 'var(--color-indigo-500)'
                  : 'var(--color-border-default)',
                boxShadow: isSelected ? 'var(--shadow-primary)' : 'none',
                background: isSelected
                  ? 'rgba(61, 82, 160, 0.12)'
                  : 'var(--color-surface-glass)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}
              >
                {/* Icon bubble */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: isSelected
                      ? 'var(--color-indigo-dim)'
                      : 'var(--color-surface-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  aria-hidden="true"
                >
                  <TransportIcon mode={t.mode} />
                </div>

                {/* Badge tags */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.35rem',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                  }}
                >
                  {t.recommended && (
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: 99,
                        background: 'rgba(52, 211, 153, 0.12)',
                        border: '1px solid rgba(52, 211, 153, 0.25)',
                        color: 'var(--color-emerald-400)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      ✓ RECOMMENDED
                    </span>
                  )}
                  {isSelected && (
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: 99,
                        background: 'var(--color-indigo-dim)',
                        border: '1px solid rgba(98, 119, 204, 0.3)',
                        color: 'var(--color-indigo-300)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                      }}
                    >
                      SELECTED
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  marginBottom: '0.25rem',
                  fontFamily: 'var(--font-family-display)',
                  color: '#ffffff',
                }}
              >
                {t.mode}
              </p>

              {/* Pricing */}
              <p
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: isSelected ? 'var(--color-indigo-400)' : '#ffffff',
                  marginBottom: '0.25rem',
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                {inr(t.total_cost)}
              </p>

              {/* Details text */}
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.78rem',
                  margin: 0,
                }}
              >
                {inr(t.cost_per_person)} per person
                {t.comfort && (
                  <span style={{ marginLeft: '0.4rem', opacity: 0.65 }}>
                    · {t.comfort}
                  </span>
                )}
              </p>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
