// SuggestionsTab.jsx
// Aurora Design System — AI recommendation lists.
// Premium Editorial visual representation, correct layout classes, and semantic outlines.
export default function SuggestionsTab({ suggestions = [] }) {
  if (suggestions.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        No recommendations available for this plan.
      </div>
    )
  }

  return (
    <div
      id="tabpanel-suggestions"
      role="tabpanel"
      aria-label="AI recommendations and travel tips"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
    >
      {suggestions.map((s, i) => (
        <div
          key={i}
          className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
          style={{
            borderRadius: 14,
            padding: '1.25rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Icon bubble */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              flexShrink: 0,
              background: 'var(--color-indigo-dim)',
              border: '1px solid rgba(98, 119, 204, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
            aria-hidden="true"
          >
            {s.icon || '💡'}
          </div>

          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-family-display)',
                color: '#ffffff',
                margin: '0 0 0.25rem 0',
              }}
            >
              {s.title}
            </p>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {s.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
