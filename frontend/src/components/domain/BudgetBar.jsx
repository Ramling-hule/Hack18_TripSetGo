// src/components/domain/BudgetBar.jsx
// Aurora Design System — Budget progress bar with color thresholds
// 0–79%: emerald, 80–99%: amber, 100%: indigo, >100%: rose
// Per Aurora Analytics Section 14: Progress Indicators

export default function BudgetBar({
  spent = 0,
  total = 0,
  currency = '₹',
  showLabel = true,
  className = '',
}) {
  const percent = total > 0 ? (spent / total) * 100 : 0
  const clampedWidth = Math.min(percent, 100)

  let fillColor = 'var(--color-emerald-500)'
  let statusText = 'On track'

  if (percent > 100) {
    fillColor = 'var(--color-rose-500)'
    statusText = 'Over budget'
  } else if (percent === 100) {
    fillColor = 'var(--color-indigo-700)'
    statusText = 'Budget used'
  } else if (percent >= 80) {
    fillColor = 'var(--color-amber-500)'
    statusText = 'Nearing limit'
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)]">
            {currency}{spent.toLocaleString()} <span className="text-[var(--color-text-muted)]">/ {currency}{total.toLocaleString()}</span>
          </span>
          <span
            className="text-[var(--font-size-caption)] font-medium"
            style={{ color: fillColor }}
          >
            {statusText}
          </span>
        </div>
      )}

      {/* Track */}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--color-surface-raised)' }}
        role="progressbar"
        aria-valuenow={spent}
        aria-valuemax={total}
        aria-label={`Budget: ${currency}${spent} of ${currency}${total}`}
      >
        <div
          className="h-full rounded-full transition-all duration-[var(--duration-slow)] ease-[var(--easing-standard)]"
          style={{
            width: `${clampedWidth}%`,
            background: fillColor,
          }}
        />
      </div>
    </div>
  )
}
