// src/components/common/IconButton.jsx
// Aurora Design System — Icon-only button (close, menu, settings, etc.)
// Circular, subtle, accessible via aria-label.
import { forwardRef } from 'react'

const sizeMap = {
  sm: { button: 'w-7 h-7', icon: 14 },
  md: { button: 'w-9 h-9', icon: 18 },
  lg: { button: 'w-11 h-11', icon: 22 },
}

const variantMap = {
  ghost: [
    'text-[var(--color-text-secondary)]',
    'hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
    'active:bg-[var(--color-surface-raised)]',
  ].join(' '),
  danger: [
    'text-[var(--color-text-muted)]',
    'hover:bg-[var(--color-rose-dim)] hover:text-[var(--color-rose-500)]',
    'active:bg-[rgba(244,63,94,0.18)]',
  ].join(' '),
  primary: [
    'text-[var(--color-text-secondary)]',
    'hover:bg-[var(--color-indigo-dim)] hover:text-[var(--color-indigo-400)]',
    'active:bg-[rgba(61,82,160,0.18)]',
  ].join(' '),
}

const IconButton = forwardRef(function IconButton(
  { icon, variant = 'ghost', size = 'md', label, onClick, disabled = false, className = '', ...props },
  ref
) {
  const s = sizeMap[size] || sizeMap.md

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        inline-flex items-center justify-center shrink-0
        rounded-full border-none bg-transparent cursor-pointer
        transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
        outline-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantMap[variant] || variantMap.ghost}
        ${s.button}
        ${className}
      `}
      {...props}
    >
      <span className="inline-flex items-center justify-center" aria-hidden="true">
        {icon}
      </span>
    </button>
  )
})

export default IconButton
