// src/components/common/Tooltip.jsx
// Aurora Design System — Lightweight positioned tooltip
// Dark surface (surface.overlay) with arrow. Appears on hover after delay.
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const positionStyles = {
  top:    { transform: 'translateX(-50%) translateY(-100%)', marginTop: -8 },
  bottom: { transform: 'translateX(-50%)', marginTop: 8 },
  left:   { transform: 'translateX(-100%) translateY(-50%)', marginLeft: -8 },
  right:  { transform: 'translateY(-50%)', marginLeft: 8 },
}

export default function Tooltip({ content, position = 'top', delay = 300, children }) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef(null)
  const timeoutRef = useRef(null)

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const pos = {
          top:    { x: rect.left + rect.width / 2, y: rect.top },
          bottom: { x: rect.left + rect.width / 2, y: rect.bottom },
          left:   { x: rect.left, y: rect.top + rect.height / 2 },
          right:  { x: rect.right, y: rect.top + rect.height / 2 },
        }
        setCoords(pos[position] || pos.top)
        setVisible(true)
      }
    }, delay)
  }, [delay, position])

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }, [])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  if (!content) return children

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </span>

      {visible && createPortal(
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: coords.x,
            top: coords.y,
            zIndex: 9999,
            pointerEvents: 'none',
            ...positionStyles[position],
          }}
        >
          <div
            className="animate-fadeIn"
            style={{
              background: 'var(--color-surface-overlay)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-caption)',
              fontFamily: 'var(--font-family-body)',
              lineHeight: 'var(--line-height-caption)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--color-border-default)',
              boxShadow: 'var(--shadow-md)',
              maxWidth: 240,
              whiteSpace: 'pre-wrap',
            }}
          >
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
