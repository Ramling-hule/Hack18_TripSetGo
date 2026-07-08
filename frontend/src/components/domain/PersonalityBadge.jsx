// src/components/domain/PersonalityBadge.jsx
// Aurora Design System — Travel personality badge (Explorer, Budget Traveler, etc.)
// Per Aurora Section 12: Personality Badge System

const typeConfig = {
  explorer: {
    bg: 'var(--color-indigo-dim)',
    fg: 'var(--color-indigo-400)',
    border: 'rgba(98, 119, 204, 0.3)',
    label: 'Explorer',
  },
  budget: {
    bg: 'var(--color-emerald-dim)',
    fg: 'var(--color-emerald-400)',
    border: 'rgba(45, 181, 142, 0.3)',
    label: 'Budget Traveler',
  },
  luxury: {
    bg: 'var(--color-violet-dim)',
    fg: 'var(--color-violet-500)',
    border: 'rgba(155, 125, 212, 0.3)',
    label: 'Luxury Seeker',
  },
  solo: {
    bg: 'var(--color-sky-dim)',
    fg: 'var(--color-sky-300)',
    border: 'rgba(107, 163, 214, 0.3)',
    label: 'Solo Adventurer',
  },
  group: {
    bg: 'var(--color-amber-dim)',
    fg: 'var(--color-amber-400)',
    border: 'rgba(245, 158, 11, 0.3)',
    label: 'Group Planner',
  },
}

export default function PersonalityBadge({ type = 'explorer', className = '' }) {
  const cfg = typeConfig[type] || typeConfig.explorer

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        text-[var(--font-size-caption)] font-semibold
        px-2.5 py-1 rounded-full
        uppercase tracking-[var(--tracking-wide)]
        border border-solid
        ${className}
      `}
      style={{
        background: cfg.bg,
        color: cfg.fg,
        borderColor: cfg.border,
      }}
    >
      {cfg.label}
    </span>
  )
}
