// src/components/common/Tabs.jsx
// Aurora Design System — Horizontal tab navigation
// Underline indicator with indigo.700. Animated via CSS transition.
import { useRef, useState, useEffect, useCallback } from 'react'

export default function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  const containerRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback(() => {
    if (!containerRef.current) return
    const activeEl = containerRef.current.querySelector('[data-active="true"]')
    if (activeEl) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tabRect = activeEl.getBoundingClientRect()
      setIndicator({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      })
    }
  }, [])

  useEffect(() => { updateIndicator() }, [activeTab, updateIndicator])
  useEffect(() => {
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`relative flex border-b border-[var(--color-border-subtle)] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            onClick={() => onChange?.(tab.value)}
            className={`
              relative flex items-center gap-2
              px-4 py-3
              text-[var(--font-size-body-sm)] font-medium
              border-none bg-transparent cursor-pointer outline-none
              transition-colors duration-[var(--duration-fast)] ease-[var(--easing-standard)]
              whitespace-nowrap
              ${isActive
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }
            `}
          >
            {tab.icon && <span className="inline-flex shrink-0" aria-hidden="true">{tab.icon}</span>}
            {tab.label}
          </button>
        )
      })}

      {/* Animated underline indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-[var(--color-indigo-700)] rounded-full transition-all duration-[var(--duration-standard)] ease-[var(--easing-standard)]"
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  )
}
