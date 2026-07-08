// src/components/common/Textarea.jsx
// Aurora Design System — Multi-line text input with optional auto-grow
// Same state system as Input (Aurora Section 9)
import { forwardRef, useRef, useCallback, useEffect } from 'react'

const Textarea = forwardRef(function Textarea(
  { label, error, success, helperText, rows = 3, maxRows = 8, autoGrow = false, className = '', id, required, disabled, onChange, ...props },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const internalRef = useRef(null)
  const textareaRef = ref || internalRef

  const stateClasses = error
    ? 'border-[var(--color-border-error)] focus:border-[var(--color-border-error)] focus:shadow-[0_0_0_3px_var(--color-rose-dim)]'
    : success
      ? 'border-[var(--color-border-success)] focus:border-[var(--color-border-success)] focus:shadow-[0_0_0_3px_var(--color-emerald-dim)]'
      : 'border-[var(--color-border-default)] hover:border-[var(--color-border-interactive)] focus:border-[var(--color-border-focus)] focus:shadow-[0_0_0_3px_var(--color-indigo-dim)]'

  const handleAutoGrow = useCallback((el) => {
    if (!autoGrow || !el) return
    el.style.height = 'auto'
    const lineHeight = parseInt(getComputedStyle(el).lineHeight)
    const maxHeight = lineHeight * maxRows + 24 // + padding
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }, [autoGrow, maxRows])

  useEffect(() => {
    if (autoGrow && textareaRef?.current) handleAutoGrow(textareaRef.current)
  }, [autoGrow, handleAutoGrow, textareaRef])

  const handleChange = (e) => {
    if (autoGrow) handleAutoGrow(e.target)
    onChange?.(e)
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[var(--font-size-body-sm)] font-medium text-[var(--color-text-secondary)]"
        >
          {label}
          {required && <span className="text-[var(--color-rose-500)] ml-0.5">*</span>}
        </label>
      )}

      <textarea
        ref={textareaRef}
        id={inputId}
        rows={rows}
        disabled={disabled}
        onChange={handleChange}
        className={`
          w-full resize-y
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
          ${autoGrow ? 'resize-none overflow-hidden' : ''}
          ${className}
        `}
        {...props}
      />

      {error && <span className="text-[0.8125rem] text-[var(--color-rose-500)]">{error}</span>}
      {success && !error && <span className="text-[0.8125rem] text-[var(--color-emerald-500)]">{success}</span>}
      {helperText && !error && !success && <span className="text-[0.8125rem] text-[var(--color-text-muted)]">{helperText}</span>}
    </div>
  )
})

export default Textarea
