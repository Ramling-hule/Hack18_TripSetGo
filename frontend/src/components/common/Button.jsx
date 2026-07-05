// src/components/common/Button.jsx
// Aurora Design System — Primary interactive element
// Variants: primary (Deep Indigo), secondary (outline), ghost, danger
// States: default, hover, pressed, focused, loading, disabled

const sizeMap = {
  sm: 'px-3.5 py-1.5 text-[0.8125rem] rounded-[var(--radius-sm)] gap-1.5',
  md: 'px-5 py-2.5 text-[var(--font-size-body-sm)] rounded-[var(--radius-md)] gap-2',
  lg: 'px-7 py-3.5 text-[var(--font-size-body)] rounded-[var(--radius-md)] gap-2.5',
}

const variantMap = {
  // Primary CTA — Deep Indigo solid
  primary: [
    'bg-[var(--color-indigo-700)] text-white',
    'shadow-[var(--shadow-primary)]',
    'hover:not-disabled:bg-[var(--color-indigo-600)]',
    'active:not-disabled:bg-[var(--color-indigo-900)] active:not-disabled:shadow-none',
    'disabled:bg-[var(--color-indigo-dim)] disabled:text-[var(--color-text-disabled)] disabled:shadow-none',
  ].join(' '),

  // Secondary — Outline/ghost with indigo border
  secondary: [
    'bg-transparent text-[var(--color-indigo-700)] border border-solid border-[var(--color-indigo-700)]',
    'hover:not-disabled:bg-[var(--color-indigo-dim)] hover:not-disabled:border-[var(--color-indigo-600)]',
    'active:not-disabled:bg-[var(--color-indigo-100)] active:not-disabled:text-[var(--color-indigo-900)] active:not-disabled:border-[var(--color-indigo-900)]',
    'disabled:text-[var(--color-text-disabled)] disabled:border-[var(--color-border-subtle)]',
  ].join(' '),

  // Ghost — Neutral, minimal
  ghost: [
    'bg-transparent text-[var(--color-text-secondary)] border border-solid border-[var(--color-border-default)]',
    'hover:not-disabled:bg-[var(--color-surface-hover)] hover:not-disabled:text-[var(--color-text-primary)] hover:not-disabled:border-[var(--color-border-interactive)]',
    'active:not-disabled:bg-[var(--color-surface-raised)]',
    'disabled:text-[var(--color-text-disabled)] disabled:border-[var(--color-border-subtle)]',
  ].join(' '),

  // Danger — Destructive actions
  danger: [
    'bg-transparent text-[var(--color-rose-500)] border border-solid border-[rgba(244,63,94,0.5)]',
    'hover:not-disabled:bg-[var(--color-rose-dim)] hover:not-disabled:border-[var(--color-rose-500)]',
    'active:not-disabled:bg-[rgba(244,63,94,0.18)] active:not-disabled:text-[var(--color-rose-700)]',
    'disabled:text-[var(--color-text-disabled)] disabled:border-[var(--color-border-subtle)]',
  ].join(' '),
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center
        font-[var(--font-family-body)] font-semibold
        whitespace-nowrap cursor-pointer
        transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
        outline-none
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variantMap[variant] || variantMap.primary}
        ${sizeMap[size] || sizeMap.md}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span
          className="animate-spin"
          aria-hidden="true"
          style={{
            width: size === 'sm' ? 14 : 16,
            height: size === 'sm' ? 14 : 16,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
          }}
        />
      ) : (
        icon && <span className="inline-flex items-center justify-center shrink-0" aria-hidden="true">{icon}</span>
      )}
      {children}
      {iconRight && !loading && (
        <span className="inline-flex items-center justify-center shrink-0" aria-hidden="true">{iconRight}</span>
      )}
    </button>
  )
}
