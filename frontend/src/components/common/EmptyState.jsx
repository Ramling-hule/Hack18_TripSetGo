// src/components/common/EmptyState.jsx
// Aurora Design System — Empty state placeholder
// Used for: no trips, no expenses, no notifications, etc.
// Per Aurora Section 19: geometric, minimal illustrations in Aurora palette.
import Button from './Button'

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {/* Icon container */}
      {icon && (
        <div
          className="mb-5"
          style={{
            width: 72,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'var(--color-indigo-dim)',
            border: '1px solid var(--color-indigo-200)',
            color: 'var(--color-indigo-400)',
          }}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      {title && (
        <h3
          className="mb-2"
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h3)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p
          className="mb-6 max-w-sm"
          style={{
            fontSize: 'var(--font-size-body-sm)',
            lineHeight: 'var(--line-height-body)',
            color: 'var(--color-text-muted)',
          }}
        >
          {description}
        </p>
      )}

      {/* CTA */}
      {action && (
        <Button
          variant="secondary"
          size="sm"
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
