// EssentialsTab.jsx
// Aurora Design System — Weather integration note + checklist packing grid.
// Premium Editorial visual representation, correct layout classes, and semantic outlines.
import { Package } from 'lucide-react'

export default function EssentialsTab({ weather, packingList = [] }) {
  return (
    <div
      id="tabpanel-essentials"
      role="tabpanel"
      aria-label="Trip essential checklist and weather summary"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* ── Weather Info card ── */}
      {weather && (
        <div
          className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
          style={{
            borderRadius: 14,
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div style={{ fontSize: 36, flexShrink: 0 }} aria-hidden="true">
            🌤️
          </div>
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                margin: '0 0 0.25rem 0',
                fontFamily: 'var(--font-family-display)',
                color: '#ffffff',
              }}
            >
              Weather Summary{' '}
              {weather.temp_range && (
                <span style={{ color: 'var(--color-indigo-400)', fontWeight: 600 }}>
                  · {weather.temp_range}
                </span>
              )}
            </p>
            {weather.note && (
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.8125rem',
                  margin: '0 0 0.25rem 0',
                  lineHeight: '1.5',
                }}
              >
                {weather.note}
              </p>
            )}
            {weather.best_season && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', margin: 0 }}>
                Best season to visit: {weather.best_season}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Packing List Card ── */}
      {packingList.length > 0 ? (
        <div
          className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
          style={{ borderRadius: 14, padding: '1.25rem' }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontFamily: 'var(--font-family-display)',
              color: '#ffffff',
              margin: '0 0 1rem 0',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Package size={15} style={{ color: 'var(--color-indigo-400)' }} aria-hidden="true" />
            <span>Recommended Packing List</span>
          </p>

          <ul
            aria-label="Packing checklist"
            style={{
              margin: 0,
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.625rem',
              listStyle: 'none',
            }}
          >
            {packingList.map((item, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span
                  style={{ color: 'var(--color-emerald-400)', fontWeight: 700, flexShrink: 0 }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !weather && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            No weather information or packing suggestions available for this trip.
          </div>
        )
      )}
    </div>
  )
}
