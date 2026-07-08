// GenerationFooter.jsx
// Aurora Design System — Cancel affordance + Gemini attribution.
// Reuses Button (variant=ghost, size=sm). staggerItem entrance.
import { motion } from 'framer-motion'
import { RotateCcw, Sparkles } from 'lucide-react'
import Button from '@/components/common/Button'
import { staggerItem } from '@/components/landing/animations/variants'

export default function GenerationFooter({ onCancel }) {
  return (
    <motion.div
      variants={staggerItem}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap',
        gap: '0.625rem',
      }}
    >
      {onCancel ? (
        <Button
          variant="ghost"
          size="sm"
          icon={<RotateCcw size={13} />}
          onClick={onCancel}
          aria-label="Cancel AI generation and start over"
          style={{ color: 'var(--color-text-muted)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          Start over
        </Button>
      ) : (
        /* Spacer to keep branding right-aligned even without cancel button */
        <span />
      )}

      <span
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--font-size-caption)',
          color: 'rgba(255,255,255,0.2)',
        }}
      >
        Powered by
        <Sparkles size={10} style={{ color: 'var(--color-indigo-400)' }} />
        Gemini AI
      </span>
    </motion.div>
  )
}
