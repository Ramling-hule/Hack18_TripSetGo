// src/components/common/Select.jsx
// Aurora Design System — Custom select with Aurora dropdown styling
// Same visual state system as Input
import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select(
  { label, options = [], value, onChange, error, placeholder = 'Select…', disabled, className = '', id, required, ...props },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  const stateClasses = error
    ? 'border-[var(--color-border-error)] focus:border-[var(--color-border-error)] focus:shadow-[0_0_0_3px_var(--color-rose-dim)]'
    : 'border-[var(--color-border-default)] hover:border-[var(--color-border-interactive)] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_var(--color-indigo-dim)]'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[var(--font-size-body-sm)] font-medium text-[var(--color-text-secondary)]"
        >
          {label}
          {required && <span className="text-[var(--color-rose-500)] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full appearance-none
            bg-[var(--color-surface-raised)]
            border border-solid ${stateClasses}
            rounded-[var(--radius-sm)]
            text-[var(--color-text-primary)]
            font-[var(--font-family-body)]
            text-[var(--font-size-body)]
            px-4 py-2.5 pr-10
            outline-none cursor-pointer
            transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
            focus:bg-[var(--color-surface-default)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!value ? 'text-[var(--color-text-muted)]' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(opt => {
            const val = typeof opt === 'string' ? opt : opt.value
            const lbl = typeof opt === 'string' ? opt : opt.label
            return <option key={val} value={val}>{lbl}</option>
          })}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {error && <span className="text-[0.8125rem] text-[var(--color-rose-500)]">{error}</span>}
    </div>
  )
})

export default Select
