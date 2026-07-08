// src/components/common/BottomSheet.jsx
// Aurora Design System — Mobile-friendly bottom sheet with drag-to-dismiss
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import IconButton from './IconButton'
import { X } from 'lucide-react'

export default function BottomSheet({ isOpen, onClose, title, children, snapPoints = ['50vh', '90vh'] }) {
  const dragControls = useDragControls()
  const constraintsRef = useRef(null)

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div ref={constraintsRef} style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
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
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose?.()
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Bottom sheet'}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: snapPoints[snapPoints.length - 1] || '90vh',
              background: 'var(--color-surface-raised)',
              borderTop: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              touchAction: 'none',
            }}
          >
            {/* Drag handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '0.75rem 0 0.25rem',
                cursor: 'grab',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 36,
                height: 4,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-border-interactive)',
              }} />
            </div>

            {/* Header */}
            {title && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 1.25rem 1rem',
                flexShrink: 0,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--font-size-h3)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}>
                  {title}
                </h3>
                <IconButton
                  icon={<X size={18} />}
                  variant="ghost"
                  size="sm"
                  label="Close"
                  onClick={onClose}
                />
              </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1.5rem' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
