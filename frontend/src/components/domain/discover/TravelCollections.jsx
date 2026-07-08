import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { getDestinationImage } from '@/utils/imageUtils'

export default function TravelCollections({
  onSelectCollection,
}) {
  const collections = [
    { title: 'Tropical Escapes', tag: 'beach', imageDest: 'Goa' },
    { title: 'Urban Wonders', tag: 'city', imageDest: 'Mumbai' },
    { title: 'Adventure Trails', tag: 'adventure', imageDest: 'Manali' },
    { title: 'Cultural Heritage', tag: 'history', imageDest: 'Jaipur' },
  ]

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--color-indigo-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-indigo-400)'
        }}>
          <Compass size={14} />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          Travel Collections
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
        className="grid-cols-2 md:grid-cols-4"
      >
        {collections.map((coll, idx) => {
          const coverImg = getDestinationImage(coll.imageDest)
          return (
            <motion.button
              key={idx}
              onClick={() => onSelectCollection(coll.tag)}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/10',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-surface-raised)',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                outline: 'none',
              }}
              className="group focus-visible:ring-2 focus-visible:ring-indigo-500"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={coverImg}
                alt={coll.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                className="transition-transform duration-500 group-hover:scale-105"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(14, 17, 23, 0.9) 0%, rgba(14, 17, 23, 0.2) 65%, transparent 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1rem',
                  zIndex: 2,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  {coll.title}
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    marginTop: '0.125rem',
                  }}
                >
                  Explore #{coll.tag}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
