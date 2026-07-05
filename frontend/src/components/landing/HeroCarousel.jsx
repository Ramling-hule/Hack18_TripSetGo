// src/components/landing/HeroCarousel.jsx
// Full-viewport hero carousel with crossfade and Ken Burns effect.
// Automatically rotates slides every 6000ms.
// Keyboard navigable, pause/play support, reduced motion support.
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import { carouselSlides } from './data/carousel'
import HeroContent from './HeroContent'
import DestinationLabel from './DestinationLabel'

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const timerRef = useRef(null)

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % carouselSlides.length)
  }

  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  useEffect(() => {
    if (isPaused || shouldReduceMotion) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(handleNext, 6000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, shouldReduceMotion])

  const activeSlide = carouselSlides[activeIndex]

  return (
    <section
      role="region"
      aria-label="Destination photography carousel"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--color-surface-base)',
        overflow: 'hidden',
      }}
    >
      {/* Slides */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AnimatePresence mode="sync">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0, 0, 0.2, 1], type: 'tween' }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <motion.img
              src={activeSlide.imageUrl}
              alt={activeSlide.alt}
              animate={shouldReduceMotion ? { scale: 1 } : { scale: 1.04 }}
              transition={{ duration: 6, ease: 'linear', type: 'tween' }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              loading={activeIndex === 0 ? 'eager' : 'lazy'}
              fetchpriority={activeIndex === 0 ? 'high' : 'auto'}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scrim Overlay */}
      <div
        className="scrim-bottom"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Hero Content Overlay */}
      <HeroContent />

      {/* Destination Label Overlay */}
      <DestinationLabel
        destination={activeSlide.destination}
        region={activeSlide.region}
      />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePause}
        aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
        style={{
          position: 'absolute',
          bottom: 'var(--spacing-8)',
          right: 'var(--spacing-10)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(0, 0, 0, 0.4)',
          color: 'white',
          cursor: 'pointer',
          outline: 'none',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
        className="hover:bg-[rgba(0,0,0,0.6)] hover:border-[rgba(255,255,255,0.4)]"
      >
        {isPaused ? <Play size={16} /> : <Pause size={16} />}
      </button>
    </section>
  )
}
