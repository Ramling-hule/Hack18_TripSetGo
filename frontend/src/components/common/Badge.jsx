// src/components/common/Badge.jsx
// Aurora Design System — Status & category badges
// Variants mapped to Aurora palette: indigo, emerald, amber, rose, sky, violet, slate

const variantMap = {
  primary:   'bg-[var(--color-indigo-dim)] text-[var(--color-indigo-400)] border border-solid border-[var(--color-indigo-200)]',
  success:   'bg-[var(--color-emerald-dim)] text-[var(--color-emerald-400)] border border-solid border-[rgba(45,181,142,0.30)]',
  green:     'bg-[var(--color-emerald-dim)] text-[var(--color-emerald-400)] border border-solid border-[rgba(45,181,142,0.30)]',
  warning:   'bg-[var(--color-amber-dim)] text-[var(--color-amber-400)] border border-solid border-[rgba(245,158,11,0.30)]',
  amber:     'bg-[var(--color-amber-dim)] text-[var(--color-amber-400)] border border-solid border-[rgba(245,158,11,0.30)]',
  danger:    'bg-[var(--color-rose-dim)] text-[var(--color-rose-400)] border border-solid border-[rgba(244,63,94,0.30)]',
  red:       'bg-[var(--color-rose-dim)] text-[var(--color-rose-400)] border border-solid border-[rgba(244,63,94,0.30)]',
  info:      'bg-[var(--color-sky-dim)] text-[var(--color-sky-300)] border border-solid border-[rgba(107,163,214,0.30)]',
  cyan:      'bg-[var(--color-sky-dim)] text-[var(--color-sky-300)] border border-solid border-[rgba(107,163,214,0.30)]',
  pro:       'bg-[var(--color-violet-dim)] text-[var(--color-violet-500)] border border-solid border-[rgba(155,125,212,0.30)]',
  secondary: 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border border-solid border-[var(--color-border-default)]',
}

export default function Badge({ label, variant = 'primary', icon, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        text-[var(--font-size-caption)] font-semibold
        px-2.5 py-1 rounded-full
        uppercase tracking-[var(--tracking-wide)]
        leading-[var(--line-height-caption)]
        ${variantMap[variant] || variantMap.primary}
        ${className}
      `}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {label}
    </span>
  )
}
