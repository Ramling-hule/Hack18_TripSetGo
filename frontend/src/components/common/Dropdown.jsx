// src/components/common/Dropdown.jsx
// Aurora Design System — Generic dropdown menu
// Trigger element + menu items. Click-outside to close. Keyboard accessible.
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Dropdown({ trigger, items = [], align = 'right', onSelect, className = '' }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleSelect = useCallback((item) => {
    onSelect?.(item)
    item.onClick?.()
    setOpen(false)
  }, [onSelect])

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      {/* Trigger */}
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={`
              absolute top-full mt-1.5 z-50
              min-w-[180px]
              bg-[var(--color-surface-raised)]
              border border-[var(--color-border-default)]
              rounded-[var(--radius-md)]
              shadow-[var(--shadow-md)]
              py-1.5
              ${align === 'right' ? 'right-0' : 'left-0'}
            `}
            style={{ transformOrigin: `top ${align}` }}
          >
            {items.map((item, i) => {
              if (item.divider) {
                return (
                  <div key={`d-${i}`} className="my-1.5 border-t border-[var(--color-border-subtle)]" />
                )
              }

              return (
                <button
                  key={item.label || i}
                  type="button"
                  onClick={() => handleSelect(item)}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center gap-2.5
                    px-3 py-2
                    text-[var(--font-size-body-sm)] text-left
                    bg-transparent border-none cursor-pointer outline-none
                    transition-colors duration-[var(--duration-fast)] ease-[var(--easing-standard)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${item.danger
                      ? 'text-[var(--color-rose-500)] hover:bg-[var(--color-rose-dim)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                    }
                  `}
                >
                  {item.icon && <span className="inline-flex shrink-0" aria-hidden="true">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
