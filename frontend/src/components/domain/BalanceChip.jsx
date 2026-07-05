// src/components/domain/BalanceChip.jsx
// Aurora Design System — Colored balance indicator
// Green (positive / owed to you), Red (negative / you owe), Muted (zero)
// Per Aurora Section 13: Balance Colors

export default function BalanceChip({ amount = 0, currency = '₹', className = '' }) {
  const isPositive = amount > 0
  const isZero = amount === 0
  const absAmount = Math.abs(amount)

  const color = isZero
    ? 'var(--color-text-muted)'
    : isPositive
      ? 'var(--color-emerald-400)'
      : 'var(--color-rose-400)'

  const bg = isZero
    ? 'transparent'
    : isPositive
      ? 'var(--color-emerald-dim)'
      : 'var(--color-rose-dim)'

  const label = isZero
    ? 'Settled'
    : isPositive
      ? `+${currency}${absAmount.toLocaleString()}`
      : `-${currency}${absAmount.toLocaleString()}`

  return (
    <span
      className={`
        inline-flex items-center
        text-[var(--font-size-caption)] font-semibold
        px-2 py-0.5 rounded-full
        ${className}
      `}
      style={{ color, background: bg }}
    >
      {label}
    </span>
  )
}
