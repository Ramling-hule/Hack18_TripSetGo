import { motion } from 'framer-motion'

export default function ProgressIndicator({ stageIndex }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Premium ambient glow line to replace standard progress bar */}
      <div
        role="status"
        aria-label="Intelligent assistant is actively compiling your trip details"
        style={{
          width: '100%',
          height: 3,
          borderRadius: 99,
          background: 'rgba(255, 255, 255, 0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut',
            type: 'tween',
          }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '40%',
            background: 'linear-gradient(90deg, transparent, var(--color-indigo-400), transparent)',
            boxShadow: '0 0 8px var(--color-indigo-500)',
          }}
        />
      </div>
    </div>
  )
}
