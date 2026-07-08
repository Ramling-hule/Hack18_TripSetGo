// src/components/domain/auth/OTPInput.jsx
// Aurora Design System — OTP code entry widget
// Coordinates 6 individual text input slots.
// Supports auto-focus advance, backspacing return focus, and clipboard pasting.
import { useRef } from 'react'

export default function OTPInput({ value = Array(6).fill(''), onChange, disabled }) {
  const refs = useRef([])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...value]
    next[i] = val
    onChange?.(next)
    if (val && i < 5) {
      refs.current[i + 1]?.focus()
    }
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    if (disabled) return
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (data.length === 6) {
      const next = data.split('')
      onChange?.(next)
      refs.current[5]?.focus()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--spacing-3)',
        justifyContent: 'center',
        marginBottom: 'var(--spacing-6)',
      }}
      onPaste={handlePaste}
    >
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          style={{
            width: 48,
            height: 56,
            padding: 0,
            textAlign: 'center',
            fontSize: 'var(--font-size-stat)',
            fontFamily: 'var(--font-family-display)',
            fontWeight: 700,
            background: 'var(--color-surface-raised)',
            border: `2px solid ${digit ? 'var(--color-indigo-400)' : 'var(--color-border-default)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
          }}
          className="focus:border-[var(--color-border-focus)] focus:bg-[var(--color-surface-default)]"
        />
      ))}
    </div>
  )
}
