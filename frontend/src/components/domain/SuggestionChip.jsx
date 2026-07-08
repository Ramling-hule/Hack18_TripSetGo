// src/components/domain/SuggestionChip.jsx
// Aurora Design System — Quick recommendation chip for AI chatbot suggestion prompts
import { Sparkles } from 'lucide-react'

export default function SuggestionChip({
  label,
  onClick,
  icon = <Sparkles size={13} />,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        text-[var(--font-size-body-sm)] font-medium
        px-3.5 py-2 rounded-xl
        border border-solid border-[var(--color-border-default)]
        bg-[var(--color-surface-default)]
        text-[var(--color-text-secondary)]
        transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]
        outline-none cursor-pointer select-none
        hover:bg-[var(--color-surface-hover)]
        hover:text-[var(--color-text-primary)]
        hover:border-[var(--color-border-interactive)]
        active:bg-[var(--color-surface-raised)]
        ${className}
      `}
    >
      {icon && <span className="inline-flex shrink-0 text-[var(--color-indigo-400)]" aria-hidden="true">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  )
}
