import { motion } from 'framer-motion'
import DestinationCard from './DestinationCard'

export default function DestinationGrid({
  trips = [],
  onLike,
  onSave,
  onClone,
  isAuthenticated = true,
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      role="list"
      aria-label="Community itineraries feed"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: '1.5rem',
      }}
      className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    >
      {trips.map((trip, idx) => {
        // Let's make every 5th card or exceptionally popular cards a featured widescreen element spanning columns
        const isFeaturedColumn = idx > 0 && idx % 4 === 0
        const spanClass = isFeaturedColumn ? 'lg:col-span-2' : ''
        const aspect = isFeaturedColumn ? '21/9' : '3/2'

        return (
          <motion.div
            key={trip._id}
            variants={item}
            className={spanClass}
            style={{ width: '100%' }}
          >
            <DestinationCard
              trip={trip}
              onLike={onLike}
              onSave={onSave}
              onClone={onClone}
              isAuthenticated={isAuthenticated}
              aspectRatio={aspect}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}
