// FoodTab.jsx
// Aurora Design System — Choice selector for dining plans.
// Full A11y, keyboard-focusable cards, HSL styling and spring-less hover animations.
import { Utensils } from 'lucide-react'
import Card from '@/components/common/Card'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function FoodTab({ options = [], selectedOption, onSelect }) {
  const handleKeyDown = (e, opt) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(opt)
    }
  }

  return (
    <div
      id="tabpanel-food"
      role="tabpanel"
      aria-label="Food plan choices"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1rem',
      }}
    >
      {options.map((f, idx) => {
        const isSelected = selectedOption?.name === f.name
        return (
          <div
            key={idx}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelect(f)}
            onKeyDown={(e) => handleKeyDown(e, f)}
            style={{
              cursor: 'pointer',
              outline: 'none',
              borderRadius: '16px',
              transition: 'transform var(--transition-base)',
            }}
            className="hover:scale-[1.015] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card
              variant="glass"
              padding="lg"
              style={{
                height: '100%',
                borderColor: isSelected
                  ? 'var(--color-amber-500)'
                  : 'var(--color-border-default)',
                boxShadow: isSelected ? '0 0 16px rgba(245, 158, 11, 0.1)' : 'none',
                background: isSelected
                  ? 'rgba(245, 158, 11, 0.08)'
                  : 'var(--color-surface-glass)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.875rem',
                }}
              >
                {/* Icon bubble */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: isSelected
                      ? 'var(--color-amber-dim)'
                      : 'var(--color-surface-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--color-amber-400)' : 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  aria-hidden="true"
                >
                  <Utensils size={18} />
                </div>

                {isSelected && (
                  <span
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: 99,
                      background: 'var(--color-amber-dim)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: 'var(--color-amber-300)',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                    }}
                  >
                    SELECTED
                  </span>
                )}
              </div>

              {/* Title */}
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-family-display)',
                  color: '#ffffff',
                }}
              >
                {f.name}
              </p>

              {/* Pricing */}
              <p
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: isSelected ? 'var(--color-amber-400)' : '#ffffff',
                  marginBottom: '0.25rem',
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                {inr(f.total_cost)}
              </p>

              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.78rem',
                  marginBottom: '0.5rem',
                }}
              >
                {inr(f.cost_per_day)}/day
              </p>

              {/* Highlights list */}
              {f.highlights && (
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.72rem',
                    marginTop: '0.5rem',
                    lineHeight: 'var(--line-height-body)',
                  }}
                >
                  {Array.isArray(f.highlights)
                    ? f.highlights.slice(0, 3).join(', ')
                    : f.highlights}
                </p>
              )}
            </Card>
          </div>
        )
      })}
    </div>
  )
}
