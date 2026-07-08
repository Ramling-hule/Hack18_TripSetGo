// src/components/common/Toast.jsx
// Aurora Design System — Toast notifications
// Uses surface.raised (solid, not glass). Left border accent per status type.
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const config = {
  success: {
    icon: <CheckCircle size={18} />,
    iconColor: 'var(--color-emerald-400)',
    border: 'var(--color-emerald-500)',
  },
  error: {
    icon: <XCircle size={18} />,
    iconColor: 'var(--color-rose-400)',
    border: 'var(--color-rose-500)',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    iconColor: 'var(--color-amber-400)',
    border: 'var(--color-amber-500)',
  },
  info: {
    icon: <Info size={18} />,
    iconColor: 'var(--color-indigo-400)',
    border: 'var(--color-indigo-700)',
  },
}

export function Toast({ id, type = 'info', message, onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!duration) return
    const t = setTimeout(() => onDismiss(id), duration)
    return () => clearTimeout(t)
  }, [id, duration, onDismiss])

  const cfg = config[type] || config.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border-default)',
        borderLeft: `3px solid ${cfg.border}`,
        boxShadow: 'var(--shadow-md)',
        minWidth: 300,
        maxWidth: 440,
      }}
    >
      <span style={{ color: cfg.iconColor, display: 'inline-flex', shrink: 0 }}>{cfg.icon}</span>
      <p style={{
        flex: 1,
        fontSize: 'var(--font-size-body-sm)',
        lineHeight: 'var(--line-height-body)',
        color: 'var(--color-text-primary)',
        margin: 0,
      }}>
        {message}
      </p>
      <button
        onClick={() => onDismiss(id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          padding: 2,
          display: 'inline-flex',
        }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <AnimatePresence>
        {toasts.map(t => <Toast key={t.id} {...t} onDismiss={onDismiss} />)}
      </AnimatePresence>
    </div>
  )
}
