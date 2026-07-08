// src/components/domain/ThinkingDots.jsx
// Aurora Design System — AI thinking state indicator
// Three animated dots using glide ease

export default function ThinkingDots({ className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 py-2 px-3 bg-[var(--color-surface-default)] border border-[var(--color-border-default)] rounded-full w-max ${className}`}>
      <span className="text-[var(--font-size-caption)] text-[var(--color-text-muted)] mr-1">Copilot is thinking</span>
      <span className="w-1.5 h-1.5 bg-[var(--color-indigo-400)] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
      <span className="w-1.5 h-1.5 bg-[var(--color-indigo-400)] rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }} />
      <span className="w-1.5 h-1.5 bg-[var(--color-indigo-400)] rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }} />
    </div>
  )
}
