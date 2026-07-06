// BackgroundPhotography.jsx
// Aurora Design System — Generation screen ambient background
// Reuses carouselSlides (landing) + carouselSlideTransition (variants.js).
// Sits at z-index 0, position: absolute within GenerationLayout's clipping container.
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { carouselSlides } from '@/components/landing/data/carousel'
import { carouselSlideTransition } from '@/components/landing/animations/variants'

export default function BackgroundPhotography({ destination }) {
  // Attempt to match the destination to an existing slide
  const firstWord = (destination || '').split(/[,\s]/)[0].toLowerCase()
  const matchIndex = carouselSlides.findIndex(
    (s) =>
      s.destination.toLowerCase().includes(firstWord) ||
      s.region.toLowerCase().includes(firstWord)
  )
  const startIndex = matchIndex >= 0 ? matchIndex : 0

  const [activeIndex, setActiveIndex] = useState(startIndex)

  // Only cycle slides when no destination match is found
  useEffect(() => {
    if (matchIndex >= 0) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carouselSlides.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [matchIndex])

  const slide = carouselSlides[activeIndex]

  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={carouselSlideTransition}
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Ken Burns */}
          <motion.img
            src={slide.imageUrl}
            alt=""
            initial={{ scale: 1.07 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: 'linear', type: 'tween' }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(3px) brightness(0.35) saturate(0.8)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Multi-stop gradient overlay for deep contrast + Aurora colour tint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: [
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(61,82,160,0.18) 0%, transparent 70%)',
            'linear-gradient(180deg, rgba(14,17,23,0.65) 0%, rgba(14,17,23,0.80) 40%, rgba(14,17,23,0.96) 100%)',
          ].join(', '),
        }}
      />
    </div>
  )
}
