// src/components/common/Modal.jsx
// Aurora Design System — Modal dialog
// surface.raised background, scrim at rgba(0,0,0,0.72), shadow.lg
// Spring animation via Framer Motion. Escape to close.
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import IconButton from './IconButton'

export default function Modal({ isOpen, onClose, title, children, size = 'md', hideClose = false }) {
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

  const maxWidths = { sm: 400, md: 560, lg: 720, xl: 900, full: '95vw' }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, overflowY: 'auto' }}>
          {/* Backdrop / Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: -1,
              background: 'var(--color-surface-scrim)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Centering wrapper */}
          <div
            style={{
              display: 'flex',
              minHeight: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1rem',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              style={{
                width: '100%',
                maxWidth: maxWidths[size] || 560,
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                position: 'relative',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border-default)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Header */}
              {(title || !hideClose) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}>
                  {title && (
                    <h2
                      id="modal-title"
                      style={{
                        fontFamily: 'var(--font-family-display)',
                        fontSize: 'var(--font-size-h3)',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                      }}
                    >
                      {title}
                    </h2>
                  )}
                  {!hideClose && (
                    <IconButton
                      icon={<X size={18} />}
                      variant="ghost"
                      size="sm"
                      label="Close"
                      onClick={onClose}
                      className="ml-auto"
                    />
                  )}
                </div>
              )}

              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
