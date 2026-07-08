// src/components/domain/AnalyticsStatCard.jsx
// Aurora Design System — Analytics-specific stat card
// Per Aurora Section 14: neutral background, Bricolage values, Lucide icon, no colored headers.
import { TrendingUp, TrendingDown } from 'lucide-react'
import Card from '@/components/common/Card'

export default function AnalyticsStatCard({
  label,
  value,
  icon,
  trend,
  trendDirection,
  subtitle,
  className = '',
}) {
  const trendColor =
    trendDirection === 'up' ? 'var(--color-emerald-400)' :
    trendDirection === 'down' ? 'var(--color-rose-400)' :
    'var(--color-text-muted)'

  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : null

  return (
    <Card variant="raised" padding="md" className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        {icon && (
          <span className="inline-flex text-[var(--color-text-muted)]" aria-hidden="true">
            {icon}
          </span>
        )}
        {trend && (
          <span
            className="inline-flex items-center gap-1 text-[var(--font-size-caption)] font-medium"
            style={{ color: trendColor }}
          >
            {TrendIcon && <TrendIcon size={12} />}
            {trend}
          </span>
        )}
      </div>

      <p style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: 'var(--font-size-stat)',
        fontWeight: 800,
        lineHeight: 'var(--line-height-tight)',
        letterSpacing: 'var(--tracking-tight)',
        color: 'var(--color-text-primary)',
        margin: 0,
      }}>
        {value}
      </p>

      <p style={{
        fontSize: 'var(--font-size-body-sm)',
        color: 'var(--color-text-muted)',
        margin: 0,
      }}>
        {label}
      </p>

      {subtitle && (
        <p style={{
          fontSize: 'var(--font-size-caption)',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}>
          {subtitle}
        </p>
      )}
    </Card>
  )
}
