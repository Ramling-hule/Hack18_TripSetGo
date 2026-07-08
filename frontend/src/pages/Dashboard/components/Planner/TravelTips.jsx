// TravelTips.jsx
// Aurora Design System — Rotating travel tip card.
// Reuses Card component (variant="glass"). 20 tips sorted by user preference relevance.
// Advances every 5s. Navigation dots support manual advance.
import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Card from '@/components/common/Card'

const ALL_TIPS = [
  { category: 'general',    emoji: '📱', text: 'Download offline maps before you leave — saves data and avoids getting lost.' },
  { category: 'general',    emoji: '💳', text: 'Inform your bank of your travel dates to prevent card blocks abroad.' },
  { category: 'general',    emoji: '📸', text: 'The golden hour — one hour after sunrise — gives the most stunning photos.' },
  { category: 'general',    emoji: '🎒', text: 'Roll clothes instead of folding — fit up to 30% more in your bag.' },
  { category: 'general',    emoji: '💰', text: 'Keep a small cash emergency fund separate from your main wallet.' },
  { category: 'general',    emoji: '🌤️', text: 'The shoulder season offers fewer crowds, lower prices, and often better weather.' },
  { category: 'general',    emoji: '🔌', text: 'Pack a universal power adapter — socket types vary by country.' },
  { category: 'general',    emoji: '🛡️', text: 'Carry a photocopy of your passport when exploring — keep the original secure.' },
  { category: 'general',    emoji: '⭐', text: 'Book accommodation at least two weeks ahead for the best rates and selection.' },
  { category: 'beach',      emoji: '🏖️', text: 'Visit beaches early morning — fewer crowds and the best light for photos.' },
  { category: 'mountains',  emoji: '⛰️', text: 'Acclimatise gradually at altitude — drink extra water and rest on day one.' },
  { category: 'food',       emoji: '🍜', text: 'Street food stalls with the longest local queue are usually the most authentic.' },
  { category: 'food',       emoji: '🥗', text: 'Ask your hotel staff for their personal restaurant picks — they always know best.' },
  { category: 'adventure',  emoji: '🪂', text: 'Always verify operator credentials and safety records before adventure bookings.' },
  { category: 'culture',    emoji: '🏛️', text: 'Learning five words in the local language transforms how locals receive you.' },
  { category: 'wildlife',   emoji: '🦁', text: 'Early morning game drives offer the best wildlife activity and lighting.' },
  { category: 'relaxation', emoji: '🧘', text: 'Build in one full rest day per four days of travel to avoid burnout.' },
  { category: 'nightlife',  emoji: '🎉', text: 'Research neighbourhood safety ratings before planning evening outings.' },
  { category: 'shopping',   emoji: '🛍️', text: 'At markets, bargaining is expected — start at around 60% of the asking price.' },
  { category: 'history',    emoji: '🏰', text: 'Hiring a local guide for historical sites transforms context into experience.' },
]

const DOT_COUNT = 5 // Number of navigation dots to show

export default function TravelTips({ preferences = [] }) {
  // Sort: user's preferred categories first, then general, then others
  const sortedTips = useMemo(() => {
    const preferred = ALL_TIPS.filter((t) => preferences.includes(t.category))
    const general   = ALL_TIPS.filter((t) => t.category === 'general')
    const others    = ALL_TIPS.filter(
      (t) => !preferences.includes(t.category) && t.category !== 'general'
    )
    return [...preferred, ...general, ...others]
  }, [preferences])

  const [tipIndex, setTipIndex] = useState(0)

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % sortedTips.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [sortedTips.length])

  const tip = sortedTips[tipIndex]

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, type: 'tween', ease: [0, 0, 0.2, 1] }}
        >
          <Card variant="glass" padding="md" aria-label="Travel tip">
            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              {/* Emoji icon container */}
              <div
                aria-hidden="true"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--color-indigo-dim)',
                  border: '1px solid rgba(98,119,204,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {tip.emoji}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-family-body)',
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 600,
                    color: 'var(--color-indigo-400)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wide)',
                    margin: '0 0 0.25rem 0',
                  }}
                >
                  Travel Tip
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-family-body)',
                    fontSize: 'var(--font-size-body-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--line-height-body)',
                    margin: 0,
                  }}
                >
                  {tip.text}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.35rem',
          marginTop: '0.625rem',
        }}
        aria-hidden="true"
      >
        {sortedTips.slice(0, DOT_COUNT).map((_, i) => {
          const isActive = tipIndex === i || (i === DOT_COUNT - 1 && tipIndex >= DOT_COUNT)
          return (
            <button
              key={i}
              onClick={() => setTipIndex(i)}
              aria-label={`Show tip ${i + 1}`}
              aria-pressed={tipIndex === i}
              style={{
                width: isActive ? 16 : 6,
                height: 6,
                borderRadius: 3,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width var(--transition-base), background var(--transition-base)',
                background: isActive
                  ? 'var(--color-indigo-400)'
                  : 'rgba(255,255,255,0.12)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
