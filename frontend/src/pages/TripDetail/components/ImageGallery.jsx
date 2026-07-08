import React from 'react'
import { motion } from 'framer-motion'

export default function ImageGallery({ trip }) {
  const dest = (trip.destination || '').toLowerCase()

  // Generate 3 unique but consistent scenery images for the destination
  const getSceneryImages = () => {
    const seed = encodeURIComponent(dest)
    return [
      `https://picsum.photos/seed/${seed}-1/600/400`,
      `https://picsum.photos/seed/${seed}-2/400/400`,
      `https://picsum.photos/seed/${seed}-3/400/400`,
    ]
  }

  const images = getSceneryImages()

  return (
    <div
      style={{
        marginTop: '2rem',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1rem' }} className="text-text-primary">
        Destination Gallery
      </h3>

      {/* Grid gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', height: '240px' }}>
        {/* Large featured photo */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '100%' }}>
          <motion.img
            src={images[0]}
            alt={`Featured photo of ${trip.destination}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            whileHover={{ scale: 1.03 }}
            transition={{ ease: 'easeOut', duration: 0.25 }}
          />
        </div>

        {/* Right column with two smaller photos stacked */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '0.75rem', height: '100%' }}>
          <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '100%' }}>
            <motion.img
              src={images[1]}
              alt={`Photo of ${trip.destination}`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              whileHover={{ scale: 1.03 }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>
          <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '100%' }}>
            <motion.img
              src={images[2]}
              alt={`Photo of ${trip.destination}`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              whileHover={{ scale: 1.03 }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
