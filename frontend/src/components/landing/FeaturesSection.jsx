// src/components/landing/FeaturesSection.jsx
// Editorial two-column features layout.
// Left: Bold section heading and introductory paragraph.
// Right: Scroll-animated list of features utilizing the stagger animation.
import { motion } from 'framer-motion'
import Card from '@/components/common/Card'
import { productFeatures } from './data/features'
import * as LucideIcons from 'lucide-react'
import { staggerContainer, staggerItem } from './animations/variants'

export default function FeaturesSection() {
  return (
    <section
      style={{
        paddingTop: 'var(--spacing-20)',
        paddingBottom: 'var(--spacing-20)',
        backgroundColor: 'var(--color-surface-base)',
      }}
    >
      <div className="container-landing grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Heading */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <span className="text-section-label">Intelligent Companion</span>
          <h2
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              lineHeight: 'var(--line-height-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Travel smarter.
            <br />
            No effort required.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-body)',
              lineHeight: 'var(--line-height-body)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              maxWidth: 420,
            }}
          >
            TripSetGo quietely operates in the background, utilizing advanced AI and real-time collaboration so you can focus on the journey, not the logistics.
          </p>
        </div>

        {/* Right Column: Features List */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10%' }}
          className="lg:col-span-7 flex flex-col gap-6"
        >
          {productFeatures.map((feat) => (
            <motion.div key={feat.number} variants={staggerItem}>
              <Card
                variant="interactive"
                padding="lg"
                className="flex gap-5 items-start"
              >
                {/* Accent number & Icon */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span
                    style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: 'var(--font-size-body-sm)',
                      fontWeight: 800,
                      color: 'var(--color-indigo-400)',
                      letterSpacing: 'var(--tracking-wide)',
                    }}
                  >
                    {feat.number}
                  </span>
                  <div
                    style={{
                      padding: 'var(--spacing-2)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-indigo-dim)',
                      border: '1px solid rgba(98, 119, 204, 0.15)',
                      color: 'var(--color-indigo-400)',
                    }}
                    className="flex items-center justify-center"
                  >
                    {(() => {
                      const IconComponent = LucideIcons[feat.iconName] || LucideIcons.Sparkles
                      return <IconComponent size={24} />
                    })()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <h3
                    style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: 'var(--font-size-h3)',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-family-body)',
                      fontSize: 'var(--font-size-body-sm)',
                      lineHeight: 'var(--line-height-body)',
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                    }}
                  >
                    {feat.body}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
