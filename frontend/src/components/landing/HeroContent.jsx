// src/components/landing/HeroContent.jsx
// Headline, sub-headline, and CTA buttons — absolutely positioned inside the carousel.
// Entrance animation runs once on mount (not tied to slide changes).
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'
import Button from '@/components/common/Button'
import { staggerContainer, staggerItem } from './animations/variants'

export default function HeroContent() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{
        position: 'absolute',
        bottom: 'var(--spacing-20)',
        left: 'var(--spacing-16)',
        right: 'var(--spacing-16)',
        zIndex: 20,
        maxWidth: 580,
      }}
      className="bottom-24 left-4 right-4 md:bottom-[var(--spacing-20)] md:left-[var(--spacing-16)] md:right-auto"
    >
      <motion.p
        variants={staggerItem}
        className="text-section-label"
        style={{
          color: 'rgba(255, 255, 255, 0.55)',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        AI-powered travel planning
      </motion.p>

      <motion.h1
        variants={staggerItem}
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'white',
          margin: 0,
          marginBottom: 'var(--spacing-4)',
        }}
      >
        Your next adventure,
        <br />
        planned in seconds.
      </motion.h1>

      <motion.p
        variants={staggerItem}
        style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--font-size-body)',
          lineHeight: 'var(--line-height-body)',
          color: 'rgba(255, 255, 255, 0.72)',
          margin: 0,
          marginBottom: 'var(--spacing-6)',
          maxWidth: 460,
        }}
      >
        Describe your trip. Get a complete itinerary with live budgets,
        interactive maps, and group expense splitting — powered by Gemini AI.
      </motion.p>

      <motion.div
        variants={staggerItem}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}
      >
        <Link to="/auth/signup" className="no-underline">
          <Button
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={18} />}
          >
            Start Planning Free
          </Button>
        </Link>

        <Link to="/discover" className="no-underline">
          <Button
            variant="ghost"
            size="lg"
            icon={<Compass size={18} />}
            style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)' }}
          >
            Explore Trips
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  )
}
