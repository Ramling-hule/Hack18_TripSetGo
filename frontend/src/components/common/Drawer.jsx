// src/components/common/Drawer.jsx
// Aurora Design System — Side panel overlay (right-sliding by default)
// For filters, detail views, mobile navigation.
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import IconButton from './IconButton'

const sizeWidths = {
  sm: 320,
  md: 420,
  lg: 560,
  xl: 720,
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  size = 'md',
}) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const slideFrom = side === 'left' ? -1 : 1
  const width = sizeWidths[size] || 420

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--color-surface-scrim)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: slideFrom * width }}
            animate={{ x: 0 }}
            exit={{ x: slideFrom * width }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Panel'}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              [side]: 0,
              width,
              maxWidth: '90vw',
              background: 'var(--color-surface-raised)',
              borderLeft: side === 'right' ? '1px solid var(--color-border-default)' : 'none',
              borderRight: side === 'left' ? '1px solid var(--color-border-default)' : 'none',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border-subtle)',
                flexShrink: 0,
              }}
            >
              {title && (
                <h2 style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--font-size-h3)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}>
                  {title}
                </h2>
              )}
              <IconButton
                icon={<X size={18} />}
                variant="ghost"
                size="sm"
                label="Close"
                onClick={onClose}
                className="ml-auto"
              />
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
              {children}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
