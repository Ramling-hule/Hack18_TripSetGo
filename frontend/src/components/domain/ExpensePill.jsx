// src/components/domain/ExpensePill.jsx
// Aurora Design System — Category-colored pill for expense categories
// Per Aurora Section 13: Expense Tracking Colors

const categoryConfig = {
  accommodation: {
    bg: 'var(--color-expense-accommodation)',
    fg: 'var(--color-expense-accommodation-fg)',
    label: 'Accommodation',
  },
  food: {
    bg: 'var(--color-expense-food)',
    fg: 'var(--color-expense-food-fg)',
    label: 'Food & Dining',
  },
  transport: {
    bg: 'var(--color-expense-transport)',
    fg: 'var(--color-expense-transport-fg)',
    label: 'Transport',
  },
  entertainment: {
    bg: 'var(--color-expense-entertainment)',
    fg: 'var(--color-expense-entertainment-fg)',
    label: 'Entertainment',
  },
  misc: {
    bg: 'var(--color-expense-misc)',
    fg: 'var(--color-expense-misc-fg)',
    label: 'Miscellaneous',
  },
}

export default function ExpensePill({ category = 'misc', label, className = '' }) {
  const cfg = categoryConfig[category] || categoryConfig.misc

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        text-[var(--font-size-caption)] font-medium
        px-2.5 py-1 rounded-full
        ${className}
      `}
      style={{
        background: cfg.bg,
        color: cfg.fg,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.fg,
          flexShrink: 0,
        }}
      />
      {label || cfg.label}
    </span>
  )
}
