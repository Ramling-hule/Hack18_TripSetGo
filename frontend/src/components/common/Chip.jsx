// src/components/common/Chip.jsx
// Aurora Design System — Selectable/removable tag element
// States: default → hover → selected → disabled
import { X } from 'lucide-react'

export default function Chip({
  label,
  selected = false,
  onSelect,
  onRemove,
  icon,
  disabled = false,
  className = '',
}) {
  const baseStyles = `
    inline-flex items-center gap-1.5
    text-[var(--font-size-body-sm)] font-medium
    px-3 py-1.5 rounded-full
    border border-solid
    transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
    outline-none cursor-pointer select-none
    disabled:cursor-not-allowed
  `

  const stateStyles = disabled
    ? 'bg-transparent text-[var(--color-text-disabled)] border-[var(--color-border-subtle)]'
    : selected
      ? 'bg-[var(--color-indigo-dim)] text-[var(--color-indigo-400)] border-[var(--color-indigo-400)]'
      : `bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]
         hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-interactive)]`

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`${baseStyles} ${stateStyles} ${className}`}
      aria-pressed={selected}
    >
      {icon && <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>}
      <span>{label}</span>
      {onRemove && !disabled && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemove() } }}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-[var(--duration-fast)]"
          aria-label={`Remove ${label}`}
        >
          <X size={12} />
        </span>
      )}
    </button>
  )
}
