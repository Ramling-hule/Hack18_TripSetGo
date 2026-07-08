// src/components/common/ProgressBar.jsx
// Aurora Design System — Horizontal progress indicator
// Budget variant uses color thresholds: emerald (0-79%), amber (80-99%), rose (>100%)

export default function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'default',
  className = '',
}) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 110) // Allow slight overrun visual
  const clampedPercent = Math.min(percent, 100) // For width capping

  // Color logic
  let fillColor = 'var(--color-indigo-700)' // default
  if (variant === 'budget') {
    if (percent > 100)     fillColor = 'var(--color-rose-500)'
    else if (percent >= 80) fillColor = 'var(--color-amber-500)'
    else                    fillColor = 'var(--color-emerald-500)'
  }

  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }
  const height = heights[size] || heights.md

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)]">
            {Math.round(percent)}%
          </span>
          {variant === 'budget' && (
            <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)]">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className={`
          w-full ${height} rounded-full overflow-hidden
          bg-[var(--color-surface-raised)]
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full transition-all duration-[var(--duration-slow)] ease-[var(--easing-standard)]"
          style={{
            width: `${clampedPercent}%`,
            background: fillColor,
          }}
        />
      </div>
    </div>
  )
}
