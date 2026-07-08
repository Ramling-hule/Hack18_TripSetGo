// src/components/common/StatCard.jsx
// Aurora Design System — Stat display card (icon + label + value + optional trend)
// Per Aurora Analytics Section 14: neutral presentation, no colored backgrounds.
import { TrendingUp, TrendingDown } from 'lucide-react'
import Card from './Card'

export default function StatCard({ label, value, icon, trend, trendDirection, className = '' }) {
  const trendColor = trendDirection === 'up'
    ? 'text-[var(--color-emerald-400)]'
    : trendDirection === 'down'
      ? 'text-[var(--color-rose-400)]'
      : 'text-[var(--color-text-muted)]'

  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : null

  return (
    <Card variant="raised" padding="md" className={`flex flex-col gap-3 ${className}`}>
      {/* Icon */}
      {icon && (
        <span className="inline-flex text-[var(--color-text-muted)]" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Value */}
      <p
        className="font-[var(--font-family-display)] text-[var(--font-size-stat)] font-[800] leading-[var(--line-height-tight)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)]"
      >
        {value}
      </p>

      {/* Label + Trend */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[var(--font-size-body-sm)] text-[var(--color-text-muted)]">
          {label}
        </span>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-[var(--font-size-caption)] font-medium ${trendColor}`}>
            {TrendIcon && <TrendIcon size={12} />}
            {trend}
          </span>
        )}
      </div>
    </Card>
  )
}
