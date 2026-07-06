// AIInsights.jsx
// Aurora Design System — Expandable visual drawer for itinerary highlights and hacks.
// Custom toggle heights using tween transitions.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

export default function AIInsights({ destination, theme }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      style={{
        marginTop: '1.5rem',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="insights-content-drawer"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 14,
          color: '#ffffff',
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-color var(--transition-base)',
        }}
        className="hover:border-border-interactive focus:border-border-focus"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} style={{ color: 'var(--color-indigo-400)' }} />
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-family-display)',
            }}
          >
            AI Travel Insights &amp; Tips
          </span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="insights-content-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, type: 'tween', ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="bg-surface-glass border border-border-default backdrop-blur-2xl shadow-lg"
              style={{
                marginTop: '0.5rem',
                borderRadius: 14,
                padding: '1.25rem',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <p style={{ margin: 0 }}>
                💡 <strong>Local Hack:</strong> When visiting <strong>{destination}</strong>,
                booking tickets online in advance saves up to 2 hours of waiting in lines.
              </p>
              <p style={{ margin: 0 }}>
                🛡️ <strong>Safety Note:</strong> Keep copies of your travel documents stored on your
                phone. Avoid carrying excessive cash in tourist centres.
              </p>
              {theme && (
                <p style={{ margin: 0 }}>
                  ✨ <strong>Theme Match:</strong> Your plan has been optimized for{' '}
                  <strong>{theme}</strong> experiences. Check local guides for calendar events.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
