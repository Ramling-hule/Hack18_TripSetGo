// src/components/landing/DestinationGrid.jsx
// Displays a responsive grid of destinations.
// Large screens: 4-column grid.
// Mobile: Horizontal snap scroll with overflow-x auto.
// Animates cards using Framer Motion stagger.
import { motion } from 'framer-motion'
import { featuredDestinations } from './data/destinations'
import DestinationCard from './DestinationCard'
import { staggerContainer, staggerItem } from './animations/variants'

export default function DestinationGrid() {
  return (
    <section
      style={{
        paddingTop: 'var(--spacing-20)',
        paddingBottom: 'var(--spacing-20)',
        backgroundColor: 'var(--color-surface-base)',
      }}
    >
      <div className="container-landing flex flex-col gap-8">
        {/* Title Block */}
        <div className="flex flex-col gap-2">
          <span className="text-section-label">Popular Escapes</span>
          <h2
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-h1)',
              fontWeight: 800,
              lineHeight: 'var(--line-height-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Trending Destinations
          </h2>
        </div>

        {/* Grid / Horizontal scroll */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10%' }}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-none lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:pb-0"
        >
          {featuredDestinations.map((dest, idx) => (
            <motion.div
              key={dest.title + idx}
              variants={staggerItem}
              className="min-w-[280px] w-[80%] snap-center shrink-0 lg:min-w-0 lg:w-auto"
            >
              <DestinationCard
                imageUrl={dest.imageUrl}
                title={dest.title}
                subtitle={dest.subtitle}
                badgeLabel={dest.badgeLabel}
                badgeVariant={dest.badgeVariant}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
