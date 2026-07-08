// NarrativeStageRow.jsx
// Aurora Design System — Single row in the generation stage timeline.
// Three visual states: pending (muted), active (indigo + spinner), completed (emerald + check).
// Entrance via staggerItem. Color/bg transitions via motion.div animate — type:'tween', 200ms.
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { staggerItem } from '@/components/landing/animations/variants'

export default function NarrativeStageRow({ icon: Icon, label, status }) {
  const isActive    = status === 'active'
  const isCompleted = status === 'completed'

  return (
    <motion.li
      variants={staggerItem}
      aria-current={isActive ? 'step' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        padding: '0.5rem 0',
        listStyle: 'none',
      }}
    >
      {/* ── Icon container ── */}
      <motion.div
        animate={{
          backgroundColor: isCompleted
            ? 'var(--color-emerald-dim)'
            : isActive
            ? 'var(--color-indigo-dim)'
            : 'rgba(255,255,255,0.03)',
          borderColor: isCompleted
            ? 'rgba(45,181,142,0.25)'
            : isActive
            ? 'rgba(98,119,204,0.35)'
            : 'rgba(255,255,255,0.06)',
        }}
        transition={{ duration: 0.2, type: 'tween' }}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid',
        }}
      >
        {isCompleted ? (
          <Check
            size={14}
            aria-label="Completed"
            role="img"
            style={{ color: 'var(--color-emerald-400)' }}
          />
        ) : (
          <motion.span
            animate={{
              color: isActive
                ? 'var(--color-indigo-400)'
                : 'rgba(255,255,255,0.25)',
            }}
            transition={{ duration: 0.2, type: 'tween' }}
            style={{ display: 'inline-flex' }}
            aria-hidden="true"
          >
            <Icon size={14} />
          </motion.span>
        )}
      </motion.div>

      {/* ── Label ── */}
      <motion.span
        animate={{
          color: isCompleted
            ? 'var(--color-text-secondary)'
            : isActive
            ? 'var(--color-text-primary)'
            : 'var(--color-text-muted)',
          fontWeight: isActive ? 600 : 400,
        }}
        transition={{ duration: 0.2, type: 'tween' }}
        style={{
          flex: 1,
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--font-size-body-sm)',
        }}
      >
        {label}
      </motion.span>

      {/* ── Right status indicator ── */}
      <div style={{ width: 16, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {isActive ? (
          <motion.div
            aria-label="In progress"
            role="status"
            animate={{
              opacity: [0.35, 1, 0.35],
              scale: [0.92, 1.08, 0.92],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
              type: 'tween',
            }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--color-indigo-400)',
              boxShadow: '0 0 8px var(--color-indigo-500)',
            }}
          />
        ) : isCompleted ? (
          // Check icon is already in icon container; right side is empty for completed
          null
        ) : (
          <span
            aria-hidden="true"
            style={{
              color: 'rgba(255,255,255,0.15)',
              fontSize: '0.6rem',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            —
          </span>
        )}
      </div>
    </motion.li>
  )
}
