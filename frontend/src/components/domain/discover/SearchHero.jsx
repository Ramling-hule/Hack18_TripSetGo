import { motion } from 'framer-motion'

export default function SearchHero({
  title = 'Discover Trips',
  subtitle = 'Browse, like, and clone trips from the community',
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'relative',
        borderRadius: 24,
        background: 'var(--background-image-gradient-hero)',
        border: '1px solid var(--color-border-subtle)',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        width: '100%'
      }}
    >
      {/* Decorative ambient glowing orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-20%',
          width: '60%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(98, 119, 204, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-50%',
          right: '-20%',
          width: '60%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(45, 181, 142, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
        <h2
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '2.25rem',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text-primary)',
            margin: 0,
            marginBottom: '0.5rem',
          }}
        >
          {title.split(' ')[0]}{' '}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            {title.split(' ').slice(1).join(' ')}
          </span>
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            margin: 0,
            marginBottom: '1.5rem',
          }}
        >
          {subtitle}
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </motion.div>
  )
}
