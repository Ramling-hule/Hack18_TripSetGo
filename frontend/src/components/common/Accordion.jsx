// src/components/common/Accordion.jsx
// Aurora Design System — Expandable content sections
// Chevron rotation animation. Supports single or multiple open.
import { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Accordion({ items = [], multiple = false, defaultOpen = [], className = '' }) {
  const [openItems, setOpenItems] = useState(new Set(defaultOpen))

  const toggle = useCallback((index) => {
    setOpenItems(prev => {
      const next = new Set(multiple ? prev : [])
      if (prev.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [multiple])

  return (
    <div className={`flex flex-col ${className}`}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index)
        return (
          <div key={index} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
            {/* Header */}
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className={`
                w-full flex items-center justify-between gap-3
                py-4 px-1
                bg-transparent border-none cursor-pointer outline-none
                text-left
                transition-colors duration-[var(--duration-fast)] ease-[var(--easing-standard)]
                hover:bg-[var(--color-surface-hover)]
                rounded-[var(--radius-sm)]
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.icon && (
                  <span className="inline-flex shrink-0 text-[var(--color-text-muted)]" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className={`text-[var(--font-size-body)] font-semibold truncate ${isOpen ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {item.title}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`shrink-0 text-[var(--color-text-muted)] transition-transform duration-[var(--duration-standard)] ease-[var(--easing-standard)] ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Content — collapsible */}
            <div
              className="overflow-hidden transition-all duration-[var(--duration-standard)] ease-[var(--easing-standard)]"
              style={{
                maxHeight: isOpen ? 1000 : 0,
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="px-1 pb-4 text-[var(--font-size-body-sm)] text-[var(--color-text-secondary)] leading-[var(--line-height-body)]">
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
