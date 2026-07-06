// HotelsTab.jsx
// Aurora Design System — Choice selector for hotel options (stay tiers).
// Full accessibility, rating stars with reader labels, standard layout styles.
import { Hotel, Star } from 'lucide-react'
import Card from '@/components/common/Card'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function HotelsTab({ options = [], selectedOption, onSelect }) {
  const handleKeyDown = (e, opt) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(opt)
    }
  }

  return (
    <div
      id="tabpanel-hotels"
      role="tabpanel"
      aria-label="Hotel option choices"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1rem',
      }}
    >
      {options.map((h, idx) => {
        const isSelected = selectedOption?.name === h.name
        return (
          <div
            key={idx}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelect(h)}
            onKeyDown={(e) => handleKeyDown(e, h)}
            style={{
              cursor: 'pointer',
              outline: 'none',
              borderRadius: '16px',
              transition: 'transform var(--transition-base)',
            }}
            className="hover:scale-[1.015] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card
              variant="glass"
              padding="lg"
              style={{
                height: '100%',
                borderColor: isSelected
                  ? 'var(--color-emerald-500)'
                  : 'var(--color-border-default)',
                boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.1)' : 'none',
                background: isSelected
                  ? 'rgba(16, 185, 129, 0.08)'
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
                      ? 'var(--color-emerald-dim)'
                      : 'var(--color-surface-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--color-emerald-400)' : 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  aria-hidden="true"
                >
                  <Hotel size={18} />
                </div>

                {isSelected && (
                  <span
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: 99,
                      background: 'var(--color-emerald-dim)',
                      border: '1px solid rgba(45, 181, 142, 0.3)',
                      color: 'var(--color-emerald-300)',
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
                  marginBottom: '0.25rem',
                  fontFamily: 'var(--font-family-display)',
                  color: '#ffffff',
                }}
              >
                {h.name}
              </p>

              {/* Tier & Rating */}
              <div
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.78rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{h.tier}</span>
                {h.rating && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span
                      aria-label={`Rating: ${h.rating} out of 5 stars`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}
                    >
                      <Star size={11} fill="var(--color-amber-400)" color="transparent" />
                      {h.rating}
                    </span>
                  </>
                )}
              </div>

              {/* Pricing */}
              <p
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: isSelected ? 'var(--color-emerald-400)' : '#ffffff',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                {inr(h.price_per_night)}
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                  /night
                </span>
              </p>

              {/* Amenities list */}
              {h.amenities && (
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.72rem',
                    marginTop: '0.625rem',
                    lineHeight: 'var(--line-height-body)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {Array.isArray(h.amenities)
                    ? h.amenities.slice(0, 3).join(' · ')
                    : h.amenities}
                </p>
              )}
            </Card>
          </div>
        )
      })}
    </div>
  )
}
