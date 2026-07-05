// src/components/common/Input.jsx
// Aurora Design System — Text input with full state system
// States: default → hover → focus → error → success → disabled
// Per Aurora Section 9 Interactive Color Behavior: Input Field
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, success, helperText, icon, iconRight, type = 'text', className = '', id, required, disabled, ...props },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  // Determine border/ring state classes
  const stateClasses = error
    ? 'border-[var(--color-border-error)] focus:border-[var(--color-border-error)] focus:shadow-[0_0_0_3px_var(--color-rose-dim)]'
    : success
      ? 'border-[var(--color-border-success)] focus:border-[var(--color-border-success)] focus:shadow-[0_0_0_3px_var(--color-emerald-dim)]'
      : 'border-[var(--color-border-default)] hover:border-[var(--color-border-interactive)] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_var(--color-indigo-dim)]'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[var(--font-size-body-sm)] font-medium text-[var(--color-text-secondary)] leading-[var(--line-height-caption)]"
        >
          {label}
          {required && <span className="text-[var(--color-rose-500)] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span
            className="absolute left-3 text-[var(--color-text-muted)] inline-flex pointer-events-none"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`
            w-full
            bg-[var(--color-surface-raised)]
            border border-solid ${stateClasses}
            rounded-[var(--radius-sm)]
            text-[var(--color-text-primary)]
            font-[var(--font-family-body)]
            text-[var(--font-size-body)]
            leading-[var(--line-height-body)]
            px-4 py-2.5
            outline-none
            transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
            placeholder:text-[var(--color-text-muted)]
            focus:bg-[var(--color-surface-default)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          style={{
            paddingLeft: icon ? '2.5rem' : undefined,
            paddingRight: iconRight ? '2.5rem' : undefined,
          }}
          {...props}
        />

        {iconRight && (
          <span className="absolute right-3 text-[var(--color-text-muted)] inline-flex">
            {iconRight}
          </span>
        )}
      </div>

      {/* Helper / Error / Success text */}
      {error && (
        <span className="text-[0.8125rem] text-[var(--color-rose-500)] leading-[var(--line-height-caption)]">
          {error}
        </span>
      )}
      {success && !error && (
        <span className="text-[0.8125rem] text-[var(--color-emerald-500)] leading-[var(--line-height-caption)]">
          {success}
        </span>
      )}
      {helperText && !error && !success && (
        <span className="text-[0.8125rem] text-[var(--color-text-muted)] leading-[var(--line-height-caption)]">
          {helperText}
        </span>
      )}
    </div>
  )
})

export default Input
